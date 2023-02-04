<template>
    <div class="content">
        <ag-grid-vue
            class="ag-theme-balham agrid-table ag-list-items-table w-100 mt-2"
            :columnDefs="columnTable"
            :getContextMenuItems="getContextMenuItems"
            :style="{
                height: tableHeight + 'px'
            }"
            :defaultColDef="defaultColDef"
            :gridOptions="gridOptions"
            :rowData="rowData"
            @cell-key-down="onCellKeyDown"
            :key="objectType"
        >
        </ag-grid-vue>

        <AutocompleteInput
            v-if="objectType == 'dataset'"
            :usePositionBox="true"
            :customPosition="dragPanel"
            ref="autocompleteInput"
            @after-select-row="handleSelectObjectIdentifier"
        />
    </div>
</template>

<script>
import SearchObjectCellRenderer from '../SearchObjectCellRenderer';
import { SearchObjectCellEditor } from '../SearchObjectCellEditor';
import AutocompleteInput from '@/views/document/submit/items/AutocompleteInput';
import { headerComponentRenderer } from '../headerComponentRenderer';
import ConfigFilterCellRenderer from '../ConfigFilterCellRenderer';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import { AgGridVue } from 'ag-grid-vue';
import { accessControlApi } from '@/api/accessControl';
export default {
    components: {
        'ag-grid-vue': AgGridVue,
        AutocompleteInput
    },
    mounted() {
        this.gridOptions.domLayout = 'autoHeight';
        this.allHeader = $('.action-pack-panel .ag-header-cell');
        this.allHeader.on('keydown', (evt) => {
            if (evt.code == 'Space' || evt.code == 'Enter') {
                let data = {
                    e: evt,
                    col: evt.currentTarget.__agComponent.column.colId,
                    objectType: this.objectType,
                    instanceKey: this.instanceKey
                };
                this.clickCheckboxHeader(data, 'keydown');
            }
        });
    },
    created() {
        this.calcColumnTable();
        this.$evtBus.$on(
            'action-pack-click-checkbox-header',
            this.clickCheckboxHeader
        );
        this.$evtBus.$on('action-pack-search-objectIdentifier', (e) => {
            this.tableSearch.dataBody = [];
            if (e && e.type == 'All') {
                this.listObjectIdentifierSearch = [];
                this.dragPanel.width = e.cellWidth + 'px!important';
                this.handleSearchObjectIdentifier(e.e.target.value);
                this.dragPanel.left = e.position.left - 24 + 'px';
                this.dragPanel.top = e.position.top - 5 + 'px';
                if (this.$refs.autocompleteInput) {
                    this.$refs.autocompleteInput.setCurrentInput(e.e.target);
                    this.$refs.autocompleteInput.show(e, 'nameObject');
                    this.$refs.autocompleteInput.setTypeInput('autocomplete');
                    this.$refs.autocompleteInput.setControlValueKey(
                        'nameObject'
                    );
                }
            }
        });
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
            type: Array,
            default() {
                return [];
            }
        },
        tableHeight: {
            type: Number,
            default: 0
        },
        rowData: {
            type: Array,
            default: []
        },
        checkboxHeaderValue: {
            type: Object
        },
        operations: {
            type: Object
        },
        objectActions: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            columnTable: [],
            oldRange: [],
            instanceKey: Date.now(),
            defaultColDef: {
                sortable: true,
                resizable: true,
                autoHeight: true,
                filter: true,
                suppressKeyboardEvent: function (params) {
                    let keyCode = params.event.keyCode;
                    let event = params.event;
                    if (event.key == 'Tab') {
                        params.api.stopEditing();
                    }
                    if (keyCode == 13 && params.event.shiftKey) {
                        return true;
                    } else if (keyCode == 46 || keyCode == 8) {
                        return true;
                    }
                }
            },
            gridOptions: {
                headerHeight: 25,
                rowHeight: 30,
                enableRangeSelection: true,
                enableRangeHandle: true,
                suppressMultiRangeSelection: true,
                suppressClipboardPaste: true,
                applyColumnDefOrder: true,
                components: {
                    SearchObjectCellRenderer: SearchObjectCellRenderer,
                    SearchObjectCellEditor: SearchObjectCellEditor,
                    ConfigFilterCellRenderer: ConfigFilterCellRenderer
                }
            },
            dragPanel: {
                width: 300,
                top: 400,
                left: 0
            },
            tableSearch: {
                headers: [
                    {
                        value: 'nameObject',
                        text: this.$t('v2.acessControl.object')
                    }
                ],
                dataBody: []
            },
            listObjectIdentifierSearch: [],
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
            allHeader: []
        };
    },
    methods: {
        calcColumnTable() {
            const self = this;
            let cols = [];

            cols.push({
                field: 'index_increment',
                headerName: 'STT',
                suppressMenu: true,
                type: 'text',
                pinned: 'left',
                editable: false,
                valueGetter: (params) => {
                    return params.node.rowIndex + 1;
                },
                width: 50
            });
            if (this.objectType == 'dashboard_tab') {
                cols.push({
                    field: 'nameDashboard',
                    headerName: self.$t('v2.acessControl.nameDashboard'),
                    type: 'text',
                    editable: false,
                    pinned: 'left',
                    width: 100,
                    typeFor: 'All'
                });
            }
            if (!this.notHaveColObject.includes(this.objectType)) {
                if (this.objectType != 'control') {
                    cols.push({
                        field: 'id',
                        headerName: self.$t('v2.acessControl.id'),
                        type: 'text',
                        editable: false,
                        pinned: 'left',
                        cellRenderer: 'SearchObjectCellRenderer',
                        cellEditor: 'SearchObjectCellEditor',
                        width: 100,
                        typeFor: 'All'
                    });
                } else {
                    cols.push({
                        field: 'name',
                        headerName: this.$t('permissions.name_control'),
                        type: 'text',
                        editable: false,
                        pinned: 'left',
                        suppressMenu: true,
                        width: 100
                    });
                }
                cols.push({
                    field: 'object',
                    headerName: self.$t('v2.acessControl.nameObject'),
                    type: 'text',
                    pinned: 'left',
                    editable:
                        self.action != 'view' &&
                        !self.disableColObject.includes(this.objectType)
                            ? true
                            : false,
                    cellRenderer: 'SearchObjectCellRenderer',
                    cellEditor: 'SearchObjectCellEditor',
                    width: 250,
                    typeFor: 'All'
                });
            }

            this.objectActions.map((act) => {
                let colName =
                    this.objectType == 'control'
                        ? this.$t(`permissions.${act}`)
                        : this.$t(
                              `actions.listActions.${this.objectType}.${act}`
                          );
                cols.push({
                    field: act,
                    suppressMenu: true,
                    width: self.calcWidthColTable(colName),
                    editable: false,
                    headerName: colName,
                    suppressMovable: true,
                    resizable: false,
                    headerComponent: headerComponentRenderer,
                    headerComponentParams: {
                        valueCheckbox: this.checkboxHeaderValue[act],
                        objectType: this.objectType,
                        disabled: this.action == 'view' ? true : false,
                        instanceKey: this.instanceKey
                    },
                    cellRenderer: (params) => {
                        const eDiv = document.createElement('div');
                        let input = `<input class="checkboxActionPack" type='checkbox' ${
                            params.value ? 'checked' : ''
                        } />`;
                        if (self.action == 'view') {
                            input = `<input disabled class="checkboxActionPack" type='checkbox' ${
                                params.value ? 'checked' : ''
                            } />`;
                        }
                        eDiv.innerHTML =
                            '<span class="my-css-class">' + input + '</span>';
                        const eButton = eDiv.querySelectorAll(
                            '.checkboxActionPack'
                        )[0];
                        eButton.addEventListener('click', () => {
                            self.handleChangeOperation(params);
                        });
                        return eDiv;
                    }
                });
            });
            cols.push({
                field: 'configFilter',
                width: 200,
                suppressMenu: true,
                cellStyle: { 'white-space': 'normal' },
                autoHeight: true,
                resizable: false,
                editable: false,
                headerName: this.$t('v2.acessControl.filterConfig'),
                cellRenderer: 'ConfigFilterCellRenderer',
                cellRendererParams: {
                    listActions: this.objectActions,
                    objectType: this.objectType,
                    instanceKey: this.instanceKey
                }
            });
            if (this.objectType == 'document_definition') {
                cols.push({
                    width: 150,
                    field: 'permission_control',
                    headerName: 'Control',
                    suppressMenu: true,
                    type: 'text',
                    resizable: false,
                    editable: false,
                    cellRenderer: (params) => {
                        const eDiv = document.createElement('div');
                        let hasPermission =
                            self.checkHasPermissionControl(params);
                        let input = `<span class="permission-control" style="text-decoration: underline; cursor: pointer; color:${
                            hasPermission ? 'orange' : 'black'
                        }">${this.$t(
                            'v2.acessControl.decentralization'
                        )} </span>`;
                        eDiv.innerHTML = input;
                        const eButton = eDiv.querySelectorAll(
                            '.permission-control'
                        )[0];
                        eButton.addEventListener('click', () => {
                            self.showPermissionControl(params);
                        });
                        return eDiv;
                    }
                });
            }
            this.columnTable = cols;
        },
        showPermissionControl(params) {
            this.$emit('show-permission-control', params);
        },
        clickCheckboxHeader(e, action) {
            if (action == 'keydown') {
                $(`.checkbox-header-${e.col}`).click();
            } else if (e.instanceKey == this.instanceKey) {
                e.value = !this.checkboxHeaderValue[e.col];
                e.objIden =
                    this.objectType == 'dataset'
                        ? Object.keys(this.operations)
                        : this.listOperations;

                this.$store.commit(
                    'actionPack/setOneActionForAllObjectIdentifier',
                    e
                );
            }
        },
        // tìm kiếm đối tượng trong các cell
        async handleSearchObjectIdentifier(value) {
            let objectType = this.objectType;
            if (value.includes(' - ')) value = value.split(' - ')[0];
            if (objectType == 'document_instance')
                objectType = 'document_definition';
            const self = this;
            let search = {
                keyword: value,
                type: objectType
            };
            let res = await accessControlApi.getObjectIdentifier(search);
            if (res.status == 200) {
                self.listObjectIdentifierSearch = res.data;
                if (res.data.length == 0) {
                    self.listObjectIdentifierSearch = [{ id: '', name: '' }];
                }
                this.setAutocomplete();
            }
        },
        // set data cho phần search
        setAutocomplete() {
            this.tableSearch.dataBody = [];
            this.listObjectIdentifierSearch.map((object) => {
                if (object.objectIdentifier) {
                    let nameObject =
                        object.objectIdentifier.split(':')[1] +
                        ' - ' +
                        object.name;
                    if (nameObject != ' - ') {
                        this.tableSearch.dataBody.push({
                            nameObject: nameObject,
                            active: false
                        });
                    }
                }
            });
            if (this.$refs.autocompleteInput) {
                this.$refs.autocompleteInput.setAliasControl('nameObject');
                this.$refs.autocompleteInput.setData(this.tableSearch);
            }
        },
        hideAutoCompete(evt) {
            this.$ref.autocompleteInput.hide();
            if (this.gridOptions.api) {
                this.gridOptions.api.stopEditing(true);
                this.gridOptions.api.clearRangeSelection();
            }
        },
        handleSelectObjectIdentifier(value) {
            let currentCell = this.gridOptions.api.getFocusedCell();
            let name = value.value.inputDislay;
            let id = name.split(' - ')[0];
            name = name.split(' - ')[1];
            if (name && id) {
                let rowIndex = this.gridOptions.api.getFocusedCell().rowIndex;
                let rowModel = this.gridOptions.api.getModel();
                let rowNode = rowModel.rowsToDisplay[rowIndex];
                rowNode.setDataValue('object', name);
                rowNode.setDataValue('id', id);
                this.updateToStore(value.value.inputDislay);
            }
            this.gridOptions.api.stopEditing(true);
            this.gridOptions.api.setFocusedCell(
                currentCell.rowIndex,
                currentCell.column.colDef.field
            );
        },
        handleChangeOperation(params) {
            let data = {
                value: !params.value ? true : false,
                id: params.data.id,
                objectType: this.objectType,
                action: params.colDef.field
            };
            this.$store.commit('actionPack/changeOperation', data);
        },
        getContextMenuItems(params) {
            const self = this;
            let ignoreObject = [
                'document_definition',
                'workflow_definition',
                'dashboard',
                'dashboard_tab',
                'orgchart',
                'account',
                'data_connector',
                'system_role',
                'orgchart_role',
                'permission_pack',
                'filter',
                'action_pack',
                'stateflow_flow',
                'control'
            ];
            if (ignoreObject.includes(this.objectType)) {
                return [];
            }
            let submitContextItem = [
                {
                    name: self.$t('v2.acessControl.removeRow'),
                    action: function () {
                        self.gridOptions.api.applyTransaction({
                            remove: [params.node.data]
                        });
                    },
                    cssClasses: ['redFont']
                },
                {
                    name: self.$t('v2.acessControl.addRow'),
                    shortcut: 'Shift + Enter',
                    action: function () {
                        let row = { object: '', id: '0' };
                        params.api.applyTransaction({
                            add: [row],
                            addIndex: params.node.rowIndex + 1
                        });
                    },
                    cssClasses: ['redFont']
                }
            ];
            return submitContextItem;
        },
        updateToStore(value) {
            let id = value.split(' - ')[0];
            let name = value.split(' - ')[1];
            let objIden = this.objectType + ':' + id;
            let data = {
                id: id,
                title: name,
                objIden: objIden,
                objectType: this.objectType
            };
            this.$store.commit('actionPack/addNewObjectIdentifier', data);
        },
        onCellKeyDown(params) {
            let event = params.event;
            let objectCanEdit = ['dataset'];
            if (
                params.colDef.field == 'configFilter' &&
                (event.key == 'Enter' || event.code == 'Space')
            ) {
                let column = [];
                this.columnTable.forEach((col) => {
                    if (this.objectActions.includes(col.field)) {
                        column.push({
                            field: col.field,
                            headerName: col.headerName
                        });
                    }
                });
                let data = {
                    action: column,
                    objectType: this.objectType,
                    idObj: params.data.id
                };
                this.$emit('open-config-filter', data);
            } else if (
                params.colDef.field == 'permission_control' &&
                (event.key == 'Enter' || event.code == 'Space')
            ) {
                this.showPermissionControl(params);
            } else {
                if (
                    event.key == 'Enter' &&
                    objectCanEdit.includes(this.objectType)
                ) {
                    if (this.$refs.autocompleteInput) {
                        this.$refs.autocompleteInput.hide();
                    }
                }
                if (
                    event.key == 'Enter' &&
                    event.shiftKey &&
                    objectCanEdit.includes(this.objectType)
                ) {
                    let index = params.node.rowIndex + 1;
                    let row = { object: '' };
                    this.gridOptions.api.applyTransaction({
                        add: [row],
                        addIndex: index
                    });
                }
                if (
                    (event.key == 'Enter' || event.code == 'Space') &&
                    params.colDef.field != 'object' &&
                    params.colDef.field != 'index_increment'
                )
                    this.handleEnterOrSpace(params);
            }
        },
        // xử lý tích action bằng space hoặc enter
        handleEnterOrSpace(params) {
            let cellRanges = this.gridOptions.api.getCellRanges();
            let startRow = cellRanges[0].startRow.rowIndex;
            let endRow = cellRanges[0].endRow.rowIndex;
            let actions = cellRanges[0].columns.map((col) => col.colId);
            if (
                cellRanges[0] &&
                cellRanges[0].columns.length == 1 &&
                endRow == startRow
            ) {
                let field = params.colDef.field;
                params.node.setDataValue(field, !params.value);
                this.handleChangeOperation(params);
            } else if (
                cellRanges[0] &&
                (cellRanges[0].columns.length > 1 || endRow != startRow)
            ) {
                let check = false;
                for (let i = startRow; i <= endRow; i++) {
                    for (let action of actions) {
                        if (!this.rowData[i][action]) {
                            check = true;
                            break;
                        }
                    }
                }

                let objId = [];
                for (let i = startRow; i <= endRow; i++) {
                    objId.push(this.rowData[i].id);
                }
                let data = {
                    value: check,
                    objId: objId,
                    actions: actions,
                    objectType: this.objectType
                };
                this.$store.commit('actionPack/changeMultiOperations', data);
            }
        },
        calcWidthColTable(colName) {
            let widthCharacter = 7;
            let widthCol = widthCharacter * colName.length + 50;
            return widthCol < 50 ? 50 : widthCol;
        },
        checkHasPermissionControl(params) {
            let check = false;
            let allControl = this.$store.state.actionPack.operations.control;
            let idObj = params.data.id;
            for (let id in allControl) {
                if (id.includes(':' + idObj + ':')) {
                    if (allControl[id].action.length > 0) {
                        check = true;
                        break;
                    }
                }
            }
            return check;
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