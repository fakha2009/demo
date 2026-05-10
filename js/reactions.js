(function () {
  "use strict";

  function canonical(id) {
    return String(id || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  }

  function normalize(ids) {
    return ids.map(canonical).slice().sort().join("+");
  }

  function hasWater(reactants) {
    return reactants.includes("H2O") || reactants.some(function (id) {
      var reagent = window.ChemLabReactionData.reagents.find(function (item) {
        return item.id === id;
      });
      return reagent && (reagent.state === "solution" || reagent.state === "liquid");
    });
  }

  function createReactionEngine(reactions) {
    var map = new Map();
    reactions.forEach(function (reaction) {
      map.set(normalize(reaction.reactants), reaction);
    });

    function exact(ids) {
      return map.get(normalize(ids)) || null;
    }

    function subset(ids) {
      for (var i = 0; i < ids.length; i += 1) {
        for (var j = i + 1; j < ids.length; j += 1) {
          var candidate = exact([ids[i], ids[j]]);
          if (candidate) return candidate;
        }
      }
      return null;
    }

    return {
      find: function (reactants) {
        return exact(reactants) || null;
      },
      evaluate: function (reactants, context) {
        var unique = Array.from(new Set(reactants)).filter(Boolean);

        if (!context.container) {
          return {
            ok: false,
            status: "no_container",
            message: "Сначала перенесите сосуд в центральный слот активного опыта.",
            reaction: null
          };
        }

        if (!unique.length) {
          return {
            ok: false,
            status: "empty",
            message: "Добавьте реактивы в сосуд.",
            reaction: null
          };
        }

        var reaction = exact(unique);
        if (!reaction && unique.length === 1) {
          reaction = exact(unique);
        }
        if (!reaction && unique.length > 2) {
          var possible = subset(unique);
          if (possible) {
            return {
              ok: false,
              status: "extra_reagents",
              blockVisual: true,
              message: "Есть возможная реакция между " + possible.reactants.join(" + ") + ", но добавлены лишние вещества. Для чистого опыта уберите лишние реагенты.",
              reaction: possible
            };
          }
        }

        if (unique.length < 2 && !reaction) {
          return {
            ok: false,
            status: "incomplete",
            message: "Добавьте второй реактив в сосуд.",
            reaction: null
          };
        }

        if (!reaction) {
          return {
            ok: false,
            status: "no_reaction",
            message: "Видимая реакция не наблюдается.",
            reaction: {
              id: "no_reaction",
              name: "Нет заметной реакции",
              reactants: unique.slice(0, 2),
              equation: unique.slice(0, 2).join(" + ") + " → видимых изменений нет",
              type: "нет заметной реакции",
              effect: "noReaction",
              blockVisual: true,
              visualEffect: { type: "noReaction" },
              liquidColor: "clear",
              observation: "Газ, осадок, вспышка и изменение цвета не появляются.",
              explanation: "Для выбранной пары веществ в текущих условиях нет подходящего правила реакции."
            }
          };
        }

        if (reaction.allowedContainers && !reaction.allowedContainers.includes(context.container.id)) {
          return {
            ok: false,
            status: "wrong_container",
            message: "Для этой реакции выберите другой сосуд.",
            reaction: reaction
          };
        }

        if (reaction.requiresWater && !hasWater(unique)) {
          return {
            ok: false,
            status: "needs_water",
            message: "Для этой реакции нужна водная среда или раствор.",
            reaction: reaction
          };
        }

        if (reaction.requiresHeating && !context.heating) {
          return {
            ok: false,
            status: "needs_heating",
            message: "Реакция требует нагрева: поставьте горелку или плитку в слот нагрева и включите её.",
            reaction: reaction
          };
        }

        return {
          ok: true,
          status: "success",
          message: reaction.message,
          reaction: reaction
        };
      }
    };
  }

  window.ChemLabReactions = {
    createReactionEngine: createReactionEngine,
    normalize: normalize,
    canonical: canonical
  };
})();
