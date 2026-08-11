// Service Worker - 离线支持 V2.4 优化版
const CACHE_NAME = 'pocd-v2.4';
const urlsToCache = [
  '/',
  '/index.html',
  '/app-v2.1-complete.js',
  '/database-optimized.js',
  '/config.js',
  '/fields-complete.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;1,400&display=swap'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中则返回缓存，否则请求网络
        return response || fetch(event.request);
      })
  );
});

// 更新Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
