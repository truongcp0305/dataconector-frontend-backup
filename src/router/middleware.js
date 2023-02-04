import { util } from './../plugins/util.js';
window.backToFirstTab = true;
var activePageInstanceKey = null;

window.onpopstate = function (event) {
    if (window.SYMPER_APP) {
        let pinTabs = window.SYMPER_APP.$store.state.app.pinTabs;
        let activeTab = pinTabs.tabs.filter((item) => {
            return item.browserPageKeys[event.state.key + ''];
        });
        if (activeTab.length > 0) {
            activeTab = activeTab[0];
            pinTabs.currentTabId = activeTab.id;
            // activePageInstanceKey = activeTab.stack[0].params.pageInstanceKey
            activePageInstanceKey =
                activeTab.browserPageKeys[event.state.key + ''];
            window.backToFirstTab = false;
        }
    }
};

// window.needAddStateStack = true;
// var firstLoad = true;
// var canNotBack = false
// var changeUrlAction = null
// var noNeedCheckPopstate = false;

// window.onpopstate = function(event) {
//     window.needAddStateStack = false;
//     if(noNeedCheckPopstate){
//         noNeedCheckPopstate = false;
//         return;
//     }
//     if(window.SYMPER_APP){
//         let currentState = event.state;
//         let bh = SYMPER_APP.$store.state.app.pinTabs.browserHistory;

//         // Nếu đang ở đầu stack thì ko làm gì cả
//         if(bh.currentIndex == 0){
//             canNotBack = true;
//             return;
//         }

//         if(bh.currentIndex == bh.stateStack.length - 1){
//             changeUrlAction = 'back';
//             console.log(changeUrlAction, 'User click back or forward')
//             bh.currentIndex -= 1;
//             return;
//         }

//         if(bh.stateStack[bh.currentIndex + 1].key == currentState.key){
//             changeUrlAction = 'forward';
//             bh.currentIndex += 1;
//         }else{
//             changeUrlAction = 'back';
//             bh.currentIndex -= 1;
//         }
//         console.log(changeUrlAction, 'User click back or forward')
//     }
// };

// function addRouteToStack(to) {
//     if(!to.params.pageInstanceKey){
//         to.params.pageInstanceKey = Date.now();
//     }
//     let pinTabs = window.SYMPER_APP.$store.state.app.pinTabs;
//     let currentTab = pinTabs.mapTab[pinTabs.currentTabId];
//     if(to.name != 'symperHiddenRedirectComponent'){
//         currentTab.stack.push(to);
//         currentTab.currentIndex = currentTab.stack.length - 1
//     }
// }

// function addToAppStack(to) {
//     if(window.needAddStateStack){
//         setTimeout(() => {
//             // xử lý back, forward page của trình duyệt
//             let pinTabs = window.SYMPER_APP.$store.state.app.pinTabs;
//             if(firstLoad){
//                 addRouteToStack(to)
//                 firstLoad = false;
//             }
//             if(history.state){
//                 pinTabs.browserHistory.stateStack.push(history.state);
//                 pinTabs.browserHistory.currentIndex = pinTabs.browserHistory.stateStack.length - 1;
//             }
//         }, 1000);

//         if(window.SYMPER_APP){
//             addRouteToStack(to)
//         }
//     } else{
//         window.needAddStateStack = true;
//     }
// }

// function overrideBrowserChangePage(to, from, next){
//     if(changeUrlAction){
//         let pinTabs = window.SYMPER_APP.$store.state.app.pinTabs;
//         let currentTab = pinTabs.mapTab[pinTabs.currentTabId];
//         let canRedirect = false;
//         if(changeUrlAction == 'back'){
//             if(currentTab.currentIndex > 0){
//                 currentTab.currentIndex -= 1;
//                 canRedirect = true;
//             }
//         }else{
//             if(currentTab.currentIndex < currentTab.stack.length - 1){
//                 currentTab.currentIndex += 1;
//                 canRedirect = true;
//             }
//         }
//         changeUrlAction = null;
//         let currentPage = currentTab.stack[currentTab.currentIndex];
//         if(canRedirect){
//             next({
//                 // name: currentPage.name,
//                 path: currentPage.path,
//                 params: currentPage.params
//             });
//         }else{
//             setTimeout(() => {
//                 noNeedCheckPopstate = true;
//                 // history.replaceState(history.state, document.title, currentPage.path)
//             }, 1000);
//         }

//     }else{
//         next();
//     }
//     addToAppStack(to)
// }

export const routeMiddleware = {
    /**
     * Các hàm middleware dùng cho tất cả các route
     * Có thể viết thêm tiếp các middleware ở đây, với key là tên hàm, value là hàm xử lý middleware đó
     */
    common: {
        /**
         * Kiểm tra xem đã đăng nhập hay chưa, nếu chưa dẫn đến trang đăng nhập
         * @param {Object} to Object chứa thông tin của route cần đi tới
         * @param {Object} from  Object chứa thông tin của route khởi nguồn
         * @param {Function} next Hàm đi tới route tiếp theo
         */
        checkLogin(to, from, next) {
            const noNeedLoginPages = {
                login: true,
                pageNotFound: true,
                forgotPass: true,
                resetPass: true,
                appWaitingRoom: true,
                authenCode: true,
            };
            if (
                noNeedLoginPages.hasOwnProperty(to.name) ||
                util.auth.checkLogin()
            ) {
                if (noNeedLoginPages.hasOwnProperty(to.name)) {
                    next();
                    return;
                } else if (!window.passWaitingRoom) {
                    (window.goToRouteAfterWaiting = {
                        path: to.path,
                        name: to.name,
                        query: to.query,
                        fullPath: to.fullPath
                    }),
                        next({
                            name: 'appWaitingRoom',
                        });
                    return;
                }

                if (!to.params.pageInstanceKey) {
                    if (!activePageInstanceKey) {
                        to.params.pageInstanceKey = Date.now();
                    } else {
                        to.params.pageInstanceKey = activePageInstanceKey;
                        activePageInstanceKey = null;
                    }
                }

                if (
                    window.SYMPER_APP &&
                    to.name != 'symperHiddenRedirectComponent'
                ) {
                    let pinTabs = window.SYMPER_APP.$store.state.app.pinTabs;
                    // let currentTab = pinTabs.mapTab[pinTabs.currentTabId];
                    if (window.backToFirstTab) {
                        pinTabs.currentTabId = pinTabs.tabs[0].id;
                    } else {
                        window.backToFirstTab = true;
                    }

                    if (pinTabs.tabs[0].id == pinTabs.currentTabId) {
                        pinTabs.tabs[0].stack[0] = to;
                    }
                }
                next();
                // overrideBrowserChangePage(to, from, next)
            } else {
                next({ name: 'login' });
            }
        },
    },
};
