(() => {
  const roomToC = { cold: 10, room: 25, warm: 40, hot: 80 };
  const activeMetals = new Set(["Li", "Na", "K", "Ca", "Mg", "Al", "Zn", "Fe"]);
  const insolublePairs = new Set(["Ag+:Cl-", "Ba2+:SO4^2-", "Pb2+:I-", "Cu2+:OH-", "Fe3+:OH-", "Fe2+:OH-"]);

  function sortPair(a, b) {
    return [a, b].sort().join("+");
  }

  function createReactionMap(reactions) {
    const map = new Map();
    reactions.forEach((reaction) => {
      const key = sortPair(reaction.reactants[0], reaction.reactants[1]);
      map.set(key, reaction);
    });
    return map;
  }

  function buildNeedsText(needs) {
    const missing = [];
    if (needs.heating) missing.push("включить нагрев");
    if (needs.catalyst) missing.push("добавить катализатор");
    if (needs.temperature) missing.push("повысить температуру");
    if (needs.concentration) missing.push("изменить концентрацию");
    return missing.length ? `Нужно: ${missing.join(", ")}.` : "Изменения не требуются.";
  }

  function evaluateConditions(reaction, ctx) {
    const base = {
      success: false,
      state: "no_reaction",
      intensity: 0,
      needs: {
        heating: false,
        catalyst: false,
        temperature: false,
        concentration: false
      },
      reason: "Реакция не началась.",
      needsText: "Изменения не требуются."
    };

    if (!reaction) {
      base.reason = "Эти вещества не дают заметной реакции в заданных условиях.";
      return base;
    }

    const totalAmount = (ctx.amountA || 0) + (ctx.amountB || 0);
    const requiredTemp = roomToC[reaction.conditions.temperature] ?? 25;
    const minAmount = 12;

    if (reaction.conditions.heating_required && !ctx.heating) {
      base.state = "need_heating";
      base.needs.heating = true;
      base.reason = "Для реакции нужен нагрев.";
      base.needsText = buildNeedsText(base.needs);
      return base;
    }
    if (reaction.conditions.catalyst_required && !ctx.catalyst) {
      base.state = "need_catalyst";
      base.needs.catalyst = true;
      base.reason = "Добавьте катализатор.";
      base.needsText = buildNeedsText(base.needs);
      return base;
    }
    if (reaction.conditions.concentration === "concentrated" && ctx.concentration !== "high") {
      base.state = "no_reaction";
      base.needs.concentration = true;
      base.reason = "Требуется более высокая концентрация.";
      base.needsText = buildNeedsText(base.needs);
      return base;
    }
    if (reaction.conditions.concentration === "normal" && ctx.concentration === "low") {
      base.state = "no_reaction";
      base.needs.concentration = true;
      base.reason = "Концентрация слишком низкая.";
      base.needsText = buildNeedsText(base.needs);
      return base;
    }
    if (ctx.temperature < requiredTemp - 8) {
      base.state = reaction.conditions.heating_required ? "need_heating" : "no_reaction";
      base.needs.temperature = true;
      base.reason = "Температура недостаточна.";
      base.needsText = buildNeedsText(base.needs);
      return base;
    }

    let intensity = Math.min(1, totalAmount / 60);
    if (ctx.heating || reaction.visual.heat) intensity += 0.15;
    if (ctx.concentration === "high") intensity += 0.2;
    if (ctx.catalyst) intensity += 0.15;
    intensity = Math.min(1, intensity);

    if (totalAmount < minAmount) {
      return {
        success: true,
        state: "weak",
        intensity: 0.35,
        needs: base.needs,
        reason: "Реакция прошла слабо: недостаточно вещества.",
        needsText: "Увеличьте количество реагентов."
      };
    }

    const dangerous = reaction.safety?.level === "high" || (reaction.visual?.flash && reaction.visual?.smoke);
    return {
      success: true,
      state: dangerous ? "dangerous" : "success",
      intensity,
      needs: base.needs,
      reason: dangerous ? "Реакция прошла, но требует повышенной осторожности." : "Реакция прошла успешно.",
      needsText: "Изменения не требуются."
    };
  }

  function ionKey(substance) {
    if (!substance || !substance.ions) return "";
    return `${substance.ions.cation || ""}:${substance.ions.anion || ""}`;
  }

  function makeVirtualReaction(a, b, type, equation, observation, explanation, visual = {}, safetyLevel = "low") {
    return {
      id: `rule_${a.id}_${b.id}_${type}`,
      title: "Расчётная реакция",
      reactants: [a.id, b.id],
      conditions: {
        temperature: "room",
        heating_required: false,
        catalyst_required: false,
        concentration: "normal"
      },
      equation,
      type,
      visual: Object.assign(
        { color_change: "none", colorTo: "none", gas: false, precipitate: false, heat: false, flash: false, smoke: false, precipitateColor: "" },
        visual
      ),
      safety: {
        level: safetyLevel,
        warning: safetyLevel === "high" ? "Работайте в очках, перчатках и под вытяжкой." : "Соблюдайте общие правила лабораторной безопасности."
      },
      observation,
      explanation
    };
  }

  function inferRuleReaction(a, b) {
    const types = [a.type, b.type];
    const has = (t1, t2) => types.includes(t1) && types.includes(t2);

    if (has("acid", "base") && ((a.ions?.cation === "H+" && b.ions?.anion === "OH-") || (b.ions?.cation === "H+" && a.ions?.anion === "OH-"))) {
      return makeVirtualReaction(a, b, "neutralization", `${a.formula} + ${b.formula} → соль + H₂O`, "Раствор немного нагрелся.", "Ионы H+ и OH- образуют воду.", { heat: true, color_change: "clear", colorTo: "clear" }, "medium");
    }

    if (has("salt", "salt")) {
      const p1 = `${a.ions?.cation || ""}:${b.ions?.anion || ""}`;
      const p2 = `${b.ions?.cation || ""}:${a.ions?.anion || ""}`;
      if (insolublePairs.has(p1) || insolublePairs.has(p2)) {
        return makeVirtualReaction(a, b, "double_displacement", `${a.formula} + ${b.formula} → осадок + соль`, "Появился осадок.", "Реакция обмена идёт из-за образования малорастворимого вещества.", { precipitate: true, color_change: "white_cloudy", precipitateColor: "white" }, "medium");
      }
    }

    if (has("acid", "metal")) {
      const metal = a.type === "metal" ? a : b;
      const acid = a.type === "acid" ? a : b;
      if (activeMetals.has(metal.formula || metal.id) && acid.ions?.cation === "H+") {
        return makeVirtualReaction(a, b, "metal_acid", `${metal.formula} + кислота → соль + H₂↑`, "Идут пузырьки газа, металл растворяется.", "Активный металл вытесняет водород из кислоты.", { gas: true, heat: true, color_change: "none" }, "medium");
      }
    }

    if (has("acid", "salt")) {
      const salt = a.type === "salt" ? a : b;
      if (salt.ions?.anion === "CO3^2-" || salt.ions?.anion === "HCO3-") {
        return makeVirtualReaction(a, b, "acid_carbonate", `${a.formula} + ${b.formula} → соль + H₂O + CO₂↑`, "Появилось шипение и выделение газа.", "Карбонат/гидрокарбонат с кислотой выделяет CO₂.", { gas: true, color_change: "none" }, "low");
      }
    }

    if (has("water", "metal")) {
      const metal = a.type === "metal" ? a : b;
      if (activeMetals.has(metal.formula || metal.id)) {
        return makeVirtualReaction(a, b, "metal_water", `${metal.formula} + H₂O → щёлочь + H₂↑`, "Металл реагирует с водой с выделением газа.", "Активные металлы реагируют с водой с образованием щёлочи и водорода.", { gas: true, heat: true, flash: true, smoke: true }, "high");
      }
    }

    if (has("indicator", "base")) {
      return makeVirtualReaction(a, b, "indicator", "Индикатор + щёлочь → изменение цвета", "Раствор изменил цвет индикатора.", "Индикатор чувствителен к pH среды.", { color_change: "raspberry", colorTo: "raspberry" }, "low");
    }
    if (has("indicator", "acid")) {
      return makeVirtualReaction(a, b, "indicator", "Индикатор + кислота → изменение цвета", "Индикатор обесцветился.", "Индикатор меняет форму в кислой среде.", { color_change: "clear", colorTo: "clear" }, "low");
    }

    return null;
  }

  function resolveReaction(map, substancesById, aId, bId) {
    const key = sortPair(aId, bId);
    const exact = map.get(key);
    if (exact) return exact;
    const a = substancesById.get(aId);
    const b = substancesById.get(bId);
    if (!a || !b) return null;
    return inferRuleReaction(a, b);
  }

  function runReaction(map, substancesById, aId, bId, ctx) {
    const reaction = resolveReaction(map, substancesById, aId, bId);
    const evaluation = evaluateConditions(reaction, ctx);
    return { reaction, evaluation };
  }

  window.LabEngine = {
    sortPair,
    createReactionMap,
    evaluateConditions,
    resolveReaction,
    runReaction
  };
})();
