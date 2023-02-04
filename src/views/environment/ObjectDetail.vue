<template>
    <div class="object-detail w-100">
        <ListItem
            ref="listObject"
            :showExportButton="false"
            :containerHeight="tableHeight"
            :dialogMode="true"
            :getDataUrl="getListUrl"
            @close-popup="handleCloseEvent"
            :showFilter="false"
            :customHeaderBtn="customHeaderBtn"
            @custom-get-all-data="customGetAllData"
            style="margin-left: 10px"
            @data-loaded="handleDataLoaded"
            :refreshListWhenChangeUrl="false"
            :useDefaultContext="false"
            :tableContextMenu="tableContextMenu"
            :customAPIResult="customAPIResult"
            :isTablereadOnly="false"
        />
        <DialogsConfirmSync
            :showDialog="showDialog"
            @cancel="showDialog = false"
            :listItemSelected="listItemSelected"
            :currentObjectType="currentObjectType"
            @success="handlerSuccess"
        />
        <DialogDataRelate
            :showDialog="showDialogRelateData"
            @cancel="showDialogRelateData = false"
            :currentItem="dependencies"
        />
    </div>
</template>

<script>
import { util } from '../../plugins/util';
import ListItem from '@/components/common/ListItems';
import DialogDataRelate from './dialogs/DialogDataRelate';
import DialogsConfirmSync from './dialogs/DialogsConfirmSync';
export default {
    components: {
        ListItem,
        DialogDataRelate,
        DialogsConfirmSync,
    },
    data() {
        let self = this;
        return {
            listItemSelected: [],
            page: 1,
            tableHeight: 500,
            getListUrl: '',
            showBtnAddCheckbox: true,
            showDialogRelateData: false,
            showList: false,
            dependencies: {},
            showDialog: false,
            tableContextMenu: {
                checkRelated: {
                    name: 'checkRelated',
                    text: this.$t('v2.environment.relatedData'),
                    callback: (row, callback) => {
                        self.handleCheckClick();
                        self.dependencies = row.dependencies;
                    },
                },
            },
            customAPIResult: {
                reformatData(res) {
                    return {
                        columns: res.data.columns ? res.data.columns : [],
                        listObject: res.data.listObject
                            ? res.data.listObject
                            : [],
                        total: res.data.total,
                    };
                },
            },
            customHeaderBtn: {
                sync: {
                    title: this.$t('v2.environment.sync'),
                    callback() {
                        self.handleSyncClick();
                    },
                },
                syncAll: {
                    title: this.$t('v2.environment.syncAll'),
                    callback() {
                        self.handleSyncAll();
                    },
                },
                close: {
                    icon: 'mdi-close',
                    callback() {
                        self.handleCloseEvent();
                    },
                },
            },
        };
    },
    methods: {
        calcContainerHeight() {
            this.tableHeight = util.getComponentSize(this).h;
        },
        handleCloseEvent() {
            this.$emit('close-popup');
        },
        customGetAllData(data) {
            this.$set(this, 'listItemSelected', data);
            this.showDialog = true;
        },
        handleDataLoaded() {
            this.addCheckBoxColumn();
        },
        addCheckBoxColumn() {
            this.$refs.listObject.addCheckBoxColumn();
        },
        handlerSuccess() {
            this.showDialog = false;
            this.$refs.listObject.refreshList();
        },
        handleSyncClick() {
            let rows = this.$refs.listObject.getSelectedRows();
            this.$set(this, 'listItemSelected', rows);
            this.showDialog = true;
        },
        handleSyncAll() {
            this.$refs.listObject.customGetData(this.page);
            this.$snotifySuccess(this.$t('v2.environment.retrievingData'));
        },
        handleCheckClick() {
            this.showDialogRelateData = true;
        },
        getUrl() {
            let currentService = this.$route.params.id.split('::')[0];
            let listObjectName = this.$route.params.id.split('::')[1];
            this.currentObjectType = listObjectName;
            let str =
                'https://' +
                SYMPER_ENV.environment +
                '-' +
                currentService +
                `.${SYMPER_ENV.tenant_domain}/`;
            let listUrls = str + 'env/' + listObjectName + 's';
            this.getListUrl = listUrls;
        },
    },
    watch: {
        getListUrl(val) {
            this.$refs.listObject.getData();
            (this.listItemSelected = []), (this.showBtnAddCheckbox = true);
        },
    },
    created() {
        this.getUrl();
    },
    mounted() {
        this.calcContainerHeight();
    },
};
</script>

<style scoped>
.symper-title {
    margin-left: 12px !important;
}
.btn-header-popup {
    position: absolute;
    top: 6px;
    right: 235px;
}
</style>
