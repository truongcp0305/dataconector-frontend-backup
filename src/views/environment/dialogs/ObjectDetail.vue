<template>
    <div style="position: relative" class="object-detail">
        <v-btn
            depressed
            small
            icon
            tile
            style="position: absolute; left: 0; top: 6px"
            @click="back"
            class="mr-2 ml-1"
        >
            <v-icon dark small>mdi-keyboard-backspace</v-icon>
        </v-btn>
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
import DialogDataRelate from './DialogDataRelate';
import ListItem from '@/components/common/ListItems';
import DialogsConfirmSync from './DialogsConfirmSync';
export default {
    components: {
        ListItem,
        DialogsConfirmSync,
        DialogDataRelate,
    },
    props: {
        tableHeight: {
            type: Number,
        },
        getListUrl: {
            type: String,
        },
        currentObjectType: {
            type: String,
        },
        tab: {
            type: String,
            default: '',
        },
    },
    data() {
        let self = this;
        return {
            listItemSelected: [],
            page: 1,
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
                    title:this.$t('v2.environment.syncAll'),
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
        back() {
            this.$emit('back');
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
    },
    watch: {
        getListUrl(val) {
            this.$refs.listObject.emptyShowList();
            setTimeout(
                (self) => {
                    self.$refs.listObject.getData();
                },
                200,
                this,
            );
            (this.listItemSelected = []), (this.showBtnAddCheckbox = true);
        },
        tab(val) {
            this.$refs.listObject.removeCheckBoxColumn();
            this.showBtnAddCheckbox = true;
        },
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
