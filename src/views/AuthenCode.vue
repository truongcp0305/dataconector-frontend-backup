<template>
    <v-flex xs12 sm8 md4>
        <v-card
            class="elevation-6"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
        >
            <div class="login-container">
                <div class="d-flex justify-center bg-secondary pt-3 mb-3">
                    <div
                        class="fs-16"
                        style="color: rgba(0, 0, 0, 0.87) !important"
                    >
                    {{$t('v2.general2.enterConfirmCode')}}
                    </div>
                </div>
                <v-divider></v-divider>
                <v-form ref="form">
                    <div class="c-login-input">
                        <div
                            class="c-login-input__title"
                            :class="colorTitleCode ? 'activeClass' : ''"
                        >
                            <span style="font-size: 15px; font-weight: normal"
                                >{{$t('v2.general2.confirmCode')}}</span
                            >
                        </div>
                        <v-text-field
                            :rules="codeRules"
                            v-model="code"
                            color="orange darken"
                            name="Code"
                            type="text"
                            class="fs-13"
                            @blur="colorTitleCode = false"
                            @click="colorTitleCode = true"
                            prepend-icon="mdi-shield-check-outline"
                        >
                        </v-text-field>
                    </div>
                </v-form>
                <div class="btn-container">
                    <v-spacer></v-spacer>

                    <v-btn
                        @click="checkAuthenCode()"
                        text
                        class="symper-bg-orange w-100 mb-3"
                        dark
                        :loading="isLoadingSendCode"
                    >
                        <span>{{$t('v2.general2.sendConfirmCode')}}</span>
                    </v-btn>
                </div>
            </div>

            <div
                class="d-flex justify-center bg-secondary mb-3"
                v-if="countdownResendCode == 0"
            >
                <v-btn
                    text
                    class="fs-13 fw-400 mb-2"
                    :disabled="!isAble"
                    @click="createAuthenCode()"
                    :loading="isLoadingReSendCode"
                >
                    <span>{{$t('v2.general2.getNewCode')}}</span>
                </v-btn>
            </div>
            <div
                v-else
                class="countdown-resend-authen-code d-flex justify-center mb-3"
            >
            {{$t('v2.general2.getNewCodeAfter')}} {{ countdownResendCode }}s
            </div>
            <div class="space-for-css"></div>
        </v-card>
        <v-alert
            class="alert"
            v-if="showNotification != ''"
            :border="'left'"
            colored-border
            :type="showNotification"
            elevation="2"
        >
            {{ message }}
        </v-alert>
    </v-flex>
</template>
<script>
import { userApi } from './../api/user.js';
export default {
    methods: {
        createAuthenCode() {
            this.isLoadingReSendCode = true;
            let self = this;
            let query = this.$route.query;
            this.isAble = false;

            userApi.createAuthenCode(query.email, query.role).then((res) => {
                if (res.status == 200) {
                    this.isLoadingReSendCode = false;
                    self.showNotification = 'success';
                    self.message =
                        self.$t('v2.general2.confirmSuccess');
                    this.codeValid = res.data.codeValid;
                    this.countdownResendCode =
                        this.codeValid - Math.floor(Date.now() / 1000) - 1;
                    let setCountdownResendCode = setInterval(() => {
                        --this.countdownResendCode;
                        if (this.countdownResendCode <= 0) {
                            clearIntervals(setCountdownResendCode);
                            this.isAble = true;
                        }
                    }, 1000);
                } else {
                    self.showNotification = 'error';
                    self.message = self.$t('v2.authen.'+res.message.authen);
                    this.isLoadingReSendCode = false;
                    this.isAble = true;
                }
                setTimeout(() => {
                    self.showNotification = '';
                }, 2500);
            });
        },
        checkAuthenCode() {
            this.isLoadingSendCode = true;

            let query = this.$route.query;
            const self = this;

            userApi
                .checkAuthenCode(this.code, query.email, query.role)
                .then((res) => {
                    if (res.status == 200) {
                        this.isLoadingSendCode = false;
                        if (res.data.isTrue) {
                            self.$router.push(
                                '/login/reset-pass?token=' +
                                    res.data.token +
                                    '&email=' +
                                    query.email +
                                    '&expired=' +
                                    res.data.expired +
                                    '&role=' +
                                    query.role,
                            );
                        } else {
                            self.showNotification = 'error';
                            self.message = self.$t('v2.authen.'+res.message.authen);

                            setTimeout(() => {
                                self.showNotification = '';
                            }, 2500);
                        }
                    } else {
                        self.showNotification = 'error';
                        self.message = self.$t('v2.authen.'+res.message.authen);
                        this.isLoadingSendCode = false;
                        setTimeout(() => {
                            self.showNotification = '';
                        }, 2500);
                    }
                });
        },
    },
    data() {
        return {
            colorTitleCode: false,
            size: 36,
            codeValid: 0,
            countdownResendCode: 0,
            showNotification: '',
            isSuccess: false,
            isAble: true,
            code: '',
            isLoadingSendCode: false,
            isLoadingReSendCode: false,
            message: '',
            codeRules: [
                (v) => !!v || this.$t('v2.general2.confirmCodeCannotBeEmpty'),
                (v) => /^([0-9]{6})$/.test(v) || this.$t('v2.general2.invalidConfirmCode'),
            ],
        };
    },
};
</script>

<style scoped>
.countdown-resend-authen-code {
    margin-bottom: 12px !important;
    height: 43px;
}

.space-for-css {
    height: 8px;
}
.c-login-input {
    margin-top: 16px;
}
.v-card__actions {
    align-items: center;
    display: flex;
    padding: 8px 14px 4px 18px;
}
.alert {
    position: absolute;
    top: 20px;
    right: 0;
    min-width: 300px;
}
.symper-preloader.authen-preloader {
    background-color: transparent;
}
</style>
