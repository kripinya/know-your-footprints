/**
 * Service Worker for Know Your Footprints PWA.
 * Implements cache-first strategy for offline support.
 */

"use strict";

const CACHE_NAME = 'kyf-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/storage.js',
    '/js/calculator.js',
    '/js/dashboard.js',
    '/js/assistant.js',
    '/js/challenges.js',
    '/js/whatif.js',
    '/js/timemachine.js',
    '/js/app.js',
];

// Install — cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — cache-first, network fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET and cross-origin requests
    if (event.request.method !== 'GET') return;
    
    // Let API calls (Claude) go straight to network
    if (event.request.url.includes('anthropic.com')) return;
    if (event.request.url.includes('googleapis.com')) return;
    if (event.request.url.includes('cdn.jsdelivr.net')) {
        // Cache CDN resources with network-first
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
