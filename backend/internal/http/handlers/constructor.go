package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"sort"
	"strings"

	"chemlab-tj/backend/internal/http/middleware"
	"chemlab-tj/backend/internal/models"
	"chemlab-tj/backend/internal/repositories"
)

type ConstructorHandler struct {
	store *repositories.Store
}

func NewConstructorHandler(store *repositories.Store) *ConstructorHandler {
	return &ConstructorHandler{store: store}
}

func (h *ConstructorHandler) Elements(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"elements": constructorElements()})
}

func (h *ConstructorHandler) Ions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ions": h.loadConstructorIons(r.Context())})
}

func (h *ConstructorHandler) Evaluate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var req models.ConstructorEvaluateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	mode := strings.TrimSpace(req.Mode)
	if mode == "" {
		mode = "elements"
	}
	var result map[string]any
	switch mode {
	case "elements":
		result = evaluateElementConstructor(req, h.loadElementRules(r.Context()))
	case "ions":
		result = evaluateIonConstructor(req, h.loadConstructorIons(r.Context()), h.loadSolubility(r.Context()))
	default:
		result = noReaction("Неизвестный режим конструктора.")
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *ConstructorHandler) Validate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var req models.ConstructorValidateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	reaction, err := h.store.FindConfirmedReaction(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to validate reaction")
		return
	}
	if reaction == nil {
		writeJSON(w, http.StatusOK, map[string]any{
			"ok":      false,
			"status":  "not_confirmed",
			"message": "Для этой пары веществ в базе нет подтверждённой реакции.",
		})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":       true,
		"status":   "confirmed",
		"reaction": reaction,
		"message":  "Реакция найдена в подтверждённой базе. Можно сохранить продукт.",
	})
}

func (h *ConstructorHandler) SaveProduct(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var req models.ConstructorSaveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	req.ReactionID = strings.TrimSpace(req.ReactionID)
	req.ProductID = strings.TrimSpace(req.ProductID)
	req.Formula = strings.TrimSpace(req.Formula)

	var product map[string]any
	var err error
	if req.Formula != "" {
		product, err = h.store.SaveConstructorProduct(r.Context(), userID, req)
	} else {
		if req.ReactionID == "" || req.ProductID == "" {
			writeError(w, http.StatusBadRequest, "formula or reaction_id/product_id are required")
			return
		}
		product, err = h.store.SaveSynthesizedProduct(r.Context(), userID, req.ReactionID, req.ProductID)
	}
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	status := http.StatusCreated
	if exists, _ := product["already_exists"].(bool); exists {
		status = http.StatusOK
	}
	writeJSON(w, status, map[string]any{"product": product})
}

func (h *ConstructorHandler) MyProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	products, err := h.store.UserSubstances(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load user products")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"products": products})
}

func (h *ConstructorHandler) loadConstructorIons(ctx context.Context) []constructorIon {
	rows, err := h.store.DB().QueryContext(ctx, `
		SELECT id, symbol, name_ru, charge, type, formula_part, COALESCE(color, ''), common, COALESCE(description_ru, '')
		FROM constructor_ions
		ORDER BY type DESC, charge, symbol
	`)
	if err != nil {
		return constructorIons()
	}
	defer rows.Close()
	out := []constructorIon{}
	for rows.Next() {
		var ion constructorIon
		if rows.Scan(&ion.ID, &ion.Symbol, &ion.NameRu, &ion.Charge, &ion.Type, &ion.FormulaPart, &ion.Color, &ion.Common, &ion.DescriptionRu) == nil {
			out = append(out, ion)
		}
	}
	if len(out) == 0 {
		return constructorIons()
	}
	return out
}

func (h *ConstructorHandler) loadElementRules(ctx context.Context) []elementRule {
	rows, err := h.store.DB().QueryContext(ctx, `
		SELECT id, reactant_a, reactant_b, equation, product_formula, product_name_ru, product_type,
		       product_state, visual_json, conditions_json, COALESCE(explanation_ru, ''), COALESCE(safety_ru, '')
		FROM constructor_element_rules
		WHERE enabled = true
	`)
	if err != nil {
		return elementRules()
	}
	defer rows.Close()
	out := []elementRule{}
	for rows.Next() {
		var rule elementRule
		var visualRaw, conditionsRaw json.RawMessage
		if rows.Scan(&rule.ID, &rule.A, &rule.B, &rule.Equation, &rule.ProductFormula, &rule.ProductNameRu, &rule.ProductType, &rule.ProductState, &visualRaw, &conditionsRaw, &rule.ExplanationRu, &rule.SafetyRu) != nil {
			continue
		}
		rule.VisualState = "crystal"
		rule.Color = "#f8fafc"
		rule.ObservationRu = "Образуется " + rule.ProductNameRu + "."
		rule.Visual = map[string]any{"initialColor": "#dbeafe", "finalColor": "#f8fafc"}
		_ = json.Unmarshal(visualRaw, &rule.Visual)
		var conditions map[string]any
		_ = json.Unmarshal(conditionsRaw, &conditions)
		rule.NeedHeating = boolFromMap(conditions, "requires_heating")
		rule.Dangerous = boolFromMap(conditions, "dangerous")
		out = append(out, rule)
	}
	if len(out) == 0 {
		return elementRules()
	}
	return out
}

func (h *ConstructorHandler) loadSolubility(ctx context.Context) map[string]solubilityRule {
	rows, err := h.store.DB().QueryContext(ctx, `
		SELECT compound_formula, COALESCE(kind, 'unknown'), COALESCE(precipitate_color, ''), COALESCE(note_ru, '')
		FROM solubility_rules
	`)
	if err != nil {
		return solubility()
	}
	defer rows.Close()
	out := map[string]solubilityRule{}
	for rows.Next() {
		var formula string
		var rule solubilityRule
		if rows.Scan(&formula, &rule.Kind, &rule.Color, &rule.NoteRu) == nil {
			out[formula] = rule
		}
	}
	if len(out) == 0 {
		return solubility()
	}
	return out
}

type constructorIon struct {
	ID            string `json:"id"`
	Symbol        string `json:"symbol"`
	NameRu        string `json:"nameRu"`
	Charge        int    `json:"charge"`
	Type          string `json:"type"`
	FormulaPart   string `json:"formulaPart"`
	Color         string `json:"color"`
	Common        bool   `json:"common"`
	DescriptionRu string `json:"descriptionRu"`
}

type constructorElement struct {
	ID          string `json:"id"`
	Formula     string `json:"formula"`
	NameRu      string `json:"nameRu"`
	Type        string `json:"type"`
	State       string `json:"state"`
	Color       string `json:"color"`
	Description string `json:"descriptionRu"`
}

type elementRule struct {
	ID             string
	A              string
	B              string
	Equation       string
	ProductFormula string
	ProductNameRu  string
	ProductType    string
	ProductState   string
	VisualState    string
	Color          string
	ObservationRu  string
	ExplanationRu  string
	SafetyRu       string
	Visual         map[string]any
	Dangerous      bool
	NeedHeating    bool
}

func evaluateElementConstructor(req models.ConstructorEvaluateRequest, rules []elementRule) map[string]any {
	if len(req.Reactants) < 2 {
		return noReaction("Выберите два элемента или простых вещества.")
	}
	a, b := req.Reactants[0].ID, req.Reactants[1].ID
	rule := findElementRule(a, b, rules)
	if rule == nil {
		return noReaction("Для этой пары нет подтверждённого правила синтеза. Конструктор не придумывает реакции автоматически.")
	}
	if rule.NeedHeating && !req.Conditions.Heating && req.Conditions.Temperature < 80 {
		out := resultFromElementRule(*rule, req)
		out["status"] = "need_heating"
		out["canSaveProduct"] = false
		out["observationRu"] = "Для этого учебного синтеза нужен нагрев."
		return out
	}
	out := resultFromElementRule(*rule, req)
	if rule.Dangerous && maxConcentration(req.Reactants) == "high" {
		out["status"] = "dangerous"
		out["safetyRu"] = rule.SafetyRu + " Высокая концентрация усиливает предупреждение: опыт показан только как симуляция."
	}
	return out
}

func evaluateIonConstructor(req models.ConstructorEvaluateRequest, ions []constructorIon, solRules map[string]solubilityRule) map[string]any {
	if len(req.Reactants) < 2 {
		return noReaction("Выберите катион и анион.")
	}
	cations, anions := constructorIonMaps(ions)
	cation, okC := cations[req.Reactants[0].ID]
	anion, okA := anions[req.Reactants[1].ID]
	if !okC || !okA {
		cation, okC = cations[req.Reactants[1].ID]
		anion, okA = anions[req.Reactants[0].ID]
	}
	if !okC || !okA {
		return noReaction("Нужны один катион и один анион из подтверждённого справочника.")
	}
	formula, cCount, aCount := ionicFormula(cation, anion)
	equation := ionEquation(cation, anion, formula, cCount, aCount, solRules)
	sol := solRules[formula]
	status := "success"
	if sol.Kind == "" {
		status = "weak"
	}
	visual := map[string]any{
		"initialColor": "#dbeafe",
		"finalColor":   "#e0f2fe",
		"precipitate":  sol.Kind == "precipitate",
		"gas":          sol.Kind == "gas",
		"heat":         formula == "H2O",
		"smoke":        false,
		"flash":        false,
		"bubbles":      sol.Kind == "gas",
		"intensity":    concentrationIntensity(maxConcentration(req.Reactants)),
	}
	state := "aqueous"
	visualState := "solution"
	productType := "salt"
	observation := fmt.Sprintf("Образуется %s.", formula)
	if sol.Kind == "precipitate" {
		state = "solid"
		visualState = "precipitate"
		visual["finalColor"] = "#f8fafc"
		visual["precipitateColor"] = sol.Color
		observation = fmt.Sprintf("Появляется %s осадок %s.", precipitateColorRu(sol.Color), formula)
	} else if sol.Kind == "water" {
		productType = "water"
		state = "liquid"
		visualState = "liquid"
		observation = "Ионы H+ и OH- образуют воду; раствор остаётся прозрачным и слегка нагревается."
	} else if sol.Kind == "gas" {
		state = "gas"
		visualState = "gas"
		observation = fmt.Sprintf("Выделяется газ %s; видны пузырьки.", formula)
	} else if sol.Kind == "" {
		observation = "Данные о растворимости для этого соединения не найдены."
	}
	return map[string]any{
		"status":   status,
		"equation": equation,
		"balanced": true,
		"product": map[string]any{
			"formula":     formula,
			"nameRu":      productName(formula),
			"type":        productType,
			"state":       state,
			"visualState": visualState,
			"color":       productColor(formula, sol.Color),
			"ions":        map[string]string{"cation": cation.Symbol, "anion": anion.Symbol},
		},
		"visual":          visual,
		"observationRu":   observation,
		"explanationRu":   "Формула рассчитана по зарядам ионов через наименьшее общее кратное зарядов, а не простым склеиванием символов.",
		"safetyRu":        safetyForIons(cation, anion, maxConcentration(req.Reactants)),
		"simulationOnly":  true,
		"requiresHeating": false,
		"canSaveProduct":  sol.Kind != "",
	}
}

func noReaction(message string) map[string]any {
	return map[string]any{
		"status":          "no_reaction",
		"balanced":        false,
		"equation":        "",
		"product":         nil,
		"visual":          map[string]any{"initialColor": "#dbeafe", "finalColor": "#dbeafe", "precipitate": false, "gas": false, "heat": false, "smoke": false, "flash": false, "bubbles": false},
		"observationRu":   message,
		"explanationRu":   "Разрешены только подтверждённые учебные правила.",
		"safetyRu":        "Не выполняйте реальные опыты по симуляции.",
		"simulationOnly":  true,
		"requiresHeating": false,
		"canSaveProduct":  false,
	}
}

func resultFromElementRule(rule elementRule, req models.ConstructorEvaluateRequest) map[string]any {
	visual := copyMap(rule.Visual)
	visual["intensity"] = concentrationIntensity(maxConcentration(req.Reactants))
	status := "success"
	if maxConcentration(req.Reactants) == "low" {
		status = "weak"
	}
	return map[string]any{
		"status":   status,
		"equation": rule.Equation,
		"balanced": true,
		"product": map[string]any{
			"formula":     rule.ProductFormula,
			"nameRu":      rule.ProductNameRu,
			"type":        rule.ProductType,
			"state":       rule.ProductState,
			"visualState": rule.VisualState,
			"color":       rule.Color,
			"ions":        map[string]string{},
		},
		"visual":          visual,
		"observationRu":   rule.ObservationRu,
		"explanationRu":   rule.ExplanationRu,
		"safetyRu":        rule.SafetyRu,
		"simulationOnly":  true,
		"requiresHeating": rule.NeedHeating,
		"canSaveProduct":  true,
	}
}

func constructorElements() []constructorElement {
	return []constructorElement{
		{"h2", "H2", "Водород", "simple_substance", "gas", "#dbeafe", "Двухатомный газ."},
		{"o2", "O2", "Кислород", "simple_substance", "gas", "#bfdbfe", "Двухатомный газ-окислитель."},
		{"cl2", "Cl2", "Хлор", "simple_substance", "gas", "#bbf7d0", "Двухатомный газ; виртуальная демонстрация."},
		{"n2", "N2", "Азот", "simple_substance", "gas", "#e0e7ff", "Двухатомный газ."},
		{"na", "Na", "Натрий", "element", "solid", "#d1d5db", "Активный металл; только симуляция."},
		{"k", "K", "Калий", "element", "solid", "#cbd5e1", "Очень активный металл; только симуляция."},
		{"mg", "Mg", "Магний", "element", "solid", "#e5e7eb", "Металл."},
		{"al", "Al", "Алюминий", "element", "solid", "#e2e8f0", "Металл."},
		{"fe", "Fe", "Железо", "element", "solid", "#94a3b8", "Металл."},
		{"cu", "Cu", "Медь", "element", "solid", "#d97706", "Металл."},
		{"c", "C", "Углерод", "element", "solid", "#334155", "Неметалл."},
		{"s", "S", "Сера", "element", "solid", "#fde047", "Неметалл."},
	}
}

func constructorIons() []constructorIon {
	return []constructorIon{
		{"h_plus", "H+", "Ион водорода", 1, "cation", "H", "#fecaca", true, "Катион кислой среды."},
		{"na_plus", "Na+", "Ион натрия", 1, "cation", "Na", "#e5e7eb", true, "Однозарядный катион."},
		{"k_plus", "K+", "Ион калия", 1, "cation", "K", "#e5e7eb", true, "Однозарядный катион."},
		{"ag_plus", "Ag+", "Ион серебра", 1, "cation", "Ag", "#f8fafc", true, "Образует осадки с галогенидами."},
		{"ca_2plus", "Ca2+", "Ион кальция", 2, "cation", "Ca", "#f1f5f9", true, "Двухзарядный катион."},
		{"ba_2plus", "Ba2+", "Ион бария", 2, "cation", "Ba", "#f8fafc", true, "Соли бария токсичны; только симуляция."},
		{"cu_2plus", "Cu2+", "Ион меди(II)", 2, "cation", "Cu", "#60a5fa", true, "Даёт голубые осадки гидроксидов."},
		{"fe_2plus", "Fe2+", "Ион железа(II)", 2, "cation", "Fe", "#86efac", true, "Даёт зеленоватые осадки."},
		{"fe_3plus", "Fe3+", "Ион железа(III)", 3, "cation", "Fe", "#f59e0b", true, "Даёт бурые осадки."},
		{"al_3plus", "Al3+", "Ион алюминия", 3, "cation", "Al", "#e2e8f0", true, "Трёхзарядный катион."},
		{"cl_minus", "Cl-", "Хлорид-ион", -1, "anion", "Cl", "#e0f2fe", true, "Однозарядный анион."},
		{"oh_minus", "OH-", "Гидроксид-ион", -1, "anion", "OH", "#dbeafe", true, "Анион щелочной среды."},
		{"no3_minus", "NO3-", "Нитрат-ион", -1, "anion", "NO3", "#e0f2fe", true, "Обычно растворимые соли."},
		{"so4_2minus", "SO4^2-", "Сульфат-ион", -2, "anion", "SO4", "#e0f2fe", true, "Двухзарядный анион."},
		{"co3_2minus", "CO3^2-", "Карбонат-ион", -2, "anion", "CO3", "#e0f2fe", true, "Даёт осадки и CO2 с кислотами."},
		{"po4_3minus", "PO4^3-", "Фосфат-ион", -3, "anion", "PO4", "#e0f2fe", true, "Трёхзарядный анион."},
		{"s_2minus", "S^2-", "Сульфид-ион", -2, "anion", "S", "#e0f2fe", true, "Многие сульфиды малорастворимы."},
	}
}

func constructorIonMaps(ions []constructorIon) (map[string]constructorIon, map[string]constructorIon) {
	cations := map[string]constructorIon{}
	anions := map[string]constructorIon{}
	for _, ion := range ions {
		if ion.Type == "cation" {
			cations[ion.ID] = ion
		} else {
			anions[ion.ID] = ion
		}
	}
	return cations, anions
}

func findElementRule(a, b string, ruleList []elementRule) *elementRule {
	key := func(x, y string) string {
		ids := []string{strings.ToLower(x), strings.ToLower(y)}
		sort.Strings(ids)
		return ids[0] + "+" + ids[1]
	}
	rules := map[string]elementRule{}
	for _, r := range ruleList {
		rules[key(r.A, r.B)] = r
	}
	if r, ok := rules[key(a, b)]; ok {
		return &r
	}
	return nil
}

func elementRules() []elementRule {
	return []elementRule{
		{"na_cl2", "na", "cl2", "2Na + Cl2 -> 2NaCl", "NaCl", "Хлорид натрия", "salt", "solid", "crystal", "#f8fafc", "Образуется белое кристаллическое вещество — хлорид натрия.", "Натрий отдаёт электрон, хлор принимает электрон. Образуется ионное соединение NaCl.", "В реальности реакция натрия с хлором опасна. Здесь показана только учебная симуляция.", map[string]any{"initialColor": "#dbeafe", "finalColor": "#f8fafc", "precipitate": false, "gas": false, "heat": true, "smoke": true, "flash": true, "bubbles": false}, true, false},
		{"h2_o2", "h2", "o2", "2H2 + O2 -> 2H2O", "H2O", "Вода", "water", "liquid", "liquid", "#dbeafe", "После вспышки образуется вода.", "Водород окисляется кислородом с образованием воды.", "Смесь водорода и кислорода взрывоопасна; это только симуляция.", map[string]any{"initialColor": "#dbeafe", "finalColor": "#bfdbfe", "precipitate": false, "gas": false, "heat": true, "smoke": true, "flash": true, "bubbles": false}, true, true},
		{"al_cl2", "al", "cl2", "2Al + 3Cl2 -> 2AlCl3", "AlCl3", "Хлорид алюминия", "salt", "solid", "crystal", "#f1f5f9", "Образуются светлые кристаллы хлорида алюминия.", "Алюминий образует ион Al3+, хлорид-ионы компенсируют заряд: AlCl3.", "Реакция с хлором опасна; только виртуальная демонстрация.", map[string]any{"initialColor": "#dbeafe", "finalColor": "#f1f5f9", "precipitate": false, "gas": false, "heat": true, "smoke": true, "flash": true, "bubbles": false}, true, false},
		{"mg_o2", "mg", "o2", "2Mg + O2 -> 2MgO", "MgO", "Оксид магния", "oxide", "solid", "powder", "#f8fafc", "Магний ярко вспыхивает, образуется белый оксид магния.", "Магний реагирует с кислородом, образуя оксид MgO.", "Яркое горение магния опасно для глаз; только симуляция.", map[string]any{"initialColor": "#dbeafe", "finalColor": "#f8fafc", "precipitate": false, "gas": false, "heat": true, "smoke": true, "flash": true, "bubbles": false}, true, true},
		{"fe_s", "fe", "s", "Fe + S -> FeS", "FeS", "Сульфид железа(II)", "salt", "solid", "powder", "#1f2937", "При нагревании образуется тёмный сульфид железа.", "Железо и сера соединяются в FeS при нагревании.", "Нагрев веществ в реальности требует вытяжки и защиты; здесь симуляция.", map[string]any{"initialColor": "#dbeafe", "finalColor": "#334155", "precipitate": false, "gas": false, "heat": true, "smoke": true, "flash": false, "bubbles": false}, false, true},
		{"c_o2", "c", "o2", "C + O2 -> CO2", "CO2", "Углекислый газ", "gas", "gas", "gas", "#e0f2fe", "Углерод сгорает, выделяется углекислый газ.", "Углерод окисляется кислородом до CO2.", "Горение выполняется только в виртуальной симуляции.", map[string]any{"initialColor": "#dbeafe", "finalColor": "#e0f2fe", "precipitate": false, "gas": true, "heat": true, "smoke": true, "flash": false, "bubbles": true}, false, true},
	}
}

type solubilityRule struct {
	Kind   string
	Color  string
	NoteRu string
}

func solubility() map[string]solubilityRule {
	return map[string]solubilityRule{
		"NaCl":    {"soluble", "", "Хлорид натрия растворим."},
		"KNO3":    {"soluble", "", "Нитрат калия растворим."},
		"AgCl":    {"precipitate", "white", "Белый осадок AgCl."},
		"BaSO4":   {"precipitate", "white", "Белый осадок BaSO4."},
		"CaCO3":   {"precipitate", "white", "Белый осадок CaCO3."},
		"Cu(OH)2": {"precipitate", "blue", "Голубой осадок Cu(OH)2."},
		"Fe(OH)2": {"precipitate", "green", "Зеленоватый осадок Fe(OH)2."},
		"Fe(OH)3": {"precipitate", "brown", "Бурый осадок Fe(OH)3."},
		"Al(OH)3": {"precipitate", "white", "Белый студенистый осадок Al(OH)3."},
		"H2O":     {"water", "", "Нейтрализация."},
		"CO2":     {"gas", "", "Кислота с карбонатом даёт CO2."},
	}
}

func ionicFormula(cation, anion constructorIon) (string, int, int) {
	c := int(math.Abs(float64(cation.Charge)))
	a := int(math.Abs(float64(anion.Charge)))
	l := lcm(c, a)
	cCount := l / c
	aCount := l / a
	if cation.ID == "h_plus" && anion.ID == "oh_minus" {
		return "H2O", 1, 1
	}
	if cation.ID == "h_plus" && anion.ID == "co3_2minus" {
		return "CO2", 2, 1
	}
	return formulaPart(cation.FormulaPart, cCount, false) + formulaPart(anion.FormulaPart, aCount, true), cCount, aCount
}

func formulaPart(part string, count int, allowParen bool) string {
	if count <= 1 {
		return part
	}
	if allowParen && isPolyatomic(part) {
		return "(" + part + ")" + subscript(count)
	}
	return part + subscript(count)
}

func isPolyatomic(part string) bool {
	return part == "OH" || part == "NO3" || part == "SO4" || part == "CO3" || part == "PO4"
}

func ionEquation(cation, anion constructorIon, formula string, cCount, aCount int, solRules map[string]solubilityRule) string {
	leftC := coefficient(cCount) + cation.Symbol
	leftA := coefficient(aCount) + anion.Symbol
	if formula == "H2O" {
		return "H+ + OH- -> H2O"
	}
	if formula == "CO2" {
		return "2H+ + CO3^2- -> CO2↑ + H2O"
	}
	suffix := ""
	if solRules[formula].Kind == "precipitate" {
		suffix = "↓"
	}
	return leftC + " + " + leftA + " -> " + formula + suffix
}

func coefficient(n int) string {
	if n <= 1 {
		return ""
	}
	return fmt.Sprintf("%d", n)
}

func lcm(a, b int) int {
	return a / gcd(a, b) * b
}

func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	if a < 0 {
		return -a
	}
	return a
}

func subscript(n int) string {
	return map[int]string{2: "2", 3: "3", 4: "4"}[n]
}

func maxConcentration(reactants []models.ConstructorEvaluateReactant) string {
	priority := map[string]int{"low": 1, "normal": 2, "high": 3}
	out := "normal"
	for _, r := range reactants {
		if priority[r.Concentration] > priority[out] {
			out = r.Concentration
		}
	}
	return out
}

func concentrationIntensity(c string) string {
	switch c {
	case "low":
		return "weak"
	case "high":
		return "strong"
	default:
		return "normal"
	}
}

func productName(formula string) string {
	names := map[string]string{
		"NaCl": "Хлорид натрия", "KNO3": "Нитрат калия", "AgCl": "Хлорид серебра",
		"BaSO4": "Сульфат бария", "CaCO3": "Карбонат кальция", "H2O": "Вода",
		"Cu(OH)2": "Гидроксид меди(II)", "Fe(OH)2": "Гидроксид железа(II)",
		"Fe(OH)3": "Гидроксид железа(III)", "Al(OH)3": "Гидроксид алюминия",
		"Al2(SO4)3": "Сульфат алюминия", "Ca3(PO4)2": "Фосфат кальция",
		"CaCl2": "Хлорид кальция", "AlCl3": "Хлорид алюминия", "CO2": "Углекислый газ",
	}
	if name := names[formula]; name != "" {
		return name
	}
	return formula
}

func productColor(formula, precipitate string) string {
	if precipitate != "" {
		return map[string]string{"white": "#f8fafc", "blue": "#60a5fa", "green": "#86efac", "brown": "#92400e"}[precipitate]
	}
	if formula == "H2O" {
		return "#dbeafe"
	}
	return "#e0f2fe"
}

func precipitateColorRu(color string) string {
	return map[string]string{"white": "белый", "blue": "голубой", "green": "зеленоватый", "brown": "бурый"}[color]
}

func safetyForIons(cation, anion constructorIon, concentration string) string {
	base := "Учебная симуляция: не используйте реальные растворы без преподавателя."
	if cation.ID == "ba_2plus" || cation.ID == "ag_plus" || cation.ID == "cu_2plus" {
		base += " Некоторые выбранные ионы токсичны или загрязняют кожу."
	}
	if concentration == "high" {
		base += " Высокая концентрация усиливает риск и визуальное предупреждение."
	}
	return base
}

func copyMap(in map[string]any) map[string]any {
	out := map[string]any{}
	for k, v := range in {
		out[k] = v
	}
	return out
}

func boolFromMap(values map[string]any, key string) bool {
	if values == nil {
		return false
	}
	switch v := values[key].(type) {
	case bool:
		return v
	case string:
		return strings.EqualFold(v, "true") || strings.EqualFold(v, "yes")
	default:
		return false
	}
}
