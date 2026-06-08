const CACHE_NAME = "saju-lotto-v95";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=feedback-v95",
  "./app.js?v=feedback-v95",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./data/lotto-results.js?v=feedback-v95",
  "./data/pension-results.js?v=feedback-v95",
  "./data/lotto-recall-profile.js?v=feedback-v95",
  "./data/solar-terms.js?v=feedback-v95",
  "./data/saju-classical-sources.js?v=feedback-v95",
  "./data/saju-expert-rules.js?v=feedback-v95",
  "./data/saju-expert-cases.js?v=feedback-v95",
  "./data/saju-eval-cases.js?v=feedback-v95",
  "./data/saju-lotto-bridge-rules.js?v=feedback-v95",
  "./data/saju-professional-report.js?v=feedback-v95"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.all(APP_SHELL.map((asset) => cache.add(asset).catch(() => null))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const request = event.request;
  const isPageRequest =
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html");

  if (isPageRequest) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  const url = new URL(request.url);
  const isDataRequest =
    url.pathname.endsWith("/data/lotto-results.js") ||
    url.pathname.endsWith("/data/lotto-results.json") ||
    url.pathname.endsWith("/data/pension-results.js") ||
    url.pathname.endsWith("/data/pension-results.json") ||
    url.pathname.endsWith("/data/lotto-recall-profile.js") ||
    url.pathname.endsWith("/data/lotto-recall-profile.json");

  if (isDataRequest) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request);
    })
  );
});
