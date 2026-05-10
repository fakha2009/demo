// ChemLab TJ Demo - Виртуальная химическая лаборатория
(function() {
  'use strict';

  // Конфигурация реакции
  const REACTIONS = {
    'Mg+O2': { type:'fire', eq:'2Mg + O₂ → 2MgO + Q', color:'linear-gradient(135deg, #fff, #ccc)' },
    'HCl+Mg': { type:'gas', eq:'Mg + 2HCl → MgCl₂ + H₂↑', color:'linear-gradient(135deg, rgba(180,220,255,0.8), rgba(140,200,255,0.9))' },
    'HCl+NaOH': { type:'neutral', eq:'HCl + NaOH → NaCl + H₂O', color:'linear-gradient(135deg, rgba(200,255,200,0.7), rgba(150,255,150,0.7))' },
    'H2O2+MnO2': { type:'bubbles', eq:'2H₂O₂ → 2H₂O + O₂↑ (кат. MnO₂)', color:'linear-gradient(135deg, rgba(220,255,220,0.8), rgba(180,255,180,0.8))' },
    'Fe+S': { type:'fire', eq:'Fe + S → FeS', color:'linear-gradient(135deg, #666, #444)' },
    'Fe+O2': { type:'fire', eq:'3Fe + 2O₂ → Fe₃O₄', color:'linear-gradient(135deg, #333, #111)' },
    'Mg+HCl': { type:'gas', eq:'Mg + 2HCl → MgCl₂ + H₂↑', color:'linear-gradient(135deg, rgba(180,220,255,0.8), rgba(140,200,255,0.9))' },
  };

  // Цвета для веществ
  const REAGENT_COLORS = {
    'Mg': 'linear-gradient(135deg, rgba(180,180,180,0.6), rgba(100,100,100,0.4))',
    'O2': 'linear-gradient(135deg, rgba(200,255,255,0.5), rgba(150,200,255,0.4))',
    'HCl': 'linear-gradient(135deg, rgba(255,200,200,0.6), rgba(200,150,150,0.5))',
    'NaOH': 'linear-gradient(135deg, rgba(200,200,255,0.6), rgba(150,150,200,0.5))',
    'default': 'linear-gradient(135deg, rgba(200,200,200,0.5), rgba(150,150,150,0.4))'
  };

  // Состояние приложения
  const state = {
    addedReagents: [],
    isDragging: false,
    currentReaction: null
  };

  // DOM элементы
  let elements = {};

  // Инициализация
  function init() {
    try {
      cacheElements();
      setupEventListeners();
      updateEquation();
      console.log('ChemLab Demo инициализирован успешно');
    } catch (error) {
      handleError('Ошибка инициализации', error);
    }
  }

  // Кэширование DOM элементов
  function cacheElements() {
    const elementIds = ['labContainer', 'scene', 'flask', 'heatSource', 'liquid', 'equationBox', 'runBtn', 'resetBtn', 'flash', 'toast', 'bench'];
    
    elementIds.forEach(id => {
      elements[id] = document.getElementById(id);
      if (!elements[id]) {
        throw new Error(`Элемент с id="${id}" не найден`);
      }
    });

    elements.reagents = document.querySelectorAll('.reagent');
    if (elements.reagents.length === 0) {
      throw new Error('Реактивы не найдены');
    }
  }

  // Установка обработчиков событий
  function setupEventListeners() {
    // 3D вращение сцены
    setup3DRotation();
    
    // Drag & Drop
    setupDragAndDrop();
    
    // Кнопки
    setupButtons();
  }

  // Настройка 3D вращения
  function setup3DRotation() {
    try {
      elements.labContainer.addEventListener('mousemove', handleMouseMove);
      elements.labContainer.addEventListener('mouseleave', handleMouseLeave);
    } catch (error) {
      handleError('Ошибка настройки 3D вращения', error);
    }
  }

  // Обработчик движения мыши
  function handleMouseMove(e) {
    try {
      const rect = elements.labContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateY = x * 12;
      const rotateX = -y * 10;
      elements.scene.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    } catch (error) {
      handleError('Ошибка при движении мыши', error);
    }
  }

  // Обработчик ухода мыши
  function handleMouseLeave() {
    try {
      elements.scene.style.transform = 'rotateX(0) rotateY(0)';
    } catch (error) {
      handleError('Ошибка при уходе мыши', error);
    }
  }

  // Настройка Drag & Drop
  function setupDragAndDrop() {
    try {
      elements.reagents.forEach(reagent => {
        reagent.addEventListener('dragstart', handleDragStart);
        reagent.addEventListener('dragend', handleDragEnd);
      });

      elements.flask.addEventListener('dragover', handleDragOver);
      elements.flask.addEventListener('drop', handleDrop);
      elements.bench.addEventListener('dragover', handleDragOver);
      elements.bench.addEventListener('drop', handleDrop);
    } catch (error) {
      handleError('Ошибка настройки Drag & Drop', error);
    }
  }

  // Обработчики Drag & Drop
  function handleDragStart(e) {
    try {
      const reagentId = e.target.dataset.id;
      if (!reagentId) {
        throw new Error('ID реактива не найден');
      }
      
      e.dataTransfer.setData('text/plain', reagentId);
      e.target.classList.add('dragging');
      state.isDragging = true;
    } catch (error) {
      handleError('Ошибка при начале перетаскивания', error);
    }
  }

  function handleDragEnd(e) {
    try {
      e.target.classList.remove('dragging');
      state.isDragging = false;
    } catch (error) {
      handleError('Ошибка при окончании перетаскивания', error);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    try {
      e.preventDefault();
      const reagentId = e.dataTransfer.getData('text/plain');
      
      if (!reagentId) {
        showToast('Ошибка: не удалось получить ID реактива');
        return;
      }
      
      addToFlask(reagentId);
    } catch (error) {
      handleError('Ошибка при сбросе реактива', error);
    }
  }

  // Добавление реактива в колбу
  function addToFlask(id) {
    try {
      // Валидация
      if (!id || typeof id !== 'string') {
        throw new Error('Некорректный ID реактива');
      }

      if (state.addedReagents.length >= 2) {
        showToast('В колбе уже два вещества. Сбросьте или запустите реакцию.');
        return;
      }

      if (state.addedReagents.includes(id)) {
        showToast('Это вещество уже добавлено.');
        return;
      }

      // Добавление реактива
      state.addedReagents.push(id);
      
      // Визуальный эффект
      updateLiquidColor(id);
      updateEquation();
      
      console.log(`Реактив ${id} добавлен в колбу`);
    } catch (error) {
      handleError('Ошибка добавления реактива', error);
    }
  }

  // Обновление цвета жидкости
  function updateLiquidColor(id) {
    try {
      const color = REAGENT_COLORS[id] || REAGENT_COLORS.default;
      elements.liquid.style.background = color;
    } catch (error) {
      handleError('Ошибка обновления цвета жидкости', error);
    }
  }

  // Обновление уравнения
  function updateEquation() {
    try {
      if (state.addedReagents.length === 0) {
        elements.equationBox.innerHTML = 'Перетащите вещества';
        elements.runBtn.disabled = true;
        return;
      }

      const combo = [...state.addedReagents].sort().join('+');
      
      if (REACTIONS[combo]) {
        elements.equationBox.innerHTML = '<strong>Реакция:</strong><br>' + REACTIONS[combo].eq;
        elements.runBtn.disabled = false;
        state.currentReaction = combo;
      } else {
        elements.equationBox.innerHTML = '<strong>Нет данных</strong><br> для ' + combo;
        elements.runBtn.disabled = true;
        state.currentReaction = null;
      }
    } catch (error) {
      handleError('Ошибка обновления уравнения', error);
    }
  }

  // Настройка кнопок
  function setupButtons() {
    try {
      elements.runBtn.addEventListener('click', runReaction);
      elements.resetBtn.addEventListener('click', resetLab);
      elements.heatSource.addEventListener('click', handleHeatClick);
    } catch (error) {
      handleError('Ошибка настройки кнопок', error);
    }
  }

  // Запуск реакции
  function runReaction() {
    try {
      if (state.addedReagents.length !== 2 || !state.currentReaction) {
        showToast('Добавьте два совместимых вещества');
        return;
      }

      const reaction = REACTIONS[state.currentReaction];
      if (!reaction) {
        throw new Error('Реакция не найдена');
      }

      // Визуальные эффекты
      showFlash();
      applyReactionEffects(reaction);
      
      // Обновление состояния
      elements.liquid.style.background = reaction.color;
      elements.equationBox.innerHTML = '<strong>Реакция:</strong><br>' + reaction.eq;
      elements.runBtn.disabled = true;
      
      showToast('Реакция прошла!');
      console.log(`Реакция ${state.currentReaction} выполнена`);
    } catch (error) {
      handleError('Ошибка запуска реакции', error);
    }
  }

  // Вспышка реакции
  function showFlash() {
    try {
      elements.flash.style.opacity = '0.9';
      setTimeout(() => {
        elements.flash.style.opacity = '0';
      }, 200);
    } catch (error) {
      handleError('Ошибка вспышки', error);
    }
  }

  // Применение эффектов реакции
  function applyReactionEffects(reaction) {
    try {
      switch (reaction.type) {
        case 'fire':
          elements.heatSource.style.animationDuration = '0.4s';
          setTimeout(() => {
            elements.heatSource.style.animationDuration = '2s';
          }, 1500);
          break;
          
        case 'gas':
        case 'bubbles':
          const bubbles = document.querySelectorAll('.bubble');
          bubbles.forEach(bubble => {
            bubble.style.animationDuration = '0.4s';
          });
          setTimeout(() => {
            bubbles.forEach(bubble => {
              bubble.style.animationDuration = '3s';
            });
          }, 2000);
          break;
      }
    } catch (error) {
      handleError('Ошибка применения эффектов реакции', error);
    }
  }

  // Сброс лаборатории
  function resetLab() {
    try {
      state.addedReagents = [];
      state.currentReaction = null;
      
      elements.liquid.style.background = 'linear-gradient(135deg, rgba(88,230,217,0.3), rgba(139,92,246,0.3))';
      elements.equationBox.innerHTML = 'Перетащите вещества';
      elements.runBtn.disabled = true;
      elements.heatSource.style.animationDuration = '2s';
      
      const bubbles = document.querySelectorAll('.bubble');
      bubbles.forEach(bubble => {
        bubble.style.animationDuration = '3s';
      });
      
      showToast('Лаборатория сброшена');
      console.log('Лаборатория сброшена');
    } catch (error) {
      handleError('Ошибка сброса лаборатории', error);
    }
  }

  // Обработчик клика по нагревателю
  function handleHeatClick() {
    try {
      if (!elements.runBtn.disabled) {
        runReaction();
      } else {
        showToast('Добавьте подходящие вещества');
      }
    } catch (error) {
      handleError('Ошибка клика по нагревателю', error);
    }
  }

  // Показать уведомление
  function showToast(message) {
    try {
      if (!message || typeof message !== 'string') {
        throw new Error('Некорректное сообщение для уведомления');
      }
      
      elements.toast.textContent = message;
      elements.toast.style.opacity = '1';
      
      setTimeout(() => {
        elements.toast.style.opacity = '0';
      }, 2000);
    } catch (error) {
      handleError('Ошибка показа уведомления', error);
    }
  }

  // Обработка ошибок
  function handleError(message, error) {
    console.error(`${message}:`, error);
    showToast(`Произошла ошибка: ${message}`);
    
    // Дополнительная логика обработки ошибок
    if (error.name === 'TypeError' && error.message.includes('getElementById')) {
      console.error('Критическая ошибка: отсутствуют необходимые DOM элементы');
    }
  }

  // Запуск приложения
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
