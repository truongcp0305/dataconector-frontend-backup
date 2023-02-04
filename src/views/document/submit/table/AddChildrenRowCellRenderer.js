export const AddChildrenRowCellRenderer = () => {};
import { util } from '@/plugins/util.js';
import store from '../../../../store';
import FormulasWorker from 'worker-loader!@/worker/document/submit/Formulas.Worker.js';
AddChildrenRowCellRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('div');
    this.eGui.classList.add('add-row-group');
    this.eGui.innerHTML =
        '<span ><i  style="font-size:15px" class="v-icon notranslate mdi mdi-plus theme--light"></i></span>';
    // thêm dòng con
    this.eGui.addEventListener('click', function (e) {
        if (params.colDef.isInsertRow) {
            let fieldGroup = store.state.document.submit.rowGroup;
            let rowIndex = params.node ? params.node.rowIndex : 0;
            let newGroupRow = util.cloneDeep(params.data);
            let i = 0;
            for (let controlName in newGroupRow) {
                if (controlName.indexOf('s_table_id_sql_lite') != -1) {
                    newGroupRow[controlName] = Date.now() + i;
                }
                if (controlName.indexOf('childObjectId') != -1) {
                    newGroupRow[controlName] = '';
                }
                let rowGroup = fieldGroup.rowGroup.find(
                    (ele) => ele.name == controlName,
                );
                if (!rowGroup) {
                    newGroupRow[controlName] = '';
                }
                i++;
            }
            let rowAdd = { add: [newGroupRow], addIndex: rowIndex + 1 };
            params.api.applyTransaction(rowAdd);
            let formulas = new FormulasWorker();
            formulas.postMessage({
                action: 'executeSQliteDB',
                data: {
                    func: 'insertRow',
                    columns: Object.keys(newGroupRow),
                    rowData: Object.values(newGroupRow),
                    keyInstance: fieldGroup.instance,
                    tableName: fieldGroup.tableName,
                },
            });
        }
    });
};

AddChildrenRowCellRenderer.prototype.getGui = function () {
    return this.eGui;
};
