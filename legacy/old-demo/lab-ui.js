(() => {
  const get = (id) => document.getElementById(id);
  const dom = {
    a: get("substanceA"),
    b: get("substanceB"),
    amountA: get("amountA"),
    amountB: get("amountB"),
    concentration: get("concentration"),
    temperature: get("temperature"),
    heating: get("heating"),
    catalyst: get("catalyst"),
    run: get("runReaction"),
    prepare: get("prepareReaction"),
    reset: get("resetReaction"),
    status: get("labStatus"),
    panel: get("labPanel"),
    observation: get("obs"),
    equation: get("eq"),
    reactionType: get("reactionType"),
    reactionConditions: get("reactionConditions"),
    reactionNeeds: get("reactionNeeds"),
    explanation: get("exp"),
    safety: get("safe"),
    metaA: get("metaA"),
    metaB: get("metaB"),
    expected: get("expectedConditions"),
    liquid: get("liquid")
  };
  const safeText = (node, text) => { if (node) node.textContent = text; };
  const safeState = (node, state) => { if (node) node.dataset.state = state; };

  const state = {
    map: new Map(),
    substances: new Map(),
    prepared: false
  };

  async function loadData() {
    try {
      const [substancesRes, reactionsRes] = await Promise.all([
        fetch("./data/substances.json"),
        fetch("./data/reactions.json")
      ]);
      if (!substancesRes.ok || !reactionsRes.ok) throw new Error("bad response");
      const substances = await substancesRes.json();
      const reactions = await reactionsRes.json();
      return { substances, reactions };
    } catch (_) {
      return {
        substances: window.__CHEMLAB_SUBSTANCES__ || { substances: [] },
        reactions: window.__CHEMLAB_REACTIONS__ || { reactions: [] }
      };
    }
  }

  function normalizeSubstance(raw) {
    const type = raw.type || raw.category || "salt";
    let visualState = raw.visualState || "solution";
    if (!raw.visualState) {
      if (type === "metal") visualState = "metal_piece";
      else if (raw.state === "solid") visualState = "powder";
      else if (type === "water") visualState = "liquid";
    }
    return {
      ...raw,
      type,
      visualState,
      safetyLevel: raw.safetyLevel || raw.hazard_level || "low",
      ions: raw.ions || { cation: "", anion: "" }
    };
  }

  function fillSubstances(substances) {
    const makeOption = (value, text) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      return option;
    };
    dom.a.textContent = "";
    dom.b.textContent = "";
    dom.a.appendChild(makeOption("", "Выберите вещество"));
    dom.b.appendChild(makeOption("", "Выберите вещество"));
    substances.map(normalizeSubstance).forEach((s) => {
      const label = `${s.formula} - ${s.name}`;
      dom.a.appendChild(makeOption(s.id, label));
      dom.b.appendChild(makeOption(s.id, label));
      state.substances.set(s.id, s);
    });
  }

  function setStatus(key, text) {
    safeText(dom.status, `${window.LabEffects.getStateLabel(key)}. ${text}`);
  }

  function renderSubstanceMeta(selectEl, targetEl) {
    if (!selectEl || !targetEl) return;
    const item = state.substances.get(selectEl.value);
    if (!item) {
      safeText(targetEl, "Формула: — | Тип: — | Опасность: —");
      return;
    }
    safeText(targetEl, `Формула: ${item.formula} | Тип: ${item.type} | Опасность: ${item.safetyLevel || item.hazard_level}`);
  }

  function getCurrentReaction() {
    const A = dom.a.value;
    const B = dom.b.value;
    if (!A || !B || A === B) return null;
    return window.LabEngine.resolveReaction(state.map, state.substances, A, B);
  }

  function renderExpected() {
    const reaction = getCurrentReaction();
    if (!reaction) {
      safeText(dom.expected, "Ожидаемые условия: выберите пару веществ.");
      return;
    }
    const req = reaction.conditions;
    const parts = [
      `Температура: ${req.temperature}`,
      `Нагрев: ${req.heating_required ? "нужен" : "не обязателен"}`,
      `Катализатор: ${req.catalyst_required ? "нужен" : "не обязателен"}`,
      `Концентрация: ${req.concentration}`
    ];
    safeText(dom.expected, `Ожидаемые условия: ${parts.join(" | ")}`);
  }

  function renderResult(reaction, evalResult, ctx) {
    safeText(dom.reactionType, reaction?.type || "нет реакции");
    safeText(dom.reactionConditions, `T=${ctx.temperature}°C, conc=${ctx.concentration}, нагрев=${ctx.heating ? "да" : "нет"}, катализатор=${ctx.catalyst ? "да" : "нет"}`);
    safeText(dom.reactionNeeds, evalResult.needsText || "—");

    if (!reaction || !evalResult.success) {
      safeText(dom.observation, "Эти вещества не дают заметной реакции в выбранных условиях.");
      safeText(dom.equation, reaction ? reaction.equation : "—");
      safeText(dom.explanation, evalResult.reason);
      safeText(dom.safety, reaction?.safety?.warning || "Проверьте условия реакции.");
      window.LabEffects.clearEffects();
      window.LabEffects.toggleFlame(dom.heating?.checked);
      safeState(dom.panel, evalResult.state);
      safeState(get("labScene"), evalResult.state);
      setStatus(evalResult.state, evalResult.reason);
      return;
    }

    safeText(dom.observation, reaction.observation);
    safeText(dom.equation, reaction.equation);
    safeText(dom.explanation, reaction.explanation);
    safeText(dom.safety, reaction.safety.warning);
    const effectPayload = {
      state: evalResult.state,
      intensity: evalResult.intensity,
      visual: reaction.visual,
      heating: dom.heating.checked
    };
    window.LabEffects.applyReactionEffects(effectPayload);
    setStatus(evalResult.state, evalResult.reason);
  }

  function prepare() {
    const A = dom.a?.value;
    const B = dom.b?.value;
    if (!A || !B || A === B) {
      setStatus("no_reaction", "Выберите два разных вещества.");
      return;
    }
    state.prepared = true;
    window.LabEffects.clearEffects();
    window.LabEffects.clearFlaskContents();
    window.LabEffects.toggleFlame(dom.heating?.checked);
    window.LabEffects.renderSubstanceInFlask(state.substances.get(A));
    window.LabEffects.renderSubstanceInFlask(state.substances.get(B));
    if (dom.liquid) dom.liquid.style.height = `${18 + Math.min(45, (Number(dom.amountA?.value) + Number(dom.amountB?.value)) * 0.6)}%`;
    safeState(dom.panel, "prepared");
    safeState(get("labScene"), "prepared");
    setStatus("prepared", "Вещества добавлены в колбу.");
    if (dom.run) dom.run.disabled = false;
  }

  function runSimulation() {
    if (!state.prepared) {
      setStatus("prepared", "Сначала нажмите «Подготовить».");
      return;
    }
    const A = dom.a?.value;
    const B = dom.b?.value;
    const reaction = getCurrentReaction();

    safeState(dom.panel, "running");
    safeState(get("labScene"), "running");
    setStatus("running", "Идёт моделирование реакции.");

    const ctx = {
      amountA: Number(dom.amountA?.value),
      amountB: Number(dom.amountB?.value),
      concentration: dom.concentration?.value,
      temperature: Number(dom.temperature?.value),
      heating: dom.heating?.checked,
      catalyst: dom.catalyst?.checked
    };

    setTimeout(() => {
      const resolved = window.LabEngine.runReaction(state.map, state.substances, A, B, ctx);
      renderResult(resolved.reaction, resolved.evaluation, ctx);
    }, 650);
  }

  function reset() {
    if (dom.a) dom.a.value = "";
    if (dom.b) dom.b.value = "";
    if (dom.amountA) dom.amountA.value = 10;
    if (dom.amountB) dom.amountB.value = 10;
    if (dom.temperature) dom.temperature.value = 25;
    if (dom.concentration) dom.concentration.value = "normal";
    if (dom.heating) dom.heating.checked = false;
    if (dom.catalyst) dom.catalyst.checked = false;
    state.prepared = false;
    safeText(dom.observation, "Выберите вещества и условия.");
    safeText(dom.equation, "—");
    safeText(dom.reactionType, "—");
    safeText(dom.reactionConditions, "—");
    safeText(dom.reactionNeeds, "—");
    safeText(dom.explanation, "—");
    safeText(dom.safety, "Соблюдайте технику безопасности.");
    renderSubstanceMeta(dom.a, dom.metaA);
    renderSubstanceMeta(dom.b, dom.metaB);
    renderExpected();
    window.LabEffects.clearEffects();
    window.LabEffects.clearFlaskContents();
    safeState(dom.panel, "ready");
    safeState(get("labScene"), "ready");
    setStatus("ready", "Готово к опыту.");
    if (dom.run) dom.run.disabled = true;
  }

  async function init() {
    const { substances, reactions } = await loadData();
    if (!substances.substances?.length || !reactions.reactions?.length) {
      throw new Error("локальные данные не найдены");
    }
    fillSubstances(substances.substances || []);
    state.map = window.LabEngine.createReactionMap(reactions.reactions || []);
    if (dom.a) dom.a.addEventListener("change", () => {
      renderSubstanceMeta(dom.a, dom.metaA);
      renderExpected();
    });
    if (dom.b) dom.b.addEventListener("change", () => {
      renderSubstanceMeta(dom.b, dom.metaB);
      renderExpected();
    });
    if (dom.heating) dom.heating.addEventListener("change", () => window.LabEffects.toggleFlame(dom.heating.checked));
    if (dom.prepare) dom.prepare.addEventListener("click", prepare);
    if (dom.run) dom.run.addEventListener("click", runSimulation);
    if (dom.reset) dom.reset.addEventListener("click", reset);
    reset();
    if (state.substances.has("AgNO3") && state.substances.has("NaCl")) {
      dom.a.value = "AgNO3";
      dom.b.value = "NaCl";
      dom.amountA.value = 20;
      dom.amountB.value = 20;
      renderSubstanceMeta(dom.a, dom.metaA);
      renderSubstanceMeta(dom.b, dom.metaB);
      renderExpected();
      prepare();
    }
  }

  init().catch((err) => {
    setStatus("no_reaction", `Ошибка загрузки данных: ${err.message}`);
  });
})();
