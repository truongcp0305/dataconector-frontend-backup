<template>
    <v-card
        class="card-quick-info-control"
        v-show="isShow"
        :style="positionBox"
    >
        <p class="headline">
            {{ $t('document.editor.dialog.quickInfoControl.heading') }}
        </p>
        <v-divider></v-divider>
        <v-card-text style="height: calc(100% - 84px); overflow: auto">
            <div class="form-add-control-info">
                <FormTpl
                    :singleLine="true"
                    :labelWidth="`80px`"
                    @input-value-keyup="handleKeyupInput"
                    :allInputs="allInputs"
                />
            </div>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions class="action">
            <v-spacer></v-spacer>

            <v-btn color="green darken-1" text right @click="isShow = !isShow">
                {{ $t('common.close') }}
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
import FormTpl from './../../../components/common/FormTpl.vue';
import {
    checkInTable,
    checkNameControl,
    checkTitleControl,
} from './../common/common';
import { util } from '../../../plugins/util';

export default {
    props: {
        keyInstance: {
            type: Number,
            default: 0,
        },
    },
    components: {
        FormTpl,
    },
    data() {
        return {
            isShow: false,
            positionBox: null,
            listNameValueControl: {},
            delayTimer: null,
            allInputs: {
                name: {
                    title: this.$t('v2.doc.name'),
                    type: 'text',
                    value: '',
                },
                title: {
                    title: this.$t('v2.doc.title'),
                    type: 'text',
                    value: '',
                },
            },
        };
    },
    computed: {
        sCurrentDocument() {
            return this.$store.state.document.editor[this.keyInstance]
                .currentSelectedControl;
        },
    },

    created() {},
    beforeMount() {
        this.positionBox = { top: 0, left: 0 };
    },
    methods: {
        resetData() {
            this.allInputs = {
                name: {
                    title: this.$t('v2.doc.name'),
                    type: 'text',
                    value: '',
                },
                title: {
                    title: this.$t('v2.doc.title'),
                    type: 'text',
                    value: '',
                },
            };
        },
        show(e) {
            this.isShow = true;
            this.resetData();
            this.calculatorPositionBox(e);
        },
        hide() {
            this.isShow = false;
        },

        calculatorPositionBox(e) {
            this.positionBox.top = e.clientY + 'px';
            this.positionBox.left = e.clientX + 'px';
        },
        handleKeyupInput(name, input, data) {
            clearTimeout(this.delayTimer);
            this.delayTimer = setTimeout(
                function (self) {
                    self.handleValidateControl(name, input, data);
                },
                100,
                this,
            );
            if (data.key == 'Tab') {
                this.handleValidateControl(name, input, data);
            }
        },
        handleValidateControl(name, input, data) {
            let value = input.value;
            let elements = $('#document-editor-' + this.keyInstance + '_ifr')
                .contents()
                .find('#' + this.sCurrentDocument.id);
            let tableId = checkInTable(elements);
            if (tableId == this.sCurrentDocument.id) tableId = '0';
            this.$store.commit('document/updateProp', {
                id: this.sCurrentDocument.id,
                name: name,
                value: value,
                tableId: tableId,
                type: 'value',
                instance: this.keyInstance,
            });
            if (name == 'name' || name == 'title') {
                let currentInput = this.sCurrentDocument.properties.name;
                checkNameControl(this.keyInstance);
                checkTitleControl(this.keyInstance);
            }
        },
    },
};
</script>

<style scoped>
.card-quick-info-control {
    position: absolute;
    z-index: 99999;
    max-width: unset !important;
    max-height: 500px;
    overflow: hidden;
}
.action {
    height: 35px !important;
}
.action >>> button {
    font-size: 13px;
    height: 25px !important;
}
.headline {
    font-size: 14px !important;
    margin: 0;
    font-weight: 500;
    padding: 0 8px;
}
</style>
