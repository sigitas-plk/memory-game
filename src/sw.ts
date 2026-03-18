/// <reference lib="webworker" />

/**
 * Service‑worker entry point for the Memory‑Game app.
 *
 * - No external `workbox-build` dependency – we only need a tiny manifest
 *   that contains the URLs to precache.
 * - Types are fully typed using the built‑in Web‑Worker lib, so the compiler
 *   knows about `self`, `ExtendableEvent`, `FetchEvent`, etc.
 * - The manifest (`__WB_MANIFEST`) is expected to be an array of objects
 *   `{ url: string; revision?: string; integrity?: string }`.  We map it to
 *   a simple `string[]` before feeding it to `caches.addAll`.
 */

declare const __WB_MANIFEST: readonly {
  url: string;
  revision?: string;
  integrity?: string;
}[];

const CACHE_NAME = "v1";

// Create a typed reference to the ServiceWorker global scope.
// `self` is typed as `Window & typeof globalThis` in the DOM lib, so we
// explicitly cast it to `ServiceWorkerGlobalScope` via `unknown`.
const sw = self as unknown as ServiceWorkerGlobalScope;

/**
 * Install – cache core assets and everything listed in the precache manifest.
 */
sw.addEventListener("install", (event: ExtendableEvent) => {
  // Convert the manifest objects into a flat list of URLs.
  const PRECACHE_URLS: string[] = (__WB_MANIFEST ?? []).map(entry => entry.url);
  const CORE_ASSETS: string[] = ["/", "/index.html"];

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([...CORE_ASSETS, ...PRECACHE_URLS]))
  );
});

/**
 * Fetch – try the cache first, fall back to the network.
 */
sw.addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then(cached => cached ?? fetch(event.request))
  );
});

/**
 * Activate – delete old caches that don’t match the current version.
 */
sw.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
});
