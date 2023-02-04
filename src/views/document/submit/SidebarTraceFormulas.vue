<template>
    <div class="sidebar-trace-control">
        <div style="display: flex">
            <span style="font-size: 15px">{{
                $t('document.detail.sidebar.heading')
            }}</span>
        </div>
        <v-divider></v-divider>
        <VuePerfectScrollbar style="calc(100% - 62px);">
            <div class="control-info">
                <table class="w-100">
                    <tr>
                        <td style="width: 40%">ID Document</td>
                        <td>{{ documentInfo.id }}</td>
                    </tr>
                    <tr>
                        <td style="width: 40%">{{$t('v2.doc.documentTitle')}}</td>
                        <td>{{ documentInfo.title }}</td>
                    </tr>
                    <tr>
                        <td style="width: 70px">{{$t('v2.doc.controlName') + ':'}}</td>
                        <td>{{ controlInfo.name }}</td>
                    </tr>
                    <tr>
                        <td style="width: 70px">{{$t('v2.doc.controlType') + ':'}}</td>
                        <td>{{ controlInfo.type }}</td>
                    </tr>
                    <tr>
                        <td>{{$t('v2.doc.controlTitle') + ':'}}</td>
                        <td>{{ controlInfo.title }}</td>
                    </tr>
                    <tr>
                        <td>{{$t('v2.doc.controlCreator') + ':'}}</td>
                        <td>{{ controlInfo.userUpdate }}</td>
                    </tr>
                    <tr>
                        <td style="width: 40%">{{$t('v2.doc.baCreate')}}</td>
                        <td>{{ documentInfo.baCreate }}</td>
                    </tr>
                    <tr>
                        <td style="width: 40%">{{$t('v2.doc.baUpdate')}}</td>
                        <td>{{ documentInfo.baUpdate }}</td>
                    </tr>
                    <tr>
                        <td style="width: 40%">{{$t('v2.doc.createAt')}}</td>
                        <td>{{ documentInfo.createAt }}</td>
                    </tr>
                    <tr>
                        <td style="width: 40%">{{$t('v2.doc.updateAt')}}</td>
                        <td>{{ documentInfo.updateAt }}</td>
                    </tr>
                </table>
            </div>
            <v-stepper alt-labels>
                <v-stepper-header>
                    <v-stepper-step step="1" :color="'#ff800380'">{{
                        $t('document.submit.panel.traceInput')
                    }}</v-stepper-step>

                    <v-divider></v-divider>

                    <v-stepper-step step="1" :color="'#0760d980'">{{
                        $t('document.submit.panel.traceCurrent')
                    }}</v-stepper-step>

                    <v-divider></v-divider>

                    <v-stepper-step step="1" :color="'#40813780'">{{
                        $t('document.submit.panel.traceOutput')
                    }}</v-stepper-step>
                </v-stepper-header>
            </v-stepper>
            <v-expansion-panels
                multiple
                v-model="panel"
                class="s-trace-control-panel"
                v-for="(value, name) in listFormulas"
                :key="name"
            >
                <v-expansion-panel>
                    <v-expansion-panel-header
                        disable-icon-rotate
                        class="v-expand-header"
                        >{{ value.title }}
                        <template v-slot:actions>
                            <button
                                class="trace-btn"
                                @click.stop.prevent="
                                    traceControlFormulas(value.instance)
                                "
                            >
                                {{ $t('common.check') }}
                            </button>
                        </template>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content class="sym-v-expand-content">
                        <FormTpl :singleLine="false" :allInputs="value.input" />
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import FormTpl from './../../../components/common/FormTpl.vue';
import {
    getListInputInDocument,
    mapTypeToEffectedControl
} from './../common/common';

export default {
    components: {
        VuePerfectScrollbar,
        FormTpl
    },
    data() {
        return {
            isShow: false,
            panel: [],
            listFormulas: {},
            effectedControl: {},
            inputControl: {},
            controlNameTrace: null,
            controlInfo: { name: '', title: '', userUpdate: '', type: '' }
        };
    },
    computed: {
        listInputInDocument() {
            return getListInputInDocument(this.keyInstance);
        }
    },
    methods: {
        /**
         * Hàm kiểm tra xem công thức của 1 control thì cần đầu vào nào và đầu ra nào
         * trong màn hình submit
         */
        traceControlFormulas(instance) {
            this.removeTrace();
            let curControl = this.listInputInDocument[this.controlNameTrace];

            if (curControl.inTable) {
                // nếu là control trong table , trường hợp này do handson tự render lại nên cần set current trace lại tại cột đó
                setTimeout(() => {
                    curControl.renderCurrentTraceControlColor();
                }, 200);
            }
            let formulasType = instance.type;
            this.inputControl = instance.inputControl;
            if (['list', 'autocomplete', 'formulas'].includes(formulasType)) {
                this.effectedControl =
                    curControl[mapTypeToEffectedControl['formulas']];
            } else {
                this.effectedControl =
                    curControl[mapTypeToEffectedControl[formulasType]];
            }
            for (let controlName in this.inputControl) {
                let controlIns = this.listInputInDocument[controlName];
                controlIns.renderInputTraceControlColor();
            }
            for (let controlName in this.effectedControl) {
                let controlIns = this.listInputInDocument[controlName];
                controlIns.renderOutputTraceControlColor();
            }
        },
        /**
         * bỏ trace khi đóng sidebar
         */
        removeTrace() {
            for (let controlName in this.inputControl) {
                let controlIns = this.listInputInDocument[controlName];
                controlIns.removeTraceControlColor();
            }
            for (let controlName in this.effectedControl) {
                let controlIns = this.listInputInDocument[controlName];
                controlIns.removeTraceControlColor();
            }
        },
        removeCurrentControlTrace() {
            let curControl = this.listInputInDocument[this.controlNameTrace];
            curControl.removeTraceControlColor();
        }
    },
    props: {
        listFormulasTrace: {
            type: Object,
            default: function () {
                return {};
            }
        },
        keyInstance: {
            type: Number,
            default: 0
        },
        controlTrace: {
            type: String,
            default: ''
        },
        documentInfo: {
            type: Object
        }
    },
    watch: {
        controlTrace: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.controlNameTrace = vl;
                let curControl =
                    this.listInputInDocument[this.controlNameTrace];
                this.controlInfo.name = curControl.name;
                this.controlInfo.title = curControl.title;
                this.controlInfo.userUpdate = curControl.lastUserUpdate;
                this.controlInfo.type = curControl.type;
            }
        },

        /**
         * Hàm xử lí data trước khi đưa vào sidebar
         */
        listFormulasTrace: {
            deep: true,
            immediate: true,
            handler: function (after) {
                let data = {};
                let index = 0;
                this.panel = [];
                for (let formulasType in after) {
                    if (!after[formulasType].instance) {
                        continue;
                    }
                    let formItem = {};
                    let input = {};
                    formItem[formulasType] = {
                        title: after[formulasType].title,
                        value: after[formulasType].instance.formulas,
                        type: 'script',
                        hideTitle: true
                    };
                    input['title'] = after[formulasType].title;
                    input['input'] = formItem;
                    input['instance'] = after[formulasType].instance;
                    data[formulasType] = input;
                    this.panel.push(index);
                    index++;
                }
                this.listFormulas = data;
            }
        }
    }
};
</script>

<style scoped>
.v-expand-header {
    font-size: 13px;
    font-weight: 500;
    min-height: unset;
    padding: 8px 0;
    border: none !important;
}
.v-expand-header:hover {
    background: none !important;
}
.s-trace-control-panel {
    overflow: hidden;
    max-height: 100%;
}

.sym-v-expand-content ::v-deep .v-expansion-panel-content__wrap {
    padding: 0 0 0 8px;
}
.sym-v-expand-content ::v-deep .v-expansion-panel {
    margin: 0;
}
.s-trace-control-panel ::v-deep .v-expansion-panel--active:not(:first-child),
.s-trace-control-panel
    ::v-deep
    .v-expansion-panel--active
    + .v-expansion-panel {
    margin-top: 0px !important;
}
::v-deep .v-expansion-panel:not(:first-child)::after {
    border-top: none !important;
}
.mdi-close {
    margin-left: auto;
    margin-right: 4px;
    font-size: 16px;
    color: #757575;
    transition: all ease-in-out 250ms;
    cursor: pointer;
}
.mdi-close:hover {
    color: rgb(0 0 0 / 1);
}

.sidebar-trace-control ::v-deep .v-stepper__step__step {
    color: transparent !important;
}
.sidebar-trace-control ::v-deep .v-stepper--alt-labels .v-stepper__step {
    flex-basis: 120px !important;
}
.sidebar-trace-control
    ::v-deep
    .v-stepper--alt-labels
    .v-stepper__header
    .v-divider {
    margin: 35px -42px 0 !important;
}
.sidebar-trace-control ::v-deep .v-stepper__label {
    text-align: center;
}

.trace-btn:focus {
    outline: none;
}
.control-info {
    font-size: 12px;
}
</style>
