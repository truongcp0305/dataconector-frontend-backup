<template>
    <v-card
        :id="'autocomplete-control-' + key"
        v-show="isShowAutoComplete"
        class="card-autocomplete"
        :style="positionBox"
    >
        <div v-if="inputType == 'combobox'" class="search-data-input">
            <input
                v-model="search"
                type="text"
                class="sym-small-size sym-style-input"
                :placeholder="$t('common.search')"
            />
        </div>
        <v-data-table
            :headers="headers"
            :height="tableHeight"
            :items="dataTable"
            :search="search"
            :loading="tableLoadding"
            disable-pagination
            fixed-header
            hide-default-footer
            :hide-default-header="isHideHeader"
            dense
            :loading-text="$t('common.loading')"
            :no-data-text="$t('common.no_data')"
            calculate-widths
        >
            <template v-slot:item="{ item }">
                <tr
                    @click="handleClickRow(item)"
                    class="active-row"
                    v-if="item.active"
                    style="background: #f0f0f0"
                >
                    <td
                        v-for="(key, value) in item"
                        :key="key + value"
                        :class="{
                            'd-none':
                                value == 'active' ||
                                value == 'checked' ||
                                value == 'document_object_id',
                        }"
                    >
                        <v-icon
                            v-if="value == 'tmg_icon'"
                            :color="item.tmg_color"
                        >
                            {{ value != 'active' ? key : '' }}</v-icon
                        >
                        <span v-else-if="value != 'tmg_color'">
                            {{ value != 'active' ? key : '' }}</span
                        >
                    </td>
                    <span
                        class="mdi mdi-check icon-checked"
                        v-if="item.checked"
                    ></span>
                </tr>
                <tr @click="handleClickRow(item)" v-else class="row-item">
                    <td
                        v-for="(key, value) in item"
                        :key="key + value"
                        :class="{
                            'd-none':
                                value == 'active' ||
                                value == 'checked' ||
                                value == 'document_object_id',
                        }"
                    >
                        <v-icon
                            v-if="value == 'tmg_icon'"
                            :color="item.tmg_color"
                        >
                            {{ key }}</v-icon
                        >
                        <span v-else-if="value != 'tmg_color'"> {{ key }}</span>
                    </td>
                    <span
                        class="mdi mdi-check icon-checked"
                        v-if="item.checked"
                    ></span>
                </tr>
            </template>
            <template
                v-slot:no-results
                v-if="$parent.$options.name == 'submitDocument'"
            >
                <div>
                    <v-btn text small @click="openSubForm">{{
                        $t('common.add')
                    }}</v-btn>
                </div>
            </template>
        </v-data-table>
    </v-card>
</template>
<script>
import { calculatorPositionBox } from '@/views/document/common/common.js';
export default {
    props: {
        scrollIntoView: {
            type: Boolean,
            default: true,
        },
        tableWrapper: {
            default: null,
        },
        keyInstance: {
            default: 0,
        },
        // cho phép tự điều chỉnh vị trí của box
        usePositionBox: {
            type: Boolean,
            default: false,
        },
        customPosition: {
            type: Object,
            default() {
                return { top: 0, right: 0 };
            },
        },
    },
    data() {
        return {
            tableLoadding: false,
            key: Date.now(),
            isShowAutoComplete: false,
            positionBox: { top: 0, left: 0 },
            indexActive: 0,
            search: '',
            headers: [],
            dataTable: [],
            alias: '',
            curInput: null,
            isHideHeader: false,
            search: '',
            inputType: false,
            controlValueKey: null,
            isSingleSelectCombobox: true,
            controlForcusing: null,
            oldControlForcusing: null,
            event: null,
            tableHeight: null,
            currentValue: null
        };
    },
    created() {
        this.$evtBus.$on('document-submit-hide-autocomplete', (e) => {
            this.hide();
        });
    },
    methods: {
        show(e, controlName, isSetEvent = true) {
            this.headers = [];
            this.dataTable = [];
            this.tableHeight = null;
            this.event = e;
            this.isShowAutoComplete = true;
            this.controlForcusing = controlName;
            if (this.oldControlForcusing != this.controlForcusing) {
                this.calculatorPositionBox(e);
                this.oldControlForcusing = this.controlForcusing;
            }
            if (isSetEvent) this.setEvent();
        },
        showLoadding() {
            this.tableHeight = null;
            this.tableLoadding = true;
        },
        hideLoadding() {
            this.tableLoadding = false;
        },
        refreshActive() {
            for (let index = 0; index < this.dataTable.length; index++) {
                delete this.dataTable[index]['checked'];
            }
        },

        setEvent() {
            let thisCpn = this;
            this.curInput.off('keydown');
            let list = $('#autocomplete-control-' + this.key).find('tbody');
            this.curInput.on('keydown', function (e) {
                if (
                    thisCpn.dataTable != undefined &&
                    thisCpn.dataTable.length > 0
                ) {
                    if (e.keyCode == 38) {
                        //len
                        if (thisCpn.indexActive == 0) {
                            return false;
                        }
                        Vue.set(
                            thisCpn.dataTable[thisCpn.indexActive],
                            'active',
                            false,
                        );
                        thisCpn.indexActive--;
                        Vue.set(
                            thisCpn.dataTable[thisCpn.indexActive],
                            'active',
                            true,
                        );
                        if (thisCpn.indexActive >= 1)
                            if (thisCpn.scrollIntoView) {
                                list.find('tr')[
                                    thisCpn.indexActive - 1
                                ].scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                });
                            }
                    } else if (e.keyCode == 40) {
                        if (
                            thisCpn.indexActive ==
                            thisCpn.dataTable.length - 1
                        ) {
                            return false;
                        }
                        Vue.set(
                            thisCpn.dataTable[thisCpn.indexActive],
                            'active',
                            false,
                        );
                        thisCpn.indexActive++;
                        Vue.set(
                            thisCpn.dataTable[thisCpn.indexActive],
                            'active',
                            true,
                        );
                        if (thisCpn.scrollIntoView) {
                            list.find('tr.active-row')[0].scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                            });
                        }
                    } else if (e.keyCode == 13) {
                        let rowActive = thisCpn.dataTable[thisCpn.indexActive];
                        thisCpn.handleClickRow(rowActive);
                    }
                } else {
                    if (e.keyCode == 13) {
                        thisCpn.$emit('after-select-row', {
                            value: e.target.value,
                            controlName: thisCpn.controlForcusing,
                        });
                    }
                }
            });
        },
        hide() {
            this.isShowAutoComplete = false;
            this.oldControlForcusing = null;
            this.resetData();
            if (this.curInput) {
                this.curInput.off('keydown');
            }
        },
        resetData() {
            this.headers = [];
            this.dataTable = [];
        },
        isShow() {
            return this.isShowAutoComplete;
        },
        setControlValueKey(controlValueKey) {
            this.controlValueKey = controlValueKey;
        },
        decodeHTMLEntities(str) {
            var txt = document.createElement('textarea');
            txt.innerHTML = str;
            return txt.value;
        },
        removeHTMLtag(data) {
            if (data.length > 0) {
                for (let index = 0; index < data.length; index++) {
                    let row = data[index];
                    for (let key in row) {
                        if (typeof data[index][key] == 'string') {
                            data[index][key] = this.decodeHTMLEntities(
                                data[index][key].replace(/(<([^>]+)>)/gi, ''),
                            );
                        }
                    }
                }
            }
            return data;
        },
        setData(data) {
            this.tableHeight = null;
            this.showHeader();
            this.hideLoadding();
            if (data.headers == undefined) {
                this.dataTable = [];
                return;
            }
            if (data.headers.length > 0) this.headers = data.headers;
            this.dataTable = this.removeHTMLtag(data.dataBody);

            if (this.inputType == 'combobox') {
                for (let index = 0; index < this.dataTable.length; index++) {
                    let rowData = this.dataTable[index];
                    for (let i = 0; i < Object.values(rowData).length; i++) {
                        const cellValue = Object.values(rowData)[i];
                        if (this.currentValue.includes(cellValue)) {
                            this.$set(this.dataTable[index], 'checked', true);
                            break;
                        }else {
                            this.$set(this.dataTable[index], 'checked', false);
                        }
                    }
                }
            }
            this.indexActive = 0;
            if (this.dataTable.length > 0) {
                Vue.set(this.dataTable[this.indexActive], 'active', true);
            }
            let self = this;
            setTimeout(() => {
                if ($('#autocomplete-control-' + self.key).height() == 500) {
                    self.tableHeight = $(
                        '#autocomplete-control-' + self.key,
                    ).height();
                }
            }, 100);
        },
        showHeader() {
            this.isHideHeader = false;
        },
        hideHeader() {
            this.isHideHeader = true;
        },
        setCurrentInput(el) {
            this.curInput = $(el);
        },
        calculatorPositionBox(e) {
            if (!e.curTarget) {
                e.curTarget = e.target;
            }
            this.curInput = $(e.curTarget);
            if (!this.usePositionBox) {
                this.positionBox = calculatorPositionBox(
                    e,
                    $('#sym-submit-' + this.keyInstance),
                );
            } else {
                this.positionBox = this.customPosition;
            }
        },
        setSearch(query) {
            this.search = query;
        },
        setAliasControl(aliasControl) {
            this.alias = aliasControl;
        },
        setTypeInput(controlType = false) {
            this.inputType = controlType;
        },
        setSingleSelectCombobox(isSingleSelectCombobox = false) {
            this.isSingleSelectCombobox = isSingleSelectCombobox;
        },
        handleClickRow(item) {
            this.curInput.off('keydown');
            let value = '';
            if (item.hasOwnProperty(this.alias)) {
                value = item[this.alias];
            } else if (item.hasOwnProperty('column1')) {
                value = item['column1'];
            }

            if (this.inputType == 'combobox') {
                if (this.isSingleSelectCombobox) {
                    for (
                        let index = 0;
                        index < this.dataTable.length;
                        index++
                    ) {
                        let row = this.dataTable[index];
                        this.$set(row, 'checked', false);
                    }
                    
                }
                this.$set(item, 'checked',!item.checked);
                let dataValue = [];
                for (
                        let index = 0;
                        index < this.dataTable.length;
                        index++
                    ) {
                        let row = this.dataTable[index];
                        if(row.checked){
                            if(row[this.alias]){
                                const element = row[this.alias];
                                dataValue.push(element);                           
                            }else {
                                const element = row['column1'];
                                dataValue.push(element);       
                            }              
                        }
                       
                    }
            
                value = dataValue.join(',');
            } else {
                this.dataTable = [];
                this.hide();
            }
            if (this.controlValueKey) {
                value = {
                    inputDislay: value,
                    inputValue: item[this.controlValueKey],
                };
            } else {
                value = { inputDislay: value, inputValue: value };
            }
            this.$emit('after-select-row', {
                value: value,
                controlName: this.controlForcusing,
            });
        },
        openSubForm() {
            this.hide();
            this.$emit('open-sub-form');
        },
        setCurrentValue(currentValue){
            this.currentValue = currentValue
        }
    },
};
</script>
<style scoped>
.card-autocomplete {
    position: absolute;
    z-index: 99999;
    max-width: 500px !important;
    width: max-content !important;
    max-height: 500px;
    overflow: auto;
    border-radius: 8px;
}
.active-row {
    background: #f0f0f0;
}

.card-autocomplete >>> tr {
    position: relative;
}
.search-data-input {
    width: 100%;
    padding: 8px;
}
.search-data-input input {
    padding: 0 4px;
    width: 100%;
    background: var(--symper-background-default);
    height: 25px;
    border-radius: 4px;
}
.search-data-input input:focus {
    outline: none;
}
.icon-checked {
    position: absolute;
    color: green;
    right: 6px;
}
.row-item {
    position: relative;
}
.row-item td {
    min-width: 160px;
}
.card-autocomplete span {
    font-size: 12px;
}
.card-autocomplete >>> tr:nth-child(even) {background: #fbfbfb}
.card-autocomplete >>> tr:nth-child(odd) {background: #FFF}
</style>
