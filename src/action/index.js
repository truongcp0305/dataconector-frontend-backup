import listActionMap from './actionDefinition';

export const getKeyForAction = function (ac) {
    if (ac) {
        return ac.module + '_' + ac.resource + '_' + ac.scope + '_' + ac.action;
    } else {
        return '';
    }
};

let actionMap = {};
for (let acKey in listActionMap) {
    let actions = listActionMap[acKey];
    for (let ac of actions) {
        let key = getKeyForAction(ac);
        if (!actionMap[key]) {
            actionMap[key] = ac;
        } else {
            console.error(
                '[Symper action register failed]:  Action key has already register with key : ' +
                    key,
                acKey,
                actions,
            );
        }
    }
}
export default actionMap;
