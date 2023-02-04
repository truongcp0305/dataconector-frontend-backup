<template>
    <div class="view-applications-wrapper h-100 w-100">
        <ViewDetailsAllApps
            ref="ViewDetailsAllApps"
            v-if="viewSideBySide == false"
            :currentType="currentType"
            @mounted-details="mountedDetails"
        />
        <ViewSideBySideApps
            ref="ViewSideBySideApp"
            v-else-if="viewSideBySide"
            @mounted-side-by-side="mountedSideBySide"
        />

        <ImportExcelPanel
            :options="documentDefinitionOptions.import"
            :open="documentDefinitionOptions.import.show"
        />
    </div>
</template>

<script>
import ImportExcelPanel from '@/components/document/ImportExelPanel';
import ViewDetailsAllApps from './ViewDetailsAllApps.vue';
import ViewDetailsAllApp from './ViewDetailsAllApp.vue';
import ViewSideBySideApps from './ViewSideBySideApps.vue';
import { uiConfigApi } from '@/api/uiConfig';
import { util } from '@/plugins/util.js';
import MyApplicationWorker from 'worker-loader!@/worker/application/MyApplicationForNewTest.Worker.js';
export default {
    created() {
        this.myApplicationWorker = new MyApplicationWorker();
        this.getAppsData();
        let self = this;
        this.$evtBus.$on('symper-app-document-definition-import', (data) => {
            for (const key in data) {
                self.documentDefinitionOptions.import[key] = data[key];
            }
            self.documentDefinitionOptions.import.show =
                !self.documentDefinitionOptions.import.show;
        });
    },
    methods: {
        isBa() {
            let userInfo = util.auth.getSavedUserInfo();
            let userType = userInfo.profile.type;
            return userType == 'ba';
        },
        mountedDetails() {
            let self = this;
            this.mountDetails = true;
            this.mountSideBySide = false;
            if (this.dataAppsGet && this.mountDetails) {
                self.$refs.ViewDetailsAllApps.handlerGetActiveApp(
                    this.dataApps
                );
            }
        },
        async mountedSideBySide() {
            let self = this;
            this.mountDetails = false;
            this.mountSideBySide = true;
            if (this.dataAppsGet && this.mountSideBySide) {
                self.$refs.ViewSideBySideApp.handleGetApps(this.dataApps);
                await self.$refs.ViewSideBySideApp.getAppFromUrl();
            }
        },
        async getAppsDetail(ids) {
            let res = await runBySymperPromiseWorker(
                this.myApplicationWorker,
                'getApps',
                {
                    ids: ids
                }
            );
            this.dataApps = res;
            this.dataAppsGet = true;
        },
        async getAppsData() {
            let self = this;
            if (this.isBa()) {
                await this.getAppsDetail('all_apps');
            } else {
                if(self.$store.state.app.userOperations.application_definition){
                    let activeApp = Object.keys(
                        self.$store.state.app.userOperations.application_definition
                    );
                    await this.getAppsDetail(activeApp.toString());
                }else{
                    this.dataAppsGet=true;
                    let res={
                        message: this.$t('v2.app.accountNotHavePermisson')
                    }
                    this.dataApps = res;
                }
            }
        }
    },
    watch: {
        async dataApps() {
            let self = this;
            if (this.dataAppsGet && this.mountDetails) {
                await self.$refs.ViewDetailsAllApps.handlerGetActiveApp(
                    this.dataApps
                );
            } else if (this.dataAppsGet && this.mountSideBySide) {
                self.$refs.ViewSideBySideApp.handleGetApps(this.dataApps);
                await self.$refs.ViewSideBySideApp.getAppFromUrl();
            }
        }
    },
    components: {
        ViewSideBySideApps,
        ViewDetailsAllApps,
        ViewDetailsAllApp,
        ImportExcelPanel
    },
    computed: {
        viewSideBySide() {
            return this.$store.state.appConfig.viewSideBySide;
        }
    },
    data() {
        return {
            mountDetails: false,
            mountSideBySide: false,
            dataAppsGet: false,
            currentType: 0,
            myApplicationWorker: null,
            dataApps: {},
            documentDefinitionOptions: {
                import: {
                    show: false,
                    objId: '',
                    objType: '',
                    subObjType: '',
                    nameObj: ''
                }
            }
        };
    },
    mounted() {
        let self = this;
        $(document).click(function (e) {
            if (!$(e.target).is('.context-menu')) {
                $('.context-menu').css('display', 'none');
                if (self.viewSideBySide == true) {
                    if (self.$refs.ViewSideBySideApp) {
                        self.$refs.ViewSideBySideApp.hideContextMenu();
                    }
                } else {
                    if (self.$refs.ViewDetailsAllApps) {
                        self.$refs.ViewDetailsAllApps.hideContextMenu();
                    }
                }
            }
        });
    },
    beforeCreate() {
        let self = this;
        uiConfigApi.getUiConfig('myApplication').then((res) => {
            if (res.status == 200) {
                let value = JSON.parse(res.data.detail);
                if (value.typeView == 0) {
                    this.$store.commit('appConfig/setTypeView', false);
                } else {
                    this.$store.commit('appConfig/setTypeView', true);
                }
                self.currentType = value.typeView;
            }
        });
    }
};
</script>

<style scoped>
.view-applications-wrapper {
    font-family: roboto;
}
</style>
