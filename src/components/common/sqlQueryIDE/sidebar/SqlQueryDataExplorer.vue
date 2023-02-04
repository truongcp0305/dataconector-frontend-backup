<template>
    <div class="px-1 h-100">
        <!-- Column header -->
        <v-row v-if="showColumn" class="mx-1 pt-1">
            <v-btn
                elevation="0"
                class="px-0 py-3"
                x-small
                color="#F2F2F2"
                @click="showColumn = false"
            >
                <v-icon dark dense color="black">mdi-chevron-left</v-icon>
            </v-btn>
            <v-col md="10" class="ps-2 pt-1 pb-0">
                <span class="body-2">{{
                    headerColumn.tableParentAliasName
                }}</span
                >&nbsp;
                <span class="caption" style="color: #999999">{{
                    headerColumn.tableParentName
                }}</span>
                <v-icon dense color="black">mdi-chevron-right</v-icon>
                <v-icon small color="#FF8003">
                    {{
                        headerColumn.tableType == 'view'
                            ? 'mdi-set-merge'
                            : 'mdi-table-large'
                    }} </v-icon
                >&nbsp;
                <span class="body-2" style="color: #ff8003">{{
                    headerColumn.tableChildName
                }}</span>
            </v-col>
        </v-row>
        <!-- Column header end -->

        <!-- Search -->
        <v-row class="mx-1 pt-1">
            <v-col class="p-0">
                <v-text-field
                    solo
                    height="20"
                    dense
                    background-color="#F7F7F7"
                    flat
                    hide-details
                    :placeholder="
                        showColumn
                            ? $t('sqlQueryIDE.searchColumn')
                            : $t('sqlQueryIDE.searchDataset')
                    "
                    v-model="searchKey"
                    v-on:keyup.enter="searchData"
                >
                    <template v-slot:append>
                        <v-icon dense> mdi-magnify </v-icon>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <!-- Search end -->

        <!-- List table parent -->
        <div
            style="height: calc(100% - 40px)"
            v-if="!showColumn && !isEmptyTableParent"
            class="mt-2 w-100"
        >
            <VuePerfectScrollbar :style="{ height: '100%' }">
                <v-list dense nav class="p-0">
                    <template v-for="item in listTable">
                        <v-hover v-slot:default="{ hover }">
                            <v-list-group
                                :key="item.id"
                                dense
                                active-class="grey lighten-3 black--text"
                            >
                                <template v-slot:activator>
                                    <v-list-item-title class="py-1">
                                        <v-icon dense color="#666666"
                                            >mdi-table</v-icon
                                        >
                                        <span class="ms-2 body-2">{{
                                            item.aliasName
                                        }}</span>
                                        <span
                                            class="ms-2 caption"
                                            style="color: #999999"
                                            >{{ item.name }}</span
                                        >
                                    </v-list-item-title>
                                </template>
                                <template v-slot:appendIcon>
                                    <v-menu offset-y>
                                        <template
                                            v-slot:activator="{ on, attrs }"
                                        >
                                            <v-icon
                                                dense
                                                v-on:click.stop
                                                v-bind="attrs"
                                                v-on="on"
                                                class="h"
                                                color="#707070"
                                                v-show="hover"
                                            >
                                                mdi-information-outline
                                            </v-icon>
                                        </template>
                                        <v-list subheader dense>
                                            <v-subheader>{{
                                                $t(
                                                    'sqlQueryIDE.informationDataset',
                                                )
                                            }}</v-subheader>
                                            <v-list-item dense>
                                                <v-list-item-title
                                                    class="
                                                        caption
                                                        font-weight-regular
                                                    "
                                                >
                                                    {{ $t('common.title') }}:
                                                    {{ item.aliasName }}
                                                </v-list-item-title>
                                            </v-list-item>
                                            <v-list-item dense>
                                                <v-list-item-title
                                                    class="
                                                        caption
                                                        font-weight-regular
                                                    "
                                                >
                                                    <span class="me-6"
                                                        >{{
                                                            $t('common.name')
                                                        }}:</span
                                                    >{{ item.name }}
                                                </v-list-item-title>
                                            </v-list-item>
                                            <v-list-item>
                                                <v-list-item-title
                                                    class="
                                                        caption
                                                        font-weight-regular
                                                    "
                                                >
                                                    <span class="me-4"
                                                        >{{
                                                            $t('common.type')
                                                        }}:</span
                                                    >
                                                    {{ item.type }}
                                                </v-list-item-title>
                                            </v-list-item>
                                            <v-list-item>
                                                <v-list-item-title
                                                    class="
                                                        caption
                                                        font-weight-regular
                                                    "
                                                >
                                                    <span class="me-8"
                                                        >{{
                                                            $t('common.id')
                                                        }}:</span
                                                    >
                                                    {{ item.id }}
                                                </v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                    <v-icon color="black" v-show="hover"
                                        >mdi-chevron-down</v-icon
                                    >
                                </template>
                                <ItemDataExplorer
                                    :tableParent="item"
                                    @get-column="getColumn"
                                />
                            </v-list-group>
                        </v-hover>
                    </template>
                </v-list>
            </VuePerfectScrollbar>
        </div>
        <div
            class="mt-10 text-center"
            v-if="!showColumn && isEmptyTableParent"
            style="width: 100%"
        >
            <p class="ms-2 mt-2" style="font-size: 14px">
                {{ $t('sqlQueryIDE.emptyColumn') }}
            </p>
        </div>
        <!-- List table parent end -->

        <!-- List column -->
        <div
            class="mt-1"
            v-if="showColumn && !isEmptyColumn"
            style="width: 100%; height: 80%"
        >
            <VuePerfectScrollbar :style="{ height: '100%' }">
                <v-list dense nav class="p-0">
                    <v-list-item-group>
                        <v-list-item
                            dense
                            v-for="item in listColumn"
                            :key="item.id"
                            @click="chooseColumn(item.name)"
                        >
                            <v-list-item-title
                                class="caption font-weight-regular"
                            >
                                <v-icon
                                    dense
                                    color="#666666"
                                    v-if="item.type == 'number'"
                                    >mdi-numeric</v-icon
                                >
                                <v-icon
                                    dense
                                    color="#666666"
                                    v-else-if="item.type == 'datetime'"
                                    >mdi-calendar-month-outline</v-icon
                                >
                                <v-icon
                                    dense
                                    color="#666666"
                                    v-else-if="item.type == 'text'"
                                    >mdi-text</v-icon
                                >
                                <span class="ms-2 body-2">{{
                                    item.title
                                }}</span>
                                <span
                                    class="ms-2 caption"
                                    style="color: #999999"
                                    >{{ item.name }}</span
                                >
                            </v-list-item-title>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </VuePerfectScrollbar>
        </div>
        <div
            class="mt-10 text-center"
            v-if="showColumn && isEmptyColumn"
            style="width: 100%"
        >
            <p class="ms-2 mt-2" style="font-size: 14px">
                {{ $t('sqlQueryIDE.emptyColumn') }}
            </p>
        </div>
        <!-- List column end -->

        <!-- Pagination -->
        <Pagination
            v-if="!showColumn && !isEmptyTableParent"
            :total="totalRecord"
            :totalVisible="7"
            :hide-total-section="true"
            paginationMode="auto"
            :containerWidth="containerWidth"
            :pageSizeOptions="pageSizeArray"
            @on-change-page-size="changePageSize"
            @on-change-page="changePage"
        >
        </Pagination>
    </div>
</template>

<script>
import { datasetApi } from '@/api/dataset.js';
import { biApi } from '@/api/bi.js';
import ItemDataExplorer from './ItemDataExplorer.vue';
import Pagination from '@/components/common/Pagination';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

export default {
    components: {
        ItemDataExplorer,
        Pagination,
        VuePerfectScrollbar,
    },
    props: {
        contentRightWidth: { type: String, default: '400px' },
    },
    data() {
        return {
            listTable: [],
            searchKey: '',
            page: 1,
            pageSize: 10,
            showColumn: false,
            listColumn: [],
            headerColumn: {},
            cacheListColumn: [],
            totalRecord: 0,
            pageSizeArray: [10, 50, 75, 100],
            isEmptyColumn: false,
            isEmptyTableParent: false,
            containerWidth: 400,
        };
    },
    created() {
        this.getDatasetList();
    },
    mounted() {},
    watch: {},
    methods: {
        setContainerWidth(index) {
            let contentRightWidth = index.replace('px', '');
            this.containerWidth = Number(contentRightWidth);
        },
        getDatasetList(key = '') {
            const h = [0];
            let filter = {
                filter: [
                    {
                        column: 'idParent',
                        operation: 'and',
                        conditions: [
                            {
                                name: 'in',
                                value: h,
                            },
                        ],
                    },
                ],
                search: key,
                page: this.page,
                pageSize: this.pageSize,
            };
            datasetApi.getListByFilter(filter).then((res) => {
                if (res.status == 200) {
                    if (res.data.listObject.length > 0) {
                        this.listTable = res.data.listObject;
                        this.totalRecord = Number(res.data.total);
                        this.isEmptyTableParent = false;
                    } else {
                        this.isEmptyTableParent = true;
                    }
                }
            });
        },
        searchData() {
            let key = this.searchKey.trim();
            if (key == false && key != '') {
                if (!this.showColumn) {
                    this.isEmptyTableParent = true;
                } else {
                    this.isEmptyColumn = true;
                }
                return;
            }

            if (this.showColumn == false) {
                this.getDatasetList(key);
            } else {
                this.listColumn = this.cacheListColumn;
                if (key != '') {
                    this.listColumn = this.listColumn.filter((value) => {
                        return (
                            value.name.includes(key) ||
                            value.title.includes(key)
                        );
                    });
                }
            }
        },
        getColumn(data) {
            this.showColumn = true;
            this.headerColumn = data;
            this.listColumn = [];
            this.cacheListColumn = [];
            biApi.getDatasetColumn(this.headerColumn.tableId).then((res) => {
                if (res.status == 200) {
                    if (Object.keys(res.data.columns).length > 0) {
                        if (this.headerColumn.tableType == 'docParent') {
                            this.listColumn = Object.values(
                                res.data.columns,
                            )[0];
                        } else if (this.headerColumn.tableType == 'viewChild') {
                            Object.keys(res.data.columns).map((key) => {
                                if (
                                    key == this.headerColumn.tableId ||
                                    key == this.headerColumn.tableChildId
                                ) {
                                    res.data.columns[key].map((col) => {
                                        this.listColumn.push(col);
                                    });
                                }
                            });
                        } else {
                            Object.keys(res.data.columns).map((key) => {
                                res.data.columns[key].map((col) => {
                                    this.listColumn.push(col);
                                });
                            });
                        }
                        if (this.listColumn.length > 0) {
                            this.cacheListColumn = this.listColumn;
                            this.isEmptyColumn = false;
                        } else {
                            this.isEmptyColumn = true;
                        }
                    }
                }
            });
        },
        chooseColumn(x) {
            let name = ' ' + this.headerColumn.tableChildName + '.' + x;
            this.$evtBus.$emit('choose-column', name);
        },
        changePage(vl) {
            this.page = vl.page;
            if(this.searchKey){
                this.getDatasetList(this.searchKey.trim());
            }else{
                this.getDatasetList();
            }
            
        },
        changePageSize(vl) {
            this.pageSize = vl.pageSize;
            if(this.searchKey){
                this.getDatasetList(this.searchKey.trim());
            }else{
                this.getDatasetList();
            }
        },
    },
};
</script>

<style scoped>
.list-table {
    height: 50%;
}
.list-column {
    overflow-x: hidden;
    overflow-y: auto;
    height: 300px;
}
.v-list-group--active
    .v-list-group__header
    .v-list-group__header__append-icon
    .h {
    transform: none !important;
}
button:hover {
    background: none !important;
}
button:focus {
    background: none !important;
}
</style>
