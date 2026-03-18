/**
 * Service Worker for the Memory Game PWA.
 *
 * This worker caches the core application shell and all card assets
 * (the images located in `public/assets`). The list of card assets is
 * maintained centrally in `src/types.ts` as the `CARD_ASSETS` constant,
 * which we import here to keep the cache manifest in sync with the
 * application code.
 *
 * The caching strategy is:
 *   - On install: pre‑cache the application shell files and all card assets.
 *   - On activate: clean up any old caches.
 *   - On fetch: respond with a cached response if available,
 *               otherwise fall back to a network request and cache it.
 *
 * This approach ensures the game can be played offline once the assets
 * have been loaded at least once.
 */

declare const self: ServiceWorkerGlobalScope;

const CARD_ASSETS: string[] = [
  "back",
  "camera",
  "gamepad",
  "glasses",
  "headphones",
  "icon-192",
  "icon-512",
  "joystick",
  "keyboard",
  "monitor",
  "mouse",
  "notebook",
  "phone",
  "speaker",
  "usb",
];

const CACHE_NAME = "memory-game-cache-v1";

// Core files required for the app shell.
const CORE_ASSETS: string[] = [
  "./",
  "index.html",
  "manifest.json",
  "favicon.ico",
];

// Convert the logical asset names into the actual URLs that will be cached.
const CARD_ASSET_URLS = CARD_ASSETS.map((name) => `assets/${name}.png`);

// Combine everything into one manifest.
const ASSET_MANIFEST = [...CORE_ASSETS, ...CARD_ASSET_URLS];

// Install – cache the manifest.
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Cache each asset individually; ignore failures so a single missing
        // asset does not abort the whole installation.
        const toCache = ASSET_MANIFEST;
        return Promise.all(
          toCache.map((url) =>
            cache.add(url).catch((err) => {
              // Log any request that fails so we can see which assets are missing.
              console.warn("Failed to cache asset:", url, err);
            }),
          ),
        );
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate – clean up old caches.
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
            return Promise.resolve();
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch – serve from cache, falling back to network and caching the result.
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  // Only handle GET requests.
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // Not in cache – fetch from network.
      return fetch(request)
        .then((networkResponse) => {
          // Clone the response because responses are streams.
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // If the network request fails (e.g., offline) and we have no cache,
          // you could return a fallback page or image here.
          // For simplicity, we just let the request fail.
          return new Response("Network error", { status: 502 });
        });
    }),
  );
});
