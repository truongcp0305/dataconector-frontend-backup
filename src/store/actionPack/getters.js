import { util } from '@/plugins/util.js';

const listActionByObjectType = (state) => {
    let allActionByObjectType = state.allActionByObjectType;
    let rsl = {};
    for (let key in allActionByObjectType) {
        rsl[key] = {};
        let idx = 1;
        for (let item of allActionByObjectType[key].action) {
            rsl[key][item] = {
                name: item,
                title: util.str.getCamelSpaceFromPascalText(item),
                index: idx,
            };
            idx += 1;
        }
    }
    return rsl;
};

export { listActionByObjectType };
