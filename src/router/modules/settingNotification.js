export default [
    {
        path: '/setting-notification',
        name: 'Setting Notification',
        component: () => import('../../views/settingNotification/index.vue'),
    },
    {
        path: '/setting-notification-Ba',
        name: 'Setting Notification Ba',
        component: () =>
            import('../../views/settingNotification/BaConfigShowList.vue'),
    },
    {
        path: '/open-push-notification',
        name: 'Open background message',
        component: () =>
            import('../../views/OpenNoti.vue'),
    },
];
