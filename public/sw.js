// sw.js — Spendly Service Worker
// Strategy:
//   - App shell (HTML pages) → Network-first, fallback to cache
//   - Static assets (_next/static) → Cache-first (immutable)
//   - API routes → Network-only (never cache)
//   - Share target → Custom handler

const CACHE_VERSION = "v2";
const STATIC_CACHE = `spendly-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `spendly-dynamic-${CACHE_VERSION}`;
const SHARE_CACHE = "spendly-share-data";

// App shell pages to pre-cache on install
const APP_SHELL = [
  "/",
  "/dashboard",
  "/login",
  "/manifest.json",
  "/favicon.png",
];

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ──────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE && k !== SHARE_CACHE)
            .map((k) => {
              console.log("[SW] Deleting old cache:", k);
              return caches.delete(k);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Share target POST — custom handler
  if (url.pathname === "/fetch-data" && event.request.method === "POST") {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  // 2. API routes — network only, never cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 3. Next.js static assets (_next/static) — cache first (they're content-hashed)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // 4. Everything else (pages, fonts, images) — network first, fallback to cache
  if (event.request.method === "GET") {
    event.respondWith(networkFirst(event.request, DYNAMIC_CACHE));
  }
});

// ─── Strategies ────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Return offline fallback for navigation requests
    if (request.mode === "navigate") {
      const offlinePage = await caches.match("/");
      if (offlinePage) return offlinePage;
    }
    return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
  }
}

// ─── Share Target ──────────────────────────────────────────────────────────

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const title = formData.get("title") || "";
    const text = formData.get("text") || "";
    const url = formData.get("url") || "";

    if (!image) {
      console.log("[SW] No image in shared content");
      return Response.redirect("/?error=no_image", 303);
    }

    const shareData = {
      title,
      text,
      url,
      timestamp: Date.now(),
      imageName: image.name,
      imageType: image.type,
      imageSize: image.size,
    };

    // Store shared metadata + image in cache
    const cache = await caches.open(SHARE_CACHE);
    await cache.put(
      "shared-data-latest",
      new Response(JSON.stringify(shareData), {
        headers: { "Content-Type": "application/json" },
      })
    );

    const imageBuffer = await image.arrayBuffer();
    await cache.put(
      "shared-image-latest",
      new Response(imageBuffer, {
        headers: {
          "Content-Type": image.type,
          "X-Image-Name": image.name,
          "X-Image-Size": image.size.toString(),
        },
      })
    );

    return Response.redirect("/?shared=expense_image", 303);
  } catch (error) {
    console.error("[SW] Error handling shared content:", error);
    return Response.redirect("/?error=share_failed", 303);
  }
}
