<template>
    <div
        class="d-flex justify-space-between px-3 py-2"
        :class="{ 'border-bottom': isBorderBottom }"
    >
        <div class="right-side d-flex align-center">
            <v-icon v-if="icon" :size="16" @click="$emit('click-icon')">{{
                icon
            }}</v-icon>
            <span class="fs-15 fw-430 ml-2">{{ nameHeader }}</span>
            <i
                v-show="showIconInfo"
                class="ml-2 mdi-information-outline mdi"
                style="font-size: 16px"
                @click="$emit('show-info')"
            ></i>
        </div>
        <div class="left-side">
            <v-btn
                v-show="showBtnSave"
                :loading="loading"
                depressed
                class="mr-1 fs-13"
                small
                :color="colorBtn"
                @click="save()"
                tag="div"
            >
                {{ nameBtn }}
            </v-btn>
            <v-btn
                depressed
                @click="close"
                small
                v-show="showCloseIcon"
                tag="div"
            >
                <i class="fs-18 mdi mdi-close"></i>
            </v-btn>
        </div>
    </div>
</template>
<script>
import { SYMPER_APP } from '@/main.js';
export default {
    name: 'HeaderForm',
    props: {
        showIconInfo: {
            type: Boolean,
            default: true
        },
        isBorderBottom: {
            type: Boolean,
            default: true
        },
        showCloseIcon: {
            // hiện nút x
            type: Boolean,
            default: true
        },
        colorBtn: {
            type: String,
            default: 'success'
        },
        nameBtn: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('common.save');
            }
        },
        icon: {
            type: String,
            default: ''
        },
        nameHeader: {
            type: String,
            default: ''
        },
        showBtnSave: {
            // hiện nút lưu
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            loading: false
        };
    },
    methods: {
        close() {
            this.$emit('close-form');
            this.loading = false;
        },
        save() {
            this.loading = true;
            this.$emit('save-form');
        }
    }
};
</script>
