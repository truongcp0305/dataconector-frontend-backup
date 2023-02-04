<template>
    <div class="form-autocomplete">
        <v-card class="mx-auto" outlined>
            <div class="wrapper-form">
                <table>
                    <tr>
                        <td>
                            <div class="title-row-autocomplete">Document</div>
                        </td>
                        <td>
                            <v-autocomplete
                                :items="listDocument"
                                v-model="documentSelected"
                                item-text="title"
                                @change="getFieldsInDoc"
                                return-object
                                item-value="id"
                                dense
                                solo
                            ></v-autocomplete>
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 70px">
                            <div
                                class="title-row-autocomplete column-autocomplete"
                            >
                                {{$t('v2.doc.field')}}
                            </div>
                        </td>
                        <td>
                            <v-combobox
                                dense
                                multiple
                                v-model="listColumnSelected"
                                item-text="title"
                                item-value="name"
                                solo
                                @change="onChangeSelectColumn"
                                return-object
                                :items="listColumn"
                                hide-no-data
                                hide-details
                                class="combo-box-column"
                            >
                                <template v-slot:item="{ item }">
                                    <div
                                        class="list-columns"
                                        @click="handleItemClick(item)"
                                    >
                                        <v-list-item>
                                            <img
                                                class="icon-control"
                                                :src="
                                                    require('./../../../../../public/img/document' +
                                                        item.icon)
                                                "
                                            />
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                    <span>{{
                                                        item.title
                                                    }}</span>
                                                    <span
                                                        style="
                                                            font: 10px roboto;
                                                            font-weight: 400;
                                                            padđing-left: 4px;
                                                        "
                                                        >{{ item.name }}</span
                                                    ></v-list-item-title
                                                >
                                            </v-list-item-content>
                                            <v-icon
                                                v-if="item.selected"
                                                color="green lighten-1"
                                                style="font-size: 15px"
                                                >mdi-check-outline</v-icon
                                            >
                                        </v-list-item>
                                    </div>
                                </template>
                                <template v-slot:selection="{ item }">
                                    {{ item.title }},
                                </template>
                            </v-combobox>
                        </td>
                    </tr>
                </table>

                <div class="list-columm-selected">
                    <div
                        class="empty-column"
                        v-if="
                            !listColumnSelected ||
                            listColumnSelected.length == 0
                        "
                    >
                        {{$t('v2.doc.noFieldSelected')}}
                    </div>
                    <v-list-item
                        v-else
                        v-for="(item, i) in listColumnSelected"
                        :key="i"
                    >
                        <img
                            class="icon-control"
                            :src="
                                require('./../../../../../public/img/document' +
                                    item.icon)
                            "
                        />
                        <v-icon
                            class="red lighten-1 icon-remove"
                            dark
                            @click="removeItem(item)"
                        >
                            mdi-close
                        </v-icon>
                        <v-list-item-content>
                            <v-list-item-title>
                                <span>{{ item.title }}</span>
                                <span
                                    style="
                                        font: 11px roboto;
                                        font-weight: 200;
                                        padding-left: 4px;
                                    "
                                    >{{ item.subTitle }}</span
                                >
                            </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon tile @click="setValueBinding(item)">
                                <v-icon
                                    :class="{ 'item-primary': item.primary }"
                                    color="lighten-1"
                                    :style="{
                                        opacity: !item.primary ? 0.3 : 1,
                                    }"
                                    >mdi-key-outline</v-icon
                                >
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </div>
            </div>
            <TreeSqlConfig
                ref="treeConfig"
                @change-config="saveConfig"
                :defaultData="treeConfigData"
                :listColumn="listColumn"
            />
            <div>
                <v-checkbox
                    v-model="rejectInput"
                    :label="$t('v2.doc.leaveInvalidData')"
                    @change="saveConfig(false)"
                    class="reject-input-checkbox"
                    hide-details
                ></v-checkbox>
            </div>
        </v-card>
    </div>
</template>
<script>
import { util } from '@/plugins/util.js';
import ListColumnAutoComplete from './ListColumnAutoComplete';
import { documentApi } from '@/api/Document.js';
import TreeSqlConfig from './TreeSqlConfig.vue';
import { getControlElement } from '@/components/document/controlPropsFactory';

export default {
    props: {
        configData: {
            type: Object,
        },
        instance: {
            type: Number,
        },
    },
    watch: {
        configData: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (!vl || Object.keys(vl) == 0) {
                    return;
                }
                this.documentSelected = vl.documentSelected;
                this.listColumnSelected = vl.columnSelected;
                this.documentSelected = vl.documentSelected;
                this.rejectInput = vl.rejectInput;
                if (vl.treeData.length > 0) {
                    this.treeConfigData = vl.treeData;
                }
                if (this.documentSelected) this.getFieldsInDoc(false);
            },
        },
        'sCurrentDocument.properties.name': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                setTimeout(
                    (self) => {
                        self.saveConfig(false);
                    },
                    500,
                    this,
                );
            },
        },
    },
    data() {
        return {
            searchKey: '',
            listColumnSelected: [],
            documentSelected: null,
            listColumn: null,
            cacheFieldDocument: {},
            treeConfigData: [],
            rejectInput: false,
        };
    },
    computed: {
        listDocument() {
            let listDoc = Object.values(
                this.$store.state.document.listAllDocument,
            );
            listDoc = listDoc.reduce((arr, obj) => {
                let newObj = { id: obj.id, name: obj.name, title: obj.title };
                arr.push(newObj);
                return arr;
            }, []);
            return listDoc;
        },
        sCurrentDocument() {
            return this.$store.state.document.editor[this.instance]
                .currentSelectedControl;
        },
    },
    methods: {
        setValueBinding(item) {
            this.listColumnSelected = this.listColumnSelected.reduce(
                (arr, obj) => {
                    obj['primary'] = false;
                    arr.push(obj);
                    return arr;
                },
                [],
            );
            this.$set(item, 'primary', !item.primary);
            this.saveConfig(false);
        },
        showColumn(e) {
            this.$refs.listColumnn.show(e);
        },
        handleItemClick(item) {
            this.$set(item, 'selected', !item.selected);
        },
        removeItem(item) {
            this.$set(item, 'selected', false);
            if (this.listColumnSelected.indexOf(item) != -1) {
                this.listColumnSelected.splice(
                    this.listColumnSelected.indexOf(item),
                    1,
                );
            }
        },
        /**
         * Hàm call api lấy list field của doc được chọn
         */
        getFieldsInDoc(isRefreshSelected = true) {
            let self = this;
            if (!this.documentSelected || !this.documentSelected.name) {
                return;
            }
            if (this.cacheFieldDocument[this.documentSelected.name]) {
                this.listColumn =
                    this.cacheFieldDocument[this.documentSelected.name];
            } else {
                documentApi
                    .getFieldByDocId(this.documentSelected.name)
                    .then((res) => {
                        self.listColumn = res.data;
                        self.listColumn = self.listColumn.reduce((arr, obj) => {
                            if (obj.name) {
                                let controlInFactory = getControlElement(
                                    obj.type,
                                );
                                obj['primary'] = false;
                                obj['icon'] = controlInFactory.icon;
                                arr.push(obj);
                            }
                            return arr;
                        }, []);
                        self.cacheFieldDocument[self.documentSelected.name] =
                            self.listColumn;
                        if (isRefreshSelected) {
                            self.listColumnSelected = [];
                        }
                    })
                    .catch((err) => {});
            }
        },
        /**
         * Hàm chuyển thể các input sang câu lệnh sql
         */
        getSqlQuery(where) {
            let columnSelect = '*';
            if (this.listColumnSelected.length > 0) {
                columnSelect = [];
                for (
                    let index = 0;
                    index < this.listColumnSelected.length;
                    index++
                ) {
                    let column = this.listColumnSelected[index];
                    if (column.primary) {
                        let controlName =
                            this.sCurrentDocument.properties.name.name.value;
                        columnSelect.push(column.name + ' AS ' + controlName);
                    } else {
                        columnSelect.push(
                            column.name + ' AS "' + column.title + '"',
                        );
                    }
                }
                if (columnSelect.length > 0) {
                    columnSelect = columnSelect.join(',');
                } else {
                    columnSelect = '*';
                }
            }
            let sql =
                'SELECT ' +
                columnSelect +
                ' FROM ' +
                this.documentSelected.name;
            if (where) {
                sql += ' WHERE ' + where;
            }
            sql = 'ref(' + sql + ')';
            return sql;
        },
        saveConfig(data) {
            if (!this.documentSelected || !this.documentSelected.name) {
                return;
            }
            if (this.listColumnSelected.length == 0) {
                return;
            }
            if (!data) {
                if (this.$refs.treeConfig.treeData.length > 0)
                    data = this.$refs.treeConfig.getTreeData();
            }
            let where = data ? data.where : '';
            let treeData = data ? data.treeData : {};
            let sql = this.getSqlQuery(where);
            this.$emit('change', {
                sql: sql,
                treeData: treeData,
                documentSelected: this.documentSelected,
                columnSelected: this.listColumnSelected,
                rejectInput: this.rejectInput,
            });
        },
        onChangeSelectColumn() {
            this.listColumnSelected = this.listColumnSelected.reduce(
                (arr, obj) => {
                    obj.selected = true;
                    arr.push(obj);
                    return arr;
                },
                [],
            );
            this.saveConfig(false);
        },
    },
    components: {
        ListColumnAutoComplete,
        TreeSqlConfig,
    },
};
</script>
<style scoped>
.form-autocomplete {
    font-size: 11px !important;
    position: relative;
}
.form-autocomplete >>> .v-text-field__details {
    display: none;
}
.form-autocomplete >>> .v-input__control {
    min-height: unset;
    height: 30px;
}
.form-autocomplete >>> .item-primary {
    color: green;
}
.form-autocomplete >>> .v-input {
    margin: 6px 0;
}
.form-autocomplete >>> .v-select__slot {
    font: 11px roboto;
}
.form-autocomplete .list-columm-selected {
    margin-top: 8px;
}
.form-autocomplete .list-columm-selected .empty-column {
    width: 160px;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 10px;
    opacity: 0.6;
}

.form-autocomplete >>> .v-input__control {
    height: 30px !important;
    min-height: unset !important;
    padding: 0px 4px 0px 0px;
}
.form-autocomplete >>> .v-input__control .v-input__slot {
    box-shadow: unset !important;
    background-color: #f7f7f7;
    margin-bottom: unset;
    height: 30px;
    padding: 0px 4px !important;
}
.form-autocomplete >>> .v-input__control .v-input__append-inner {
    display: none;
}

.form-autocomplete >>> .v-input__control .v-input__slot .v-icon {
    font-size: 13px;
}

.form-autocomplete
    >>> .v-input__control
    .v-input__slot
    .v-text-field__slot
    label {
    padding-top: 2px;
    font: 11px roboto !important;
}
.form-autocomplete >>> .v-input__control .v-text-field__details {
    display: none;
}
.wrapper-form {
    display: flex;
    flex-direction: column;
}

.title-row-autocomplete {
    width: 60px;
    padding-left: 4px;
}
.form-autocomplete >>> .list-columm-selected .v-icon:nth-child(1) {
    font-size: 14px !important;
}
.form-autocomplete >>> .list-columm-selected .v-avatar {
    height: 12px !important;
    width: 12px !important;
    min-width: unset !important;
}
.form-autocomplete
    >>> .list-columm-selected
    .v-list-item__content
    .v-list-item__title {
    font-size: 11px;
}
.form-autocomplete >>> .list-columm-selected .v-list-item__action .v-btn {
    width: 12px;
    height: 12px;
}
.form-autocomplete >>> .list-columm-selected .v-list-item {
    min-height: unset;
    height: 30px;
    padding: 0px 2px 0px 10px;
    margin-left: 4px !important;
}
.form-autocomplete >>> .list-columm-selected .v-list-item .icon-remove {
    display: none;
    font-size: 12px;
    margin-right: 8px;
    border-radius: 50%;
}
.form-autocomplete >>> .list-columm-selected .v-list-item:hover .icon-remove {
    display: block;
}
.form-autocomplete >>> .list-columm-selected .v-list-item:hover .icon-control {
    display: none;
}
.form-autocomplete >>> .list-columm-selected .v-list-item:hover {
    background-color: #f2f2f2 !important;
}

.icon-control {
    height: 11px;
    width: 11px;
    margin-right: 8px;
}

.list-columns {
    display: flex;
    width: 100%;
}
.list-columns >>> .v-icon {
    margin-left: auto;
}
.combo-box-column >>> .v-select__selections {
    height: 23px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 75px;
    display: block;
}
.reject-input-checkbox >>> .v-label {
    font-size: 11px;
}
</style>
