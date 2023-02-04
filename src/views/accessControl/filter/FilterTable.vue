<template>
    <div class="mt-2 filter-permission">
        <div class="fs-14 fw-430">{{$t('v2.acessControl.decentralizeDataForObject')}}</div>
        <div class="fs-12">
            {{$t('v2.acessControl.actionsOverridePermissions')}}
        </div>
        <div class="filter-table w-100 mt-2">
            <table class="fs-12 w-100">
                <tr class="header-table">
                    <td class="center" style="width: 200px">{{$t('v2.doc.text')}}</td>
                    <td class="center">{{$t('v2.acessControl.filter')}}</td>
                </tr>
                <tr
                    v-if="
                        JSON.stringify(rowDataFormatted) == '[]' ||
                        rowDataFormatted.every((r) => r.listFilter == 0) ||
                        !showTable
                    "
                    style="height: 20px"
                >
                    <td class="center" style="width: 200px"></td>
                    <td class="center"></td>
                </tr>

                <tr
                    style="min-height: 30px"
                    v-for="(row, index) in rowDataFormatted"
                    v-show="row.listFilter.length > 0 && showTable"
                    :key="index"
                >
                    <td class="pl-2" style="width: 200px">
                        <div class="pt-1 name-object">{{ row.nameObj }}</div>
                    </td>
                    <td class="pl-1">
                        <v-combobox
                            class="filter"
                            v-model="row.listSelected"
                            :items="row.listFilter"
                            @change="changeSelected"
                            multiple
                            item-text="name"
                            item-value="id"
                            chips
                            clear-icon
                            :menu-props="{ openOnClick: false }"
                            ><template v-slot:selection="{ item }">
                                <v-menu
                                    bottom
                                    style="background: white !important"
                                    :close-on-content-click="false"
                                    class="bg-white"
                                    nudge-bottom="33"
                                >
                                    <template
                                        class="bg-white pl-1"
                                        v-slot:activator="{ on }"
                                    >
                                        <v-chip
                                            v-on="on"
                                            @click.stop.prevent="
                                                getFilterIndex(item.id, index)
                                            "
                                            :color="'#f2f2f2'"
                                            label
                                            class="ml-1 px-1 py-0"
                                            clearable
                                        >
                                            <v-list-item-content dense>
                                                <v-list-item-title>
                                                    <span class="fs-12">{{
                                                        item.name
                                                    }}</span>
                                                </v-list-item-title>
                                                <v-list-item-subtitle
                                                    style="margin-top: -3px"
                                                    v-if="
                                                        row.listSelected
                                                            .length > 0
                                                    "
                                                >
                                                    <span
                                                        class="fw-430 mr-2 action"
                                                        >{{$t('v2.acessControl.action')}}</span
                                                    >
                                                    <span class="list-action">{{
                                                        showAction(item.action)
                                                    }}</span>
                                                </v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-chip>
                                    </template>
                                    <div
                                        class="bg-white pl-1"
                                        style="max-height: 170px"
                                        v-if="row.listSelected.length > 0"
                                    >
                                        <div class="fs-11 fw-430 pb-2 pt-1">
                                            {{$t('v2.acessControl.chooseAction')}}
                                        </div>
                                        <div
                                            class="d-flex justify-space-between color-grey mb-1"
                                            style="height: 20px"
                                            v-for="(
                                                action, actIdx
                                            ) in currentFilter"
                                            :key="actIdx"
                                            @click="
                                                tickAction(
                                                    index,
                                                    item.id,
                                                    actIdx,
                                                )
                                            "
                                        >
                                            <div class="fs-11 pl-1">
                                                {{
                                                    $t(
                                                        'actions.listActions.' +
                                                            objectActive +
                                                            '.' +
                                                            action.name,
                                                    )
                                                }}
                                            </div>
                                            <v-icon
                                                v-if="action.value"
                                                :size="10"
                                                color="success"
                                                class="mdi mdi-check mr-2"
                                            >
                                            </v-icon>
                                        </div>
                                    </div>
                                </v-menu>
                            </template>
                        </v-combobox>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>
<script>
import { util } from '@/plugins/util';
export default {
    props: {
        rowData: {
            type: Array,
            default() {
                return [];
            },
        },
        listFilter: {
            type: Array,
            default() {
                return [];
            },
        },
        listAction: {
            type: Array,
            default() {
                return [];
            },
        },
        objectActive: {
            type: String,
            default: 'document_definition',
        },
    },
    data() {
        return {
            currentFilter: [],
            listSelectedFilter: [],
            rowDataFormatted: [],
        };
    },
    created() {},
    computed: {
        actionCheck() {
            return this.currentFilter;
        },
        listObjectIdentify() {
            return this.$store.state.actionPack.allResource;
        },
        showTable() {
            return this.rowDataFormatted[0].objectIdentify.split(':')[0] ==
                this.objectActive
                ? true
                : false;
        },
        actions() {
            let listAction = [];
            this.listAction.map((act) => {
                if (act.data != 'object') {
                    listAction.push({
                        name: act.data,
                        value: false,
                    });
                }
            });
            return listAction;
        },
    },
    watch: {
        rowData() {
            this.getRowDataFilter();
        },
        objectActive() {
            this.getRowDataFilter();
            this.setFilter(this.listFilter);
        },
    },
    methods: {
        changeSelected() {
            this.setSelectedFilter();
        },
        // hiển thị các dòng trong table listFilter
        getRowDataFilter() {
            this.rowDataFormatted = [];
            let listAction = [];
            this.listAction.map((act) => {
                if (act.data != 'object') {
                    listAction.push({
                        name: act.data,
                        value: false,
                    });
                }
            });
            let rowFilter = this.rowDataFormatted.map((fil) => {
                return fil.nameObj;
            });
            this.rowData.map((row, idx) => {
                if (row.object && !rowFilter.includes(row.object)) {
                    let objectIdentify = this.getObjectIdentify(row.object);
                    let listFilter = util.cloneDeep(
                        this.getFilterForObj(objectIdentify),
                    );
                    let listSelected = util.cloneDeep(
                        this.setSelectedFilterRow(objectIdentify),
                    );
                    listFilter.map((filter, index) => {
                        listFilter[index].action = [];
                        listFilter[index].action = listAction;
                        listSelected.map((selected) => {
                            if (filter.id == selected.id) {
                                listFilter[index].action = selected.action;
                            }
                        });
                    });
                    const self = this;
                    self.rowDataFormatted.push({
                        nameObj: row.object,
                        listSelected: this.setSelectedFilterRow(objectIdentify),
                        objectIdentify: objectIdentify,
                        listFilter: listFilter,
                    });
                }
            });
        },
        getFilterIndex(filterId, rowIdx) {
            let listAction = [];
            this.listAction.map((act) => {
                if (act.data != 'object') {
                    listAction.push({
                        name: act.data,
                        value: false,
                    });
                }
            });
            this.currentFilter = listAction;
            this.rowDataFormatted[rowIdx].listSelected.map(
                (filter, filterIdx) => {
                    if (filter.id == filterId) {
                        this.currentFilter = filter.action ? filter.action : [];
                    }
                },
            );
        },
        tickAction(rowIdx, filterId, actionIdx) {
            console.log('tickaction');
            const self = this;
            self.rowDataFormatted[rowIdx].listSelected.map((filter, idx) => {
                if (filter.id == filterId) {
                    let action = util.cloneDeep(
                        self.rowDataFormatted[rowIdx].listSelected[idx],
                    ).action;
                    action[actionIdx].value = !action[actionIdx].value;
                    let filter = util.cloneDeep(
                        self.rowDataFormatted[rowIdx].listSelected[idx],
                    );
                    filter.action = action;
                    self.currentFilter = action;
                    self.$set(
                        this.rowDataFormatted[rowIdx].listSelected,
                        [idx],
                        filter,
                    );
                }
            });
            this.listFilter.map((fil, idx) => {
                if (fil.id == filterId) {
                    this.listFilter[idx].action = self.currentFilter;
                }
            });
        },
        setSelectedFilterRow(objectIdentify) {
            let listSelected = this.listFilter.filter(
                (f) => f.objectIdentifier == objectIdentify && f.selected,
            );
            return listSelected;
        },
        // set những filter được lựa chọn thành true và lưu action được chọn
        setSelectedFilter() {
            this.listFilter.map((fil, idx) => {
                if (fil.objectIdentifier.split(':')[0] == this.objectActive) {
                    this.listFilter[idx].selected = false;
                }
            });
            this.listFilter.map((filter, idx) => {
                this.rowDataFormatted.map((row) => {
                    if (row.listSelected.length > 0) {
                        row.listSelected.map((selected) => {
                            if (filter.id == selected.id) {
                                this.listFilter[idx].action = selected.action;
                                this.listFilter[idx].selected = true;
                            }
                        });
                    } else {
                        // trường hợp bỏ chọn hết
                        row.listFilter.map((fil) => {
                            if (filter.id == fil.id) {
                                this.listFilter[idx].selected = false;
                            }
                        });
                    }
                });
            });
        },
        showAction(item) {
            if (item && item.filter((act) => act.value).length > 0) {
                let allAction = item
                    .filter((act) => act.value)
                    .map((act) => {
                        return this.$t(
                            'actions.listActions.' +
                                this.objectActive +
                                '.' +
                                act.name,
                        );
                    });
                return allAction.join(' | ');
            } else {
                return '';
            }
        },

        getObjectIdentify(rowName) {
            let objectIdentifier = '';
            if (rowName && rowName.split('-')[1]) {
                let nameFilter = rowName.split('-')[0];
                if (nameFilter) {
                    objectIdentifier =
                        this.objectActive + ':' + nameFilter.trim();
                }
            }
            return objectIdentifier;
        },
        getFilterForObj(objIdentify) {
            return this.listFilter.filter(
                (f) => f.objectIdentifier == objIdentify,
            );
        },

        setFilter(listFilter) {
            if (listFilter.length > 0) {
                this.rowDataFormatted.map((row, rowIdx) => {
                    row.listFilter.map((fil) => {
                        fil.action = this.actions;
                    });
                    let listSelected = [];
                    listFilter.map((filter) => {
                        if (
                            row.objectIdentify == filter.objectIdentifier &&
                            filter.selected
                        ) {
                            let actions = util.cloneDeep(this.actions);
                            actions.map((act) => {
                                filter.action.map((selected) => {
                                    if (
                                        act.name == selected.name &&
                                        selected.value
                                    ) {
                                        act.value = true;
                                    }
                                });
                            });
                            filter.action = actions;
                            listSelected.push(filter);
                        }
                        this.$set(
                            this.rowDataFormatted[rowIdx],
                            'listSelected',
                            listSelected,
                        );
                    });
                });
            }
        },
    },
};
</script>
<style scoped>
table,
th,
td {
    border: 1px solid lightgrey;
}
.header-table {
    height: 30px;
}
.center {
    text-align: center;
}
.v-select {
    margin: 0px !important;
}
.filter-item {
    background: #f2f2f2;
    border-radius: 4px;
    display: inline-block.;
}
.name-object {
    min-height: 30px;
}
.v-text-field {
    padding-top: 0px;
    margin-top: 0px;
}
.color-grey:hover {
    background: #f2f2f2;
}
v-menu {
    min-width: 110px;
    overflow: hidden;
    max-height: 170px !important;
}
v-chip {
    max-width: 270px;
    margin-top: 2px;
    margin-bottom: 0px;
}
.action {
    color: orange;
    font-size: 9px;
}
.list-action {
    font-size: 9px;
    color: grey;
}
.filter-permission >>> .v-list-item__title {
    font-size: 11px !important;
}
.filter-permission >>> .mdi-checkbox-blank-outline {
    font-size: 20px !important;
}
.v-menu__content {
    background: white !important;
}
</style>
