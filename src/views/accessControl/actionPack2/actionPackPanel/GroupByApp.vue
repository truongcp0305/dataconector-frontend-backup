<template>
    <div class="w-100 h-100 mt-3">
        <div v-if="!showPermissionControl">
            <AppSelector
                ref="appSelector"
                :name="$t('objects.application')"
                :showBtn="action != 'view' ? true : false"
                @list-item-selected="handleSelectListApp"
                @item-selected="handleClickApp"
                :appSelected="appSelected"
                @change-selected-item="changeSelectedApp"
                @delete-item="deletedApp"
                :typeSelect="'app'"
                :listItem="listApps"
                :listAppSelected="listAppsSelected"
                :action="action"
            />
            <div style="width: 200px; min-width: 100%" class="mt-2">
                <v-tabs
                    show-arrows
                    active-class="hight-light-children"
                    :height="30"
                    v-model="tabIndex"
                    color="orange accent-4"
                >
                    <v-tab v-for="item in objectTypes" :key="item.key">
                        {{ item.text }}
                    </v-tab>
                </v-tabs>
            </div>
            <Preloader v-if="loading" />
            <GroupByObjectType
                :objectType="objectActive"
                :action="action"
                :listOperations="listOperations"
                :tableHeight="tableHeight"
                :key="objectActive"
                @show-permission-control="showPmsCtr"
            />
        </div>
        <PermissionControl
            v-if="showPermissionControl"
            :action="action"
            :idDoc="permissionControl.idDoc"
        />
    </div>
</template>
<script>
import AppSelector from './AppSelector.vue';
import GroupByObjectType from './GroupByObjectType';
import Preloader from '@/components/common/Preloader.vue';
import ActionPackWorker from 'worker-loader!@/worker/accessControl/ActionPack.Worker.js';
import PermissionControl from './PermissionControl.vue';
export default {
    props: {
        showPermissionControl: {
            type: Boolean,
            default: false
        },
        permissionControl: {
            type: Object,
            default() {
                return {
                    idDoc: '',
                    name: ''
                };
            }
        },
        action: {
            type: String,
            default: 'create'
        },
        tableHeight: {
            type: Number,
            default: 500
        },
        oldApp: {
            type: String,
            default: ''
        },
        oldTabIndex: {
            type: Number,
            default: 0
        }
    },
    components: {
        AppSelector,
        GroupByObjectType,
        Preloader,
        PermissionControl
    },
    data() {
        return {
            tabIndex: 0,
            objectTypes: [
                {
                    key: 'document_definition',
                    text: this.$t('objects.document')
                },
                {
                    key: 'document_instance',
                    text: this.$t('objects.document_instance')
                },
                {
                    key: 'workflow_definition',
                    text: this.$t('objects.workflow_definition')
                },
                {
                    key: 'orgchart',
                    text: this.$t('objects.orgchart')
                },
                {
                    key: 'dashboard',
                    text: this.$t('objects.dashboard')
                }
            ],
            loading: false,
            appSelected: '',
            listOperations: []
        };
    },
    created() {
        this.appSelected =
            Object.keys(this.allAppsInActionPack).length > 0
                ? this.allAppsInActionPack[
                      Object.keys(this.allAppsInActionPack)[0]
                  ].id
                : '';
        this.tabIndex = this.oldTabIndex;
        this.getListOperations();
        let self = this;
        this.actionPackWorker = new ActionPackWorker();
        this.actionPackWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'detailAppAndOperationInApp':
                    self.$store.commit(
                        'actionPack/setChildrenForApp',
                        data.dataAfter.apps
                    );
                    let obj = {
                        app: data.dataAfter.apps,
                        operations: data.dataAfter.operations,
                        typeSelect: 'app'
                    };
                    self.$store.commit('actionPack/updateOperation', obj);
                    self.getListOperations();
                default:
                    break;
            }
        });
    },
    computed: {
        allAppsInActionPack() {
            return this.$store.state.actionPack.allApplicationsInActionPack;
        },
        allApps() {
            return this.$store.state.actionPack.allApps;
        },
        listApps() {
            let arr = this.allApps.filter((e) => {
                return e.isSelected == false;
            });
            return arr;
        },
        listAppsSelected() {
            let arr = this.allApps.filter((e) => {
                return e.isSelected == true;
            });
            return arr;
        },
        objectActive() {
            return this.objectTypes[this.tabIndex].key;
        }
    },
    watch: {
        appSelected(vl) {
            this.$emit('change-app-selected', vl);
        },
        tabIndex(vl) {
            this.$emit('change-tab-index', vl);
        }
    },
    methods: {
        showPmsCtr(params) {
            this.$emit('show-permission-control', params);
        },
        getListOperations() {
            if (this.appSelected == '') {
                this.listOperations = {
                    document_definition: [],
                    document_instance: [],
                    workflow_definition: [],
                    dashboard: [],
                    orgchart: []
                };
            } else
                this.listOperations =
                    this.allAppsInActionPack[this.appSelected].children;
        },
        deletedApp(app) {
            this.$store.commit('actionPack/deleteApp', app);
        },
        async handleSelectListApp(app) {
            let apps = this.allAppsInActionPack;
            apps[app.id] = {
                children: {
                    document_definition: [],
                    document_instance: [],
                    workflow_definition: [],
                    dashboard: [],
                    orgchart: []
                },
                id: app.id,
                name: app.name
            };
            this.$store.commit('actionPack/setApplicationInActionPack', apps);
            this.actionPackWorker.postMessage({
                action: 'detailAppAndOperationInApp',
                data: app.id
            });
        },
        handleClickApp(value) {
            this.appSelected = value;
            this.getListOperations();
        },
        changeSelectedApp(appDelete) {
            if (this.appSelected == appDelete.id) {
                this.appSelected =
                    this.listAppsSelected.length > 0
                        ? this.listAppsSelected[0].id
                        : '';
            }
            this.getListOperations();
        }
    }
};
</script>

<style scoped>
.title-children-application {
    cursor: pointer;
    margin-left: auto;
    margin-right: auto;
}
.title-children-application:hover {
    background-color: #f7f7f7;
}
.title-children-application-active {
    background-color: #f0f0f0;
}
.v-tab {
    font-size: 13px !important;
    letter-spacing: 0 !important;
    text-transform: unset !important;
    font-weight: 400 !important;
}
.hight-light-children {
    font-weight: 500 !important;
    color: #f48634 !important;
}
</style>
