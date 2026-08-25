// Service worker minimo so pra tornar o app instalavel (PWA).
// De proposito SEM cache agressivo de paginas/API — evita o bug classico de
// "app instalado preso numa build antiga" (visto e corrigido no VisitaIA).
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // passthrough: sem interceptar/cachear, so a presenca de um SW ativo
  // + manifest.webmanifest ja satisfaz o criterio de instalabilidade.
});
