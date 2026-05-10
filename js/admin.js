(function () {
  "use strict";

  const api = window.ChemLabApiClient;
  const t = window.ChemLabI18n.label;
  const state = { substances: [], reactions: [], elements: [], tasks: [], handbook: [], editing: null };

  const login = document.getElementById("adminLogin");
  const shell = document.getElementById("adminShell");
  const modal = document.getElementById("adminModal");
  const modalForm = document.getElementById("modalForm");

  function text(value) {
    return value === null || value === undefined || value === "" ? "Нет данных" : String(value);
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleString("ru-RU") : "Нет данных";
  }

  function setMessage(id, message) {
    document.getElementById(id).textContent = message || "";
  }

  function table(id, columns, rows) {
    const el = document.getElementById(id);
    el.textContent = "";
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    columns.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col.label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    const tbody = document.createElement("tbody");
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      columns.forEach((col) => {
        const td = document.createElement("td");
        const value = typeof col.value === "function" ? col.value(row) : row[col.value];
        if (value instanceof Node) td.appendChild(value);
        else td.textContent = text(value);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    el.append(thead, tbody);
  }

  function actions(items) {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.gap = "6px";
    wrap.style.flexWrap = "wrap";
    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn-admin btn-small " + (item.danger ? "btn-danger" : "btn-secondary");
      button.textContent = item.label;
      button.addEventListener("click", item.onClick);
      wrap.appendChild(button);
    });
    return wrap;
  }

  function status(active) {
    const span = document.createElement("span");
    span.className = "status-pill " + (active ? "" : "status-off");
    span.textContent = active ? "Включено" : "Выключено";
    return span;
  }

  async function ensureAdmin() {
    if (!api.getToken()) return false;
    try {
      const result = await api.get("/me");
      if (result.user?.role !== "admin") throw new Error("Текущий аккаунт не является администратором.");
      login.hidden = true;
      shell.hidden = false;
      return true;
    } catch (error) {
      setMessage("adminLoginMessage", error.message);
      return false;
    }
  }

  async function loadAll() {
    const [dashboard, users, reactions, substances, elements, experiments, tasks, handbook] = await Promise.all([
      api.get("/admin/dashboard"),
      api.get("/admin/users"),
      api.get("/admin/reactions"),
      api.get("/admin/substances"),
      api.get("/admin/periodic-elements"),
      api.get("/admin/experiments"),
      api.get("/admin/tasks"),
      api.get("/admin/handbook")
    ]);
    state.reactions = reactions.reactions || [];
    state.substances = substances.substances || [];
    state.elements = elements.elements || [];
    state.tasks = tasks.tasks || [];
    state.handbook = handbook.entries || [];
    renderDashboard(dashboard);
    renderUsers(users.users || []);
    renderReactions();
    renderSubstances();
    renderElements();
    renderTasks();
    renderHandbook();
    renderConstructor();
    renderExperiments(experiments.experiments || []);
  }

  function renderDashboard(data) {
    const stats = [
      ["Пользователи", data.totalUsers],
      ["Реакции", data.totalReactions],
      ["Вещества", data.totalSubstances],
      ["Проведённые опыты", data.totalExperiments]
    ];
    const root = document.getElementById("dashboardStats");
    root.textContent = "";
    stats.forEach(([label, value]) => {
      const card = document.createElement("article");
      card.className = "stat-card";
      const span = document.createElement("span");
      span.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      card.append(span, strong);
      root.appendChild(card);
    });
    table("activityTable", [
      { label: "Действие", value: "action" },
      { label: "Сущность", value: (r) => `${r.entity_type || ""} ${r.entity_id || ""}` },
      { label: "Дата", value: (r) => formatDate(r.created_at) }
    ], data.recentActivities || []);
    table("recentExperimentsTable", [
      { label: "Опыт", value: "reaction_title" },
      { label: "Результат", value: "result" },
      { label: "Дата", value: (r) => formatDate(r.created_at) }
    ], data.recentExperiments || []);
  }

  function renderUsers(users) {
    table("usersTable", [
      { label: "Имя", value: "name" },
      { label: "Email", value: "email" },
      { label: "Роль", value: (r) => t("role", r.role) },
      { label: "Создан", value: (r) => formatDate(r.created_at) },
      { label: "Последняя активность", value: (r) => formatDate(r.last_active_at) },
      { label: "Опыты", value: "experiments_count" },
      { label: "Последний опыт", value: "last_experiment_title" }
    ], users);
  }

  function renderReactions() {
    table("reactionsTable", [
      { label: "Название", value: "title" },
      { label: "Тип", value: (r) => t("reactionType", r.type) },
      { label: "Реактивы", value: (r) => (r.reactants || []).join(" + ") },
      { label: "Уравнение", value: "equation" },
      { label: "Опасность", value: (r) => t("danger", r.danger_level) },
      { label: "Статус", value: (r) => status(r.is_active) },
      { label: "Действия", value: (r) => actions([
        { label: "Редактировать", onClick: () => openReactionForm(r) },
        { label: r.is_active ? "Выключить" : "Включить", onClick: () => toggle("reactions", r.id) },
        { label: "Удалить", danger: true, onClick: () => remove("reactions", r.id) }
      ]) }
    ], state.reactions);
  }

  function renderSubstances() {
    table("substancesTable", [
      { label: "Название", value: "name" },
      { label: "Формула", value: "formula" },
      { label: "Тип", value: (r) => t("substanceType", r.type) },
      { label: "Состояние", value: (r) => t("state", r.state) },
      { label: "Опасность", value: (r) => t("danger", r.danger_level) },
      { label: "Статус", value: (r) => status(r.is_active) },
      { label: "Действия", value: (r) => actions([
        { label: "Редактировать", onClick: () => openSubstanceForm(r) },
        { label: r.is_active ? "Выключить" : "Включить", onClick: () => toggle("substances", r.id) },
        { label: "Удалить", danger: true, onClick: () => remove("substances", r.id) }
      ]) }
    ], state.substances);
  }

  function renderElements() {
    table("elementsTable", [
      { label: "№", value: "atomic_number" },
      { label: "Символ", value: "symbol" },
      { label: "Название", value: "name" },
      { label: "Группа", value: "group_number" },
      { label: "Период", value: "period" },
      { label: "Применение", value: "usage" },
      { label: "Безопасность", value: "safety" },
      { label: "Действия", value: (r) => actions([{ label: "Редактировать", onClick: () => openElementForm(r) }]) }
    ], state.elements);
  }

  function renderTasks() {
    table("tasksTable", [
      { label: "Название", value: "title" },
      { label: "Уровень", value: "level" },
      { label: "Цель", value: "goal" },
      { label: "Реактивы", value: (r) => Array.isArray(r.reagents) ? r.reagents.join(" + ") : text(r.reagents) },
      { label: "Реакция", value: "reaction_id" },
      { label: "Баллы", value: "points" },
      { label: "Статус", value: (r) => status(r.is_active) },
      { label: "Действия", value: (r) => actions([
        { label: "Редактировать", onClick: () => openTaskForm(r) },
        { label: r.is_active ? "Выключить" : "Включить", onClick: () => toggle("tasks", r.id) },
        { label: "Удалить", danger: true, onClick: () => remove("tasks", r.id) }
      ]) }
    ], state.tasks);
  }

  function renderHandbook() {
    table("handbookTable", [
      { label: "Категория", value: "category" },
      { label: "Значок", value: "icon" },
      { label: "Заголовок", value: "title" },
      { label: "Текст", value: "text" },
      { label: "Порядок", value: "sort_order" },
      { label: "Статус", value: (r) => status(r.is_active) },
      { label: "Действия", value: (r) => actions([
        { label: "Редактировать", onClick: () => openHandbookForm(r) },
        { label: r.is_active ? "Выключить" : "Включить", onClick: () => toggle("handbook", r.id) },
        { label: "Удалить", danger: true, onClick: () => remove("handbook", r.id) }
      ]) }
    ], state.handbook);
  }

  function renderExperiments(rows) {
    table("experimentsTable", [
      { label: "ID", value: "id" },
      { label: "Пользователь", value: "user_id" },
      { label: "Реакция", value: "reaction_title" },
      { label: "Результат", value: "result" },
      { label: "Дата", value: (r) => formatDate(r.created_at) }
    ], rows);
  }

  function renderConstructor() {
    const form = document.getElementById("constructorForm");
    if (!form) return;
    form.innerHTML = `
      <div class="form-grid">
        <label>Название опыта <input name="title" placeholder="Например: Получение кислорода" required></label>
        <label>Тип реакции <select name="type">${Object.keys(window.ChemLabI18n.dictionaries.reactionType).map((key) => `<option value="${key}">${t("reactionType", key)}</option>`).join("")}</select></label>
        <label>Реактив A <select name="reactant_a_id">${substanceOptions("")}</select></label>
        <label>Реактив B <select name="reactant_b_id">${substanceOptions("")}</select></label>
        <label>Уравнение <input name="equation" placeholder="A + B -> C"></label>
        <label>Продукты <input name="products" placeholder="Продукт 1, продукт 2"></label>
        <label>Цвет после реакции <input name="liquid_color_after" placeholder="clear, cloudy, pink"></label>
        <label>Название газа <input name="gas_name" placeholder="CO2, O2, NH3"></label>
        <label>Цвет осадка <input name="precipitate_color" placeholder="white, blue, yellow"></label>
        <label>Опасность <select name="danger_level"><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select></label>
      </div>
      <div class="check-grid">
        <label><input type="checkbox" name="has_gas"> Газ</label>
        <label><input type="checkbox" name="has_precipitate"> Осадок</label>
        <label><input type="checkbox" name="requires_heating"> Нагрев</label>
        <label><input type="checkbox" name="requires_catalyst"> Катализатор</label>
        <label><input type="checkbox" name="has_heat"> Тепло</label>
        <label><input type="checkbox" name="has_smoke"> Пар/дым</label>
        <label><input type="checkbox" name="has_flash"> Вспышка</label>
      </div>
      <label>Наблюдение <textarea name="observation" placeholder="Что увидит ученик"></textarea></label>
      <label>Объяснение <textarea name="explanation" placeholder="Химический смысл опыта"></textarea></label>
      <label>Техника безопасности <textarea name="safety" placeholder="Что важно помнить"></textarea></label>
      <button class="btn-admin" type="submit">Сохранить реакцию из конструктора</button>
    `;
    form.onsubmit = async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const fd = new FormData(form);
      ["has_gas", "has_precipitate", "requires_heating", "requires_catalyst", "has_heat", "has_smoke", "has_flash"].forEach((key) => data[key] = fd.has(key));
      data.products = String(data.products || "").split(",").map((v) => v.trim()).filter(Boolean);
      await api.post("/admin/reactions", data);
      form.reset();
      await loadAll();
      alert("Реакция сохранена.");
    };
  }

  function substanceOptions(selected) {
    return ['<option value="">Не выбрано</option>'].concat(state.substances.map((s) => `<option value="${s.id}" ${s.id === selected ? "selected" : ""}>${s.formula} - ${s.name}</option>`)).join("");
  }

  function openModal(title, html, onSubmit) {
    document.getElementById("modalTitle").textContent = title;
    modalForm.innerHTML = html;
    modalForm.onsubmit = async (event) => {
      event.preventDefault();
      await onSubmit(new FormData(modalForm));
      closeModal();
      await loadAll();
    };
    modal.classList.add("is-open");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modalForm.textContent = "";
  }

  function openReactionForm(item = {}) {
    openModal(item.id ? "Редактировать реакцию" : "Добавить реакцию", `
      <div class="form-grid">
        <label>Название реакции <input name="title" value="${text(item.title)}" required></label>
        <label>Тип реакции <select name="type">
          ${Object.keys(window.ChemLabI18n.dictionaries.reactionType).map((key) => `<option value="${key}" ${item.type === key ? "selected" : ""}>${t("reactionType", key)}</option>`).join("")}
        </select></label>
        <label>Реактив A <select name="reactant_a_id">${substanceOptions(item.reactant_a_id)}</select></label>
        <label>Реактив B <select name="reactant_b_id">${substanceOptions(item.reactant_b_id)}</select></label>
        <label>Уравнение <input name="equation" value="${text(item.equation)}"></label>
        <label>Продукты <input name="products" value="${Array.isArray(item.products) ? item.products.join(", ") : text(item.products)}"></label>
        <label>Температура <input name="required_temperature" value="${text(item.required_temperature)}"></label>
        <label>Катализатор <select name="catalyst_id">${substanceOptions(item.catalyst_id)}</select></label>
        <label>Цвет до реакции <input name="liquid_color_before" value="${text(item.liquid_color_before)}"></label>
        <label>Цвет после реакции <input name="liquid_color_after" value="${text(item.liquid_color_after)}"></label>
        <label>Название газа <input name="gas_name" value="${text(item.gas_name)}"></label>
        <label>Цвет осадка <input name="precipitate_color" value="${text(item.precipitate_color)}"></label>
        <label>Уровень опасности <select name="danger_level">
          <option value="low">Низкий</option><option value="medium" ${item.danger_level === "medium" ? "selected" : ""}>Средний</option><option value="high" ${item.danger_level === "high" ? "selected" : ""}>Высокий</option>
        </select></label>
      </div>
      <div class="check-grid">
        <label><input type="checkbox" name="requires_heating" ${item.requires_heating ? "checked" : ""}> Нужен нагрев</label>
        <label><input type="checkbox" name="requires_catalyst" ${item.requires_catalyst ? "checked" : ""}> Нужен катализатор</label>
        <label><input type="checkbox" name="has_gas" ${item.has_gas ? "checked" : ""}> Есть газ</label>
        <label><input type="checkbox" name="has_precipitate" ${item.has_precipitate ? "checked" : ""}> Есть осадок</label>
        <label><input type="checkbox" name="has_heat" ${item.has_heat ? "checked" : ""}> Есть тепло</label>
        <label><input type="checkbox" name="has_smoke" ${item.has_smoke ? "checked" : ""}> Дым/пар</label>
        <label><input type="checkbox" name="has_flash" ${item.has_flash ? "checked" : ""}> Вспышка</label>
      </div>
      <label>Наблюдение <textarea name="observation">${text(item.observation)}</textarea></label>
      <label>Объяснение <textarea name="explanation">${text(item.explanation)}</textarea></label>
      <label>Техника безопасности <textarea name="safety">${text(item.safety)}</textarea></label>
      <button class="btn-admin" type="submit">Сохранить</button>
    `, async (form) => {
      const body = Object.fromEntries(form.entries());
      ["requires_heating", "requires_catalyst", "has_gas", "has_precipitate", "has_heat", "has_smoke", "has_flash"].forEach((key) => body[key] = form.has(key));
      body.products = String(body.products || "").split(",").map((v) => v.trim()).filter(Boolean);
      if (item.id) await api.put("/admin/reactions/" + encodeURIComponent(item.id), body);
      else await api.post("/admin/reactions", body);
    });
  }

  function openSubstanceForm(item = {}) {
    openModal(item.id ? "Редактировать вещество" : "Добавить вещество", `
      <div class="form-grid">
        <label>Название <input name="name" value="${text(item.name)}" required></label>
        <label>Формула <input name="formula" value="${text(item.formula)}" required></label>
        <label>Тип <select name="type">${Object.keys(window.ChemLabI18n.dictionaries.substanceType).map((key) => `<option value="${key}" ${item.type === key ? "selected" : ""}>${t("substanceType", key)}</option>`).join("")}</select></label>
        <label>Состояние <select name="state">${Object.keys(window.ChemLabI18n.dictionaries.state).map((key) => `<option value="${key}" ${item.state === key ? "selected" : ""}>${t("state", key)}</option>`).join("")}</select></label>
        <label>Цвет <input name="color" value="${text(item.color)}"></label>
        <label>Ион катиона <input name="cation" value="${text(item.cation)}"></label>
        <label>Ион аниона <input name="anion" value="${text(item.anion)}"></label>
        <label>Уровень опасности <select name="danger_level"><option value="low">Низкий</option><option value="medium" ${item.danger_level === "medium" ? "selected" : ""}>Средний</option><option value="high" ${item.danger_level === "high" ? "selected" : ""}>Высокий</option></select></label>
      </div>
      <label>Краткое описание <textarea name="description">${text(item.description)}</textarea></label>
      <button class="btn-admin" type="submit">Сохранить</button>
    `, async (form) => {
      const body = Object.fromEntries(form.entries());
      if (item.id) await api.put("/admin/substances/" + encodeURIComponent(item.id), body);
      else await api.post("/admin/substances", body);
    });
  }

  function openElementForm(item) {
    openModal("Редактировать элемент " + item.symbol, `
      <label>Применение <textarea name="usage">${text(item.usage)}</textarea></label>
      <label>Интересный факт <textarea name="interesting_fact">${text(item.interesting_fact)}</textarea></label>
      <label>Безопасность <textarea name="safety">${text(item.safety)}</textarea></label>
      <div class="form-grid">
        <label>Электроотрицательность <input name="electronegativity" value="${text(item.electronegativity)}"></label>
        <label>Кто открыл <input name="discovered_by" value="${text(item.discovered_by)}"></label>
        <label>Год открытия <input name="discovery_year" value="${text(item.discovery_year)}"></label>
      </div>
      <button class="btn-admin" type="submit">Сохранить</button>
    `, async (form) => api.put("/admin/periodic-elements/" + encodeURIComponent(item.id), Object.fromEntries(form.entries())));
  }

  function openTaskForm(item = {}) {
    openModal(item.id ? "Редактировать задачу" : "Добавить задачу", `
      <div class="form-grid">
        <label>Название <input name="title" value="${text(item.title)}" required></label>
        <label>Уровень <select name="level"><option value="easy" ${item.level === "easy" ? "selected" : ""}>Лёгкий</option><option value="medium" ${item.level === "medium" ? "selected" : ""}>Средний</option><option value="hard" ${item.level === "hard" ? "selected" : ""}>Сложный</option></select></label>
        <label>Реактивы <input name="reagents" value="${Array.isArray(item.reagents) ? item.reagents.join(", ") : text(item.reagents)}"></label>
        <label>Реакция <select name="reaction_id"><option value="">Не выбрано</option>${state.reactions.map((r) => `<option value="${r.id}" ${item.reaction_id === r.id ? "selected" : ""}>${r.title}</option>`).join("")}</select></label>
        <label>Баллы <input name="points" type="number" min="0" value="${item.points || 10}"></label>
      </div>
      <label>Цель <textarea name="goal" required>${text(item.goal)}</textarea></label>
      <label>Подсказки <textarea name="hints" placeholder="Каждая подсказка с новой строки">${Array.isArray(item.hints) ? item.hints.join("\n") : ""}</textarea></label>
      <button class="btn-admin" type="submit">Сохранить</button>
    `, async (form) => {
      const body = Object.fromEntries(form.entries());
      body.reagents = String(body.reagents || "").split(",").map((v) => v.trim()).filter(Boolean);
      body.hints = String(body.hints || "").split(/\r?\n/).map((v) => v.trim()).filter(Boolean);
      body.points = Number(body.points || 10);
      if (item.id) await api.put("/admin/tasks/" + encodeURIComponent(item.id), body);
      else await api.post("/admin/tasks", body);
    });
  }

  function openHandbookForm(item = {}) {
    openModal(item.id ? "Редактировать статью справочника" : "Добавить статью справочника", `
      <div class="form-grid">
        <label>Категория <input name="category" value="${text(item.category || "Справочник")}" required></label>
        <label>Значок <input name="icon" value="${text(item.icon)}"></label>
        <label>Заголовок <input name="title" value="${text(item.title)}" required></label>
        <label>Порядок <input name="sort_order" type="number" value="${item.sort_order || 0}"></label>
      </div>
      <label>Текст <textarea name="text" required>${text(item.text)}</textarea></label>
      <button class="btn-admin" type="submit">Сохранить</button>
    `, async (form) => {
      const body = Object.fromEntries(form.entries());
      body.sort_order = Number(body.sort_order || 0);
      if (item.id) await api.put("/admin/handbook/" + encodeURIComponent(item.id), body);
      else await api.post("/admin/handbook", body);
    });
  }

  async function toggle(type, id) {
    await api.patch(`/admin/${type}/${encodeURIComponent(id)}/toggle`, {});
    await loadAll();
  }

  async function remove(type, id) {
    if (!confirm("Удалить запись? Это действие нельзя отменить.")) return;
    await api.delete(`/admin/${type}/${encodeURIComponent(id)}`);
    await loadAll();
  }

  function bindNav() {
    document.querySelectorAll("[data-admin-section]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-admin-section]").forEach((node) => node.classList.toggle("is-active", node === button));
        document.querySelectorAll(".admin-section").forEach((section) => section.classList.toggle("is-active", section.id === "section-" + button.dataset.adminSection));
        document.getElementById("adminTitle").textContent = button.textContent;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    bindNav();
    document.getElementById("closeModal").addEventListener("click", closeModal);
    document.getElementById("addReaction").addEventListener("click", () => openReactionForm());
    document.getElementById("addSubstance").addEventListener("click", () => openSubstanceForm());
    document.getElementById("addTask").addEventListener("click", () => openTaskForm());
    document.getElementById("addHandbook").addEventListener("click", () => openHandbookForm());
    document.getElementById("adminLogout").addEventListener("click", async () => {
      await window.ChemLabAuth.logout();
      location.reload();
    });
    document.getElementById("adminLoginForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage("adminLoginMessage", "");
      try {
        await window.ChemLabAuth.login(document.getElementById("adminEmail").value, document.getElementById("adminPassword").value);
        if (await ensureAdmin()) await loadAll();
      } catch (error) {
        setMessage("adminLoginMessage", error.message);
      }
    });
    if (await ensureAdmin()) await loadAll();
  });
})();
