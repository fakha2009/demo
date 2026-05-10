// ChemLab TJ Service Worker
const CACHE_NAME = 'chemlab-tj-v1.0.0';
const STATIC_CACHE = 'chemlab-static-v1.0.0';
const DATA_CACHE = 'chemlab-data-v1.0.0';

// Статические ресурсы для кэширования
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/demo.html',
  '/styles.css',
  '/demo.css',
  '/script.js',
  '/demo.js',
  '/data/reactions.json',
  '/data/reagents.json',
  '/manifest.json',
  // Шрифты Google Fonts
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800;14..32,900&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SW: Failed to cache static assets:', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activated');
        return self.clients.claim();
      })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем chrome-extension и другие не-http запросы
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Стратегия для статических ресурсов - Cache First
  if (STATIC_ASSETS.some(asset => asset.includes(url.pathname) || asset === url.href)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('SW: Serving from cache:', request.url);
            return response;
          }
          
          console.log('SW: Fetching from network:', request.url);
          return fetch(request)
            .then((response) => {
              // Кэшируем успешные ответы
              if (response.ok && request.method === 'GET') {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(() => {
              // Если сеть недоступна и нет в кэше, возвращаем оффлайн страницу
              if (request.destination === 'document') {
                return caches.match('/index.html');
              }
              return new Response('Offline', { 
                status: 503, 
                statusText: 'Service Unavailable' 
              });
            });
        })
    );
    return;
  }

  // Стратегия для данных - Network First, fallback to cache
  if (url.pathname.includes('/data/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Для остальных запросов - Network First
  event.respondWith(
    fetch(request)
      .catch(() => {
        // Пробуем достать из кэша если сеть недоступна
        return caches.match(request);
      })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CACHE_DATA':
      cacheData(payload.url, payload.data);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches()
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
      
    default:
      console.log('SW: Unknown message type:', type);
  }
});

// Вспомогательные функции
async function cacheData(url, data) {
  try {
    const cache = await caches.open(DATA_CACHE);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(url, response);
    console.log('SW: Data cached:', url);
  } catch (error) {
    console.error('SW: Failed to cache data:', error);
  }
}

async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('SW: All caches cleared');
  } catch (error) {
    console.error('SW: Failed to clear caches:', error);
    throw error;
  }
}

// Периодическая очистка старых кэшей (раз в час)
setInterval(() => {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      caches.open(cacheName).then((cache) => {
        cache.keys().then((requests) => {
          requests.forEach((request) => {
            // Удаляем старые записи кэша
            caches.delete(request);
          });
        });
      });
    });
  });
}, 3600000); // 1 час
