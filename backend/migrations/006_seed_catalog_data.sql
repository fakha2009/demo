INSERT INTO substances (id, slug, formula, name, type, category, safety_level, ions, data, sort_order)
VALUES
  ('AgNO3', 'agno3', 'AgNO3', 'Silver nitrate', 'salt', 'salt', 'medium', '{"cation":"Ag+","anion":"NO3-"}', '{"id":"AgNO3","name":"Silver nitrate","formula":"AgNO3","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"medium","ions":{"cation":"Ag+","anion":"NO3-"}}', 10),
  ('NaCl', 'nacl', 'NaCl', 'Sodium chloride', 'salt', 'salt', 'low', '{"cation":"Na+","anion":"Cl-"}', '{"id":"NaCl","name":"Sodium chloride","formula":"NaCl","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"low","ions":{"cation":"Na+","anion":"Cl-"}}', 20),
  ('HCl', 'hcl', 'HCl', 'Hydrochloric acid', 'acid', 'acid', 'medium', '{"cation":"H+","anion":"Cl-"}', '{"id":"HCl","name":"Hydrochloric acid","formula":"HCl","type":"acid","category":"acid","state":"aqueous","visualState":"solution","safetyLevel":"medium","ions":{"cation":"H+","anion":"Cl-"}}', 30),
  ('NaHCO3', 'nahco3', 'NaHCO3', 'Sodium bicarbonate', 'salt', 'salt', 'low', '{"cation":"Na+","anion":"HCO3-"}', '{"id":"NaHCO3","name":"Sodium bicarbonate","formula":"NaHCO3","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"low","ions":{"cation":"Na+","anion":"HCO3-"}}', 40),
  ('CuSO4', 'cuso4', 'CuSO4', 'Copper(II) sulfate', 'salt', 'salt', 'medium', '{"cation":"Cu2+","anion":"SO4^2-"}', '{"id":"CuSO4","name":"Copper(II) sulfate","formula":"CuSO4","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"medium","ions":{"cation":"Cu2+","anion":"SO4^2-"}}', 50),
  ('NaOH', 'naoh', 'NaOH', 'Sodium hydroxide', 'base', 'base', 'medium', '{"cation":"Na+","anion":"OH-"}', '{"id":"NaOH","name":"Sodium hydroxide","formula":"NaOH","type":"base","category":"base","state":"aqueous","visualState":"solution","safetyLevel":"medium","ions":{"cation":"Na+","anion":"OH-"}}', 60),
  ('FeCl3', 'fecl3', 'FeCl3', 'Iron(III) chloride', 'salt', 'salt', 'medium', '{"cation":"Fe3+","anion":"Cl-"}', '{"id":"FeCl3","name":"Iron(III) chloride","formula":"FeCl3","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"medium","ions":{"cation":"Fe3+","anion":"Cl-"}}', 70),
  ('H2O', 'h2o', 'H2O', 'Water', 'water', 'water', 'low', '{}', '{"id":"H2O","name":"Water","formula":"H2O","type":"water","category":"water","state":"liquid","visualState":"liquid","safetyLevel":"low","ions":{"cation":"","anion":""}}', 80),
  ('CaCO3', 'caco3', 'CaCO3', 'Calcium carbonate', 'salt', 'carbonate', 'low', '{"cation":"Ca2+","anion":"CO3^2-"}', '{"id":"CaCO3","name":"Calcium carbonate","formula":"CaCO3","type":"salt","category":"carbonate","state":"solid","visualState":"powder","safetyLevel":"low","ions":{"cation":"Ca2+","anion":"CO3^2-"}}', 90),
  ('O2', 'o2', 'O2', 'Oxygen', 'gas', 'gas', 'low', '{}', '{"id":"O2","name":"Oxygen","formula":"O2","type":"gas","category":"gas","state":"gas","visualState":"gas","safetyLevel":"low","ions":{"cation":"","anion":""}}', 100)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  formula = EXCLUDED.formula,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  safety_level = EXCLUDED.safety_level,
  ions = EXCLUDED.ions,
  data = EXCLUDED.data,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO reactions (
  id, slug, title, type, equation, description, reactants, products, required_equipment,
  requires_heating, visual_effect, liquid_color, precipitate_color, gas_label,
  safety_note, explanation, difficulty, data, sort_order
)
VALUES
  ('agno3_nacl', 'agno3-nacl', 'Silver chloride precipitation', 'precipitation', 'AgNO3 + NaCl -> AgCl↓ + NaNO3', 'Forms a white AgCl precipitate.', '["AgNO3","NaCl"]', '["AgCl","NaNO3"]', '["test-tube"]', false, '{"type":"precipitate","precipitate":"AgCl","precipitateColor":"white","liquidColor":"cloudy"}', 'cloudy', 'white', null, 'Use eye protection. Silver nitrate stains skin.', 'Silver ions and chloride ions form insoluble silver chloride.', 'easy', '{"id":"agno3_nacl","name":"Silver chloride precipitation","title":"Silver chloride precipitation","reactants":["AgNO3","NaCl"],"equation":"AgNO3 + NaCl -> AgCl↓ + NaNO3","type":"precipitation","filters":["precipitate"],"expectedEffect":"white AgCl precipitate","products":["AgCl","NaNO3"],"requiredEquipment":["test-tube"],"requiresHeating":false,"requiresWater":true,"allowedContainers":["test-tube","erlenmeyer","beaker","reaction-vessel"],"effect":"precipitate","visualEffect":{"type":"precipitate","precipitate":"AgCl","precipitateColor":"white","liquidColor":"cloudy"},"liquidColor":"cloudy","message":"White AgCl precipitate formed.","observation":"The solution turns cloudy and a white precipitate settles.","explanation":"Ag+ and Cl- form insoluble AgCl.","safetyNote":"Use eye protection. Silver nitrate stains skin.","difficulty":"easy"}', 10),
  ('hcl_nahco3', 'hcl-nahco3', 'Acid and bicarbonate gas evolution', 'gas_evolution', 'HCl + NaHCO3 -> NaCl + CO2↑ + H2O', 'Carbon dioxide gas is released.', '["HCl","NaHCO3"]', '["NaCl","CO2","H2O"]', '["beaker"]', false, '{"type":"gas","gas":"CO2","liquidColor":"clear"}', 'clear', null, 'CO2', 'Do not seal the vessel during gas evolution.', 'Acid reacts with bicarbonate to release carbon dioxide.', 'easy', '{"id":"hcl_nahco3","name":"Acid and bicarbonate gas evolution","title":"Acid and bicarbonate gas evolution","reactants":["HCl","NaHCO3"],"equation":"HCl + NaHCO3 -> NaCl + CO2↑ + H2O","type":"gas_evolution","filters":["gas"],"expectedEffect":"CO2 bubbles","products":["NaCl","CO2","H2O"],"requiredEquipment":["beaker"],"requiresHeating":false,"requiresWater":true,"allowedContainers":["test-tube","erlenmeyer","beaker","reaction-vessel"],"effect":"gas","visualEffect":{"type":"gas","gas":"CO2","liquidColor":"clear"},"liquidColor":"clear","message":"Carbon dioxide is released.","observation":"Bubbles of CO2 appear in the vessel.","explanation":"Acid reacts with bicarbonate to form salt, water, and CO2.","safetyNote":"Do not seal the vessel during gas evolution.","difficulty":"easy"}', 20),
  ('cuso4_naoh', 'cuso4-naoh', 'Copper hydroxide precipitation', 'precipitation', 'CuSO4 + 2NaOH -> Cu(OH)2↓ + Na2SO4', 'Forms a blue precipitate.', '["CuSO4","NaOH"]', '["Cu(OH)2","Na2SO4"]', '["test-tube"]', false, '{"type":"precipitate","precipitate":"Cu(OH)2","precipitateColor":"blue","liquidColor":"cloudyBlue"}', 'cloudyBlue', 'blue', null, 'Avoid skin contact with copper salt solutions.', 'Copper(II) ions react with hydroxide ions to form insoluble copper(II) hydroxide.', 'medium', '{"id":"cuso4_naoh","name":"Copper hydroxide precipitation","title":"Copper hydroxide precipitation","reactants":["CuSO4","NaOH"],"equation":"CuSO4 + 2NaOH -> Cu(OH)2↓ + Na2SO4","type":"precipitation","filters":["precipitate","colorChange"],"expectedEffect":"blue Cu(OH)2 precipitate","products":["Cu(OH)2","Na2SO4"],"requiredEquipment":["test-tube"],"requiresHeating":false,"requiresWater":true,"allowedContainers":["test-tube","erlenmeyer","beaker","reaction-vessel"],"effect":"precipitate","visualEffect":{"type":"precipitate","precipitate":"Cu(OH)2","precipitateColor":"blue","liquidColor":"cloudyBlue"},"liquidColor":"cloudyBlue","message":"Blue copper hydroxide precipitate formed.","observation":"A blue precipitate appears.","explanation":"Cu2+ and OH- form insoluble Cu(OH)2.","safetyNote":"Avoid skin contact with copper salt solutions.","difficulty":"medium"}', 30),
  ('fecl3_naoh', 'fecl3-naoh', 'Iron hydroxide precipitation', 'precipitation', 'FeCl3 + 3NaOH -> Fe(OH)3↓ + 3NaCl', 'Forms a brown precipitate.', '["FeCl3","NaOH"]', '["Fe(OH)3","NaCl"]', '["test-tube"]', false, '{"type":"precipitate","precipitate":"Fe(OH)3","precipitateColor":"brown","liquidColor":"brownCloudy"}', 'brownCloudy', 'brown', null, 'Use gloves and avoid splashing.', 'Iron(III) ions react with hydroxide ions to form insoluble iron(III) hydroxide.', 'medium', '{"id":"fecl3_naoh","name":"Iron hydroxide precipitation","title":"Iron hydroxide precipitation","reactants":["FeCl3","NaOH"],"equation":"FeCl3 + 3NaOH -> Fe(OH)3↓ + 3NaCl","type":"precipitation","filters":["precipitate"],"expectedEffect":"brown Fe(OH)3 precipitate","products":["Fe(OH)3","NaCl"],"requiredEquipment":["test-tube"],"requiresHeating":false,"requiresWater":true,"allowedContainers":["test-tube","erlenmeyer","beaker","reaction-vessel"],"effect":"precipitate","visualEffect":{"type":"precipitate","precipitate":"Fe(OH)3","precipitateColor":"brown","liquidColor":"brownCloudy"},"liquidColor":"brownCloudy","message":"Brown iron hydroxide precipitate formed.","observation":"A brown precipitate appears.","explanation":"Fe3+ and OH- form insoluble Fe(OH)3.","safetyNote":"Use gloves and avoid splashing.","difficulty":"medium"}', 40),
  ('h2o_heat', 'h2o-heat', 'Heating water safely', 'heating', 'H2O(l) + heat -> H2O(g)', 'Safe demonstration of phase change with heating.', '["H2O"]', '["H2O(g)"]', '["beaker","hot-plate"]', true, '{"type":"steam","gas":"steam","liquidColor":"clear"}', 'clear', null, 'steam', 'Use low heat in the virtual lab. Avoid sealed vessels.', 'Heating water changes it from liquid to vapor; no new substance is formed.', 'easy', '{"id":"h2o_heat","name":"Heating water safely","title":"Heating water safely","reactants":["H2O"],"equation":"H2O(l) + heat -> H2O(g)","type":"heating","filters":["heat","steam"],"expectedEffect":"steam above the vessel","products":["H2O(g)"],"requiredEquipment":["beaker","hot-plate"],"requiresHeating":true,"requiresWater":false,"allowedContainers":["beaker","round-flask","reaction-vessel"],"effect":"steam","visualEffect":{"type":"steam","gas":"steam","liquidColor":"clear"},"liquidColor":"clear","message":"Water is heated and vapor appears.","observation":"Light vapor appears above the vessel.","explanation":"Heating water changes its physical state from liquid to vapor.","safetyNote":"Use low heat in the virtual lab. Avoid sealed vessels.","difficulty":"easy"}', 50),
  ('caco3_hcl', 'caco3-hcl', 'Carbonate and acid gas evolution', 'gas_evolution', 'CaCO3 + 2HCl -> CaCl2 + CO2↑ + H2O', 'Carbon dioxide gas is released from carbonate and acid.', '["CaCO3","HCl"]', '["CaCl2","CO2","H2O"]', '["erlenmeyer","gas-tube"]', false, '{"type":"gas","gas":"CO2","liquidColor":"clear","gasOutlet":true}', 'clear', null, 'CO2', 'Do not point the gas outlet toward the face.', 'Carbonate reacts with acid to form salt, water, and carbon dioxide.', 'easy', '{"id":"caco3_hcl","name":"Carbonate and acid gas evolution","title":"Carbonate and acid gas evolution","reactants":["CaCO3","HCl"],"equation":"CaCO3 + 2HCl -> CaCl2 + CO2↑ + H2O","type":"gas_evolution","filters":["gas"],"expectedEffect":"CO2 bubbles","products":["CaCl2","CO2","H2O"],"requiredEquipment":["erlenmeyer","gas-tube"],"requiresHeating":false,"requiresWater":false,"allowedContainers":["test-tube","erlenmeyer","beaker","reaction-vessel"],"effect":"gas","visualEffect":{"type":"gas","gas":"CO2","liquidColor":"clear","gasOutlet":true},"liquidColor":"clear","message":"Carbon dioxide is released.","observation":"Bubbles appear and gas leaves the vessel.","explanation":"Carbonate reacts with acid to form salt, water, and CO2.","safetyNote":"Do not point the gas outlet toward the face.","difficulty":"easy"}', 60),
  ('h2o_o2_heat', 'h2o-o2-heat', 'Heating water safely', 'heating', 'H2O(l) + heat -> H2O(g)', 'Safe demonstration of phase change with heating.', '["H2O","O2"]', '["H2O(g)"]', '["beaker","hot-plate"]', true, '{"type":"steam","gas":"steam","liquidColor":"clear"}', 'clear', null, 'steam', 'Use low heat in the virtual lab. Avoid sealed vessels.', 'Heating water changes its physical state from liquid to vapor.', 'easy', '{"id":"h2o_o2_heat","name":"Heating water safely","title":"Heating water safely","reactants":["H2O","O2"],"equation":"H2O(l) + heat -> H2O(g)","type":"heating","filters":["heat","steam"],"expectedEffect":"steam above the vessel","products":["H2O(g)"],"requiredEquipment":["beaker","hot-plate"],"requiresHeating":true,"requiresWater":false,"allowedContainers":["beaker","round-flask","reaction-vessel"],"effect":"steam","visualEffect":{"type":"steam","gas":"steam","liquidColor":"clear"},"liquidColor":"clear","message":"Water is heated and vapor appears.","observation":"Light vapor appears above the vessel.","explanation":"Heating water changes from liquid to vapor.","safetyNote":"Use low heat in the virtual lab. Avoid sealed vessels.","difficulty":"easy"}', 70)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  equation = EXCLUDED.equation,
  description = EXCLUDED.description,
  reactants = EXCLUDED.reactants,
  products = EXCLUDED.products,
  required_equipment = EXCLUDED.required_equipment,
  requires_heating = EXCLUDED.requires_heating,
  visual_effect = EXCLUDED.visual_effect,
  liquid_color = EXCLUDED.liquid_color,
  precipitate_color = EXCLUDED.precipitate_color,
  gas_label = EXCLUDED.gas_label,
  safety_note = EXCLUDED.safety_note,
  explanation = EXCLUDED.explanation,
  difficulty = EXCLUDED.difficulty,
  data = EXCLUDED.data,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO reaction_substances (reaction_id, substance_id, role, sort_order)
VALUES
  ('agno3_nacl','AgNO3','reactant',1), ('agno3_nacl','NaCl','reactant',2),
  ('hcl_nahco3','HCl','reactant',1), ('hcl_nahco3','NaHCO3','reactant',2),
  ('cuso4_naoh','CuSO4','reactant',1), ('cuso4_naoh','NaOH','reactant',2),
  ('fecl3_naoh','FeCl3','reactant',1), ('fecl3_naoh','NaOH','reactant',2),
  ('h2o_heat','H2O','reactant',1),
  ('caco3_hcl','CaCO3','reactant',1), ('caco3_hcl','HCl','reactant',2),
  ('h2o_o2_heat','H2O','reactant',1), ('h2o_o2_heat','O2','reactant',2)
ON CONFLICT (reaction_id, substance_id, role) DO UPDATE SET sort_order = EXCLUDED.sort_order;

INSERT INTO substances (id, slug, formula, name, type, category, safety_level, ions, data, sort_order)
VALUES
  ('BaCl2', 'bacl2', 'BaCl2', 'Barium chloride', 'salt', 'salt', 'high', '{"cation":"Ba2+","anion":"Cl-"}', '{"id":"BaCl2","name":"Barium chloride","formula":"BaCl2","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"high","safetyNote":"Barium salts are toxic. Virtual-only demo."}', 105),
  ('Cu', 'cu', 'Cu', 'Copper', 'metal', 'metal', 'low', '{}', '{"id":"Cu","name":"Copper","formula":"Cu","type":"metal","category":"metal","state":"solid","visualState":"solid","safetyLevel":"low"}', 108),
  ('Na2SO4', 'na2so4', 'Na2SO4', 'Sodium sulfate', 'salt', 'salt', 'low', '{"cation":"Na+","anion":"SO4^2-"}', '{"id":"Na2SO4","name":"Sodium sulfate","formula":"Na2SO4","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"low"}', 110),
  ('Pb(NO3)2', 'pbno3-2', 'Pb(NO3)2', 'Lead nitrate', 'salt', 'salt', 'high', '{"cation":"Pb2+","anion":"NO3-"}', '{"id":"Pb(NO3)2","name":"Lead nitrate","formula":"Pb(NO3)2","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"high","safetyNote":"Lead salts are toxic. Virtual-only demo."}', 120),
  ('KI', 'ki', 'KI', 'Potassium iodide', 'salt', 'salt', 'low', '{"cation":"K+","anion":"I-"}', '{"id":"KI","name":"Potassium iodide","formula":"KI","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"low"}', 130),
  ('NH4Cl', 'nh4cl', 'NH4Cl', 'Ammonium chloride', 'salt', 'salt', 'medium', '{"cation":"NH4+","anion":"Cl-"}', '{"id":"NH4Cl","name":"Ammonium chloride","formula":"NH4Cl","type":"salt","category":"salt","state":"aqueous","visualState":"solution","safetyLevel":"medium"}', 140)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  formula = EXCLUDED.formula,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  category = EXCLUDED.category,
  safety_level = EXCLUDED.safety_level,
  ions = EXCLUDED.ions,
  data = EXCLUDED.data,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO reactions (
  id, slug, title, type, equation, description, reactants, products, required_equipment,
  requires_heating, visual_effect, liquid_color, precipitate_color, gas_label,
  safety_note, explanation, difficulty, data, sort_order
)
VALUES
  ('bacl2_na2so4', 'bacl2-na2so4', 'Barium sulfate precipitation', 'precipitation', 'BaCl2 + Na2SO4 -> BaSO4↓ + 2NaCl', 'Forms a white BaSO4 precipitate.', '["BaCl2","Na2SO4"]', '["BaSO4","NaCl"]', '["test-tube"]', false, '{"type":"precipitate","precipitate":"BaSO4","precipitateColor":"white","liquidColor":"cloudy"}', 'cloudy', 'white', null, 'Barium salts are toxic. Virtual experiment only.', 'Barium ions and sulfate ions form insoluble barium sulfate.', 'easy', '{"id":"bacl2_na2so4","name":"Barium sulfate precipitation","title":"Barium sulfate precipitation","reactants":["BaCl2","Na2SO4"],"equation":"BaCl2 + Na2SO4 -> BaSO4↓ + 2NaCl","type":"precipitation","filters":["precipitate"],"expectedEffect":"white BaSO4 precipitate","products":["BaSO4","NaCl"],"requiredEquipment":["test-tube"],"requiresHeating":false,"requiresWater":true,"allowedContainers":["test-tube","beaker","reaction-vessel"],"effect":"precipitate","visualEffect":{"type":"precipitate","precipitate":"BaSO4","precipitateColor":"white","liquidColor":"cloudy"},"liquidColor":"cloudy","message":"White barium sulfate precipitate formed.","observation":"Fine white precipitate appears.","explanation":"Ba2+ and SO4^2- form insoluble BaSO4.","safetyNote":"Barium salts are toxic. Virtual experiment only.","difficulty":"easy"}', 80),
  ('pbno3_ki', 'pbno3-ki', 'Lead iodide precipitation', 'precipitation', 'Pb(NO3)2 + 2KI -> PbI2↓ + 2KNO3', 'Forms a yellow PbI2 precipitate.', '["Pb(NO3)2","KI"]', '["PbI2","KNO3"]', '["test-tube"]', false, '{"type":"precipitate","precipitate":"PbI2","precipitateColor":"yellow","liquidColor":"yellow"}', 'yellow', 'yellow', null, 'Lead salts are toxic. This is a virtual-only demonstration.', 'Lead ions and iodide ions form poorly soluble lead iodide.', 'medium', '{"id":"pbno3_ki","name":"Lead iodide precipitation","title":"Lead iodide precipitation","reactants":["Pb(NO3)2","KI"],"equation":"Pb(NO3)2 + 2KI -> PbI2↓ + 2KNO3","type":"precipitation","filters":["precipitate"],"expectedEffect":"yellow PbI2 precipitate","products":["PbI2","KNO3"],"requiredEquipment":["test-tube"],"requiresHeating":false,"requiresWater":true,"allowedContainers":["test-tube","beaker","reaction-vessel"],"effect":"precipitate","visualEffect":{"type":"precipitate","precipitate":"PbI2","precipitateColor":"yellow","liquidColor":"yellow"},"liquidColor":"yellow","message":"Yellow lead iodide precipitate formed.","observation":"Bright yellow precipitate appears.","explanation":"Pb2+ and I- form poorly soluble PbI2.","safetyNote":"Lead salts are toxic. This is a virtual-only demonstration.","difficulty":"medium"}', 90),
  ('nh4cl_naoh', 'nh4cl-naoh', 'Ammonia evolution', 'gas_evolution', 'NH4Cl + NaOH -> NH3↑ + NaCl + H2O', 'Releases ammonia gas when heated.', '["NH4Cl","NaOH"]', '["NH3","NaCl","H2O"]', '["test-tube","burner-tool"]', true, '{"type":"gas","gas":"NH3","liquidColor":"clear"}', 'clear', null, 'NH3', 'Virtual only. Ammonia irritates airways; do not inhale in real labs.', 'A base releases ammonia from an ammonium salt when heated.', 'medium', '{"id":"nh4cl_naoh","name":"Ammonia evolution","title":"Ammonia evolution","reactants":["NH4Cl","NaOH"],"equation":"NH4Cl + NaOH -> NH3↑ + NaCl + H2O","type":"gas_evolution","filters":["gas","heat"],"expectedEffect":"NH3 gas","products":["NH3","NaCl","H2O"],"requiredEquipment":["test-tube","burner-tool"],"requiresHeating":true,"requiresWater":true,"allowedContainers":["test-tube","beaker","reaction-vessel"],"effect":"gas","visualEffect":{"type":"gas","gas":"NH3","liquidColor":"clear"},"liquidColor":"clear","message":"Ammonia gas is released.","observation":"Gas label NH3 appears above the vessel.","explanation":"A base releases ammonia from an ammonium salt when heated.","safetyNote":"Virtual only. Ammonia irritates airways; do not inhale in real labs.","difficulty":"medium"}', 100),
  ('cu_agno3', 'cu-agno3', 'Copper and silver nitrate', 'displacement', 'Cu + 2AgNO3 -> Cu(NO3)2 + 2Ag', 'Silver coating forms and solution turns blue.', '["Cu","AgNO3"]', '["Cu(NO3)2","Ag"]', '["beaker"]', false, '{"type":"coating","precipitate":"Ag","precipitateColor":"silver","liquidColor":"silverBlue"}', 'silverBlue', 'silver', null, 'Silver nitrate stains skin; virtual experiment only.', 'Copper displaces silver from silver nitrate solution.', 'medium', '{"id":"cu_agno3","name":"Copper and silver nitrate","title":"Copper and silver nitrate","reactants":["Cu","AgNO3"],"equation":"Cu + 2AgNO3 -> Cu(NO3)2 + 2Ag","type":"displacement","filters":["colorChange","precipitate"],"expectedEffect":"silver coating and blue solution","products":["Cu(NO3)2","Ag"],"requiredEquipment":["beaker"],"requiresHeating":false,"requiresWater":true,"allowedContainers":["beaker","test-tube","reaction-vessel"],"effect":"coating","visualEffect":{"type":"coating","precipitate":"Ag","precipitateColor":"silver","liquidColor":"silverBlue"},"liquidColor":"silverBlue","message":"Silver metal deposits and the solution turns blue.","observation":"A silver coating appears while the liquid becomes blue.","explanation":"Copper displaces silver from silver nitrate solution.","safetyNote":"Silver nitrate stains skin; virtual experiment only.","difficulty":"medium"}', 110)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  equation = EXCLUDED.equation,
  description = EXCLUDED.description,
  reactants = EXCLUDED.reactants,
  products = EXCLUDED.products,
  required_equipment = EXCLUDED.required_equipment,
  requires_heating = EXCLUDED.requires_heating,
  visual_effect = EXCLUDED.visual_effect,
  liquid_color = EXCLUDED.liquid_color,
  precipitate_color = EXCLUDED.precipitate_color,
  gas_label = EXCLUDED.gas_label,
  safety_note = EXCLUDED.safety_note,
  explanation = EXCLUDED.explanation,
  difficulty = EXCLUDED.difficulty,
  data = EXCLUDED.data,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO reaction_substances (reaction_id, substance_id, role, sort_order)
VALUES
  ('bacl2_na2so4','BaCl2','reactant',1), ('bacl2_na2so4','Na2SO4','reactant',2),
  ('pbno3_ki','Pb(NO3)2','reactant',1), ('pbno3_ki','KI','reactant',2),
  ('nh4cl_naoh','NH4Cl','reactant',1), ('nh4cl_naoh','NaOH','reactant',2),
  ('cu_agno3','Cu','reactant',1), ('cu_agno3','AgNO3','reactant',2)
ON CONFLICT (reaction_id, substance_id, role) DO UPDATE SET sort_order = EXCLUDED.sort_order;
