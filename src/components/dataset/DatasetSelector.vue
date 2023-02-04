<template>
    <v-dialog
        v-model="showDialog"
        persistent
        content-class="bi-dataset-selector"
        class="h-100 w-100"
    >
        <ListItem
            ref="listObject"
            :showButtonAdd="false"
            :showExportButton="false"
            :showDisplayConfig="false"
            :containerHeight="tableHeight"
            :getDataUrl="getDataUrl"
            :showFilter="false"
            :customAPIResult="customAPIResult"
            @data-loaded="handleDataLoaded"
            @after-selected-row="changeDatasetSelected"
            :checkedRows="listDatasetSelected"
            :customHeaderBtn="customHeaderBtn"
        />
    </v-dialog>
</template>

<script>
import ListItem from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
import { util } from '@/plugins/util';

export default {
    components: {
        ListItem,
    },
    props: {
        value: {
            type: Array,
            default() {
                return [];
            },
        },
        listDatasetSelected: {
            type: Array,
            default() {
                return [];
            },
        },
        tableHeight: {
            type: Number,
            default: 0,
        },
    },
    created() {
        this.setOriginValue(this.value);
    },

    data() {
        let self = this;
        let dataUrl = appConfigs.apiDomain.biService + 'datasets/get-list';
        dataUrl = this.$route.path.includes('edit-in-clickhouse-mode')
            ? dataUrl.replace(SYMPER_ENV.environment, 'dev')
            : dataUrl;
        return {
            internalChange: false,
            showDialog: false,
            originDatasetIds: [],
            checkedRows: [],
            getDataUrl: dataUrl,
            customAPIResult: {
                reformatData(res) {
                    res.data.columns.forEach(function (e) {
                        e.flex = 1;
                    });

                    return {
                        columns: res.data.columns,
                        listObject: res.data.listObject,
                        total: res.data.total,
                    };
                },
            },
            customHeaderBtn: {
                cancel: {
                    title: this.$t('common.cancel'),
                    icon: 'mdi-close',
                    callback() {
                        self.showDialog = false;
                        self.$emit('cancel', self.originDatasetIds);
                    },
                },
                select: {
                    title: this.$t('common.ok'),
                    icon: 'mdi-check',
                    callback() {
                        self.showDialog = false;
                        self.select();
                    },
                },
            },
        };
    },
    methods: {
        show() {
            this.showDialog = true;
            if (this.$refs.listObject) {
                this.$refs.listObject.setRowChecked();
            }
        },
        handleDataLoaded() {
            setTimeout(
                (self) => {
                    self.$refs.listObject.addCheckBoxColumn();
                    self.$refs.listObject.setRowChecked();
                },
                200,
                this,
            );
        },
        changeDatasetSelected(data) {
            let arr = [];
            data.forEach(function (e) {
                arr.push(e.id);
            });
            this.internalChange = true;
            this.$emit('input', arr);
            setTimeout(
                (self) => {
                    self.internalChange = false;
                },
                0,
                this,
            );
        },
        select() {
            let rows = this.$refs.listObject.getSelectedRows();
            let arr = [];
            rows.forEach(function (e) {
                arr.push(e.id);
            });
            let allDataset = [...new Set(arr.concat(this.listDatasetSelected))];
            this.$evtBus.$emit('list-datasets-change', allDataset);
        },
        setOriginValue(value) {
            this.originDatasetIds = util.cloneDeep(value);
        },
    },
    watch: {
        value: {
            deep: true,
            handler(newValue) {
                if (!this.internalChange) {
                    this.setOriginValue(newValue);
                }
            },
        },
    },
};
</script>

<style>
.bi-dataset-selector {
    background-color: #ffffff;
}
</style>
