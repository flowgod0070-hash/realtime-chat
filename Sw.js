// 플로우갓의 채팅방 - Clean SW v8 - 캐시 안하는 버전
const VERSION = 'v8';
self.addEventListener('install', (event) => {
  console.log('SW v8 설치');
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  console.log('SW v8 활성화 - 모든 옛날 캐시 삭제');
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
  // 네트워크 우선, 실패하면 캐시
  event.respondWith(
    fetch(event.request, {cache: 'no-store'})
      .catch(()=>caches.match(event.request))
  );
});
