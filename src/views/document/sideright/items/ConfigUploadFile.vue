<template>
    <div v-if="showConfig" style="margin-top: -10px">
        <div>
            <span>{{$t('v2.doc.configUpdateFile')}}</span>
        </div>
        <div class="d-flex justify-space-between ma-1">
            <div style="width: 70px" class="fs-12 mt-3">{{$t('v2.doc.field')}}</div>
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
                    <div class="list-columns" @click="handleItemClick(item)">
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
                                    <span>{{ item.title }}</span>
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
        </div>
        <div class="list-columm-selected">
            <div
                class="empty-column fs-12"
                v-if="!listColumnSelected || listColumnSelected.length == 0"
            >
                {{$t('v2.doc.noFieldSelected')}}
            </div>
            <v-list-item
                dense
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
                    x-small
                    class="red lighten-1 icon-remove mr-2"
                    dark
                    @click="removeItem(item)"
                >
                    mdi-close
                </v-icon>
                <v-list-item-content>
                    <v-list-item-title>
                        <span class="fs-13">{{ item.title }}</span>
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
                <v-list-item-action style="height: 10px; margin-top: -10px">
                    <v-btn icon tile @click="setValueBinding(item)">
                        <v-icon
                            small
                            :class="{ 'item-primary': item.primary }"
                            color="lighten-1"
                            :style="{ opacity: !item.primary ? 0.3 : 1 }"
                            >mdi-key-outline</v-icon
                        >
                    </v-btn>
                </v-list-item-action>
            </v-list-item>
        </div>
    </div>
</template>
<script>
import { getControlElement } from '@/components/document/controlPropsFactory';

export default {
    props: {
        configData: {
            type: String,
            default: '',
        },
        instance: {
            type: Number,
        },
    },
    watch: {
        sCurrentDocument: {
            deep: true,
            immediate: true,
            handler(newValue) {
                this.getListColumn();
            },
        },
    },
    data() {
        return {
            listColumnSelected: [],
            listColumn: [],
            cacheFieldDocument: {},
            showConfig: false,
            currentTable: '',
        };
    },
    computed: {
        sCurrentDocument() {
            return this.instance
                ? this.$store.state.document.editor[this.instance]
                      .currentSelectedControl
                : {};
        },
        allControl() {
            return this.instance
                ? this.$store.state.document.editor[this.instance].allControl
                : {};
        },
    },
    created() {
        this.getOldValue();
    },
    methods: {
        //lấy dữ liệu cũ
        getOldValue() {
            this.getListColumn();
            try {
                if (this.configData) {
                    let oldValue = JSON.parse(this.configData);
                    if (oldValue)
                        this.listColumnSelected = oldValue.columnSelected;
                }
            } catch (error) {
                console.warn(error);
            }
        },
        // Lấy tên bảng có control upload
        getNameTableHasUploadControl() {
            let currentUploadId = this.sCurrentDocument.id;
            if (currentUploadId) {
                let table = null;
                Object.keys(this.allControl).map((control) => {
                    if (this.allControl[control].type == 'table') {
                        const self = this;
                        let listField = self.allControl[control].listFields;
                        if (listField) {
                            Object.keys(listField).map((field) => {
                                if (field == currentUploadId) {
                                    table = control;
                                }
                            });
                        }
                    }
                });
                return table;
            }
        },
        // lấy danh sách trường trong bảng có control upload để hiển thị
        getListColumn() {
            if (this.getNameTableHasUploadControl()) {
                this.showConfig = true;
                let currentTable = this.getNameTableHasUploadControl();
                Object.keys(this.allControl[currentTable].listFields).map(
                    (field) => {
                        let control =
                            this.allControl[currentTable].listFields[field];
                        if (control.type != 'fileUpload') {
                            this.listColumn.push({
                                name: control.properties.name.value,
                                title: control.properties.title.value,
                                type: control.type,
                                primary: false,
                                icon: getControlElement(control.type).icon,
                            });
                        }
                    },
                );
            }
        },
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
            this.saveConfig();
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
        saveConfig() {
            if (this.listColumnSelected.length == 0) {
                return;
            }
            let controlTable = this.getNameTableHasUploadControl();
            let tableName = this.allControl[controlTable].properties.name.value;
            this.$emit(
                'change',
                JSON.stringify({
                    tableName: tableName,
                    columnSelected: this.listColumnSelected,
                }),
            );
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
            this.saveConfig();
        },
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
    font-size: 13px !important;
}
.combo-box-column >>> .v-input__slot {
    box-shadow: unset !important;
    background: #f2f2f2 !important;
}
</style>
