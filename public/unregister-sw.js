// Kill switch for service worker
// To disable the service worker in production, deploy this file and users will unregister
// Usage: Replace /registerSW.js with this file content or serve this at /unregister-sw.js

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister().then(function(success) {
        if (success) {
          console.log('Service worker unregistered successfully');
          // Clear all caches
          if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
              return Promise.all(
                cacheNames.map(function(cacheName) {
                  return caches.delete(cacheName);
                })
              );
            });
          }
        }
      });
    }
  }).catch(function(err) {
    console.error('Service worker unregistration failed:', err);
  });
}
