<template>
    <div class="permission-control">
        <NotFoundScreen
            :emptyDataKey="'control-table-not-found'"
            v-if="rowDataTable.length == 0"
            class="mt-3"
        />
        <div v-else>
            <div class="fs-13 mt-3 fw-430">
                {{ $t('permissions.permissionControl.table') }}
            </div>
            <AgTable
                :tableHeight="rowDataTable.length * 30 + 50"
                :rowData="rowDataTable"
                :objectType="'control'"
                :checkboxHeaderValue="checkboxHeaderTable"
                :listOperations="allTable"
                :operations="operations"
                :objectActions="actionTable"
                ref="table"
                :action="action"
            >
            </AgTable>
        </div>
        <div v-for="(rowData, tblName) in dataControl" :key="tblName">
            <div class="fs-13 mb-2 fw-430">
                {{ $t('permissions.permissionControl.infoTable') }} :
                {{ tblName }}
            </div>
            <AgTable
                :tableHeight="rowData.length * 30 + 31"
                :rowData="rowData"
                :objectType="'control'"
                :checkboxHeaderValue="checkboxHeaderControl[tblName]"
                :listOperations="allControl['control:' + idDoc + ':' + tblName]"
                :operations="operations"
                :objectActions="actionControl"
                ref="control"
                :action="action"
            >
            </AgTable>
        </div>
    </div>
</template>
<script>
import NotFoundScreen from '@/components/common/NotFoundScreen';
import AgTable from './AgTable.vue';
export default {
    props: {
        action: {
            type: String,
            default: 'create'
        },
        idDoc: {
            type: String
        }
    },
    components: {
        NotFoundScreen,
        AgTable
    },

    data() {
        return {
            columnDefsTable: [],
            columnDefsControl: [],
            allTable:
                this.$store.state.actionPack.operations.document_definition[
                    'document_definition:' + this.idDoc
                ].permissionControl.table,
            allControl:
                this.$store.state.actionPack.operations.document_definition[
                    'document_definition:' + this.idDoc
                ].permissionControl.controlInTable,
            actionTable: this.$store.state.actionPack.allActions.document_table,
            actionControl:
                this.$store.state.actionPack.allActions.document_control
        };
    },
    computed: {
        operations() {
            if (this.$store.state.actionPack.operations.control)
                return this.$store.state.actionPack.operations.control;
            else return {};
        },
        rowDataTable() {
            let rowData = [];
            for (let table of this.allTable) {
                if (this.operations[table]) {
                    let row = {
                        object: this.operations[table].title,
                        name: this.operations[table].name,
                        id: this.operations[table].id
                    };
                    for (let action of this.operations[table].action) {
                        row[action] = true;
                    }
                    rowData.push(row);
                }
            }
            return rowData;
        },
        checkboxHeaderTable() {
            let arr = {};
            this.actionTable.map((e) => {
                let check = true;
                if (Object.keys(this.operations).length == 0) {
                    check = false;
                } else {
                    for (let i in this.operations) {
                        if (this.allTable.includes(i))
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
        dataControl() {
            let rowData = {};
            for (let key in this.allControl) {
                if (this.operations[key]) {
                    let nameTable = this.operations[key].name;
                    let data = [];
                    for (let id of this.allControl[key]) {
                        let row = {
                            object: this.operations[id].title,
                            name: this.operations[id].name,
                            id: this.operations[id].id
                        };
                        for (let action of this.operations[id].action) {
                            row[action] = true;
                        }
                        data.push(row);
                    }
                    rowData[nameTable] = data;
                }
            }
            return rowData;
        },
        checkboxHeaderControl() {
            let checkBox = {};
            let self = this;
            this.allTable.forEach((key) => {
                let arr = {};
                let nameTable = this.operations[key].name;
                this.actionControl.map((e) => {
                    let check = true;
                    if (Object.keys(self.operations).length == 0) {
                        check = false;
                    } else {
                        for (let i in self.operations) {
                            if (self.allControl[key].includes(i))
                                if (!self.operations[i].action.includes(e)) {
                                    check = false;
                                    break;
                                }
                        }
                    }
                    arr[e] = check;
                });
                checkBox[nameTable] = arr;
            });
            return checkBox;
        }
    },
    methods: {}
};
</script>
<style scoped>
.permission-control {
    overflow: auto;
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
.permission-control >>> .not-found-screen img {
    width: 400px !important;
}
</style>
