const CACHE_NAME = "english-repetition-v5";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json"
];


// Install the service worker
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(FILES_TO_CACHE).then(() => self.skipWaiting());

            })
    );

});


// Activate the service worker
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames.map(cacheName => {

                        if (cacheName !== CACHE_NAME) {

                            return caches.delete(cacheName);

                        }

                    })
                );

            }).then(() => self.clients.claim())
    );

});


// Serve cached files when possible
self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(event.request);

            })
    );

});