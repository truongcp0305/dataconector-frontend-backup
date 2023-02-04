<template>
    <div style="display: flex">
        <VueResizable
            :width="500"
            :max-width="600"
            :min-width="300"
            :active="['r']"
        >
            <AgDataTable
                :tableHeight="'calc(100% - 100px)'"
                :customTableStyle="true"
                :rowData="dataTable"
                :editable="false"
                :customComponents="customAgComponents"
                @on-cell-dbl-click="onCellDblClick"
                :cellRendererParams="{
                    innerRenderer: 'nodeName',
                    suppressDoubleClickExpand: true,
                }"
            >
            </AgDataTable>
        </VueResizable>
        <ListItems
            ref="listUser"
            :pageTitle="$t('orgchart.userList')"
            :getDataUrl="apiUrl"
            :containerHeight="containerHeight"
            :tableContextMenu="tableContextMenu"
            :useDefaultContext="false"
            :useActionPanel="true"
            :actionPanelWidth="850"
            :customAPIResult="customAPIResult"
            :showButtonAdd="false"
        >
            <template slot="right-panel-content" slot-scope="{}">
                <Detail :quickView="true" :docObjInfo="docObjInfo" />
            </template>
        </ListItems>
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems.vue';
import VueResizable from 'vue-resizable';
import { util } from './../../../plugins/util.js';
import { appConfigs } from '../../../configs.js';
export default {
    components: {
        ListItems,
        VueResizable,
    },
    props: {
        dataTable: {},
        customAgComponents: {},
    },
    data() {
        return {
            listUserInNode: [],
            apiUrl: appConfigs.apiDomain.account + 'users',
            containerHeight: null,
            tableContextMenu: {
                viewDetails: {
                    name: this.$t('v2.orgchart.viewDetails'),
                    text: this.$t('v2.orgchart.viewDetails'),
                    callback: (app, callback) => {
                        self.$refs.listUser.actionPanel = true;
                        this.$emit('view-details', app);
                    },
                },
            },
            customAgComponents: {
                nodeName: NodeNameInTable,
                UserInNodeView: UserInNodeView,
            },
        };
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h - 50;
    },
    methods: {
        onCellDblClick(params) {
            params.data.orgchartId = this.$route.params.id;
            this.$store.dispatch('orgchart/updateUserInNode', params.data);
            this.listUserInNode = this.$store.getters[
                'orgchart/listUserInChildrenNode'
            ](this.$route.params.id);
        },
    },
    computed: {
        allUserInOrgchart() {
            return this.$store.state.orgchart.allUserInOrgChart[
                this.$route.params.id
            ];
        },
    },
    watch: {
        listUserInNode: {
            deep: true,
            immediate: true,
            handler: function (after) {},
        },
    },
};
</script>

<style></style>
