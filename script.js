(() => {
  const STORAGE_LANG = "chemlab_lang";
  const STORAGE_THEME = "chemlab_theme";

  const translations = {
    tj: {
      "nav.lab": "Озмоишгоҳ",
      "nav.potential": "Потенсиал",
      "nav.features": "Имкониятҳо",
      "nav.scenarios": "Сенарияҳо",
      "nav.roadmap": "Рушд",
      "hero.title": "Озмоишгоҳи рақамии химия барои мактабҳо ва донишгоҳҳои Тоҷикистон",
      "hero.lead": "ChemLab TJ химияро бехатар, фаҳмо ва аён мекунад, ҳатто дар ҷойҳое, ки озмоишгоҳи пурра нест.",
      "hero.openLab": "Кушодани озмоишгоҳ",
      "hero.viewLab": "Дидани блоки 3D",
      "hero.openTable": "Ҷадвали Менделеев",
      "hero.proofPupils": "хонанда дар низоми маориф",
      "hero.proofTeachers": "омӯзгор дар мактабҳо",
      "hero.proofStem": "асоси платформаи оянда",
      "hero.reactionLabel": "Реаксия",
      "hero.reactionText": "таҳшини сафеди AgCl бе хавф барои синф",
      "hero.audienceText": "аудиторияе, ки лоиҳа метавонад барои он муфид бошад",
      "lab.label": "Озмоишгоҳи рақамӣ",
      "lab.title": "Таҷрибаи асосӣ мисли саҳнаи муосири STEM менамояд",
      "lab.lead": "Колбаи шишагии калон, пробиркаҳо, кортҳои моддаҳо ва панели реаксия ҳисси таҷрибаи воқеиро медиҳанд, ки онро бехатар такрор кардан мумкин аст.",
      "lab.panelStatus": "Сенарияи таҷриба",
      "lab.panelText": "Омӯзгор реаксияро оғоз мекунад, хонандагон мушоҳида, муодила ва хулосаро мебинанд.",
      "lab.step1": "Реагентҳо",
      "lab.step2": "Омехтан",
      "lab.step3": "Таҳшин",
      "lab.cta": "Оғози демо",
      "lab.resultLabel": "Мушоҳида",
      "lab.resultTitle": "Таҳшини сафед пайдо мешавад",
      "lab.resultText": "Натиҷаи визуалӣ ба хонанда кӯмак мекунад, ки формула, раванд ва хулосаи илмиро пайваст кунад.",
      "lab.card1Title": "Намоиши бехатар",
      "lab.card1Text": "Реаксияҳои хатарнок ё номуносиб ҳамчун симулятсия бе хавф нишон дода мешаванд.",
      "lab.card2Title": "Такрори таҷриба",
      "lab.card2Text": "Хонанда шароитро иваз мекунад, таҷрибаро такрор мекунад ва тағйири натиҷаро мебинад.",
      "lab.card3Title": "Хулосаи тайёр",
      "lab.card3Text": "Пас аз реаксия мушоҳида, муодила ва шарҳи кӯтоҳ барои муҳокима дастрас аст.",
      "potential.label": "Маориф дар Тоҷикистон",
      "potential.title": "Бозори воқеӣ, аудиторияи равшан ва арзиши иҷтимоӣ",
      "potential.lead": "ChemLab TJ барои кишваре сохта мешавад, ки дар он зиёда аз 2,3 млн хонанда ва 130 ҳазор омӯзгор дар низоми босуръат рушдёбандаи маориф фаъолият мекунанд. Аудиторияи умумии таълимӣ, ки ChemLab TJ метавонад барои он муфид бошад, аз 1 млн нафар зиёд аст.",
      "stat.population": "аҳолӣ дар 01.01.2026",
      "stat.audience": "аудиторияи умумии таълимӣ, ки ChemLab TJ метавонад барои он муфид бошад",
      "stat.schools": "муассисаҳои таҳсилоти умумӣ",
      "stat.pupils": "хонандагон дар мактабҳо",
      "stat.teachers": "омӯзгорон",
      "stat.universities": "муассисаҳои таҳсилоти олӣ",
      "stat.students": "донишҷӯёни донишгоҳҳо",
      "features.label": "Барои кӣ",
      "features.title": "Платформа барои дарс, омодагии мустақил ва намоиш",
      "features.studentTitle": "Хонандагони синфҳои 7-11",
      "features.studentText": "Хосиятҳои моддаҳоро тавассути таҷрибаҳои визуалӣ, кортҳои элементҳо ва сенарияҳои такроршаванда мефаҳманд.",
      "features.teacherTitle": "Омӯзгорони химия",
      "features.teacherText": "Воситае мегиранд, ки равандҳои душворро дар экран бе омодагии зиёди кабинет шарҳ медиҳад.",
      "features.schoolTitle": "Мактабҳо бе озмоишгоҳи пурра",
      "features.schoolText": "Метавонанд реаксияҳои асосӣ ва қоидаҳои бехатариро ҳатто бо таҷҳизоти маҳдуд нишон диҳанд.",
      "features.vuzTitle": "Коллеҷҳо ва донишгоҳҳо",
      "features.vuzText": "Симулятсияҳоро ҳамчун қабати воридшавӣ пеш аз амалия ва такрор пас аз корҳои озмоишӣ истифода мебаранд.",
      "features.olympTitle": "Олимпиада ва имтиҳонҳо",
      "features.olympText": "Мушоҳида, муодилаҳои реаксия ва мантиқи хулосаро дар интерфейси фаҳмо тамрин мекунанд.",
      "learning.label": "Чаро ин муҳим аст",
      "learning.title": "Химия фаҳмотар мешавад, вақте раванд дида мешавад",
      "learning.lead": "Дар ҳар мактаб гузаронидани реаксияҳо мунтазам қулай ё бехатар нест. Озмоишгоҳи рақамӣ равандро бе хавф нишон медиҳад: хонанда таҷрибаро такрор мекунад, моддаҳоро меомӯзад, натиҷаро мебинад ва хулоса мебарорад.",
      "learning.b1": "визуализатсияи равандҳои душвор",
      "learning.b2": "намоиши бехатари реаксияҳо",
      "learning.b3": "версияҳои русӣ ва тоҷикӣ",
      "learning.b4": "асос барои платформаи STEM",
      "learning.card1": "Синф мушоҳида ва хулосаро муҳокима мекунад",
      "learning.card2": "Реаксияи интерактивӣ дар браузер дастрас мемонад",
      "roadmap.label": "Чаро сармоягузорӣ мумкин аст",
      "roadmap.title": "Аз демо ба платформаи рақамии STEM-маориф",
      "roadmap.lead": "Лоиҳаро марҳила ба марҳила ҷорӣ кардан мумкин аст: аз химия оғоз намуда, нақшҳои корбарон ва аналитикаро илова кардан, сипас ба биология, физика ва STEM васеъ намудан.",
      "roadmap.r1Title": "Нақшҳо ва синфҳо",
      "roadmap.r1Text": "Хонанда, омӯзгор ва админ бо сенарияҳои гуногуни кор.",
      "roadmap.r2Title": "Аналитикаи пешрафт",
      "roadmap.r2Text": "Натиҷаҳои таҷрибаҳо, супоришҳо ва динамикаи фаҳмиши мавзӯъҳо.",
      "roadmap.r3Title": "Миқёсгирии STEM",
      "roadmap.r3Text": "Биология, физика ва озмоишгоҳҳои рақамии байнифаннӣ.",
      "footer.text": "Платформаи рақамии STEM барои маорифи Тоҷикистон",
      "footer.top": "Ба боло"
    }
  };

  const ruText = new Map();
  const langToggle = document.getElementById("langToggle");
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("siteNav");

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    ruText.set(node.getAttribute("data-i18n"), node.textContent);
  });

  function setLanguage(lang) {
    const active = lang === "tj" ? "tj" : "ru";
    document.documentElement.lang = active;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      node.textContent = active === "tj" && translations.tj[key] ? translations.tj[key] : ruText.get(key);
    });
    if (langToggle) langToggle.textContent = active.toUpperCase();
    localStorage.setItem(STORAGE_LANG, active);
  }

  function setTheme(theme) {
    const mode = theme === "light" ? "light" : "dark";
    document.body.classList.toggle("theme-light", mode === "light");
    document.body.classList.toggle("theme-dark", mode === "dark");
    if (themeToggle) themeToggle.textContent = mode === "light" ? "Light" : "Dark";
    localStorage.setItem(STORAGE_THEME, mode);
  }

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      const current = localStorage.getItem(STORAGE_LANG) || "ru";
      setLanguage(current === "ru" ? "tj" : "ru");
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.body.classList.contains("theme-light");
      setTheme(isLight ? "dark" : "light");
    });
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => nav.classList.remove("open"));
    });
  }

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (window.matchMedia("(max-width: 820px)").matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  setLanguage(localStorage.getItem(STORAGE_LANG) || "ru");
  setTheme(localStorage.getItem(STORAGE_THEME) || "dark");
})();
