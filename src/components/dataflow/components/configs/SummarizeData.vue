<template>
    <div class="d-flex flex-column summalize-config fs-13 mt-2">
        <v-text-field solo append-icon="mdi-magnify" v-model="searchColumns">
        </v-text-field>
        <div class="list-all-columns">
            <div class="title fs-15 d-flex align-center">
                <span> {{$t('v2.dataflow.columns')}}</span>
            </div>
            <div class="drag-columns">
                <VuePerfectScrollbar style="max-height: 130px">
                    <draggable
                        :clone="cloneColumn"
                        :list="nodeData.configs.allColumns"
                        :group="{
                            name: 'drop-column',
                            pull: 'clone',
                            put: false,
                        }"
                        class="drag-columns-area"
                    >
                        <div
                            v-for="column in nodeData.configs.allColumns"
                            :key="column.columnName"
                            class="column-content"
                            :style="{
                                display: checkMatch(column) ? 'flex' : 'none',
                            }"
                        >
                            <ColumnInfo :infoColumn="column" />
                            <!-- <v-icon x-small class="mt-1 mr-1"> {{ getColumnIcon(column.type) }}</v-icon> -->
                            <!-- <span class="column-title text-ellipsis mr-2">{{ column.title }}</span> ( <span class="colmn-name text-ellipsis">{{ column.columnName }}</span -->
                            <!-- >) -->
                        </div>
                    </draggable>
                </VuePerfectScrollbar>
            </div>
        </div>
        <div class="list-groupby-column mb-2" style="height: 30%">
            <div class="title fs-15 d-flex align-center">
                <span> {{$t('v2.dataflow.aggreate')}} </span>
            </div>

            <div class="drag-columns">
                <VuePerfectScrollbar style="max-height: 130px">
                    <draggable
                        @change="handleChangeColumn"
                        :list="nodeData.configs.aggColumns"
                        :group="{ name: 'drop-column' }"
                        class="drag-columns-area"
                    >
                        <div
                            :ref="'left_comp'"
                            v-for="(column, idx) in nodeData.configs.aggColumns"
                            :key="idx"
                            class="column-content"
                            :style="{
                                display: checkMatch(column) ? 'flex' : 'none',
                            }"
                        >
                            <v-menu open-on-hover top offset-y>
                                <template v-slot:activator="{ on, attrs }">
                                    <span
                                        :style="{ width: column.inputWidth }"
                                        v-bind="attrs"
                                        v-on="on"
                                        class="column-as text-ellipsis"
                                        @dblclick="editColumnAs(idx)"
                                        v-show="!column.edit"
                                    >
                                        {{ column.agg }}
                                    </span>
                                </template>
                                <v-list>
                                    <v-list-item
                                        v-for="(agg, name) in aggTpl[
                                            column.type
                                        ]"
                                        :key="name"
                                        class="list-item-on-menu"
                                        @click="
                                            changeAggFunc({
                                                column: column,
                                                aggName: name,
                                                idx: idx,
                                            })
                                        "
                                    >
                                        <v-list-item-title>
                                            {{ agg.name }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                            <span
                                :style="{ 'max-width': 'calc((100%-column.inputWidth)/2 - 30px)' }"
                                class="text-ellipsis"
                                title="Double click to edit"
                                @dblclick="editColumnAs(idx)"
                                v-show="!column.edit"
                            >
                                {{ column.columnName }}
                            </span>
                            <input
                                @change="changeConfig('rename')"
                                @blur="finishEditColumnAs"
                                v-show="column.edit"
                                :style="{ 'max-width': 'calc((100%-column.inputWidth)/2 - 30px)' }"
                                size="nano"
                                v-model="column.as"
                                class="d-inline-block input-edit-as"
                            />
                            <v-icon
                                x-small
                                @click="removeColumn(idx, 'aggColumns')"
                                style="position: absolute; right: 10px; top 4px"
                                class="mr-4"
                            >
                                mdi-close</v-icon
                            >
                        </div>
                        <div
                            class="placeholder-div-condition mt-1 mb-4 d-flex justify-content-center"
                        >
                            <span class="add-field-here-title">
                                {{$t('v2.dataflow.addFieldHere')}}
                            </span>
                        </div>
                    </draggable>
                </VuePerfectScrollbar>
            </div>
        </div>
        <div class="list-agg-column" style="height: 20%">
            <div class="title fs-15 d-flex align-center">
                <span> {{$t('v2.dataflow.groupBy')}} </span>
            </div>
            <VuePerfectScrollbar style="max-height: 150px">
                <draggable
                    @change="handleChangeColumn"
                    :list="nodeData.configs.groupBy"
                    :group="{ name: 'drop-column' }"
                    class="drag-columns-area"
                >
                    <div
                        v-for="(column, idx) in nodeData.configs.groupBy"
                        :key="idx"
                        class="column-content"
                        :style="{
                            display: checkMatch(column) ? 'block' : 'none',
                        }"
                    >
                        <ColumnInfo
                            :infoColumn="column"
                            :showIconRemove="true"
                            @remove-item="removeColumn(idx, 'groupBy')"
                        />

                        <!-- <v-icon x-small class="mr-1">{{ getColumnIcon(column.type) }}</v-icon>
						<span class="column-title">{{ column.title }}</span> ( <span class="colmn-name">{{ column.columnName }}</span
						>) -->
                        <!-- <v-icon x-small style="float:right" class="mr-2" @click="removeColumn(idx, 'groupBy')">mdi-close</v-icon> -->
                    </div>
                    <div
                        class="placeholder-div-condition mt- 1 mb-4 d-flex justify-content-center"
                    >
                        <span class="add-field-here-title">
                            {{$t('v2.dataflow.addFieldHere')}}
                        </span>
                    </div>
                </draggable>
            </VuePerfectScrollbar>
        </div>
    </div>
</template>

<script>
import ColumnInfo from '@/components/common/bi/ColumnInfo';
import aggTpl from '@/components/dashboard/configPool/aggTpl';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import _cloneDeep from 'lodash/cloneDeep';

export default {
    components: {
        VuePerfectScrollbar,
        ColumnInfo,
    },
    data() {
        let newAggTpl = _cloneDeep(aggTpl);
        for (let key in newAggTpl) {
            delete newAggTpl[key].not_agg;
        }
        return {
            searchColumns: '',
            aggTpl: newAggTpl,
            mapIcon: {
                text: 'mdi-text-box-outline',
                number: 'mdi-format-list-numbered',
                date: 'mdi-clock-time-five-outline',
            },
        };
    },
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    methods: {
        handleChangeColumn() {
            this.changeConfig('update-column');
        },
        removeColumn(idx, type) {
            this.nodeData.configs[type].splice(idx, 1);
            this.changeConfig('update-column');
        },
        finishEditColumnAs(vl, event) {
            for (let cl of this.nodeData.configs.aggColumns) {
                cl.edit = false;
            }
        },
        changeAggFunc(command) {
            let column = command.column;
            column.agg = command.aggName;
            column.as = column.title ? column.title : column.columnName;
            column.newDataType = this.getDatatype(column);
            this.changeConfig('agg-func');
        },
        changeConfig(source) {
            if (this.debounceEmitChangeConfig) {
                clearTimeout(this.debounceEmitChangeConfig);
            }
            this.debounceEmitChangeConfig = setTimeout(
                (thisObj) => {
                    thisObj.$emit('change-configs', { source: source });
                },
                100,
                this,
            );
        },
        editColumnAs(idx) {
            let column = this.aggColumns[idx];
            let pr = $(this.$refs.left_comp[idx]);
            let w =
                pr.width() -
                pr.find('.left-items-in-agg').width() -
                pr.find('.remove-column').width() -
                15;

            this.$set(column, 'inputWidth', w + 'px');
            this.$set(column, 'edit', true);
            // column.inputWidth = w+'px';
            // column.edit = true;
            pr.find('.input-edit-as input').focus().select();
            setTimeout(
                (pr) => {
                    pr.find('.input-edit-as input').focus();
                },
                100,
                pr,
            );
        },
        checkMatch(column) {
            let searchKey = this.searchColumns.trim().toLowerCase();
            if (!searchKey) {
                return true;
            } else {
                return (
                    column.columnName.toLowerCase().includes(searchKey) ||
                    column.title.toLowerCase().includes(searchKey)
                );
            }
        },
        getColumnIcon(type) {
            return this.mapIcon[type];
        },
        cloneColumn(item) {
            let agg = item.type == 'number' ? 'sum' : 'first';
            let newItem = _cloneDeep(item);
            newItem.as = item.title ? item.title : item.columnName;
            newItem.agg = agg;
            newItem.inputWidth = '30px';
            newItem.edit = false;
            newItem.newDataType = this.getDatatype(newItem);
            return newItem;
        },
        getDatatype(col) {
            let uid = col.uid;
            let mapType = {
                count: 'number',
                count_dist: 'number',
            };

            let type = col.type;
            if (mapType[col.agg]) {
                return mapType[col.agg];
            } else {
                return type;
            }
        },
    },
};
</script>

<style scoped>
.column-content {
    padding: 2px 4px;
    cursor: pointer;
}
.column-content:hover {
    background-color: #f7f7f7;
}
.summalize-config >>> .v-text-field__details {
    display: none !important;
}
.summalize-config >>> .v-input__control {
    min-height: unset !important;
    margin-bottom: -6px !important;
}
.summalize-config >>> .v-input__control .v-input__slot input {
    font-size: 13px !important;
}
.summalize-config >>> .v-input__slot {
    box-shadow: unset !important;
    background-color: #fbfbfb !important;
    border: 1px solid lightgray;
    height: 28px !important;
}
.summalize-config >>> .v-input__slot .v-icon {
    font-size: 18px !important;
}
.summalize-config >>> .v-input {
    flex: unset !important;
}
.title {
    font-size: 13px !important;
    padding: 6px;
    background-color: #ebeef5 !important;
    margin: 8px 0px;
    width: 100% !important;
    height: 30px !important;
}
.placeholder-div-condition {
    background-color: #f7f7f7;
    border: 1px solid lightgray;
}
.add-field-here-title {
    margin-left: auto;
    margin-right: auto;
    opacity: 0.6;
}
.column-as {
    color: rgb(66, 66, 255);
    padding: 0px 3px;
}
input {
    color: rgb(66, 66, 255);
    padding: 0px 3px;
    font-size: 13px !important;
}
</style>
<style>
.list-item-on-menu {
    min-height: unset !important;
    padding: 8px 12px !important;
    margin: -6px 2px;
}
.list-item-on-menu .v-list-item__title {
    font-size: 13px !important;
}
</style>
