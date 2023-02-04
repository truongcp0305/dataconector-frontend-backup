import Vue from 'vue';
window.Vue = Vue;
import { registerPromiseWorker } from '@/worker/PromiseWorker.js';
registerPromiseWorker();
import 'regenerator-runtime/runtime';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/main.css';
import vuetify from './plugins/vuetify';
import i18n from './lang/i18n';
import { util } from './plugins/util.js';
import BaView from './views/layout/BAView';
import EndUserView from './views/layout/EndUserView';
import ContentOnlyView from './views/layout/ContentOnlyView';
import Preloader from '@/components/common/Preloader';
import Notifications from 'vue-notification';
require('moment/locale/vi');
const moment = require('moment');
import { appConfigs } from './configs';
import actionMap from './action/index';
import uploader from 'vue-simple-uploader';
import VueRx from 'vue-rx';
import iconMap from './icon';
import VueHtml2Canvas from 'vue-html2canvas';
util.auth.checkLoginAndSetToIndexedDB();
import VueLazyLoad from 'vue-lazyload';
import * as Sentry from "@sentry/vue";
import * as SentryBrowser from "@sentry/browser";
import { Integrations } from '@sentry/tracing';
Vue.use(VueHtml2Canvas);
Vue.use(VueLazyLoad);
Vue.use(require('vue-moment'), {
    moment,
});
Vue.component('ba-view', BaView);
Vue.component('end-user-view', EndUserView);
Vue.component('content-only-view', ContentOnlyView);
Vue.use(VueRx);
Vue.use(uploader);

Vue.component('preloader', Preloader);
Vue.mixin({
    methods: {
        $bindAction(actionDef, param = {}) {
            let isValidAction = true;
            if (actionDef && typeof actionDef == 'object') {
                let sampleAction = {
                    module: 'orgchart',
                    resource: 'orgchart',
                    scope: 'orgchart',
                    action: 'list',
                };
                for (let key in sampleAction) {
                    if (!actionDef.hasOwnProperty(key)) {
                        isValidAction = false;
                        console.warn(
                            '[SYMPER-BIND-ACTION-FAILED]  action definition is not valid, action definition must be a object with 4 keys: module, resource, scope, action, but receive',
                            actionDef,
                        );
                        break;
                    }
                }
            } else {
                isValidAction = false;
                if (actionDef) {
                    console.warn(
                        '[SYMPER-BIND-ACTION-FAILED]  action definition is not valid, first param expected Object, but receive: ',
                        actionDef,
                    );
                }
            }

            if (isValidAction) {
                return JSON.stringify({
                    action: actionDef,
                    params: param ? param : {},
                });
            } else {
                return JSON.stringify({
                    action: {},
                    params: {},
                });
            }
        },
        $copyTextToClipboard: util.copyTextToClipboard,
        $i(pathToIcon) {
            if (pathToIcon) {
                try {
                    let i = iconMap;
                    return eval('i.' + pathToIcon);
                } catch (error) {
                    return pathToIcon;
                }
            } else {
                return '';
            }
        },

        /**
         * Hàm lấy ra tên của view component hiện tại theo rule của Symper:
         * Check trong meta của $route trước, nếu có tham số sRouteName thì lấy giá trị của nó
         * Nếu không thì lấy giá trị của $route.name
         */
        $getRouteName() {
            return this.$route.meta.sRouteName ?
                this.$route.meta.sRouteName :
                this.$route.name;
        },
    },
});

Vue.use(Notifications);
// Vue.use(VueMoment);
let curLocale = util.getSavedLocale();
/**
 * $evtBus : component chuyên chở các sự kiện giữa tất cả các component
 */
Vue.prototype.$evtBus = new Vue({});
Vue.prototype.$evtBus.$on(
    'symper-app-call-action-handler',
    (action, context, extraParams) => {
        if (typeof action == 'string') {
            try {
                action = JSON.parse(action);
                if (!action) {
                    action = {};
                }
            } catch (error) {
                action = {};
            }
        }
        if (!action.parameter) {
            action.parameter = {};
        }
        action.parameter = Object.assign(action.parameter, extraParams);
        let key =
            action.module +
            '_' +
            action.resource +
            '_' +
            action.scope +
            '_' +
            action.action;
        if (actionMap[key]) {
            context.$getActionLink = actionMap[key].$getActionLink;
            actionMap[key].handler.apply(context, [action.parameter]);
        } else {
            console.error(
                '[Symper action find failed]: can not find action with key :' +
                key,
                action,
            );
        }
    },
);

function checkCanAddTab(context) {
    let rsl = true;
    let urlMap = context.$store.state.app.urlToTabTitleMap;
    if (Object.keys(urlMap).length == appConfigs.maxOpenTab) {
        rsl = false;
        context.$snotifyWarning({},
            context.$t('appTabs.overMaxOpen.title'),
            context.$t('appTabs.overMaxOpen.detail'),
        );
    }
    return rsl;
}

function checkUrlNotExisted(url, context) {
    let urlMap = context.$store.state.app.urlToTabTitleMap;
    urlMap = Object.values(urlMap);
    for (let idx in urlMap) {
        if (urlMap[idx].url == url) {
            context.$evtBus.$emit('auto-active-tab', Number(idx));
            return false;
        }
    }
    return true;
}
Vue.prototype.$setTabTitle = function (title) {
    this.symperComponentTabTtile = title;
    this.$emit('symper-app-set-tab-stitle', title);
};

/**
 * Di chuyển đến một trang và tạo ra tab tương ứng
 */
Vue.prototype.$goToPage = function (
    url,
    title,
    pageInstanceKey = false,
    allwaysOpenNewTab = true,
    extraData = {},
) {
    if (!url) {
        return;
    }
    let routeObj = this.$router.match(url);
    let routerQuery = Object.keys(routeObj.query).length > 0 ? routeObj.query : {}
    if (!pageInstanceKey) {
        pageInstanceKey = Date.now();
    }
    let params = Object.assign(routeObj.params, {
        pageInstanceKey: pageInstanceKey,
        extraData: extraData,
    });
    if (window.SYMPER_APP.shortCutAddTap) {
        this.$evtBus.$emit('symper-app-add-tab', {
            title,
            path: url,
            name: routeObj.name,
            params,
        });
        return;
    }
    let appState = this.$store.state.app;
    let currentTabIndex = appState.currentTabIndex;

    let urlMap = appState.urlToTabTitleMap;
    let urlInfo = {
        url: url,
        routeName: routeObj.name,
        title: title,
        pageInstanceKey: pageInstanceKey,
        routeParams: util.cloneDeep(params),
    };

    if (routeObj.name) {
        let urlArr = Object.values(urlMap);
        this.$evtBus.$emit('symper-app-before-switch-tab', {
            from: urlArr[currentTabIndex],
            to: urlInfo,
        });
        if (routeObj.name == this.$route.name) {
            this.$router.push({
                name: 'symperHiddenRedirectComponent',
                params: {
                    urlInfo: urlInfo,
                    pageInstanceKey: Date.now(),
                },
                query: routerQuery
            });
        } else {
            this.$router.push({
                name: routeObj.name,
                params: util.cloneDeep(params),
                query: routerQuery
            });
        }
        this.$evtBus.$emit('symper-app-after-switch-tab', {
            from: urlArr[currentTabIndex],
            to: urlInfo,
        });
    } else {
        this.$snotifyError('Url not found');
    }
};

/**
 * Custom notification
 */
Vue.prototype.$snotify = function (option, group = false) {
    group = group ? group : 'symper-general-notification';
    let position = option.position ? option.position : 'top right';
    let defaultOptions = {
        group: group,
        width: 400,
        classes: 'symper-general-notification',
        duration: option.duration ?
            option.duration :
            appConfigs.notificationTimeout[option.type],
        speed: 500,
        data: {
            type: option.type,
            title: option.title,
            text: option.text,
            actionBtns: option.actionBtns,
        },
    };
    option = Object.assign(defaultOptions, option);
    this.$store.state.app.generalNotificationPosition = position;
    this.$notify(option);
};

Vue.prototype.$snotifyError = function (
    err = {},
    title = 'ERROR',
    detail = '',
    duration = false,
) {
    console.warn(err);
    if (!detail && err.responseJSON && err.responseJSON.message) {
        detail = err.responseJSON.message;
    }

    if (!detail && err.message) {
        detail = err.message;
    }
    let setting = {
        type: 'error',
        title: title,
        text: detail,
    };

    if (duration) {
        setting.duration = duration;
    }
    this.$snotify(setting);
};
Vue.prototype.$snotifyInfo = function (
    title = 'INFORMATION',
    detail = '',
    duration = 3000,
) {
    this.$snotify({
        type: 'info',
        title: title,
        text: detail,
        duration: duration,
    });
};
Vue.prototype.$snotifyWarning = function (err, title = 'WARNING', detail = '') {
    console.warn(err);
    this.$snotify({
        type: 'warn',
        title: title,
        text: detail,
    });
};
Vue.prototype.$snotifySuccess = function (
    title = 'SUCCESS',
    detail = '',
    duration = false,
) {
    let setting = {
        type: 'success',
        title: title,
        text: detail,
    };

    if (duration) {
        setting.duration = duration;
    }
    this.$snotify(setting);
}

function createUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
Vue.prototype.session = createUUID();

Vue.config.productionTip = false;
global.jQuery = require('jquery');
var $ = global.jQuery;
window.$ = $;
util.serviceWorker.register();
require('@/assets/resource/toc/jquery.toc/jquery.toc.js');
if (!window.location.host.includes('localhost')) {
    window.SymperLoggingLib = SentryBrowser;
    Sentry.init({
        Vue,
        environment: SYMPER_ENV.environment,
        dsn: "https://43808a6083694aa0b069ffe11609bc64@o4504168028766208.ingest.sentry.io/4504168030076928",
        integrations: [
            new Integrations.BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                tracingOrigins: [/\.symper\.vn/],
                shouldCreateSpanForRequest: url => {
                    return !url.match(/-workflow\.symper\.vn/);
                },
            }),
        ],
        beforeBreadcrumb: (breadcrumb, hint) => {
            if (breadcrumb.category === 'xhr') {
                // Bỏ qua các api lấy user avatar
                if (/user_avatar_/i.test(hint.xhr.responseURL)) {
                    return null;
                } else {
                    return breadcrumb
                }
            } else {
                return breadcrumb
            }
        },
        tracesSampleRate: 1.0,
    });
}

export const SYMPER_APP = new Vue({
    router,
    store,
    i18n,
    vuetify,
    render: (h) => h(App),
}).$mount('#app');