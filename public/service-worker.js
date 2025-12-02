const CACHE_VERSION = "v5";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/img/fluxuss.png",
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ============
  // 1) NÃO CACHEAR HTML DO NEXT.JS
  // ============
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(fetch(req).catch(() => caches.match("/")));
    return;
  }

  // ============
  // 2) APIS SEM CACHE
  // ============
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req).catch(() => {
        if (url.pathname.includes("/api/contador")) {
          return new Response(
            JSON.stringify({ pessoas: 0 }),
            { headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response("[]", {
          headers: { "Content-Type": "application/json" },
        });
      })
    );
    return;
  }

  // ============
  // 3) STATIC FILES → cache-first
  // ============
  event.respondWith(
    caches.match(req).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(req).then((fetchRes) => {
          if (
            req.method === "GET" &&
            fetchRes.status === 200 &&
            !req.headers.get("accept")?.includes("text/html")
          ) {
            const clone = fetchRes.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(req, clone));
          }
          return fetchRes;
        })
      );
    })
  );
});
