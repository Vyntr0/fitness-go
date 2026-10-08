const CACHE_NAME = "fitness-go-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* Install */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});


/* Activate */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});


/* Fetch */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {

          /*
           * Only cache successful GET requests.
           */
          if (
            event.request.method === "GET" &&
            networkResponse.status === 200
          ) {
            const responseClone =
              networkResponse.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(
                event.request,
                responseClone
              );
            });
          }

          return networkResponse;
        })
        .catch(() => {

          /*
           * If the user is offline and the
           * requested page isn't cached,
           * return the main app.
           */
          return caches.match("./index.html");

        });

    })
  );
});
