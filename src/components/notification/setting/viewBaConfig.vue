<template>
    <div>
        <div class="mb-3">
            <h4>{{ $t('notificationConfig.name') }}</h4>
        </div>
        <v-row class="pt-0" style="margin-bottom: -15px">
            <v-col class="fs-13 col-md-5 fw-430" style="margin-top: -10px">{{
                !checkIcon(detail.icon) ? $t('v2.noti.avatar') : 'Icon'
            }}</v-col>
            <v-col class="col-md-6 ml-2" style="margin-top: -10px">
                <v-list-item-avatar
                    style="
                        height: 100px !important;
                        min-width: 100px !important;
                        width: 100px !important;
                    "
                    v-if="!checkIcon(detail.icon)"
                >
                    <v-avatar
                        style="
                            height: 100px !important;
                            min-width: 100px !important;
                            width: 100px !important;
                        "
                    >
                        <img :src="setAvaOrIcon(detail.icon)" />
                    </v-avatar>
                </v-list-item-avatar>
                <v-icon v-else class="display-3 pt-0">{{ detail.icon }}</v-icon>
                <iconPicker
                    style="margin-left: -10px"
                    ref="iconPicker"
                    :icon="'mdi mdi-plus-box'"
                    @selected="pickIcon"
                ></iconPicker>
            </v-col>
        </v-row>
        <v-row class="pt-0" style="margin-bottom: -10px">
            <v-col class="fs-13 col-md-5 fw-430" style="margin-top: 5px"
                >{{$t('v2.noti.generatedModule')}}</v-col
            >
            <v-col class="col-md-7">
                <span class="fs-13">
                    {{ detail.objectType }}
                </span>
            </v-col>
        </v-row>
        <v-row class="pt-0" style="margin-bottom: -10px">
            <v-col class="fs-13 col-md-5 fw-430" style="margin-top: 5px"
                >{{$t('v2.noti.actionGeneratesNoti')}}</v-col
            >
            <v-col class="col-md-7 fs-13">
                {{ detail.action }}
            </v-col>
        </v-row>
        <v-row class="pt-0" style="margin-bottom: -10px">
            <v-col class="fs-13 col-md-5 fw-430" style="margin-top: 5px"
                >{{$t('v2.noti.objectReceiveNoti')}}</v-col
            >
            <v-col class="col-md-7 fs-13">
                {{ detail.receiver }}
            </v-col>
        </v-row>
        <v-row class="pt-0" style="margin-bottom: -10px">
            <v-col class="fs-13 col-md-5 fw-430" style="margin-top: 5px"
                >{{$t('v2.noti.actionWhenClickNoti')}}</v-col
            >
            <v-col class="col-md-7 fs-13">
                {{ detail.actionClickNotifi }}
            </v-col>
        </v-row>
        <v-row class="pt-0" style="margin-bottom: -10px">
            <v-col class="fs-13 col-md-5 fw-430"> {{$t('v2.noti.notiContent')}} </v-col>
        </v-row>
        <v-row class="pt-0 fs-13" style="margin-bottom: -10px">
            <v-col class="fs-13 col-md-12">
                {{ detail.content }}
            </v-col>
        </v-row>
        <v-row v-if="detail.filter" class="pt-0" style="margin-bottom: -10px">
            <v-col class="fs-13 col-md-5 fw-430"> Filter </v-col>
        </v-row>
        <v-row class="pt-0 fs-13" style="margin-bottom: -25px">
            <v-col class="fs-13 col-md-12">
                {{ detail.filter }}
            </v-col>
        </v-row>
        <div class="col-12">
            <v-row class="pt-0" style="margin-bottom: -25px">
                <v-col
                    class="fs-13 col-md-5 fw-430"
                    style="margin-top: 5px; margin-left: -10px"
                    >{{$t('v2.noti.status')}}</v-col
                >
                <v-col class="col-md-6">
                    <v-checkbox
                        disabled
                        v-model="detail.state"
                        style="margin-top: 0px"
                    >
                    </v-checkbox>
                </v-col>
            </v-row>
        </div>
    </div>
</template>
<script>
import { appConfigs } from '../../../configs';

export default {
    props: ['detail'],
    created() {},
    watch: {},
    methods: {
        checkIcon(icon) {
            let check = true;
            if (icon.indexOf('user_avatar_') > -1) {
                check = false;
            }
            return check;
        },
        setAvaOrIcon(icon) {
            if (icon) {
                if (icon.indexOf('user_avatar_') > -1) {
                    return (
                        appConfigs.apiDomain.fileManagement + 'readFile/' + icon
                    );
                }
            }
        },
    },
};
</script>
