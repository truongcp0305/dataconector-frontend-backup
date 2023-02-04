importScripts('https://www.gstatic.com/firebasejs/7.24.0/firebase-app.js');
importScripts(
    'https://www.gstatic.com/firebasejs/7.24.0/firebase-messaging.js',
);
firebase.initializeApp({
    apiKey: 'AIzaSyBW8O6OeIUpaNbEYwyihGF7QsuVrwtOM4w',
    authDomain: 'symper-54ee6.firebaseapp.com',
    databaseURL: 'https://symper-54ee6.firebaseio.com',
    projectId: 'symper-54ee6',
    storageBucket: 'symper-54ee6.appspot.com',
    messagingSenderId: '801948571579',
    appId: '1:801948571579:web:d01c00ea89bb60df08d69e',
    measurementId: 'G-7WZC29YT0G',
});
//payload có thuộc tính notification -> fcm sẽ tự động hiện popup thông báo + hàm onBackgroundMessage của FE => bị double popup thông báo
// giải pháp: cần custome data, bỏ trường notification, đem data của notification vào trường data
class CustomPushEvent extends Event {
    constructor(data) {
        super('push');

        Object.assign(this, data);
        this.custom = true;
    }
}

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 */
self.addEventListener('push', (e) => {
    // Skip if event is our own custom event
    if (e.custom) return;

    // Kep old event data to override
    const oldData = e.data;

    // Create a new event to dispatch, pull values from notification key and put it in data key,
    // and then remove notification key
    const newEvent = new CustomPushEvent({
        data: {
            ehheh: oldData.json(),
            json() {
                const newData = oldData.json();
                newData.data = {
                    ...newData.data,
                    ...newData.notification,
                };
                delete newData.notification;
                return newData;
            },
        },
        waitUntil: e.waitUntil.bind(e),
    });

    // Stop event propagation
    e.stopImmediatePropagation();

    // Dispatch the new wrapped event
    dispatchEvent(newEvent);
});

self.addEventListener('notificationclick', (event) => {
    if (event.notification.data && event.notification.data.action) {
        self.clients.openWindow(event.currentTarget.origin + '/#/open-push-notification?action=' + event.notification.data.action);
    } else {
        self.clients.openWindow(event.currentTarget.origin);
    }
    event.notification.close();
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.data.title ? payload.data.title : 'Notification';
    const notificationOptions = {
        body: payload.data.body,
        icon: 'img/symperLogo.png',
        data: payload.data
    };
    const channel = new BroadcastChannel('updateCountUnreadNotification');
    channel.postMessage(payload);
    self.registration.showNotification(notificationTitle, notificationOptions);
});


