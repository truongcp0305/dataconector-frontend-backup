import Api from './api';
import { appConfigs } from './../configs.js';
import { util } from '../plugins/util';

let api = new Api(appConfigs.apiDomain.biService);

export const dashboardApi = {
    getAllDashboard(filter = {}) {
        return api.get('/report-and-dashboard/root/falses', filter);
    },
    // searchDashboard(filter) {
    // 	return api.get("/root/falses", filter);
    // },
    // getDashboards(filter) {
    // 	return api.get('dashboards', filter)
    // }
    getDashboards(filter) {
        return api.get(appConfigs.apiDomain.dashboard, filter);
    },
    getDetailDashboard(filter) {
        return api.get(appConfigs.apiDomain.biService + 'dashboards-detail', filter);
    },
    getDashboardsApp(filter) {
        return api.get(appConfigs.apiDomain.biService + 'dashboards', filter);
    },
    getDashboardInfo(id, experimentalMode) {
        return api.get(
            appConfigs.apiDomain.biService +
            'dashboards/' +
            id +
            (experimentalMode
                ? `?experimentalMode=${experimentalMode}`
                : ''),
        );
    },
    getData(options) {
        options =
            typeof options == 'string' ? options : JSON.stringify(options);
        return api.post(
            `${appConfigs.apiDomain.biService}report-get-data`,
            options,
            {},
            { contentType: 'application/json' },
        );
    },
    getDataBatch(options) {
        options =
            typeof options == 'string' ? options : JSON.stringify(options);
        return api.post(
            `${appConfigs.apiDomain.biService}report-get-data-batch`,
            options,
            {},
            { contentType: 'application/json' },
        );
    },
    createDashboard(data) {
        return api.post('dashboards', JSON.stringify(data));
    },
    updateDashboard(id, data) {
        return api.put('dashboards/' + id, JSON.stringify(data), {
            'Content-Type': 'application/json',
        });
    },
    restore(id) {
        return api.put('dashboards/' + id + '/restore', {
            'Content-Type': 'application/json',
        });
    },
    getExportExcel(data) {
        return api.post('dashboards/export-data', JSON.stringify(data), {
            'Content-Type': 'application/json',
        });
    },
    refreshDatasetByName(data, tenantId) {
        return api.post('datasets/refresh-by-names?tenant_id=' + tenantId, JSON.stringify(data), {
            'Content-Type': 'application/json',
        });
    },
};
