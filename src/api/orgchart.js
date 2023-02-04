import Api from './api';
import { appConfigs } from './../configs.js';

let orgchart = new Api(appConfigs.apiDomain.orgchart);
let coreApi = new Api(appConfigs.apiDomain.core);
let accessControlApi = new Api(appConfigs.apiDomain.permission);
let documentApi = new Api(appConfigs.apiDomain.documentService);
let sdocumentManagementApi = new Api(appConfigs.apiDomain.sdocumentManagement);
let trashApi = new Api(appConfigs.apiDomain.trash);
import Vue from 'vue';

export const orgchartApi = {
    getAllOrgChart() {
        return orgchart.get('orgchart');
    },
    getDetailOrgChart(id) {
        return coreApi.get('org-charts/' + id);
    },
    getAllNodes() {
        return coreApi.get('org-charts/nodes');
    },
    getOrgchartList(filter) {
        // filter = {
        // 	search: 'dsdsd',
        // 	pageSize:50,
        // filter: [
        // 	{
        // 		column: 'id',
        // 		valueFilter: {
        // 			operation: 'IN',
        // 			values: [1,5,5,3]
        // 		}
        // 	}
        // ]
        // };
        return orgchart.get('orgchart', filter);
    },

    getOrgchartDetail(id) {
        return orgchart.get('orgchart/' + id);
    },

    deleteOrgcharts(ids) {
        ids = ids.join(',');
        return orgchart.delete('orgchart/' + ids);
    },

    updateOrgchart(id, data) {
        return orgchart.put('orgchart/' + id, data);
    },

    createOrgchart(data) {
        return orgchart.post('orgchart', data);
    },

    createNodeStyle(data) {
        return orgchart.post('node-style', data);
    },
    getListNodeStyle() {
        return orgchart.get('node-style');
    },
    deleteNodeStyle(ids) {
        return orgchart.delete('node-style/' + ids);
    },
    getRolesByUser(queryData) {
        let queryParam = {
            items: queryData,
        };
        return orgchart.post('orgchart-role/query/roles-by-users', queryParam);
    },
    getAllNodes() {
        return orgchart.get('orgchart/nodes');
    },
    queryOrgchart(data) {
        return orgchart.post('orgchart/query', data);
    },
    updatePermissionInRole(data) {
        return accessControlApi.post('roles/set-permissions', data);
    },
    getAllOrgchartStruct() {
        return orgchart.get('orgchart/struct-only');
    },
    getUserIdentifiFromProcessModeler(data) {
        return orgchart.post(
            'role/query-users',
            data,
            {},
            { dataType: 'text' },
        );
    },
    getDocumentByUserId(data) {
        return documentApi.post('documents/map-query', data);
    },
    getDescriptionNode(data) {
        return documentApi.post('documents/map-query', data);
    },
    getIdOrgchartDefault() {
        return orgchart.get('get-orgchart-default');
    },
    getDocInstance(params) {
        return sdocumentManagementApi.get(
            'documents/' +
            params.id +
            '/objects?search=&page=1&pageSize=50&distinct=false&formulaCondition=' +
            params.script,
        );
    },
    getListTrash() {
        return trashApi.get('items', { type: 'orgchart' });
    },
    deleteTrashItem(id) {
        return trashApi.delete('items/object/orgchart:' + id);
    },
    restore(id) {
        return orgchart.put('restore/' + id);
    },
    getSubDepartMent() {
        return orgchart.get('my-sub-deparments/user');
    },
};
