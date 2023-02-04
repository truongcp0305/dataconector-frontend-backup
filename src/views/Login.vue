<template>
    <v-flex xs12 sm8 md4>
        <v-card
            class="elevation-6"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
        >
            <v-toolbar flat>
                <v-toolbar-title class="w-100 text-center mt-6">
                    <img
                        height="40px"
                        :src="require('./../assets/image/symper-full-logo.png')"
                    />
                </v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <div class="login-container">
                <v-form ref="form" v-model="valid">
                    <div class="c-login-input">
                        <div
                            class="c-login-input__title"
                            :class="colorTitleEmail ? 'activeClass' : ''"
                        >
                            <span style="font-size: 15px; font-weight: normal"
                                >{{$t('v2.account.account')}}</span
                            >
                        </div>
                        <!-- label="Tài khoản" -->
                        <v-text-field
                            :rules="onRule ? emailRules : []"
                            v-model="email"
                            color="orange darken"
                            @keyup.enter="checkAndLogin"
                            name="login"
                            type="text"
                            ref="account"
                            id="email"
                            @blur="colorTitleEmail = false"
                            @click="clickTricker"
                        >
                            <v-icon slot="prepend">mdi-account-outline</v-icon>
                        </v-text-field>
                    </div>

                    <div class="c-login-input">
                        <div
                            class="c-login-input__title"
                            :style="(color = colorTitleEmail ? 'red' : '')"
                            :class="colorTitlePassWord ? 'activeClass' : ''"
                        >
                            <span style="font-size: 15px; font-weight: normal"
                                >{{$t('v2.account.password')}}</span
                            >
                        </div>
                        <!-- label="Mật khẩu" -->
                        <v-text-field
                            v-model="password"
                            :rules="passwordRules"
                            color="orange darken"
                            id="password"
                            name="password"
                            @keyup.enter="checkAndLogin"
                            prepend-icon="lock"
                            ref="password"
                            @blur="colorTitlePassWord = false"
                            @click="colorTitlePassWord = true"
                            :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="showPass ? 'text' : 'password'"
                            @click:append="showPass = !showPass"
                        >
                            <v-icon slot="prepend">mdi-lock-outline</v-icon>
                        </v-text-field>
                    </div>
                </v-form>
            </div>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    :loading="checkingUser"
                    @click="login()"
                    text
                    class="symper-bg-orange w-100"
                    dark
                    >{{$t('v2.account.login')}}</v-btn
                >
            </v-card-actions>
            <div class="d-flex justify-center bg-secondary mb-3">
                <v-btn
                    text
                    class="fs-13 fw-400 mb-2"
                    style="color: blue"
                    @click="forgotPass"
                    >{{$t('v2.account.forgotPass')}}</v-btn
                >
            </div>
        </v-card>
        <v-dialog v-model="showNotification" persistent max-width="290">
            <v-card>
                <v-card-title class="headline">
                    <span>{{$t('v2.account.warring')}}</span>
                </v-card-title>
                <v-card-text class="fs-13">
                    <span class="text-container">
                        <span class="line_1">
                            {{$t('v2.account.lockLoginWarring')}}
                        </span>

                        <br />
                        <span class="line_2">
                            {{$t('v2.account.lockLoginSubWarring')}}
                        </span>
                    </span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green darken-1"
                        text
                        @click="showNotification = false"
                    >
                    {{$t('v2.account.ok')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>

<script>
import { userApi } from './../api/user.js';
import { util } from './../plugins/util.js';

export default {
    mounted() {
        let self = this;
        self.$refs.account.$emit('keydown');
        // setTimeout(() => {
        self.$refs.account.$emit('input');
    },
    created() {
        if (util.auth.checkLogin()) {
            this.$router.push('/');
        }
    },
    methods: {
        clickTricker() {
            this.colorTitleEmail = true;
            this.onRule++;
        },
        forgotPass() {
            this.$router.push('/login/forgot-pass');
        },
        checkAndLogin() {
            let canLogin = true;
            if (!this.email.trim()) {
                canLogin = false;
                this.$snotifyWarning({}, this.$t('v2.account.emailNotEmpty'));
            }

            if (!this.password.trim()) {
                canLogin = false;
                this.$snotifyWarning({}, this.$t('v2.account.passNotEmpty'));
            }

            if (canLogin) {
                this.login();
            }
        },
        login() {
            this.$refs.form.validate();
            let thisCpn = this;
            if (this.valid) {
                thisCpn.checkingUser = true;
                userApi
                    .login(this.email.trim(), this.password.trim())
                    .then(async (res) => {
                        if (res.status == 200) {
                            this.showNotification = '';
                            this.$store.commit(
                                'app/setAccountType',
                                res.data.profile.type,
                            );
                            await this.$store.dispatch(
                                'app/setUserInfo',
                                res.data,
                            );
                            if (this.$route.query.redirect) {
                                window.location.href =
                                    this.$route.query.redirect;
                            } else {
                                setTimeout(() => {
                                    this.$router.push('/waiting-room');
                                }, 1000);
                            }
                        } else {
                            if (res?.isLock) {
                                this.showNotification = true;
                                this.$snotifyError({}, this.$t('v2.account.cantLogin'));
                            } else {
                                this.showNotification = false;
                                if (res?.data?.remainTime> -1 ) {
                                    this.$snotifyError(
                                        {},
                                        this.$t('v2.account.cantLogin'),
                                        this.$t('v2.account.wrongPassAndRemainTimeWarring') +" "+
                                            res.data.remainTime+" "+
                                            this.$t('v2.account.wrongPassSubWarring'),
                                    );
                                }else {
                                    this.$snotifyError(
                                        {},
                                        this.$t('v2.account.cantLogin'),
                                        this.$t('v2.account.wrongPassWarring'),
                                    );
                                }
                            }
                        }
                    })

                    .finally(() => {
                        setTimeout(() => {
                            thisCpn.checkingUser = false;
                        }, 1000);
                    });
            }
        },
    },
    data() {
        return {
            onRule: 0,
            showNotification: false,
            showPass: false,
            checkingUser: false,
            valid: true,
            colorTitleEmail: false,
            colorTitlePassWord: false,
            email: '',
            password: '',
            emailRules: [
                (v) => !!v || this.$t('v2.account.emailNotEmpty'),
                (v) => /.+@.+\..+/.test(v) || this.$t('v2.account.emailNotValidate'),
            ],
            passwordRules: [(v) => !!v || this.$t('v2.account.emailNotValidate')],
        };
    },
};
</script>

<style scoped>
.headline span{
    font-size:18px
}
.v-card__actions {
    padding: 13px 12px 10px 20px;
}

.v-dialog > .v-card > .v-card__text {
    padding: 0 19px 0 20px;
}
.v-dialog > .v-card > .v-card__title {
    padding: 20px 20px 13px 20px;
}
.alert {
    position: absolute;
    top: 20px;
    right: 0;
    min-width: 300px;
}
</style>
