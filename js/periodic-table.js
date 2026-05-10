(function () {
  "use strict";

  const categoryLabels = {
    alkali_metal: "Щелочной металл",
    alkaline_earth_metal: "Щёлочноземельный металл",
    transition_metal: "Переходный металл",
    post_transition_metal: "Постпереходный металл",
    metalloid: "Полуметалл",
    nonmetal: "Неметалл",
    halogen: "Галоген",
    noble_gas: "Благородный газ",
    lanthanide: "Лантаноид",
    actinide: "Актиноид",
    unknown: "Нет данных"
  };

  function value(input) {
    return input === null || input === undefined || input === "" ? "Нет данных" : String(input);
  }

  function normalize(raw) {
    const category = raw.category || raw.color_group || "unknown";
    return {
      id: raw.id,
      number: raw.atomic_number || raw.number,
      symbol: raw.symbol,
      name: raw.name || raw.name_ru || raw.name_en || raw.symbol,
      mass: raw.atomic_mass || raw.mass,
      group: raw.group_number || raw.group,
      period: raw.period,
      category,
      type: categoryLabels[category] || category,
      className: String(category).replaceAll("_", "-"),
      state: raw.state,
      electron_configuration: raw.electron_configuration,
      oxidation_states: raw.oxidation_states,
      electronegativity: raw.electronegativity,
      density: raw.density,
      melting_point: raw.melting_point,
      boiling_point: raw.boiling_point,
      discovered_by: raw.discovered_by,
      discovery_year: raw.discovery_year,
      usage: raw.usage || raw.applications,
      interesting_fact: raw.interesting_fact || raw.description,
      safety: raw.safety || raw.hazards
    };
  }

  function positionFor(element) {
    if (element.category === "lanthanide") return { column: Math.max(4, Math.min(17, element.number - 54)), row: 8 };
    if (element.category === "actinide") return { column: Math.max(4, Math.min(17, element.number - 86)), row: 9 };
    return { column: element.group || 3, row: element.period || 1 };
  }

  function property(label, val) {
    const row = document.createElement("div");
    row.className = "property";
    const span = document.createElement("span");
    span.textContent = label;
    const strong = document.createElement("strong");
    strong.textContent = value(val);
    row.append(span, strong);
    return row;
  }

  function section(title, rows) {
    const wrap = document.createElement("section");
    wrap.className = "element-detail-section";
    const heading = document.createElement("h3");
    heading.textContent = title;
    const list = document.createElement("div");
    list.className = "property-list";
    rows.forEach(([label, val]) => list.appendChild(property(label, val)));
    wrap.append(heading, list);
    return wrap;
  }

  function renderCard(element) {
    const card = document.getElementById("elementCard");
    card.textContent = "";

    const h2 = document.createElement("h2");
    h2.textContent = element.symbol;
    const h3 = document.createElement("h3");
    h3.textContent = element.name;
    const p = document.createElement("p");
    p.textContent = value(element.interesting_fact);
    card.append(h2, h3, p);

    card.append(
      section("Основное", [
        ["Атомный номер", element.number],
        ["Атомная масса", element.mass],
        ["Группа", element.group],
        ["Период", element.period],
        ["Категория", element.type],
        ["Агрегатное состояние", element.state]
      ]),
      section("Атомные свойства", [
        ["Электронная конфигурация", element.electron_configuration],
        ["Степени окисления", element.oxidation_states],
        ["Электроотрицательность", element.electronegativity]
      ]),
      section("Физические свойства", [
        ["Плотность", element.density],
        ["Температура плавления", element.melting_point],
        ["Температура кипения", element.boiling_point]
      ]),
      section("Химические свойства", [
        ["Кто открыл", element.discovered_by],
        ["Год открытия", element.discovery_year]
      ]),
      section("Применение", [["Где используется", element.usage], ["Интересный факт", element.interesting_fact]]),
      section("Безопасность", [["Безопасность/токсичность", element.safety]])
    );
  }

  async function loadElements() {
    if (window.ChemLabAPI) {
      try {
        const result = await window.ChemLabAPI.getElements();
        if (Array.isArray(result.elements) && result.elements.length) return result.elements;
      } catch (error) {
        console.warn("Backend недоступен, используется локальная таблица элементов.", error);
      }
    }
    return window.__CHEMLAB_ELEMENTS__?.elements || window.ChemLabElementData || [];
  }

  async function renderGrid() {
    const grid = document.getElementById("periodicGrid");
    const source = await loadElements();
    const elements = source.map(normalize).filter((element) => element.number && element.symbol);
    grid.textContent = "";

    elements.forEach((element) => {
      const pos = positionFor(element);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "element-cell " + element.className;
      cell.style.gridColumn = pos.column;
      cell.style.gridRow = pos.row;
      cell.dataset.number = String(element.number);

      const number = document.createElement("span");
      number.className = "number";
      number.textContent = element.number;
      const symbol = document.createElement("span");
      symbol.className = "symbol";
      symbol.textContent = element.symbol;
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = element.name;
      cell.append(number, symbol, name);

      cell.addEventListener("click", () => {
        document.querySelectorAll(".element-cell").forEach((node) => {
          node.classList.toggle("is-active", node.dataset.number === String(element.number));
        });
        renderCard(element);
      });
      grid.appendChild(cell);
    });

    if (elements[0]) {
      const first = grid.querySelector('[data-number="' + elements[0].number + '"]');
      if (first) first.classList.add("is-active");
      renderCard(elements[0]);
    }
  }

  document.addEventListener("DOMContentLoaded", renderGrid);
})();
