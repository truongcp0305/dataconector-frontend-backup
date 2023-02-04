import { util } from './plugins/util';

var configs = {
    defaultAvatar: '/img/avatar_default.jpg',
    dataTypeIcon: {
        // icon cho các kiểu dữ liệu: numeric, text, date, datetime, time,
        numeric: 'mdi-numeric',
        text: 'mdi-alphabetical-variant',
        date: 'mdi-calendar-month-outline',
        datetime: 'mdi-calendar-clock',
        time: 'mdi-timer-outline',
        all: 'mdi-table-row'
    },
    maxOpenTab: 15,
    apiDomain: {
        objectAccessManager: `https://bi-service.${SYMPER_ENV.tenant_domain}/`,
        account: `https://account.${SYMPER_ENV.tenant_domain}/`,
        user: `https://account.${SYMPER_ENV.tenant_domain}/`,
        core: `https://v2hoangnd.dev.${SYMPER_ENV.tenant_domain}/`,
        bpmne: {
            models: `https://workflow-modeler.${SYMPER_ENV.tenant_domain}/workflow-modeler/`,
            general: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/`,
            postTasksHistory: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/query/historic-task-instances`,
            deployments: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/repository/deployments`,
            definitions: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/repository/process-definitions`,
            instances: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/runtime/process-instances`,
            historyInstances: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/query/historic-process-instances`,
            listHistoryInstances: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/history/historic-process-instances`,
            historyInstancesDel: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/history/historic-process-instances`,
            history: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/history`,
            tasks: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/runtime/tasks`,
            task: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/query/tasks`,
            tasksHistory: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/history/historic-task-instances`,
            validateModel: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/flowable-ui/modeler-app/rest/model/validate`,
            timerJob: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/bpmn-engine/symper-rest/service/management/timer-jobs`
        },
        documents: `https://v2hoangnd.dev.${SYMPER_ENV.tenant_domain}/document`,
        nofitication: `https://notifi.${SYMPER_ENV.tenant_domain}/`,
        formulasService: `https://syql.${SYMPER_ENV.tenant_domain}/`,
        trashService: `https://trash.${SYMPER_ENV.tenant_domain}/`,
        documentService: `https://sdocument.${SYMPER_ENV.tenant_domain}/`,
        sdocumentManagement: `https://sdocument-management.${SYMPER_ENV.tenant_domain}/`,
        orgchart: `https://orgchart.${SYMPER_ENV.tenant_domain}/`,
        systemRole: `https://orgchart.${SYMPER_ENV.tenant_domain}/`,
        userRole: `https://orgchart.${SYMPER_ENV.tenant_domain}/`,
        permission: `https://accesscontrol.${SYMPER_ENV.tenant_domain}/`,
        dashboard: `https://bi-service.${SYMPER_ENV.tenant_domain}/report-and-dashboard/`,
        search: `https://search.${SYMPER_ENV.tenant_domain}/`,
        biService: `https://bi-service.${SYMPER_ENV.tenant_domain}/`,
        permissionPacks: `https://accesscontrol.${SYMPER_ENV.tenant_domain}/permission_packs`,
        actionPacks: `https://accesscontrol.${SYMPER_ENV.tenant_domain}/action_packs`,
        operations: `https://accesscontrol.${SYMPER_ENV.tenant_domain}/operations`,
        baAccount: `https://account.${SYMPER_ENV.tenant_domain}/supporters`,
        appManagement: `https://apps-management.${SYMPER_ENV.tenant_domain}/`,
        commnent: `https://comment-service.${SYMPER_ENV.tenant_domain}`,
        fileManagement: `https://file-service.${SYMPER_ENV.tenant_domain}/`,
        knowledge: `https://kh-service.${SYMPER_ENV.tenant_domain}/`,
        search: `https://search.${SYMPER_ENV.tenant_domain}/`,
        importExcel: `https://io.${SYMPER_ENV.tenant_domain}/`,
        viewHistoryImport: `https://io.${SYMPER_ENV.tenant_domain}/history/document`,
        uiConfig: `https://ui.${SYMPER_ENV.tenant_domain}`,
        workflowExtend: `https://workflow-extend.${SYMPER_ENV.tenant_domain}/`,
        trash: `https://trash.${SYMPER_ENV.tenant_domain}/`,
        log: `https://log.${SYMPER_ENV.tenant_domain}/`,
        syqlFunction: `https://syql.${SYMPER_ENV.tenant_domain}/`,
        exportExcel: `https://data-io.${SYMPER_ENV.tenant_domain}/`,
        download: `https://data-io.${SYMPER_ENV.tenant_domain}/download`,
        kanban: `https://kanban-service.${SYMPER_ENV.tenant_domain}/`,
        comment: `https://comment-service.${SYMPER_ENV.tenant_domain}/`,
        scheduler: `https://scheduler.${SYMPER_ENV.tenant_domain}/`,
        smartObject: `https://smartobject.${SYMPER_ENV.tenant_domain}/`,
        tenantManagement: `https://dev-tenant-service.${SYMPER_ENV.tenant_domain}/`
    },
    // nơi chứa domain của các api mà ko bị phụ thuộc vào môi trường
    uniqueApiDomain: {
        environmentManagement: `https://system-management.${SYMPER_ENV.tenant_domain}/`,
        dataConnector: `https://data-connector.${SYMPER_ENV.tenant_domain}/`,
        msi: 'https://dev-bi.symper.vn/',
        location: 'https://nominatim.openstreetmap.org/'
    },
    notificationTimeout: {
        success: 1000,
        warning: 1000,
        info: 1000,
        error: 1000
    },
    firebaseConfig: {
        apiKey: 'AIzaSyBtD4P_r_hk3rxsjvF_c6RD9N_HoNZRTNU',
        authDomain: 'symper-5eaa6.firebaseapp.com',
        projectId: 'symper-5eaa6',
        storageBucket: 'symper-5eaa6.appspot.com',
        messagingSenderId: '556226305500',
        appId: '1:556226305500:web:2f903c42744f27b60e4319',
        measurementId: 'G-902E1VL1RC',
        publicVapidKey:
            'BM0LBL-88_8TRzdoi0wG-Bi5EIXJXXhFDsDybggwpJO92yiXyZ4OZPB4KRu1kArGevAJRgKdfRQQDEbcSdAENvU'
    },
    actionDefinition: {
        icons: {
            create: ''
        },
        commonProps: {
            document_definition: {
                module: 'document',
                resource: 'document_definition',
                scope: 'document'
            }
        }
    },
    reformatUrl(obj) {
        for (let key in obj) {
            if (obj[key]) {
                if (typeof obj[key] == 'string') {
                    obj[key] = util.addEnvToUrl(obj[key]);
                } else if (typeof obj[key] == 'object') {
                    this.reformatUrl(obj[key]);
                }
            }
        }
    },
    remoteModules: {
        aggrid: 'remote_aggrid@https://dev-apps.symper.vn/remote-libs/aggrid/remote_aggrid.js'
    }
};
// sửa lại url theo môi trường code
configs.reformatUrl(configs.apiDomain);

// Thêm các domain thuộc uniqueApiDomain vào khai báo domain của api
for (let key in configs.uniqueApiDomain) {
    configs.apiDomain[key] = configs.uniqueApiDomain[key];
}

export const appConfigs = configs;
