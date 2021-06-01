/* eslint-disable no-restricted-globals */
function receivePushNotification(event) {
  console.log('[Service Worker] Push Received.');

  const { image, tag, url, title, text } = event.data.json();

  const options = {
    data: url,
    body: text,
    icon: image,
    vibrate: [200, 100, 200],
    tag,
    image,
    badge: 'https://notirobot-assets.s3.amazonaws.com/icon-48x48.png',
    actions: [
      {
        action: 'Detail',
        title: 'View',
        icon: 'https://notirobot-assets.s3.amazonaws.com/icon-48x48.png'
      }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
}

function openPushNotification(event) {
  console.log(
    '[Service Worker] Notification click Received.',
    event.notification.data
  );

  event.notification.close();
  // eslint-disable-next-line no-undef
  console.log('Notification click Received.', event.notification.data);
  clients.openWindow(event.notification.data);
}

self.addEventListener('push', receivePushNotification);
self.addEventListener('notificationclick', openPushNotification);
