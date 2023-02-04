<template>
    <div class="h-100 d-flex flex-column">
        <div ref="commonConfig" class="mx-2">
            <FormTpl
                :titleSize="'normal'"
                :allInputs="commonInputs"
                @input-value-changed="handleValueChange"
            />
            <div
                v-if="commonInputs.saveAsDataset.value"
                class="mt-1 pb-2 d-flex justify-space-between"
            >
                <div class="fs-12 mr-2 h-100" style="line-height: 30px">
                    {{ $t('v2.dataflow.refreshOnly') }}
                </div>
                <PeriodTimeConfig
                    v-if="autoUpdatePeriod"
                    :value="autoUpdatePeriod"
                />
            </div>
        </div>

        <PerfectScrollbar
            :style="{ height: nodeConfigHeight + 'px' }"
            class="px-2"
        >
            <component
                :sideBarWidth="sideBarWidth"
                :idObject="idObject"
                :instanceKey="instanceKey"
                :height="nodeConfigHeight"
                :is="nodeConfigTag"
                :nodeData="selectingNode"
                @change-configs="handleConfigsChange"
                :key="selectingNode.id"
            >
            </component>
        </PerfectScrollbar>
    </div>
</template>

<script>
import PeriodTimeConfig from '@/components/dataflow/components/PeriodTimeConfig';
import FormTpl from '@/components/common/FormTpl.vue';
import { autoLoadNodeClasses } from '@/components/dataflow/configPool/dataflowConfig.js';
import _cloneDeep from 'lodash/cloneDeep';
import { util } from '../../../plugins/util';
import PerfectScrollbar from '@/components/common/PerfectScrollBar';
import { datasetApi } from '@/api/dataset.js';
let mapTypeToNodeClass = autoLoadNodeClasses();
function autoImportDataflowNodeConfig() {
    var context = require.context(
        '@/components/dataflow/components/configs',
        true,
        /\.(vue)$/
    );
    var comps = {};
    let filename = '';
    context.keys().forEach((filePath) => {
        filename = filePath.match(/[^\\/:*?"<>|\r\n]+$/)[0].replace('.vue', '');
        comps[filename] = context(filePath).default;
    });
    return comps;
}
var nodeConfigComps = autoImportDataflowNodeConfig();

export default {
    watch: {
        'commonInputs.saveAsDataset.value': {
            handler(newValue) {
                this.calcNodeConfigHeight();
            }
        },
        'selectingNode.id': {
            handler() {
                this.setCommonValue();
            }
        }
    },
    props: {
        sideBarWidth: {
            defaul: ''
        },
        instanceKey: {
            defaul: ''
        },
        idObject: {
            defaul: ''
        },
        action: {
            defaul: 'view'
        }
    },
    components: {
        ...nodeConfigComps,
        FormTpl,
        PeriodTimeConfig,
        PerfectScrollbar
    },
    mounted() {
        this.calcNodeConfigHeight();
    },
    created() {},
    computed: {
        autoUpdatePeriod() {
            if(this.selectingNode?.configs?.autoUpdatePeriod?.unit){
                this.selectingNode.configs.autoUpdatePeriod.unit = this.$t(
                    'v2.dataflow.' +
                        this.selectingNode.configs.autoUpdatePeriod.unit
                );
            }

            return this.selectingNode?.configs?.autoUpdatePeriod;
        },
        nodeConfigTag() {
            let currentNode =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .selectedWidget;
            let currentClassName = mapTypeToNodeClass[currentNode.type].name;
            return currentClassName;
        },
        selectingNode() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey]
                .selectedWidget;
        }
    },
    data() {
        return {
            nodeConfigHeight: 200,
            allDatasetColumn: {},
            commonInputs: {
                wgName: {
                    title: this.$t('common.name'),
                    type: 'text',
                    value: ''
                },
                wgDes: {
                    title: this.$t('common.description'),
                    type: 'text',
                    value: ''
                },
                saveAsDataset: {
                    title: this.$t('v2.dataflow.saveResultAsDataset'),
                    type: 'checkbox',
                    value: false
                }
            }
        };
    },
    methods: {
        createHomeConfigForDatasetName() {
            this.$store.state.dataflow.allDataflow[this.instanceKey].allWidget
                .home.datasetNameByNodeId
                ? ''
                : this.$set(
                      this.$store.state.dataflow.allDataflow[this.instanceKey]
                          .allWidget.home,
                      'datasetNameByNodeId',
                      {}
                  );
            this.addNameDatasetToStore();
        },
        addNameDatasetToStore() {
            let objDatasetName =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget.home.datasetNameByNodeId;
            let allWidget =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget;
            let noteIds = Object.keys(allWidget);
            noteIds.forEach((id) => {
                if (id != 'home') {
                    if (
                        allWidget[id].configs?.nameToSaveAs != '' &&
                        allWidget[id].configs?.saveAsDataset == true
                    ) {
                        this.$set(
                            objDatasetName,
                            allWidget[id].configs.nameToSaveAs,
                            [id]
                        );
                    }
                }
            });
        },
        changeDataNameInStore(id, oldName = '', newName) {
            if(String(newName).trim() != ''){
                this.$store.commit('dataflow/removeAndAddDatasetNameArr', {
                    id: id,
                    instanceKey: this.instanceKey,
                    newName: newName,
                    oldName: oldName
                });
            }
        },
        async handleConfigsChange(data) {
            if (typeof this.selectingNode.validateConfigs == 'function') {
                await this.selectingNode.validateConfigs(data);
            }
            this.selectingNode.run(true, 'change-config', data);
            let self = this;
            setTimeout(() => {
                self.$evtBus.$emit('bi-dataflow-log-dataflow-change-config', {
                    data,
                    instanceKey: self.instanceKey
                });
            }, 0);
        },
        async handleValueChange(name, inputInfo, data) {
            if (this.selectingNode.type == 'home') {
                this.selectingNode.name = this.commonInputs.wgName.value;
                this.selectingNode.description = this.commonInputs.wgDes.value;
            } else {
                if (name == 'saveAsDataset') {
                    if (data) {
                        this.selectingNode.configs.saveAs = [
                            this.$t('v2.dataflow.saveResultAsDataset')
                        ];
                    } else {
                        this.selectingNode.configs.saveAs = [];
                    }
                    this.changeDataNameInStore(
                        this.selectingNode.id,
                        this.selectingNode.configs.nameToSaveAs,
                        ''
                    );
                    this.toggleSaveAsDatasetConfig();
                    this.calcNodeConfigHeight();
                } else if (name == 'nameToSaveAs') {
                    let newName = util.str.nonAccentVietnamese(
                        this.commonInputs.nameToSaveAs.value
                    );
                    if (newName != this.selectingNode.configs.nameToSaveAs) {
                        this.changeDataNameInStore(
                            this.selectingNode.id,
                            this.selectingNode.configs.nameToSaveAs,
                            newName
                        );
                    }
                    let isDuplicateName =
                        await this.checkDuplicateDatasetName(newName);

                    this.commonInputs.nameToSaveAs.validateStatus = {
                        isValid: !isDuplicateName,
                        message: this.$t('v2.dataflow.duplicateDataSetName')
                    };

                    this.commonInputs.nameToSaveAs.value = newName;
                    this.$set(this.commonInputs.nameToSaveAs, 'value', newName);
                    this.validateDatasetName(newName);
                }

                for (let key in this.commonInputs) {
                    this.selectingNode.configs[key] =
                        this.commonInputs[key].value;
                }

                this.$emit('node-name-changed', {
                    name,
                    value: data
                });
            }
        },
        async validateDatasetName(newName) {
            let self = this;
            let notifyInvalidDatasetName = function (detail) {
                self.$snotifyError(
                    {},
                    self.$t('v2.dataflow.dataSetNameHasBeenUseUseAnotherOne'),
                    detail
                );
            };
            // validate các tên đặt ở trong cùng dataset này
            let allNode =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget;
            let currentNode = this.selectingNode.id;
            for (let nodeId in allNode) {
                if (nodeId == currentNode || nodeId == 'home') {
                    continue;
                }
                let node = allNode[nodeId];
                if (
                    node?.configs.saveAsDataset &&
                    node?.configs.nameToSaveAs == newName
                ) {
                    notifyInvalidDatasetName('');
                }
            }
            // validate các tên đặt đã lưu ở server
        },
        calcNodeConfigHeight() {
            setTimeout(
                (self) => {
                    self.nodeConfigHeight =
                        util.getComponentSize(self).h -
                        util.getComponentSize(self.$refs.commonConfig).h;
                },
                100,
                this
            );
        },
        setCommonValue() {
            let node = this.selectingNode;
            if (node.type == 'home') {
                this.commonInputs.wgName.value = node.name;
                this.commonInputs.wgDes.value = node.description;
            } else {
                this.commonInputs.wgName.value = node.configs.wgName;
                this.commonInputs.wgDes.value = node.configs.wgDes;
                this.commonInputs.saveAsDataset.value = node.configs.saveAs
                    .length
                    ? true
                    : false;
            }
            this.toggleSaveAsDatasetConfig();
        },
        async checkDuplicateDatasetName(newName = null) {
            if(!newName){
                return false;
            }
            let isDuplicateName = false;
            let objDatasetName =
                this.$store.state.dataflow.allDataflow[this.instanceKey]
                    .allWidget.home.datasetNameByNodeId;
            let name = newName
                ? newName
                : this.selectingNode.configs.nameToSaveAs;
            if(Array.isArray(objDatasetName[name]) && objDatasetName[name].length>1){
                isDuplicateName=true
            }else{
                let res = await datasetApi
                .getListDatasetByName(
                    name,
                    this.idObject,
                    this.selectingNode.id
                )
                if (res.status == 200) {
                    isDuplicateName = true;
                }
            }
            return isDuplicateName;
        },
        async toggleSaveAsDatasetConfig() {
            if (
                this.commonInputs.saveAsDataset.value &&
                this.selectingNode.type != 'home'
            ) {
                this.changeDataNameInStore(
                    this.selectingNode.id,
                    '',
                    this.selectingNode.configs.nameToSaveAs
                );
                this.$set(this.commonInputs, 'nameToSaveAs', {
                    title: this.$t('bi.dataset.title-add'),
                    type: 'text',
                    value: this.selectingNode.configs.nameToSaveAs,
                    validateStatus: {
                        isValid: !(await this.checkDuplicateDatasetName()),
                        message: this.$t('v2.dataflow.duplicateDataSetName')
                    }
                });
            } else {
                this.$delete(this.commonInputs, 'nameToSaveAs');
            }
        }
    }
};
</script>

<style></style>
