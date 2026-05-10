// Chemistry Engine - модуль для работы с химическими реакциями
class ChemistryEngine {
  constructor() {
    this.reactions = [];
    this.reagents = new Map();
    this.currentReaction = null;
    this.conditions = {
      temperature: 'room',
      catalyst: null,
      concentration: 'normal'
    };
  }

  // Инициализация данных
  async init() {
    try {
      await this.loadReactions();
      await this.loadReagents();
      console.log('Chemistry Engine initialized');
    } catch (error) {
      console.error('Failed to initialize Chemistry Engine:', error);
      throw error;
    }
  }

  // Загрузка реакций
  async loadReactions() {
    try {
      const response = await fetch('/data/reactions.json');
      if (!response.ok) {
        throw new Error(`Failed to load reactions: ${response.status}`);
      }
      const data = await response.json();
      this.reactions = data.reactions || [];
    } catch (error) {
      console.error('Error loading reactions:', error);
      // Fallback to hardcoded reactions if file not available
      this.loadFallbackReactions();
    }
  }

  // Загрузка реактивов
  async loadReagents() {
    try {
      const response = await fetch('/data/reagents.json');
      if (!response.ok) {
        throw new Error(`Failed to load reagents: ${response.status}`);
      }
      const data = await response.json();
      data.reagents.forEach(reagent => {
        this.reagents.set(reagent.id, reagent);
      });
    } catch (error) {
      console.error('Error loading reagents:', error);
      // Fallback to hardcoded reagents if file not available
      this.loadFallbackReagents();
    }
  }

  // Fallback реакции
  loadFallbackReactions() {
    this.reactions = [
      {
        id: "magnesium_combustion",
        reactants: ["Mg", "O2"],
        products: ["MgO"],
        equation: "2Mg + O₂ → 2MgO + Q",
        type: "combustion",
        conditions: {
          temperature: "ignition",
          catalyst: null,
          pressure: "atmospheric"
        },
        effects: {
          visual: "fire",
          color: "linear-gradient(135deg, #fff, #ccc)",
          duration: 2000,
          particles: ["spark", "smoke"]
        },
        safety: {
          level: "dangerous",
          warnings: ["Яркая вспышка", "Высокая температура"],
          protection: ["защитные очки", "перчатки"]
        }
      }
    ];
  }

  // Fallback реактивы
  loadFallbackReagents() {
    const fallbackReagents = [
      {
        id: "Mg",
        name: "Магний",
        formula: "Mg",
        type: "metal",
        visual: {
          color: "linear-gradient(135deg, rgba(180,180,180,0.6), rgba(100,100,100,0.4))",
          icon: "🔩"
        }
      },
      {
        id: "O2",
        name: "Кислород",
        formula: "O₂",
        type: "gas",
        visual: {
          color: "linear-gradient(135deg, rgba(200,255,255,0.5), rgba(150,200,255,0.4))",
          icon: "💨"
        }
      }
    ];

    fallbackReagents.forEach(reagent => {
      this.reagents.set(reagent.id, reagent);
    });
  }

  // Поиск реакции по реагентам
  findReaction(reactantIds) {
    if (!Array.isArray(reactantIds) || reactantIds.length !== 2) {
      return null;
    }

    const sortedReactants = [...reactantIds].sort();
    
    const reaction = this.reactions.find(r => {
      const reactionReactants = [...r.reactants].sort();
      return JSON.stringify(sortedReactants) === JSON.stringify(reactionReactants);
    });

    if (reaction) {
      this.currentReaction = reaction;
      return reaction;
    }

    return null;
  }

  // Проверка условий реакции
  checkReactionConditions(reaction) {
    const conditions = reaction.conditions;
    const current = this.conditions;

    // Проверка температуры
    if (conditions.temperature === 'ignition' && current.temperature !== 'heating') {
      return {
        canProceed: false,
        reason: 'Требуется нагрев для начала реакции',
        suggestion: 'Используйте нагреватель'
      };
    }

    // Проверка катализатора
    if (conditions.catalyst && current.catalyst !== conditions.catalyst) {
      return {
        canProceed: false,
        reason: `Требуется катализатор: ${conditions.catalyst}`,
        suggestion: 'Добавьте соответствующий катализатор'
      };
    }

    // Проверка концентрации
    if (conditions.concentration === 'concentrated' && current.concentration === 'diluted') {
      return {
        canProceed: false,
        reason: 'Требуется концентрированный раствор',
        suggestion: 'Используйте концентрированный реактив'
      };
    }

    return {
      canProceed: true,
      reason: 'Условия реакции соблюдены'
    };
  }

  // Получение информации о реактиве
  getReagent(id) {
    return this.reagents.get(id);
  }

  // Установка условий реакции
  setConditions(conditions) {
    this.conditions = { ...this.conditions, ...conditions };
  }

  // Получение текущих условий
  getConditions() {
    return { ...this.conditions };
  }

  // Валидация безопасности
  validateSafety(reaction) {
    if (!reaction || !reaction.safety) {
      return { safe: true, warnings: [] };
    }

    const safety = reaction.safety;
    const warnings = [];

    if (safety.level === 'dangerous') {
      warnings.push('⚠️ Опасная реакция! Требуется защитная экипировка');
    }

    if (safety.warnings && safety.warnings.length > 0) {
      warnings.push(...safety.warnings);
    }

    return {
      safe: safety.level !== 'dangerous',
      warnings: warnings,
      protection: safety.protection || []
    };
  }

  // Получение объяснения реакции
  getExplanation(reactionId) {
    const reaction = this.reactions.find(r => r.id === reactionId);
    return reaction ? reaction.explanation : 'Объяснение недоступно';
  }

  // Поиск реакций по уровню сложности
  getReactionsByDifficulty(difficulty) {
    return this.reactions.filter(r => r.difficulty === difficulty);
  }

  // Поиск реакций по типу
  getReactionsByType(type) {
    return this.reactions.filter(r => r.type === type);
  }

  // Получение статистики
  getStats() {
    return {
      totalReactions: this.reactions.length,
      totalReagents: this.reagents.size,
      types: [...new Set(this.reactions.map(r => r.type))],
      difficulties: [...new Set(this.reactions.map(r => r.difficulty))]
    };
  }
}

// Экспорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChemistryEngine;
} else {
  window.ChemistryEngine = ChemistryEngine;
}
