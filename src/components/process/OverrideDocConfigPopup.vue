<template>
    <div>
        <v-dialog v-model="showDialog" persistent max-width="700">
            <v-card :key="instanceKey">
                <v-card-title class="fs-15"> {{$t('v2.workflow.overwriteConfiguration')}} </v-card-title>
                <v-card-text>
                    <div
                        class="override-doc-config d-flex mx-auto fs-13 border-1"
                    >
                        <div class="override-doc-config__action">
                            <div class="d-flex mx-2 py-2">
                                <span class="mt-1 mr-1"> {{$t('v2.workflow.action')}} </span>
                                <v-autocomplete
                                    v-model="selectedAction"
                                    :items="actionsClone"
                                    outlined
                                    dense
                                    item-value="value"
                                    return-object
                                    multiple
                                ></v-autocomplete>
                            </div>
                            <VuePerfectScrollbar style="max-height: 380px">
                                <v-expansion-panels class="my-1">
                                    <v-expansion-panel
                                        v-for="(item, i) in selectedAction"
                                        :key="i"
                                    >
                                        <v-expansion-panel-header>
                                            <div class="d-flex">
                                                <div class="flex-grow-1 mt-1">
                                                    {{ item.text }}
                                                </div>
                                                <v-menu offset-y>
                                                    <template
                                                        v-slot:activator="{
                                                            on,
                                                            attrs,
                                                        }"
                                                    >
                                                        <v-btn
                                                            icon
                                                            tile
                                                            x-small
                                                            class="actions-menu"
                                                            v-bind="attrs"
                                                            v-on="on"
                                                        >
                                                            <v-icon
                                                                class="fs-15"
                                                            >
                                                                mdi-dots-horizontal
                                                            </v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <div
                                                        class="d-flex flex-column"
                                                    >
                                                        <div
                                                            class="p-2 actions-menu__item d-flex fs-13"
                                                            @click="
                                                                removeItem(i)
                                                            "
                                                        >
                                                            <v-icon small>
                                                                mdi-trash-can-outline
                                                            </v-icon>
                                                            <span class="ml-1">
                                                                {{
                                                                    $t(
                                                                        'common.delete',
                                                                    )
                                                                }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </v-menu>
                                            </div>
                                        </v-expansion-panel-header>
                                        <v-expansion-panel-content>
                                            <div class="d-flex my-1">
                                                <span class="mt-1">
                                                    {{$t('v2.workflow.control')}}
                                                </span>
                                                <v-autocomplete
                                                    v-model="item.controls"
                                                    :items="allControlsClone"
                                                    outlined
                                                    class="mx-1"
                                                    dense
                                                    item-text="name"
                                                    return-object
                                                    multiple
                                                ></v-autocomplete>
                                            </div>
                                            <div
                                                v-for="(
                                                    childItem, j
                                                ) in item.controls"
                                                class="d-flex control-item fs-13"
                                                :key="j"
                                                @click="
                                                    configControlProperty(
                                                        childItem,
                                                        i,
                                                        j,
                                                    )
                                                "
                                            >
                                                <div class="flex-grow-1">
                                                    {{ childItem.name }}
                                                </div>
                                                <div>
                                                    <v-menu offset-y>
                                                        <template
                                                            v-slot:activator="{
                                                                on,
                                                                attrs,
                                                            }"
                                                        >
                                                            <v-btn
                                                                icon
                                                                tile
                                                                x-small
                                                                class="control-item__menu"
                                                                v-bind="attrs"
                                                                v-on="on"
                                                            >
                                                                <v-icon
                                                                    class="fs-15"
                                                                >
                                                                    mdi-dots-horizontal
                                                                </v-icon>
                                                            </v-btn>
                                                        </template>
                                                        <div
                                                            class="d-flex flex-column"
                                                        >
                                                            <div
                                                                class="p-2 actions-menu__item d-flex fs-13"
                                                                @click="
                                                                    removeControl(
                                                                        i,
                                                                        j,
                                                                    )
                                                                "
                                                            >
                                                                <v-icon small>
                                                                    mdi-trash-can-outline
                                                                </v-icon>
                                                                <span
                                                                    class="ml-1"
                                                                >
                                                                    {{
                                                                        $t(
                                                                            'common.delete',
                                                                        )
                                                                    }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </v-menu>
                                                </div>
                                            </div>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </VuePerfectScrollbar>
                        </div>
                        <div
                            v-if="showPropertiesConfig"
                            class="override-doc-config__property px-2"
                        >
                            <div class="d-flex flex-column">
                                <div class="mt-3">
                                    <span>
                                        {{ selectedControl.name }}
                                    </span>
                                </div>
                                <div class="d-flex">
                                    <span class="mt-1 mr-1"> {{$t('v2.workflow.properties')}}</span>
                                    <v-autocomplete
                                        :items="allPropertiesClone"
                                        item-text="title"
                                        outlined
                                        dense
                                        v-model="selectedControl.properties"
                                        return-object
                                        item-value="title"
                                        multiple
                                    ></v-autocomplete>
                                </div>
                                <FormTpl
                                    :allInputs="selectedControlProperties"
                                ></FormTpl>
                            </div>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="hide"> {{$t('v2.workflow.cancel')}} </v-btn>
                    <v-btn color="green darken-1" text @click="applyChange">
                        {{$t('v2.workflow.apply')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import FormTpl from '@/components/common/FormTpl';
import { util } from '@/plugins/util';
import { GetControlProps } from '@/components/document/controlPropsFactory.js';
export default {
    components: {
        VuePerfectScrollbar,
        FormTpl,
        GetControlProps,
    },
    props: {
        actions: {
            type: Array,
            default() {
                return [];
            },
        },
        allControls: {
            type: Array,
            default() {
                return [];
            },
        },
        overrideNodeConfig: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            showDialog: false,
            selectedAction: [],
            showPropertiesConfig: false,
            allProperties: [],
            selectedControl: {},
            scriptFormTpl: {
                script: {
                    title: this.$t('v2.workflow.script'),
                    type: 'script',
                    value: '',
                    info: '',
                },
            },
            propertiesIndex: 0,
            instanceKey: 0,
        };
    },
    computed: {
        actionsClone() {
            let arr = this.actions.filter((e) => {
                return e.value != null;
            });
            return arr;
        },
        allControlsClone() {
            let self = this;
            let obj = util.cloneDeep(this.allControls);
            this.allControls.forEach(function (e) {
                self.$set(e, 'properties', []);
            });
            obj.splice(0, 2);
            return obj;
        },
        allPropertiesClone() {
            let obj = util.cloneDeep(this.allProperties);
            return obj;
        },
        selectedControlProperties() {
            let obj = {};
            if (
                this.selectedControl.properties &&
                this.selectedControl.properties.length
            ) {
                obj = this.convertArrayToObject(
                    this.selectedControl.properties,
                    'title',
                );
            }
            return obj;
        },
    },
    watch: {
        showDialog(val) {
            this.showPropertiesConfig = false;
            this.instanceKey = Date.now();
            if (val) {
                this.selectedAction = util.cloneDeep(this.overrideNodeConfig);
            }
        },
    },
    created() {},
    methods: {
        convertArrayToObject(array, key) {
            let arr = array.reduce((acc, v) => {
                acc[v[key]] = acc[v[key]] || {};
                acc[v[key]] = v;
                return acc;
            }, {});
            return arr;
        },
        handlePropertyClick(index) {
            this.propertiesIndex = index;
        },
        configControlProperty(control) {
            this.allProperties = [];
            let controlProps = GetControlProps(control.type);
            controlProps = this.multilinguePropertiesControl(controlProps,control.type);
            for (let i in controlProps.properties) {
                controlProps.properties[i].key = i;
                if (['isRequireChange', 'isRequired', 'isRefreshData'].includes(i)) {
                    this.allProperties.push(controlProps.properties[i]);
                }
            }
            if (controlProps.formulas.require) {
                controlProps.formulas.require.key = 'require';
                this.allProperties.push(controlProps.formulas.require);
            }
            if (controlProps.formulas.requireChange) {
                controlProps.formulas.requireChange.key = 'requireChange';
                this.allProperties.push(controlProps.formulas.requireChange);
            }
            this.showPropertiesConfig = true;
            this.$set(this, 'selectedControl', control);
        },
        multilinguePropertiesControl(control, controlType){
            for(let p in control.properties){
                control.properties[p].title = this.$t(control.properties[p].title)
            }
            for(let f in control.formulas){
                control.formulas[f].title = this.$t(control.formulas[f].title)
            }
            if(controlType == "department"){
                for(let d in control.formulas.groupDpm.configData[0]){
                    control.formulas.groupDpm.configData[0][d].title = this.$t(control.formulas.groupDpm.configData[0][d].title)
                    if(control.formulas.groupDpm.configData[0][d].placeholder){
                        control.formulas.groupDpm.configData[0][d].placeholder = this.$t(control.formulas.groupDpm.configData[0][d].placeholder)
                    }
                    if(d == "level"){
                        for(let o in control.formulas.groupDpm.configData[0][d].options){
                            control.formulas.groupDpm.configData[0][d].options[o].text = this.$t(control.formulas.groupDpm.configData[0][d].options[o].text)
                        }
                    }
                }                
            }
            if(controlType == "tabPage"){
                control.html = control.html.replace('v2.doc.addPage', `${this.$t('v2.doc.addPage')}`)
                control.html = control.html.replace('v2.doc.pageNumber', `${this.$t('v2.doc.pageNumber')}`)
            }
            return control
        },
        applyChange() {
            this.$emit('override-config', this.selectedAction);
            this.showDialog = false;
        },
        show() {
            this.showDialog = true;
        },
        hide() {
            this.selectedAction = [];
            this.showDialog = false;
        },
        removeItem(index) {
            this.selectedAction.splice(index, 1);
            this.showPropertiesConfig = false;
        },
        cloneAction(item) {
            let newItem = util.cloneDeep(item);
            this.selectedAction.push(newItem);
        },
        removeControl(i, j) {
            this.selectedAction[i].controls.splice(j, 1);
            this.showPropertiesConfig = false;
        },
        handlePropertyChange(data) {
            this.selectedAction[this.actionIndex].controls[
                this.controlIndex
            ].properties = data;
        },
    },
};
</script>

<style scoped>
.override-doc-config {
    height: 400px;
    width: 620px;
    border: 1px solid lightgray;
}
.override-doc-config .override-doc-config__action {
    width: 310px;
    border-right: 1px solid lightgray;
}
.override-doc-config .override-doc-config__property {
    width: 310px;
}
.override-doc-config
    .override-doc-config__action
    >>> .v-input__append-inner
    .v-input__icon
    .v-icon,
.override-doc-config
    .override-doc-config__property
    >>> .v-input__append-inner
    .v-input__icon
    .v-icon {
    margin-bottom: 10px !important;
}
.override-doc-config
    .override-doc-config__property
    >>> .v-expansion-panel-header,
.override-doc-config
    .override-doc-config__action
    >>> .v-expansion-panel-header {
    font-size: 13px;
    padding: 8px;
    min-height: unset;
    height: 28px;
}
.override-doc-config
    .override-doc-config__property
    >>> .v-expansion-panel::before,
.override-doc-config
    .override-doc-config__action
    >>> .v-expansion-panel::before {
    box-shadow: unset;
}
.override-doc-config .override-doc-config__action >>> .v-select__selection,
.override-doc-config .override-doc-config__property >>> .v-select__selection {
    display: none !important;
}

.actions-menu {
    opacity: 0;
    position: absolute;
    right: 10px;
    z-index: 10000;
}
.override-doc-config
    .override-doc-config__action
    >>> .v-expansion-panel-header:hover
    .actions-menu {
    opacity: 1;
}
.override-doc-config
    .override-doc-config__action
    >>> .v-expansion-panel-header:hover
    .v-expansion-panel-header__icon {
    opacity: 0;
}
.override-doc-config >>> .v-text-field__details {
    display: none !important;
}
.override-doc-config >>> .v-input__slot {
    box-shadow: unset !important;
    min-height: unset !important;
    height: 28px !important;
}
.override-doc-config >>> input {
    font-size: 13px !important;
}
.override-doc-config >>> .v-menu {
    font-size: 13px !important;
}
.actions-menu__item {
    cursor: pointer;
    background-color: #ffffff;
    z-index: 10000;
    width: 100px;
}
.control-item {
    cursor: pointer;
    background-color: #ffffff;
}
.actions-menu__item:hover,
.control-item:hover {
    background-color: #f5f5f5;
}
.control-item__menu {
    opacity: 0;
}
.control-item:hover .control-item__menu {
    opacity: 1;
}
</style>
