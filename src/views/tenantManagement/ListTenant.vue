<template>
    <div class="h-100 w-100 list-tenant">
        <ListItems
            ref="listTenant"
            :getDataUrl="apiUrl"
            :headerPrefixKeypath="'tenantManager.header'"
            :pageTitle="$t('tenantManager.listTenant')"
            :containerHeight="tableHeight"
            :tableContextMenu="tableContextMenu"
            :useDefaultContext="false"
            :flexMode="true"
            :showExportButton="false"
            :customAPIResult="customAPIResult"
            :emptyDataKey="'tenant-list'"
            :useActionPanel="false"
            @on-add-item-clicked="addTenant"
        >
        </ListItems>
        <v-dialog v-model="popupTenantForm" persistent width="fit-content">
            <TenantForm
                v-if="popupTenantForm"
                ref="updateTenant"
                :disabled="disabled"
                @edit-tenant="editTenant"
                @close-popup="closePopup"
                :data="data"
                :isCreate="isCreate"
                :tenantInfo="tenantInfo"
                :accountInfo="accountInfo"
                :logoName="data.logoId ? data.logoId : ''"
                :open="open"
                @refresh-list="refreshList"
                @change-logo="changeLogo"
            ></TenantForm>
        </v-dialog>
    </div>
</template>
<script>
import ListItems from '@/components/common/ListItems';
import TenantForm from '@/views/tenantManagement/TenantForm.vue';
import { util } from '@/plugins/util.js';
import { appConfigs } from '@/configs';
import { tenantApi } from '@/api/tenantManagement.js';
export default {
    components: {
        ListItems,
        TenantForm
    },
    data: function () {
        let self = this;
        return {
            isCreate: false,
            tableHeight: 0,
            popupTenantForm: false,
            disabled: true,
            data: {},
            open: false,
            dataInput: {
                name: '',
                code: '',
                emailBA: '',
                password: '',
                logoId: '',
                status: '0'
            },
            tenantInfo: {
                name: {
                    title: self.$t('tenantManager.name'),
                    type: 'text',
                    value: '',
                    required: true,
                    placeholder: self.$t('tenantManager.namePlaceholder'),
                    disabled: false,
                    validateStatus: {
                        isValid: true,
                        message: ''
                    },
                    validate() {
                        this.validateStatus.isValid = true;
                        this.validateStatus.message = '';
                        if (this.value == '' || this.value.trim() == '') {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message = self.$t(
                                'tenantManager.nameRequired'
                            );
                        } else if (this.value.length > 256) {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message = self.$t(
                                'tenantManager.invalidName'
                            );
                        }
                    }
                },
                code: {
                    title: self.$t('tenantManager.code'),
                    type: 'text',
                    value: '',
                    required: true,
                    placeholder: self.$t('tenantManager.codePlaceholder'),
                    disabled: false,
                    validateStatus: {
                        isValid: true,
                        message: ''
                    },
                    validate() {
                        this.validateStatus.isValid = true;
                        this.validateStatus.message = '';
                        if (this.value == '' || this.value.trim() == '') {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message = self.$t(
                                'tenantManager.codeRequired'
                            );
                        } else if (this.value.length > 12) {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message = self.$t(
                                'tenantManager.invalidateCode'
                            );
                        } else if (
                            !/(^[a-z]+$)|(^[a-z]+([a-z0-9\-])*([a-z0-9])+$)/.test(
                                this.value
                            )
                        ) {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message = self.$t(
                                'tenantManager.incorrectCode'
                            );
                        }
                    }
                },
                active: {
                    type: 'checkbox',
                    value: null,
                    label: this.$t('tenantManager.activeTenant'),
                    customStyle: {
                        'margin-left': '102px'
                    }
                }
            },
            accountInfo: {
                email: {
                    title: this.$t('tenantManager.email'),
                    type: 'text',
                    value: '',
                    required: true,
                    placeholder: this.$t('tenantManager.emailPlaceholder'),
                    disabled: false,
                    validateStatus: {
                        isValid: true,
                        message: ''
                    },
                    validate() {
                        this.validateStatus.isValid = true;
                        this.validateStatus.message = '';
                        if (this.value == '' || this.value.trim() == '') {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message = self.$t(
                                'tenantManager.emailRequired'
                            );
                        } else if (
                            !/^\s*(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/.test(
                                this.value
                            )
                        ) {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message = self.$t(
                                'v2.account.emailNotValidate'
                            );
                        }
                    }
                },
                password: {
                    title: this.$t('tenantManager.password'),
                    type: 'password',
                    value: '',
                    required: true,
                    placeholder: this.$t('tenantManager.passwordPlaceholder'),
                    hidden: false,
                    validateStatus: {
                        isValid: true,
                        message: ''
                    },
                    validate() {
                        this.validateStatus.isValid = true;
                        this.validateStatus.message = '';
                        if (this.value == '' || this.value.trim() == '') {
                            this.validateStatus.isValid = false;
                            this.validateStatus.message = self.$t(
                                'tenantManager.passRequired'
                            );
                        }
                    }
                }
            },
            tableContextMenu: {
                edit: {
                    name: 'edit',
                    text: this.$t('common.edit'),
                    callback: async (obj, callback) => {
                        await self.getTenant(obj);
                        self.isCreate = false;
                        self.editTenant();
                    }
                },
                detail: {
                    name: 'detail',
                    text: this.$t('common.detail'),
                    callback: async (obj, callback) => {
                        await self.getTenant(obj);
                        self.isCreate = false;
                        self.viewTenant();
                    }
                },
                delete: {
                    name: 'delete',
                    text: this.$t('common.delete'),
                    callback: async (obj, refreshList) => {
                        let res = await tenantApi.delete(obj[0].id);
                        if (res.status == 200) {
                            self.$snotifySuccess(
                                self.$t('tenantManager.deleteTenantSuccess')
                            );
                            refreshList();
                        } else {
                            self.$snotify({
                                type: 'error',
                                title: self.$t(
                                    'tenantManager.deleteTenantError'
                                )
                            });
                        }
                    }
                }
            },
            apiUrl: appConfigs.apiDomain.tenantManagement + 'tenant',
            customAPIResult: {
                reformatData(res) {
                    let column = res.data.column;
                    column.map((e) => {
                        if (e.name == 'status') {
                            e.cellRenderer = function (params) {
                                let newValue =
                                    params.value == 1
                                        ? self.$t('tenantManager.active')
                                        : self.$t('tenantManager.inActive');
                                return '<span>' + newValue + '</span>';
                            };
                        } else if (e.name == 'createdAt') {
                            e.cellRenderer = function (params) {
                                let newValue = params.value.slice(
                                    0,
                                    params.value.length - 1
                                );
                                return '<span>' + newValue + '</span>';
                            };
                        } else if (e.name == 'updatedAt') {
                            e.cellRenderer = function (params) {
                                let newValue = params.value.slice(
                                    0,
                                    params.value.length - 1
                                );
                                return '<span>' + newValue + '</span>';
                            };
                        }
                    });
                    return {
                        columns: column,
                        listObject: res.data.listObject,
                        total: res.data.total
                    };
                }
            }
        };
    },
    methods: {
        refreshList() {
            this.$refs.listTenant.refreshList();
        },
        changeLogo(obj) {
            let data = obj.serverPath.split('/');
            this.data.logoId = data[data.length - 1];
        },
        addTenant() {
            this.popupTenantForm = true;
            this.disabled = false;
            this.isCreate = true;
            this.setData(this.dataInput, false);
            this.accountInfo.password.hidden = false;
            this.accountInfo.email.disabled = false;
            this.tenantInfo.code.disabled = false;
            this.data.logoId = '';
            this.open = true;
        },
        closePopup() {
            this.open = false;
            this.popupTenantForm = false;
        },
        editTenant() {
            this.setData(this.data, false);
            this.accountInfo.password.hidden = true;
            this.accountInfo.email.disabled = true;
            this.disabled = false;
            this.popupTenantForm = true;
            this.open = true;
        },

        setData(data, disabled) {
            this.tenantInfo.name.value = data.name;
            this.tenantInfo.name.disabled = disabled;
            this.tenantInfo.code.value = data.code;
            this.tenantInfo.code.disabled = true;
            this.accountInfo.email.value = data.emailBA;
            this.accountInfo.password.value = '';
            this.tenantInfo.active.value = data.status == 1 ? true : null;
            this.tenantInfo.active.disabled = disabled;
        },
        viewTenant() {
            this.setData(this.data, true);
            this.accountInfo.password.hidden = true;
            this.accountInfo.email.disabled = true;
            this.popupTenantForm = true;
            this.disabled = true;
            this.open = true;
        },
        async getTenant(obj) {
            let res = await tenantApi.getDetail(obj.id);
            if (res.status == 200) {
                this.data = res.data;
            } else if (res.status == 404) {
                this.$snotify({
                    type: 'error',
                    title: this.$t('tenantManager.permissionDenied')
                });
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('tenantManager.tenantNotFound')
                });
            }
        }
    },
    mounted() {
        this.tableHeight = util.getComponentSize(this).h;
    }
};
</script>