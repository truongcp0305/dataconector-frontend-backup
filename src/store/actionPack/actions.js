import { permissionApi } from '../../api/permissionPack';
import { accessControlApi } from '@/api/accessControl';
import { kanbanApi } from '@/api/kanban.js';
import { SYMPER_APP } from '@/main';

const ignoreObjects = [
    'workflow_instance',
    'application_definition',
    'report_folder',
    'report',
    'syql',
    'job',
    'operation',
    'knowledge',
    'file',
    'dataflow',
    'timesheet'
    // "document_control",
    // 'document_table',
    // "dashboard_tab",
    // "department"
];
const getAllActionByObjectType = async (context) => {
    if (context.state.flagToGetAllActionByObjectType) {
        context.state.flagToGetAllActionByObjectType = false;
        let res = await permissionApi.getAllActionByObjectType();
        let listObjectType = {};
        Object.keys(res.data).map((data) => {
            if (!ignoreObjects.includes(data)) {
                listObjectType[data] = res.data[data].action;
            }
        });
        context.commit('setAllResource', listObjectType);
    }
};

const getAllApp = async (context) => {
    let res = await accessControlApi.getAllApp();
    if (res.status == 200) {
        context.commit('setAllApp', res.data.listObject);
    } else {
        SYMPER_APP.$snotify({
            type: 'error',
            title: SYMPER_APP.$t('common.notification.can_not_get_data'),
        });
    }
};
const getAllKanban = async (context) => {
    let data = []
    let res = await kanbanApi.getKanbans();
    if (res.status == 200) {
        res.data.listObject.forEach((e) => {
            data.push({ id: e.id, name: e.name, isSelected: false })
        })
        context.commit('setAllKanban', data);
    }
};
const getListFilters = async (context) => {
    let res = await accessControlApi.getListFilter();
    let listFilter = []
    if (res.status == 200) {
        listFilter = res.data.listObject;
        for (let filter of listFilter) {
            filter.columnName = filter.name
            filter.title = filter.name;
            filter.as = filter.name;
            filter.agg = 'not_  agg';
        }
        context.commit('setListFilters', listFilter);
    } else {
        SYMPER_APP.$snotify({
            type: 'error',
            title: SYMPER_APP.$t('v2.acessControl.canNotGetFilter'),
        });
    }
}
export { getAllActionByObjectType, getAllApp, getAllKanban, getListFilters };
