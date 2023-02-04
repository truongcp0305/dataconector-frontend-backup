<template>
    <div class="pl-5 pr-1">
        <div
            class="d-flex justify-space-between py-2 border-grey border-bottom align-center"
        >
            <span class="title">
                <v-icon :size="18" class="mr-2"
                    >mdi-shield-account-variant-outline</v-icon
                >
                <span class="15 mr-2"> {{$t('v2.acessControl.permission')}} </span>
                <v-icon :size="18" @click="hideInfo = false"
                    >mdi-information-outline</v-icon
                >
            </span>
            <span>
                <v-btn
                    v-show="action != 'detail'"
                    class="mr-1"
                    @click="savePermission"
                    small
                    :loading="isloading"
                    depressed
                    color="primary"
                >
                    {{
                        action == 'create'
                            ? $t('common.save')
                            : $t('common.update')
                    }}
                </v-btn>
                <v-icon :size="15" class="close-btn" @click="close()"
                    >mdi-close</v-icon
                >
            </span>
        </div>
        <div class="overflow-scroll">
            <SymperAlert
                class="mt-2"
                v-show="!hideInfo"
                :context="infoPermission"
                @hide="hideInfo = true"
            />
            <FormTpl
                :viewOnly="action == 'detail'"
                :singleLine="false"
                :allInputs="allInputs"
            >
            </FormTpl>
            <div class="w-100">
                <span class="fs-12 mb-3"
                    >{{ $t('common.select') }} {{$t('v2.acessControl.actionPack')}} </span
                >
                <ActionPackSelector
                    v-model="itemData.actionPacks"
                    :action="action"
                >
                </ActionPackSelector>
            </div>
        </div>
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';
import UserSelector from '@/views/tasks/userSelector.vue';
import ActionPackSelector from '@/components/permission/ActionPackSelector.vue';
import PermissionWorker from 'worker-loader!@/worker/accessControl/Permission.Worker.js';
import _debounce from 'lodash/debounce';
import SymperAlert from '@/components/common/SymperAlert.vue';
export default {
    methods: {
        close() {
            this.refreshData();
            this.$emit('close-form');
        },
        refreshData() {
            this.allInputs.name.value = '';
            this.allInputs.description.value = '';
        },
        async savePermission() {
            this.isloading = true;
            let listActionPacks = this.itemData.actionPacks.reduce(
                (arr, el) => {
                    arr.push(el.id);
                    return arr;
                },
                [],
            );

            let dataToSave = {
                name: this.allInputs.name.value,
                type: 'ba',
                description: this.allInputs.description.value,
                listActionPacks: JSON.stringify(listActionPacks),
            };
            if (this.action == 'update') {
                this.permissionWorker.postMessage({
                    action: 'updatePermission',
                    data: {
                        id: this.itemData.id,
                        dataToSave: dataToSave,
                    },
                });
            } else if (this.action == 'create') {
                this.permissionWorker.postMessage({
                    action: 'createPermission',
                    data: {
                        dataToSave: dataToSave,
                    },
                });
            }
        },
    },
    components: {
        FormTpl,
        UserSelector,
        ActionPackSelector,
        SymperAlert,
    },
    props: {
        itemData: {
            type: Object,
            default() {
                return {};
            },
        },
        action: {
            type: String,
            default: '',
        },
    },
    watch: {
        itemData: {
            deep: true,
            handler(val) {
                const self = this;
                self.allInputs.name.value = this.itemData.name;
                self.allInputs.description.value = this.itemData.description;
            },
        },
    },
    created() {
        this.permissionWorker = new PermissionWorker();
    },
    mounted() {
        let self = this;
        this.permissionWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'createPermission':
                    if (data.dataAfter == 'success') {
                        self.$snotifySuccess(
                            self.$t('common.notification.add_success'),
                        );
                    } else {
                        self.$snotifyError(
                            self.$t('common.notification.error'),
                        );
                    }
                    self.isloading = false;
                    self.$emit('saved-item-data');
                    self.refreshData();
                    break;
                case 'updatePermission':
                    if (data.dataAfter == 'success') {
                        self.$snotifySuccess(
                            self.$t('common.notification.update_success'),
                        );
                    } else {
                        self.$snotifyError(
                            self.$t('common.notification.error'),
                        );
                    }
                    self.isloading = false;
                    self.$emit('saved-item-data');
                    self.refreshData();
                    break;
                default:
                    break;
            }
        });
    },
    data() {
        return {
            permissionWorker: null,
            hideInfo: false,
            infoPermission: this.$t('v2.acessControl.permissionIsCollectionOfActionPacks'),
            isloading: false,
            allInputs: {
                name: {
                    title: this.$t('common.name'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                description: {
                    title: this.$t('common.description'),
                    type: 'text',
                    value: '',
                    info: '',
                },
            },
        };
    },
};
</script>

<style></style>
