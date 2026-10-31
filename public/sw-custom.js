// Service worker for Islam: the Angular service worker plus prayer notification buttons (Snooze / Dismiss).
importScripts('./ngsw-worker.js');

// ---- Scheduled alerts -------------------------------------------------------------------------------------------
// The page sends the coming alerts here. Whenever the worker gets a chance to run (periodic background sync, a push,
// the app being opened or resumed) it shows every alert that is due, so alerts are not lost while the page is frozen
// by Android or closed.
const DB = 'islam-sw';
const STORE = 'kv';
const LATE_MS = 45 * 60000;               // an alert may still be shown this long after its time

const openDb = () => new Promise((resolve, reject) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE);
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});
const kvGet = async key => {
  const db = await openDb();
  return new Promise((resolve, reject) => { const q = db.transaction(STORE).objectStore(STORE).get(key); q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); });
};
const kvSet = async (key, value) => {
  const db = await openDb();
  return new Promise((resolve, reject) => { const t = db.transaction(STORE, 'readwrite'); t.objectStore(STORE).put(value, key); t.oncomplete = () => resolve(); t.onerror = () => reject(t.error); });
};

async function showDue() {
  if (self.Notification && Notification.permission !== 'granted') return;
  const alerts = (await kvGet('schedule')) || [];
  const fired = new Set((await kvGet('fired')) || []);
  const now = Date.now();
  let changed = false;
  for (const a of alerts) {
    if (now < a.at || now - a.at > (a.late || LATE_MS) || fired.has(a.id)) continue;
    fired.add(a.id); changed = true;
    const shown = await self.registration.getNotifications({ tag: a.tag });
    if (shown.length) continue;           // the page already showed it
    await self.registration.showNotification(a.title, {
      body: a.body, tag: a.tag, icon: '/icons/icon-192x192.png', badge: '/icons/icon-96x96.png', renotify: true,
      requireInteraction: !!a.alarm, vibrate: a.alarm ? [400, 150, 400, 150, 400] : [200, 100, 200], data: a.data,
      ...(a.alarm ? { actions: [{ action: 'snooze', title: 'Snooze' }, { action: 'dismiss', title: 'Dismiss' }] } : {}),
    });
  }
  if (changed) await kvSet('fired', [...fired].slice(-200));
}

self.addEventListener('message', event => {
  const m = event.data || {};
  if (m.type === 'schedule') {
    event.waitUntil((async () => {
      await kvSet('schedule', m.alerts || []);
      const fired = new Set([...((await kvGet('fired')) || []), ...(m.fired || [])]);
      await kvSet('fired', [...fired].slice(-200));
      await showDue();
    })());
  } else if (m.type === 'fired') {
    event.waitUntil((async () => { const f = (await kvGet('fired')) || []; f.push(m.id); await kvSet('fired', f.slice(-200)); })());
  }
});
self.addEventListener('periodicsync', event => { if (event.tag === 'islam-alerts') event.waitUntil(showDue()); });
self.addEventListener('activate', event => event.waitUntil(showDue().catch(() => {})));
self.addEventListener('push', event => event.waitUntil(showDue().catch(() => {})));

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
