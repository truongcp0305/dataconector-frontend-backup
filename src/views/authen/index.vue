<template>
    <div class="w-100">
        <list-items
            ref="listServerKey"
            :showImportHistory="false"
            :useDefaultContext="false"
            @after-open-add-panel="addKey"
            :headerPrefixKeypath="'authen.table'"
            :pageTitle="$t('authen.table.title')"
            :containerHeight="containerHeight"
            :showExportButton="false"
            :actionPanelWidth="actionPanelWidth"
            :customAPIResult="customAPIResult"
            :tableContextMenu="tableContextMenu"
            :getDataUrl="getListUrl"
        >
            <div slot="right-panel-content" class="h-100">
                <add-key
                    v-show="showAddView"
                    :typeView="typeView"
                    :detailKey="detailKey"
                    @close-panel="close()"
                    ref="addView"
                />
                <detail-key
                    @close-detail-key="close()"
                    v-show="showDetailView"
                    :detailKey="detailKey"
                    ref="detailView"
                />
            </div>
        </list-items>
    </div>
</template>
<script>
import ListItems from './../../components/common/ListItems.vue';
import AddKeyServer from './../../components/authen/addKeyServer.vue';
import DetailKeyServer from './../../components/authen/detailKeyServer.vue';
import { util } from './../../plugins/util.js';
import { appConfigs } from '../../configs';
import { systemRoleApi } from '@/api/systemRole.js';
import { accessControlApi } from './../../api/accessControl';
export default {
    watch: {},
    created() {
        this.$store.dispatch('app/getAllBA');
        this.getRole();
    },
    components: {
        'list-items': ListItems,
        'add-key': AddKeyServer,
        'detail-key': DetailKeyServer,
    },
    data() {
        const self = this;
        return {
            listRoles: [],
            detailKey: {},
            showDetailView: false,
            listUser: [],
            showAddView: false,
            importInfo: {},
            typeView: 'add',
            customAPIResult: {
                setStatus(status) {
                    switch (status) {
                        case '0':
                            return self.$t('v2.authen.stop');
                        case '1':
                            return self.$t('v2.authen.active');
                        default:
                            return self.$t('v2.authen.active');
                            break;
                    }
                },
                reformatData(res) {
                    let listBA = self.$store.state.app.allBA;
                    let data = {
                        columns: [
                            { name: 'id', title: 'id', type: 'numeric' },
                            { name: 'name', title: 'name', type: 'text' },
                            {
                                name: 'description',
                                title: 'description',
                                type: 'text',
                            },
                            {
                                name: 'serverKey',
                                title: 'serverKey',
                                type: 'text',
                            },
                            { name: 'status', title: 'status', type: 'text' },
                            {
                                name: 'userUpdate',
                                title: 'userUpdate',
                                type: 'text',
                            },
                            {
                                name: 'userCreate',
                                title: 'userCreate',
                                type: 'text',
                            },
                            {
                                name: 'createAt',
                                title: 'createAt',
                                type: 'text',
                            },
                            {
                                name: 'updateAt',
                                title: 'updateAt',
                                type: 'text',
                            },
                        ],
                        listObject: res.data,
                        total: res.data.length,
                    };
                    data.listObject.map((d) => {
                        d.status = this.setStatus(d.status);
                        listBA.map((ba) => {
                            if (ba.id == d.userCreate) {
                                d.userCreate = ba.name;
                            }
                            if (ba.id == d.userUpdate) {
                                d.userUpdate = ba.name;
                            }
                        });
                    });
                    return data;
                },
            },
            tableContextMenu: {
                view: {
                    name: 'view',
                    text: this.$t('user.table.contextMenu.view'),
                    callback: (serverKey, callback) => {
                        this.viewKey(serverKey);
                    },
                },
                update: {
                    name: 'update',
                    text: this.$t('user.table.contextMenu.edit'),
                    callback: (serverKey, callback) => {
                        this.updateKey(serverKey);
                    },
                },
                delete: {
                    name: 'delete',
                    text: this.$t('user.table.contextMenu.delete'),
                    callback: (serverKey, callback) => {
                        this.deleteKey(serverKey);
                    },
                },
            },
            getListUrl: appConfigs.apiDomain.permission + 'server_keys',
            actionPanelWidth: 400,
            containerHeight: 200,
            columns: [],
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    methods: {
        getRole() {
            const self = this;
            systemRoleApi.getRole().then((res) => {
                if (res.status == 200) {
                    self.listRoles = res.data.listObject;
                } else {
                    self.$snotify({
                        type: 'error',
                        title: 'authen.notify.error_get_role',
                    });
                }
            });
        },
        changeView(addView = false, detailView = true) {
            (this.showAddView = addView), (this.showDetailView = detailView);
            this.actionPanelWidth = 400;
        },
        close() {
            this.$refs.listServerKey.closeactionPanel();
            this.$refs.listServerKey.refreshList();
        },
        addKey() {
            this.changeView(true, false);
            this.typeView = 'add';
        },
        setKeyValue() {
            this.$refs.addView.nameKey = this.detailKey.name;
            this.$refs.addView.descriptionKey = this.detailKey.description;
            this.$refs.addView.statusKey =
                this.detailKey.status == this.$t('v2.authen.active') ? true : false;
            this.$refs.addView.keyId = this.detailKey.id;
        },
        updateKey(key) {
            this.changeView(true, false);
            this.typeView = 'update';
            this.$refs.listServerKey.openactionPanel();
            this.detailKey = key;
            this.detailKey.idRole = '';
            this.setKeyValue();
        },
        viewKey(key) {
            this.changeView(false, true);
            this.actionPanelWidth = 630;
            let arr = Object.keys(key);
            arr.pop();
            let detailKey = [];
            arr.map((a) => {
                detailKey.push({
                    name: a,
                    value: key[a],
                });
            });
            this.detailKey = detailKey;
            this.detailKey.idRole = this.getIdRole(key);
        },
        getIdRole(detailKey) {
            let idRole = '';
            this.listRoles.map((role) => {
                if (detailKey.name == role.name) {
                    idRole = role.id;
                }
            });
            return idRole;
        },
        deleteKey(key) {
            key.map((k) => {
                this.deleteOneKey(k.id);
            });
        },
        deleteOneKey(id) {
            accessControlApi.deleteServerKey(id).then((res) => {
                if (res.status == 200) {
                    this.$snotify({
                        type: 'success',
                        title:
                            this.$t('authen.view.delete_title') +
                            this.$t(+'authen.notify.success'),
                    });
                    this.$refs.listServerKey.refreshList();
                } else {
                    this.$snotify({
                        type: 'error',
                        title:
                            this.$t('authen.view.delete_title') +
                            this.$t(+'authen.notify.success'),
                    });
                }
            });
        },
        refreshListUser() {
            this.$refs.listUser.refreshList();
        },
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
    },
};
</script>
