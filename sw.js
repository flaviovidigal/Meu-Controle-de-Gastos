const CACHE_NAME = 'gastos-controle-v5'; // Versão do cache incrementada
const APP_SHELL_URLS = [
  './',
  './index.html',
  './app-icon.svg',
  './icon-192x192.png',
  './icon-512x512.png',
  './manifest.json',
];

// Evento de instalação: focado em cachear o App Shell de forma segura.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto, salvando App Shell essencial.');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => {
          console.error('Falha ao pré-cachear o App Shell:', err);
      })
  );
});

// Evento de ativação: limpa caches antigos para evitar conflitos.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de busca: Estratégia "Network falling back to cache".
// Isso garante que o usuário receba o conteúdo mais recente se estiver online,
// mas ainda possa usar o aplicativo offline.
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET para evitar cache de POSTs, etc.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a resposta da rede for válida, clona, armazena em cache e a retorna.
        if (networkResponse && networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              // Armazena a nova resposta para a requisição, atualizando o cache.
              cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se a rede falhar (offline), tenta encontrar a resposta no cache.
        return caches.match(event.request)
          .then((cachedResponse) => {
            // Retorna a resposta do cache, se existir.
            return cachedResponse;
          });
      })
  );
});
