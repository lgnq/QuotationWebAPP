// 缓存版本
const CACHE_NAME = 'eur-cny-calc-pwa-v1';
// 需缓存的核心文件
const CACHE_ASSETS = ['/', '/index.html', '/manifest.json'];

// 安装：缓存核心文件
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_ASSETS);
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 拦截请求：离线返回缓存，实时汇率请求走网络
self.addEventListener('fetch', (e) => {
  // 汇率API请求不缓存，走网络
  if (e.request.url.includes('exchangerate-api')) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({rates: {CNY:7.80}}))));
  } else {
    // 其他文件优先走缓存
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});