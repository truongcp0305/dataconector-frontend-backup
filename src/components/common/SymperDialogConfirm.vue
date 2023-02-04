<template>
    <v-dialog
        v-model="showDialog"
        persistent
        :max-width="maxWidth"
        style="z-index: 1001"
    >
        <v-card>
            <v-card-title
                class="headline fs-16 d-flex justify-space-between"
                style="word-break: break-word"
            >
                <span v-html="title"></span>
                <span v-show="showIconClose"
                    ><v-icon small @click="close">mdi-close</v-icon></span
                >
            </v-card-title>
            <v-card-text class="fs-13"> {{ content }} </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    :color="colorCancelBtn"
                    v-show="showCancel"
                    text
                    @click="cancel"
                    >{{ titleCancelBtn }}</v-btn
                >
                <v-btn :color="colorConfirmBtn" text @click="confirm">{{
                    titleConfirmBtn
                }}</v-btn>
                <v-btn
                    color="grey darken-1"
                    v-show="showDisprove"
                    text
                    @click="disprove"
                    >{{ $t('common.ignore') }}</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { SYMPER_APP } from '@/main.js';
export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        showCancel: {
            type: Boolean,
            default: true
        },
        maxWidth: {
            type: Number,
            default: 350
        },
        showDisprove: {
            type: Boolean,
            default: false
        },
        content: {
            type: String,
            default: ''
        },
        showDialog: {
            type: Boolean,
            default: false
        },
        colorCancelBtn: {
            type: String,
            default: 'red darken-1'
        },
        colorConfirmBtn: {
            type: String,
            default: 'green darken-1'
        },
        titleCancelBtn: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('common.cancel');
            }
        },
        titleConfirmBtn: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('common.ok');
            }
        },
        showIconClose: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
        },
        disprove() {
            this.$emit('disprove');
        },
        close() {
            this.$emit('close');
        }
    }
};
</script>

<style></style>
