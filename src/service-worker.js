/**
 * AdDU Alumni Network — Service Worker
 * Strategy: Cache-First for app shell assets, Network-First for external/dynamic content
 * Version bump CACHE_NAME whenever you deploy new assets.
 */

const CACHE_NAME      = 'addu-alumni-v1';
const OFFLINE_URL     = '/offline.html';

/**
 * APP SHELL — these files are cached immediately on SW install.
 * They form the "skeleton" of the app that loads with zero network.
 */
const APP_SHELL = [
  '/',
  '/index.html',
  '/app.js',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
];

/**
 * EXTERNAL RESOURCES to cache on first use (runtime caching).
 * Includes Lit CDN and the AdDU seal from Wikimedia.
 */
const RUNTIME_CACHE_PATTERNS = [
  /unpkg\.com/,            // LitElement from CDN
  /wikipedia\.org/,        // AdDU seal image
  /wikimedia\.org/,        // Wikimedia assets
];


// ─── INSTALL EVENT ──────────────────────────────────────────────────────────
// Pre-cache the entire app shell immediately when SW is installed.
self.addEventListener('install', (event) => {
  console.log('[SW] Installing — caching app shell...');

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-caching app shell:', APP_SHELL);

      // addAll fails if ANY request fails — we use individual adds
      // so a missing icon doesn't break the entire install.
      const results = await Promise.allSettled(
        APP_SHELL.map(url =>
          cache.add(url).catch(err => {
            console.warn(`[SW] Failed to cache: ${url}`, err);
          })
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      console.log(`[SW] App shell cached: ${succeeded}/${APP_SHELL.length} files`);
    })
    .then(() => {
      // Activate immediately — don't wait for old tabs to close
      return self.skipWaiting();
    })
  );
});


// ─── ACTIVATE EVENT ─────────────────────────────────────────────────────────
// Remove OLD caches from previous SW versions.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating — cleaning old caches...');

  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      const deletions = cacheNames
        .filter(name => name !== CACHE_NAME)
        .map(name => {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        });

      await Promise.all(deletions);

      // Take control of all open tabs immediately
      return self.clients.claim();
    })
  );
});


// ─── FETCH EVENT ────────────────────────────────────────────────────────────
// This intercepts EVERY network request made by your app.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip browser-extension and non-http requests
  if (!request.url.startsWith('http')) return;

  // ── STRATEGY ROUTING ──────────────────────────────────────────────────────

  // 1. Navigation requests (HTML page loads) → Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // 2. External CDN/runtime resources (Lit, images) → Stale-while-revalidate
  const isRuntimeAsset = RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
  if (isRuntimeAsset) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // 3. Local static assets → Cache-first (fastest possible load)
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 4. Everything else → Network with cache fallback
  event.respondWith(networkWithCacheFallback(request));
});


// ─── CACHING STRATEGIES ──────────────────────────────────────────────────────

/**
 * Cache-First: Serve from cache. If not in cache, fetch, cache, and return.
 * Best for: local JS, CSS, HTML, icons — files that rarely change.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] Cache-first fetch failed:', request.url, err);
    return new Response('Asset unavailable offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Network-First with Offline Fallback: Try network. If offline, serve cache.
 * If cache also misses, serve offline.html.
 * Best for: navigation/HTML (so users always get latest content when online).
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Final fallback: offline page
    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) return offlinePage;

    return new Response('<h1>You are offline</h1>', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

/**
 * Stale-While-Revalidate: Serve cache immediately, then update cache from network.
 * Best for: CDN assets like LitElement and remote images — fast & eventually fresh.
 */
async function staleWhileRevalidate(request) {
  const cache  = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fire off network request regardless (update in background)
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  // Return cached immediately, or wait for network if no cache
  return cached || fetchPromise;
}

/**
 * Network with Cache Fallback: Try network, fall back to cache.
 * Best for: unknown external resources.
 */
async function networkWithCacheFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    return cached || new Response('Unavailable offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}


// ─── BACKGROUND SYNC (future-ready hook) ─────────────────────────────────────
// When a donation submit fails offline, this would retry it when back online.
// Uncomment and wire to your submit logic when ready.
/*
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-donation') {
    event.waitUntil(syncPendingDonations());
  }
});

async function syncPendingDonations() {
  // Read from IndexedDB, POST to your API
  console.log('[SW] Syncing pending donations...');
}
*/


// ─── PUSH NOTIFICATIONS (future-ready hook) ──────────────────────────────────
// For alumni activity alerts, donation confirmations, etc.
/*
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  self.registration.showNotification(data.title || 'AdDU Alumni', {
    body: data.body || 'You have a new notification.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: { url: data.url || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
*/
