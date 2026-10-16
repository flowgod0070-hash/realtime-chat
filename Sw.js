// 플로우갓의 채팅방 - Clean SW v7 - 캐시 안하는 버전
const VERSION = 'v7';

self.addEventListener('install', (event) => {
  console.log('SW v7 설치 - 옛날 캐시 삭제');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW v7 활성화');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => {
        console.log('캐시 삭제:', k);
        return caches.delete(k);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // 무조건 네트워크에서 가져오기 - 캐시 사용 안함
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
