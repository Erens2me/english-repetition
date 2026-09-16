const CACHE_NAME = "english-repetition-v7";
const FILES_TO_CACHE = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME)
        .then(cache => cache.addAll(FILES_TO_CACHE))
        .then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(
        keys.filter(key => key.startsWith("english-repetition-") && key !== CACHE_NAME)
            .map(key => caches.delete(key))
    )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
    // Updates of app code use the network if online, cached copy if offline.
    const path = new URL(event.request.url).pathname;
    const isAppShell = path.endsWith("/index.html") || path.endsWith("/") || path.endsWith("/manifest.json");
    if (isAppShell) {
        event.respondWith(fetch(event.request).then(response => {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
            }
            return response;
        }).catch(() => caches.match(event.request)));
    } else {
        event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
    }
});
