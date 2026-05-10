(() => {
  const statesText = {
    ready: "До реакции",
    prepared: "Подготовлено",
    running: "Реакция идёт",
    success: "Успешная реакция",
    weak: "Слабая реакция",
    no_reaction: "Реакция не идёт",
    dangerous: "Опасная реакция",
    need_heating: "Нужен нагрев",
    need_catalyst: "Нужен катализатор"
  };

  let rafId = null;
  let bubbles = [];

  function el(id) {
    return document.getElementById(id);
  }
  function setText(id, value) {
    const node = el(id);
    if (node) node.textContent = value;
  }
  function withEl(id, cb) {
    const node = el(id);
    if (node) cb(node);
  }

  function clearEffects() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    bubbles = [];
    setText("bubblesLayer", "");
    setText("gasLayer", "");
    setText("smokeLayer", "");
    setText("solidLayer", "");
    withEl("precipitateLayer", (n) => {
      n.style.height = "0";
      n.style.background = "rgba(241,245,249,0.55)";
    });
    withEl("liquid", (n) => {
      n.classList.remove("hot");
      n.style.boxShadow = "";
    });
    withEl("flashOverlay", (n) => n.classList.remove("active"));
    withEl("safetyShield", (n) => (n.style.opacity = "0"));
  }

  function toggleFlame(enabled) {
    withEl("flame", (n) => n.classList.toggle("active", Boolean(enabled)));
  }

  function changeLiquidColor(colorChange, intensity) {
    const liquid = el("liquid");
    if (!liquid) return;
    const palette = {
      clear: ["rgba(186,230,253,0.35)", "rgba(59,130,246,0.28)"],
      white_cloudy: ["rgba(241,245,249,0.75)", "rgba(203,213,225,0.55)"],
      blue: ["rgba(56,189,248,0.68)", "rgba(37,99,235,0.45)"],
      brown: ["rgba(146,64,14,0.65)", "rgba(120,53,15,0.45)"],
      green: ["rgba(34,197,94,0.65)", "rgba(20,83,45,0.45)"],
      yellow: ["rgba(234,179,8,0.68)", "rgba(161,98,7,0.42)"],
      decolorized: ["rgba(226,232,240,0.5)", "rgba(148,163,184,0.3)"],
      blue_dark: ["rgba(29,78,216,0.72)", "rgba(30,58,138,0.52)"],
      raspberry: ["rgba(244,114,182,0.7)", "rgba(190,24,93,0.4)"],
      none: ["rgba(56,189,248,0.5)", "rgba(59,130,246,0.33)"]
    };
    const pair = palette[colorChange] || palette.none;
    liquid.style.background = `linear-gradient(180deg, ${pair[0]}, ${pair[1]})`;
    liquid.style.height = `${22 + intensity * 46}%`;
  }

  function createBubbles(intensity) {
    const layer = el("bubblesLayer");
    const gasLayer = el("gasLayer");
    if (!layer || !gasLayer) return;
    const count = Math.round(8 + intensity * 26);
    for (let i = 0; i < count; i += 1) {
      bubbles.push({
        x: 8 + Math.random() * 84,
        y: 100 + Math.random() * 15,
        s: 3 + Math.random() * 6,
        v: 0.3 + Math.random() * (0.8 + intensity)
      });
    }

    function frame() {
      layer.textContent = "";
      bubbles = bubbles.filter((b) => b.y > -10);
      bubbles.forEach((b) => {
        b.y -= b.v;
        const n = document.createElement("span");
        n.style.position = "absolute";
        n.style.left = `${b.x}%`;
        n.style.bottom = `${b.y}%`;
        n.style.width = `${b.s}px`;
        n.style.height = `${b.s}px`;
        n.style.borderRadius = "999px";
        n.style.background = "rgba(226,232,240,0.72)";
        layer.appendChild(n);
      });
      if (Math.random() < 0.28) {
        const gas = document.createElement("span");
        gas.style.position = "absolute";
        gas.style.left = `${48 + (Math.random() * 16 - 8)}%`;
        gas.style.bottom = `${55 + Math.random() * 20}%`;
        gas.style.width = `${8 + Math.random() * 12}px`;
        gas.style.height = gas.style.width;
        gas.style.borderRadius = "999px";
        gas.style.background = "rgba(203,213,225,0.28)";
        gas.style.filter = "blur(2px)";
        gasLayer.appendChild(gas);
        if (gasLayer.childNodes.length > 30) gasLayer.removeChild(gasLayer.firstChild);
      }
      if (bubbles.length > 0) rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  }

  function createSmoke(intensity) {
    const layer = el("smokeLayer");
    if (!layer) return;
    const count = 4 + Math.round(intensity * 7);
    for (let i = 0; i < count; i += 1) {
      const s = document.createElement("span");
      s.style.position = "absolute";
      s.style.left = `${40 + Math.random() * 20}%`;
      s.style.bottom = `${50 + i * 6}px`;
      s.style.width = `${18 + Math.random() * 24}px`;
      s.style.height = s.style.width;
      s.style.borderRadius = "999px";
      s.style.background = "rgba(148,163,184,0.25)";
      s.style.filter = "blur(3px)";
      layer.appendChild(s);
    }
  }

  function createPrecipitate(colorChange, intensity) {
    const layer = el("precipitateLayer");
    if (!layer) return;
    const colorMap = {
      white_cloudy: "rgba(248,250,252,0.72)",
      white: "rgba(248,250,252,0.72)",
      blue: "rgba(125,211,252,0.7)",
      brown: "rgba(146,64,14,0.72)",
      green: "rgba(74,222,128,0.7)",
      yellow: "rgba(250,204,21,0.74)",
      silver: "rgba(203,213,225,0.78)",
      reddish: "rgba(239,68,68,0.65)"
    };
    layer.style.background = colorMap[colorChange] || "rgba(203,213,225,0.55)";
    layer.style.height = `${10 + intensity * 26}%`;
  }

  function shakeFlask(intensity) {
    const wrap = el("flaskWrap");
    if (!wrap) return;
    const amount = 1 + Math.round(intensity * 4);
    let t = 0;
    function shake() {
      t += 1;
      const x = Math.sin(t * 1.4) * amount;
      wrap.style.transform = `translateX(calc(-50% + ${x}px))`;
      if (t < 24) {
        requestAnimationFrame(shake);
      } else {
        wrap.style.transform = "translateX(-50%)";
      }
    }
    requestAnimationFrame(shake);
  }

  function clearFlaskContents() {
    setText("solidLayer", "");
    withEl("liquid", (n) => {
      n.style.height = "0%";
      n.style.background = "linear-gradient(180deg, rgba(56,189,248,0.5), rgba(59,130,246,0.33))";
    });
    withEl("precipitateLayer", (n) => (n.style.height = "0"));
  }

  function renderMetalPieces() {
    const layer = el("solidLayer");
    if (!layer) return;
    for (let i = 0; i < 8; i += 1) {
      const p = document.createElement("span");
      p.className = "particle";
      p.style.left = `${16 + Math.random() * 68}%`;
      p.style.bottom = `${2 + Math.random() * 6}%`;
      p.style.width = `${8 + Math.random() * 9}px`;
      p.style.height = `${5 + Math.random() * 6}px`;
      p.style.background = "linear-gradient(180deg, #cbd5e1, #475569)";
      layer.appendChild(p);
    }
  }

  function renderPowder() {
    const layer = el("solidLayer");
    if (!layer) return;
    for (let i = 0; i < 24; i += 1) {
      const p = document.createElement("span");
      p.className = "particle";
      p.style.left = `${12 + Math.random() * 76}%`;
      p.style.bottom = `${1 + Math.random() * 8}%`;
      const size = 3 + Math.random() * 5;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.borderRadius = "999px";
      p.style.background = "rgba(226,232,240,0.75)";
      layer.appendChild(p);
    }
  }

  function renderSolution(color = "none") {
    changeLiquidColor(color, 0.45);
  }

  function renderWater() {
    const liquid = el("liquid");
    if (!liquid) return;
    liquid.style.height = "28%";
    liquid.style.background = "linear-gradient(180deg, rgba(191,219,254,0.44), rgba(96,165,250,0.24))";
  }

  function renderSubstanceInFlask(substance) {
    if (!substance) return;
    if (substance.visualState === "solution") renderSolution("none");
    if (substance.visualState === "liquid") renderWater();
    if (substance.visualState === "metal_piece") renderMetalPieces();
    if (substance.visualState === "powder" || substance.visualState === "crystal") renderPowder();
  }

  function applyReactionEffects(result) {
    clearEffects();
    const { state, intensity, visual, heating } = result;
    withEl("labScene", (n) => (n.dataset.state = state));
    withEl("labPanel", (n) => (n.dataset.state = state));
    toggleFlame(heating);
    changeLiquidColor(visual.colorTo || visual.color_change || "none", intensity);
    withEl("liquid", (n) => {
      if (visual.heat || heating) n.classList.add("hot");
    });
    if (visual.gas) createBubbles(intensity);
    if (visual.precipitate) createPrecipitate(visual.precipitateColor || visual.color_change, intensity);
    if (visual.smoke) createSmoke(intensity);
    if (visual.flash) withEl("flashOverlay", (n) => n.classList.add("active"));
    shakeFlask(intensity);
    if (state === "dangerous") withEl("safetyShield", (n) => (n.style.opacity = "1"));
    setTimeout(() => withEl("flashOverlay", (n) => n.classList.remove("active")), 350);
  }

  function getStateLabel(state) {
    return statesText[state] || state;
  }

  window.LabEffects = {
    applyReactionEffects,
    clearEffects,
    createBubbles,
    createSmoke,
    createPrecipitate,
    changeLiquidColor,
    toggleFlame,
    shakeFlask,
    renderSubstanceInFlask,
    renderMetalPieces,
    renderPowder,
    renderSolution,
    renderWater,
    clearFlaskContents,
    getStateLabel
  };
})();
