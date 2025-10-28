// Adiciona a biblioteca Babel para transpilação no Service Worker
importScripts('https://unpkg.com/@babel/standalone/babel.min.js');

const CACHE_NAME = 'gastos-controle-v7'; // Versão do cache incrementada para forçar a atualização
const BABEL_URL = 'https://unpkg.com/@babel/standalone/babel.min.js';
const APP_SHELL_URLS = [
  './',
  './index.html',
  './app-icon.svg',
  './icon-192x192.png',
  './icon-512x512.png',
  './manifest.json',
  BABEL_URL, // Adiciona o Babel ao cache do App Shell
];

// Evento de instalação: cacheia o App Shell e o Babel.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto, salvando App Shell e Babel.');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => {
          console.error('Falha ao pré-cachear:', err);
      })
  );
});

// Evento de ativação: limpa caches antigos.
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

// Função auxiliar para buscar e transpilar código TSX/TS.
async function fetchAndTranspile(request) {
  const response = await fetch(request);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const code = await response.text();
  
  // Usa o Babel (disponível globalmente via importScripts) para transformar o código.
  const transformedCode = Babel.transform(code, {
    presets: ['react', 'typescript'],
    filename: request.url // Importante para mensagens de erro e source maps
  }).code;
  
  // Retorna uma nova resposta com o código JavaScript e o Content-Type correto.
  return new Response(transformedCode, {
    headers: { 'Content-Type': 'application/javascript' }
  });
}

// Evento de busca: intercepta requisições para transpilar ou servir do cache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  const url = new URL(event.request.url);

  // Se for um arquivo TSX ou TS, usa a estratégia de transpilação.
  if (/\.tsx?$/.test(url.pathname)) {
    event.respondWith(
      fetchAndTranspile(event.request)
      .then(networkResponse => {
        // Armazena a resposta transpilada no cache.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      })
      .catch(error => {
        console.error('Falha no fetch/transpilação:', error);
        // Se a rede ou a transpilação falhar, tenta servir a versão do cache.
        return caches.match(event.request);
      })
    );
  } else {
    // Para outros arquivos, usa a estratégia padrão de "Network falling back to cache".
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});