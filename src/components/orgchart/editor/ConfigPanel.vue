<template>
    <div
        :class="{
            'w-100 h-100': true,
            'view-only': action == 'view' || action == 'structureManagement',
        }"
    >
        <v-tabs
            v-model="currentTab"
            background-color="transparent"
            color="grey"
            light
            height="42"
            flat
            grow
        >
            <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                    <v-tab
                        v-on="on"
                        v-bind="attrs"
                        :key="'main'"
                        style="min-width: 50px !important"
                    >
                        <v-icon size="17">mdi-home</v-icon>
                    </v-tab>
                </template>
                <span>{{ $t('orgchart.editor.main') }}</span>
            </v-tooltip>
            <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                    <v-tab
                        v-on="on"
                        v-bind="attrs"
                        :key="'customAttributes'"
                        style="min-width: 50px !important"
                    >
                        <v-icon size="17">mdi-cogs</v-icon>
                    </v-tab>
                </template>
                <span>{{ $t('orgchart.editor.customAttributes') }}</span>
            </v-tooltip>
            <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                    <v-tab
                        v-on="on"
                        v-bind="attrs"
                        :key="'style'"
                        style="min-width: 50px !important"
                    >
                        <v-icon size="17"
                            >mdi-checkbox-multiple-marked-circle-outline</v-icon
                        >
                    </v-tab>
                </template>
                <span>{{ $t('orgchart.editor.style') }}</span>
            </v-tooltip>
        </v-tabs>

        <v-tabs-items v-model="currentTab">
            <v-tab-item :key="'main'" class="px-2 pt-2">
                <span class="fs-15 font-weight-medium">{{
                    $t('orgchart.editor.generalAttributes')
                }}</span>
                <form-tpl
                    :viewOnly="
                        action == 'view' || action == 'structureManagement'
                    "
                    :singleLine="
                        context == 'department' &&
                        selectingNode.id == SYMPER_HOME_ORGCHART
                            ? false
                            : true
                    "
                    :labelWidth="'60px'"
                    @input-value="handleAttrValueInput"
                    :allInputs="selectingNode.commonAttrs"
                ></form-tpl>
                <div
                    v-if="
                        !(
                            context == 'department' &&
                            selectingNode.id == SYMPER_HOME_ORGCHART
                        )
                    "
                >
                    <span class="fs-12">{{
                        context == 'department'
                            ? $t('v2.orgchart.selectManager')
                            : $t('v2.orgchart.userInPosition')
                    }}</span>
                    <UserSelector
                        ref="userSelector"
                        :isMulti="true"
                        :disabled="
                            action == 'view' || action == 'structureManagement'
                        "
                        :compactChip="true"
                        :color="'grey lighten-3'"
                        :textColor="''"
                        :flat="true"
                        @input="handleChangeUser"
                        v-model="selectingNode.users"
                    ></UserSelector>
                    <div v-if="action != 'create'">
                        <span class="mt-3p fs-12">
                            {{$t('v2.orgchart.selectUserFromDocument')}}
                        </span>
                        <MappingDocInstanceSelector
                            :disabled="action != 'structureManagement'"
                            :homeConfig="homeConfig.commonAttrs"
                            v-model="selectingNode.dataFromDoc.users"
                        />
                    </div>
                </div>

                <div
                    class="mt-3"
                    v-if="
                        context == 'position' &&
                        selectingNode.id != SYMPER_HOME_ORGCHART
                    "
                >
                    <span class="fs-12"> Select permissions </span>
                    <PermissionSelector
                        :disabled="
                            action == 'view' || action == 'structureManagement'
                        "
                        :value="selectingNode.permissions"
                        @input="selectedPermissions"
                    >
                    </PermissionSelector>
                </div>
            </v-tab-item>

            <v-tab-item :key="'customAttributes'">
                <div class="w-100">
                    <v-menu
                        v-model="openAddPanel"
                        :close-on-content-click="false"
                        offset-y
                        :close-on-click="false"
                        class="float-right"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <div>
                                <span
                                    class="fs-15 pl-4 font-weight-medium"
                                    :style="{
                                        position: 'relative',
                                        top: '5px',
                                    }"
                                    >{{
                                        $t(
                                            'orgchart.editor.listDynamicAttributes',
                                        )
                                    }}</span
                                >
                                <v-btn
                                    class="dynamic-attr-form-activator float-right"
                                    color="indigo"
                                    dark
                                    v-if="action != 'view'"
                                    icon
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="actionBeforeAddAttr"
                                >
                                    <v-icon size="21">mdi-plus</v-icon>
                                </v-btn>
                            </div>
                        </template>
                        <div
                            style="width: 300px"
                            class="pa-4 bg-white symper-dynamic-attr-form"
                            :data-instance-key="instanceKey"
                        >
                            <form-tpl
                                :viewOnly="action == 'view'"
                                :singleLine="false"
                                ref="dynamicAttrForm"
                                :allInputs="dynamicValueInputs"
                            ></form-tpl>
                            <div style="height: 30px">
                                <v-btn
                                    class="float-right mr-1 mt-2"
                                    @click="addDynamicAttr"
                                    small
                                    v-if="action != 'view'"
                                    depressed
                                    color="primary"
                                >
                                    <v-icon class="mr-2" primary>{{
                                        addPanelAction == 'add'
                                            ? 'mdi-plus'
                                            : 'mdi-content-save'
                                    }}</v-icon>
                                    {{
                                        addPanelAction == 'add'
                                            ? $t('common.add')
                                            : $t('common.update')
                                    }}
                                </v-btn>
                            </div>
                        </div>
                    </v-menu>
                </div>

                <v-list dense>
                    <v-list-item-group color="primary">
                        <v-list-item
                            v-for="(
                                item, idx
                            ) in selectingNode.customAttributes"
                            :key="idx"
                            class="w-100 pl-2"
                            @click="selectAttrItem(idx)"
                        >
                            <v-list-item-content class="w-100 pl-2">
                                <div class="d-flex">
                                    <div class="fs-13">{{ item.name }}</div>
                                </div>
                                <div class="text-ellipsis grey--text fs-13">
                                    {{ item.value }}
                                </div>

                                <v-icon
                                    v-if="action != 'view'"
                                    @click.stop.prevent="removeDynamicItem(idx)"
                                    class="close-btn position-absolute float-right"
                                    size="14"
                                    style="right: 10px"
                                    >mdi-close</v-icon
                                >
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-tab-item>

            <v-tab-item :key="'style'" class="pa-2">
                <span class="fs-15 font-weight-medium">{{
                    $t('orgchart.editor.style')
                }}</span>
                <SearchNodeStyle
                    class="mt-2 mb-4"
                    @change-style-template="changeNodeStyle"
                    :change="Math.floor(Math.random() * 1000)"
                ></SearchNodeStyle>
                <form-tpl
                    :viewOnly="
                        action == 'view' || action == 'structureManagement'
                    "
                    :singleLine="false"
                    :labelWidth="'60px'"
                    :allInputs="nodeStyleConfig"
                ></form-tpl>

                <div class="w-100 mt-4">
                    <v-btn
                        class="float-left"
                        @click="prepareForSaveStyle"
                        small
                        depressed
                        >{{ $t('common.save') }}</v-btn
                    >

                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-on="on"
                                v-bind="attrs"
                                class="float-right"
                                @click="applyNodeStyle('single')"
                                small
                                depressed
                            >
                                <v-icon size="17">mdi-check-bold</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('orgchart.editor.singleApply') }}</span>
                    </v-tooltip>

                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-on="on"
                                v-bind="attrs"
                                class="float-right mr-2"
                                @click="applyNodeStyle('child')"
                                small
                                depressed
                            >
                                <v-icon size="17">mdi-check-all</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('orgchart.editor.applyForChild') }}</span>
                    </v-tooltip>
                </div>
            </v-tab-item>
        </v-tabs-items>

        <v-dialog v-model="showSaveStyleDialog" max-width="300">
            <v-card>
                <v-card-title class="headline">{{
                    $t('orgchart.editor.saveNodeConfigTitle')
                }}</v-card-title>
                <v-card-text>
                    <form-tpl
                        :singleLine="false"
                        :allInputs="nodeStyleConfigToSave"
                    ></form-tpl>
                </v-card-text>
                <v-card-actions class="mt-4">
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        small
                        depressed
                        @click="showSaveStyleDialog = false"
                        >{{ $t('common.close') }}</v-btn
                    >

                    <v-btn
                        color="primary"
                        small
                        depressed
                        @click="saveNodeStyleConfig"
                        >{{ $t('common.save') }}</v-btn
                    >
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import {
    getDefaultNodeData,
    SYMPER_HOME_ORGCHART,
    getNodeStyleConfig,
} from './nodeAttrFactory';
import FormTpl from '@/components/common/FormTpl';
import UserSelector from '@/views/tasks/userSelector.vue';
import { util } from '../../../plugins/util';
import { orgchartApi } from '../../../api/orgchart';
import { elementTools } from 'jointjs';
import SearchNodeStyle from '@/components/orgchart/editor/SearchNodeStyle';
import PermissionSelector from '@/components/permission/PermissionSelector.vue';
import MappingDocInstanceSelector from './MappingDocInstanceSelector';

export default {
    created() {
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (
                this.$refs.dynamicAttrForm &&
                $(evt.target).parents('.dynamic-attr-form-activator').length ==
                    0 &&
                $(evt.target).parents('.symper-dynamic-attr-form').length == 0
            ) {
                if ($(evt.target).parents('.symper-drag-panel').length == 0) {
                    this.openAddPanel = false;
                }
            }
        });
    },
    components: {
        'form-tpl': FormTpl,
        UserSelector,
        SearchNodeStyle,
        PermissionSelector,
        MappingDocInstanceSelector,
    },
    computed: {
        selectingNode() {
            let selectingNode =
                this.$store.state.orgchart.editor[this.instanceKey]
                    .selectingNode;
            if (selectingNode) {
                if (!selectingNode.dataFromDoc) {
                    selectingNode.dataFromDoc = {
                        users: [],
                    };
                }
            } else {
                selectingNode = {
                    dataFromDoc: {
                        users: [],
                    },
                };
            }
            return selectingNode;
        },
        homeConfig() {
            return this.$store.state.orgchart.editor[this.instanceKey]
                .homeConfig;
        },
    },
    props: {
        instanceKey: {
            default: '',
        },
        context: {
            default: 'department',
        },
        action: {
            type: String,
            default: 'create',
        },
    },
    watch: {
        selectingNode: {
            deep: true,
            immediate: true,
            handler(after) {
                for (let key in after.style) {
                    this.$set(
                        this.nodeStyleConfig,
                        key,
                        util.cloneDeep(after.style[key]),
                    );
                }
            },
        },
        isDefault(val) {
            this.handleAttrValueInput('isDefault', 'sdsadas', val);
        },
    },
    data() {
        return {
            showSaveStyleDialog: false,
            // nodeStyleConfigToSave: {
            //     name: '',
            //     description: '',
            //     shareMode: 1,
            //     content: ''
            // },
            nodeStyleConfigToSave: {
                name: {
                    title: this.$t('v2.orgchart.name'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                description: {
                    title: this.$t('v2.orgchart.description'),
                    type: 'text',
                    value: '',
                    info: '',
                },
            },
            nodeStyleConfig: getNodeStyleConfig(),
            SYMPER_HOME_ORGCHART: SYMPER_HOME_ORGCHART,
            showUpdateAttr: false,
            currentTab: null,
            openAddPanel: false,
            isDefault: false,
            addPanelAction: 'add',
            selectingAttrIndex: null,
            dynamicValueInputs: {
                name: {
                    title:  this.$t('v2.orgchart.name'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                value: {
                    title: this.$t('v2.orgchart.value'),
                    type: 'script',
                    value: '',
                    info: '',
                },
                dosePastApply: {
                    title: this.$t('v2.orgchart.applyForCreatedNodes'),
                    type: 'checkbox',
                    value: '',
                    info: '',
                },
                doseFutureApply: {
                    title: this.$t('v2.orgchart.applyForNewNodes'),
                    type: 'checkbox',
                    value: '',
                    info: '',
                },
            },
        };
    },
    methods: {
        selectedPermissions(data) {
            this.$store.commit('orgchart/updatePermissionsSelectingNode', {
                instanceKey: this.instanceKey,
                data: data,
            });
        },
        changeNodeStyle(styleData) {
            try {
                let style = styleData.content;
                for (let key in style) {
                    this.nodeStyleConfig[key].value = style[key];
                }
            } catch (error) {
                console.warn(error, this.$t('v2.orgchart.errorParsingDataMessage'));
            }
        },
        prepareForSaveStyle() {
            this.showSaveStyleDialog = true;
            this.nodeStyleConfigToSave.name.value = '';
            this.nodeStyleConfigToSave.description.value = '';
        },
        async saveNodeStyleConfig() {
            let content = {};
            for (let key in this.nodeStyleConfig) {
                content[key] = this.nodeStyleConfig[key].value;
            }
            delete content.public;
            let dataToSave = {
                name: this.nodeStyleConfigToSave.name.value,
                description: this.nodeStyleConfigToSave.description.value,
                shareMode: this.nodeStyleConfig.public.value ? 1 : 0,
                content: JSON.stringify(content),
            };
            let res = await orgchartApi.createNodeStyle(dataToSave);
            if (res.status == 200) {
                this.$snotifySuccess(this.$t('v2.orgchart.saveNodeStyleSuccessfully '));
                this.showSaveStyleDialog = false;
                this.$store.commit('orgchart/addNodeStyle', res.data);
            } else {
                this.$snotifyError(res, this.$t('v2.orgchart.canNotSaveNodeStyle'));
            }
        },
        applyNodeStyle(type) {
            this.$emit('apply-style-for-node', {
                data: this.nodeStyleConfig,
                type: type,
            });
        },
        updateDynamicAttrNodeDisplay() {
            this.$emit('update-dynamic-attr-display');
        },
        handleChangeUser(newValue) {
            this.$emit('change-user-select', newValue);
        },
        removeDynamicItem(index) {
            this.selectingNode.customAttributes.splice(index, 1);
            this.updateDynamicAttrNodeDisplay();
        },
        actionBeforeAddAttr() {
            this.addPanelAction = 'add';
            this.emptyAttrPanel();
            this.openAddPanel = true;
        },
        selectAttrItem(idx) {
            this.selectingAttrIndex = idx;
            this.addPanelAction = 'update';
            setTimeout(
                (self) => {
                    let idx = self.selectingAttrIndex;
                    let item = self.selectingNode.customAttributes[idx];
                    for (let key in item) {
                        if (self.dynamicValueInputs[key]) {
                            self.dynamicValueInputs[key].value = item[key];
                        }
                    }
                    self.openAddPanel = true;
                },
                200,
                this,
            );
        },
        updateDynamicAttrItem() {
            let item =
                this.selectingNode.customAttributes[this.selectingAttrIndex];
            for (let key in this.dynamicValueInputs) {
                item[key] = this.dynamicValueInputs[key].value;
            }
            this.updateDynamicAttrNodeDisplay();
        },
        validateBeforeAddDynamicAttr() {
            let passed = true;
            if (!this.dynamicValueInputs.name.value) {
                this.$snotifyError(
                    {},
                    this.$t('v2.orgchart.nameOfAttributeCanNotEmpty'),
                    '',
                    2000,
                );
                passed = false;
            }

            if (!this.dynamicValueInputs.value.value) {
                this.$snotifyError(
                    {},
                    this.$t('v2.orgchart.valueOfAttributeCanNotEmpty'),
                    '',
                    2000,
                );
                passed = false;
            }

            if (!this.checkDuplicateFieldName()) {
                passed = false;
            }
            return passed;
        },
        checkDuplicateFieldName() {
            let dynamicFieldNameMap = {};
            let allNode =
                this.$store.state.orgchart.editor[this.instanceKey].allNode;

            let newName = this.dynamicValueInputs.name.value;
            for (let nodeId in allNode) {
                for (let attr of allNode[nodeId].customAttributes) {
                    dynamicFieldNameMap[attr.name] = true;
                }
            }

            if (dynamicFieldNameMap[newName]) {
                this.$snotifyError(
                    {},
                    this.$t('v2.orgchart.proviedNameExisted'),
                    this.$t('v2.orgchart.pleaseEnterNewName'),
                );
                return false;
            } else {
                return true;
            }
        },
        addDynamicAttr() {
            let passed = this.validateBeforeAddDynamicAttr();
            if (!passed) {
                return;
            }
            if (this.addPanelAction == 'update') {
                this.updateDynamicAttrItem();
                this.openAddPanel = false;
                this.$snotifySuccess(
                    this.$t('v2.orgchart.updatedDynamicAttributeItem'),
                    '',
                    1500,
                );
                return;
            }
            let newItem = {};
            for (let key in this.dynamicValueInputs) {
                newItem[key] = this.dynamicValueInputs[key].value;
            }
            this.selectingNode.customAttributes.push(newItem);
            this.emptyAttrPanel();
            this.$snotifySuccess(this.$t('v2.orgchart.newDynamicAttributeCreated'), '', 1500);
            this.updateDynamicAttrNodeDisplay();
        },
        emptyAttrPanel() {
            for (let key in this.dynamicValueInputs) {
                this.dynamicValueInputs[key].value = '';
            }
        },
        handleChangeInputValue(value) {},
        handleAttrValueInput(name, inputInfo, data) {
            this.$emit('config-value-input', {
                name,
                inputInfo,
                data,
            });
        },
    },
};
</script>

<style scoped>
.view-only >>> .htAutocomplete,
.view-only >>> .symper-autocomplete-input,
.view-only >>> .pb-1 {
    pointer-events: none;
}
</style>
