<template>
    <ListItem
        ref="listOrgchart"
        :showCloseIcon="true"
        :actionPanelType="'modal'"
        :pageTitle="$t('v2.acessControl.orgchartList')"
        :containerHeight="containerHeight"
        :useDefaultContext="false"
        :commonActionProps="commonActionProps"
        :tableContextMenu="tableContextMenu"
        :getDataUrl="getListUrl"
        :customAPIResult="customAPIResult"
        :useActionPanel="true"
        :showExportButton="false"
        :flexMode="true"
        :headerPrefixKeypath="'common'"
        :actionPanelWidth="'1075px!important'"
        :showButtonAdd="false"
        :dialogMode="false"
        :emptyDataKey="'access-control-orgchart-list'"
    >
        <template slot="right-panel-content" slot-scope="{}">
            <UserRoleOrgchartPanel
                :idOrgchart="idOrgchart"
                @close-form="handleCloseForm"
            />
        </template>
    </ListItem>
</template>

<script>
import UserRoleOrgchartPanel from './UserRoleOrgchartPanel';
import { appConfigs } from '@/configs.js';
import { util } from '@/plugins/util.js';
import ListItem from '@/components/common/ListItems.vue';
export default {
    components: {
        ListItem,
        UserRoleOrgchartPanel,
    },
    methods: {
        handleCloseForm() {
            this.$refs.listOrgchart.actionPanel = false;
        },
    },
    created() {
        this.$store.dispatch('orgchart/getAllOrgchartStruct');
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        let self = this;
        return {
            commonActionProps: {
                module: 'orgchart_role',
                resource: 'orgchart_role',
                scope: 'orgchart_role',
            },
            getListUrl: appConfigs.apiDomain.orgchart + 'orgchart',
            idOrgchart: null,
            customAPIResult: {
                reformatData(res) {
                    return {
                        columns: [
                            { name: 'id', title: 'id', type: 'numeric' },
                            { name: 'code', title: 'code', type: 'text' },
                            { name: 'name', title: 'name', type: 'text' },
                            {
                                name: 'isDefault',
                                title: 'isDefault',
                                type: 'text',
                                cellRenderer: function (params) {
                                    let newValue =
                                        params.value == '1' ? self.$t('v2.doc.default') : '';
                                    return '<span>' + newValue + '</span>';
                                },
                            },
                            {
                                name: 'description',
                                title: 'description',
                                type: 'text',
                            },
                            {
                                name: 'createAt',
                                title: 'create_at',
                                type: 'date',
                            },
                            {
                                name: 'lastUpdateAt',
                                title: 'last_update_at',
                                type: 'date',
                            },
                        ],
                        listObject: res.data.listObject,
                        total: res.data.listObject.length,
                    };
                },
            },
            tableContextMenu: {
                set_permission: {
                    name: 'update',
                    text: self.$t('v2.acessControl.decentralization'),
                    callback: (row, callback) => {
                        self.idOrgchart = row.id;
                        self.$refs.listOrgchart.actionPanel = true;
                    },
                },
            },
        };
    },
};
</script>

<style></style>
