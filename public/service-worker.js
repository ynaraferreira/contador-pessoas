/* const CACHE_NAME = "contador-pessoas-v1";
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
  */
const STATIC_CACHE = "static-v4";
const DYNAMIC_CACHE = "dynamic-v4";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/contador",
  "/relatorios",
  "/favicon.ico",
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // === APIs ===
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          return res;
        })
        .catch(() => {
          // Fallback para contador
          if (url.pathname.includes("/api/contador")) {
            return new Response(
              JSON.stringify({ contador: 0 }),
              { headers: { "Content-Type": "application/json" } }
            );
          }
          return new Response("[]", { headers: { "Content-Type": "application/json" } });
        })
    );
    return;
  }

  // === Páginas e assets ===
  event.respondWith(
    caches.match(req).then(cacheRes => {
      return (
        cacheRes ||
        fetch(req).then(fetchRes => {
          if (req.method === "GET" && fetchRes.status === 200) {
            const clone = fetchRes.clone();
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(req, clone));
          }
          return fetchRes;
        })
      );
    })
  );
});
