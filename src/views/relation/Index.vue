<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listRelations"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'table'"
            :pageTitle="$t('bi.relation.title-show-list')"
            :containerHeight="tableHeight"
            :tableContextMenu="tableContextMenu"
            :customAPIResult="customAPIResult"
            :useActionPanel="false"
            :useDefaultContext="false"
            @on-add-item-clicked="goToCreatePage"
            :emptyDataKey="'bi-relation-list'"
        >
        </ListItems>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import RelationEditorWorker from 'worker-loader!@/worker/relation/RelationEditor.Worker.js';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
export default {
    name: 'listApps',
    components: {
        ListItems,
    },
    created() {
        this.relationEditoWorker = new RelationEditorWorker();
        this.listenFromWorker();
    },
    data: function () {
        let self = this;
        return {
            apiUrl: appConfigs.apiDomain.biService + '/relations',
            relationEditoWorker: null,
            tableContextMenu: {
                update: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: (obj, callback) => {
                        self.$goToPage(
                            '/relation/' + obj.id + '/edit',
                            self.$t('common.edit'),
                        );
                    },
                },
                view: {
                    name: 'view',
                    text: this.$t('common.view'),
                    callback: (obj, callback) => {
                        self.$goToPage(
                            '/relation/' + obj.id + '/view',
                            self.$t('common.view'),
                        );
                    },
                },
                clone: {
                    name: 'clone',
                    text: this.$t('common.clone'),
                    callback: (obj, callback) => {
                        self.$goToPage(
                            '/relation/' + obj.id + '/clone',
                            self.$t('common.clone'),
                        );
                    },
                },
                delete: {
                    name: 'delete',
                    text: this.$t('common.delete'),
                    callback: (rows, callback) => {
                        self.deleteRows(rows);
                    },
                },
            },
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
            tableHeight: 0,
        };
    },
    mounted() {
        this.tableHeight = util.getComponentSize(this).h;
    },
    methods: {
        goToCreatePage() {
            this.$goToPage('/relation/add', this.$t('v2.relation.createRelation'));
        },
        deleteRows(rows) {
            this.relationEditoWorker.postMessage({
                action: 'deleteRelations',
                data: {
                    rows: rows,
                },
            });
        },
        listenFromWorker() {
            let self = this;
            this.relationEditoWorker.addEventListener(
                'message',
                function (event) {
                    let data = event.data;
                    let action = data.action;
                    if (self[action]) {
                        self[action](data.data);
                    } else {
                        console.error(this.$t('v2.relation.action')+action+this.$t('v2.relation.notFound'));
                    }
                },
            );
        },
        handleDeleteRelations(data) {
            if (data == 200) {
                this.$snotifySuccess(this.$t('v2.relation.deleteSuccess'));
            } else {
                this.$snotifyError(this.$t('v2.relation.errorHappen'));
            }
            this.$refs.listRelations.refreshList();
        },
    },
};
</script>
