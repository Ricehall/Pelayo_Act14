importScripts("/sw-manifest.js");
const CACHE = "addu-alumni-v2";
const PRECACHE = self.__PRECACHE_MANIFEST || [];

const CORE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/src/my-element.js",
  "/assets/addu-seal.png"
];

// INSTALL → precache everything
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([...CORE, ...PRECACHE]))
  );
  self.skipWaiting();
});

// ACTIVATE → clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH STRATEGY (OFFLINE-FIRST CORE)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // HTML → network first, fallback cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // JS/CSS → cache first (important for Lit + app)
  if (req.destination === "script" || req.destination === "style" || req.url.includes("/src/")) {
    event.respondWith(
      caches.match(req).then(cached =>
        cached || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
          return res;
        })
      )
    );
    return;
  }

  // IMAGES → cache first
  if (req.destination === "image") {
    event.respondWith(
      caches.match(req).then(cached =>
        cached || fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
          return res;
        })
      )
    );
    return;
  }

  // default
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});