<template>
    <v-flex xs12 sm8 md4>
        <v-card
            class="elevation-6"
            style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
        >
            <div class="login-container">
                <div class="d-flex justify-center pt-3 bg-secondary mb-3">
                    <div
                        class="fs-16"
                        style="color: rgba(0, 0, 0, 0.87) !important"
                    >
                    {{$t('v2.account.forgotLoginInfo')}}
                    </div>
                </div>
                <v-divider></v-divider>
                <v-radio-group class="mb--14" v-model="role" column>
                    <v-radio
                        :label="$t('v2.account.forEndUserAccount')"
                        class="fs-13"
                        color="primary"
                        value="user"
                    ></v-radio>
                    <v-radio
                        :label="$t('v2.account.forAdminAccount')"
                        color="primary"
                        value="ba"
                        class="fs-13"
                    ></v-radio>
                </v-radio-group>
                <v-form ref="form">
                    <div class="c-login-input">
                        <div
                            class="c-login-input__title"
                            :class="colorTitleEmail ? 'activeClass' : ''"
                        >
                            <span style="font-size: 15px; font-weight: normal"
                                >{{$t('v2.account.account')}}</span
                            >
                        </div>
                        <v-text-field
                            :rules="emailRules"
                            v-model="email"
                            color="orange darken"
                            prepend-icon="mdi-account-outline"
                            type="text"
                            id="email"
                            @blur="colorTitleEmail = false"
                            @click="colorTitleEmail = true"
                            @keyup.enter="forgotPass"
                            class="fs-13"
                        >
                        </v-text-field>
                    </div>
                </v-form>
                <div class="btn-container">
                    <v-spacer></v-spacer>
                    <v-btn
                        @click="forgotPass()"
                        text
                        class="symper-bg-orange mb-6 w-100"
                        dark
                        :loading="isLoading"
                    >
                        <span>{{$t('v2.account.sendRedeemCode')}}</span></v-btn
                    >
                </div>
            </div>
        </v-card>
        <v-dialog v-model="showNotification" persistent max-width="290">
            <v-card>
                <v-card-title class="headline">
                    <span v-if="isSuccess">{{$t('v2.account.successDialog')}}</span>
                    <span v-else>{{$t('v2.account.requestFailDialog')}}</span>
                </v-card-title>
                <v-card-text class="fs-13">
                    <span v-if="isSuccess">
                        {{$t('v2.account.successMessage')}}
                        <br />
                        {{$t('v2.account.successSubMessage')}}
                    </span>
                    <span v-if="!isSuccess">
                        {{ message }}
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
    methods: {
        forgotPass() {
            this.isLoading = true;
            const self = this;
            let data = { email: this.email, role: this.role };

            userApi.createAuthenCode(this.email, this.role).then((res) => {
                if (res.status == 200) {
                    this.isLoading = false;
                    setTimeout(() => {
                        this.$router.push(
                            '/login/authen-code?email=' +
                                this.email +
                                '&role=' +
                                this.role,
                        );
                    }, 500);
                } else {
                    this.isLoading = false;
                    self.showNotification = true;
                    self.message = self.$t('v2.authen.'+res.message.authen);
                }
            });
        },
    },
    data() {
        return {
            colorTitleEmail: false,
            isLoading: false,
            size: 36,
            role: 'user',
            message: '',
            showNotification: false,
            isSuccess: false,
            email: '',
            emailRules: [
                (v) => !!v || this.$t('v2.account.emailNotEmpty'),
                (v) => /.+@.+\..+/.test(v) || this.$t('v2.account.emailNotValidate'),
            ],
        };
    },
};
</script>

<style>
.fs-13 .v-label.theme--light {
    font-size: 13px !important;
}
.mb--14 .v-input__control {
    margin-bottom: -14px;
}
</style>
<style scoped>
.fs-13 .v-label.theme--light {
    font-size: 13px !important;
}
.v-input__control {
    margin-bottom: -14px;
}
.v-card__actions {
    align-items: center;
    display: flex;
    padding: 0;
    margin-top: 6px;
}
.v-label.theme--light {
    font-size: 13px !important;
}
.v-label {
    font-size: 13px !important;
}
.symper-preloader.forgot-preloader {
    background-color: transparent;
}
</style>
