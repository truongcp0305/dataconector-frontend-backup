import _isEmpty from 'lodash/isEmpty';
import { cloneDeep } from 'lodash';
export const setMenuOption = function (cellConfigs, prependIcons, name) {
    let groupBy = {
        title: SYMPER_APP.$t('v2.dashboard.groupBy'),
        type: 'simpleWithCheck',
        value: false,
        event: 'group-columns'
    };
    let lengthSelectedColumn =
        cellConfigs.rawConfigs.setting[name].selectedColums
            .length;
    let selectedColums =
        cellConfigs.rawConfigs.setting[name]
            .selectedColums;
    selectedColums.forEach((col, idx) => {
        if (idx != lengthSelectedColumn - 1) {
            if (!col.hasOwnProperty('menuOptions')) {
                col.menuOptions = {};
            }
            if (col.menuOptions.groupBy) {
                groupBy = cloneDeep(col.menuOptions.groupBy);
            }
            col.menuOptions.groupBy = cloneDeep(groupBy);
        } else {
            if (col.hasOwnProperty('menuOptions')) {
                Vue.delete(col.menuOptions, 'groupBy');
                if (_isEmpty(col.menuOptions)) {
                    Vue.delete(col, 'menuOptions');
                    col.prependIcon = '';
                } else {
                    let prependIconValue;
                    // check các options còn lại của menuOption, nếu có Option nào có prependIcon thì set, không thì set rỗng
                    // đối với trường hợp menuOption có nhiều option có prependIcon thì sẽ lấy option cuối cùng
                    Object.keys(col.menuOptions).filter(
                        (a, i) => {
                            if (
                                prependIcons.hasOwnProperty(
                                    a
                                )
                            ) {
                                prependIconValue = a;
                                return true;
                            }
                        }
                    );
                    if (prependIconValue) {
                        col.prependIcon =
                            prependIcons[prependIconValue];
                    } else {
                        col.prependIconValue = '';
                    }
                }
            }
        }
    });

}