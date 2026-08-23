// Portfolio Personal Hub — Service Worker
// Handles Web Push notifications when the app tab is closed

const APP_SHELL = "portfolio-sw-v1";

// Install — skip waiting so the SW activates immediately
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate — clear old caches and claim all clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== APP_SHELL) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Push event — fired when server sends a Web Push message
self.addEventListener("push", (event) => {
  let data = { title: "Personal Hub", body: "You have a new notification.", url: "/dashboard" };

  if (event.data) {
    try {
      data = { ...data, ...JSON.parse(event.data.text()) };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.url || "notification",
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || "/dashboard" },
    actions: [
      { action: "open", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click — open or focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
