window.ChemLabReactionData = {
  reagents: [
    { id: "HCl", name: "Соляная кислота", formula: "HCl", kind: "acid", category: "Кислоты", state: "solution", role: "кислотная среда, выделяет CO2 с карбонатами и H2 с активными металлами", color: "#dbeafe" },
    { id: "H2SO4", name: "Серная кислота", formula: "H2SO4", kind: "acid", category: "Кислоты", state: "solution", role: "сильная кислота для нейтрализации и демонстрации кислой среды", color: "#dbeafe" },
    { id: "NaOH", name: "Гидроксид натрия", formula: "NaOH", kind: "base", category: "Щёлочи", state: "solution", role: "сильная щёлочь, нейтрализует кислоты", color: "#dcfce7" },
    { id: "NaCl", name: "Хлорид натрия", formula: "NaCl", kind: "salt", category: "Соли", state: "solution", role: "источник хлорид-ионов для осаждения AgCl", color: "#f8fafc" },
    { id: "AgNO3", name: "Нитрат серебра", formula: "AgNO3", kind: "salt", category: "Соли", state: "solution", role: "реактив на хлорид-ионы, даёт белый осадок AgCl", color: "#f1f5f9" },
    { id: "CuSO4", name: "Сульфат меди(II)", formula: "CuSO4", kind: "salt", category: "Соли", state: "solution", role: "голубой раствор солей меди, показывает изменение состава раствора", color: "#93c5fd" },
    { id: "BaCl2", name: "Хлорид бария", formula: "BaCl2", kind: "salt", category: "Соли", state: "solution", role: "обнаруживает сульфат-ионы по белому осадку BaSO4", color: "#eef2ff" },
    { id: "Na2CO3", name: "Карбонат натрия", formula: "Na2CO3", kind: "carbonate", category: "Соли", state: "solution", role: "карбонат, выделяет CO2 при действии кислот", color: "#ecfeff" },
    { id: "KNO3", name: "Нитрат калия", formula: "KNO3", kind: "salt", category: "Соли", state: "solid", role: "соль-окислитель, пример вещества для нагревания", color: "#f8fafc" },
    { id: "CaCO3", name: "Карбонат кальция", formula: "CaCO3", kind: "carbonate", category: "Прочее", state: "solid", role: "твёрдый карбонат, с кислотой выделяет углекислый газ", color: "#f8fafc" },
    { id: "H2O", name: "Вода", formula: "H2O", kind: "water", category: "Прочее", state: "liquid", role: "растворитель, при нагревании образует пар", color: "#bfdbfe" },
    { id: "Zn", name: "Цинк", formula: "Zn", kind: "metal", category: "Металлы", state: "solid", role: "активный металл, вытесняет водород из кислоты", color: "#cbd5e1" },
    { id: "Mg", name: "Магний", formula: "Mg", kind: "metal", category: "Металлы", state: "solid", role: "горит в кислороде при нагревании яркой вспышкой", color: "#e2e8f0" },
    { id: "Fe", name: "Железо", formula: "Fe", kind: "metal", category: "Металлы", state: "solid", role: "металл для сравнения активности и коррозионных процессов", color: "#94a3b8" },
    { id: "Cu", name: "Медь", formula: "Cu", kind: "metal", category: "Металлы", state: "solid", role: "малоактивный металл, в HCl видимой реакции почти не даёт", color: "#fb923c" },
    { id: "O2", name: "Кислород", formula: "O2", kind: "gas", category: "Газы", state: "gas", role: "окислитель, поддерживает горение магния", color: "#bae6fd" },
    { id: "CO2", name: "Углекислый газ", formula: "CO2", kind: "gas", category: "Газы", state: "gas", role: "газ-продукт реакций кислот с карбонатами", color: "#e0f2fe" },
    { id: "NH3", name: "Аммиак", formula: "NH3", kind: "gas", category: "Газы", state: "gas", role: "щелочной газ с резким запахом, используется для демонстрации основных свойств", color: "#ccfbf1" }
  ],
  reactionRules: [
    {
      id: "caco3_hcl",
      name: "Получение углекислого газа",
      reactants: ["CaCO3", "HCl"],
      equation: "CaCO3 + 2HCl → CaCl2 + CO2↑ + H2O",
      type: "выделение газа",
      filters: ["gas"],
      expectedEffect: "пузырьки CO2 и газоотвод",
      products: ["CaCl2", "CO2", "H2O"],
      requiredEquipment: ["erlenmeyer", "gas-tube"],
      requiresHeating: false,
      requiresWater: false,
      allowedContainers: ["test-tube", "erlenmeyer", "beaker", "reaction-vessel"],
      effect: "gas",
      visualEffect: { type: "gas", gas: "CO2", solidReactant: "CaCO3", liquidColor: "clear", gasOutlet: true },
      liquidColor: "clear",
      message: "Реакция прошла успешно: выделяется CO2.",
      observation: "В сосуде появляются пузырьки, газ отводится через трубку.",
      explanation: "Карбонат кальция реагирует с кислотой: образуются соль, вода и углекислый газ.",
      safetyNote: "Кислоту добавляйте малыми порциями, газоотвод не направляйте к лицу."
    },
    {
      id: "agno3_nacl",
      name: "Осаждение хлорида серебра",
      reactants: ["AgNO3", "NaCl"],
      equation: "AgNO3 + NaCl → AgCl↓ + NaNO3",
      type: "осаждение",
      filters: ["precipitate"],
      expectedEffect: "белый осадок AgCl",
      products: ["AgCl", "NaNO3"],
      requiredEquipment: ["test-tube"],
      requiresHeating: false,
      requiresWater: true,
      allowedContainers: ["test-tube", "erlenmeyer", "beaker", "reaction-vessel"],
      effect: "precipitate",
      visualEffect: { type: "precipitate", precipitate: "AgCl", precipitateColor: "white", liquidColor: "cloudy" },
      liquidColor: "cloudy",
      message: "Реакция прошла успешно: образовался осадок AgCl.",
      observation: "Раствор мутнеет, на дне появляется белый осадок.",
      explanation: "Ионы Ag+ и Cl- образуют малорастворимый хлорид серебра.",
      safetyNote: "Соли серебра оставляют пятна, работайте аккуратно."
    },
    {
      id: "hcl_naoh",
      name: "Нейтрализация кислоты щёлочью",
      reactants: ["HCl", "NaOH"],
      equation: "HCl + NaOH → NaCl + H2O",
      type: "нейтрализация",
      filters: ["neutralization"],
      expectedEffect: "мягкое изменение оттенка и pH",
      products: ["NaCl", "H2O"],
      requiredEquipment: ["beaker"],
      requiresHeating: false,
      requiresWater: true,
      allowedContainers: ["test-tube", "erlenmeyer", "round-flask", "beaker", "reaction-vessel"],
      effect: "neutralization",
      visualEffect: { type: "neutralization", liquidColor: "neutral" },
      liquidColor: "neutral",
      message: "Нейтрализация прошла успешно.",
      observation: "Газ и осадок не появляются, раствор слегка меняет оттенок.",
      explanation: "Ионы H+ и OH- соединяются с образованием воды, остаётся раствор соли.",
      safetyNote: "Кислоты и щёлочи требуют очков и перчаток."
    },
    {
      id: "h2so4_naoh",
      name: "Нейтрализация серной кислоты",
      reactants: ["H2SO4", "NaOH"],
      equation: "H2SO4 + 2NaOH → Na2SO4 + 2H2O",
      type: "нейтрализация",
      filters: ["neutralization"],
      expectedEffect: "нейтрализация без газа и осадка",
      products: ["Na2SO4", "H2O"],
      requiredEquipment: ["beaker"],
      requiresHeating: false,
      requiresWater: true,
      allowedContainers: ["test-tube", "erlenmeyer", "beaker", "reaction-vessel"],
      effect: "neutralization",
      visualEffect: { type: "neutralization", liquidColor: "neutral" },
      liquidColor: "neutral",
      message: "Раствор нейтрализован.",
      observation: "Видимых бурных изменений нет, раствор слегка меняет оттенок.",
      explanation: "Двухосновная серная кислота нейтрализуется двумя порциями щёлочи.",
      safetyNote: "Серная кислота едкая, добавляйте её осторожно."
    },
    {
      id: "zn_hcl",
      name: "Цинк и соляная кислота",
      reactants: ["Zn", "HCl"],
      equation: "Zn + 2HCl → ZnCl2 + H2↑",
      type: "выделение газа",
      filters: ["gas", "metalReaction"],
      expectedEffect: "пузырьки H2 на металле",
      products: ["ZnCl2", "H2"],
      requiredEquipment: ["test-tube"],
      requiresHeating: false,
      requiresWater: false,
      allowedContainers: ["test-tube", "erlenmeyer", "round-flask", "beaker", "reaction-vessel"],
      effect: "metalReaction",
      visualEffect: { type: "metalReaction", gas: "H2", solidReactant: "Zn", liquidColor: "clear" },
      liquidColor: "clear",
      message: "Цинк вытесняет водород из кислоты.",
      observation: "На поверхности цинка появляются пузырьки водорода.",
      explanation: "Активный металл вытесняет водород из кислоты, образуя соль цинка.",
      safetyNote: "Водород горюч, не подносите открытое пламя."
    },
    {
      id: "mg_o2",
      name: "Горение магния в кислороде",
      reactants: ["Mg", "O2"],
      equation: "2Mg + O2 → 2MgO",
      type: "горение",
      filters: ["oxidation", "combustion", "heat"],
      expectedEffect: "яркая вспышка при нагревании",
      products: ["MgO"],
      requiredEquipment: ["round-flask", "burner-tool"],
      requiresHeating: true,
      requiresWater: false,
      allowedContainers: ["round-flask", "reaction-vessel"],
      effect: "heat",
      visualEffect: { type: "heat", flash: true, productSolid: "MgO" },
      liquidColor: "clear",
      message: "Магний загорелся и образовал оксид магния.",
      observation: "Появляется краткая яркая вспышка и белый продукт.",
      explanation: "При нагревании магний соединяется с кислородом, образуя MgO.",
      safetyNote: "Не смотрите прямо на яркое пламя магния."
    },
    {
      id: "h2o_o2_heat",
      name: "Нагревание воды до пара",
      reactants: ["H2O", "O2"],
      equation: "H2O + нагрев → H2O(пар)",
      type: "нагревание",
      filters: ["heat", "steam"],
      expectedEffect: "лёгкий пар над сосудом",
      products: ["H2O(пар)"],
      requiredEquipment: ["beaker", "burner-tool"],
      requiresHeating: true,
      requiresWater: false,
      allowedContainers: ["round-flask", "beaker", "reaction-vessel"],
      effect: "steam",
      visualEffect: { type: "steam", liquidColor: "clear" },
      liquidColor: "clear",
      message: "Вода нагревается и испаряется.",
      observation: "Над сосудом появляется пар.",
      explanation: "При нагревании вода переходит из жидкого состояния в газообразное.",
      safetyNote: "Осторожно: горячий пар может обжечь."
    },
    {
      id: "bacl2_h2so4",
      name: "Качественная реакция на сульфат-ионы",
      reactants: ["BaCl2", "H2SO4"],
      equation: "BaCl2 + H2SO4 → BaSO4↓ + 2HCl",
      type: "осаждение",
      filters: ["precipitate"],
      expectedEffect: "белый осадок BaSO4",
      products: ["BaSO4", "HCl"],
      requiredEquipment: ["test-tube"],
      requiresHeating: false,
      requiresWater: true,
      allowedContainers: ["test-tube", "beaker", "reaction-vessel"],
      effect: "precipitate",
      visualEffect: { type: "precipitate", precipitate: "BaSO4", precipitateColor: "white", liquidColor: "cloudy" },
      liquidColor: "cloudy",
      message: "Сульфат-ионы обнаружены по белому осадку.",
      observation: "Раствор мутнеет, на дне оседают белые частицы.",
      explanation: "Ba2+ образует с SO4 2- малорастворимый сульфат бария.",
      safetyNote: "Раствор бария токсичен, не допускайте попадания на кожу."
    },
    {
      id: "na2co3_hcl",
      name: "Карбонат натрия и кислота",
      reactants: ["Na2CO3", "HCl"],
      equation: "Na2CO3 + 2HCl → 2NaCl + CO2↑ + H2O",
      type: "выделение газа",
      filters: ["gas"],
      expectedEffect: "активные пузырьки CO2",
      products: ["NaCl", "CO2", "H2O"],
      requiredEquipment: ["beaker"],
      requiresHeating: false,
      requiresWater: true,
      allowedContainers: ["test-tube", "erlenmeyer", "beaker", "reaction-vessel"],
      effect: "gas",
      visualEffect: { type: "gas", gas: "CO2", liquidColor: "clear" },
      liquidColor: "clear",
      message: "Карбонат натрия выделил CO2.",
      observation: "Появляются пузырьки углекислого газа.",
      explanation: "Карбонаты в кислоте разлагаются с выделением CO2.",
      safetyNote: "Не закрывайте сосуд герметично при выделении газа."
    },
    {
      id: "cuso4_naoh",
      title: "Осаждение гидроксида меди(II)",
      name: "Осаждение гидроксида меди(II)",
      reactants: ["CuSO4", "NaOH"],
      equation: "CuSO4 + 2NaOH → Cu(OH)2↓ + Na2SO4",
      type: "осаждение",
      filters: ["precipitate", "colorChange"],
      expectedEffect: "голубой осадок Cu(OH)2",
      products: ["Cu(OH)2", "Na2SO4"],
      requiredEquipment: ["test-tube"],
      requiresHeating: false,
      requiresWater: true,
      allowedContainers: ["test-tube", "erlenmeyer", "beaker", "reaction-vessel"],
      effect: "precipitate",
      visualEffect: { type: "precipitate", precipitate: "Cu(OH)2", precipitateColor: "blue", liquidColor: "cloudyBlue" },
      liquidColor: "cloudyBlue",
      message: "Образовался голубой осадок гидроксида меди(II).",
      observation: "Голубой раствор мутнеет, на дне появляется голубой студенистый осадок.",
      explanation: "Ионы Cu2+ соединяются с OH- и образуют малорастворимый Cu(OH)2.",
      safetyNote: "Растворы солей меди не пробуйте на вкус и не допускайте попадания на кожу."
    }
  ]
};

const reactionMeta = {
  caco3_hcl: ["легкий", "gas"],
  agno3_nacl: ["легкий", "precipitate"],
  hcl_naoh: ["средний", "neutralization"],
  h2so4_naoh: ["средний", "neutralization"],
  zn_hcl: ["средний", "gas"],
  mg_o2: ["сложный", "combustion"],
  h2o_o2_heat: ["легкий", "heat"],
  bacl2_h2so4: ["средний", "precipitate"],
  na2co3_hcl: ["легкий", "gas"],
  cuso4_naoh: ["средний", "precipitate"]
};

window.ChemLabReactionData.reactionRules.forEach(function (reaction) {
  reaction.title = reaction.title || reaction.name;
  reaction.difficulty = reaction.difficulty || reactionMeta[reaction.id]?.[0] || "средний";
  reaction.category = reaction.category || reactionMeta[reaction.id]?.[1] || reaction.filters?.[0] || "reaction";
});

window.ChemLabReactionData.reactions = window.ChemLabReactionData.reactionRules;

(function () {
  const moreReagents = [
    { id: "NaHCO3", name: "Гидрокарбонат натрия", formula: "NaHCO3", kind: "salt", category: "Соли", state: "solution", role: "гидрокарбонат для опытов с выделением CO2", color: "#f8fafc" },
    { id: "FeCl3", name: "Хлорид железа(III)", formula: "FeCl3", kind: "salt", category: "Соли", state: "solution", role: "соль железа для бурого осадка гидроксида", color: "#fde68a" },
    { id: "Na2SO4", name: "Сульфат натрия", formula: "Na2SO4", kind: "salt", category: "Соли", state: "solution", role: "источник сульфат-ионов", color: "#f8fafc" },
    { id: "Pb(NO3)2", name: "Нитрат свинца(II)", formula: "Pb(NO3)2", kind: "salt", category: "Соли", state: "solution", role: "виртуальная токсичная соль для опыта с йодидом", color: "#f8fafc" },
    { id: "KI", name: "Йодид калия", formula: "KI", kind: "salt", category: "Соли", state: "solution", role: "источник йодид-ионов", color: "#fef3c7" },
    { id: "NH4Cl", name: "Хлорид аммония", formula: "NH4Cl", kind: "salt", category: "Соли", state: "solution", role: "аммонийная соль для виртуального получения аммиака", color: "#f8fafc" },
    { id: "Ca(OH)2", name: "Известковая вода", formula: "Ca(OH)2", kind: "base", category: "Щёлочи", state: "solution", role: "качественный реактив на углекислый газ", color: "#f8fafc" },
    { id: "CaCl2", name: "Хлорид кальция", formula: "CaCl2", kind: "salt", category: "Соли", state: "solution", role: "источник ионов кальция для осаждения карбоната", color: "#f8fafc" },
    { id: "AlCl3", name: "Хлорид алюминия", formula: "AlCl3", kind: "salt", category: "Соли", state: "solution", role: "соль алюминия для белого студенистого осадка", color: "#eef2ff" },
    { id: "CuO", name: "Оксид меди(II)", formula: "CuO", kind: "oxide", category: "Прочее", state: "solid", role: "чёрный оксид для реакции с кислотой", color: "#1f2937" },
    { id: "Na2S2O3", name: "Тиосульфат натрия", formula: "Na2S2O3", kind: "salt", category: "Соли", state: "solution", role: "реактив для демонстрации помутнения серы", color: "#f8fafc" },
    { id: "H2O2", name: "Пероксид водорода", formula: "H2O2", kind: "oxidizer", category: "Прочее", state: "solution", role: "окислитель для выделения кислорода", color: "#e0f2fe" }
  ];
  const moreReactions = [
    { id: "hcl_nahco3", name: "Кислота и гидрокарбонат: выделение газа", reactants: ["HCl","NaHCO3"], equation: "HCl + NaHCO3 → NaCl + CO2↑ + H2O", type: "выделение газа", filters: ["gas"], expectedEffect: "пузырьки CO2", products: ["NaCl","CO2","H2O"], requiredEquipment: ["beaker"], requiresHeating: false, requiresWater: true, allowedContainers: ["test-tube","erlenmeyer","beaker","reaction-vessel"], effect: "gas", visualEffect: { type: "gas", gas: "CO2", liquidColor: "clear" }, liquidColor: "clear", message: "Выделяется углекислый газ.", observation: "В сосуде появляются пузырьки CO2.", explanation: "Кислота реагирует с гидрокарбонатом с образованием соли, воды и углекислого газа.", safetyNote: "Не закрывайте сосуд герметично при выделении газа." },
    { id: "fecl3_naoh", name: "Осаждение гидроксида железа(III)", reactants: ["FeCl3","NaOH"], equation: "FeCl3 + 3NaOH → Fe(OH)3↓ + 3NaCl", type: "осаждение", filters: ["precipitate"], expectedEffect: "бурый осадок Fe(OH)3", products: ["Fe(OH)3","NaCl"], requiredEquipment: ["test-tube"], requiresHeating: false, requiresWater: true, allowedContainers: ["test-tube","erlenmeyer","beaker","reaction-vessel"], effect: "precipitate", visualEffect: { type: "precipitate", precipitate: "Fe(OH)3", precipitateColor: "brown", liquidColor: "brownCloudy" }, liquidColor: "brownCloudy", message: "Образовался бурый осадок гидроксида железа(III).", observation: "В растворе появляется бурый осадок.", explanation: "Ионы Fe3+ и OH- образуют малорастворимый гидроксид железа(III).", safetyNote: "Виртуальная демонстрация малыми объёмами." },
    { id: "bacl2_na2so4", name: "Осаждение сульфата бария", reactants: ["BaCl2","Na2SO4"], equation: "BaCl2 + Na2SO4 → BaSO4↓ + 2NaCl", type: "осаждение", filters: ["precipitate"], expectedEffect: "белый осадок BaSO4", products: ["BaSO4","NaCl"], requiredEquipment: ["test-tube"], requiresHeating: false, requiresWater: true, allowedContainers: ["test-tube","beaker","reaction-vessel"], effect: "precipitate", visualEffect: { type: "precipitate", precipitate: "BaSO4", precipitateColor: "white", liquidColor: "cloudy" }, liquidColor: "cloudy", message: "Образовался белый осадок сульфата бария.", observation: "Появляется мелкий белый осадок.", explanation: "Ионы Ba2+ и SO4 2- образуют нерастворимый BaSO4.", safetyNote: "Соли бария токсичны; опыт только виртуальный." },
    { id: "pbno3_ki", name: "Жёлтый осадок йодида свинца", reactants: ["Pb(NO3)2","KI"], equation: "Pb(NO3)2 + 2KI → PbI2↓ + 2KNO3", type: "осаждение", filters: ["precipitate"], expectedEffect: "жёлтый осадок PbI2", products: ["PbI2","KNO3"], requiredEquipment: ["test-tube"], requiresHeating: false, requiresWater: true, allowedContainers: ["test-tube","beaker","reaction-vessel"], effect: "precipitate", visualEffect: { type: "precipitate", precipitate: "PbI2", precipitateColor: "yellow", liquidColor: "yellow" }, liquidColor: "yellow", message: "Образовался ярко-жёлтый осадок йодида свинца.", observation: "Раствор быстро мутнеет, появляется жёлтый осадок.", explanation: "Ионы Pb2+ и I- образуют малорастворимый PbI2.", safetyNote: "Соли свинца токсичны. Это виртуальная демонстрация." },
    { id: "nh4cl_naoh", name: "Получение аммиака при нагревании", reactants: ["NH4Cl","NaOH"], equation: "NH4Cl + NaOH → NH3↑ + NaCl + H2O", type: "выделение газа", filters: ["gas","heat"], expectedEffect: "газ NH3", products: ["NH3","NaCl","H2O"], requiredEquipment: ["test-tube","burner-tool"], requiresHeating: true, requiresWater: true, allowedContainers: ["test-tube","beaker","reaction-vessel"], effect: "gas", visualEffect: { type: "gas", gas: "NH3", liquidColor: "clear" }, liquidColor: "clear", message: "При нагревании выделяется аммиак.", observation: "Над сосудом появляется подпись NH3.", explanation: "Щёлочь вытесняет аммиак из соли аммония при нагревании.", safetyNote: "Виртуально. Аммиак раздражает дыхательные пути." },
    { id: "cu_agno3", name: "Медь и нитрат серебра", reactants: ["Cu","AgNO3"], equation: "Cu + 2AgNO3 → Cu(NO3)2 + 2Ag", type: "замещение", filters: ["colorChange","precipitate"], expectedEffect: "серебристый налёт и голубой раствор", products: ["Cu(NO3)2","Ag"], requiredEquipment: ["beaker"], requiresHeating: false, requiresWater: true, allowedContainers: ["beaker","test-tube","reaction-vessel"], effect: "coating", visualEffect: { type: "coating", precipitate: "Ag", precipitateColor: "silver", liquidColor: "silverBlue" }, liquidColor: "silverBlue", message: "Серебро выделяется на меди, раствор становится голубым.", observation: "Появляется серебристый налёт, жидкость приобретает голубой оттенок.", explanation: "Медь вытесняет серебро из раствора нитрата серебра.", safetyNote: "Нитрат серебра оставляет пятна; опыт виртуальный." },
    { id: "co2_limewater", name: "Помутнение известковой воды", reactants: ["CO2","Ca(OH)2"], equation: "CO2 + Ca(OH)2 → CaCO3↓ + H2O", type: "осаждение", filters: ["precipitate","gas"], expectedEffect: "белое помутнение CaCO3", products: ["CaCO3","H2O"], requiredEquipment: ["beaker","gas-tube"], requiresHeating: false, requiresWater: true, allowedContainers: ["test-tube","beaker","reaction-vessel"], effect: "precipitate", visualEffect: { type: "precipitate", precipitate: "CaCO3", precipitateColor: "white", liquidColor: "cloudy" }, liquidColor: "cloudy", message: "Известковая вода помутнела.", observation: "Появляется белая взвесь карбоната кальция.", explanation: "CO2 реагирует с гидроксидом кальция и образует малорастворимый CaCO3.", safetyNote: "Виртуальный качественный опыт на CO2." },
    { id: "ca_cl2_na2co3", name: "Осаждение карбоната кальция", reactants: ["CaCl2","Na2CO3"], equation: "CaCl2 + Na2CO3 → CaCO3↓ + 2NaCl", type: "осаждение", filters: ["precipitate"], expectedEffect: "белый осадок CaCO3", products: ["CaCO3","NaCl"], requiredEquipment: ["test-tube"], requiresHeating: false, requiresWater: true, allowedContainers: ["test-tube","beaker","reaction-vessel"], effect: "precipitate", visualEffect: { type: "precipitate", precipitate: "CaCO3", precipitateColor: "white", liquidColor: "cloudy" }, liquidColor: "cloudy", message: "Образовался белый осадок карбоната кальция.", observation: "Раствор становится мутным, на дне собирается белый осадок.", explanation: "Ионы Ca2+ и CO3 2- образуют малорастворимый CaCO3.", safetyNote: "Безопасная виртуальная демонстрация осаждения." },
    { id: "alcl3_naoh", name: "Белый осадок гидроксида алюминия", reactants: ["AlCl3","NaOH"], equation: "AlCl3 + 3NaOH → Al(OH)3↓ + 3NaCl", type: "осаждение", filters: ["precipitate"], expectedEffect: "белый студенистый осадок", products: ["Al(OH)3","NaCl"], requiredEquipment: ["test-tube"], requiresHeating: false, requiresWater: true, allowedContainers: ["test-tube","beaker","reaction-vessel"], effect: "precipitate", visualEffect: { type: "precipitate", precipitate: "Al(OH)3", precipitateColor: "white", liquidColor: "cloudy" }, liquidColor: "cloudy", message: "Образовался белый студенистый осадок.", observation: "В растворе появляется белая желеобразная взвесь.", explanation: "Ионы Al3+ реагируют с OH- с образованием гидроксида алюминия.", safetyNote: "Щёлочь едкая; в реальной работе нужны очки." },
    { id: "cuo_hcl", name: "Растворение оксида меди в кислоте", reactants: ["CuO","HCl"], equation: "CuO + 2HCl → CuCl2 + H2O", type: "изменение цвета", filters: ["colorChange"], expectedEffect: "чёрный порошок растворяется, раствор зеленеет", products: ["CuCl2","H2O"], requiredEquipment: ["beaker"], requiresHeating: false, requiresWater: true, allowedContainers: ["beaker","test-tube","reaction-vessel"], effect: "colorChange", visualEffect: { type: "colorChange", liquidColor: "green" }, liquidColor: "green", message: "Оксид меди растворился с образованием соли меди.", observation: "Чёрный порошок исчезает, раствор становится зеленоватым.", explanation: "Основный оксид реагирует с кислотой с образованием соли и воды.", safetyNote: "Кислоту добавляют небольшими порциями." },
    { id: "thiosulfate_hcl", name: "Помутнение тиосульфата натрия", reactants: ["Na2S2O3","HCl"], equation: "Na2S2O3 + 2HCl → 2NaCl + SO2↑ + S↓ + H2O", type: "осаждение и газ", filters: ["precipitate","gas"], expectedEffect: "жёлтое помутнение серы и газ SO2", products: ["NaCl","SO2","S","H2O"], requiredEquipment: ["beaker"], requiresHeating: false, requiresWater: true, allowedContainers: ["beaker","test-tube","reaction-vessel"], effect: "precipitate", visualEffect: { type: "precipitate", precipitate: "S", precipitateColor: "yellow", liquidColor: "yellow" }, liquidColor: "yellow", message: "Раствор помутнел из-за выделения серы.", observation: "Появляется жёлтая мутность, реакция сопровождается выделением газа.", explanation: "Тиосульфат в кислой среде разлагается с образованием серы и SO2.", safetyNote: "SO2 раздражает дыхательные пути; опыт виртуальный." },
    { id: "h2o2_heat", name: "Разложение пероксида водорода", reactants: ["H2O2","O2"], equation: "2H2O2 → 2H2O + O2↑", type: "выделение газа", filters: ["gas","oxidation"], expectedEffect: "пузырьки кислорода", products: ["H2O","O2"], requiredEquipment: ["test-tube"], requiresHeating: false, requiresWater: true, allowedContainers: ["test-tube","beaker","reaction-vessel"], effect: "gas", visualEffect: { type: "gas", gas: "O2", liquidColor: "clear" }, liquidColor: "clear", message: "Пероксид водорода разлагается с выделением кислорода.", observation: "В жидкости быстро появляются пузырьки O2.", explanation: "Пероксид водорода нестабилен и разлагается на воду и кислород.", safetyNote: "Виртуальная демонстрация; концентрированный пероксид опасен." },
    { id: "fe_hcl", name: "Железо и соляная кислота", reactants: ["Fe","HCl"], equation: "Fe + 2HCl → FeCl2 + H2↑", type: "выделение газа", filters: ["gas","metalReaction"], expectedEffect: "медленное выделение H2", products: ["FeCl2","H2"], requiredEquipment: ["test-tube"], requiresHeating: false, requiresWater: false, allowedContainers: ["test-tube","beaker","reaction-vessel"], effect: "metalReaction", visualEffect: { type: "metalReaction", gas: "H2", solidReactant: "Fe", liquidColor: "green" }, liquidColor: "green", message: "Железо медленно вытесняет водород из кислоты.", observation: "На поверхности железа появляются пузырьки, раствор слегка зеленеет.", explanation: "Железо активнее водорода и образует соль FeCl2.", safetyNote: "Водород горюч; в реальной лаборатории не подносить пламя." }
  ];
  moreReagents.forEach(item => {
    const i = window.ChemLabReactionData.reagents.findIndex(existing => existing.id === item.id);
    if (i >= 0) window.ChemLabReactionData.reagents[i] = Object.assign({}, window.ChemLabReactionData.reagents[i], item);
    else window.ChemLabReactionData.reagents.push(item);
  });
  moreReactions.forEach(item => {
    item.title = item.title || item.name;
    item.difficulty = item.difficulty || "средний";
    item.category = item.category || item.filters?.[0] || item.type;
    const i = window.ChemLabReactionData.reactionRules.findIndex(existing => existing.id === item.id);
    if (i >= 0) window.ChemLabReactionData.reactionRules[i] = Object.assign({}, window.ChemLabReactionData.reactionRules[i], item);
    else window.ChemLabReactionData.reactionRules.push(item);
  });
  window.ChemLabReactionData.reactions = window.ChemLabReactionData.reactionRules;
})();
