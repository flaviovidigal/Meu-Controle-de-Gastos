const CACHE_NAME = 'gastos-controle-v8';
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

// Evento de instalação: cacheia o App Shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto, salvando App Shell.');
        return Promise.all(
          APP_SHELL_URLS.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`Falha ao cachear ${url}:`, err);
            });
          })
        );
      })
  );
});

// Evento de ativação: limpa caches antigos e assume o controle.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento de busca: estratégia "Network falling back to cache".
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a busca na rede for bem-sucedida, clona a resposta,
        // armazena no cache e a retorna para o navegador.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
            // Apenas requisições http/https são cacheadas.
            if(responseToCache.url.startsWith('http')) {
                cache.put(event.request, responseToCache);
            }
        });
        return networkResponse;
      })
      .catch(() => {
        // Se a busca na rede falhar (ex: offline),
        // tenta encontrar uma correspondência no cache.
        return caches.match(event.request);
      })
  );
});