// sw.js - Place this file in your root directory
const CACHE_NAME = 'shared-data-v1';

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    console.log('Service Worker activated');
    event.waitUntil(self.clients.claim());
});

// Fetch event - handles all network requests
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Handle share target POST request
    if (url.pathname === '/fetch-data' && event.request.method === 'POST') {
        event.respondWith(handleShareTarget(event.request));
        return;
    }

    // Let all other requests pass through normally
    event.respondWith(fetch(event.request));
});

// Handle shared content
async function handleShareTarget(request) {
    try {
        const formData = await request.formData();
        const image = formData.get('image');
        const title = formData.get('title') || '';
        const text = formData.get('text') || '';
        const url = formData.get('url') || '';

        if (!image) {
            console.log('No image in shared content');
            return Response.redirect('/?error=no_image', 303);
        }

        // Prepare shared data
        const shareData = {
            title: title,
            text: text,
            url: url,
            timestamp: Date.now(),
            imageName: image.name,
            imageType: image.type,
            imageSize: image.size
        };

        // Store shared data in cache
        const cache = await caches.open(CACHE_NAME);
        await cache.put('shared-data-latest', new Response(JSON.stringify(shareData)));

        // Store the actual image file
        const imageBuffer = await image.arrayBuffer();
        const imageResponse = new Response(imageBuffer, {
            headers: {
                'Content-Type': image.type,
                'X-Image-Name': image.name,
                'X-Image-Size': image.size.toString()
            }
        });
        await cache.put('shared-image-latest', imageResponse);

        // Redirect to main app with shared parameter
        return Response.redirect('/?shared=expense_image', 303);

    } catch (error) {
        console.error('Error handling shared content:', error);
        return Response.redirect('/?error=share_failed', 303);
    }
}