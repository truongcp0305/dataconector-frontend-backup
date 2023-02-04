<template>
    <div class="px-2 h-100">
        <div class="title py-2 w-100">
            {{ panelTitle }}

            <v-btn icon class="float-right" @click="$emit('close')">
                <i class="mdi mdi-close fs-16"></i>
            </v-btn>
        </div>
        <FormTpl
            ref="comonAttr"
            :viewOnly="action == 'detail'"
            :singleLine="false"
            :allInputs="allInputs"
            @input-value="changeValue"
        >
        </FormTpl>
        <v-alert
            class="my-3"
            icon="mdi-account-plus-outline"
            prominent
            text
            type="info"
        >
            <div class="blue--text text--darken-4 fs-12">
                <div class="mb-1">
                    {{$t('v2.account.messageAfterCreateUserAccount')}}
                </div>
                <span
                    style="width: 70px; display: inline-block"
                    class="ml-4 font-weight-medium"
                    >{{$t('v2.account.email')}}
                </span>
                <span>{{ email }}</span
                ><br />
                <span
                    style="width: 70px; display: inline-block"
                    class="ml-4 font-weight-medium"
                    >{{$t('v2.account.password')}}
                </span>
                UserSymper@123
            </div>
        </v-alert>
        <div class="mt-2" v-if="action != 'view'">
            <v-btn
                class="float-right mr-1"
                small
                depressed
                color="primary"
                @click="saveBAAccount"
            >
                <v-icon class="mr-2" primary>mdi-content-save</v-icon>
                {{
                    action == 'create' ? $t('common.save') : $t('common.update')
                }}
            </v-btn>
        </div>
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';
import { util } from '../../plugins/util';
import { userApi } from '../../api/user';

export default {
    mounted() {
        this.tableHeight =
            util.getComponentSize(this).h -
            util.getComponentSize(this.$refs.comonAttr).h -
            180;
    },
    created() {},
    methods: {
        changeValue(key, data, value) {
            if (key == 'email') {
                this.email = value;
            }
        },
        async saveBAAccount() {
            let dataToSave = {};
            if (this.action == 'update') {
                dataToSave.email = this.allInputs.email.value;
                dataToSave.fullname = this.allInputs.name.value;
                let isValidValue = this.validateUserInfo(dataToSave);
                if (isValidValue) {
                    let res = await userApi.updateBAAccountInfo(
                        this.itemData.id,
                        dataToSave,
                    );
                    if (res.status == 200) {
                        this.$snotifySuccess(this.$t('v2.account.updateBAAccountSuccessfully'));
                    } else {
                        this.$snotifyError(res, this.$t('v2.account.canNotUpdateBAAccount'));
                    }
                }
            } else if (this.action == 'updatePassword') {
                dataToSave.newPassword = this.allInputs.newPassword.value;
                dataToSave.oldPassword = this.allInputs.oldPassword.value;
                dataToSave.confirmNewPassword =
                    this.allInputs.confirmNewPassword.value;
                let isValidValue = this.validatePassword(dataToSave);
                if (isValidValue) {
                    let res = await userApi.changePassBA(
                        dataToSave.oldPassword,
                        dataToSave.newPassword,
                    );
                    if (res.status == 200) {
                        this.$snotifySuccess(this.$t('v2.account.updateBAPasswordSuccessfully'));
                    } else {
                        this.$snotifyError(res, this.$t('v2.account.canNotUpdateBAPassword'));
                    }
                }
            } else if (this.action == 'create') {
                dataToSave.email = this.allInputs.email.value;
                dataToSave.fullname = this.allInputs.name.value;
                dataToSave.password = this.allInputs.password.value;

                let isValidValue = this.validateUserInfo(dataToSave);
                if (isValidValue) {
                    let res = await userApi.createBAAccount(dataToSave);
                    if (res.status == 200) {
                        this.$snotifySuccess(this.$t('v2.account.createBAPasswordSuccessfully'));
                    } else {
                        this.$snotifyError(res, this.$t('v2.account.canNotCreateBAAccount'));
                    }
                }
            }
            this.$emit('saved-item-data');
        },

        validatePassword(data) {
            let rsl = true;
            if (data.confirmNewPassword != data.newPassword) {
                rsl = false;
                this.$snotifyError({}, this.$t('v2.account.newPasswordNotMatch'));
            }
            return rsl;
        },

        validateUserInfo(data) {
            let rsl = true;
            for (let key in data) {
                if (data[key].trim() == '') {
                    rsl = false;
                    this.$snotifyError({}, key + this.$t('v2.account.canNotBeEmpty'));
                }
            }

            if (
                data.email.trim() != '' &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
            ) {
                rsl = false;
                this.$snotifyError({}, this.$t('v2.account.emailIsNotValid'));
            }
            return rsl;
        },
        handleEditorShow(data) {
            this.isEditingCell = data;
        },
    },
    data() {
        let self = this;
        return {
            tableHeight: 200,
            email: '',
        };
    },
    components: {
        FormTpl,
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
        panelTitle: {
            type: String,
            default:SYMPER_APP.$t('v2.account.addNewBaAccount'),
        },
    },
    computed: {
        allInputs() {
            if (this.action == 'updatePassword') {
                return {
                    oldPassword: {
                        title: this.$t(
                            'user.passwordSetting.changePassword.oldPassword',
                        ),
                        type: 'text',
                        value: '',
                        info: '',
                    },
                    newPassword: {
                        title: this.$t(
                            'user.passwordSetting.changePassword.newPass',
                        ),
                        type: 'text',
                        value: '',
                        info: '',
                    },
                    confirmNewPassword: {
                        title: this.$t(
                            'user.passwordSetting.changePassword.reNewPass',
                        ),
                        type: 'text',
                        value: '',
                        info: '',
                    },
                };
            } else {
                let rsl = {
                    name: {
                        title: this.$t('common.name'),
                        type: 'text',
                        value: this.itemData.name,
                        info: '',
                    },
                    email: {
                        title: this.$t('common.email'),
                        type: 'text',
                        value: this.itemData.email,
                        info: '',
                    },
                };

                if (this.action == 'create') {
                    rsl.password = {
                        title: this.$t('login.input_text.password'),
                        type: 'text',
                        value: '',
                        info: '',
                    };
                }
                return rsl;
            }
        },
    },
};
</script>

<style></style>
