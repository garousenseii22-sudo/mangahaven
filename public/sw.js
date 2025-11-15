self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("mangahaven-cache-v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.webmanifest",
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== "mangahaven-cache-v1") {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// NETWORK FIRST for JS/CSS
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (/\.js$|\.css$|\.html$/.test(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open("mangahaven-cache-v1").then(cache => {
            cache.put(event.request, copy);
          });
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // DEFAULT: Cache-first
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request);
    })
  );
});
