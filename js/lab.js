(function () {
  "use strict";

  const equipment = [
    { id: "test-tube", label: "Пробирка", description: "Небольшой сосуд для микрореакций и нагревания малых объёмов.", icon: "tube", category: "glassware", isContainer: true },
    { id: "tube-rack", label: "Штатив для пробирок", description: "Удерживает несколько пробирок вертикально.", icon: "rack", category: "tools", isContainer: false },
    { id: "erlenmeyer", label: "Коническая колба", description: "Удобна для выделения газа и перемешивания растворов.", icon: "flask", category: "glassware", isContainer: true },
    { id: "round-flask", label: "Круглодонная колба", description: "Подходит для равномерного нагревания.", icon: "round", category: "glassware", isContainer: true },
    { id: "beaker", label: "Химический стакан", description: "Основной сосуд для растворов и нейтрализации.", icon: "beaker", category: "glassware", isContainer: true },
    { id: "cylinder", label: "Мерный цилиндр", description: "Измерение объёма жидкости.", icon: "cylinder", category: "measure", isContainer: false },
    { id: "pipette-tool", label: "Пипетка", description: "Добавление растворов каплями.", icon: "pipette-icon", category: "tools", isContainer: false },
    { id: "funnel", label: "Воронка", description: "Переливание и фильтрование.", icon: "funnel", category: "tools", isContainer: false },
    { id: "glass-rod", label: "Стеклянная палочка", description: "Перемешивание растворов.", icon: "rod", category: "tools", isContainer: false },
    { id: "spatula", label: "Ложечка / шпатель", description: "Перенос твёрдых веществ.", icon: "spatula", category: "tools", isContainer: false },
    { id: "evaporating-dish", label: "Чашка для выпаривания", description: "Выпаривание растворов при нагревании.", icon: "dish", category: "glassware", isContainer: true },
    { id: "clamp", label: "Зажим", description: "Фиксация сосуда или трубки на штативе.", icon: "clamp", category: "tools", isContainer: false },
    { id: "holder", label: "Держатель", description: "Безопасно удерживает пробирку при переносе и нагревании.", icon: "clamp", category: "tools", isContainer: false },
    { id: "gas-tube", label: "Газоотводная трубка", description: "Отвод газа в принимающий сосуд.", icon: "gas-tube", category: "tools", isContainer: false },
    { id: "burner-tool", label: "Спиртовка", description: "Открытое пламя для реакций, требующих нагрева.", icon: "burner", category: "heating", isContainer: false, isHeater: true },
    { id: "hot-plate", label: "Нагревательная плитка", description: "Ровный нагрев без открытого пламени.", icon: "hotplate", category: "heating", isContainer: false, isHeater: true },
    { id: "thermometer", label: "Термометр", description: "Контроль температуры опыта.", icon: "thermometer", category: "measure", isContainer: false },
    { id: "ph-meter", label: "Индикатор pH", description: "Оценка кислотности раствора.", icon: "ph", category: "measure", isContainer: false },
    { id: "timer", label: "Таймер", description: "Фиксация времени реакции.", icon: "timer", category: "measure", isContainer: false },
    { id: "mortar-tool", label: "Ступка", description: "Измельчение твёрдых веществ.", icon: "mortar-icon", category: "other", isContainer: false },
    { id: "petri", label: "Чашка Петри", description: "Наблюдение осадков и малых проб.", icon: "petri", category: "other", isContainer: true }
  ];

  const elementTypes = [
    { id: "all", label: "Все" },
    { id: "metal", label: "Металлы" },
    { id: "nonmetal", label: "Неметаллы" },
    { id: "alkali", label: "Щелочные" },
    { id: "alkaline", label: "Щёлочноземельные" },
    { id: "transition", label: "Переходные металлы" },
    { id: "halogen", label: "Галогены" },
    { id: "noble", label: "Благородные газы" },
    { id: "metalloid", label: "Металлоиды" }
  ];

  const elements = [
    { n: 1, s: "H", name: "Водород", mass: "1.008", group: 1, period: 1, type: "nonmetal", description: "Самый лёгкий элемент, образует воду и множество кислот.", use: "Топливные элементы, синтез аммиака.", properties: "Газ, очень лёгкий, горючий." },
    { n: 2, s: "He", name: "Гелий", mass: "4.0026", group: 18, period: 1, type: "noble", description: "Инертный благородный газ.", use: "Криогеника, аэростаты, защитные атмосферы.", properties: "Газ, химически малоактивен." },
    { n: 3, s: "Li", name: "Литий", mass: "6.94", group: 1, period: 2, type: "alkali", description: "Лёгкий щелочной металл.", use: "Аккумуляторы, сплавы.", properties: "Мягкий металл, реагирует с водой." },
    { n: 4, s: "Be", name: "Бериллий", mass: "9.0122", group: 2, period: 2, type: "alkaline", description: "Лёгкий прочный металл.", use: "Сплавы, приборостроение.", properties: "Твёрдый, токсичные соединения." },
    { n: 5, s: "B", name: "Бор", mass: "10.81", group: 13, period: 2, type: "metalloid", description: "Металлоид, важен для боросиликатного стекла.", use: "Стекло, моющие средства, полупроводники.", properties: "Твёрдый, тугоплавкий." },
    { n: 6, s: "C", name: "Углерод", mass: "12.011", group: 14, period: 2, type: "nonmetal", description: "Основа органической химии.", use: "Графит, алмазы, материалы, биохимия.", properties: "Имеет аллотропные формы." },
    { n: 7, s: "N", name: "Азот", mass: "14.007", group: 15, period: 2, type: "nonmetal", description: "Главный компонент воздуха.", use: "Удобрения, инертная атмосфера.", properties: "Газ, малоактивен при обычных условиях." },
    { n: 8, s: "O", name: "Кислород", mass: "15.999", group: 16, period: 2, type: "nonmetal", description: "Поддерживает дыхание и горение.", use: "Медицина, металлургия, окисление.", properties: "Газ-окислитель." },
    { n: 9, s: "F", name: "Фтор", mass: "18.998", group: 17, period: 2, type: "halogen", description: "Самый активный галоген.", use: "Фторполимеры, стоматология.", properties: "Очень реакционноспособный газ." },
    { n: 10, s: "Ne", name: "Неон", mass: "20.180", group: 18, period: 2, type: "noble", description: "Благородный газ.", use: "Световые вывески, лазеры.", properties: "Инертен, светится в разряде." },
    { n: 11, s: "Na", name: "Натрий", mass: "22.990", group: 1, period: 3, type: "alkali", description: "Активный щелочной металл.", use: "Соли, теплоносители, химический синтез.", properties: "Мягкий, бурно реагирует с водой." },
    { n: 12, s: "Mg", name: "Магний", mass: "24.305", group: 2, period: 3, type: "alkaline", description: "Лёгкий металл, ярко горит.", use: "Сплавы, пиротехника, медицина.", properties: "Серебристый, активен при нагреве." },
    { n: 13, s: "Al", name: "Алюминий", mass: "26.982", group: 13, period: 3, type: "metal", description: "Лёгкий коррозионностойкий металл.", use: "Авиация, упаковка, строительство.", properties: "Покрывается оксидной плёнкой." },
    { n: 14, s: "Si", name: "Кремний", mass: "28.085", group: 14, period: 3, type: "metalloid", description: "Полупроводник и основа силикатов.", use: "Микроэлектроника, стекло, цемент.", properties: "Твёрдый, полупроводниковые свойства." },
    { n: 15, s: "P", name: "Фосфор", mass: "30.974", group: 15, period: 3, type: "nonmetal", description: "Важен для живых организмов и удобрений.", use: "Удобрения, спички, химия фосфатов.", properties: "Имеет несколько аллотропных форм." },
    { n: 16, s: "S", name: "Сера", mass: "32.06", group: 16, period: 3, type: "nonmetal", description: "Неметалл жёлтого цвета.", use: "Серная кислота, вулканизация каучука.", properties: "Горит с образованием SO2." },
    { n: 17, s: "Cl", name: "Хлор", mass: "35.45", group: 17, period: 3, type: "halogen", description: "Активный галоген.", use: "Дезинфекция, производство HCl и пластмасс.", properties: "Ядовитый газ, окислитель." },
    { n: 18, s: "Ar", name: "Аргон", mass: "39.948", group: 18, period: 3, type: "noble", description: "Инертный газ воздуха.", use: "Сварка, лампы, защитная атмосфера.", properties: "Химически малоактивен." },
    { n: 19, s: "K", name: "Калий", mass: "39.098", group: 1, period: 4, type: "alkali", description: "Очень активный щелочной металл.", use: "Удобрения, соли калия.", properties: "Бурно реагирует с водой." },
    { n: 20, s: "Ca", name: "Кальций", mass: "40.078", group: 2, period: 4, type: "alkaline", description: "Щёлочноземельный металл.", use: "Строительные материалы, металлургия.", properties: "Образует карбонаты и сульфаты." },
    { n: 26, s: "Fe", name: "Железо", mass: "55.845", group: 8, period: 4, type: "transition", description: "Один из важнейших конструкционных металлов.", use: "Сталь, машины, строительство.", properties: "Магнитится, окисляется во влажном воздухе." },
    { n: 29, s: "Cu", name: "Медь", mass: "63.546", group: 11, period: 4, type: "transition", description: "Красноватый металл с высокой проводимостью.", use: "Провода, сплавы, теплообменники.", properties: "Пластичная, проводит ток и тепло." },
    { n: 30, s: "Zn", name: "Цинк", mass: "65.38", group: 12, period: 4, type: "transition", description: "Металл средней активности.", use: "Оцинковка, батарейки, сплавы.", properties: "Реагирует с кислотами с выделением H2." },
    { n: 35, s: "Br", name: "Бром", mass: "79.904", group: 17, period: 4, type: "halogen", description: "Жидкий галоген при комнатной температуре.", use: "Органический синтез, фотоматериалы.", properties: "Летучая красно-бурая жидкость." },
    { n: 36, s: "Kr", name: "Криптон", mass: "83.798", group: 18, period: 4, type: "noble", description: "Тяжёлый благородный газ.", use: "Лампы, лазеры.", properties: "Инертен." },
    { n: 47, s: "Ag", name: "Серебро", mass: "107.87", group: 11, period: 5, type: "transition", description: "Благородный металл, образует малорастворимый AgCl.", use: "Электроника, ювелирные изделия, реактивы.", properties: "Высокая проводимость, светочувствительные соли." },
    { n: 53, s: "I", name: "Иод", mass: "126.90", group: 17, period: 5, type: "halogen", description: "Галоген, образует фиолетовые пары.", use: "Антисептики, анализ крахмала.", properties: "Твёрдый, сублимирует." },
    { n: 56, s: "Ba", name: "Барий", mass: "137.33", group: 2, period: 6, type: "alkaline", description: "Щёлочноземельный металл, соли дают осадки с сульфатами.", use: "Аналитическая химия, специальные стекла.", properties: "Соединения часто токсичны." }
  ];

  elementTypes.push({ id: "lanthanoid", label: "Лантаноиды" }, { id: "actinoid", label: "Актиноиды" });

  const fullElementRows = [
    [1,"H","Водород","1.008",1,1,"nonmetal"],[2,"He","Гелий","4.0026",18,1,"noble"],
    [3,"Li","Литий","6.94",1,2,"alkali"],[4,"Be","Бериллий","9.0122",2,2,"alkaline"],[5,"B","Бор","10.81",13,2,"metalloid"],[6,"C","Углерод","12.011",14,2,"nonmetal"],[7,"N","Азот","14.007",15,2,"nonmetal"],[8,"O","Кислород","15.999",16,2,"nonmetal"],[9,"F","Фтор","18.998",17,2,"halogen"],[10,"Ne","Неон","20.180",18,2,"noble"],
    [11,"Na","Натрий","22.990",1,3,"alkali"],[12,"Mg","Магний","24.305",2,3,"alkaline"],[13,"Al","Алюминий","26.982",13,3,"metal"],[14,"Si","Кремний","28.085",14,3,"metalloid"],[15,"P","Фосфор","30.974",15,3,"nonmetal"],[16,"S","Сера","32.06",16,3,"nonmetal"],[17,"Cl","Хлор","35.45",17,3,"halogen"],[18,"Ar","Аргон","39.948",18,3,"noble"],
    [19,"K","Калий","39.098",1,4,"alkali"],[20,"Ca","Кальций","40.078",2,4,"alkaline"],[21,"Sc","Скандий","44.956",3,4,"transition"],[22,"Ti","Титан","47.867",4,4,"transition"],[23,"V","Ванадий","50.942",5,4,"transition"],[24,"Cr","Хром","51.996",6,4,"transition"],[25,"Mn","Марганец","54.938",7,4,"transition"],[26,"Fe","Железо","55.845",8,4,"transition"],[27,"Co","Кобальт","58.933",9,4,"transition"],[28,"Ni","Никель","58.693",10,4,"transition"],[29,"Cu","Медь","63.546",11,4,"transition"],[30,"Zn","Цинк","65.38",12,4,"transition"],[31,"Ga","Галлий","69.723",13,4,"metal"],[32,"Ge","Германий","72.630",14,4,"metalloid"],[33,"As","Мышьяк","74.922",15,4,"metalloid"],[34,"Se","Селен","78.971",16,4,"nonmetal"],[35,"Br","Бром","79.904",17,4,"halogen"],[36,"Kr","Криптон","83.798",18,4,"noble"],
    [37,"Rb","Рубидий","85.468",1,5,"alkali"],[38,"Sr","Стронций","87.62",2,5,"alkaline"],[39,"Y","Иттрий","88.906",3,5,"transition"],[40,"Zr","Цирконий","91.224",4,5,"transition"],[41,"Nb","Ниобий","92.906",5,5,"transition"],[42,"Mo","Молибден","95.95",6,5,"transition"],[43,"Tc","Технеций","[98]",7,5,"transition"],[44,"Ru","Рутений","101.07",8,5,"transition"],[45,"Rh","Родий","102.91",9,5,"transition"],[46,"Pd","Палладий","106.42",10,5,"transition"],[47,"Ag","Серебро","107.87",11,5,"transition"],[48,"Cd","Кадмий","112.41",12,5,"transition"],[49,"In","Индий","114.82",13,5,"metal"],[50,"Sn","Олово","118.71",14,5,"metal"],[51,"Sb","Сурьма","121.76",15,5,"metalloid"],[52,"Te","Теллур","127.60",16,5,"metalloid"],[53,"I","Иод","126.90",17,5,"halogen"],[54,"Xe","Ксенон","131.29",18,5,"noble"],
    [55,"Cs","Цезий","132.91",1,6,"alkali"],[56,"Ba","Барий","137.33",2,6,"alkaline"],[57,"La","Лантан","138.91",3,6,"lanthanoid"],[72,"Hf","Гафний","178.49",4,6,"transition"],[73,"Ta","Тантал","180.95",5,6,"transition"],[74,"W","Вольфрам","183.84",6,6,"transition"],[75,"Re","Рений","186.21",7,6,"transition"],[76,"Os","Осмий","190.23",8,6,"transition"],[77,"Ir","Иридий","192.22",9,6,"transition"],[78,"Pt","Платина","195.08",10,6,"transition"],[79,"Au","Золото","196.97",11,6,"transition"],[80,"Hg","Ртуть","200.59",12,6,"transition"],[81,"Tl","Таллий","204.38",13,6,"metal"],[82,"Pb","Свинец","207.2",14,6,"metal"],[83,"Bi","Висмут","208.98",15,6,"metal"],[84,"Po","Полоний","[209]",16,6,"metal"],[85,"At","Астат","[210]",17,6,"halogen"],[86,"Rn","Радон","[222]",18,6,"noble"],
    [87,"Fr","Франций","[223]",1,7,"alkali"],[88,"Ra","Радий","[226]",2,7,"alkaline"],[89,"Ac","Актиний","[227]",3,7,"actinoid"],[104,"Rf","Резерфордий","[267]",4,7,"transition"],[105,"Db","Дубний","[268]",5,7,"transition"],[106,"Sg","Сиборгий","[269]",6,7,"transition"],[107,"Bh","Борий","[270]",7,7,"transition"],[108,"Hs","Хассий","[269]",8,7,"transition"],[109,"Mt","Мейтнерий","[278]",9,7,"transition"],[110,"Ds","Дармштадтий","[281]",10,7,"transition"],[111,"Rg","Рентгений","[282]",11,7,"transition"],[112,"Cn","Коперниций","[285]",12,7,"transition"],[113,"Nh","Нихоний","[286]",13,7,"metal"],[114,"Fl","Флеровий","[289]",14,7,"metal"],[115,"Mc","Московий","[290]",15,7,"metal"],[116,"Lv","Ливерморий","[293]",16,7,"metal"],[117,"Ts","Теннессин","[294]",17,7,"halogen"],[118,"Og","Оганесон","[294]",18,7,"noble"],
    [58,"Ce","Церий","140.12",4,8,"lanthanoid"],[59,"Pr","Празеодим","140.91",5,8,"lanthanoid"],[60,"Nd","Неодим","144.24",6,8,"lanthanoid"],[61,"Pm","Прометий","[145]",7,8,"lanthanoid"],[62,"Sm","Самарий","150.36",8,8,"lanthanoid"],[63,"Eu","Европий","151.96",9,8,"lanthanoid"],[64,"Gd","Гадолиний","157.25",10,8,"lanthanoid"],[65,"Tb","Тербий","158.93",11,8,"lanthanoid"],[66,"Dy","Диспрозий","162.50",12,8,"lanthanoid"],[67,"Ho","Гольмий","164.93",13,8,"lanthanoid"],[68,"Er","Эрбий","167.26",14,8,"lanthanoid"],[69,"Tm","Тулий","168.93",15,8,"lanthanoid"],[70,"Yb","Иттербий","173.05",16,8,"lanthanoid"],[71,"Lu","Лютеций","174.97",17,8,"lanthanoid"],
    [90,"Th","Торий","232.04",4,9,"actinoid"],[91,"Pa","Протактиний","231.04",5,9,"actinoid"],[92,"U","Уран","238.03",6,9,"actinoid"],[93,"Np","Нептуний","[237]",7,9,"actinoid"],[94,"Pu","Плутоний","[244]",8,9,"actinoid"],[95,"Am","Америций","[243]",9,9,"actinoid"],[96,"Cm","Кюрий","[247]",10,9,"actinoid"],[97,"Bk","Берклий","[247]",11,9,"actinoid"],[98,"Cf","Калифорний","[251]",12,9,"actinoid"],[99,"Es","Эйнштейний","[252]",13,9,"actinoid"],[100,"Fm","Фермий","[257]",14,9,"actinoid"],[101,"Md","Менделевий","[258]",15,9,"actinoid"],[102,"No","Нобелий","[259]",16,9,"actinoid"],[103,"Lr","Лоуренсий","[266]",17,9,"actinoid"]
  ];

  const elementTextByType = {
    alkali: ["Активный щелочной металл.", "Соли, учебные опыты, химический синтез.", "Мягкий металл, легко отдаёт электрон."],
    alkaline: ["Щёлочноземельный металл.", "Минералы, сплавы, аналитическая химия.", "Образует устойчивые соли и оксиды."],
    transition: ["Переходный металл.", "Сплавы, катализаторы, техника.", "Имеет переменные степени окисления."],
    metal: ["Металл главной подгруппы.", "Материалы, электроника, промышленность.", "Проводит тепло и электричество."],
    metalloid: ["Элемент с промежуточными свойствами.", "Стекло, полупроводники, специальные материалы.", "Сочетает свойства металлов и неметаллов."],
    nonmetal: ["Неметалл.", "Биология, атмосфера, кислоты и соли.", "Плохо проводит ток, часто образует молекулы."],
    halogen: ["Галоген.", "Дезинфекция, соли, органический синтез.", "Активный неметалл-окислитель."],
    noble: ["Благородный газ.", "Лампы, лазеры, защитные атмосферы.", "Химически малоактивен."],
    lanthanoid: ["Лантаноид.", "Магниты, люминофоры, оптика.", "Редкоземельный металл со сходной химией."],
    actinoid: ["Актиноид.", "Ядерная энергетика, научные исследования.", "Тяжёлый радиоактивный металл."]
  };

  const periodicElements = fullElementRows.map(function (row) {
    const text = elementTextByType[row[6]];
    return { n: row[0], s: row[1], name: row[2], mass: row[3], group: row[4], period: row[5], type: row[6], description: text[0], use: text[1], properties: text[2] };
  });

  const reactionFilters = [
    { id: "all", label: "Все" },
    { id: "gas", label: "Выделение газа" },
    { id: "precipitate", label: "Осаждение" },
    { id: "neutralization", label: "Нейтрализация" },
    { id: "oxidation", label: "Окисление" },
    { id: "combustion", label: "Горение" },
    { id: "heat", label: "Нагрев" },
    { id: "colorChange", label: "Изменение цвета" }
  ];

  const tasks = [
    { id: "task-co2", title: "Получить CO2 из карбоната", level: "лёгкий", goal: "Добиться выделения углекислого газа без нагрева.", reagents: ["CaCO3", "HCl"], hints: ["Выберите коническую колбу.", "Добавьте CaCO3, затем HCl.", "Газоотводная трубка поможет увидеть направление газа."], reactionId: "caco3_hcl", points: 20 },
    { id: "task-agcl", title: "Распознать хлорид-ионы", level: "лёгкий", goal: "Получить белый осадок AgCl.", reagents: ["AgNO3", "NaCl"], hints: ["Нужны два раствора солей.", "Нагрев не требуется."], reactionId: "agno3_nacl", points: 20 },
    { id: "task-neutral", title: "Получить гидроксид меди", level: "средний", goal: "Получить голубой осадок Cu(OH)2.", reagents: ["CuSO4", "NaOH"], hints: ["Возьмите пробирку.", "Нагрев не требуется.", "Следите за появлением голубого осадка."], reactionId: "cuso4_naoh", points: 30 },
    { id: "task-feoh3", title: "Получить бурый осадок", level: "средний", goal: "Показать образование Fe(OH)3 из соли железа(III).", reagents: ["FeCl3", "NaOH"], hints: ["Выберите пробирку.", "Добавьте FeCl3 и NaOH.", "Ищите бурое помутнение."], reactionId: "fecl3_naoh", points: 30 },
    { id: "task-pbi2", title: "Сделать жёлтый осадок", level: "средний", goal: "Получить яркий PbI2 в виртуальном опыте.", reagents: ["Pb(NO3)2", "KI"], hints: ["Опыт только виртуальный.", "Нужны две соли в растворе.", "Нагрев не нужен."], reactionId: "pbno3_ki", points: 35 },
    { id: "task-lime", title: "Проверить CO2 известковой водой", level: "средний", goal: "Добиться белого помутнения CaCO3.", reagents: ["CO2", "Ca(OH)2"], hints: ["Возьмите стакан или пробирку.", "Добавьте CO2 и известковую воду.", "Осадок показывает наличие CO2."], reactionId: "co2_limewater", points: 35 },
    { id: "task-ammonia", title: "Получить аммиак", level: "сложный", goal: "Выделить NH3 из соли аммония при нагревании.", reagents: ["NH4Cl", "NaOH"], hints: ["Нужна пробирка.", "Поставьте нагреватель.", "Включите нагрев перед проверкой."], reactionId: "nh4cl_naoh", points: 45 },
    { id: "task-heat", title: "Показать нагрев воды", level: "средний", goal: "Показать, что пар появляется только после включения нагрева.", reagents: ["H2O", "O2"], hints: ["Возьмите стакан.", "Поставьте плитку под сосуд.", "Включите нагрев перед проверкой."], reactionId: "h2o_o2_heat", points: 40 }
  ];

  const handbook = [
    { category: "Техника безопасности", icon: "!", title: "Очки и перчатки", text: "Кислоты, щёлочи и соли тяжёлых металлов требуют защиты глаз и кожи. Не направляйте газоотвод к лицу." },
    { category: "Лабораторная посуда", icon: "⚗", title: "Пробирка и колба", text: "Пробирка подходит для малых проб, коническая колба удобна для выделения газа, круглодонная колба лучше переносит нагрев." },
    { category: "Оборудование", icon: "♨", title: "Горелка и плитка", text: "Нагреватель ставят под совместимый сосуд. Пламя включают только для реакций, где нагрев нужен по условию." },
    { category: "Типы реакций", icon: "→", title: "Газ, осадок, нейтрализация", text: "Признаки реакции: пузырьки газа, выпадение осадка, изменение цвета, выделение тепла или образование пара." },
    { category: "Единицы измерения", icon: "℃", title: "Температура, pH, объём", text: "Температуру измеряют в °C, кислотность по pH, объём раствора в миллилитрах." },
    { category: "Основные понятия", icon: "pH", title: "Кислота и щёлочь", text: "Кислоты отдают H+, щёлочи дают OH-. При нейтрализации образуются соль и вода." },
    { category: "Типы реакций", icon: "↓", title: "Осаждение", text: "Если при смешивании ионов образуется малорастворимое вещество, оно выпадает в осадок на дне сосуда." },
    { category: "Оборудование", icon: "↗", title: "Газоотвод", text: "Газоотводная трубка соединяется с сосудом и показывает, что продукт реакции покидает систему." }
  ];

  const snapSlots = {
    mainVesselSlot: { left: 50, top: 118 },
    heaterSlot: { left: 50, top: 72 },
    gasTubeSlot: { left: 58, top: 33 },
    reagentSlot: [{ left: 72, top: 55 }, { left: 82, top: 62 }, { left: 72, top: 70 }, { left: 82, top: 78 }],
    toolSlot: [{ left: 14, top: 58 }, { left: 23, top: 67 }, { left: 14, top: 76 }],
    receiverVesselSlot: { left: 24, top: 58 },
    reagent: [{ left: 72, top: 55 }, { left: 82, top: 62 }, { left: 72, top: 70 }, { left: 82, top: 78 }],
    tool: [{ left: 14, top: 58 }, { left: 23, top: 67 }, { left: 14, top: 76 }],
    mainVessel: { left: 50, top: 118 },
    heater: { left: 50, top: 72 },
    gasTube: { left: 58, top: 33 },
    reagentPreview: [{ left: 72, top: 55 }, { left: 82, top: 62 }, { left: 72, top: 70 }, { left: 82, top: 78 }]
  };

  const labState = {
    container: null,
    reagents: [],
    equipment: [],
    heating: false,
    heaterPlaced: false,
    heaterEnabled: false,
    heaterType: null,
    compatibleWithVessel: false,
    activeReactionId: "caco3_hcl",
    heatLevel: 0
  };
  const uiState = { reagentCardCount: 0, toolCardCount: 0, activeDockCategory: "glassware", elementFilter: "all", reactionFilter: "all", taskDone: new Set(), mode: "guided", dataSource: "local fallback", attemptsEnabled: false };
  let engine;
  let experimentStartedAt = Date.now();
  const dom = {};

  function setBackendStatus(kind, label) {
    const node = dom.backendStatus || document.getElementById("backendStatus");
    if (!node) return;
    node.className = "backend-status is-" + kind;
    const text = node.querySelector("strong");
    if (text) text.textContent = label;
  }

  function ingestConstructorProducts() {
    let products = [];
    try {
      products = JSON.parse(localStorage.getItem("chemlab_constructor_products") || "[]");
    } catch (error) {
      products = [];
    }
    products.forEach(function (product) {
      if (!product || !product.id || reagentById(product.id)) return;
      window.ChemLabReactionData.reagents.push({
        id: product.id,
        name: product.name || product.id,
        formula: product.formula || product.id,
        kind: product.type || "synthesized",
        category: "Созданные",
        state: product.state || "solution",
        role: product.description || "Создано в конструкторе реакций",
        color: product.color || "#e0f2fe"
      });
    });
  }

  function updateDebugStatus() {
    if (!dom.debugStatus) return;
    const auth = window.ChemLabAPI?.hasToken && window.ChemLabAPI.hasToken();
    uiState.attemptsEnabled = Boolean(window.ChemLabAPI?.isConfigured && auth && uiState.dataSource === "api");
    const dataLabel = uiState.dataSource === "api" ? "API" : "локальный каталог";
    dom.debugStatus.innerHTML = `
      <span>Данные: ${dataLabel}</span>
      <span>${auth ? "авторизация подключена" : "демо без аккаунта"} · ${uiState.attemptsEnabled ? "попытки сохраняются" : "попытки не сохраняются"}</span>
    `;
  }

  async function loadApiData() {
    if (!window.ChemLabAPI?.isConfigured) {
      uiState.dataSource = "local fallback";
      setBackendStatus("demo", "Демо-режим");
      console.info("[ChemLab] API URL: not configured; data source: local fallback; reactions:", window.ChemLabReactionData.reactions.length);
      updateDebugStatus();
      return;
    }
    try {
      await window.ChemLabAPI.health();
      const [reactionPayload, substancePayload, taskPayload, handbookPayload] = await Promise.all([
        window.ChemLabAPI.getReactions(),
        window.ChemLabAPI.getSubstances(),
        window.ChemLabAPI.getTasks?.() || Promise.resolve({ tasks: [] }),
        window.ChemLabAPI.getHandbook?.() || Promise.resolve({ entries: [] })
      ]);
      if (Array.isArray(reactionPayload.reactions) && reactionPayload.reactions.length) {
        window.ChemLabReactionData.reactionRules = reactionPayload.reactions.map(function (reaction) {
          const local = localReactionById(reaction.id) || {};
          return {
            id: reaction.id,
            name: local.name || reaction.name || reaction.title,
            title: local.title || local.name || reaction.title || reaction.name,
            reactants: local.reactants || reaction.reactants || [reaction.reactant_a_id, reaction.reactant_b_id].filter(Boolean),
            equation: local.equation || reaction.equation,
            type: local.type || (window.ChemLabI18n?.label ? window.ChemLabI18n.label("reactionType", reaction.type) : reaction.type),
            filters: local.filters || reaction.filters || [reaction.type],
            expectedEffect: local.expectedEffect || (reaction.has_gas ? "выделение газа" : reaction.has_precipitate ? "образование осадка" : "изменение в сосуде"),
            products: local.products || reaction.products || [],
            requiredEquipment: local.requiredEquipment || reaction.requiredEquipment || reaction.required_equipment || [],
            requiresHeating: Boolean(reaction.requiresHeating || reaction.requires_heating),
            allowedContainers: local.allowedContainers || reaction.allowedContainers || ["test-tube", "erlenmeyer", "beaker", "reaction-vessel"],
            effect: local.effect || (reaction.has_gas ? "gas" : reaction.has_precipitate ? "precipitate" : reaction.has_smoke ? "steam" : "colorChange"),
            visualEffect: local.visualEffect || reaction.visualEffect || reaction.visual_effect || {
              type: reaction.has_gas ? "gas" : reaction.has_precipitate ? "precipitate" : reaction.has_smoke ? "steam" : "colorChange",
              gas: reaction.gas_name || reaction.gas_label,
              precipitateColor: reaction.precipitate_color,
              liquidColor: reaction.liquid_color_after || reaction.liquidColor
            },
            liquidColor: local.liquidColor || reaction.liquid_color_after || reaction.liquidColor || reaction.liquid_color || "clear",
            message: local.message || reaction.message,
            observation: local.observation || reaction.observation,
            explanation: local.explanation || reaction.explanation,
            safetyNote: local.safetyNote || reaction.safety || reaction.safetyNote || reaction.safety_note
          };
        });
        window.ChemLabReactionData.reactions = window.ChemLabReactionData.reactionRules;
      }
      if (Array.isArray(substancePayload.substances) && substancePayload.substances.length) {
        window.ChemLabReactionData.reagents = substancePayload.substances.map(function (substance) {
          return {
            id: substance.id,
            name: substance.name,
            formula: substance.formula,
            kind: substance.type,
            category: window.ChemLabI18n?.label ? window.ChemLabI18n.label("substanceType", substance.type) : substance.type,
            state: substance.visualState || substance.state || "solution",
            role: substance.description || substance.role || substance.danger_level || "",
            color: substance.color || "#e0f2fe"
          };
        });
      }
      if (Array.isArray(taskPayload.tasks) && taskPayload.tasks.length) {
        tasks.splice(0, tasks.length, ...taskPayload.tasks.map(function (task) {
          return {
            id: task.id,
            title: task.title,
            level: task.level || "Базовый",
            goal: task.goal || "",
            reagents: Array.isArray(task.reagents) ? task.reagents : [],
            hints: Array.isArray(task.hints) ? task.hints : [],
            reactionId: task.reaction_id || task.reactionId,
            points: Number(task.points || 10)
          };
        }));
      }
      if (Array.isArray(handbookPayload.entries) && handbookPayload.entries.length) {
        handbook.splice(0, handbook.length, ...handbookPayload.entries.map(function (entry) {
          return {
            category: entry.category || "Справочник",
            icon: entry.icon || "•",
            title: entry.title || "Материал",
            text: entry.text || ""
          };
        }));
      }
      uiState.dataSource = "api";
      setBackendStatus("connected", "Аккаунт доступен");
      console.info("[ChemLab] API URL:", window.ChemLabAPI.baseUrl, "account and progress enabled; local catalog reactions:", window.ChemLabReactionData.reactions.length);
    } catch (error) {
      uiState.dataSource = "local fallback";
      setBackendStatus("error", "Аккаунт недоступен");
      console.warn("[ChemLab] API error; fallback enabled. API URL:", window.ChemLabAPI.baseUrl, "reactions:", window.ChemLabReactionData.reactions.length);
    }
    updateDebugStatus();
  }

  function get(id) { return document.getElementById(id); }
  function reagentById(id) { return window.ChemLabReactionData.reagents.find(item => item.id === id); }
  function equipmentLabel(id) { return equipment.find(item => item.id === id)?.label || id; }
  function equipmentById(id) { return equipment.find(item => item.id === id); }
  function reactionById(id) { return window.ChemLabReactionData.reactions.find(item => item.id === id); }
  function localReactionById(id) {
    const aliases = { h2o_heat: "h2o_o2_heat" };
    return window.ChemLabReactionData.reactionRules.find(item => item.id === id || item.id === aliases[id]);
  }
  function activeReaction() { return reactionById(labState.activeReactionId) || window.ChemLabReactionData.reactions[0]; }
  function getReactionCandidate() { return labState.reagents.length >= 2 ? engine.find(labState.reagents.slice(0, 2)) : null; }
  function reactionNeedsHeat() { const candidate = getReactionCandidate() || activeReaction(); return Boolean(candidate && candidate.requiresHeating); }
  function currentReactionRequiresHeating() { return reactionNeedsHeat(); }
  function syncHeatingAlias() { labState.heating = labState.heaterEnabled; }
  function isSolution(reagent) { return reagent && (reagent.state === "solution" || reagent.state === "liquid"); }
  function hasLiquidReagent() { return labState.reagents.some(id => isSolution(reagentById(id))); }
  function hasSolidReagent() { return labState.reagents.some(id => reagentById(id)?.state === "solid"); }

  function addNote(text) {
    if (!dom.noteList || !text) return;
    const row = document.createElement("div");
    row.className = "note-row";
    row.textContent = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) + " · " + text;
    dom.noteList.prepend(row);
  }

  function setActiveSection(name) {
    document.querySelectorAll("[data-app-section]").forEach(section => section.classList.toggle("is-active", section.dataset.appSection === name));
    document.querySelectorAll("[data-section-link]").forEach(link => link.classList.toggle("is-active", link.dataset.sectionLink === name));
    if (location.hash.slice(1) !== name) history.replaceState(null, "", "#" + name);
  }

  function setupNavigation() {
    document.querySelectorAll("[data-section-link]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        setActiveSection(link.dataset.sectionLink);
      });
    });
    const initial = location.hash.slice(1);
    setActiveSection(initial && get(initial) ? initial : "lab");
  }

  function renderElementFilters() {
    dom.elementFilters.innerHTML = "";
    elementTypes.forEach(filter => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip" + (filter.id === uiState.elementFilter ? " is-active" : "");
      button.textContent = filter.label;
      button.addEventListener("click", () => {
        uiState.elementFilter = filter.id;
        renderElementFilters();
        renderPeriodicTable();
      });
      dom.elementFilters.appendChild(button);
    });
  }

  function renderPeriodicTable() {
    const query = (dom.elementSearch.value || "").trim().toLowerCase();
    dom.periodicGrid.innerHTML = "";
    periodicElements.forEach(element => {
      const matchesQuery = !query || element.s.toLowerCase().includes(query) || element.name.toLowerCase().includes(query);
      const matchesType = uiState.elementFilter === "all" || element.type === uiState.elementFilter || (uiState.elementFilter === "metal" && ["metal", "transition", "alkali", "alkaline", "lanthanoid", "actinoid"].includes(element.type));
      if (!matchesQuery || !matchesType) return;
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "element-cell el-" + element.type;
      cell.style.gridColumn = element.group;
      cell.style.gridRow = element.period;
      cell.innerHTML = `<span>${element.n}</span><strong>${element.s}</strong><em>${element.name}</em>`;
      cell.addEventListener("click", () => showElementCard(element));
      dom.periodicGrid.appendChild(cell);
    });
  }

  function showElementCard(element) {
    const typeLabel = elementTypes.find(item => item.id === element.type)?.label || element.type;
    dom.elementCard.innerHTML = `
      <span class="card-kicker">№ ${element.n} · ${typeLabel}</span>
      <h2>${element.name} <b>${element.s}</b></h2>
      <div class="info-grid">
        <span><strong>${element.mass}</strong>атомная масса</span>
        <span><strong>${element.group}</strong>группа</span>
        <span><strong>${element.period}</strong>период</span>
      </div>
      <p>${element.description}</p>
      <h3>Применение</h3><p>${element.use}</p>
      <h3>Основные свойства</h3><p>${element.properties}</p>
    `;
  }

  function renderReactionFilters() {
    dom.reactionFilters.innerHTML = "";
    reactionFilters.forEach(filter => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip" + (filter.id === uiState.reactionFilter ? " is-active" : "");
      button.textContent = filter.label;
      button.addEventListener("click", () => {
        uiState.reactionFilter = filter.id;
        renderReactionFilters();
        renderReactionCatalog();
      });
      dom.reactionFilters.appendChild(button);
    });
  }

  function renderReactionCatalog() {
    const query = (dom.reactionSearch.value || "").trim().toLowerCase();
    dom.reactionCatalog.innerHTML = "";
    window.ChemLabReactionData.reactions.forEach(reaction => {
      const haystack = [reaction.name, reaction.equation, reaction.type].concat(reaction.reactants).join(" ").toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesFilter = uiState.reactionFilter === "all" || reaction.filters?.includes(uiState.reactionFilter);
      if (!matchesQuery || !matchesFilter) return;
      const card = document.createElement("article");
      card.className = "reaction-card";
      card.innerHTML = `
        <div><span>${reaction.type}</span><h2>${reaction.name}</h2></div>
        <p class="equation">${reaction.equation}</p>
        <dl>
          <dt>Реактивы</dt><dd>${reaction.reactants.join(" + ")}</dd>
          <dt>Нагрев</dt><dd>${reaction.requiresHeating ? "нужен" : "не нужен"}</dd>
          <dt>Наблюдение</dt><dd>${reaction.observation}</dd>
          <dt>Продукты</dt><dd>${reaction.products.join(", ")}</dd>
        </dl>
        <p>${reaction.explanation}</p>
        <button class="primary-action" type="button">Запустить опыт</button>
      `;
      card.querySelector("button").addEventListener("click", () => startReactionScenario(reaction.id, true));
      dom.reactionCatalog.appendChild(card);
    });
  }

  function renderTasks() {
    dom.taskList.innerHTML = "";
    tasks.forEach(task => {
      const done = uiState.taskDone.has(task.id);
      const card = document.createElement("article");
      card.className = "task-card" + (done ? " is-done" : "");
      card.innerHTML = `
        <div class="task-top"><span>${task.level}</span><strong>${done ? "выполнено" : task.points + " баллов"}</strong></div>
        <h2>${task.title}</h2>
        <p><b>Цель:</b> ${task.goal}</p>
        <p><b>Доступные реактивы:</b> ${task.reagents.join(", ")}</p>
        <details><summary>Подсказки</summary><ol>${task.hints.map(hint => `<li>${hint}</li>`).join("")}</ol></details>
        <button class="primary-action" type="button">${done ? "Повторить" : "Начать"}</button>
      `;
      card.querySelector("button").addEventListener("click", () => startReactionScenario(task.reactionId, true, task.id));
      dom.taskList.appendChild(card);
    });
    updateTaskProgress();
  }

  function updateTaskProgress() {
    const done = uiState.taskDone.size;
    const score = tasks.filter(task => uiState.taskDone.has(task.id)).reduce((sum, task) => sum + task.points, 0);
    const percent = Math.round((done / tasks.length) * 100);
    dom.taskProgress.textContent = `${done} из ${tasks.length}`;
    dom.taskScore.textContent = `${score} баллов · ${percent}%`;
  }

  function renderHandbook() {
    const query = (dom.handbookSearch.value || "").trim().toLowerCase();
    dom.handbookGrid.innerHTML = "";
    handbook.forEach(item => {
      const haystack = (item.category + " " + item.title + " " + item.text).toLowerCase();
      if (query && !haystack.includes(query)) return;
      const card = document.createElement("article");
      card.className = "handbook-card";
      card.innerHTML = `<span>${item.icon}</span><small>${item.category}</small><h2>${item.title}</h2><p>${item.text}</p>`;
      dom.handbookGrid.appendChild(card);
    });
  }

  function setActiveTab(name) {
    document.querySelectorAll("[data-panel-tab]").forEach(tab => tab.classList.toggle("is-active", tab.dataset.panelTab === name));
    document.querySelectorAll("[data-panel]").forEach(panel => panel.classList.toggle("is-active", panel.dataset.panel === name));
  }

  function makeDragPayload(type, id) { return JSON.stringify({ type, id }); }
  function parseDragPayload(event) {
    try { return JSON.parse(event.dataTransfer.getData("application/json") || "{}"); } catch (error) { return {}; }
  }

  function setupDraggable(node, type, id) {
    node.draggable = true;
    node.addEventListener("dragstart", event => {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("application/json", makeDragPayload(type, id));
      node.classList.add("is-dragging");
    });
    node.addEventListener("dragend", () => node.classList.remove("is-dragging"));
  }

  function quickAddItem(type, id) {
    addWorkspaceItem({ type, id });
    pulseNode(dom.dropzone);
  }

  function renderShelfReagents() {
    dom.shelfReagents.innerHTML = "";
    window.ChemLabReactionData.reagents.forEach(reagent => {
      const wrap = document.createElement("div");
      wrap.className = "reagent-pick";
      const bottle = document.createElement("div");
      bottle.className = "reagent-bottle reagent-" + reagent.kind;
      bottle.dataset.reagentId = reagent.id;
      bottle.title = `${reagent.name} (${reagent.formula}) — ${reagent.role}`;
      bottle.innerHTML = `<small>${reagent.category}</small><span>${reagent.formula}</span>`;
      bottle.addEventListener("mouseenter", () => showReagentInfo(reagent));
      bottle.addEventListener("click", () => showReagentInfo(reagent));
      setupDraggable(bottle, "reagent", reagent.id);
      const add = document.createElement("button");
      add.type = "button";
      add.className = "quick-add";
      add.title = "Добавить на стол";
      add.setAttribute("aria-label", "Добавить " + reagent.formula + " на стол");
      add.textContent = "+";
      add.addEventListener("click", event => {
        event.stopPropagation();
        quickAddItem("reagent", reagent.id);
      });
      wrap.append(bottle, add);
      dom.shelfReagents.appendChild(wrap);
    });
  }

  function showReagentInfo(reagent) {
    if (!dom.reagentInfo) return;
    dom.reagentInfo.innerHTML = `<strong>${reagent.formula} · ${reagent.name}</strong><span>${reagent.category}, ${stateLabel(reagent.state)}</span><p>${reagent.role}</p>`;
  }

  function stateLabel(state) {
    return { solution: "раствор", liquid: "жидкость", solid: "твёрдое", gas: "газ" }[state] || state;
  }

  function renderDock() {
    dom.equipmentDock.innerHTML = "";
    equipment.filter(item => item.category === uiState.activeDockCategory).forEach(item => {
      const wrap = document.createElement("div");
      wrap.className = "dock-pick";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "dock-item";
      button.dataset.itemId = item.id;
      button.title = item.description;
      button.innerHTML = `<span class="item-icon ${item.icon}"></span><strong>${item.label}</strong><small>${item.description}</small>`;
      setupDraggable(button, "equipment", item.id);
      const add = document.createElement("button");
      add.type = "button";
      add.className = "quick-add dock-add";
      add.title = "Добавить на стол";
      add.setAttribute("aria-label", "Добавить " + item.label + " на стол");
      add.textContent = "+";
      add.addEventListener("click", event => {
        event.stopPropagation();
        quickAddItem("equipment", item.id);
      });
      wrap.append(button, add);
      dom.equipmentDock.appendChild(wrap);
    });
  }

  function renderWallPeriodic() {
    if (!dom.wallPeriodicGrid) return;
    dom.wallPeriodicGrid.innerHTML = "";
    periodicElements.forEach(element => {
      const cell = document.createElement("span");
      cell.className = "mini-el mini-" + element.type;
      cell.style.gridColumn = element.group;
      cell.style.gridRow = element.period;
      cell.title = `${element.n}. ${element.name} (${element.s})`;
      cell.innerHTML = `<b>${element.n}</b><strong>${element.s}</strong><em>${element.name}</em>`;
      dom.wallPeriodicGrid.appendChild(cell);
    });
  }

  function setActiveContainer(item) {
    if (!item || !item.isContainer) return;
    labState.container = { id: item.id, label: item.label, icon: item.icon };
    labState.compatibleWithVessel = labState.heaterPlaced;
    clearEffects(true);
    dom.reactionVessel.classList.add("is-active-container", "vessel-" + item.icon);
    renderVesselContents();
    pulseNode(dom.reactionVessel);
    addNote("выбран сосуд: " + item.label);
  }

  function setResultMessage(text, tone) {
    dom.resultMessage.className = "result-message";
    if (tone) dom.resultMessage.classList.add(tone);
    dom.resultMessage.textContent = text;
  }

  function renderSolidLayer() {
    dom.solidLayer.innerHTML = "";
    if (!hasSolidReagent()) return;
    labState.reagents.forEach(id => {
      const reagent = reagentById(id);
      if (!reagent || reagent.state !== "solid") return;
      const count = id === "CaCO3" ? 26 : 10;
      for (let i = 0; i < count; i += 1) {
        const particle = document.createElement("span");
        particle.className = "solid-particle solid-" + id.toLowerCase();
        particle.style.left = 14 + Math.random() * 70 + "%";
        particle.style.bottom = 2 + Math.random() * 10 + "%";
        particle.style.animationDelay = Math.random() * 0.25 + "s";
        dom.solidLayer.appendChild(particle);
      }
    });
  }

  function renderVesselContents() {
    dom.reactionVessel.classList.toggle("has-liquid", hasLiquidReagent());
    dom.reactionVessel.classList.toggle("has-content", labState.reagents.length > 0);
    dom.reactionVessel.classList.toggle("has-solid", hasSolidReagent());
    renderSolidLayer();
    updateMeasurements();
  }

  function updateGasHardware(reaction) {
    const showOutlet = labState.container && reaction?.visualEffect?.gasOutlet;
    dom.gasOutlet.classList.toggle("is-visible", Boolean(showOutlet));
    dom.gasLabel.textContent = reaction?.visualEffect?.gas ? reaction.visualEffect.gas + "↑" : "";
    dom.gasLabel.classList.toggle("is-visible", Boolean(reaction?.visualEffect?.gas));
  }

  function updateInstructionPanel() {
    const reaction = activeReaction();
    if (uiState.mode === "free") {
      dom.activeExperimentName.textContent = "Свободный режим";
      dom.requiredReagents.textContent = "любые вещества";
      dom.instructionPanel.innerHTML = `
        <h1>Свободный режим</h1>
        <p><strong>Цель:</strong> самостоятельно смешивать вещества и проверять только подтверждённые реакции из базы.</p>
        <p class="equation">Выберите сосуд, добавьте 1-3 вещества и нажмите «Проверить результат».</p>
        <div class="prep-list">
          <span>Каталог: русские учебные реакции</span>
          <span>Нагрев учитывается, если реакция требует температуру.</span>
        </div>
        <ol>
          <li>Перетащите любой сосуд на рабочий стол.</li>
          <li>Добавьте выбранные вещества из полки реактивов.</li>
          <li>Если нужна температура, поставьте нагреватель и включите нагрев.</li>
          <li>Если правила реакции нет, система покажет спокойный статус без фейкового эффекта.</li>
        </ol>
      `;
      dom.expectedEffect.textContent = "проверка по базе реакций";
      return;
    }
    dom.activeExperimentName.textContent = reaction.name;
    dom.requiredReagents.textContent = reaction.reactants.join(" + ");
    dom.instructionPanel.innerHTML = `
      <h1>${reaction.name}</h1>
      <p><strong>Цель:</strong> ${reaction.expectedEffect}.</p>
      <p class="equation">${reaction.equation}</p>
      <div class="prep-list">
        <span>Реактивы: ${reaction.reactants.join(", ")}</span>
        <span>Оборудование: ${reaction.requiredEquipment.map(equipmentLabel).join(", ")}</span>
        <span>Нагрев: ${reaction.requiresHeating ? "нужен" : "не требуется"}</span>
      </div>
      <ol>
        <li>Перетащите подходящий сосуд в центральный слот активного опыта.</li>
        <li>Добавьте реактивы: ${reaction.reactants.join(" и ")}.</li>
        ${reaction.visualEffect?.gasOutlet ? "<li>Добавьте газоотводную трубку, чтобы видеть отвод газа.</li>" : ""}
        ${reaction.requiresHeating ? "<li>Перетащите спиртовку или плитку в нижний слот и включите нагрев.</li>" : "<li>Нагрев не включайте: реакция идёт при обычных условиях.</li>"}
        <li>Нажмите «Проверить результат» и сравните наблюдение с инструкцией.</li>
      </ol>
    `;
    dom.expectedEffect.textContent = reaction.expectedEffect;
  }

  function updateLabStatePanel() {
    const reagentLabels = labState.reagents.map(id => reagentById(id)?.formula || id);
    const canRun = Boolean(labState.container && labState.reagents.length >= 2);
    const candidate = getReactionCandidate();
    const heatRequired = Boolean((candidate || activeReaction()).requiresHeating);
    const heatReady = !heatRequired || labState.heaterEnabled;
    const experimentReady = canRun && heatReady;
    dom.selectedReagents.textContent = reagentLabels.length ? reagentLabels.join(" + ") : "нет реактивов";
    dom.containerName.textContent = labState.container ? labState.container.label : "не выбран";
    if (!heatRequired) {
      dom.heatStatus.textContent = labState.heaterEnabled ? "включён, не требуется" : "не требуется";
    } else if (!labState.heaterPlaced) {
      dom.heatStatus.textContent = "требуется: добавьте нагреватель";
    } else if (!labState.container) {
      dom.heatStatus.textContent = "требуется: выберите сосуд";
    } else if (!labState.heaterEnabled) {
      dom.heatStatus.textContent = "требуется: включите нагрев";
    } else {
      dom.heatStatus.textContent = "нагрев включён";
    }
    if (!labState.container) {
      dom.readinessText.textContent = "добавьте сосуд";
    } else if (!labState.reagents.length) {
      dom.readinessText.textContent = "сосуд пустой";
    } else if (labState.reagents.length === 1) {
      dom.readinessText.textContent = "добавлен " + reagentLabels[0];
    } else if (candidate?.requiresHeating && !labState.heaterEnabled) {
      dom.readinessText.textContent = labState.heaterPlaced ? "включите нагрев" : "добавьте нагреватель";
    } else {
      dom.readinessText.textContent = "опыт готов к проверке";
    }
    dom.readinessText.classList.toggle("ready", experimentReady);
    dom.expectedEffect.textContent = candidate ? candidate.expectedEffect : activeReaction().expectedEffect;
    dom.checkReaction.disabled = !canRun;
    dom.checkReaction.classList.toggle("is-ready", experimentReady);
    dom.checkReaction.classList.toggle("is-warning", canRun && !heatReady);
    dom.compositionList.innerHTML = "";
    if (!reagentLabels.length) {
      const empty = document.createElement("span");
      empty.textContent = labState.container ? "сосуд пустой" : "сначала перенесите сосуд";
      dom.compositionList.appendChild(empty);
    } else {
      reagentLabels.forEach(formula => {
        const chip = document.createElement("span");
        chip.textContent = formula;
        dom.compositionList.appendChild(chip);
      });
    }
    updateHeatingUi();
  }

  function updateMeasurements() {
    const volume = labState.reagents.length * 15;
    const temp = labState.heaterEnabled ? 65 + labState.heatLevel * 25 : 22;
    const hasAcid = labState.reagents.some(id => reagentById(id)?.kind === "acid");
    const hasBase = labState.reagents.some(id => reagentById(id)?.kind === "base");
    const ph = hasAcid && hasBase ? 7 : hasAcid ? 2 : hasBase ? 12 : 7;
    if (dom.temperatureValue) dom.temperatureValue.textContent = temp + "°C";
    if (dom.phValue) dom.phValue.textContent = "pH " + ph;
    if (dom.volumeValue) dom.volumeValue.textContent = volume + " мл";
    if (dom.timerValue) dom.timerValue.textContent = labState.reagents.length ? "00:" + String(Math.min(59, labState.reagents.length * 8)).padStart(2, "0") : "00:00";
  }

  function updateHeating(enabled, silent) {
    if (enabled && !labState.heaterPlaced) {
      labState.heaterEnabled = false;
      syncHeatingAlias();
      dom.heatCheckbox.checked = false;
      setResultMessage("Сначала добавьте нагреватель в рабочую зону.", "warning");
      setActiveTab("conditions");
      updateHeatingUi();
      return;
    }
    if (enabled && !labState.container) {
      labState.heaterEnabled = false;
      syncHeatingAlias();
      dom.heatCheckbox.checked = false;
      setResultMessage("Сначала выберите сосуд.", "warning");
      setActiveTab("conditions");
      updateHeatingUi();
      return;
    }
    if (enabled && !labState.compatibleWithVessel) {
      labState.heaterEnabled = false;
      syncHeatingAlias();
      dom.heatCheckbox.checked = false;
      setResultMessage("Поставьте сосуд над нагревателем.", "warning");
      setActiveTab("conditions");
      updateHeatingUi();
      return;
    }
    labState.heaterEnabled = Boolean(enabled);
    syncHeatingAlias();
    labState.heatLevel = labState.heaterEnabled ? Math.max(1, Number(dom.heatLevel?.value || 2)) : 0;
    if (dom.heatLevel) dom.heatLevel.value = String(labState.heatLevel);
    document.body.classList.toggle("is-heating", labState.heaterEnabled);
    dom.heatCheckbox.checked = labState.heaterEnabled;
    dom.heatToggle.setAttribute("aria-pressed", String(labState.heaterEnabled));
    dom.reactionVessel.classList.toggle("heated", labState.heaterEnabled);
    if (!silent) addNote(labState.heaterEnabled ? "нагрев включён" : "нагрев выключен");
    updateHeatingUi();
    updateLabStatePanel();
  }

  function updateHeatingUi() {
    const heatRequired = currentReactionRequiresHeating();
    if (dom.heatSwitchRow) dom.heatSwitchRow.hidden = false;
    if (dom.heatLevel) dom.heatLevel.disabled = !labState.heaterPlaced || !labState.container;
    if (dom.heatModeText) {
      dom.heatModeText.textContent = !heatRequired && labState.heaterEnabled ? "Нагрев включён, но не требуется" : !heatRequired ? "Нагрев не требуется" : labState.heaterEnabled ? "Нагрев включён" : "Нагрев выключен";
    }
    if (dom.heatDot) dom.heatDot.classList.toggle("is-on", labState.heaterEnabled);
    if (dom.drawerHeatToggle) {
      if (!labState.heaterPlaced) {
        dom.drawerHeatToggle.textContent = "Добавьте нагреватель";
        dom.drawerHeatToggle.disabled = true;
      } else if (!labState.container) {
        dom.drawerHeatToggle.textContent = "Добавьте сосуд";
        dom.drawerHeatToggle.disabled = true;
      } else {
        dom.drawerHeatToggle.textContent = labState.heaterEnabled ? "Выключить нагрев" : "Включить нагрев";
        dom.drawerHeatToggle.disabled = false;
      }
    }
    document.body.classList.toggle("has-heater", labState.heaterPlaced);
    document.body.classList.toggle("heater-enabled", labState.heaterEnabled);
    document.body.classList.toggle("heater-burner", labState.heaterType === "burner-tool");
    document.body.classList.toggle("heater-hotplate", labState.heaterType === "hot-plate");
    const candidate = getReactionCandidate() || activeReaction();
    let heatState = "heater_off";
    if (candidate?.requiresHeating && !labState.heaterEnabled) heatState = "reaction_blocked_without_heat";
    if (candidate?.requiresHeating && labState.heaterEnabled) heatState = "reaction_ready";
    if (!candidate?.requiresHeating && labState.heaterEnabled) heatState = "heating_not_required";
    if (labState.heaterEnabled) heatState = heatState === "heater_off" ? "heater_on" : heatState;
    document.body.dataset.heatState = heatState;
    dom.workspaceItems?.querySelectorAll(".is-heat-tool").forEach(node => {
      node.classList.toggle("is-enabled", labState.heaterEnabled);
      node.dataset.heatLevel = String(labState.heatLevel);
    });
    updateMeasurements();
  }

  function addWorkspaceItem(payload) {
    const item = document.createElement("div");
    item.className = "workspace-item " + payload.type;
    item.dataset.type = payload.type;
    item.dataset.id = payload.id;

    if (payload.type === "reagent") {
      const reagent = reagentById(payload.id);
      if (!reagent) return;
      const slot = snapSlots.reagent[uiState.reagentCardCount % snapSlots.reagent.length];
      item.style.left = slot.left + "%";
      item.style.top = slot.top + "%";
      item.innerHTML = `<span class="mini-bottle"></span><strong>${reagent.formula}</strong>`;
      if (!labState.reagents.includes(payload.id)) labState.reagents.push(payload.id);
      showReagentInfo(reagent);
      addNote("добавлен " + reagent.formula);
      if (labState.container) {
        clearEffects(true);
        renderVesselContents();
        pulseNode(dom.reactionVessel);
        setResultMessage("Добавлено в сосуд: " + reagent.formula + ". Состав опыта обновлён.", "info");
      } else {
        setResultMessage("Реактив добавлен на стол. Теперь перенесите сосуд в центральный слот.", "warning");
      }
      uiState.reagentCardCount += 1;
    } else {
      const eq = equipmentById(payload.id);
      if (!eq) return;
      if (eq.isContainer && labState.container) {
        setResultMessage("Основной сосуд уже выбран: " + labState.container.label + ". Сбросьте опыт, если нужно заменить сосуд.", "warning");
        pulseNode(dom.reactionVessel);
        return;
      }
      if (eq.isContainer) {
        if (!labState.equipment.includes(payload.id)) labState.equipment.push(payload.id);
        setActiveContainer(eq);
        setResultMessage("Активный сосуд: " + eq.label + ".", "info");
        updateLabStatePanel();
        return;
      }
      if (eq.isHeater && labState.heaterPlaced) {
        setResultMessage("Нагреватель уже стоит в слоте. Сбросьте опыт, если нужно заменить тип нагрева.", "warning");
        return;
      }
      if (eq.isHeater) {
        item.classList.add("is-heat-tool");
        item.classList.add(payload.id === "hot-plate" ? "is-hotplate" : "is-burner");
        item.style.left = snapSlots.heaterSlot.left + "%";
        item.style.top = snapSlots.heaterSlot.top + "%";
      } else if (eq.id === "gas-tube") {
        item.classList.add("is-gas-tube-tool");
        item.style.left = snapSlots.gasTubeSlot.left + "%";
        item.style.top = snapSlots.gasTubeSlot.top + "%";
      } else {
        const slot = snapSlots.toolSlot[uiState.toolCardCount % snapSlots.toolSlot.length];
        item.style.left = slot.left + "%";
        item.style.top = slot.top + "%";
        uiState.toolCardCount += 1;
      }
      if (eq.isHeater && payload.id === "hot-plate") {
        item.innerHTML = `<span class="scene-heater hotplate"><i></i><b></b></span><strong>Плитка</strong>`;
      } else if (eq.isHeater) {
        item.innerHTML = `<span class="scene-heater burner-device"><i></i><b></b><em></em></span><strong>Горелка</strong>`;
      } else {
        item.innerHTML = `<span class="placed-visual ${eq.icon}"></span><strong>${eq.label}</strong>`;
      }
      if (!labState.equipment.includes(payload.id)) labState.equipment.push(payload.id);
      addNote("добавлено оборудование: " + eq.label);
      if (eq.isHeater) {
        labState.heaterPlaced = true;
        labState.heaterType = payload.id;
        labState.compatibleWithVessel = Boolean(labState.container);
        activateToolSection("heat");
        setActiveTab("conditions");
        setResultMessage(eq.label + " поставлена под сосуд. Включайте нагрев только для сценариев, где он нужен.", "info");
      } else {
        setResultMessage("Добавлено оборудование: " + eq.label + ".", "info");
      }
    }

    dom.workspaceItems.appendChild(item);
    updateLabStatePanel();
  }

  function pulseNode(node) {
    node.classList.remove("pulse");
    void node.offsetWidth;
    node.classList.add("pulse");
  }

  function clearEffects(keepContent) {
    const shape = labState.container?.icon ? " vessel-" + labState.container.icon : "";
    const content = keepContent && labState.container && labState.reagents.length ? " has-content is-active-container" : "";
    const heat = labState.heating ? " heated" : "";
    dom.reactionVessel.className = "reaction-vessel" + shape + content + heat;
    dom.reactionVessel.removeAttribute("data-liquid");
    dom.bubbles.innerHTML = "";
    dom.gasHaze.innerHTML = "";
    dom.precipParticles.innerHTML = "";
    dom.solidLayer.innerHTML = "";
    dom.gasLabel.textContent = "";
    dom.gasLabel.classList.remove("is-visible");
    dom.gasOutlet.classList.remove("is-visible");
    if (keepContent) renderVesselContents();
  }

  function resetResultFields() {
    dom.reactionType.textContent = "—";
    dom.reactionEquation.textContent = "—";
    dom.reactionObservation.textContent = "—";
    dom.reactionExplanation.textContent = "—";
  }

  function makeBubbles(count) {
    dom.bubbles.innerHTML = "";
    for (let i = 0; i < count; i += 1) {
      const bubble = document.createElement("span");
      bubble.className = "bubble";
      const size = 4 + Math.random() * 8;
      bubble.style.width = size + "px";
      bubble.style.height = size + "px";
      bubble.style.left = 16 + Math.random() * 68 + "%";
      bubble.style.animationDelay = Math.random() * 0.7 + "s";
      bubble.style.animationDuration = 0.75 + Math.random() * 0.8 + "s";
      dom.bubbles.appendChild(bubble);
    }
  }

  function makeGasHaze() {
    dom.gasHaze.innerHTML = "";
    for (let i = 0; i < 7; i += 1) {
      const puff = document.createElement("span");
      puff.style.left = 25 + Math.random() * 46 + "%";
      puff.style.animationDelay = Math.random() * 0.7 + "s";
      dom.gasHaze.appendChild(puff);
    }
  }

  function showGasLabel(label) {
    dom.gasLabel.textContent = label ? label + "↑" : "";
    dom.gasLabel.classList.toggle("is-visible", Boolean(label));
  }

  function makePrecipitateParticles() {
    dom.precipParticles.innerHTML = "";
    for (let i = 0; i < 18; i += 1) {
      const particle = document.createElement("span");
      particle.style.left = 14 + Math.random() * 72 + "%";
      particle.style.animationDelay = Math.random() * 0.8 + "s";
      dom.precipParticles.appendChild(particle);
    }
  }

  function applyVisual(reaction) {
    clearEffects(true);
    const visual = reaction.visualEffect || { type: reaction.effect };
    const effectType = visual.type || reaction.effect;
    if (visual.liquidColor || reaction.liquidColor) dom.reactionVessel.dataset.liquid = visual.liquidColor || reaction.liquidColor;
    updateGasHardware(reaction);
    if (effectType === "colorChange" || effectType === "color_change" || effectType === "neutralization" || effectType === "coating") dom.reactionVessel.classList.add("color-changed");
    if (effectType === "precipitate") { dom.reactionVessel.classList.add("has-precipitate"); makePrecipitateParticles(); }
    if (effectType === "coating") { dom.reactionVessel.classList.add("has-precipitate", "metal-reaction"); makePrecipitateParticles(); addNote("появился металлический налёт"); }
    if (effectType === "gas") { makeBubbles(22); makeGasHaze(); showGasLabel(visual.gas || "газ"); addNote("обнаружено выделение газа"); }
    if (effectType === "metalReaction") { makeBubbles(16); showGasLabel(visual.gas || "H2"); dom.reactionVessel.classList.add("metal-reaction"); addNote("газ выделяется на поверхности металла"); }
    if (effectType === "heat" || effectType === "flash") { dom.reactionVessel.classList.add("has-flash"); makeBubbles(8); addNote("реакция прошла при нагревании"); }
    if (effectType === "steam") { dom.reactionVessel.classList.add("heated"); makeGasHaze(); showGasLabel("пар"); addNote("появился пар"); }
    if (effectType === "noReaction") dom.reactionVessel.classList.add("no-reaction");
    pulseNode(dom.reactionVessel);
  }

  function checkReaction() {
    const result = engine.evaluate(labState.reagents, { heating: labState.heating, container: labState.container });
    setActiveTab("result");
    const tone = result.ok ? "success" : result.status === "no_reaction" ? "error" : "warning";
    setResultMessage(result.message, tone);
    resetResultFields();
    if (result.reaction && !result.blockVisual && !result.reaction.blockVisual) applyVisual(result.reaction);
    if (result.blockVisual || result.reaction?.blockVisual) clearEffects(true);
    if (result.ok) {
      const task = tasks.find(item => item.reactionId === result.reaction.id);
      if (task) {
        uiState.taskDone.add(task.id);
        renderTasks();
      }
    }
    if (result.reaction) {
      dom.reactionType.textContent = result.reaction.type;
      dom.reactionEquation.textContent = result.reaction.equation;
      dom.reactionObservation.textContent = result.reaction.observation || "—";
      dom.reactionExplanation.textContent = result.reaction.explanation || "—";
    }
    if (window.ChemLabAPI?.isConfigured && window.ChemLabAPI.hasToken()) {
      const reaction = result.reaction || {};
      window.ChemLabAPI.saveAttempt({
        reaction_id: reaction.id || "unknown",
        reaction_slug: reaction.slug || reaction.id || "unknown",
        selected_reactants: labState.reagents.slice(),
        equipment: labState.equipment.slice(),
        used_heating: labState.heating,
        result_status: result.ok ? "success" : result.status || "failed",
        observation: reaction.observation || result.message,
        duration_ms: Math.max(0, Date.now() - experimentStartedAt),
        input: {
          reagents: labState.reagents,
          equipment: labState.equipment,
          container: labState.container?.id || null,
          heating: labState.heating
        },
        result: {
          ok: result.ok,
          status: result.status,
          message: result.message
        }
      }).then(loadProgressSummary).catch(function () {
        console.warn("Failed to save experiment attempt.");
      });
    } else if (window.ChemLabAPI?.isConfigured && result.ok) {
      setResultMessage(result.message + " Войдите, чтобы сохранить прогресс.", "info");
    }
  }

  function resetLab() {
    labState.container = null;
    labState.reagents = [];
    labState.equipment = [];
    labState.heating = false;
    labState.heaterPlaced = false;
    labState.heaterEnabled = false;
    labState.heaterType = null;
    labState.compatibleWithVessel = false;
    labState.heatLevel = 0;
    uiState.reagentCardCount = 0;
    uiState.toolCardCount = 0;
    experimentStartedAt = Date.now();
    dom.workspaceItems.innerHTML = "";
    dom.reactionVessel.className = "reaction-vessel";
    dom.bubbles.innerHTML = "";
    dom.gasHaze.innerHTML = "";
    dom.precipParticles.innerHTML = "";
    dom.solidLayer.innerHTML = "";
    dom.gasOutlet.classList.remove("is-visible");
    dom.gasLabel.classList.remove("is-visible");
    dom.gasLabel.textContent = "";
    setResultMessage("Перетащите сосуд и реактивы на рабочий стол. После каждого действия состав опыта обновится.", "");
    resetResultFields();
    updateHeating(false, true);
    updateLabStatePanel();
    setActiveTab("instruction");
  }

  function startReactionScenario(reactionId, openLab) {
    labState.activeReactionId = reactionId;
    const reaction = activeReaction();
    resetLab();
    uiState.activeDockCategory = "glassware";
    document.querySelectorAll("[data-dock-category]").forEach(function (node) {
      node.classList.toggle("is-active", node.dataset.dockCategory === "glassware");
    });
    renderDock();
    updateInstructionPanel();
    setResultMessage("Сценарий загружен: " + reaction.name + ". Следуйте инструкции справа.", "info");
    addNote("загружен сценарий: " + reaction.name);
    if (openLab) setActiveSection("lab");
  }

  function setupDropzone() {
    dom.dropzone.addEventListener("dragover", event => {
      event.preventDefault();
      dom.dropzone.classList.add("is-over");
    });
    dom.dropzone.addEventListener("dragleave", () => dom.dropzone.classList.remove("is-over"));
    dom.dropzone.addEventListener("drop", event => {
      event.preventDefault();
      dom.dropzone.classList.remove("is-over");
      const payload = parseDragPayload(event);
      if (payload.type && payload.id) addWorkspaceItem(payload);
    });
  }

  function setupDockTabs() {
    document.querySelectorAll("[data-dock-category]").forEach(tab => {
      tab.addEventListener("click", () => {
        uiState.activeDockCategory = tab.dataset.dockCategory;
        document.querySelectorAll("[data-dock-category]").forEach(node => node.classList.toggle("is-active", node === tab));
        renderDock();
      });
    });
  }

  function setupToolRail() {
    document.querySelectorAll("[data-tool]").forEach(button => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-tool]").forEach(node => node.classList.toggle("is-active", node === button));
        document.querySelectorAll("[data-tool-section]").forEach(section => section.classList.toggle("is-active", section.dataset.toolSection === button.dataset.tool));
        document.body.dataset.activeTool = button.dataset.tool;
        if (button.dataset.tool === "heat") setActiveTab("conditions");
        if (button.dataset.tool === "measure") setActiveTab("conditions");
        if (button.dataset.tool === "notes") setActiveTab("result");
      });
    });
  }

  function activateToolSection(name) {
    document.querySelectorAll("[data-tool]").forEach(node => node.classList.toggle("is-active", node.dataset.tool === name));
    document.querySelectorAll("[data-tool-section]").forEach(section => section.classList.toggle("is-active", section.dataset.toolSection === name));
    document.body.dataset.activeTool = name;
  }

  function setupEffectGuide() {
    document.querySelectorAll("[data-effect-filter]").forEach(button => {
      button.addEventListener("click", () => {
        const labels = {
          gas: "Газ: пузырьки разного размера поднимаются через жидкость, над сосудом появляется подпись газа.",
          precipitate: "Осадок: частицы опускаются вниз и образуют слой на дне.",
          colorChange: "Изменение цвета: жидкость плавно меняет оттенок.",
          heat: "Нагрев: пламя и тёплое свечение находятся строго под сосудом.",
          steam: "Пар: лёгкая дымка появляется только при нагревании.",
          metalReaction: "Металл с кислотой: пузырьки появляются на поверхности металла.",
          noReaction: "Нет реакции: сосуд остаётся спокойным, видимых признаков нет."
        };
        setResultMessage(labels[button.dataset.effectFilter], "info");
      });
    });
  }

  function setupControls() {
    document.querySelectorAll("[data-panel-tab]").forEach(tab => tab.addEventListener("click", () => setActiveTab(tab.dataset.panelTab)));
    dom.heatCheckbox.addEventListener("change", () => updateHeating(dom.heatCheckbox.checked));
    dom.heatToggle.addEventListener("click", () => updateHeating(!labState.heating));
    dom.drawerHeatToggle.addEventListener("click", () => updateHeating(!labState.heating));
    dom.heatLevel.addEventListener("input", () => {
      labState.heatLevel = Number(dom.heatLevel.value);
      if (labState.heatLevel === 0 && labState.heaterEnabled) updateHeating(false);
      if (labState.heatLevel > 0 && labState.heaterEnabled) updateHeatingUi();
      updateHeatingUi();
    });
    dom.checkReaction.addEventListener("click", checkReaction);
    get("resetLab").addEventListener("click", resetLab);
    dom.addNote.addEventListener("click", () => {
      addNote(dom.manualNote.value.trim());
      dom.manualNote.value = "";
    });
    dom.clearNotes.addEventListener("click", () => { dom.noteList.innerHTML = ""; });
    dom.elementSearch.addEventListener("input", renderPeriodicTable);
    dom.reactionSearch.addEventListener("input", renderReactionCatalog);
    dom.handbookSearch.addEventListener("input", renderHandbook);
  }

  function cacheDom() {
    [
      "backendStatus", "debugStatus", "guidedMode", "freeMode", "authWidget", "authToggle", "authPanel", "authUserPanel", "authForms", "authUserName", "authAvatar", "authUserEmail", "authLogout", "loginForm", "loginEmail", "loginPassword", "registerForm", "registerName", "registerEmail", "registerPassword", "authSwitch", "authMessage", "progressSummary", "progressCompleted", "progressLast", "shelfReagents", "equipmentDock", "wallPeriodicGrid", "benchDropzone", "workspaceItems", "reactionVessel", "bubbles", "gasHaze", "gasOutlet", "gasLabel", "solidLayer", "precipParticles", "resultMessage", "reactionType", "reactionEquation", "reactionObservation", "reactionExplanation", "selectedReagents", "containerName", "requiredReagents", "readinessText", "expectedEffect", "compositionList", "heatCheckbox", "heatSwitchRow", "heatToggle", "heatStatus", "checkReaction", "instructionPanel", "activeExperimentName", "elementGrid", "periodicGrid", "elementCard", "elementFilters", "elementSearch", "reactionFilters", "reactionCatalog", "reactionSearch", "taskList", "taskProgress", "taskScore", "handbookGrid", "handbookSearch", "reagentInfo", "heatDot", "heatModeText", "drawerHeatToggle", "heatLevel", "temperatureValue", "phValue", "timerValue", "volumeValue", "manualNote", "addNote", "clearNotes", "noteList"
    ].forEach(id => { dom[id] = get(id); });
    dom.dropzone = dom.benchDropzone;
  }

  async function loadProgressSummary() {
    if (!window.ChemLabAPI?.isConfigured || !window.ChemLabAPI.hasToken() || !dom.progressSummary) return;
    try {
      const progress = await window.ChemLabAPI.getProgress();
      const summary = progress.summary || {};
      const lastDate = summary.last_attempt_at ? new Date(summary.last_attempt_at).toLocaleString("ru-RU") : "";
      dom.progressSummary.hidden = false;
      dom.progressCompleted.textContent = `${summary.completed_attempts || 0} экспериментов · ${summary.progress_percent || 0}%`;
      dom.progressLast.textContent = summary.last_reaction ? `Последняя реакция: ${summary.last_reaction}${lastDate ? " · " + lastDate : ""}` : "Нет сохранённых попыток";
    } catch (error) {
      dom.progressSummary.hidden = true;
    }
  }

  function setAuthMessage(message, tone) {
    if (!dom.authMessage) return;
    dom.authMessage.textContent = message || "";
    dom.authMessage.dataset.tone = tone || "info";
  }

  function setAuthPanelOpen(open) {
    if (!dom.authPanel || !dom.authToggle) return;
    dom.authPanel.hidden = !open;
    dom.authToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function renderGuestAuth() {
    if (dom.authUserName) dom.authUserName.textContent = "Войти";
    if (dom.authAvatar) dom.authAvatar.textContent = "?";
    if (dom.authUserPanel) dom.authUserPanel.hidden = true;
    if (dom.authForms) dom.authForms.hidden = false;
    if (dom.progressSummary) dom.progressSummary.hidden = true;
    updateDebugStatus();
  }

  function renderUserAuth(user) {
    const label = user?.name || user?.email || "Пользователь";
    if (dom.authUserName) dom.authUserName.textContent = label;
    if (dom.authAvatar) dom.authAvatar.textContent = String(label).slice(0, 1).toUpperCase();
    if (dom.authUserEmail) dom.authUserEmail.textContent = user?.email || label;
    if (dom.authUserPanel) dom.authUserPanel.hidden = false;
    if (dom.authForms) dom.authForms.hidden = true;
    updateDebugStatus();
  }

  async function refreshAuthUser() {
    if (!window.ChemLabAPI?.isConfigured) {
      renderGuestAuth();
      setAuthMessage("Вход временно недоступен. Проверьте, что сервер запущен.", "warning");
      return;
    }
    if (!window.ChemLabAPI.hasToken()) {
      renderGuestAuth();
      return;
    }
    try {
      const user = await window.ChemLabAPI.getMe();
      renderUserAuth(user);
      await loadProgressSummary();
    } catch (error) {
      window.ChemLabAPI.logout();
      renderGuestAuth();
      setAuthMessage("Сессия истекла. Войдите снова.", "warning");
    }
  }

  function setupAuth() {
    if (!dom.authToggle) return;
    dom.authToggle.addEventListener("click", function () {
      setAuthPanelOpen(dom.authPanel?.hidden);
    });
    document.addEventListener("click", function (event) {
      if (!dom.authWidget || dom.authWidget.contains(event.target)) return;
      setAuthPanelOpen(false);
    });
    dom.authSwitch?.addEventListener("click", function () {
      const showRegister = dom.registerForm?.hidden;
      if (dom.loginForm) dom.loginForm.hidden = showRegister;
      if (dom.registerForm) dom.registerForm.hidden = !showRegister;
      dom.authSwitch.textContent = showRegister ? "Уже есть аккаунт" : "Создать аккаунт";
      setAuthMessage("");
    });
    dom.loginForm?.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!window.ChemLabAPI?.isConfigured) {
        setAuthMessage("Вход временно недоступен. Проверьте, что сервер запущен.", "warning");
        return;
      }
      try {
        setAuthMessage("Выполняется вход...");
        const resp = await window.ChemLabAPI.login(dom.loginEmail.value, dom.loginPassword.value);
        renderUserAuth(resp.user);
        setAuthMessage("Вход выполнен.", "success");
        await loadProgressSummary();
      } catch (error) {
        setAuthMessage(error.message || "Не удалось войти.", "error");
      }
    });
    dom.registerForm?.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (!window.ChemLabAPI?.isConfigured) {
        setAuthMessage("Регистрация временно недоступна. Проверьте, что сервер запущен.", "warning");
        return;
      }
      try {
        setAuthMessage("Создаём аккаунт...");
        const resp = await window.ChemLabAPI.register(dom.registerEmail.value, dom.registerPassword.value, dom.registerName.value);
        renderUserAuth(resp.user);
        setAuthMessage("Аккаунт создан.", "success");
        await loadProgressSummary();
      } catch (error) {
        setAuthMessage(error.message || "Не удалось зарегистрироваться.", "error");
      }
    });
    dom.authLogout?.addEventListener("click", function () {
      window.ChemLabAPI?.logout();
      renderGuestAuth();
      setAuthMessage("Вы вышли из аккаунта.");
    });
  }

  function setLabMode(mode) {
    uiState.mode = mode === "free" ? "free" : "guided";
    dom.guidedMode?.classList.toggle("is-active", uiState.mode === "guided");
    dom.freeMode?.classList.toggle("is-active", uiState.mode === "free");
    document.body.dataset.labMode = uiState.mode;
    updateInstructionPanel();
    setResultMessage(uiState.mode === "free"
      ? "Свободный режим: выберите любые вещества, система проверит базу подтверждённых реакций."
      : "Режим инструкции: следуйте шагам выбранного опыта.", "info");
  }

  function setupModeSwitch() {
    dom.guidedMode?.addEventListener("click", () => setLabMode("guided"));
    dom.freeMode?.addEventListener("click", () => setLabMode("free"));
  }

  function applyDemoTheme(theme) {
    const mode = theme === "light" ? "light" : "dark";
    document.body.classList.toggle("theme-light", mode === "light");
    document.body.classList.toggle("theme-dark", mode === "dark");
    const toggle = document.getElementById("demoThemeToggle");
    if (toggle) {
      toggle.textContent = mode === "light" ? "☾" : "☀";
      toggle.title = mode === "light" ? "Тёмная тема" : "Светлая тема";
      toggle.setAttribute("aria-label", mode === "light" ? "Включить тёмную тему" : "Включить светлую тему");
    }
    try { localStorage.setItem("chemlab-demo-theme", mode); } catch (error) {}
  }

  function setupDemoTheme() {
    let saved = "dark";
    try {
      saved = localStorage.getItem("chemlab-demo-theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    } catch (error) {}
    applyDemoTheme(saved);
    document.getElementById("demoThemeToggle")?.addEventListener("click", () => {
      applyDemoTheme(document.body.classList.contains("theme-light") ? "dark" : "light");
    });
  }

  async function init() {
    cacheDom();
    setupDemoTheme();
    await loadApiData();
    ingestConstructorProducts();
    engine = window.ChemLabReactions.createReactionEngine(window.ChemLabReactionData.reactions);
    setupNavigation();
    renderElementFilters();
    renderPeriodicTable();
    showElementCard(periodicElements[0]);
    renderReactionFilters();
    renderReactionCatalog();
    renderTasks();
    renderHandbook();
    renderShelfReagents();
    renderDock();
    renderWallPeriodic();
    setupDropzone();
    setupDockTabs();
    setupToolRail();
    document.body.dataset.activeTool = "equipment";
    setupEffectGuide();
    setupControls();
    setupAuth();
    setupModeSwitch();
    updateDebugStatus();
    updateInstructionPanel();
    window.ChemLabLabState = labState;
    window.ChemLabStartReaction = startReactionScenario;
    refreshAuthUser();
    resetLab();
    const pendingReagent = localStorage.getItem("chemlab_pending_reagent");
    if (pendingReagent) {
      localStorage.removeItem("chemlab_pending_reagent");
      setLabMode("free");
      activateToolSection("reagents");
      setResultMessage("Созданный продукт " + pendingReagent + " доступен на полке реактивов и может участвовать в следующих подтверждённых реакциях.", "info");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    init();
  });
})();
