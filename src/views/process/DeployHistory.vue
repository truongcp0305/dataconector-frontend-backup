<template>
    <div class="w-100">
        <list-items
        ref="listDeployments"
        :useDefaultContext="false"
        :flexMode="true"
        :pageTitle="$t('process.deployment.list')"
        :tableContextMenu="tableContextMenu"
        :containerHeight="containerHeight"
        :getDataUrl="getListUrl"
        :customAPIResult="customAPIResult"
        :useActionPanel="false"
        :headerPrefixKeypath="'common'"
        :emptyDataKey="'workflow-deploy-history'"
        :disableButtonAdd="disableButtonAdd"
    ></list-items>
    </div>
    
</template>
<script>
import { util } from '@/plugins/util.js';
import { reformatGetListDeployments } from '@/components/process/reformatGetListData.js';
import { appConfigs } from '@/configs.js';
import ListItems from '@/components/common/ListItems.vue';

export default {
    components: {},
    data() {
        let self = this;
        return {
            containerHeight: 300,
            customAPIResult: {
                reformatData: reformatGetListDeployments,
            },
            getListUrl: this.getDeploymentUrl(),
            tableContextMenu: [
                {
                    name: 'start',
                    text: this.$t('process.deployment.run'),
                    callback: (row, callback) => {
                        // runProcessDefinition(self, row);
                        self.$goToPage(
                            `/workflow/process-definition/${row.id}/run`,
                            self.$t('v2.workflow.startProcessInstance'),
                        );
                    },
                },
                {
                    name: 'statistics',
                    text: this.$t('common.statistics'),
                    callback: (row, callback) => {},
                },
                {
                    name: 'viewDetail',
                    text: this.$t('common.detail'),
                    callback: (row, callback) => {},
                },
                {
                    name: 'processInstance',
                    text: this.$t('process.instance.list'),
                    callback: (row, callback) => {
                        self.$goToPage(
                            `/workflow/process-key/${row.key}/list-instances`,
                            self.$t('process.instance.tracking'),
                        );
                    },
                },
            ],
            disableButtonAdd: true,
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    created() {},
    watch: {},
    methods: {
        getDeploymentUrl() {
            let processName = this.$route.params.name;
            return (
                appConfigs.apiDomain.bpmne.definitions + '?name=' + processName
            );
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
    },
    components: {
        ListItems: ListItems,
    },
};
</script>
