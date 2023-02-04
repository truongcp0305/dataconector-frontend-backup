<template>
    <div class="body h-100 update-tenant">
        <div>
            <div class="header d-flex">
                <span
                    v-if="isCreate"
                    class="fw-500 fs-13 pl-5"
                    style="line-height: 36px"
                    >{{ $t('tenantManager.addTenantTitle') }}</span
                >
                <v-tabs
                    v-else
                    v-model="tab"
                    color="orange"
                    style="flex-grow: 0"
                    :height="'35'"
                >
                    <v-tab href="#tab-1" class="tab">
                        <span small>{{ $t('tenantManager.information') }}</span>
                    </v-tab>
                    <v-tab href="#tab-2" class="tab">
                        <span small>{{ $t('tenantManager.bundleUsed') }}</span>
                    </v-tab>
                </v-tabs>
                <div class="header-btn d-flex">
                    <v-btn
                        v-if="disabled"
                        depressed
                        class="fs-13 btn-edit"
                        small
                        :color="'#FB7E00'"
                        dark
                        @click="editTenant"
                    >
                        {{ $t('tenantManager.edit') }}
                    </v-btn>
                    <v-btn
                        v-else
                        depressed
                        class="fs-13 btn-edit"
                        small
                        :loading="loading"
                        dark
                        :color="'success'"
                        @click="
                            isCreate ? setDataToCreate() : setDataToUpdate()
                        "
                    >
                        {{ $t('tenantManager.save') }}
                    </v-btn>
                    <v-icon class="btn-close ml-3 mr-3" @click="closePopup"
                        >mdi-close</v-icon
                    >
                </div>
            </div>
            <v-tabs-items v-model="tab" style="flex-grow: 1" class="h-100">
                <v-tab-item
                    :key="1"
                    :value="'tab-' + 1"
                    class="tab-item h-100 pl-5 pr-5 pt-4 pb-4"
                    style="flex-grow: 1"
                >
                    <TenantInfomation
                        ref="tenantInfo"
                        :disabled="disabled"
                        :tenantInfo="tenantInfo"
                        :accountInfo="accountInfo"
                        :logoName="logoName"
                        @change-logo="changeLogo"
                    />
                </v-tab-item>
                <v-tab-item
                    :key="2"
                    :value="'tab-' + 2"
                    class="tab-item h-100"
                    style="
                        flex-grow: 1;
                        min-width: 515px;
                        padding: 24px !important;
                    "
                >
                    <NotFoundScreen :emptyDataKey="'bundle-use-not-found'" />
                </v-tab-item>
            </v-tabs-items>
        </div>
    </div>
</template>

<script>
import NotFoundScreen from '@/components/common/NotFoundScreen';
import UploadFile from '@/components/common/UploadFile.vue';
import TenantInfomation from '@/views/tenantManagement/TenantInfomation.vue';
import { tenantApi } from '@/api/tenantManagement.js';

export default {
    components: {
        UploadFile,
        TenantInfomation,
        NotFoundScreen
    },
    data() {
        let self = this;
        return {
            tab: 'tab-1',
            avatarUrl: '',
            loading: false
        };
    },
    props: {
        disabled: {
            type: Boolean,
            default: true
        },
        data: {
            type: Object
        },
        isCreate: {
            type: Boolean
        },
        tenantInfo: {
            type: Object
        },
        accountInfo: {
            type: Object
        },
        logoName: {
            type: String,
            default: ''
        },
        open: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        closePopup() {
            this.tab = 'tab-1';
            this.resetValidate();
            this.$emit('close-popup');
        },
        resetValidate() {
            this.tenantInfo.name.validateStatus.isValid = true;
            this.tenantInfo.name.validateStatus.message = '';
            this.tenantInfo.code.validateStatus.isValid = true;
            this.tenantInfo.code.validateStatus.message = '';
            this.accountInfo.email.validateStatus.isValid = true;
            this.accountInfo.email.validateStatus.message = '';
            this.accountInfo.password.validateStatus.isValid = true;
            this.accountInfo.password.validateStatus.message = '';
        },
        editTenant() {
            this.$emit('edit-tenant');
        },
        setDataToUpdate() {
            this.loading = true;
            let data = this.data;
            data.name = this.tenantInfo.name.value;
            data.code = this.tenantInfo.code.value;
            data.emailBA = this.accountInfo.email.value;
            data.status = this.tenantInfo.active.value;
            this.updateTenant(data);
        },

        async updateTenant(data) {
            let validate = this.validateForm('update');
            if (validate) {
                let dataPost = {
                    id: data.id,
                    code: data.code
                };
                let res = await tenantApi.checkExistCode(dataPost);
                if (res.status == 200) {
                    let res = await tenantApi.update(data.id, data);
                    if (res.status == 200) {
                        this.$snotifySuccess(
                            this.$t('tenantManager.updateTenantSuccess')
                        );
                        this.closePopup();
                    } else {
                        this.$snotify({
                            type: 'error',
                            title: this.$t('tenantManager.updateTenantFail'),
                            text: res.messgage
                        });
                    }
                    this.$emit('refresh-list');
                } else {
                    this.$snotify({
                        type: 'error',
                        title: this.$t('tenantManager.codeExist')
                    });
                }
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('tenantManager.invalidateForm')
                });
            }
            this.loading = false;
        },
        changeLogo(obj) {
            this.$emit('change-logo', obj);
        },
        setDataToCreate() {
            this.loading = true;
            this.data.name = this.tenantInfo.name.value;
            this.data.code = this.tenantInfo.code.value;
            this.data.emailBA = this.accountInfo.email.value;
            this.data.password = this.accountInfo.password.value;
            this.data.status = this.tenantInfo.active.value;
            this.createTenant(this.data);
        },
        validateForm(action) {
            if (action == 'create')
                if (
                    this.accountInfo.password.value == '' ||
                    this.accountInfo.password.value.trim() == '' ||
                    !this.accountInfo.password.validateStatus.isValid
                )
                    return false;

            if (
                this.tenantInfo.name.value == '' ||
                this.tenantInfo.name.value.trim() == '' ||
                this.tenantInfo.code.value == '' ||
                this.tenantInfo.code.value.trim() == '' ||
                this.accountInfo.email.value == '' ||
                this.accountInfo.email.value.trim() == ''
            )
                return false;

            if (
                !this.tenantInfo.name.validateStatus.isValid ||
                !this.tenantInfo.code.validateStatus.isValid ||
                !this.accountInfo.email.validateStatus.isValid
            )
                return false;

            return true;
        },
        async createTenant(data) {
            let validate = this.validateForm('create');
            if (validate) {
                let dataPost = {
                    id: 0,
                    code: data.code
                };
                let res = await tenantApi.checkExistCode(dataPost);
                if (res.status == 200) {
                    let res = await tenantApi.create(data);
                    if (res.status == 200) {
                        this.$snotifySuccess(
                            this.$t('tenantManager.createTenantSuccess')
                        );
                        this.closePopup();
                    } else {
                        this.$snotify({
                            type: 'error',
                            title: this.$t('tenantManager.createTenantFail'),
                            text: res.message
                        });
                    }
                    this.$emit('refresh-list');
                } else {
                    this.$snotify({
                        type: 'error',
                        title: this.$t('tenantManager.codeExist')
                    });
                }
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t('tenantManager.invalidateForm')
                });
            }
            this.loading = false;
        }
    }
};
</script>

<style scoped>
.update-tenant {
    color: #1b1b1b !important;
    position: relative;
    background-color: white !important;
}
.update-tenant >>> .v-tab {
    padding: 0 !important;
    margin-left: 16px;
    text-transform: none !important;
    font-size: 13px !important;
}
.update-tenant >>> .btn-close {
    padding: 4px;
    cursor: pointer;
    color: #1b1b1b;
    font-size: 18px !important;
}
.update-tenant >>> .btn-close:hover {
    border-radius: 4px !important;
}
.update-tenant >>> .header {
    justify-content: space-between;
}
.update-tenant >>> .header-btn {
    align-items: center;
}
.update-tenant >>> .btn-edit .span {
    color: white !important;
}
.update-tenant >>> .header {
    height: 36px;
    border-bottom: 1px solid #b5b5b5;
}
.update-tenant >>> img.notFoundScreen {
    width: 300px;
    height: 165.5px;
}
.update-tenant >>> .not-found-screen span {
    font-size: 13px !important;
}
</style>