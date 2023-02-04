export const serviceWorker = {
    register() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('app-sw.js?v=9')
                .then((reg) => {
                    console.log('Registered service worker');
                })
                .catch((err) => {
                    console.log('Register service worker failed', err);
                });
        }
    },
};
