(function () {
  "use strict";

  const dictionaries = {
    reactionType: {
      precipitation: "Осаждение",
      gas: "Выделение газа",
      gas_evolution: "Выделение газа",
      neutralization: "Нейтрализация",
      oxidation: "Окисление",
      reduction: "Восстановление",
      combustion: "Горение",
      synthesis: "Синтез",
      decomposition: "Разложение",
      displacement: "Замещение",
      colorChange: "Изменение цвета",
      other: "Другая реакция"
    },
    substanceType: {
      acid: "Кислота",
      base: "Основание",
      salt: "Соль",
      metal: "Металл",
      water: "Вода",
      indicator: "Индикатор",
      catalyst: "Катализатор",
      oxide: "Оксид",
      gas: "Газ",
      other: "Другое"
    },
    state: {
      solution: "Раствор",
      liquid: "Жидкость",
      solid: "Твёрдое вещество",
      gas: "Газ",
      powder: "Порошок",
      metal: "Металл",
      aqueous: "Раствор"
    },
    danger: {
      low: "Низкий",
      medium: "Средний",
      high: "Высокий"
    },
    role: {
      user: "Пользователь",
      admin: "Администратор"
    }
  };

  function label(group, value) {
    if (value === null || value === undefined || value === "") return "Нет данных";
    return dictionaries[group]?.[value] || String(value);
  }

  window.ChemLabI18n = { label, dictionaries };
})();
