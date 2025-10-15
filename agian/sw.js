// sw.js

const CACHE_NAME = 'notionx-cache-v1';
// This list should include all the files that make up your app's "shell".
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  // Add all your other pages, css, and js files here
  '/pages/dashboard.html',
  '/css/dashboard.css',
  '/js/dashboard.js',
  '/pages/tasks.html',
  '/css/tasks.css',
  '/js/tasks.js',
  '/pages/notes.html',
  '/css/notes.css',
  '/js/notes.js',
  '/pages/water.html',
  '/css/water.css',
  '/js/water.js',
  '/pages/pomodoro.html',
  '/css/pomodoro.css',
  '/js/pomodoro.js',
  '/pages/habits.html',
  '/css/habits.css',
  '/js/habits.js',
  '/pages/budget.html',
  '/css/budget.css',
  '/js/budget.js',
  '/pages/journal.html',
  '/css/journal.css',
  '/js/journal.js',
  '/pages/calendar.html',
  '/css/calendar.css',
  '/js/calendar.js',
  '/pages/games.html',
  '/css/games.css',
  '/js/games.js',
  '/pages/store.html',
  '/css/store.css',
  '/js/store.js',
  '/pages/achievements.html',
  '/css/achievements.css',
  '/js/achievements.js',
  '/pages/profile.html',
  '/css/profile.css',
  '/js/profile.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// 1. Installation: Open a cache and add the "app shell" files to it.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// 2. Fetching: Intercept network requests.
// Serve from the cache if available, otherwise fetch from the network.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response from the cache
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      })
  );
});
