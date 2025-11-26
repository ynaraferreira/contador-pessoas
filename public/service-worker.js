const CACHE_NAME = "contador-pessoas-v1";
const URLS_TO_CACHE = [
  "/",
  "/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;

  // Para a API, tenta sempre rede; se falhar, devolve "0"
  if (request.url.includes("/api/contador")) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ pessoas: 0 }), {
          headers: { "Content-Type": "application/json" }
        })
      )
    );
    return;
  }

  // Para arquivos estáticos, cache-first
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});
