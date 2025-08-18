'use strict'
const CACHE_NAME = 'exif-extractor-v4'
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/locales/en.json',
  '/locales/zh-Hant.json',
  '/locales/es.json',
  '/locales/fr.json',
  '/locales/ar.json',
  '/locales/hi.json',
  '/locales/ur.json',
  '/locales/ja.json',
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
  // Network-first for HTML to avoid stale UI
  const isHtml = req.mode === 'navigate' || req.destination === 'document' || (req.headers.get('accept') || '').includes('text/html')
  if (isHtml) {
    event.respondWith((async () => {
      try {
        const resp = await fetch(req)
        const cache = await caches.open(CACHE_NAME)
        cache.put(req, resp.clone())
        return resp
      } catch {
        const cache = await caches.open(CACHE_NAME)
        return (await cache.match(req)) || (await cache.match('/index.html')) || (await cache.match('/')) || new Response('Offline', { status: 503, statusText: 'Offline' })
      }
    })())
    return
  }

  // Network-first for other same-origin GET requests (scripts, styles, images, manifest, etc.)
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    try {
      const resp = await fetch(req)
      if (req.url.startsWith(self.location.origin)) cache.put(req, resp.clone())
      return resp
    } catch {
      const cached = await cache.match(req)
      if (cached) return cached
      const fallback = await cache.match('/')
      return fallback || new Response('Offline', { status: 503, statusText: 'Offline' })
    }
  })())
}) 