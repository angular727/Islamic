// Service worker for Islam: the Angular service worker plus prayer notification buttons (Snooze / Dismiss).
importScripts('./ngsw-worker.js');

self.addEventListener('notificationclick', event => {
  const n = event.notification;
  const d = n.data || {};
  if (d.kind !== 'prayer') return;            // other notifications are handled by the Angular service worker
  n.close();
  if (event.action === 'dismiss') return;

  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const message = { type: 'prayer-notification', action: event.action || 'open', data: d };

    if (wins.length) {                         // the app is open somewhere: let it handle the click
      wins[0].postMessage(message);
      if (event.action !== 'snooze' && wins[0].focus) await wins[0].focus();
      return;
    }
    if (event.action === 'snooze') {
      // The app is closed. Use a scheduled notification where the browser supports it, otherwise wait here (best effort:
      // browsers may stop the worker before a long snooze ends).
      const ms = (d.snoozeMin || 10) * 60000;
      const options = { body: n.body, icon: n.icon, tag: n.tag, requireInteraction: true, vibrate: n.vibrate, actions: n.actions, data: d };
      if ('TimestampTrigger' in self) {
        await self.registration.showNotification(n.title, { ...options, showTrigger: new TimestampTrigger(Date.now() + ms) });
      } else {
        await new Promise(res => setTimeout(res, ms));
        await self.registration.showNotification(n.title, options);
      }
      return;
    }
    await self.clients.openWindow('/?alert=' + encodeURIComponent(d.alert || 'notify') + '&prayer=' + encodeURIComponent(d.prayer || '') + '&at=' + (d.at || 0));
  })());
});
