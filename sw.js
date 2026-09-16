const CACHE = "cards-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./data/cards.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./img/tcp-handshake.svg",
  "./img/tcp-ip-model.svg",
  "./img/osi-model.svg",
  "./img/dns.svg",
  "./img/nat.svg",
  "./img/subnet.svg",
  "./img/container-vs-vm.svg",
  "./img/k8s-arch.svg",
  "./img/raid.svg",
  "./img/linux-boot.svg",
  "./img/process-states.svg",
  "./img/docker-layers.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((resp) => {
        const clone = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return resp;
      });
    })
  );
});
