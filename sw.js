'use strict'
const CACHE_NAME = 'exif-extractor-v1'
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/favicon.svg',
]

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll(CORE_ASSETS)
    self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))
    self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const req = event.request

  if (req.method !== 'GET') return
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(req)
    if (cached) return cached
    try {
      const resp = await fetch(req)

      if (req.url.startsWith(self.location.origin)) {
        cache.put(req, resp.clone())
      }
      return resp
    } catch {

      const fallback = await cache.match('/')
      return fallback || new Response('Offline', { status: 503, statusText: 'Offline' })
    }
  })())
}) 