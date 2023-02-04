<template>
    <div class="update-app-symper">
        <v-card-title class="pt-0 pb-2 subtitle-1">
            <v-icon class="pr-4">mdi-apps</v-icon>
            {{ !!!isEdit ? $t('apps.addApp') : $t('apps.editApp') }}
            <v-icon
                class="close-btn float-right"
                style="position: absolute; right: 8px; top: 8px"
                @click="closeForm"
                >mdi-close</v-icon
            >
        </v-card-title>
        <v-divider></v-divider>
        <v-card-title class="pt-3 pb-0 subtitle-2 font-weight-bold">
            <p>{{ $t('apps.commonInfo') }}</p>
        </v-card-title>
        <v-card-text>
            <v-row>
                <v-col cols="9" class="pt-0 pb-0 pr-0">
                    <v-row>
                        <v-col class="pt-0 pb-2" cols="4">
                            {{ $t('apps.header.name') }}
                        </v-col>
                        <v-col class="pt-0 pb-2" cols="8">
                            <v-text-field
                                v-model.lazy="currentApp.name"
                                class="sym-small-size bg-grey"
                                dense
                                solo
                                flat
                                required
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="pt-0 pb-2" cols="4">
                            {{ $t('apps.header.note') }}
                        </v-col>
                        <v-col class="pt-0 pb-2" cols="8">
                            <v-textarea
                                v-model.lazy="currentApp.description"
                                dense
                                solo
                                flat
                                rows="2"
                                class="caption bg-grey"
                                hide-details="true"
                            ></v-textarea>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="pt-3 pb-2" cols="3">
                            {{ $t('apps.header.status') }}
                        </v-col>
                        <v-col class="pt-0 pb-0" cols="9">
                            <v-checkbox
                                v-model.lazy="currentApp.status"
                                :checked="currentApp.status == 1"
                                dense
                                class="mt-2 ml-0"
                                color="success"
                                value="1"
                                hide-details
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="3" class="pt-0 pb-0 pl-0">
                    <v-row>
                        <v-col class="pt-0 pb-2" cols="4"> </v-col>
                        <v-col class="pt-0 pb-2 text-center" cols="8">
                            <v-icon
                                v-if="
                                    !!currentApp.iconName &&
                                    currentApp.iconName.indexOf('mdi-') > -1
                                "
                                class="display-3 pt-0"
                                >{{ currentApp.iconName }}</v-icon
                            >
                            <img
                                v-else-if="
                                    !!currentApp.iconName &&
                                    currentApp.iconName.indexOf('mdi-') < 0
                                "
                                :src="currentApp.iconName"
                                width="90"
                            />
                            <iconPicker
                                ref="iconPicker"
                                :icon="currentApp.iconName"
                                @selected="pickIcon"
                            ></iconPicker>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-row>
            <v-col cols="7">
                <v-card-title class="pb-2 pt-2 subtitle-2 font-weight-bold">
                    {{ $t('apps.listObjects') }}
                </v-card-title>
            </v-col>
            <v-col cols="5">
                <v-menu
                    offset-y
                    :close-on-content-click="false"
                    :nudge-width="390"
                >
                    <template v-slot:activator="{ attrs, on }">
                        <v-btn
                            class="button-add-item"
                            style="backgound-color: #f7f7f7"
                            v-bind="attrs"
                            v-on="on"
                            @click="setActiveItem"
                        >
                            <span> {{ $t('apps.clickToAdd') }} </span>
                            <v-icon
                                right
                                dark
                                style="
                                    border-left: 2px solid lightgrey;
                                    padding-left: 8px;
                                "
                                >mdi-plus</v-icon
                            >
                        </v-btn>
                    </template>
                    <SearchModal
                        ref="searchModal"
                        @selectedItem="selectedItem"
                    />
                </v-menu>
            </v-col>
        </v-row>
        <AppDetailVue />
        <v-btn
            small
            color="primary"
            style="margin-bottom: 24px"
            class="btn-fixed-bottom update-btn"
            @click="debounceAddApp"
            :disabled="!!!currentApp.name"
        >
            <v-icon class="mr-2">mdi-content-save-outline</v-icon>
            {{ isEdit ? $t('common.save') : $t('common.add') }}
        </v-btn>
    </div>
</template>
<script>
import iconPicker from '@/components/common/iconPicker';
import SearchModal from './SearchModal.vue';
import AppDetailVue from './AppDetail.vue';
import _debounce from 'lodash/debounce';
import ApplicationWorker from 'worker-loader!@/worker/application/Application.Worker.js';

export default {
    name: 'UpdateApp',
    components: {
        iconPicker,
        SearchModal,
        AppDetailVue,
    },
    created() {},
    props: {
        isEdit: {
            type: Boolean,
            default: false,
        },
    },
    watch: {},
    computed: {
        sApp() {
            return this.$store.state.appConfig.listItemSelected;
        },
    },
    data: function () {
        return {
            applicationWorker: null,
            currentApp: {
                name: '',
                description: '',
                iconName: '',
                iconType: '',
                status: false,
            },
            childrenApp: {
                document_definition: [],
                orgchart: [],
                dashboard: [],
                workflow_definition: [],
            },
            listSelectedItem: {},
            isFirstTime: true,
        };
    },
    mounted() {
        let self = this;
        this.applicationWorker = new ApplicationWorker();
        this.applicationWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'updateApp':
                    self.$emit('update-app', data.dataAfter);
                    break;
                case 'createApp':
                    self.$emit('add-app', data.dataAfter);
                    break;
                default:
                    break;
            }
        });
    },
    methods: {
        setActiveItem() {
            if (!this.isFirstTime) {
                this.$refs.searchModal.setActiveItem(this.sApp);
            } else {
                this.isFirstTime = false;
            }
        },
        closeForm() {
            if (this.$refs.searchModal) {
                this.$refs.searchModal.clearSelectedItem();
            }
            this.$emit('close-app-form');
        },
        setAppObject(app) {
            this.currentApp = JSON.parse(JSON.stringify(app));
        },
        pickIcon(data) {
            this.$set(this.currentApp, 'iconName', data.icon.trim());
            this.$set(this.currentApp, 'iconType', data.type);
        },
        selectedItem(data) {
            this.listSelectedItem = data;
        },
        debounceAddApp: _debounce(
            function (e) {
                this.addApp();
                if (this.$refs.searchModal) {
                    this.$refs.searchModal.clearSelectedItem();
                }
            },
            300,
            this,
        ),
        addApp() {
            if (this.isEdit) {
                this.updateApp();
            } else {
                this.createApp();
            }
        },
        showError() {
            this.$snotify({
                type: 'success',
                title: this.$t('notification.errorTitle'),
                text: this.$t('notification.error'),
            });
        },
        createApp() {
            let self = this;
            this.applicationWorker.postMessage({
                action: 'createApp',
                data: {
                    listItemSelected:
                        self.$store.state.appConfig.listItemSelected,
                    childrenAppData: self.childrenApp,
                    currentAppData: self.currentApp,
                },
            });
        },
        updateApp() {
            if (this.currentApp.hasOwnProperty('childrenApp')) {
                delete this.currentApp.childrenApp;
            }
            if (this.currentApp.status === null) {
                this.currentApp.status = 0;
            }
            let self = this;
            this.applicationWorker.postMessage({
                action: 'updateApp',
                data: {
                    listItemSelected:
                        self.$store.state.appConfig.listItemSelected,
                    childrenAppData: self.childrenApp,
                    currentAppData: self.currentApp,
                },
            });
        },
    },
};
</script>
<style scoped>
.pb-2.col.col-3 {
    height: 20px;
    font-size: 13px;
    text-shadow: 0 0 0;
}
.button-add-item {
    border: 1px solid lightgray;
    text-shadow: unset;
    box-shadow: unset;
    float: right;
}
.update-app-symper >>> .button-add-item .v-btn__content {
    font: 13px Roboto !important;
}
.update-app-symper >>> .row {
    margin: unset !important;
}
.update-app-symper >>> .v-card__title {
    font-weight: 410 !important;
}
.update-app-symper >>> .empty-item-list {
    width: 140px;
    margin-left: auto;
    margin-right: auto;
    opacity: 0.2;
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}
.update-app-symper >>> .empty-item-list .empty-item-list-icon {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}
.update-app-symper >>> .empty-item-list .v-icon {
    font-size: 40px;
}
.text-shadow {
    font-size: 13px;
    text-shadow: 0 0 0;
}

.v-input.v-textarea >>> .v-input__control .v-input__slot textarea {
    line-height: 18px;
}
.search-wrap {
    position: relative;
}
.search-results {
    position: absolute;
    top: 30px;
    left: 10px;
    border-radius: 2px;
    background-color: #fff;
    z-index: 100;
    border: 1px solid #dedede;
    width: calc(100% - 20px);
    max-height: 400px;
    overflow: auto;
}
.list-app-object >>> .v-list-group__header,
.search-results >>> .v-list-group__header {
    padding-left: 0 !important;
    text-transform: capitalize;
    margin-bottom: 0 !important;
}
.list-app-object >>> .v-list-group__items .v-list-item,
.search-results >>> .v-list-group__items .v-list-item {
    padding-left: 30px !important;
    padding-right: 0;
    margin-bottom: 0 !important;
    cursor: pointer;
}
.list-app-object >>> .v-list-group__items .v-list-item .v-list-item__action,
.search-results >>> .v-list-group__items .v-list-item .v-list-item__action,
.list-app-object >>> .v-list--dense .v-list-item .v-list-item__icon,
.search-results >>> .v-list--dense .v-list-item .v-list-item__icon {
    margin-top: 0;
    margin-bottom: 0;
}
.list-app-object >>> .v-list--dense .v-list-item .v-list-item__icon,
.search-results >>> .v-list--dense .v-list-item .v-list-item__icon {
    margin-right: 8px;
}
.list-app-object >>> .v-list-item__content,
.search-results >>> .v-list-item__content {
    padding-top: 0;
    padding-bottom: 0;
}
.list-app-object >>> .v-list-group__items .v-list-item .v-list-item__action {
    display: none;
}
.list-app-object
    >>> .v-list-group__items
    .v-list-item:hover
    .v-list-item__action {
    display: block;
}
.list-app-object >>> .v-navigation-drawer__content .update-btn {
    /* display: block; */
    margin-bottom: 20px;
}
.v-menu__content {
    background: #fff;
}
.v-list-item:hover {
    background: #f5f5f5;
}
</style>
