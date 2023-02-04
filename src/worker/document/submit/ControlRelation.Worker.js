import {
    getAllPropFromData,
    getMapControlEffected,
    setRootControlRunFormulaManually
} from '@/components/document/dataControl';
onmessage = function (event) {
    var workerDataReceive = event.data;
    let action = workerDataReceive.action;
    let dataForEachAction = workerDataReceive.data;
    switch (action) {
        case 'setDataForPropsControl':
            let dataControl = getAllPropFromData(
                dataForEachAction.fields,
                dataForEachAction.viewType,
                dataForEachAction.allDataDetail,
            );
            postMessage({
                action: 'setDataForPropsControl',
                dataAfter: dataControl,
            });
            break;
        case 'getMapControlEffected':
            dataForEachAction.allControlObj = JSON.parse(
                dataForEachAction.allControlObj,
            );
            dataForEachAction.isBa = JSON.parse(dataForEachAction.isBa);
            let dataControlEffected = getMapControlEffected(
                dataForEachAction.allControlObj,
                dataForEachAction.isBa,
            );
            postMessage({
                action: 'getMapControlEffected',
                dataAfter: dataControlEffected,
            });
            break;
        case 'setRootControlRunFormulaManually':
            let data = setRootControlRunFormulaManually(
                dataForEachAction.impactedFieldsList,
                dataForEachAction.listControlRunFormulaManually,
            );
            postMessage({
                action: 'afterGetRootControlRunFormulaManually',
                dataAfter: data,
            });
            break;
        default:
            break;
    }
};
