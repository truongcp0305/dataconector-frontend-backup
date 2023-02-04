<template>
    <div class="content">
        <v-checkbox
            v-if="haveCreateAction.includes(objectType)"
            class="fs-13 sym-small-size"
            style="width: 100px"
            :label="$t('v2.acessControl.createNew')"
            dense
            @change="changeInputActionCreate"
            :input-value="create"
            :disabled="action == 'view' ? true : false"
        ></v-checkbox>
        <AgTable
            :tableHeight="tableHeight"
            :rowData="rowData"
            :objectType="objectType"
            :checkboxHeaderValue="checkboxHeaderValue"
            :listOperations="listOperations[objectType]"
            :operations="operations"
            :objectActions="objectActions"
            :key="objectType"
            @show-permission-control="getControlInDoc"
            ref="tableObject"
            @open-config-filter="openConfigFilter"
            :action="action"
        >
        </AgTable>
        <v-dialog
            v-model="showConfigFilter"
            width="500"
            content-class="bg-white h-100 "
            v-if="showConfigFilter"
        >
            <ConfigFilter
                ref="configFilter"
                @close="closeConfigFilter"
                :item="dataFilter"
                @save-filter="saveFilter"
                :listFilters="listFilters"
                :action="action"
            />
        </v-dialog>
    </div>
</template>

<script>
import SearchObjectCellRenderer from '../SearchObjectCellRenderer';
import { SearchObjectCellEditor } from '../SearchObjectCellEditor';
import { headerComponentRenderer } from '../headerComponentRenderer';
import ConfigFilterCellRenderer from '../ConfigFilterCellRenderer';
import AppSelector from './AppSelector.vue';
import AgTable from './AgTable.vue';
import AutocompleteInput from '@/views/document/submit/items/AutocompleteInput';
import { accessControlApi } from '@/api/accessControl';
import ConfigFilter from './ConfigFilter.vue';
import ActionPackWorker from 'worker-loader!@/worker/accessControl/ActionPack.Worker.js';

export default {
    components: {
        AppSelector,
        AutocompleteInput,
        AgTable,
        ConfigFilter
    },
    created() {
        this.objectActions =
            this.$store.state.actionPack.allActions[this.objectType];
        let self = this;
        this.$evtBus.$on('action-pack-click-detail-config-filter', (data) => {
            this.openConfigFilter(data);
        });
        this.actionPackWorker = new ActionPackWorker();
        this.actionPackWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'getControlInDoc':
                    self.$store.commit(
                        'actionPack/setPermissionControl',
                        data.dataAfter
                    );
                    let name =
                        self.$store.state.actionPack.operations
                            .document_definition[
                            'document_definition:' + data.dataAfter.id
                        ].title;
                    self.$emit('show-permission-control', {
                        id: data.dataAfter.id,
                        object: name
                    });
                    break;
                default:
                    break;
            }
        });
    },
    watch: {
        checkboxHeaderValue: {
            deep: true,
            immediate: true,
            handler(vl) {
                let self = this;
                for (let action of self.objectActions) {
                    $(`.checkbox-header-${action}`).prop('checked', vl[action]);
                }
            }
        }
    },
    props: {
        action: {
            type: String,
            default: 'create'
        },
        objectType: {
            type: String,
            default: 'document_definition'
        },
        listOperations: {
            type: Object,
            default() {
                return {};
            }
        },
        tableHeight: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            objectActions: [],
            haveCreateAction: [
                'document_definition',
                'orgchart',
                'dashboard',
                'workflow_definition',
                'dataset'
            ],
            notHaveColObject: [
                'account',
                'action_pack',
                'permission_pack',
                'system_role',
                'orgchart_role',
                'filter',
                'data_connector'
            ],
            disableColObject: [
                'document_definition',
                'document_instance',
                'workflow_definition',
                'dashboard',
                'stateflow_flow',
                'orgchart',
                'dashboard_tab'
            ],
            showConfigFilter: false,
            dataFilter: {
                actions: [],
                filters: []
            },
            allFilters: this.$store.state.actionPack.listFilters,
            listFilters: [],
            objIdenConfigFilter: '',
            actionPackWorker: null
        };
    },
    computed: {
        operations() {
            return this.$store.state.actionPack.operations[this.objectType]
                ? this.$store.state.actionPack.operations[this.objectType]
                : {};
        },
        checkboxHeaderValue() {
            let arr = {};
            let self = this;
            this.objectActions.map((e) => {
                let check = true;
                if (
                    !self.listOperations[self.objectType] ||
                    (self.listOperations[self.objectType] &&
                        Object.keys(self.listOperations[self.objectType])
                            .length == 0)
                ) {
                    check = false;
                } else if (self.listOperations[self.objectType]) {
                    for (let i in this.operations) {
                        if (
                            self.objectType == 'dataset' ||
                            (self.listOperations[self.objectType].includes(i) &&
                                !(
                                    this.haveCreateAction.includes(
                                        this.objectType
                                    ) && i.includes(':0')
                                ))
                        )
                            if (!this.operations[i].action.includes(e)) {
                                check = false;
                                break;
                            }
                    }
                }
                arr[e] = check;
            });
            return arr;
        },
        rowData() {
            let arr = [];
            let operations = this.operations;
            let rowTable = this.listOperations[this.objectType]
                ? this.listOperations[this.objectType]
                : [];
            for (let key in operations) {
                if (this.objectType == 'dataset' || rowTable.includes(key)) {
                    if (
                        !(
                            this.haveCreateAction.includes(this.objectType) &&
                            key.includes(':0')
                        )
                    ) {
                        let data = {
                            object: operations[key].title,
                            id: operations[key].id
                        };
                        for (let i in operations[key].action) {
                            data[operations[key].action[i]] = true;
                        }
                        if (this.objectType == 'dashboard_tab') {
                            data.nameDashboard = operations[key].nameDashboard;
                        }
                        data.configFilter = operations[key].filter;
                        arr.push(data);
                    }
                }
            }
            if (
                this.objectType == 'dataset' &&
                Object.keys(this.operations).length == 0
            ) {
                arr.push({ object: '', id: '0' });
            }
            if (
                this.notHaveColObject.includes(this.objectType) &&
                this.listOperations[this.objectType] &&
                this.listOperations[this.objectType].length == 0
            ) {
                arr.push({ object: '', id: '0' });
            }
            return arr;
        },
        create() {
            if (this.haveCreateAction.includes(this.objectType)) {
                return this.operations[this.objectType + ':0']
                    ? this.operations[this.objectType + ':0'].action.includes(
                          'create'
                      )
                        ? true
                        : false
                    : false;
            } else return false;
        }
    },
    methods: {
        getControlInDoc(params) {
            let objIden = 'document_definition:' + params.data.id;
            if (!this.operations[objIden].permissionControl) {
                this.actionPackWorker.postMessage({
                    action: 'getControlInDoc',
                    data: {
                        id: params.data.id
                    }
                });
            } else {
                this.$emit('show-permission-control', params.data);
            }
        },
        hideAutoCompete(evt) {
            if (
                this.$refs.autocompleteInput &&
                !$(evt.target).closest('.card-autocomplete').length
            ) {
                this.$refs.tableObject.hideAutoCompete();
            }
        },
        changeInputActionCreate(e) {
            this.$store.commit('actionPack/updateActionCreate', {
                objType: this.objectType,
                value: e
            });
        },
        openConfigFilter(data) {
            this.showConfigFilter = true;
            this.dataFilter.actions = data.action;
            let objIden =
                data.objectType == 'document_instance'
                    ? data.objectType + ':' + data.idObj + ':0'
                    : data.objectType + ':' + data.idObj;
            this.objIdenConfigFilter = objIden;
            this.dataFilter.filters = this.operations[objIden].filter;
            this.listFilters = this.allFilters.filter(
                (filter) => filter.objectIdentifier == objIden
            );
        },
        closeConfigFilter() {
            this.showConfigFilter = false;
            this.dataFilter = {
                actions: [],
                filters: []
            };
            this.listFilters = [];
        },
        saveFilter(filters) {
            let value = this.getListFilterValues(filters);
            for (let filter of filters) {
                filter.filterValues = value;
                filter.id = filter.conditions[0].children[0].column.id;
            }
            let data = {
                objectType: this.objectType,
                objIden: this.objIdenConfigFilter,
                filters: filters
            };
            this.$store.commit('actionPack/setFilterForObject', data);
            this.closeConfigFilter();
        },
        // trả về 1 công thức điều kiện sau khi kết hợp nhiều filter
        getListFilterValues(list) {
            let filter = [];
            list.map((f) => {
                if (f.conditions.length > 0) {
                    f.conditions.map((con) => {
                        filter.push(this.getFilterValues(con));
                    });
                }
            });
            return filter.join('OR');
        },
        // lấy từng công thức điều kiện cụ thể của 1 filter
        getFilterValues(node) {
            if (!node.condition) {
                let field = node.column ? node.column.formula : '';
                let conditionName = `${field}`;
                return ` ${conditionName} `;
            } else if (node.condition) {
                let arrCond = [];
                for (let childNode of node.children) {
                    let itemCond = this.getFilterValues(childNode);
                    arrCond.push(itemCond);
                }
                let opr = node.name == 'OR' ? '||' : '&&';
                let cond = arrCond.join(opr);
                return ` (${cond}) `;
            }
        }
    }
};
</script>

<style scoped>
.body,
.wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 0;
}
.wrapper {
    flex: 1;
}
.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 85%;
}
.ag-theme-balham >>> .ag-root-wrapper {
    border: unset !important;
}
.ag-theme-balham >>> .ag-header {
    height: 36px !important;
}
.ag-theme-balham >>> .checkbox-header {
    margin-right: 8px;
    margin-top: 0px;
    position: relative;
    top: 2px;
}
</style>