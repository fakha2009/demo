// Main Demo Application - ChemLab TJ
class ChemLabDemo {
  constructor() {
    this.chemistryEngine = null;
    this.uiManager = null;
    this.effectsManager = null;
    this.addedReagents = [];
    this.isInitialized = false;
  }

  // Инициализация приложения
  async init() {
    try {
      console.log('Initializing ChemLab Demo...');
      
      // Инициализация PWA
      this.initPWA();
      
      // Инициализация модулей
      this.chemistryEngine = new ChemistryEngine();
      this.uiManager = new UIManager();
      this.effectsManager = new EffectsManager();
      
      // Загрузка данных
      await this.chemistryEngine.init();
      
      // Инициализация UI
      this.uiManager.init();
      this.effectsManager.init();
      
      // Установка обработчиков событий
      this.setupEventListeners();
      
      // Сброс интерфейса
      this.resetLab();
      
      this.isInitialized = true;
      console.log('ChemLab Demo initialized successfully');
      
      // Показываем приветственное сообщение
      this.uiManager.showToast('Добро пожаловать в ChemLab TJ!', 'success', 3000);
      
    } catch (error) {
      console.error('Failed to initialize ChemLab Demo:', error);
      this.showError('Ошибка инициализации приложения', error);
    }
  }

  // Инициализация PWA
  initPWA() {
    try {
      // Регистрация Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered:', registration);
            
            // Проверка обновлений
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  this.uiManager.showToast('Доступна новая версия! Обновите страницу.', 'info', 5000);
                }
              });
            });
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }

      // Установка ссылки на manifest
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);

      // Установка theme color
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#58e6d9';
      document.head.appendChild(meta);

      // Обработка установки PWA
      this.handleInstallPrompt();
      
    } catch (error) {
      console.error('PWA initialization failed:', error);
    }
  }

  // Обработка установки PWA
  handleInstallPrompt() {
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Показываем кнопку установки
      this.showInstallButton();
    });

    this.installApp = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            this.uiManager.showToast('Приложение установлено!', 'success', 3000);
          }
          deferredPrompt = null;
        });
      }
    };
  }

  // Показ кнопки установки
  showInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.textContent = '📱 Установить приложение';
    installBtn.className = 'install-btn';
    installBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #58e6d9;
      color: #07111f;
      border: none;
      padding: 12px 20px;
      border-radius: 30px;
      cursor: pointer;
      font-weight: 700;
      z-index: 1000;
      transition: transform 0.2s;
    `;
    
    installBtn.addEventListener('click', () => {
      this.installApp();
      installBtn.remove();
    });
    
    document.body.appendChild(installBtn);
  }

  // Установка обработчиков событий
  setupEventListeners() {
    // Добавление реактива
    window.addEventListener('reagentAdded', (e) => {
      this.handleReagentAdded(e.detail.reagentId);
    });

    // Запуск реакции
    window.addEventListener('runReaction', () => {
      this.handleRunReaction();
    });

    // Сброс лаборатории
    window.addEventListener('resetLab', () => {
      this.handleResetLab();
    });

    // Переключение нагрева
    window.addEventListener('heatToggle', () => {
      this.handleHeatToggle();
    });

    // Обработка онлайн/офлайн статуса
    window.addEventListener('online', () => {
      this.uiManager.showToast('Соединение восстановлено', 'success', 2000);
    });

    window.addEventListener('offline', () => {
      this.uiManager.showToast('Работа в офлайн режиме', 'warning', 3000);
    });
  }

  // Обработка добавления реактива
  handleReagentAdded(reagentId) {
    try {
      // Валидация
      if (!reagentId || typeof reagentId !== 'string') {
        this.uiManager.showToast('Ошибка: некорректный ID реактива', 'error');
        return;
      }

      if (this.addedReagents.length >= 2) {
        this.uiManager.showToast('В колбе уже два вещества. Сбросьте или запустите реакцию.', 'warning');
        return;
      }

      if (this.addedReagents.includes(reagentId)) {
        this.uiManager.showToast('Это вещество уже добавлено.', 'warning');
        return;
      }

      // Добавление реактива
      this.addedReagents.push(reagentId);
      
      // Получение информации о реактиве
      const reagent = this.chemistryEngine.getReagent(reagentId);
      if (reagent && reagent.visual && reagent.visual.color) {
        this.uiManager.updateLiquidColor(reagent.visual.color);
      }

      // Обновление интерфейса
      this.updateEquation();
      
      console.log(`Reagent ${reagentId} added to flask`);
      
    } catch (error) {
      console.error('Error handling reagent addition:', error);
      this.uiManager.showToast('Ошибка добавления реактива', 'error');
    }
  }

  // Обработка запуска реакции
  handleRunReaction() {
    try {
      if (this.addedReagents.length !== 2) {
        this.uiManager.showToast('Добавьте два вещества для реакции', 'warning');
        return;
      }

      // Поиск реакции
      const reaction = this.chemistryEngine.findReaction(this.addedReagents);
      
      if (!reaction) {
        this.uiManager.showToast('Реакция между этими веществами не найдена', 'warning');
        return;
      }

      // Проверка условий
      const conditionCheck = this.chemistryEngine.checkReactionConditions(reaction);
      if (!conditionCheck.canProceed) {
        this.uiManager.showToast(conditionCheck.reason, 'warning');
        return;
      }

      // Проверка безопасности
      const safetyCheck = this.chemistryEngine.validateSafety(reaction);
      if (!safetyCheck.safe) {
        this.uiManager.showSafetyWarning(safetyCheck.warnings);
      }

      // Запуск реакции
      this.executeReaction(reaction);
      
    } catch (error) {
      console.error('Error running reaction:', error);
      this.uiManager.showToast('Ошибка запуска реакции', 'error');
    }
  }

  // Выполнение реакции
  executeReaction(reaction) {
    try {
      console.log('Executing reaction:', reaction.id);
      
      // Блокируем кнопку запуска
      this.uiManager.setButtonState('runBtn', false, 'Реакция идет...');
      
      // Показываем информацию о реакции
      this.uiManager.showReactionInfo(reaction);
      
      // Применяем визуальные эффекты
      const flaskElement = this.uiManager.getElement('flask');
      const liquidElement = this.uiManager.getElement('liquid');
      
      this.effectsManager.applyReactionEffect(reaction, flaskElement, liquidElement);
      
      // Показываем вспышку
      this.uiManager.showFlash();
      
      // Анимируем пузырьки в зависимости от типа реакции
      if (reaction.effects.visual === 'gas' || reaction.effects.visual === 'bubbles') {
        this.uiManager.animateBubbles('fast');
        setTimeout(() => {
          this.uiManager.animateBubbles('normal');
        }, reaction.effects.duration || 3000);
      }
      
      // Анимируем нагреватель для экзотермических реакций
      if (reaction.type === 'combustion' || reaction.type === 'synthesis') {
        this.uiManager.animateHeatSource('fast');
        setTimeout(() => {
          this.uiManager.animateHeatSource('normal');
        }, reaction.effects.duration || 2000);
      }
      
      // Показываем сообщение об успешном завершении
      setTimeout(() => {
        this.uiManager.showToast('Реакция успешно завершена!', 'success', 2000);
        this.uiManager.setButtonState('runBtn', false, 'Запустить');
      }, reaction.effects.duration || 2000);
      
    } catch (error) {
      console.error('Error executing reaction:', error);
      this.uiManager.showToast('Ошибка выполнения реакции', 'error');
      this.uiManager.setButtonState('runBtn', true, 'Запустить');
    }
  }

  // Обработка сброса лаборатории
  handleResetLab() {
    try {
      this.addedReagents = [];
      this.uiManager.reset();
      this.effectsManager.clearParticles();
      this.uiManager.showToast('Лаборатория сброшена', 'info', 2000);
      console.log('Lab reset');
    } catch (error) {
      console.error('Error resetting lab:', error);
      this.uiManager.showToast('Ошибка сброса лаборатории', 'error');
    }
  }

  // Обработка переключения нагрева
  handleHeatToggle() {
    try {
      const runBtn = this.uiManager.getElement('runBtn');
      
      if (!runBtn.disabled) {
        this.handleRunReaction();
      } else {
        this.uiManager.showToast('Добавьте подходящие вещества', 'info');
      }
    } catch (error) {
      console.error('Error handling heat toggle:', error);
    }
  }

  // Обновление уравнения
  updateEquation() {
    try {
      if (this.addedReagents.length === 0) {
        this.uiManager.updateEquation('Перетащите вещества');
        this.uiManager.setButtonState('runBtn', false);
        return;
      }

      const reaction = this.chemistryEngine.findReaction(this.addedReagents);
      
      if (reaction) {
        const conditionCheck = this.chemistryEngine.checkReactionConditions(reaction);
        if (conditionCheck.canProceed) {
          this.uiManager.updateEquation(`
            <strong>Реакция:</strong><br>
            ${reaction.equation}<br>
            <small style="color: var(--muted)">${conditionCheck.reason}</small>
          `);
          this.uiManager.setButtonState('runBtn', true);
        } else {
          this.uiManager.updateEquation(`
            <strong>Нужны условия:</strong><br>
            ${reaction.equation}<br>
            <small style="color: var(--accent)">${conditionCheck.reason}</small>
          `);
          this.uiManager.setButtonState('runBtn', false);
        }
      } else {
        this.uiManager.updateEquation(`
          <strong>Реакция не найдена</strong><br>
          <small>для ${this.addedReagents.join(' + ')}</small>
        `);
        this.uiManager.setButtonState('runBtn', false);
      }
    } catch (error) {
      console.error('Error updating equation:', error);
    }
  }

  // Показ ошибки
  showError(message, error) {
    console.error(message, error);
    
    // Создаем элемент для отображения ошибки
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <h2>⚠️ ${message}</h2>
      <p>Попробуйте перезагрузить страницу</p>
      <details>
        <summary>Технические детали</summary>
        <pre>${error.stack || error.message || 'Unknown error'}</pre>
      </details>
    `;
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: var(--radius);
      padding: 20px;
      max-width: 500px;
      z-index: 10000;
      color: var(--text);
    `;
    
    document.body.appendChild(errorDiv);
  }

  // Получение статистики
  getStats() {
    if (!this.isInitialized) {
      return null;
    }
    
    return {
      ...this.chemistryEngine.getStats(),
      currentReagents: this.addedReagents.length,
      isOnline: navigator.onLine
    };
  }
}

// Запуск приложения
(async () => {
  'use strict';
  
  try {
    // Ждем загрузки DOM
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // Создаем и инициализируем приложение
    window.chemLabDemo = new ChemLabDemo();
    await window.chemLabDemo.init();
    
  } catch (error) {
    console.error('Critical error starting application:', error);
    
    // Показываем критическую ошибку
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <h2>🚫 Критическая ошибка</h2>
      <p>Не удалось запустить приложение</p>
      <button onclick="location.reload()">Перезагрузить</button>
    `;
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff6b7a;
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      z-index: 10000;
    `;
    
    document.body.appendChild(errorDiv);
  }
})();
