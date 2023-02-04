<template>
    <div class="d-inline-flex ml-0 mr-0 list-header" v-if="!sideBySideMode">
        <input
            type="checkbox"
            v-if="openCheckBox"
            v-model="checkbox"
            @click.stop=""
            class="mt-2 ms-1"
            style="transform: scale(1.2)"
        />
        <VueResizable
            v-for="(headerItem, i) in headerData"
            :key="headerItem.colId"
            :selected-key="i"
            :ref="headerItem.colId"
            :active="headerItem.colId == 'type' || disableDrag ? [] : ['r']"
            :minWidth="headerItem.min"
            :maxWidth="headerItem.max"
            :width="Number(mapRealColWidth[headerItem.colId].replace('px', ''))"
            @resize:end="handleResizeEnd"
            @resize:move="handleResizeMove(headerItem)"
            class="list-header__item"
        >
            <div
                class="fs-13 font-weight-medium"
                :class="{ 'text-ellipsis': headerItem.colId != 'type' }"
                :style="{
                    flex: headerItem.colId == 'type' ? '0 !important' : '1',
                }"
            >
                {{ $t('tasks.header.' + headerItem.colId) }}
                <i
                    v-if="!headerItem.noFilter && !noFilter"
                    @click="showFilterColumn($event, headerItem.colId)"
                    style="position: relative;bottom: 2px;"
                    :class="{
                        'mdi mdi-filter-variant fs-15 float-right': true,
                        'd-active-color':
                            filteredColumns[headerItem.colId] &&
                            filteredColumns[headerItem.colId] == true,
                    }"
                    ></i>
            </div>
        </VueResizable>
    </div>
</template>

<script>
import VueResizable from 'vue-resizable';
export default {
    components: {
        VueResizable,
    },
    props: {
        objectType: {
            type: Number,
        },
        disableDrag: {
            type: Boolean,
            default: true,
        },
        noFilter: {
            type: Boolean,
            default: false,
        },
        sideBySideMode: {
            type: Boolean,
            default: false,
        },
        mappingWidth: {
            type: Object,
            default() {
                return {
                    0: {},
                    1: {},
                    2: {},
                };
            },
        },
        compackMode: {
            type: Boolean,
            default: false,
        },
        smallComponentMode: {
            type: Boolean,
            default: false,
        },
        smallSize: {
            type: Boolean,
            default: false,
        },
        filteredColumns: {
            type: Object,
            default() {
                return {};
            },
        },
        mapRealColWidth: {
            type: Object,
            default() {
                return {};
            },
        },
        openCheckBox: { type: Boolean, default: false },
    },
    computed: {
        headerData() {
            let allRow = this.headerRowData[this.objectType];
            return allRow;
        },
    },
    data() {
        return {
            checkbox: false,
            componentWidth: 0,
            selectingCol: '',
            caculatedWidthMapping: {
                0: {},
                1: {},
                2: {},
            },
            flag: false,
            headerRowData: {},
            isCheckBox: false, // check xem có phải click trực tiếp trên checkbox ko
        };
    },
    created() {
        this.setHeaderRowData();
    },
    methods: {
        setHeaderRowData() {
            this.headerRowData = {
                0: {
                    type: {
                        col: '0.3',
                        colId: 'type',
                        noFilter: true,
                        min: 30,
                        max: 30,
                        show: true,
                    },
                    name: {
                        col: '3',
                        colId: 'name',
                        noFilter: false,
                        min: 100,
                        max: 500,
                    },
                    startDate: {
                        col: '1',
                        colId: 'startDate',
                        noFilter: true,
                        min: 50,
                        max: 300,
                    },
                    assignee: {
                        col: '2',
                        colId: 'assignee',
                        noFilter: true,
                        min: 50,
                        max: 300,
                    },
                    owner: {
                        col: '1.7',
                        colId: 'owner',
                        noFilter: true,
                        min: 50,
                        max: 300,
                    },
                    dueDate: {
                        col: '1.3',
                        colId: 'dueDate',
                        noFilter: true,
                        min: 50,
                        max: 300,
                    },
                    processDefinitionName: {
                        col: '1.3',
                        colId: 'processDefinitionName',
                        noFilter: true,
                        min: 50,
                        max: 300,
                    },
                    statusText: {
                        col: '1.3',
                        colId: 'statusText',
                        noFilter: false,
                        min: 20,
                        max: 300,
                    },
                },
                1: {
                    name: {
                        col: '5',
                        colId: 'name',
                        noFilter: false,
                        sbsModeCol: 12,
                        compackModeCol: 5,
                        min: 100,
                        max: 500,
                    },
                    timeCreate: {
                        col: '2',
                        colId: 'timeCreate',
                        noFilter: true,
                        min: 50,
                        max: 350,
                    },
                    userCreate: {
                        col: '2',
                        colId: 'userCreate',
                        noFilter: true,
                        min: 50,
                        max: 350,
                    },
                    processDefinitionName: {
                        col: '2.5',
                        colId: 'processDefinitionName',
                        noFilter: false,
                        min: 50,
                        max: 400,
                    },
                    status: {
                        col: '1',
                        colId: 'status',
                        noFilter: true,
                        min: 50,
                        max: 200,
                    },
                },
                2: {
                    name: {
                        col: '3',
                        colId: 'name',
                        noFilter: true,
                        sbsModeCol: 12,
                        min: 100,
                        max: 500,
                    },
                    timeCreate: {
                        col: '3',
                        colId: 'timeCreate',
                        noFilter: true,
                        min: 50,
                        max: 300,
                    },
                    userCreate: {
                        col: '3',
                        colId: 'userCreate',
                        noFilter: true,
                        min: 50,
                        max: 300,
                    },
                    processDefinitionName: {
                        col: '3',
                        colId: 'processDefinitionName',
                        noFilter: true,
                        min: 50,
                        max: 300,
                    },
                },
            };
        },
        showFilterColumn(event, column) {
            this.$emit('on-column-filter', event, column);
        },
        caculatorWidth(col, id) {
            let unitWidth = this.smallSize
                ? window.innerWidth / 14
                : window.innerWidth / 12;
            let width = this.mappingWidth[this.objectType][id]
                ? unitWidth * this.mappingWidth[this.objectType][id]
                : unitWidth * col;
            return width;
        },
        handleResizeEnd() {
            this.$emit('resize-end');
        },
        handleResizeMove(headerItem) {
            this.selfSetWidth = true;
            this.mapRealColWidth[headerItem.colId] =
                this.$refs[headerItem.colId][0].style.width;
        },
        caculaterAllWidth() {
            for (let type in this.headerRowData) {
                for (let colId in this.headerRowData[type]) {
                    let w = this.caculatorWidth(
                        this.headerRowData[type][colId].col,
                        colId,
                    );
                    this.$set(this.mapRealColWidth, colId, w + 'px');
                }
            }
        },
    },
    mounted() {
        if (!this.disableDrag) {
            this.caculaterAllWidth();
        }
    },
    watch: {
        openCheckBox(val) {
            if (val) {
                delete this.headerRowData[0].type;
            } else {
                this.setHeaderRowData();
            }
        },
        checkbox(val) {
            if (this.isCheckBox) {
                this.isCheckBox = false;
                return;
            }
            this.$emit('choose-all-tasks', val);
        },
    },
};
</script>

<style scoped>
.list-header {
    height: 30px;
}
.list-header .list-header__item {
    padding: 5px;
    height: 30px;
    border-right: 1px solid white;
}
.list-header .list-header__item:hover {
    border-right: 1px solid lightgray;
}
.d-active-color {
    color: #f58634 !important;
}
</style>
