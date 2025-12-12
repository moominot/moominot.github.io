// Nom de la caché (canvia la versió "v1" a "v2", etc. quan facis canvis importants)
const CACHE_NAME = 'editor-pdf-v1';

// Llista de recursos essencials per guardar
const ASSETS_TO_CACHE = [
  './editor_autofirma_hybrid.html',
  './manifest.json',
  './autoscript.js',
  // Llibreries externes (CDN) necessàries per funcionar offline
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://unpkg.com/lucide@latest'
];

// 1. Esdeveniment d'Instal·lació: Descarrega i guarda els fitxers
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instal·lant...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Guardant recursos a la memòria cau...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Esdeveniment d'Activació: Neteja cachés antigues
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activant...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Esborrant caché antiga:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Esdeveniment Fetch: Intercepta les peticions de xarxa
// Estratègia: Cache First (Primer mira si ho té guardat, si no, va a internet)
self.addEventListener('fetch', (event) => {
  // Ignorem peticions que no siguin HTTP/HTTPS (com chrome-extension:// o file://)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si el recurs és a la caché, el retornem (ràpid i offline)
      if (response) {
        return response;
      }
      // Si no, el demanem a la xarxa
      return fetch(event.request).catch((error) => {
        console.error('[Service Worker] Error de xarxa:', error);
        // Aquí podries retornar una pàgina "offline.html" si volguessis
      });
    })
  );
});
