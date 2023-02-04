<template>
    <v-card class="w-100 h-100">
        <v-row class="w-100 h-100">
            <v-row class="fs-14 ml-4 mt-2 w-100">
                <span class="ml-3" style="font-weight: 430">{{
                    $t(
                        'user.passwordSetting.changePassword.changeLoginPassword'
                    )
                }}</span>
            </v-row>
            <v-row class="fs-11 fm ml-7" style="color: rgb(0, 0, 0, 0.4)">
                {{ $t('validate.maxAndMin') }}
            </v-row>
            <v-col class="col-md-5 h-100">
                <img
                    class="ml-3 image-change-pass"
                    :src="require('./../../assets/image/changePass.png')"
                />
            </v-col>
            <v-col class="col-md-7 h-100">
                <v-row class="mt-1">
                    <v-text-field
                        class="fs-13 ml-3"
                        v-model="oldPassword"
                        autocomplete="new-password"
                        dense
                        :placeholder="
                            $t(
                                'user.passwordSetting.changePassword.oldPassword'
                            )
                        "
                        outlined
                        ref="oldPass"
                        :append-icon="showPassOld ? 'mdi-eye' : 'mdi-eye-off'"
                        prepend-inner-icon="mdi-lock-outline"
                        :rules="[rules.required, rules.min, rules.max]"
                        :type="showPassOld ? 'text' : 'password'"
                        @click:append="showPassOld = !showPassOld"
                    >
                    </v-text-field>
                </v-row>
                <v-row style="margin-top: -10px">
                    <v-text-field
                        autocomplete="new-password"
                        class="fs-13 ml-3"
                        prepend-inner-icon="mdi-lock-open-outline"
                        v-model="newPassword"
                        :append-icon="showPassNew ? 'mdi-eye' : 'mdi-eye-off'"
                        dense
                        :placeholder="
                            $t('user.passwordSetting.changePassword.newPass')
                        "
                        ref="newPass"
                        outlined
                        :rules="[
                            rules.required,
                            rules.min,
                            rules.max,
                            rules.notMatch
                        ]"
                        :type="showPassNew ? 'text' : 'password'"
                        @click:append="showPassNew = !showPassNew"
                    >
                    </v-text-field>
                </v-row>
                <v-row style="margin-top: -10px">
                    <v-text-field
                        autocomplete="new-password"
                        class="fs-13 ml-3"
                        prepend-inner-icon="mdi-lock-open-outline"
                        v-model="reNewPassword"
                        ref="reNewPass"
                        dense
                        :append-icon="showPassRenew ? 'mdi-eye' : 'mdi-eye-off'"
                        :placeholder="
                            $t('user.passwordSetting.changePassword.reNewPass')
                        "
                        outlined
                        :rules="[
                            rules.required,
                            rules.min,
                            rules.max,
                            rules.match,
                            rules.notMatch
                        ]"
                        :type="showPassRenew ? 'text' : 'password'"
                        @click:append="showPassRenew = !showPassRenew"
                    >
                    </v-text-field>
                </v-row>
            </v-col>
        </v-row>
        <v-card-actions
            class="d-flex justify-end h-100 mr-1"
            style="margin-top: -30px"
        >
            <v-btn small color="success" dark @click="submit()">{{
                $t('common.update')
            }}</v-btn>
            <v-btn small @click="close()">{{ $t('common.close') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
import { userApi } from './../../api/user.js';
export default {
    data() {
        return {
            oldPassword: '',
            reNewPassword: '',
            showPassRenew: false,
            showPassNew: false,
            showPassOld: false,
            newPassword: '',
            rules: {
                required: (value) => !!value || this.$t('validate.required'),
                min: (v) =>
                    (typeof v != 'undefined' &&
                        v != undefined &&
                        v.length >= 8) ||
                    this.$t('validate.min_8'),
                max: (v) =>
                    (typeof v != 'undefined' &&
                        v != undefined &&
                        v.length < 25) ||
                    this.$t('validate.max_24'),
                notMatch: (v) =>
                    v != this.oldPassword || this.$t('validate.notMatch'),
                match: (v) => v == this.newPassword || this.$t('validate.match')
            }
        };
    },
    created() {},
    watch: {
        newPassword(val) {
            this.$refs.reNewPass.validate();
            
        },
        oldPassword(val) {
            this.$refs.newPass.validate();
        }
    },
    computed: {
        sapp() {
            return this.$store.state.app;
        }
    },
    methods: {
        updateBaPass(id, data) {
            userApi
                .updateUser(id, data)
                .then((res) => {
                    if (res.status == 200) {
                        this.$snotify({
                            type: 'success',
                            title: this.$t(
                                'user.notification.successChangePass'
                            )
                        });
                        this.$emit('cancel');
                        this.newPassword = '';
                        this.oldPassword = '';
                        this.reNewPassword = '';
                    } else {
                        this.$snotify({
                            type: 'error',
                            title: this.$t('user.notification.' + res.message)
                        });
                    }
                })
                .catch((err) => {
                    console.log('error from change pass user api!!!', err);
                });
        },
        refreshAll() {
            this.newPassword = '';
            this.oldPassword = '';
            this.reNewPassword = '';
            this.rules.required = '';
            this.rules.min = '';
            this.rules.max = '';
            this.rules.notMatch = '';
            this.rules.match = '';
        },
        changePassUser(oldPass, newPass) {
            const self = this;
            userApi
                .changePassUser(oldPass, newPass)
                .then((res) => {
                    if (res.status == 200) {
                        this.$snotify({
                            type: 'success',
                            title: this.$t(
                                'user.notification.successChangePass'
                            )
                        });
                        self.$emit('cancel');
                        this.newPassword = '';
                        this.oldPassword = '';
                        this.reNewPassword = '';
                    } else {
                        this.$snotify({
                            type: 'error',
                            title: this.$t('user.notification.' + res.message)
                        });
                    }
                })
                .catch((err) => {
                    console.log('error from change pass user api!!!', err);
                });
        },
        close() {
            this.$emit('cancel');
            this.resetToDefault();
        },
        resetToDefault() {
            this.newPassword = '';
            this.oldPassword = '';
            this.reNewPassword = '';
            this.resetRules();
            this.showPassNew= false
            this.showPassOld= false
            this.showPassRenew= false
        },
        resetRules() {
            this.$refs.newPass.resetValidation();
            this.$refs.reNewPass.resetValidation();
            this.$refs.oldPass.resetValidation();
        },
        submit() {
            let data = {
                id: this.sapp.endUserInfo.id
            };
            
            let check = false;
            if (
                this.newPassword &&
                this.oldPassword != this.newPassword &&
                this.newPassword.length >= 8 &&
                this.newPassword.length < 25 &&
                this.newPassword == this.reNewPassword
            ) {
                check = true;
                this.resetRules();
            }
            else{
                this.$refs.oldPass.validate(true);
                this.$refs.reNewPass.validate(true);
                this.$refs.newPass.validate(true);
            }
            if (check) {
                if (this.$store.state.app.allBA.length > 0) {
                    this.updateBaPass(this.sapp.endUserInfo.id);
                } else {
                    this.changePassUser(this.oldPassword, this.newPassword);
                }
            }
        }
    }
};
</script>
<style scoped>
.fm {
    font-family: Roboto;
}
.image-change-pass {
    width: 140px;
    height: 146px;
}
</style>
