<template>
    <div style="padding: 0 0 20px 20px">
        <v-text-field
            v-model="searchKey"
            single-line
            append-icon="mdi-magnify"
            solo
            class="sym-small-size border-all mb-2 mr-5"
            :placeholder="$t('common.search')"
            @input="onQuickFilterChanged()"
            flat
        />
        <ag-grid-vue
            v-if="openCpn"
            :style="{
                width: '100%',
                height: tableHeight + 'px'
            }"
            :class="{
                'ag-theme-balham': true,
                'like-handson-table': true,
                'css-border': true,
                'ag-table': true
            }"
            :gridOptions="gridOptions"
            :defaultColDef="defaultColDef"
            :treeData="true"
            :autoGroupColumnDef="autoGroupColumnDef"
            :rowData="rowData"
            @model-updated="modelUpdated"
            @row-selected="onRowSelected"
        ></ag-grid-vue>

        <v-btn
            :class="{
                'filter-selected-item': true,
                'btn-active': isFilterSelecteditem
            }"
        >
            <v-icon style="font-size: 20px" @click="filterSelectedItem">
                mdi mdi-playlist-check
            </v-icon>
        </v-btn>
    </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import { orgchartApi } from '@/api/orgchart.js';
import { util } from '@/plugins/util';

export default {
    components: {
        'ag-grid-vue': AgGridVue
    },
    props: {
        idOrgchart: {
            type: String,
            default: '113'
        },
        level: {
            type: String,
            default: 'position'
        },
        selectedItems: {
            type: Array,
            default: function () {
                return [];
            }
        },
        editable: {
            type: Boolean,
            default: false
        },
        tableHeight: {
            type: Number,
            default: 600
        },
        typeSave: {
            type: String,
            default: 'code'
        },
        controlName: {
            type: String,
            default: ''
        },
        openCpn: {
            type: Boolean,
            default: false
        },
        selectMultiple: {
            type: Boolean
        },
        filterByUsers: {
            type: Array,
            default: function () {
                return [];
            }
        }
    },
    watch: {
        openCpn: {
            deep: true,
            immediate: true,
            handler: function () {
                if (!this.openCpn) return;
                // this.filterByUsers = ['1177', '973'];
                this.getOrgchartDetail();
                if (this.gridOptions) {
                    this.gridOptions.rowSelection = this.selectMultiple
                        ? 'multiple'
                        : 'single';
                }
            }
        }
    },
    methods: {
        checkUserInFilter(users) {
            let check = false;
            this.filterByUsers.map((f) => {
                users.map((user) => {
                    if (f == user) {
                        check = true;
                    }
                });
            });
            return check;
        },
        // trường hợp có filter theo id user
        handleFilterByUser() {
            let rowData = util.cloneDeep(this.rowData);
            let rows = [];
            this.configPosPath();
            for (let j in this.allPositions) {
                this.rowData.push(this.allPositions[j]);
            }
            this.configUserPath();
            for (let k in this.allUsers) {
                if (this.allUsers[k].name != '') {
                    this.rowData.push(this.allUsers[k]);
                }
            }
            if (this.level == 'department') {
                rows = util.cloneDeep(this.rowData);
                this.rowData = rowData;
            }

            if (this.level == 'position') {
                this.rowData.map((row) => {
                    let check = false;
                    if (row.users != '[]' && row.users) {
                        let users = JSON.parse(row.users);
                        check = this.checkUserInFilter(users);
                    }
                    if (check) {
                        rows.push(row);
                    }
                });
            } else if (this.level == 'user') {
                this.rowData.map((row) => {
                    if (row.userId && this.filterByUsers.includes(row.userId)) {
                        rows.push(row);
                    }
                });
            } else {
                let newRows = [];
                let path = [];
                rows.map((row) => {
                    let check = false;
                    if (row.users != '[]' && row.users) {
                        let users = JSON.parse(row.users);
                        check = this.checkUserInFilter(users);
                    }
                    if (check) {
                        path = [...path, ...row.path];
                    }
                });
                this.rowData.map((r) => {
                    if (path.includes(r.name)) {
                        newRows.push(r);
                    }
                });
                rows = newRows;
            }
            this.rowData = rows;
        },
        async getOrgchartDetail() {
            let res = await orgchartApi.getOrgchartDetail(this.idOrgchart);
            this.allDepartments = res.data.departments;
            this.allPositions = res.data.positions;
            this.allUsers = res.data.userInPostion;
            this.orgchart = res.data.orgchart;
            this.rowData = [];

            this.autoGroupColumnDef = {
                minWidth: 200,
                headerName: this.orgchart.name,
                minWidth: this.minWidth,
                cellRendererParams: this.cellRendererParams
            };
            this.configDpmPath();
            for (let key in this.allDepartments) {
                this.rowData.push(this.allDepartments[key]);
            }
            if (this.filterByUsers.length == 0) {
                if (this.level == 'position' || this.level == 'user') {
                    this.configPosPath();
                    for (let j in this.allPositions) {
                        this.rowData.push(this.allPositions[j]);
                    }
                }
                if (this.level == 'user') {
                    this.configUserPath();
                    for (let k in this.allUsers) {
                        if (this.allUsers[k].name != '') {
                            this.rowData.push(this.allUsers[k]);
                        }
                    }
                }
            } else {
                this.handleFilterByUser();
            }
        },
        configDpmPath() {
            let allDepartments = this.allDepartments;
            let idDpm = {};
            //tạo obj có key là id của department
            for (let i in allDepartments) {
                let id = allDepartments[i].vizId;
                idDpm[id] = allDepartments[i];
            }

            for (let key in allDepartments) {
                allDepartments[key].path = [];
                //check xem có phải department lớn nhất k
                if (allDepartments[key].vizParentId != '') {
                    //TH curDepartment có department cha
                    let vizParentId = allDepartments[key].vizParentId;
                    if (idDpm[vizParentId] && idDpm[vizParentId].path) {
                        // check xem dpm cha có path chưa, nếu có rồi thì gán bằng path của cha + push thêm con
                        allDepartments[key].path = util.cloneDeep(
                            idDpm[vizParentId].path
                        );
                        allDepartments[key].path.push(allDepartments[key].name);
                    } else {
                        // nếu dpm cha chưa có path thì lần theo từng dpm cha để push vào path
                        let path = [];
                        path.push(allDepartments[key].name);
                        this.addPath(vizParentId, idDpm, allDepartments, path);
                        path.reverse(); //đảo ngược vì path đang ngược
                        allDepartments[key].path = path;
                    }
                } else {
                    allDepartments[key].path.push(allDepartments[key].name);
                }
            }
        },

        configPosPath() {
            let allPositions = this.allPositions;
            let allDepartments = this.allDepartments;
            let idPos = {};
            //tạo obj có key là id của position
            for (let i in allPositions) {
                let id = allPositions[i].vizId;
                idPos[id] = allPositions[i];
            }
            let idDpm = {};
            //tạo obj có key là id của dpm
            for (let i in allDepartments) {
                let id = allDepartments[i].vizId;
                idDpm[id] = allDepartments[i];
            }
            for (let key in allPositions) {
                allPositions[key].path = [];
                let vizParentId = allPositions[key].vizParentId;
                // check xem cha của position có phải là position khác không, nếu không thì cha là dpm -> gán path là path của dpm cha + push current position
                if (!idPos[vizParentId]) {
                    allPositions[key].path = util.cloneDeep(
                        idDpm[vizParentId].path
                    );
                    allPositions[key].path.push(allPositions[key].name);
                } else {
                    //TH là con của position
                    //check xem position cha có path chưa, nếu có rồi thì clonedeep + push current position
                    if (idPos[vizParentId].path) {
                        allPositions[key].path = util.cloneDeep(
                            idPos[vizParentId].path
                        );
                        allPositions[key].path.push(allPositions[key].name);
                    } else {
                        // nếu chưa thì gọi hàm addPath
                        let path = [];
                        path.push(allPositions[key].name);
                        this.addPath(
                            vizParentId,
                            Object.assign(idPos, idDpm),
                            allPositions,
                            path
                        );
                        path.reverse(); //đảo ngược vì path đang ngược
                        allPositions[key].path = path;
                    }
                }
            }
        },
        addPath(vizParentId, idArr, allInfo, path) {
            path.push(idArr[vizParentId].name);
            vizParentId = idArr[vizParentId].vizParentId;
            if (vizParentId) {
                //check xem dpm cha có ông nội không, nếu có thì đệ quy lấy tiếp, không thì end
                this.addPath(vizParentId, idArr, allInfo, path);
            }
        },
        configUserPath() {
            this.getNameUser();
            let allUsers = this.allUsers;
            let allPositions = this.allPositions;
            let idPos = {};
            //tạo obj có key là id của position
            for (let i in allPositions) {
                let id = allPositions[i].id;
                idPos[id] = allPositions[i];
            }
            for (let key in allUsers) {
                let posId = allUsers[key].positionNodeId;
                allUsers[key].path = util.cloneDeep(idPos[posId].path);
                allUsers[key].path.push(allUsers[key].name);
            }
        },
        getNameUser() {
            //lấy tên user từ store
            let allUsersName = this.$store.state.app.mapIdToUsers;
            let allUsers = this.allUsers;
            for (let key in allUsers) {
                if (!allUsersName[allUsers[key].userId]) {
                    allUsers[key].name = '';
                } else
                    allUsers[key].name =
                        allUsersName[allUsers[key].userId].displayName;
            }
        },
        modelUpdated() {
            let self = this;
            self.gridOptions.api.forEachNode(function (node) {
                let check;
                if (node.data) {
                    if (node.data.type) {
                        check = self.checkDpmOrPos(node.data);
                        if (check && self.level == node.data.type) {
                            node.setSelected(true);
                        } else node.setSelected(false);
                    } else {
                        check = self.checkUser(node.data);
                        if (check) node.setSelected(true);
                        else node.setSelected(false);
                    }
                }
            });
        },
        checkDpmOrPos(data) {
            let key = this.typeSave == 'code' ? 'code' : 'vizId';
            let dataSave = this.idOrgchart + ':' + this.level + ':' + data[key];
            if (this.selectedItems.includes(dataSave)) return true;
            else return false;
        },
        checkUser(data) {
            let dataSave =
                this.idOrgchart +
                ':' +
                this.level +
                ':' +
                data.userId +
                ':' +
                data.positionNodeId;
            if (this.selectedItems.includes(dataSave)) return true;
            else return false;
        },
        onQuickFilterChanged() {
            this.gridOptions.api.setQuickFilter(this.searchKey);
        },
        filterSelectedItem() {
            document.activeElement.blur();
            this.isFilterSelecteditem = !this.isFilterSelecteditem;
            let selectedRows = this.gridOptions.api.getSelectedRows(); //lấy tất cả selected row

            //lấy path để lấy cha
            let fullPath = [];
            if (this.isFilterSelecteditem) {
                for (let key in selectedRows) {
                    fullPath = fullPath.concat(selectedRows[key].path);
                    fullPath.splice(fullPath.length - 1, 1); // nối tất cả cha của các con con
                }
                let newArr = this.getItemfromPath(fullPath, this.rowData);
                newArr = newArr.concat(selectedRows); //thêm con cuối cùng
                this.selectedArrs = [];
                this.gridOptions.api.setRowData(newArr);
            } else {
                this.selectedArrs = [];
                this.gridOptions.api.setRowData(this.rowData);
            }
        },
        getItemfromPath(fullPath, data) {
            let arr = [],
                newArr = [];
            //check cac path bi trung
            if (fullPath != []) {
                for (let i = 0; i < fullPath.length - 1; i++) {
                    if (!newArr.includes(fullPath[i])) {
                        newArr.push(fullPath[i]);
                    }
                }
            }
            // push các item vào arr
            for (let i = 0; i < newArr.length; i++) {
                data.forEach(function (e) {
                    if (e.name == newArr[i]) {
                        arr.push(e);
                    }
                });
            }
            return arr;
        },
        closeCpn() {
            this.isFilterSelecteditem = false;
            this.gridOptions.api.setRowData(this.rowData);
            this.selectedArrs = [];
        },
        saveConfig() {
            return this.selectedArrs;
        },
        onRowSelected(param) {
            let check = param.node.isSelected();
            if (check) {
                if (this.level == 'user') {
                    this.pushUser(param.node.data);
                } else this.pushDpmOrPos(param.node.data);
            } else {
                if (this.level == 'user') {
                    this.delUser(param.node.data);
                } else this.delDpmOrPos(param.node.data);
            }
        },
        pushDpmOrPos(data) {
            let type = this.typeSave;
            let key = type == 'code' ? 'code' : 'vizId';
            let dataSave = this.idOrgchart + ':' + this.level + ':' + data[key];
            if (!this.selectedItems.includes(dataSave)) {
                this.selectedItems.push(dataSave);
            }
            let selected = {
                name: data.name
            };
            selected[type] = dataSave;
            let found = this.selectedArrs.some(
                (el) => el[type] === selected[type]
            );
            if (!found) {
                this.selectedArrs.push(selected);
            }
        },
        pushUser(data) {
            let type = this.typeSave;
            let dataSave =
                this.idOrgchart +
                ':' +
                this.level +
                ':' +
                data.userId +
                ':' +
                data.positionNodeId;
            if (!this.selectedItems.includes(dataSave)) {
                this.selectedItems.push(dataSave);
            }
            let selected = {
                name: data.name
            };
            selected[type] = dataSave;
            let found = this.selectedArrs.some(
                (el) => el[type] === selected[type]
            );
            if (!found) {
                this.selectedArrs.push(selected);
            }
        },
        delDpmOrPos(data) {
            let key = this.typeSave == 'code' ? 'code' : 'vizId';
            let dataDel = this.idOrgchart + ':' + this.level + ':' + data[key];
            let index = this.selectedItems.indexOf(dataDel);
            if (index >= 0) {
                this.selectedItems.splice(index, 1);
                this.selectedArrs.splice(index, 1);
            }
        },
        delUser(data) {
            let dataDel =
                this.idOrgchart +
                ':' +
                this.level +
                ':' +
                data.userId +
                ':' +
                data.positionNodeId;
            let index = this.selectedItems.indexOf(dataDel);
            if (index >= 0) {
                this.selectedItems.splice(index, 1);
                this.selectedArrs.splice(index, 1);
            }
        }
    },
    data() {
        return {
            gridOptions: null,
            defaultColDef: null,
            rowData: [],
            cellRendererParams: {
                checkbox: true,
                suppressCount: true, //=true: k đếm số row con
                suppressDoubleClickExpand: false //=false: double click thì expand
            },
            autoGroupColumnDef: null,
            minWidth: 500,
            allDepartments: [],
            allPositions: [],
            allUsers: [],
            searchKey: '',
            isFilterSelecteditem: false,
            selectedArrs: []
        };
    },
    beforeMount() {
        self = this;
        self.defaultColDef = {
            resizable: true,
            flex: 1
        };
        self.gridOptions = {
            rowHeight: 28,
            groupDefaultExpanded: -1, //mở sẵn các row con
            // groupSelectsChildren: true, //check cha thì check con
            getDataPath: (data) => {
                return data.path;
            },
            animateRows: true, //thêm animation khi đóng mở group
            suppressRowClickSelection: true, //ko check row khi bấm vào row, phải bấm vào checkbox
            suppressCellSelection: true,
            rowSelection: this.selectMultiple ? 'multiple' : 'single',
            isRowSelectable: (node) => {
                if (self.level == 'user') {
                    if (node.data && !node.data.type) return true;
                    else return false;
                } else {
                    if (node.data && node.data.type == self.level) return true;
                    else return false;
                }
            }
        };
    }
};
</script>

<style scoped>
.like-handson-table >>> .ag-header {
    background-color: #ffffff;
}
.like-handson-table >>> .ag-row {
    background-color: #ffffff;
}
.like-handson-table >>> .ag-row:hover {
    background-color: unset;
}
.like-handson-table >>> .ag-header-cell,
.like-handson-table >>> .ag-cell {
    padding-left: 0 !important;
    color: #000 !important;
    width: calc(100% - 100px) !important;
    font-size: 13px;
}
.like-handson-table >>> .ag-group-expanded {
    color: #000 !important;
}
.v-btn--contained {
    box-shadow: unset !important;
}
.v-btn:not(.v-btn--round).v-size--default {
    min-width: unset !important;
    height: 28px !important;
    width: 36px !important;
    padding: 0 0 !important;
}
.css-border >>> .ag-row,
.css-border >>> .ag-header,
.css-border >>> .ag-root-wrapper {
    border: unset !important;
}
.css-border >>> .ag-cell:focus {
    border-color: var(--ag-range-selection-border-color, #2196f3) !important;
}

.like-handson-table >>> .ag-group-checkbox {
    position: relative !important;
    color: #000;
}
.ag-table {
    position: relative;
}
.filter-selected-item {
    position: absolute;
    top: 123px;
    right: 20px;
    z-index: 999999999;
}
.filter-selected-item .v-btn-content button:focus {
    background-color: unset !important;
}
.btn-active {
    background-color: var(--symper-color) !important;
    color: #fff !important;
}
.filter-selected-item .v-btn__content {
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
    top: 1px;
}
.filter-selected-item .v-icon {
    width: 100%;
    height: 100% !important;
}
</style>