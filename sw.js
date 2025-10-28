const CACHE_NAME = 'gastos-controle-v10'; 
const APP_SHELL_URLS = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './components/CategoryManager.tsx',
  './components/ConfirmationModal.tsx',
  './components/ExpenseForm.tsx',
  './components/ExpenseTable.tsx',
  './components/Icons.tsx',
  './components/InfoModal.tsx',
  './app-icon.svg',
  './icon-192x192.png',
  './icon-512x512.png',
  './manifest.json',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/'
];

// Import Babel so it's available in the worker's global scope.
importScripts('https://unpkg.com/@babel/standalone/babel.min.js');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto, salvando App Shell.');
        return Promise.all(
          APP_SHELL_URLS.map(url => 
            cache.add(url).catch(err => console.warn(`Falha ao cachear ${url}:`, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

const transpileAndServe = (request) => {
    return fetch(request)
        .then(networkResponse => {
            if (!networkResponse.ok) {
                throw new Error(`Network response not OK for ${request.url}`);
            }
            return networkResponse.text().then(sourceCode => {
                const transpiledCode = self.Babel.transform(sourceCode, {
                    presets: ['react', 'typescript'],
                    filename: request.url
                }).code;

                const response = new Response(transpiledCode, {
                    headers: { 'Content-Type': 'application/javascript' }
                });

                // Cache the successful, transpiled response for offline use
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, response.clone());
                });

                return response;
            });
        })
        .catch(() => {
            // Network failed, try to serve the transpiled version from cache
            return caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return new Response(`Could not fetch or transpile ${request.url}`, { status: 404 });
            });
        });
};


self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // If the request is for a TS/TSX file from our app, transpile it.
  if (url.origin === self.location.origin && (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts'))) {
      event.respondWith(transpileAndServe(request));
  } 
  // For other requests, use a network-falling-back-to-cache strategy.
  else if (request.method === 'GET') {
      event.respondWith(
          fetch(request)
              .then(networkResponse => {
                  // If the fetch is successful, cache it.
                  const responseToCache = networkResponse.clone();
                  caches.open(CACHE_NAME).then(cache => {
                      if (request.url.startsWith('http')) {
                          cache.put(request, responseToCache);
                      }
                  });
                  return networkResponse;
              })
              .catch(() => {
                  // If the network fails, try the cache.
                  return caches.match(request);
              })
      );
  }
});