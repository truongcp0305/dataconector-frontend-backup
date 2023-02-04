<template>
    <div class="h-100 w-100">
        <ListItems
            ref="listService"
            :pageTitle="$t('v2.environment.listInstance')"
            :containerHeight="containerHeight"
            :getDataUrl="getListUrl"
            :headerPrefixKeypath="'table'"
            :useDefaultContext="false"
            :showExportButton="false"
            :showButtonAdd="false"
            :tableContextMenu="tableContextMenu"
            :customAPIResult="customAPIResult"
            :apiMethod="'POST'"
            :customDataForApi="customDataForApi"
        />
        <DialogDeloy :showDialog="showDialog" @cancel="showDialog = false" />
    </div>
</template>

<script>
import ListItems from '@/components/common/ListItems';
import { appConfigs } from '@/configs.js';
import { util } from '@/plugins/util.js';
import DialogDeloy from './dialogs/DialogDeloy';
export default {
    components: {
        ListItems,
        DialogDeloy,
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        let self = this;
        return {
            showDialog: false,
            containerHeight: 0,
            customDataForApi(configs, columns, filterData) {
                let serviceId = self.$route.params.serviceId;
                return {
                    serviceId: serviceId,
                };
            },
            tableContextMenu: {},
            customAPIResult: {
                reformatData(res) {
                    return {
                        columns: [
                            {
                                name: 'id',
                                title: 'id',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'versionName',
                                title: 'versionName',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'environmentIdentifier',
                                title: 'environmentIdentifier',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'environmentName',
                                title: 'environmentName',
                                type: 'numeric',
                                noFilter: true,
                            },
                            {
                                name: 'status',
                                title: 'status',
                                type: 'numeric',
                                noFilter: true,
                            },
                            {
                                name: 'userCreateName',
                                title: 'userCreate',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'userUpdateName',
                                title: 'userUpdate',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'createAt',
                                title: 'createAt',
                                type: 'text',
                                noFilter: true,
                            },
                            {
                                name: 'updateAt',
                                title: 'updateAt',
                                type: 'text',
                                noFilter: true,
                            },
                        ],
                        listObject: res.data,
                        total: res.data.length,
                    };
                },
            },
        };
    },
    computed: {
        getListUrl() {
            return appConfigs.apiDomain.fileManagement + 'env/files/ids';
        },
    },
};
</script>

<style></style>
