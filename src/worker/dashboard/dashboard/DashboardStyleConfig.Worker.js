import { dashboardApi } from '@/api/dashboard.js';

onmessage = function (event) {
    let data = event.data;
    let action = data.action;
    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};

var handler = {
    searchStyleConfig(data) {
        let styleConfig = data.styleConfig;
        let vl = data.vl.toLowerCase();
        if (vl == '') {
            // trường hợp này sẽ lặp qua vòng lặp và gán show = true
            for (let key in styleConfig) {
                styleConfig[key].show = true;
                if (
                    styleConfig[key].children &&
                    Object.keys(styleConfig[key].children).length > 0
                ) {
                    let childrens = styleConfig[key].children;
                    for (let key2 in childrens) {
                        childrens[key2].hidden = false;
                    }
                }
            }
        } else {
            for (let key in styleConfig) {
                styleConfig[key].show = false; // ban đầu set show = false, check nếu column chưa text thì set lại bằng true
                if (
                    styleConfig[key].children &&
                    Object.keys(styleConfig[key].children).length > 0
                ) {
                    let childrens = styleConfig[key].children;
                    for (let key2 in childrens) {
                        childrens[key2].hidden = true;
                        let title = childrens[key2].title.toLowerCase();
                        let name = childrens[key2].name.toLowerCase();
                        if (title.includes(vl) || name.includes(vl)) {
                            childrens[key2].hidden = false;
                            styleConfig[key].show = true;
                        }
                    }
                }
            }
        }

        self.postMessage({
            action: 'searchStyleConfigAfter',
            data: { styleConfig: styleConfig },
        });
    },
};
