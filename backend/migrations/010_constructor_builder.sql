CREATE TABLE IF NOT EXISTS constructor_ions (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  charge INTEGER NOT NULL CHECK (charge <> 0),
  type TEXT NOT NULL CHECK (type IN ('cation', 'anion')),
  formula_part TEXT NOT NULL,
  color TEXT,
  common BOOLEAN NOT NULL DEFAULT true,
  description_ru TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS constructor_element_rules (
  id TEXT PRIMARY KEY,
  reactant_a TEXT NOT NULL,
  reactant_b TEXT NOT NULL,
  equation TEXT NOT NULL,
  product_formula TEXT NOT NULL,
  product_name_ru TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'salt',
  product_state TEXT NOT NULL DEFAULT 'solid',
  visual_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanation_ru TEXT,
  safety_ru TEXT,
  simulation_only BOOLEAN NOT NULL DEFAULT true,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solubility_rules (
  compound_formula TEXT PRIMARY KEY,
  soluble BOOLEAN,
  kind TEXT NOT NULL DEFAULT 'unknown',
  precipitate_color TEXT,
  note_ru TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS constructor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  substance_id TEXT REFERENCES substances(id) ON DELETE SET NULL,
  formula TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  type TEXT NOT NULL,
  state TEXT NOT NULL,
  visual_state TEXT,
  color TEXT,
  source_mode TEXT,
  source_equation TEXT,
  cation TEXT,
  anion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_constructor_products_user_created
  ON constructor_products (user_id, created_at DESC);

INSERT INTO constructor_ions (id, symbol, name_ru, charge, type, formula_part, color, common, description_ru)
VALUES
  ('h_plus','H+','Ион водорода',1,'cation','H','#fecaca',true,'Катион кислой среды.'),
  ('na_plus','Na+','Ион натрия',1,'cation','Na','#e5e7eb',true,'Однозарядный катион.'),
  ('k_plus','K+','Ион калия',1,'cation','K','#e5e7eb',true,'Однозарядный катион.'),
  ('ag_plus','Ag+','Ион серебра',1,'cation','Ag','#f8fafc',true,'Образует осадки с хлоридами.'),
  ('ca_2plus','Ca2+','Ион кальция',2,'cation','Ca','#f1f5f9',true,'Двухзарядный катион.'),
  ('ba_2plus','Ba2+','Ион бария',2,'cation','Ba','#f8fafc',true,'Соли бария токсичны; только симуляция.'),
  ('cu_2plus','Cu2+','Ион меди(II)',2,'cation','Cu','#60a5fa',true,'Даёт голубые осадки гидроксидов.'),
  ('fe_2plus','Fe2+','Ион железа(II)',2,'cation','Fe','#86efac',true,'Даёт зеленоватые осадки.'),
  ('fe_3plus','Fe3+','Ион железа(III)',3,'cation','Fe','#f59e0b',true,'Даёт бурые осадки.'),
  ('al_3plus','Al3+','Ион алюминия',3,'cation','Al','#e2e8f0',true,'Трёхзарядный катион.'),
  ('cl_minus','Cl-','Хлорид-ион',-1,'anion','Cl','#e0f2fe',true,'Однозарядный анион.'),
  ('oh_minus','OH-','Гидроксид-ион',-1,'anion','OH','#dbeafe',true,'Анион щелочной среды.'),
  ('no3_minus','NO3-','Нитрат-ион',-1,'anion','NO3','#e0f2fe',true,'Обычно растворимые соли.'),
  ('so4_2minus','SO4^2-','Сульфат-ион',-2,'anion','SO4','#e0f2fe',true,'Двухзарядный анион.'),
  ('co3_2minus','CO3^2-','Карбонат-ион',-2,'anion','CO3','#e0f2fe',true,'Даёт осадки и CO2 с кислотами.'),
  ('po4_3minus','PO4^3-','Фосфат-ион',-3,'anion','PO4','#e0f2fe',true,'Трёхзарядный анион.'),
  ('s_2minus','S^2-','Сульфид-ион',-2,'anion','S','#e0f2fe',true,'Многие сульфиды малорастворимы.')
ON CONFLICT (id) DO UPDATE SET
  symbol = EXCLUDED.symbol,
  name_ru = EXCLUDED.name_ru,
  charge = EXCLUDED.charge,
  type = EXCLUDED.type,
  formula_part = EXCLUDED.formula_part,
  color = EXCLUDED.color,
  common = EXCLUDED.common,
  description_ru = EXCLUDED.description_ru,
  updated_at = now();

INSERT INTO solubility_rules (compound_formula, soluble, kind, precipitate_color, note_ru)
VALUES
  ('NaCl', true, 'soluble', null, 'Хлорид натрия растворим.'),
  ('KNO3', true, 'soluble', null, 'Нитрат калия растворим.'),
  ('AgCl', false, 'precipitate', 'white', 'Белый осадок AgCl.'),
  ('BaSO4', false, 'precipitate', 'white', 'Белый осадок BaSO4.'),
  ('CaCO3', false, 'precipitate', 'white', 'Белый осадок CaCO3.'),
  ('Cu(OH)2', false, 'precipitate', 'blue', 'Голубой осадок Cu(OH)2.'),
  ('Fe(OH)2', false, 'precipitate', 'green', 'Зеленоватый осадок Fe(OH)2.'),
  ('Fe(OH)3', false, 'precipitate', 'brown', 'Бурый осадок Fe(OH)3.'),
  ('Al(OH)3', false, 'precipitate', 'white', 'Белый осадок Al(OH)3.'),
  ('H2O', true, 'water', null, 'Нейтрализация.'),
  ('CO2', false, 'gas', null, 'Кислота с карбонатом даёт CO2.')
ON CONFLICT (compound_formula) DO UPDATE SET
  soluble = EXCLUDED.soluble,
  kind = EXCLUDED.kind,
  precipitate_color = EXCLUDED.precipitate_color,
  note_ru = EXCLUDED.note_ru,
  updated_at = now();
