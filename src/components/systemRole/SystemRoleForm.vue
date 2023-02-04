<template>
    <div class="pl-5 pr-3 py-3 permission-form">
        <div
            class="mb-3 d-flex justify-space-between border-bottom pb-2 align-center"
        >
            <span class="title">
                <v-icon :size="15">mdi-account-circle-outline </v-icon>
                <span class="fs-15"> {{ title }}</span>
            </span>
            <span>
                <v-btn
                    v-show="action != 'detail'"
                    class="mr-1 mr-2"
                    @click="saveSystemRole"
                    small
                    :loading="loading"
                    depressed
                    color="primary"
                >
                    {{
                        action == 'create'
                            ? $t('common.save')
                            : $t('common.update')
                    }}
                </v-btn>
                <v-btn small icon text @click="close">
                    <v-icon :size="15" primary>mdi-close</v-icon>
                </v-btn>
            </span>
        </div>
        <div class="body">
            <FormTpl
                :viewOnly="action == 'detail'"
                :singleLine="false"
                :allInputs="allInputs"
            >
            </FormTpl>
            <div class="w-100 mt-1">
                <span class="fs-12 mb-2">{{
                    $t('permissions.select_user')
                }}</span>
            </div>
            <div class="w-100">
                <v-autocomplete
                    multiple
                    solo
                    dense
                    @change="calcPermissionHeight"
                    allow-overflow
                    chips
                    deletable-chips
                    small-chips
                    item-text="displayName"
                    item-value="id"
                    :items="allUser"
                    class="symper-autocomplete-input autocomplete-action selected-user mr-3"
                    v-model="itemData.users"
                >
                </v-autocomplete>
            </div>
            <div class="w-100">
                <div class="fs-12 mb-2" style="margin-top: -20px">
                    {{ $t('permissions.select_permissions') }}
                </div>
                <PermissionSelector
                    v-model="itemData.permissions"
                    :disabled="action == 'detail'"
                    :height="heightPermissionSelector"
                    :action="action"
                >
                </PermissionSelector>
            </div>
        </div>
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';
import UserSelector from '@/views/tasks/userSelector.vue';
import PermissionSelector from '@/components/permission/PermissionSelector.vue';
import ListUserSelector from '@/views/accessControl/actionPack/helpers/ListUserSelector';
import _debounce from 'lodash/debounce';
import RoleWorker from 'worker-loader!@/worker/accessControl/Role.Worker.js';

export default {
    methods: {
        async saveSystemRole() {
            this.loading = true;
            let dataToSave = {
                name: this.allInputs.name.value,
                description: this.allInputs.description.value,
                users: JSON.stringify(this.itemData.users),
                permissions: JSON.stringify(
                    this.itemData.permissions.reduce((arr, el) => {
                        arr.push(el.id);
                        return arr;
                    }, []),
                ),
            };

            if (this.action == 'update') {
                this.roleWorker.postMessage({
                    action: 'updateRole',
                    data: {
                        id: this.itemData.id,
                        dataToSave: dataToSave,
                    },
                });
            } else if (this.action == 'create') {
                this.roleWorker.postMessage({
                    action: 'createRole',
                    data: {
                        dataToSave: dataToSave,
                    },
                });
            }
        },
        close() {
            this.$emit('close');
            this.loading = false;
        },
        calcPermissionHeight() {
            let allBodyHeight = $('.permission-form').height();
            let selectUserHeight = $('.selected-user').height();
            this.heightPermissionSelector =
                allBodyHeight - selectUserHeight - 350 + 'px';
        },
    },
    components: {
        FormTpl,
        UserSelector,
        PermissionSelector,
        ListUserSelector,
    },
    computed: {
        allInputs() {
            return {
                name: {
                    title: this.$t('common.name'),
                    type: 'text',
                    value: this.itemData.name,
                    info: '',
                },
                description: {
                    title: this.$t('common.description'),
                    type: 'text',
                    value: this.itemData.description,
                    info: '',
                },
            };
        },
        allUser() {
            return this.$store.state.app.allUsers;
        },
        title() {
            return this.$t('permissions.user_role');
        },
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
    mounted() {
        let self = this;
        this.roleWorker = new RoleWorker();
        this.roleWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'updateRole':
                    if (data.dataAfter == 'success') {
                        self.$snotifySuccess(
                            self.$t('common.notification.add_success'),
                        );
                        self.loading = false;
                    } else {
                        self.$snotifyError(
                            self.$t('common.notification.error'),
                        );
                    }
                    self.$emit('saved-item-data');
                    break;
                case 'createRole':
                    if (data.dataAfter == 'success') {
                        self.$snotifySuccess(
                            self.$t('common.notification.add_success'),
                        );
                        self.loading = false;
                    } else {
                        self.$snotifyError(
                            self.$t('common.notification.error'),
                        );
                    }
                    self.$emit('saved-item-data');
                    break;
                default:
                    break;
            }
        });
    },
    data() {
        return {
            roleWorker: null,
            loading: false,
            heightPermissionSelector: 'calc(100vh - 350px)',
        };
    },
};
</script>

<style scoped>
.autocomplete-action >>> .v-input__slot {
    box-shadow: unset !important;
    background: #fbfbfb !important;
    border: 1px solid #f2f2f2 !important;
}

.autocomplete-action >>> .v-input__control {
    min-height: 26px !important;
}
.autocomplete-action >>> .v-chip__close {
    font-size: 14px !important;
}
.autocomplete-action >>> .v-input__slot {
    padding: 4px !important;
}
.v-list-item__action {
    margin: 0 !important;
}
.autocomplete-action >>> .theme--light.v-label {
    color: rgba(0, 0, 0, 0.6) !important;
}
.autocomplete-action >>> .v-select.v-input--dense .v-chip {
    margin: 0 4px 0 0;
}
.autocomplete-action >>> .v-input__slot {
    padding: 0 4px !important;
}
.autocomplete-action >>> .v-list-item__action:first-child {
    margin-right: 8px !important;
}
.autocomplete-action >>> .mdi-checkbox-marked {
    font-size: 18px !important;
}
</style>
