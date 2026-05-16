(function () {
  "use strict";

  const fallbackElements = [
    { id: "h2", formula: "H2", nameRu: "Водород", type: "simple_substance", state: "gas", color: "#dbeafe" },
    { id: "o2", formula: "O2", nameRu: "Кислород", type: "simple_substance", state: "gas", color: "#bfdbfe" },
    { id: "cl2", formula: "Cl2", nameRu: "Хлор", type: "simple_substance", state: "gas", color: "#bbf7d0" },
    { id: "n2", formula: "N2", nameRu: "Азот", type: "simple_substance", state: "gas", color: "#e0e7ff" },
    { id: "na", formula: "Na", nameRu: "Натрий", type: "element", state: "solid", color: "#d1d5db" },
    { id: "k", formula: "K", nameRu: "Калий", type: "element", state: "solid", color: "#cbd5e1" },
    { id: "mg", formula: "Mg", nameRu: "Магний", type: "element", state: "solid", color: "#e5e7eb" },
    { id: "al", formula: "Al", nameRu: "Алюминий", type: "element", state: "solid", color: "#e2e8f0" },
    { id: "fe", formula: "Fe", nameRu: "Железо", type: "element", state: "solid", color: "#94a3b8" },
    { id: "cu", formula: "Cu", nameRu: "Медь", type: "element", state: "solid", color: "#d97706" },
    { id: "c", formula: "C", nameRu: "Углерод", type: "element", state: "solid", color: "#334155" },
    { id: "s", formula: "S", nameRu: "Сера", type: "element", state: "solid", color: "#fde047" }
  ];

  const fallbackIons = [
    ["h_plus", "H+", "Ион водорода", 1, "cation", "H"],
    ["na_plus", "Na+", "Ион натрия", 1, "cation", "Na"],
    ["k_plus", "K+", "Ион калия", 1, "cation", "K"],
    ["ag_plus", "Ag+", "Ион серебра", 1, "cation", "Ag"],
    ["ca_2plus", "Ca2+", "Ион кальция", 2, "cation", "Ca"],
    ["ba_2plus", "Ba2+", "Ион бария", 2, "cation", "Ba"],
    ["cu_2plus", "Cu2+", "Ион меди(II)", 2, "cation", "Cu"],
    ["fe_2plus", "Fe2+", "Ион железа(II)", 2, "cation", "Fe"],
    ["fe_3plus", "Fe3+", "Ион железа(III)", 3, "cation", "Fe"],
    ["al_3plus", "Al3+", "Ион алюминия", 3, "cation", "Al"],
    ["cl_minus", "Cl-", "Хлорид-ион", -1, "anion", "Cl"],
    ["oh_minus", "OH-", "Гидроксид-ион", -1, "anion", "OH"],
    ["no3_minus", "NO3-", "Нитрат-ион", -1, "anion", "NO3"],
    ["so4_2minus", "SO4^2-", "Сульфат-ион", -2, "anion", "SO4"],
    ["co3_2minus", "CO3^2-", "Карбонат-ион", -2, "anion", "CO3"],
    ["po4_3minus", "PO4^3-", "Фосфат-ион", -3, "anion", "PO4"],
    ["s_2minus", "S^2-", "Сульфид-ион", -2, "anion", "S"]
  ].map(([id, symbol, nameRu, charge, type, formulaPart]) => ({ id, symbol, nameRu, charge, type, formulaPart, color: "#e0f2fe" }));

  const localRules = {
    "cl2+na": {
      status: "success", equation: "2Na + Cl2 -> 2NaCl", balanced: true,
      product: product("NaCl", "Хлорид натрия", "salt", "solid", "crystal", "#f8fafc"),
      visual: { finalColor: "#f8fafc", heat: true, smoke: true, flash: true },
      observationRu: "Образуется белое кристаллическое вещество — хлорид натрия.",
      explanationRu: "Натрий отдаёт электрон, хлор принимает электрон. Образуется ионное соединение NaCl.",
      safetyRu: "В реальности реакция натрия с хлором опасна. Здесь показана только учебная симуляция.",
      canSaveProduct: true, simulationOnly: true
    },
    "h2+o2": {
      status: "success", equation: "2H2 + O2 -> 2H2O", balanced: true,
      product: product("H2O", "Вода", "water", "liquid", "liquid", "#dbeafe"),
      visual: { finalColor: "#bfdbfe", heat: true, smoke: true, flash: true },
      observationRu: "После вспышки образуется вода.",
      explanationRu: "Водород окисляется кислородом с образованием воды.",
      safetyRu: "Смесь водорода и кислорода взрывоопасна; это только симуляция.",
      canSaveProduct: true, simulationOnly: true
    },
    "al+cl2": {
      status: "success", equation: "2Al + 3Cl2 -> 2AlCl3", balanced: true,
      product: product("AlCl3", "Хлорид алюминия", "salt", "solid", "crystal", "#f1f5f9"),
      visual: { finalColor: "#f1f5f9", heat: true, smoke: true, flash: true },
      observationRu: "Образуются светлые кристаллы хлорида алюминия.",
      explanationRu: "Алюминий образует ион Al3+, хлорид-ионы компенсируют заряд: AlCl3.",
      safetyRu: "Реакция с хлором опасна; только виртуальная демонстрация.",
      canSaveProduct: true, simulationOnly: true
    },
    "mg+o2": {
      status: "need_heating", equation: "2Mg + O2 -> 2MgO", balanced: true,
      product: product("MgO", "Оксид магния", "oxide", "solid", "powder", "#f8fafc"),
      visual: { finalColor: "#f8fafc", heat: true, smoke: true, flash: true },
      observationRu: "Магний ярко вспыхивает, образуется белый оксид магния.",
      explanationRu: "Магний реагирует с кислородом, образуя оксид MgO.",
      safetyRu: "Яркое горение магния опасно для глаз; только симуляция.",
      canSaveProduct: true, simulationOnly: true
    },
    "fe+s": {
      status: "need_heating", equation: "Fe + S -> FeS", balanced: true,
      product: product("FeS", "Сульфид железа(II)", "salt", "solid", "powder", "#1f2937"),
      visual: { finalColor: "#334155", heat: true, smoke: true },
      observationRu: "При нагревании образуется тёмный сульфид железа.",
      explanationRu: "Железо и сера соединяются в FeS при нагревании.",
      safetyRu: "Нагрев веществ в реальности требует вытяжки и защиты; здесь симуляция.",
      canSaveProduct: true, simulationOnly: true
    },
    "c+o2": {
      status: "need_heating", equation: "C + O2 -> CO2", balanced: true,
      product: product("CO2", "Углекислый газ", "gas", "gas", "gas", "#e0f2fe"),
      visual: { finalColor: "#e0f2fe", gas: true, bubbles: true, heat: true, smoke: true },
      observationRu: "Углерод сгорает, выделяется углекислый газ.",
      explanationRu: "Углерод окисляется кислородом до CO2.",
      safetyRu: "Горение выполняется только в виртуальной симуляции.",
      canSaveProduct: true, simulationOnly: true
    }
  };

  const solubility = {
    NaCl: { kind: "soluble" },
    KNO3: { kind: "soluble" },
    AgCl: { kind: "precipitate", color: "white" },
    BaSO4: { kind: "precipitate", color: "white" },
    CaCO3: { kind: "precipitate", color: "white" },
    "Cu(OH)2": { kind: "precipitate", color: "blue" },
    "Fe(OH)2": { kind: "precipitate", color: "green" },
    "Fe(OH)3": { kind: "precipitate", color: "brown" },
    "Al(OH)3": { kind: "precipitate", color: "white" },
    H2O: { kind: "water" },
    CO2: { kind: "gas" }
  };

  const state = {
    mode: "elements",
    elements: fallbackElements,
    ions: fallbackIons,
    selectedElements: [],
    selectedCation: "",
    selectedAnion: "",
    currentResult: null,
    localProducts: JSON.parse(localStorage.getItem("chemlab_constructor_products") || "[]"),
    history: JSON.parse(localStorage.getItem("chemlab_synthesis_history") || "[]")
  };

  const dom = {};
  const get = (id) => document.getElementById(id);

  function product(formula, nameRu, type, stateValue, visualState, color) {
    return { formula, nameRu, type, state: stateValue, visualState, color, ions: {} };
  }

  async function loadData() {
    try {
      if (window.ChemLabAPI?.hasToken()) {
        const [elements, ions] = await Promise.all([
          window.ChemLabAPI.getConstructorElements?.(),
          window.ChemLabAPI.getConstructorIons?.()
        ]);
        if (Array.isArray(elements?.elements) && elements.elements.length) state.elements = elements.elements;
        if (Array.isArray(ions?.ions) && ions.ions.length) state.ions = ions.ions;
        const saved = await window.ChemLabAPI.getConstructorProducts();
        if (Array.isArray(saved.products)) mergeProducts(saved.products, false);
      }
    } catch (error) {
      console.warn("Constructor uses local fallback data.", error);
    }
  }

  function renderChoices() {
    dom.elementChoices.textContent = "";
    state.elements.forEach((item) => {
      dom.elementChoices.appendChild(choiceButton(item.id, item.formula, item.nameRu, state.selectedElements.includes(item.id), () => {
        if (state.selectedElements.includes(item.id)) {
          state.selectedElements = state.selectedElements.filter((id) => id !== item.id);
        } else {
          state.selectedElements = state.selectedElements.slice(-1).concat(item.id);
        }
        renderChoices();
        previewStreams();
      }));
    });

    renderIonList(dom.cationChoices, state.ions.filter((ion) => ion.type === "cation"), state.selectedCation, (id) => {
      state.selectedCation = state.selectedCation === id ? "" : id;
      renderChoices();
      previewStreams();
    });
    renderIonList(dom.anionChoices, state.ions.filter((ion) => ion.type === "anion"), state.selectedAnion, (id) => {
      state.selectedAnion = state.selectedAnion === id ? "" : id;
      renderChoices();
      previewStreams();
    });
  }

  function renderIonList(root, items, selected, onSelect) {
    root.textContent = "";
    items.forEach((ion) => root.appendChild(choiceButton(ion.id, ion.symbol, chargeLabel(ion.charge), selected === ion.id, () => onSelect(ion.id))));
  }

  function choiceButton(id, title, meta, selected, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-card" + (selected ? " is-selected" : "");
    button.dataset.id = id;
    button.innerHTML = `<strong>${escapeHtml(displayFormula(title))}</strong><span>${escapeHtml(meta || "")}</span>`;
    button.addEventListener("click", onClick);
    return button;
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.mode === mode));
    document.querySelectorAll("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== mode; });
    resetResult();
    previewStreams();
  }

  async function evaluate(event) {
    event.preventDefault();
    resetResult("Проверяем подтверждённые правила и условия.");
    const payload = buildPayload();
    if (!payload) return;
    renderSolids(payload);
    let result = null;
    try {
      if (window.ChemLabAPI?.hasToken() && window.ChemLabAPI?.evaluateConstructor) result = await window.ChemLabAPI.evaluateConstructor(payload);
    } catch (error) {
      console.warn("API evaluation failed, using local constructor rules.", error);
    }
    if (!result) result = evaluateLocal(payload);
    applyResult(result, payload);
  }

  function buildPayload() {
    const common = {
      conditions: {
        temperature: Number(dom.temperature.value || 25),
        heating: dom.heating.checked,
        catalystId: dom.catalyst.value || null,
        medium: dom.medium.value
      }
    };
    if (state.mode === "elements") {
      if (state.selectedElements.length !== 2) {
        setStatus("Выберите два элемента или простых вещества.", "warning");
        return null;
      }
      const [a, b] = state.selectedElements.map((id, index) => ({
        id,
        type: elementById(id)?.type || "element",
        coefficient: 1,
        amount: Number((index === 0 ? dom.amountA : dom.amountB).value || 1),
        concentration: (index === 0 ? dom.concentrationA : dom.concentrationB).value
      }));
      return { mode: "elements", reactants: [a, b], ...common };
    }
    if (!state.selectedCation || !state.selectedAnion) {
      setStatus("Выберите один катион и один анион.", "warning");
      return null;
    }
    return {
      mode: "ions",
      reactants: [
        { id: state.selectedCation, type: "cation", coefficient: 1, amount: Number(dom.amountA.value || 1), concentration: dom.concentrationA.value },
        { id: state.selectedAnion, type: "anion", coefficient: 1, amount: Number(dom.amountB.value || 1), concentration: dom.concentrationB.value }
      ],
      ...common
    };
  }

  function evaluateLocal(payload) {
    if (payload.mode === "elements") {
      const ids = payload.reactants.map((r) => r.id).sort().join("+");
      const base = localRules[ids];
      if (!base) return noReaction("Для этой пары нет подтверждённого правила синтеза.");
      const result = JSON.parse(JSON.stringify(base));
      result.requiresHeating = base.status === "need_heating";
      if (result.status === "need_heating" && (payload.conditions.heating || payload.conditions.temperature >= 80)) result.status = "success";
      result.visual.intensity = intensity(payload.reactants);
      return result.status === "need_heating" ? { ...result, canSaveProduct: false } : result;
    }
    return evaluateIonsLocal(payload);
  }

  function evaluateIonsLocal(payload) {
    const cation = ionById(payload.reactants[0].id);
    const anion = ionById(payload.reactants[1].id);
    const built = buildIonicFormula(cation, anion);
    const rule = solubility[built.formula];
    const visual = {
      initialColor: "#dbeafe",
      finalColor: rule?.kind === "precipitate" ? "#f8fafc" : "#e0f2fe",
      precipitate: rule?.kind === "precipitate",
      precipitateColor: rule?.color,
      gas: rule?.kind === "gas",
      bubbles: rule?.kind === "gas",
      heat: built.formula === "H2O",
      smoke: false,
      flash: false,
      intensity: intensity(payload.reactants)
    };
    const canSave = Boolean(rule);
    return {
      status: canSave ? "success" : "weak",
      equation: built.equation,
      balanced: true,
      product: product(built.formula, productName(built.formula), rule?.kind === "water" ? "water" : "salt", rule?.kind === "precipitate" ? "solid" : "aqueous", rule?.kind === "precipitate" ? "precipitate" : "solution", productColor(rule?.color)),
      visual,
      observationRu: rule ? observationFor(built.formula, rule) : "Данные о растворимости для этого соединения не найдены.",
      explanationRu: "Формула рассчитана по зарядам ионов через НОК зарядов.",
      safetyRu: "Учебная симуляция. Высокая концентрация усиливает визуальный эффект и предупреждение.",
      simulationOnly: true,
      requiresHeating: false,
      canSaveProduct: canSave
    };
  }

  function buildIonicFormula(cation, anion) {
    if (cation.id === "h_plus" && anion.id === "oh_minus") return { formula: "H2O", equation: "H+ + OH- -> H2O" };
    if (cation.id === "h_plus" && anion.id === "co3_2minus") return { formula: "CO2", equation: "2H+ + CO3^2- -> CO2↑ + H2O" };
    const c = Math.abs(Number(cation.charge));
    const a = Math.abs(Number(anion.charge));
    const l = lcm(c, a);
    const cCount = l / c;
    const aCount = l / a;
    const formula = part(cation.formulaPart, cCount, false) + part(anion.formulaPart, aCount, true);
    return { formula, equation: `${coef(cCount)}${cation.symbol} + ${coef(aCount)}${anion.symbol} -> ${formula}${solubility[formula]?.kind === "precipitate" ? "↓" : ""}` };
  }

  function applyResult(result, payload) {
    state.currentResult = result;
    const ok = ["success", "weak", "dangerous"].includes(result.status);
    const needCondition = ["need_heating", "need_temperature"].includes(result.status);
    const tone = ok ? (result.status === "dangerous" ? "warning" : "success") : (needCondition ? "warning" : "error");
    setStatus(statusText(result, payload), tone);
    dom.equationView.textContent = displayFormula(result.equation || "—");
    dom.observationView.textContent = result.observationRu || "—";
    dom.explanationView.textContent = result.explanationRu || "—";
    dom.safetyView.textContent = result.safetyRu || "—";
    dom.productPreview.textContent = displayFormula(result.product?.formula || "—");
    dom.saveProduct.disabled = !result.canSaveProduct || !result.product;
    dom.useInLab.disabled = !result.canSaveProduct || !result.product;
    renderVisual(result.visual || {}, result.status);
    addJournal(result, payload);
  }

  async function saveProduct() {
    const result = state.currentResult;
    if (!result?.product) return;
    const p = result.product;
    const payload = {
      product_id: p.formula,
      formula: p.formula,
      nameRu: p.nameRu || p.formula,
      type: p.type || "synthesized",
      state: p.state || "aqueous",
      visualState: p.visualState || p.state || "solution",
      color: p.color || "#e0f2fe",
      sourceMode: state.mode,
      sourceEquation: result.equation,
      cation: p.ions?.cation || "",
      anion: p.ions?.anion || ""
    };
    try {
      let saved = null;
      if (window.ChemLabAPI?.hasToken()) saved = await window.ChemLabAPI.saveConstructorProduct(payload);
      const productItem = normalizeProduct(saved?.product || {
        id: p.formula,
        formula: p.formula,
        name: p.nameRu || p.formula,
        type: p.type,
        state: p.visualState || p.state,
        color: p.color,
        description: "Создано в конструкторе ChemLab TJ"
      });
      mergeProducts([productItem], true);
      state.history.unshift({
        product: p.formula,
        equation: result.equation,
        date: new Date().toISOString(),
        status: saved?.product?.already_exists ? "вещество уже было в базе" : (window.ChemLabAPI?.hasToken() ? "сохранено в backend" : "сохранено локально")
      });
      localStorage.setItem("chemlab_synthesis_history", JSON.stringify(state.history.slice(0, 30)));
      setStatus(saved?.product?.already_exists ? "Это вещество уже есть в базе. Оно доступно в лаборатории." : "Продукт сохранён и доступен в лаборатории.", "success");
      renderHistory();
    } catch (error) {
      setStatus(error.message || "Не удалось сохранить продукт.", "warning");
    }
  }

  function mergeProducts(products, persist) {
    products.forEach((item) => {
      const normalized = normalizeProduct(item);
      const existing = state.localProducts.findIndex((p) => p.id === normalized.id);
      if (existing >= 0) state.localProducts.splice(existing, 1);
      state.localProducts.unshift(normalized);
    });
    state.localProducts = state.localProducts.slice(0, 50);
    if (persist) localStorage.setItem("chemlab_constructor_products", JSON.stringify(state.localProducts));
  }

  function normalizeProduct(item) {
    return {
      id: item.id || item.formula,
      name: item.name || item.nameRu || item.formula,
      formula: item.formula || item.id,
      type: item.type || "synthesized",
      state: item.visualState || item.state || "solution",
      color: item.color || "#e0f2fe",
      description: item.description || "Создано в конструкторе ChemLab TJ"
    };
  }

  function useInLab() {
    const formula = state.currentResult?.product?.formula;
    if (!formula) return;
    localStorage.setItem("chemlab_pending_reagent", formula);
    window.location.href = new URL("demo.html#lab", window.location.href).toString();
  }

  function renderVisual(visual, status) {
    resetVessel();
    const strong = visual.intensity === "strong";
    const weak = visual.intensity === "weak";
    dom.flask.classList.add("is-reacting");
    if (visual.finalColor) dom.flask.dataset.liquid = colorToken(visual.finalColor);
    if (visual.precipitate) {
      dom.flask.classList.add("has-precipitate");
      dom.precipitate.className = "constructor-precipitate is-" + (visual.precipitateColor || "white") + (weak ? " is-weak" : "") + (strong ? " is-strong" : "");
    }
    if (visual.gas || visual.bubbles) {
      createBubbles(strong ? 38 : weak ? 10 : 24);
      showGas(state.currentResult?.product?.formula || "газ");
    }
    if (visual.heat || dom.heating.checked) dom.burner.classList.add("is-on");
    if (visual.smoke) createSmoke(strong ? 12 : 7);
    if (visual.flash || status === "dangerous") {
      dom.flask.classList.add("is-danger");
      dom.dangerOverlay.classList.add("is-visible");
      setTimeout(() => dom.dangerOverlay.classList.remove("is-visible"), 1500);
    }
    if (state.currentResult?.product?.visualState === "crystal") createCrystals(strong ? 14 : weak ? 5 : 9);
  }

  function resetResult(message) {
    state.currentResult = null;
    dom.equationView.textContent = "—";
    dom.observationView.textContent = "—";
    dom.explanationView.textContent = "—";
    dom.safetyView.textContent = "—";
    dom.productPreview.textContent = "—";
    dom.saveProduct.disabled = true;
    dom.useInLab.disabled = true;
    resetVessel();
    if (message) setStatus(message, "warning");
  }

  function resetVessel() {
    dom.flask.className = "constructor-flask";
    dom.flask.removeAttribute("data-liquid");
    dom.bubbles.textContent = "";
    dom.smoke.textContent = "";
    dom.crystals.textContent = "";
    dom.solids.textContent = "";
    dom.streamA.textContent = "";
    dom.streamB.textContent = "";
    dom.gasLabel.textContent = "";
    dom.gasLabel.classList.remove("is-visible");
    dom.burner.classList.toggle("is-on", dom.heating.checked);
    dom.precipitate.className = "constructor-precipitate";
  }

  function renderSolids(payload) {
    dom.solids.textContent = "";
    payload.reactants.forEach((reactant, index) => {
      const item = payload.mode === "elements" ? elementById(reactant.id) : null;
      if (!item || !/solid|powder|crystal|metal|element/.test((item.state || "") + (item.type || ""))) return;
      for (let i = 0; i < 5; i += 1) addPiece(dom.solids, 22 + index * 42 + Math.random() * 14);
    });
  }

  function previewStreams() {
    dom.streamA.textContent = "";
    dom.streamB.textContent = "";
    if (state.mode === "ions") {
      if (state.selectedCation) streamLabel(dom.streamA, ionById(state.selectedCation)?.symbol);
      if (state.selectedAnion) streamLabel(dom.streamB, ionById(state.selectedAnion)?.symbol);
    } else {
      state.selectedElements.forEach((id, index) => streamLabel(index === 0 ? dom.streamA : dom.streamB, elementById(id)?.formula));
    }
  }

  function streamLabel(root, label) {
    if (!label) return;
    for (let i = 0; i < 5; i += 1) {
      const span = document.createElement("span");
      span.textContent = displayFormula(label);
      span.style.animationDelay = `${i * 0.12}s`;
      root.appendChild(span);
    }
  }

  function createBubbles(count) {
    for (let i = 0; i < count; i += 1) {
      const bubble = document.createElement("span");
      const size = 5 + Math.random() * 10;
      bubble.style.width = size + "px";
      bubble.style.height = size + "px";
      bubble.style.left = 20 + Math.random() * 60 + "%";
      bubble.style.animationDelay = Math.random() * 0.8 + "s";
      dom.bubbles.appendChild(bubble);
    }
  }

  function createSmoke(count) {
    for (let i = 0; i < count; i += 1) {
      const puff = document.createElement("span");
      puff.style.left = 20 + Math.random() * 54 + "%";
      puff.style.animationDelay = Math.random() * 1.2 + "s";
      dom.smoke.appendChild(puff);
    }
  }

  function createCrystals(count) {
    for (let i = 0; i < count; i += 1) addPiece(dom.crystals, 20 + Math.random() * 60);
  }

  function addPiece(root, left) {
    const piece = document.createElement("span");
    piece.style.left = `${left}%`;
    piece.style.transform = `rotate(${Math.random() * 80 - 40}deg)`;
    root.appendChild(piece);
  }

  function showGas(label) {
    dom.gasLabel.textContent = `Выделяется ${displayFormula(label)}`;
    dom.gasLabel.classList.add("is-visible");
  }

  function addJournal(result, payload) {
    if (!result.equation) return;
    const node = document.createElement("div");
    node.className = "journal-item";
    const optionalHeat = payload.conditions.heating && !reactionRequiresHeating(result);
    const heatCondition = payload.conditions.heating ? (optionalHeat ? "нагрев включён, не влияет" : "нагрев") : payload.conditions.temperature + " °C";
    const conditions = `${heatCondition} · концентрация ${intensity(payload.reactants)}`;
    node.innerHTML = `<strong>${escapeHtml(displayFormula(result.equation))}</strong><small>${escapeHtml(conditions)}</small><p>${escapeHtml(result.observationRu || "")}</p>`;
    dom.labJournal.prepend(node);
  }

  function renderHistory() {
    dom.createdProducts.innerHTML = state.localProducts.length ? "" : `<div class="history-item">Пока нет созданных веществ.</div>`;
    state.localProducts.slice(0, 8).forEach((item) => {
      const node = document.createElement("div");
      node.className = "history-item";
      node.innerHTML = `<strong>${escapeHtml(displayFormula(item.formula || item.id))}</strong><small>${escapeHtml(item.description || "созданный продукт")}</small>`;
      dom.createdProducts.appendChild(node);
    });
    dom.synthesisHistory.innerHTML = state.history.length ? "" : `<div class="history-item">Проверенные синтезы появятся здесь.</div>`;
    state.history.slice(0, 8).forEach((item) => {
      const node = document.createElement("div");
      node.className = "history-item";
      node.innerHTML = `<strong>${escapeHtml(displayFormula(item.product))}</strong><small>${escapeHtml(new Date(item.date).toLocaleString("ru-RU"))} · ${escapeHtml(item.status)}</small><p>${escapeHtml(displayFormula(item.equation || ""))}</p>`;
      dom.synthesisHistory.appendChild(node);
    });
  }

  function reactionRequiresHeating(result) {
    return Boolean(result?.requiresHeating || result?.requires_heating || result?.status === "need_heating");
  }

  function statusText(result, payload) {
    const text = {
      success: "Реакция подтверждена. Продукт можно сохранить.",
      weak: "Реакция возможна, но эффект слабый или справочник неполный.",
      no_reaction: "Подтверждённой реакции нет.",
      need_heating: "Для этой реакции нужен нагрев.",
      need_temperature: "Нужна другая температура.",
      dangerous: "Опасная реакция показана только как учебная симуляция."
    }[result.status] || "Результат получен.";
    if (payload?.conditions?.heating && !reactionRequiresHeating(result) && ["success", "weak", "dangerous"].includes(result.status)) {
      return text + " Нагрев включён как дополнительное условие, но эта реакция от него не зависит.";
    }
    return text;
  }

  function noReaction(message) {
    return {
      status: "no_reaction",
      balanced: false,
      visual: {},
      observationRu: message,
      explanationRu: "Разрешены только подтверждённые учебные правила.",
      safetyRu: "Не выполняйте реальные опыты по симуляции.",
      requiresHeating: false,
      canSaveProduct: false
    };
  }

  function elementById(id) { return state.elements.find((item) => item.id === id); }
  function ionById(id) { return state.ions.find((item) => item.id === id); }
  function chargeLabel(charge) { return charge > 0 ? `заряд +${charge}` : `заряд ${charge}`; }
  function setStatus(message, tone) { dom.status.textContent = message; dom.status.dataset.tone = tone || "info"; }
  function escapeHtml(value) { return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
  function intensity(reactants) { return reactants.some((r) => r.concentration === "high") ? "strong" : reactants.every((r) => r.concentration === "low") ? "weak" : "normal"; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function coef(n) { return n > 1 ? String(n) : ""; }
  function part(value, count, poly) { return count > 1 ? (poly && /^(OH|NO3|SO4|CO3|PO4)$/.test(value) ? `(${value})${count}` : `${value}${count}`) : value; }
  function productName(formula) { return ({ NaCl: "Хлорид натрия", AgCl: "Хлорид серебра", BaSO4: "Сульфат бария", CaCO3: "Карбонат кальция", H2O: "Вода", "Cu(OH)2": "Гидроксид меди(II)", "Al2(SO4)3": "Сульфат алюминия", "Ca3(PO4)2": "Фосфат кальция" }[formula] || formula); }
  function productColor(color) { return ({ white: "#f8fafc", blue: "#60a5fa", green: "#86efac", brown: "#92400e" }[color] || "#e0f2fe"); }
  function observationFor(formula, rule) { return rule.kind === "precipitate" ? `Появляется осадок ${displayFormula(formula)}.` : rule.kind === "gas" ? `Выделяется газ ${displayFormula(formula)}.` : `Образуется ${displayFormula(formula)}, раствор остаётся прозрачным.`; }
  function colorToken(color) {
    if (color === "#f8fafc" || color === "#f1f5f9") return "cloudy";
    if (color === "#334155") return "brown";
    return "blue";
  }
  function displayFormula(value) {
    return String(value || "")
      .replace(/->/g, "→")
      .replace(/\^2-/g, "²⁻")
      .replace(/\^3-/g, "³⁻")
      .replace(/([A-Za-z]+)2\+/g, "$1²⁺")
      .replace(/([A-Za-z]+)3\+/g, "$1³⁺")
      .replace(/([A-Za-z)])2/g, "$1₂")
      .replace(/([A-Za-z)])3/g, "$1₃")
      .replace(/([A-Za-z0-9)₂₃₄])\+/g, "$1⁺")
      .replace(/([A-Za-z0-9)₂₃₄])-/g, "$1⁻")
      .replace(/([A-Za-z)])4/g, "$1₄");
  }

  function cacheDom() {
    [
      "constructorForm", "elementChoices", "cationChoices", "anionChoices", "concentrationA", "concentrationB",
      "amountA", "amountB", "temperature", "heating", "catalyst", "medium", "constructorFlask",
      "constructorSolids", "constructorCrystals", "constructorPrecipitate", "constructorBubbles",
      "constructorSmoke", "constructorGasLabel", "dangerOverlay", "burnerToggle", "productPreview",
      "constructorStatus", "equationView", "observationView", "explanationView", "safetyView",
      "saveProduct", "useInLab", "createdProducts", "synthesisHistory", "labJournal", "streamA", "streamB"
    ].forEach((id) => {
      dom[id.replace("constructorStatus", "status").replace("constructorFlask", "flask").replace("constructorSolids", "solids").replace("constructorCrystals", "crystals").replace("constructorPrecipitate", "precipitate").replace("constructorBubbles", "bubbles").replace("constructorSmoke", "smoke").replace("constructorGasLabel", "gasLabel").replace("burnerToggle", "burner")] = get(id);
    });
  }

  async function init() {
    cacheDom();
    await loadData();
    renderChoices();
    renderHistory();
    dom.constructorForm.addEventListener("submit", evaluate);
    dom.saveProduct.addEventListener("click", saveProduct);
    dom.useInLab.addEventListener("click", useInLab);
    document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
    dom.heating.addEventListener("change", () => dom.burner.classList.toggle("is-on", dom.heating.checked));
    dom.burner.addEventListener("click", () => {
      dom.heating.checked = !dom.heating.checked;
      dom.burner.classList.toggle("is-on", dom.heating.checked);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
