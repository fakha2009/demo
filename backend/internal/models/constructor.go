package models

type ConstructorValidateRequest struct {
	ReactantA    string `json:"reactant_a"`
	CoefficientA int    `json:"coefficient_a"`
	ReactantB    string `json:"reactant_b"`
	CoefficientB int    `json:"coefficient_b"`
	Temperature  string `json:"temperature"`
	Heating      bool   `json:"heating"`
	Catalyst     string `json:"catalyst"`
}

type ConstructorSaveRequest struct {
	ReactionID     string `json:"reaction_id"`
	ProductID      string `json:"product_id"`
	Formula        string `json:"formula"`
	NameRu         string `json:"nameRu"`
	Type           string `json:"type"`
	State          string `json:"state"`
	VisualState    string `json:"visualState"`
	Color          string `json:"color"`
	SourceMode     string `json:"sourceMode"`
	SourceEquation string `json:"sourceEquation"`
	Cation         string `json:"cation"`
	Anion          string `json:"anion"`
}

type ConstructorEvaluateRequest struct {
	Mode       string                        `json:"mode"`
	Reactants  []ConstructorEvaluateReactant `json:"reactants"`
	Conditions ConstructorEvaluateConditions `json:"conditions"`
}

type ConstructorEvaluateReactant struct {
	ID            string  `json:"id"`
	Type          string  `json:"type"`
	Coefficient   int     `json:"coefficient"`
	Amount        float64 `json:"amount"`
	Concentration string  `json:"concentration"`
}

type ConstructorEvaluateConditions struct {
	Temperature int    `json:"temperature"`
	Heating     bool   `json:"heating"`
	CatalystID  string `json:"catalystId"`
	Medium      string `json:"medium"`
}
