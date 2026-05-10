// UI Module - модуль для работы с пользовательским интерфейсом
class UIManager {
  constructor() {
    this.elements = {};
    this.toastQueue = [];
    this.isShowingToast = false;
  }

  // Инициализация DOM элементов
  init() {
    try {
      this.cacheElements();
      this.setupEventListeners();
      console.log('UI Manager initialized');
    } catch (error) {
      console.error('Failed to initialize UI Manager:', error);
      throw error;
    }
  }

  // Кэширование DOM элементов
  cacheElements() {
    const elementIds = [
      'labContainer', 'scene', 'flask', 'heatSource', 'liquid', 
      'equationBox', 'runBtn', 'resetBtn', 'flash', 'toast', 'bench'
    ];

    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
      if (!this.elements[id]) {
        throw new Error(`Element with id="${id}" not found`);
      }
    });

    this.elements.reagents = document.querySelectorAll('.reagent');
    if (this.elements.reagents.length === 0) {
      throw new Error('No reagents found');
    }
  }

  // Установка обработчиков событий
  setupEventListeners() {
    // 3D вращение сцены
    this.setup3DRotation();
    
    // Drag & Drop
    this.setupDragAndDrop();
    
    // Кнопки
    this.setupButtons();
  }

  // Настройка 3D вращения
  setup3DRotation() {
    let rotateX = 0, rotateY = 0;

    this.elements.labContainer.addEventListener('mousemove', (e) => {
      try {
        const rect = this.elements.labContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        rotateY = x * 12;
        rotateX = -y * 10;
        this.elements.scene.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      } catch (error) {
        console.error('Error in mouse move handler:', error);
      }
    });

    this.elements.labContainer.addEventListener('mouseleave', () => {
      try {
        this.elements.scene.style.transform = 'rotateX(0) rotateY(0)';
      } catch (error) {
        console.error('Error in mouse leave handler:', error);
      }
    });
  }

  // Настройка Drag & Drop
  setupDragAndDrop() {
    this.elements.reagents.forEach(reagent => {
      reagent.addEventListener('dragstart', (e) => {
        try {
          const reagentId = e.target.dataset.id;
          if (!reagentId) {
            throw new Error('Reagent ID not found');
          }
          e.dataTransfer.setData('text/plain', reagentId);
          e.target.classList.add('dragging');
        } catch (error) {
          console.error('Error in drag start:', error);
          this.showToast('Ошибка при начале перетаскивания');
        }
      });

      reagent.addEventListener('dragend', (e) => {
        try {
          e.target.classList.remove('dragging');
        } catch (error) {
          console.error('Error in drag end:', error);
        }
      });
    });

    // Обработчики сброса
    const dropTargets = [this.elements.flask, this.elements.bench];
    
    dropTargets.forEach(target => {
      target.addEventListener('dragover', (e) => e.preventDefault());
      
      target.addEventListener('drop', (e) => {
        try {
          e.preventDefault();
          const reagentId = e.dataTransfer.getData('text/plain');
          if (reagentId) {
            // Генерируем событие добавления реактива
            window.dispatchEvent(new CustomEvent('reagentAdded', { 
              detail: { reagentId } 
            }));
          }
        } catch (error) {
          console.error('Error in drop handler:', error);
          this.showToast('Ошибка при добавлении реактива');
        }
      });
    });
  }

  // Настройка кнопок
  setupButtons() {
    this.elements.runBtn.addEventListener('click', () => {
      try {
        window.dispatchEvent(new CustomEvent('runReaction'));
      } catch (error) {
        console.error('Error in run button:', error);
        this.showToast('Ошибка запуска реакции');
      }
    });

    this.elements.resetBtn.addEventListener('click', () => {
      try {
        window.dispatchEvent(new CustomEvent('resetLab'));
      } catch (error) {
        console.error('Error in reset button:', error);
        this.showToast('Ошибка сброса лаборатории');
      }
    });

    this.elements.heatSource.addEventListener('click', () => {
      try {
        window.dispatchEvent(new CustomEvent('heatToggle'));
      } catch (error) {
        console.error('Error in heat source:', error);
        this.showToast('Ошибка нагревателя');
      }
    });
  }

  // Безопасное обновление содержимого элемента
  safeUpdateElement(elementId, content, isHTML = false) {
    try {
      const element = this.elements[elementId];
      if (!element) {
        throw new Error(`Element ${elementId} not found`);
      }

      if (isHTML) {
        // Используем DOMPurify если доступен, иначе простая валидация
        if (typeof DOMPurify !== 'undefined') {
          element.innerHTML = DOMPurify.sanitize(content);
        } else {
          // Простая валидация - удаляем теги скриптов
          const sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          element.innerHTML = sanitized;
        }
      } else {
        element.textContent = content;
      }
    } catch (error) {
      console.error(`Error updating element ${elementId}:`, error);
      this.showToast('Ошибка обновления интерфейса');
    }
  }

  // Обновление уравнения реакции
  updateEquation(content) {
    this.safeUpdateElement('equationBox', content, true);
  }

  // Обновление цвета жидкости
  updateLiquidColor(color) {
    try {
      if (this.elements.liquid) {
        this.elements.liquid.style.background = color;
      }
    } catch (error) {
      console.error('Error updating liquid color:', error);
    }
  }

  // Показ вспышки
  showFlash() {
    try {
      if (this.elements.flash) {
        this.elements.flash.style.opacity = '0.9';
        setTimeout(() => {
          this.elements.flash.style.opacity = '0';
        }, 200);
      }
    } catch (error) {
      console.error('Error showing flash:', error);
    }
  }

  // Показ уведомления
  showToast(message, type = 'info', duration = 3000) {
    if (!message || typeof message !== 'string') {
      console.error('Invalid toast message:', message);
      return;
    }

    // Добавляем в очередь
    this.toastQueue.push({ message, type, duration });
    
    // Показываем если нет активных уведомлений
    if (!this.isShowingToast) {
      this.processToastQueue();
    }
  }

  // Обработка очереди уведомлений
  processToastQueue() {
    if (this.toastQueue.length === 0) {
      this.isShowingToast = false;
      return;
    }

    this.isShowingToast = true;
    const toast = this.toastQueue.shift();
    
    try {
      // Устанавливаем цвет в зависимости от типа
      const colors = {
        info: 'rgba(0, 123, 255, 0.9)',
        success: 'rgba(40, 167, 69, 0.9)',
        warning: 'rgba(255, 193, 7, 0.9)',
        error: 'rgba(220, 53, 69, 0.9)'
      };

      this.elements.toast.style.background = colors[toast.type] || colors.info;
      this.elements.toast.textContent = toast.message;
      this.elements.toast.style.opacity = '1';

      setTimeout(() => {
        this.elements.toast.style.opacity = '0';
        setTimeout(() => {
          this.processToastQueue();
        }, 300);
      }, toast.duration);
    } catch (error) {
      console.error('Error showing toast:', error);
      this.processToastQueue();
    }
  }

  // Установка состояния кнопки
  setButtonState(buttonId, enabled, text = null) {
    try {
      const button = this.elements[buttonId];
      if (button) {
        button.disabled = !enabled;
        if (text) {
          button.textContent = text;
        }
      }
    } catch (error) {
      console.error(`Error setting button state ${buttonId}:`, error);
    }
  }

  // Анимация пузырьков
  animateBubbles(speed = 'normal') {
    try {
      const bubbles = document.querySelectorAll('.bubble');
      const speeds = {
        slow: '5s',
        normal: '3s',
        fast: '0.4s'
      };

      bubbles.forEach(bubble => {
        bubble.style.animationDuration = speeds[speed] || speeds.normal;
      });
    } catch (error) {
      console.error('Error animating bubbles:', error);
    }
  }

  // Анимация нагревателя
  animateHeatSource(speed = 'normal') {
    try {
      if (this.elements.heatSource) {
        const speeds = {
          slow: '3s',
          normal: '2s',
          fast: '0.4s'
        };
        this.elements.heatSource.style.animationDuration = speeds[speed] || speeds.normal;
      }
    } catch (error) {
      console.error('Error animating heat source:', error);
    }
  }

  // Показ предупреждения безопасности
  showSafetyWarning(warnings) {
    if (!Array.isArray(warnings) || warnings.length === 0) {
      return;
    }

    const warningMessage = warnings.join(' | ');
    this.showToast(warningMessage, 'warning', 5000);
  }

  // Показ информации о реакции
  showReactionInfo(reaction) {
    if (!reaction) return;

    const info = `
      <strong>Реакция:</strong><br>
      ${reaction.equation}<br><br>
      <strong>Объяснение:</strong><br>
      ${reaction.explanation || 'Объяснение недоступно'}
    `;
    
    this.updateEquation(info);
  }

  // Сброс интерфейса
  reset() {
    try {
      this.updateEquation('Перетащите вещества');
      this.updateLiquidColor('linear-gradient(135deg, rgba(88,230,217,0.3), rgba(139,92,246,0.3))');
      this.setButtonState('runBtn', false);
      this.animateBubbles('normal');
      this.animateHeatSource('normal');
    } catch (error) {
      console.error('Error resetting UI:', error);
    }
  }

  // Получение элемента
  getElement(id) {
    return this.elements[id];
  }

  // Получение всех реактивов
  getReagents() {
    return this.elements.reagents;
  }
}

// Экспорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
} else {
  window.UIManager = UIManager;
}
