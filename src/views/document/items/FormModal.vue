<template>
    <div>
        <v-dialog
            scrollable
            v-model="isShowModal"
            :width="width"
            content-class="s-dialog"
        >
            <v-card>
                <h4 class="headline">
                    {{ $t('document.editor.dialog.saveDoc.heading') }}
                </h4>
                <v-divider></v-divider>
                <v-card-text>
                    <div
                        id="setting-control-table"
                        class="setting-control-table"
                    >
                        <div class="content-setting-control-table">
                            <form-save-doc :allInputs="allInputs" />
                        </div>
                    </div>
                </v-card-text>
                <v-divider></v-divider>

                <v-card-actions class="action">
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text right @click="save">
                        {{ $t('common.save') }}
                    </v-btn>

                    <v-btn color="green darken-1" text right @click="hide">
                        {{ $t('common.close') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import FormTpl from './../../../components/common/FormTpl.vue';
import { util } from './../../../plugins/util.js';
import { documentApi } from './../../../api/Document.js';

export default {
    components: {
        'form-save-doc': FormTpl,
    },
    props: {
        instance: {
            type: Number,
            default: Date.now(),
        },
        width: {
            type: Number,
            default: 800,
        },
        inputsObject: {
            default() {
                return {};
            },
        },
    },
    watch: {
        inputsObject: {
            deep: true,
            immediate: true,
            handler(newVl) {
                this.allInputs = newVl;
            },
        },
    },
    data() {
        return {
            isShowModal: false,
            allInputs: {},
        };
    },

    methods: {
        show() {
            this.isShowModal = true;
        },
        hide() {
            this.isShowModal = false;
        },

        save() {
            if (!this.allInputs.title.value) {
                this.allInputs.title.validateStatus.isValid = false;
            } else {
                this.allInputs.title.validateStatus.isValid = true;
                this.$emit('form-modal-save', this.allInputs);
            }
        },
    },
};
</script>
<style scoped>
.headline {
    font-size: 16px !important;
    font-weight: 500;
    padding: 4px 24px;
}
.action {
    height: 41px;
}
.note-name-change {
    position: absolute;
    right: 40px;
    top: 38px;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    background: #707070;
    z-index: 999;
    padding: 2px 8px;
    border-radius: 4px;
    transition: all ease-in-out 250ms;
}
.note-name-change > span {
    color: white;
    font-size: 12px;
}
.buble-direction {
    position: relative;
}
.buble-direction span {
    position: absolute;
    color: #707070;
    top: -8px;
    right: 10px;
}
</style>
<style>
.s-dialog {
    overflow: hidden;
}
</style>
