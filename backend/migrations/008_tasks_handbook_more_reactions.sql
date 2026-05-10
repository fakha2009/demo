CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'easy',
  goal TEXT NOT NULL,
  reagents JSONB NOT NULL DEFAULT '[]'::jsonb,
  hints JSONB NOT NULL DEFAULT '[]'::jsonb,
  reaction_id TEXT REFERENCES reactions(id) ON DELETE SET NULL,
  points INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS handbook_entries (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  icon TEXT,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks (is_active, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_handbook_entries_active ON handbook_entries (is_active, sort_order);

INSERT INTO substances (id, slug, formula, name, type, category, safety_level, ions, state, danger_level, description, data, sort_order)
VALUES
  ('H2SO4', 'h2so4', 'H2SO4', 'Серная кислота', 'acid', 'acid', 'high', '{"cation":"H+","anion":"SO4^2-"}', 'solution', 'high', 'Сильная кислота для виртуальных опытов нейтрализации и дегидратации.', '{"id":"H2SO4","name":"Серная кислота","formula":"H2SO4","type":"acid","category":"acid","state":"solution","visualState":"solution","safetyLevel":"high"}', 150),
  ('CH3COOH', 'ch3cooh', 'CH3COOH', 'Уксусная кислота', 'acid', 'acid', 'low', '{"cation":"H+","anion":"CH3COO-"}', 'solution', 'low', 'Слабая органическая кислота для безопасных демонстраций.', '{"id":"CH3COOH","name":"Уксусная кислота","formula":"CH3COOH","type":"acid","category":"acid","state":"solution","visualState":"solution","safetyLevel":"low"}', 160),
  ('Ca(OH)2', 'ca-oh-2', 'Ca(OH)2', 'Известковая вода', 'base', 'base', 'low', '{"cation":"Ca2+","anion":"OH-"}', 'solution', 'low', 'Раствор для обнаружения углекислого газа.', '{"id":"Ca(OH)2","name":"Известковая вода","formula":"Ca(OH)2","type":"base","category":"base","state":"solution","visualState":"solution","safetyLevel":"low"}', 170),
  ('FeSO4', 'feso4', 'FeSO4', 'Сульфат железа(II)', 'salt', 'salt', 'low', '{"cation":"Fe2+","anion":"SO4^2-"}', 'solution', 'low', 'Соль железа(II) для реакций осаждения.', '{"id":"FeSO4","name":"Сульфат железа(II)","formula":"FeSO4","type":"salt","category":"salt","state":"solution","visualState":"solution","safetyLevel":"low"}', 180),
  ('KMnO4', 'kmno4', 'KMnO4', 'Перманганат калия', 'oxide', 'oxidizer', 'medium', '{"cation":"K+","anion":"MnO4-"}', 'solution', 'medium', 'Окислитель, используется только в виртуальной лаборатории.', '{"id":"KMnO4","name":"Перманганат калия","formula":"KMnO4","type":"oxide","category":"oxidizer","state":"solution","visualState":"solution","safetyLevel":"medium"}', 190),
  ('H2O2', 'h2o2', 'H2O2', 'Перекись водорода', 'oxide', 'oxidizer', 'medium', '{}', 'liquid', 'medium', 'Окислитель для демонстрации выделения кислорода.', '{"id":"H2O2","name":"Перекись водорода","formula":"H2O2","type":"oxide","category":"oxidizer","state":"liquid","visualState":"liquid","safetyLevel":"medium"}', 200),
  ('MnO2', 'mno2', 'MnO2', 'Диоксид марганца', 'catalyst', 'catalyst', 'low', '{}', 'powder', 'low', 'Катализатор разложения перекиси водорода.', '{"id":"MnO2","name":"Диоксид марганца","formula":"MnO2","type":"catalyst","category":"catalyst","state":"powder","visualState":"powder","safetyLevel":"low"}', 210),
  ('Phenolphthalein', 'phenolphthalein', 'C20H14O4', 'Фенолфталеин', 'indicator', 'indicator', 'low', '{}', 'solution', 'low', 'Индикатор: в щелочной среде становится малиновым.', '{"id":"Phenolphthalein","name":"Фенолфталеин","formula":"C20H14O4","type":"indicator","category":"indicator","state":"solution","visualState":"solution","safetyLevel":"low"}', 220)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  safety_level = EXCLUDED.safety_level,
  ions = EXCLUDED.ions,
  state = EXCLUDED.state,
  danger_level = EXCLUDED.danger_level,
  description = EXCLUDED.description,
  data = EXCLUDED.data,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO reactions (
  id, slug, title, type, equation, description, reactants, products, required_equipment,
  requires_heating, requires_catalyst, catalyst_id, visual_effect, liquid_color,
  liquid_color_after, precipitate_color, gas_label, safety_note, explanation,
  difficulty, reactant_a_id, reactant_b_id, has_gas, has_precipitate, has_heat,
  has_smoke, has_flash, danger_level, observation, safety, data, sort_order
)
VALUES
  ('h2so4_naoh', 'h2so4-naoh', 'Нейтрализация серной кислоты', 'neutralization', 'H2SO4 + 2NaOH -> Na2SO4 + 2H2O', 'Нейтрализация сильной кислоты щёлочью.', '["H2SO4","NaOH"]', '["Na2SO4","H2O"]', '["beaker"]', false, false, null, '{"type":"neutralization","liquidColor":"neutral"}', 'neutral', 'neutral', null, null, 'Работать только в виртуальном режиме: серная кислота едкая.', 'Ионы H+ связываются с OH- с образованием воды.', 'medium', 'H2SO4', 'NaOH', false, false, true, false, false, 'high', 'Раствор заметно нагревается.', 'Виртуальный опыт. В реальной лаборатории нужны очки и перчатки.', '{"id":"h2so4_naoh","title":"Нейтрализация серной кислоты","reactants":["H2SO4","NaOH"],"requiresHeating":false,"effect":"neutralization","visualEffect":{"type":"neutralization","liquidColor":"neutral"},"observation":"Раствор заметно нагревается.","explanation":"Ионы H+ и OH- образуют воду."}', 120),
  ('ch3cooh_naoh', 'ch3cooh-naoh', 'Нейтрализация уксусной кислоты', 'neutralization', 'CH3COOH + NaOH -> CH3COONa + H2O', 'Слабая кислота реагирует со щёлочью.', '["CH3COOH","NaOH"]', '["CH3COONa","H2O"]', '["beaker"]', false, false, null, '{"type":"neutralization","liquidColor":"clear"}', 'clear', 'clear', null, null, 'Избегать попадания щёлочи на кожу.', 'Образуется ацетат натрия и вода.', 'easy', 'CH3COOH', 'NaOH', false, false, true, false, false, 'medium', 'Раствор остаётся прозрачным, pH приближается к нейтральному.', 'Виртуальный опыт с базовыми правилами безопасности.', '{"id":"ch3cooh_naoh","title":"Нейтрализация уксусной кислоты","reactants":["CH3COOH","NaOH"],"effect":"neutralization","visualEffect":{"type":"neutralization","liquidColor":"clear"}}', 130),
  ('co2_limewater', 'co2-limewater', 'Обнаружение CO2 известковой водой', 'precipitation', 'CO2 + Ca(OH)2 -> CaCO3↓ + H2O', 'Углекислый газ мутнит известковую воду.', '["CO2","Ca(OH)2"]', '["CaCO3","H2O"]', '["beaker","gas-tube"]', false, false, null, '{"type":"precipitate","precipitate":"CaCO3","precipitateColor":"white","liquidColor":"cloudy"}', 'cloudy', 'cloudy', 'white', null, 'Не направлять газоотвод к лицу.', 'Образуется малорастворимый карбонат кальция.', 'medium', 'CO2', 'Ca(OH)2', false, true, false, false, false, 'low', 'Раствор мутнеет, появляется белая взвесь.', 'Виртуальный безопасный опыт.', '{"id":"co2_limewater","title":"Обнаружение CO2 известковой водой","reactants":["CO2","Ca(OH)2"],"effect":"precipitate","visualEffect":{"type":"precipitate","precipitateColor":"white","liquidColor":"cloudy"}}', 140),
  ('h2o2_mno2', 'h2o2-mno2', 'Разложение перекиси водорода', 'decomposition', '2H2O2 -> 2H2O + O2↑', 'Катализатор ускоряет выделение кислорода.', '["H2O2","MnO2"]', '["H2O","O2"]', '["test-tube"]', false, true, 'MnO2', '{"type":"gas","gas":"O2","liquidColor":"clear"}', 'clear', 'clear', null, 'O2', 'Перекись водорода является окислителем.', 'MnO2 ускоряет разложение H2O2 без расходования.', 'medium', 'H2O2', 'MnO2', true, false, false, false, false, 'medium', 'Появляются активные пузырьки кислорода.', 'Виртуальный опыт; избегать контакта с концентрированной перекисью.', '{"id":"h2o2_mno2","title":"Разложение перекиси водорода","reactants":["H2O2","MnO2"],"requiresCatalyst":true,"effect":"gas","visualEffect":{"type":"gas","gas":"O2","liquidColor":"clear"}}', 150),
  ('feso4_naoh', 'feso4-naoh', 'Осаждение Fe(OH)2', 'precipitation', 'FeSO4 + 2NaOH -> Fe(OH)2↓ + Na2SO4', 'Зелёный осадок гидроксида железа(II).', '["FeSO4","NaOH"]', '["Fe(OH)2","Na2SO4"]', '["test-tube"]', false, false, null, '{"type":"precipitate","precipitate":"Fe(OH)2","precipitateColor":"green","liquidColor":"greenCloudy"}', 'greenCloudy', 'greenCloudy', 'green', null, 'Работать аккуратно, избегать разбрызгивания.', 'Fe2+ реагирует с OH- с образованием малорастворимого гидроксида.', 'medium', 'FeSO4', 'NaOH', false, true, false, false, false, 'low', 'Появляется зеленоватый осадок.', 'Виртуальный безопасный опыт.', '{"id":"feso4_naoh","title":"Осаждение Fe(OH)2","reactants":["FeSO4","NaOH"],"effect":"precipitate","visualEffect":{"type":"precipitate","precipitateColor":"green","liquidColor":"greenCloudy"}}', 160),
  ('kmno4_h2o2', 'kmno4-h2o2', 'Обесцвечивание перманганата', 'oxidation', '2KMnO4 + 5H2O2 + 3H2SO4 -> K2SO4 + 2MnSO4 + 5O2↑ + 8H2O', 'Окислительно-восстановительная реакция с выделением кислорода.', '["KMnO4","H2O2"]', '["O2","MnSO4","H2O"]', '["beaker"]', false, false, null, '{"type":"gas","gas":"O2","liquidColor":"clear"}', 'clear', 'clear', null, 'O2', 'Окислители использовать только виртуально.', 'Перманганат окисляет перекись, раствор теряет фиолетовую окраску.', 'hard', 'KMnO4', 'H2O2', true, false, false, false, false, 'medium', 'Фиолетовый цвет исчезает, выделяются пузырьки газа.', 'Виртуальный опыт; в реальности нужны строгие правила безопасности.', '{"id":"kmno4_h2o2","title":"Обесцвечивание перманганата","reactants":["KMnO4","H2O2"],"effect":"gas","visualEffect":{"type":"gas","gas":"O2","liquidColor":"clear"}}', 170),
  ('phenolphthalein_naoh', 'phenolphthalein-naoh', 'Индикатор в щёлочи', 'color_change', 'Phenolphthalein + NaOH -> малиновая окраска', 'Фенолфталеин показывает щелочную среду.', '["Phenolphthalein","NaOH"]', '["indicator-color"]', '["beaker"]', false, false, null, '{"type":"colorChange","liquidColor":"pink"}', 'pink', 'pink', null, null, 'Не пробовать вещества на вкус.', 'Индикатор меняет структуру в щелочной среде.', 'easy', 'Phenolphthalein', 'NaOH', false, false, false, false, false, 'low', 'Раствор становится малиновым.', 'Безопасность стандартная для виртуального опыта.', '{"id":"phenolphthalein_naoh","title":"Индикатор в щёлочи","reactants":["Phenolphthalein","NaOH"],"effect":"colorChange","visualEffect":{"type":"colorChange","liquidColor":"pink"}}', 180)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  equation = EXCLUDED.equation,
  description = EXCLUDED.description,
  reactants = EXCLUDED.reactants,
  products = EXCLUDED.products,
  required_equipment = EXCLUDED.required_equipment,
  requires_heating = EXCLUDED.requires_heating,
  requires_catalyst = EXCLUDED.requires_catalyst,
  catalyst_id = EXCLUDED.catalyst_id,
  visual_effect = EXCLUDED.visual_effect,
  liquid_color = EXCLUDED.liquid_color,
  liquid_color_after = EXCLUDED.liquid_color_after,
  precipitate_color = EXCLUDED.precipitate_color,
  gas_label = EXCLUDED.gas_label,
  safety_note = EXCLUDED.safety_note,
  explanation = EXCLUDED.explanation,
  difficulty = EXCLUDED.difficulty,
  reactant_a_id = EXCLUDED.reactant_a_id,
  reactant_b_id = EXCLUDED.reactant_b_id,
  has_gas = EXCLUDED.has_gas,
  has_precipitate = EXCLUDED.has_precipitate,
  has_heat = EXCLUDED.has_heat,
  has_smoke = EXCLUDED.has_smoke,
  has_flash = EXCLUDED.has_flash,
  danger_level = EXCLUDED.danger_level,
  observation = EXCLUDED.observation,
  safety = EXCLUDED.safety,
  data = EXCLUDED.data,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO tasks (id, title, level, goal, reagents, hints, reaction_id, points, data)
VALUES
  ('task-co2', 'Получить CO2 из карбоната', 'easy', 'Добиться выделения углекислого газа без нагрева.', '["CaCO3","HCl"]', '["Выберите коническую колбу.","Добавьте CaCO3, затем HCl.","Газоотводная трубка поможет увидеть направление газа."]', 'caco3_hcl', 20, '{}'),
  ('task-agcl', 'Распознать хлорид-ионы', 'easy', 'Получить белый осадок AgCl.', '["AgNO3","NaCl"]', '["Нужны два раствора солей.","Нагрев не требуется."]', 'agno3_nacl', 20, '{}'),
  ('task-neutral', 'Нейтрализовать кислоту щёлочью', 'medium', 'Показать образование соли и воды.', '["H2SO4","NaOH"]', '["Выберите стакан.","Добавьте кислоту и щёлочь.","Следите за тепловым эффектом."]', 'h2so4_naoh', 30, '{}'),
  ('task-h2o2', 'Выделить кислород', 'medium', 'Получить пузырьки O2 из перекиси водорода с катализатором.', '["H2O2","MnO2"]', '["Возьмите пробирку.","Добавьте перекись и катализатор.","Нагрев не нужен."]', 'h2o2_mno2', 35, '{}'),
  ('task-indicator', 'Проверить щелочную среду', 'easy', 'Получить малиновую окраску фенолфталеина.', '["Phenolphthalein","NaOH"]', '["Добавьте индикатор.","Затем добавьте щёлочь.","Наблюдайте изменение цвета."]', 'phenolphthalein_naoh', 15, '{}')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  goal = EXCLUDED.goal,
  reagents = EXCLUDED.reagents,
  hints = EXCLUDED.hints,
  reaction_id = EXCLUDED.reaction_id,
  points = EXCLUDED.points,
  updated_at = now();

INSERT INTO handbook_entries (id, category, icon, title, text, sort_order)
VALUES
  ('safety-glasses', 'Техника безопасности', '!', 'Очки и перчатки', 'Кислоты, щёлочи и соли тяжёлых металлов требуют защиты глаз и кожи. Виртуальная лаборатория снижает риск, но правила безопасности остаются частью обучения.', 10),
  ('glassware', 'Лабораторная посуда', '⚗', 'Пробирка, стакан и колба', 'Пробирка подходит для малых проб, стакан для растворов, коническая колба удобна для выделения газа.', 20),
  ('heating', 'Оборудование', '♨', 'Нагреватель', 'Нагрев используют только в реакциях, где он указан в условиях. Закрытые сосуды при выделении газа не нагревают.', 30),
  ('precipitation', 'Типы реакций', '↓', 'Осаждение', 'Если при смешивании ионов образуется малорастворимое вещество, оно выпадает в осадок.', 40),
  ('gas', 'Типы реакций', '↑', 'Выделение газа', 'Пузырьки, газовая дымка или газоотвод показывают образование газообразного продукта.', 50),
  ('indicator', 'Основные понятия', 'pH', 'Индикаторы', 'Индикаторы меняют цвет в зависимости от кислотности среды и помогают обнаружить кислоты и основания.', 60)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  title = EXCLUDED.title,
  text = EXCLUDED.text,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
