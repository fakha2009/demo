// Effects Module - модуль для визуальных эффектов
class EffectsManager {
  constructor() {
    this.activeEffects = new Set();
    this.particleContainer = null;
  }

  // Инициализация
  init() {
    try {
      this.createParticleContainer();
      console.log('Effects Manager initialized');
    } catch (error) {
      console.error('Failed to initialize Effects Manager:', error);
      throw error;
    }
  }

  // Создание контейнера для частиц
  createParticleContainer() {
    this.particleContainer = document.createElement('div');
    this.particleContainer.id = 'particle-container';
    this.particleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    `;
    document.body.appendChild(this.particleContainer);
  }

  // Применение эффекта реакции
  applyReactionEffect(reaction, flaskElement, liquidElement) {
    if (!reaction || !reaction.effects) {
      console.warn('No effects defined for reaction');
      return;
    }

    const { effects } = reaction;
    
    try {
      switch (effects.visual) {
        case 'fire':
          this.applyFireEffect(flaskElement, effects);
          break;
        case 'gas':
          this.applyGasEffect(flaskElement, effects);
          break;
        case 'bubbles':
          this.applyBubblesEffect(flaskElement, effects);
          break;
        case 'neutral':
          this.applyNeutralEffect(flaskElement, effects);
          break;
        case 'slow_oxidation':
          this.applySlowOxidationEffect(flaskElement, effects);
          break;
        default:
          console.warn(`Unknown effect type: ${effects.visual}`);
      }

      // Обновляем цвет жидкости
      if (effects.color && liquidElement) {
        this.animateColorChange(liquidElement, effects.color, effects.duration || 2000);
      }

      // Создаем частицы
      if (effects.particles && effects.particles.length > 0) {
        this.createParticles(flaskElement, effects.particles);
      }

    } catch (error) {
      console.error('Error applying reaction effect:', error);
    }
  }

  // Эффект горения
  applyFireEffect(flaskElement, effects) {
    try {
      // Ускоряем анимацию нагревателя
      const heatSource = document.getElementById('heatSource');
      if (heatSource) {
        heatSource.style.animationDuration = '0.4s';
        setTimeout(() => {
          heatSource.style.animationDuration = '2s';
        }, effects.duration || 2000);
      }

      // Создаем огненные частицы
      this.createFireParticles(flaskElement);
      
      // Вспышка
      this.createFlash(flaskElement, 'orange', 300);

    } catch (error) {
      console.error('Error in fire effect:', error);
    }
  }

  // Эффект выделения газа
  applyGasEffect(flaskElement, effects) {
    try {
      // Ускоряем пузырьки
      const bubbles = document.querySelectorAll('.bubble');
      bubbles.forEach(bubble => {
        bubble.style.animationDuration = '0.4s';
      });

      setTimeout(() => {
        bubbles.forEach(bubble => {
          bubble.style.animationDuration = '3s';
        });
      }, effects.duration || 3000);

      // Создаем газовые частицы
      this.createGasParticles(flaskElement);
      
    } catch (error) {
      console.error('Error in gas effect:', error);
    }
  }

  // Эффект пузырьков
  applyBubblesEffect(flaskElement, effects) {
    try {
      // Создаем дополнительные пузырьки
      this.createExtraBubbles(flaskElement, effects.duration || 4000);
      
      // Ускоряем существующие пузырьки
      const bubbles = document.querySelectorAll('.bubble');
      bubbles.forEach(bubble => {
        bubble.style.animationDuration = '0.4s';
      });

      setTimeout(() => {
        bubbles.forEach(bubble => {
          bubble.style.animationDuration = '3s';
        });
      }, effects.duration || 4000);
      
    } catch (error) {
      console.error('Error in bubbles effect:', error);
    }
  }

  // Нейтральный эффект
  applyNeutralEffect(flaskElement, effects) {
    try {
      // Легкая вспышка
      this.createFlash(flaskElement, 'lightgreen', 200);
      
      // Волны тепла
      this.createHeatWaves(flaskElement);
      
    } catch (error) {
      console.error('Error in neutral effect:', error);
    }
  }

  // Эффект медленного окисления
  applySlowOxidationEffect(flaskElement, effects) {
    try {
      // Постепенное изменение цвета
      if (effects.color) {
        this.animateColorChange(flaskElement, effects.color, effects.duration || 3000);
      }
      
      // Создаем частицы ржавчины
      this.createRustParticles(flaskElement);
      
    } catch (error) {
      console.error('Error in slow oxidation effect:', error);
    }
  }

  // Анимация изменения цвета
  animateColorChange(element, targetColor, duration) {
    try {
      element.style.transition = `background ${duration}ms ease-in-out`;
      element.style.background = targetColor;
      
      setTimeout(() => {
        element.style.transition = '';
      }, duration);
    } catch (error) {
      console.error('Error animating color change:', error);
    }
  }

  // Создание вспышки
  createFlash(element, color = 'white', duration = 200) {
    try {
      const flash = document.createElement('div');
      flash.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${color};
        opacity: 0;
        pointer-events: none;
        border-radius: inherit;
        z-index: 10;
      `;
      
      element.appendChild(flash);
      
      // Анимация вспышки
      requestAnimationFrame(() => {
        flash.style.transition = `opacity ${duration}ms ease-in-out`;
        flash.style.opacity = '0.8';
        
        setTimeout(() => {
          flash.style.opacity = '0';
          setTimeout(() => {
            if (flash.parentNode) {
              flash.parentNode.removeChild(flash);
            }
          }, duration);
        }, 100);
      });
      
    } catch (error) {
      console.error('Error creating flash:', error);
    }
  }

  // Создание частиц
  createParticles(container, particleTypes) {
    try {
      particleTypes.forEach(type => {
        switch (type) {
          case 'spark':
            this.createSparkParticles(container);
            break;
          case 'smoke':
            this.createSmokeParticles(container);
            break;
          case 'bubble':
            this.createBubbleParticles(container);
            break;
          case 'oxygen':
            this.createOxygenParticles(container);
            break;
          case 'rust':
            this.createRustParticles(container);
            break;
        }
      });
    } catch (error) {
      console.error('Error creating particles:', error);
    }
  }

  // Создание искр
  createSparkParticles(container) {
    try {
      const rect = container.getBoundingClientRect();
      const sparkCount = 8;
      
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.style.cssText = `
          position: fixed;
          width: 3px;
          height: 3px;
          background: #ff6b35;
          border-radius: 50%;
          left: ${rect.left + rect.width / 2}px;
          top: ${rect.top + rect.height / 2}px;
          pointer-events: none;
          z-index: 1001;
        `;
        
        this.particleContainer.appendChild(spark);
        
        // Анимация искры
        const angle = (Math.PI * 2 * i) / sparkCount;
        const velocity = 2 + Math.random() * 3;
        const lifetime = 800 + Math.random() * 400;
        
        this.animateParticle(spark, angle, velocity, lifetime, true);
      }
    } catch (error) {
      console.error('Error creating spark particles:', error);
    }
  }

  // Создание дыма
  createSmokeParticles(container) {
    try {
      const rect = container.getBoundingClientRect();
      const smokeCount = 5;
      
      for (let i = 0; i < smokeCount; i++) {
        setTimeout(() => {
          const smoke = document.createElement('div');
          smoke.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(100,100,100,0.8), transparent);
            border-radius: 50%;
            left: ${rect.left + rect.width / 2 - 10}px;
            top: ${rect.top + rect.height / 2 - 10}px;
            pointer-events: none;
            z-index: 1001;
          `;
          
          this.particleContainer.appendChild(smoke);
          
          // Анимация дыма
          this.animateSmoke(smoke, 2000 + i * 200);
        }, i * 100);
      }
    } catch (error) {
      console.error('Error creating smoke particles:', error);
    }
  }

  // Создание огненных частиц
  createFireParticles(container) {
    this.createSparkParticles(container);
  }

  // Создание газовых частиц
  createGasParticles(container) {
    this.createBubbleParticles(container);
  }

  // Создание пузырьковых частиц
  createBubbleParticles(container) {
    try {
      const rect = container.getBoundingClientRect();
      const bubbleCount = 3;
      
      for (let i = 0; i < bubbleCount; i++) {
        setTimeout(() => {
          const bubble = document.createElement('div');
          const size = 5 + Math.random() * 10;
          bubble.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255,255,255,0.8), rgba(200,230,255,0.4));
            border-radius: 50%;
            left: ${rect.left + rect.width / 2 - size/2}px;
            top: ${rect.top + rect.height / 2 - size/2}px;
            pointer-events: none;
            z-index: 1001;
          `;
          
          this.particleContainer.appendChild(bubble);
          
          // Анимация пузырька
          this.animateBubble(bubble, 2000 + Math.random() * 1000);
        }, i * 200);
      }
    } catch (error) {
      console.error('Error creating bubble particles:', error);
    }
  }

  // Создание частиц кислорода
  createOxygenParticles(container) {
    this.createBubbleParticles(container);
  }

  // Создание частиц ржавчины
  createRustParticles(container) {
    try {
      const rect = container.getBoundingClientRect();
      const rustCount = 4;
      
      for (let i = 0; i < rustCount; i++) {
        const rust = document.createElement('div');
        const size = 3 + Math.random() * 5;
        rust.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background: #8b4513;
          border-radius: 50%;
          left: ${rect.left + Math.random() * rect.width}px;
          top: ${rect.top + Math.random() * rect.height}px;
          pointer-events: none;
          z-index: 1001;
        `;
        
        this.particleContainer.appendChild(rust);
        
        // Медленная анимация
        this.animateRust(rust, 3000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('Error creating rust particles:', error);
    }
  }

  // Создание дополнительных пузырьков
  createExtraBubbles(container, duration) {
    try {
      const liquid = container.querySelector('.liquid');
      if (!liquid) return;
      
      const bubbleCount = 5;
      for (let i = 0; i < bubbleCount; i++) {
        setTimeout(() => {
          const bubble = document.createElement('span');
          const size = 8 + Math.random() * 12;
          bubble.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.7);
            width: ${size}px;
            height: ${size}px;
            left: ${20 + Math.random() * 140}px;
            bottom: 10px;
            animation: bubbleAnim ${2 + Math.random()}s infinite ease-in;
          `;
          
          liquid.appendChild(bubble);
          
          // Удаляем пузырек после анимации
          setTimeout(() => {
            if (bubble.parentNode) {
              bubble.parentNode.removeChild(bubble);
            }
          }, duration);
        }, i * 200);
      }
    } catch (error) {
      console.error('Error creating extra bubbles:', error);
    }
  }

  // Создание волн тепла
  createHeatWaves(container) {
    try {
      const waveCount = 3;
      for (let i = 0; i < waveCount; i++) {
        setTimeout(() => {
          const wave = document.createElement('div');
          wave.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 5;
          `;
          
          container.appendChild(wave);
          
          // Анимация волны
          this.animateHeatWave(wave, 1000);
        }, i * 300);
      }
    } catch (error) {
      console.error('Error creating heat waves:', error);
    }
  }

  // Анимация частицы
  animateParticle(particle, angle, velocity, lifetime, fadeOut = false) {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / lifetime;
      
      if (progress >= 1) {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
        return;
      }
      
      const distance = velocity * elapsed / 10;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - (progress * progress * 50); // гравитация
      
      particle.style.transform = `translate(${x}px, ${y}px)`;
      
      if (fadeOut) {
        particle.style.opacity = 1 - progress;
      }
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  // Анимация дыма
  animateSmoke(smoke, lifetime) {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / lifetime;
      
      if (progress >= 1) {
        if (smoke.parentNode) {
          smoke.parentNode.removeChild(smoke);
        }
        return;
      }
      
      const scale = 1 + progress * 2;
      const opacity = 0.8 - progress * 0.8;
      const y = -progress * 100;
      
      smoke.style.transform = `translate(-50%, -50%) scale(${scale}) translateY(${y}px)`;
      smoke.style.opacity = opacity;
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  // Анимация пузырька
  animateBubble(bubble, lifetime) {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / lifetime;
      
      if (progress >= 1) {
        if (bubble.parentNode) {
          bubble.parentNode.removeChild(bubble);
        }
        return;
      }
      
      const y = -progress * 200;
      const scale = 1 + progress * 0.5;
      const opacity = 1 - progress * 0.5;
      
      bubble.style.transform = `translateY(${y}px) scale(${scale})`;
      bubble.style.opacity = opacity;
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  // Анимация ржавчины
  animateRust(rust, lifetime) {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / lifetime;
      
      if (progress >= 1) {
        rust.style.opacity = '0.3';
        return;
      }
      
      const opacity = 0.3 + progress * 0.5;
      rust.style.opacity = opacity;
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }

  // Анимация волны тепла
  animateHeatWave(wave, duration) {
    wave.style.transition = `all ${duration}ms ease-out`;
    wave.style.transform = 'translate(-50%, -50%) scale(3)';
    wave.style.opacity = '0';
    
    setTimeout(() => {
      if (wave.parentNode) {
        wave.parentNode.removeChild(wave);
      }
    }, duration);
  }

  // Очистка всех частиц
  clearParticles() {
    try {
      if (this.particleContainer) {
        this.particleContainer.innerHTML = '';
      }
    } catch (error) {
      console.error('Error clearing particles:', error);
    }
  }
}

// Экспорт модуля
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EffectsManager;
} else {
  window.EffectsManager = EffectsManager;
}
