<template>
    <v-card class="context-menu" v-show="isShowContext">
        <div
            class="context-menu-item"
            v-for="(action, i) in listAction"
            :key="i"
            @click="clickAction(action, sideBySide, allAppMode)"
        >
            <span v-html="reduce(action)"></span>
        </div>
    </v-card>
</template>
<script>
import { appManagementApi } from '@/api/AppManagement.js';
const mapIcons = {
    orgchart: {
        create: 'mdi-folder-plus-outline',
        update: 'mdi-note-plus-outline',
        drop: 'mdi-arrow-down-drop-circle-outline',
        list: 'mdi-clipboard-list-outline',
        detail: 'mdi-details',
        unfavorite: 'mdi-star-off'
    },
    document_definition: {
        delete: 'mdi-arrow-down-drop-circle-outline',
        create: 'mdi-folder-plus-outline',
        edit: 'mdi-file-document-edit-outline',
        submit: 'mdi-content-save-outline',
        drop: 'mdi-arrow-down-drop-circle-outline',
        restore: 'mdi-file-restore-outline',
        list: 'mdi-clipboard-list-outline',
        list_trash: 'mdi-playlist-remove',
        list_instance: 'mdi-file-document-multiple-outline',
        unfavorite: 'mdi-star-off',
        update_by_workflow: 'mdi-lan',
        import: 'mdi-file-upload-outline',
        clone: 'mdi-content-copy'
    },
    workflow_definition: {
        view: 'mdi-clipboard-list-outline',
        list: 'mdi-clipboard-list-outline',
        create: 'mdi-folder-plus-outline',
        deploy: 'mdi-rocket',
        drop: 'mdi-arrow-down-drop-circle-outline',
        update: 'mdi-note-plus-outline',
        list_instance: 'mdi-file-document-multiple-outline',
        start_instance: 'mdi-play-outline',
        unfavorite: 'mdi-star-off'
    },
    dashboard: {
        create: 'mdi-folder-plus-outline',
        update: 'mdi-note-plus-outline',
        view: 'mdi-eye-outline',
        list: 'clipboard-list-outline',
        drop: 'arrow-down-drop-circle-outline',
        unfavorite: 'mdi-star-off'
    }
};
export default {
    data: () => ({
        isShowContext: false,
        top: 0,
        left: 0,
        listAction: [],
        targetItem: {},
        type: '',
        appId: null,
        defineAction: {
            document_definition: {
                module: 'document',
                resource: 'document_definition',
                scope: 'document'
            },
            workflow_definition: {
                module: 'workflow',
                resource: 'workflow_definition',
                scope: 'workflow'
            },
            dashboard: {
                module: 'dashboard',
                resource: 'dashboard',
                scope: 'dashboard'
            },
            orgchart: {
                module: 'orgchart',
                resource: 'orgchart',
                scope: 'orgchart'
            }
        }
    }),
    created() {
        let self = this;
    },
    props: {
        sideBySide: {
            type: Boolean,
            default: false
        },
        allAppMode: {
            type: Boolean,
            default: false
        },
        instanceKey: {
            default: 0
        }
    },
    methods: {
        clickRow(item) {
            item.callback(item);
            this.hide();
        },
        show(e) {
            var windowHeight = $(window).height() / 1.5;
            var windowWidth = $(window).width() / 1.1;
            this.isShowContext = true;
            if (e.clientY > windowHeight && e.clientX <= windowWidth) {
                $('.context-menu')
                    .css('left', e.clientX)
                    .css('bottom', $(window).height() - e.clientY)
                    .css('right', 'auto')
                    .css('top', 'auto');
            } else if (e.clientY > windowHeight && e.clientX > windowWidth) {
                $('.context-menu')
                    .css('right', $(window).width() - e.clientX)
                    .css('bottom', $(window).height() - e.clientY)
                    .css('left', 'auto')
                    .css('top', 'auto');
            } else if (e.clientY <= windowHeight && e.clientX <= windowWidth) {
                $('.context-menu')
                    .css('left', e.clientX)
                    .css('top', e.clientY)
                    .css('right', 'auto')
                    .css('bottom', 'auto');
            } else {
                $('.context-menu')
                    .css('right', $(window).width() - e.clientX)
                    .css('top', e.clientY)
                    .css('left', 'auto')
                    .css('bottom', 'auto');
            }
            $('#symper-app').append(this.$el);
            if (this.type == 'document_definition') {
                this.listAction = this.listAction.filter((el) => {
                    return el != 'list' && el != 'print' && el != 'update';
                });
                if (this.listAction.length == 0) {
                    this.listAction = ['list_instance'];
                }
            }

            if (this.type == 'dashboard') {
                this.listAction = this.listAction.filter((el) => {
                    return el != 'export-data';
                });
            }
        },
        hide() {
            this.isShowContext = false;
        },
        calPosition(event) {},
        setContextItem(ctx) {
            if (this.type == 'orgchart') {
                ctx = ctx.filter((e) => {
                    return ![
                        'view_all',
                        'view_only_owner',
                        'view_only_sub'
                    ].includes(e);
                });
            }
            ctx = ctx.filter((e) => {
                return (
                    e != 'create' &&
                    e != 'submit_by_workflow' &&
                    e != 'view_instance' &&
                    e != 'run_instance' &&
                    e != 'stop_instance' &&
                    e != 'complete_instance' &&
                    e != 'delete_instance' &&
                    e != 'delete_related_doc' &&
                    e != 'share_tree_config' &&
                    e != 'share_filter' &&
                    e != 'share_conditonal_format'
                );
            });
            this.listAction = ctx;
        },
        setItem(item) {
            this.targetItem = item;
        },
        setType(type) {
            this.type = type;
        },
        setAppId(appId) {
            this.appId = appId;
        },
        changeUrl(action, sideBySide = false, allAppMode = false) {
            let hash = document.location.hash;
            if (sideBySide) {
                history.pushState(
                    { action: action },
                    '',
                    hash + `&action=${action}`
                );
            }
        },
        clickAction(
            action,
            sideBySide = false,
            allAppMode = false,
            changeUrl = true
        ) {
            if (changeUrl) {
                this.changeUrl(action, sideBySide, allAppMode);
            }
            if (this.type == 'document_definition' && action == 'import') {
                this.$evtBus.$emit('symper-app-document-definition-import', {
                    objId: this.targetItem.objectIdentifier.split(':')[1],
                    objType: 'document_definition',
                    subObjType: '1',
                    nameObj: this.targetItem.title
                });
                return;
            }
            if (action !== 'unfavorite') {
                this.$store.commit(
                    'appConfig/updateActiveChildItem',
                    this.targetItem.objectIdentifier
                );
            }
            $('.v-menu__content').css('display', 'none');
            let appId;
            if (allAppMode == true) {
                appId = this.appId;
            } else {
                appId = this.$store.state.appConfig.currentAppId;
            }
            this.defineAction[this.type].action = action;
            this.hide();
            for (let i in this.defineAction) {
                if (this.targetItem.objectIdentifier.includes(i + ':')) {
                    this.targetItem.id =
                        this.targetItem.objectIdentifier.replace(i + ':', '');
                }
            }
            let targetItem = this.targetItem;
            if (action == 'unfavorite') {
                let userId = this.$store.state.app.endUserInfo.id;
                appManagementApi
                    .addFavoriteItem(userId, this.targetItem.id, this.type, 0)
                    .then((res) => {
                        if (res.status == 200) {
                            this.$store.commit(
                                'appConfig/delFavorite',
                                this.targetItem
                            );
                            this.$emit('un-favorite-item', targetItem);
                        }
                    });
            }
            if (sideBySide == true) {
                this.$store.commit('appConfig/updateActionViewConfig', {
                    instanceKey: this.instanceKey,
                    actionViewConfig: {
                        actionDef: this.defineAction[this.type],
                        params: {
                            id: targetItem.id,
                            name: targetItem.name,
                            title: targetItem.title,
                            appId: appId
                        }
                    }
                });
            } else {
                this.$evtBus.$emit(
                    'symper-app-call-action-handler',
                    this.defineAction[this.type],
                    this,
                    {
                        id: targetItem.id,
                        name: targetItem.name,
                        title: targetItem.title,
                        appId: appId
                    }
                );
            }
        },
        reduce(action) {
            let str = this.type.concat('.').concat(action);
            let nameIcon = eval('mapIcons.' + str);
            let icon = ` <i class="mdi ${nameIcon}" style="padding-right:5px"></i>`;
            let name = this.$t('actions.listActions.' + str);
            let res = icon.concat(name);
            return res;
        }
    }
};
</script>
<style scoped>
.context-menu {
    position: fixed;
    z-index: 10000;
    width: 190px;
    font: 13px roboto;
    background-color: #fff;
    -webkit-box-shadow: 2px 0px 24px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 2px 0px 24px 0px rgba(0, 0, 0, 0.75);
    box-shadow: 2px 0px 24px 0px rgba(0, 0, 0, 0.75);
}
.context-menu >>> .context-menu-item {
    padding: 8px 10px;
    font-size: 13px;
    cursor: pointer;
    color: black;
    text-align: left;
    border-bottom: unset;
}
.context-menu >>> .context-menu-item:hover {
    background: #f7f7f7;
}
.context-menu >>> .v-icon {
    font-size: 13px;
}
</style>
