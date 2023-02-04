<template>
    <div>
        <v-dialog v-model="showDialog" persistent class="h-100 w-100">
            <v-tabs v-model="tab" v-show="false"> </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item value="tab-1">
                    <div class="d-flex pt-2 pr-4 pl-4" style="height: 500px">
                        <div
                            class="dialog-object-in-service d-flex flex-column w-100 h-100"
                            style="
                                z-index: 1000;
                                background-color: #ffffff;
                                position: relative;
                            "
                        >
                            <div>{{$t('v2.environment.listObjectCanBeSync')}}</div>
                            <VuePerfectScrollbar style="height: 470px">
                                <div
                                    v-for="(item, i) in listObjectType"
                                    :key="i"
                                    class="ml-10"
                                >
                                    <span
                                        class="mt-10 ml-2 text-uppercase object-type-title"
                                        @click="handleObjectViewDetail(item)"
                                    >
                                        {{ item }}
                                    </span>
                                </div>
                            </VuePerfectScrollbar>
                        </div>
                        <div>
                            <v-btn icon tile @click="handleCloseEvent">
                                <v-icon> mdi-close </v-icon>
                            </v-btn>
                        </div>
                    </div>
                </v-tab-item>
            </v-tabs-items>
        </v-dialog>
        <DialogsConfirmSync
            :showDialog="showDialogSync"
            @cancel="showDialogSync = false"
        />
    </div>
</template>

<script>
import ListItem from '@/components/common/ListItems';
import DialogsConfirmSync from './DialogsConfirmSync';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import ObjectDetail from './ObjectDetail';
export default {
    components: {
        ListItem,
        ObjectDetail,
        DialogsConfirmSync,
        VuePerfectScrollbar,
    },
    computed: {
        listObjectType() {
            let envStore = this.$store.state.environmentManagement;
            return envStore.listObjectTypeInService[
                envStore.currentServiceType
            ];
        },
    },
    props: {
        showDialog: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            tab: 'tab-1',
            showDialogSync: false,
        };
    },
    methods: {
        handleCloseEvent() {
            this.$emit('close-popup');
        },
        handleObjectViewDetail(item) {
            let currentService =
                this.$store.state.environmentManagement.currentService;
            this.$goToPage(
                '/environment-management/detail-object/' +
                    currentService.serviceIdentifier +
                    '::' +
                    item,
                    this.$t('v2.environment.syncRecordList'),
            );
        },
    },
    watch: {
        showDialog(val) {
            this.tab = 'tab-1';
        },
    },
};
</script>

<style scoped>
.dialog-object-in-service >>> .btn-header-popup {
    position: absolute;
    top: 9px;
    right: 218px;
}
.dialog-object-in-service >>> .object-type-title {
    cursor: pointer;
}
.dialog-object-in-service >>> .object-type-title:hover {
    border-bottom: 1px solid lightgray;
}
.tab-obj-types {
    width: 300px;
    height: 300px;
}
</style>
