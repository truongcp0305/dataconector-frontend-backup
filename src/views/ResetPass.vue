<template>
    <v-flex xs12 sm8 md4>
        <v-card
            class="elevation-6"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
        >
            <div class="d-flex justify-center bg-secondary mb-3">
                <div class="fs-16 mt-4">
                    {{$t('v2.account.changePass')}}
                    <span style="color: blue">{{
                        this.$route.query.email
                    }}</span>
                </div>
            </div>
            <v-divider class="ml-2 mr-2"></v-divider>
            <div class="login-container">
                <v-form ref="form" v-model="valid">
                    <div class="c-login-input">
                        <div
                            class="c-login-input__title"
                            :class="colorTitleNewPass ? 'activeClass' : ''"
                        >
                            <span style="font-size: 15px; font-weight: normal"
                                >{{$t('v2.account.newPass')}}</span
                            >
                        </div>
                        <v-text-field
                            class="fs-13"
                            prepend-icon="mdi-lock-open-outline"
                            v-model="newPassword"
                            color="orange darken"
                            :append-icon="
                                showPassNew ? 'mdi-eye' : 'mdi-eye-off'
                            "
                            @blur="colorTitleNewPass = false"
                            @click="colorTitleNewPass = true"
                            :rules="[
                                rules.required,
                                rules.min,
                                rules.max,
                                rules.notMatch,
                                rules.newPassword,
                            ]"
                            :type="showPassNew ? 'text' : 'password'"
                            @click:append="showPassNew = !showPassNew"
                            autocomplete="new-password"
                        >
                        </v-text-field>
                    </div>
                    <v-icon slot="prepend">mdi-account-outline</v-icon>
                    <div class="c-login-input">
                        <div
                            class="c-login-input__title"
                            :class="colorTitleReNewPass ? 'activeClass' : ''"
                        >
                            <span style="font-size: 15px; font-weight: normal"
                                >{{$t('v2.account.newPassValidate')}}</span
                            >
                        </div>
                        <v-text-field
                            class="fs-13"
                            prepend-icon="mdi-lock-open-outline"
                            v-model="reNewPassword"
                            ref="reNewPass"
                            color="orange darken"
                            :append-icon="
                                showPassRenew ? 'mdi-eye' : 'mdi-eye-off'
                            "
                            @blur="colorTitleReNewPass = false"
                            @click="colorTitleReNewPass = true"
                            :rules="[
                                rules.required,
                                rules.min,
                                rules.max,
                                rules.match,
                                rules.notMatch,
                                rules.newPassword,
                            ]"
                            :type="showPassRenew ? 'text' : 'password'"
                            @click:append="showPassRenew = !showPassRenew"
                            autocomplete="new-password"
                        >
                        </v-text-field>
                    </div>
                </v-form>
                <v-card-actions style="margin: -4px 0 10px 0">
                    <v-btn
                        @click="save()"
                        text
                        class="symper-bg-orange w-100"
                        dark
                        >{{$t('v2.account.save')}}</v-btn
                    >
                </v-card-actions>
            </div>
            <div class="space-for-css"></div>
        </v-card>
        <v-dialog v-model="showNotification" persistent max-width="290">
            <v-card>
                <v-card-title class="headline">
                    <span v-if="isSuccess">{{$t('v2.account.successDialog')}}</span>
                    <span v-else>{{$t('v2.account.changePassFailDialog')}}</span>
                </v-card-title>
                <v-card-text class="fs-13">
                    <span v-if="isSuccess">
                        {{$t('v2.account.changePassSuccessMessage')}}</span
                    >
                    <span v-if="!isSuccess">
                        {{ errorMessage }}
                    </span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green darken-1"
                        text
                        @click="showNotification = false"
                    >
                    {{$t('v2.account.close')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
import { userApi } from './../api/user.js';

export default {
    data() {
        return {
            colorTitleNewPass: false,
            colorTitleReNewPass: false,
            showNotification: false,
            errorMessage:
            this.$t('v2.account.changePassErrMessage'),
            isSuccess: false,
            reNewPassword: '',
            showPassRenew: false,
            showPassNew: false,
            newPassword: '',
            rules: {
                required: (value) => !!value || this.$t('v2.account.notEmpty'),
                min: (v) =>
                    (typeof v != 'undefined' &&
                        v != undefined &&
                        v.length >= 8) ||
                        this.$t('v2.account.passMustHaveMoreThan8Characters'),
                max: (v) =>
                    (typeof v != 'undefined' &&
                        v != undefined &&
                        v.length < 25) ||
                        this.$t('v2.account.passMustHaveLessThan24Characters'),
                match: (v) =>
                    v == this.newPassword ||
                    this.$t('v2.account.newAndValidatePassDontMatch'),
                newPassword: (value) => {
                    const pattern =
                        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?).{8,}$/;
                    return (
                        pattern.test(value) ||
                        this.$t('v2.account.passIsNotValidate')
                    );
                },
            },
        };
    },
    methods: {
        save() {
            let query = this.$route.query;
            let check = false;
            if (
                this.newPassword &&
                this.newPassword.length >= 8 &&
                this.newPassword.length < 25 &&
                this.newPassword == this.reNewPassword
            ) {
                check = true;
            }
            const self = this;
            if (check) {
                userApi
                    .resetBaPass(
                        query.email,
                        query.expired,
                        query.token,
                        this.newPassword,
                        query.role,
                    )
                    .then((res) => {
                        if (res.status == 200) {
                            self.showNotification = true;
                            self.isSuccess = true;
                            self.$router.push('/');
                        } else {
                            this.errorMessage = self.$t('v2.authen.'+res.message.authen);
                            self.showNotification = true;
                            self.isSuccess = false;
                        }
                    });
            }
        },
    },
};
</script>

<style scoped>
.v-form {
    margin-bottom: 24px;
}

.space-for-css {
    height: 16px;
}
.v-card__actions {
    align-items: center;
    display: flex;
    padding: 0;
    margin-left: 12px;
}
.fm {
    font-family: Roboto;
}
.image-change-pass {
    width: 140px;
    height: 146px;
}
</style>
