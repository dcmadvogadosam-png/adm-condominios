const CACHE_NAME = "adm-condominios-v1";
const APP_SHELL = [
    "/",
    "/index.html",
    "/styles.css",
    "/app.js",
    "/manifest.webmanifest",
    "/assets/logo-adm-transparent.png",
    "/assets/hero-adm-premium.jpg",
    "/assets/icon-192.png",
    "/assets/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    const request = event.request;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                return response;
            })
            .catch(() => caches.match(request).then(cached => cached || caches.match("/index.html")))
    );
});
