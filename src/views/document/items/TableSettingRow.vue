<template>
    <tr id="rowDrag" class="sortableRow">
        <td>
            <input
                class="column-name"
                @focus="focusInput"
                @blur="unFocusInput"
                @keyup="handleKeyup"
                v-model="rowData.columnName"
                type="text"
                :placeholder="$t('v2.doc.nameColumnOfTable')"
            />
        </td>
        <td class="d-flex">
            <img
                :src="imageControl"
                class="icon-control"
                style="height: 13px; width: 13px; margin: 13px 0 0 0"
            />
            <v-autocomplete
                class="v-autocomplete-type sym-small-size"
                :items="listControlType"
                v-model="rowData.type"
                dense
                solo
                hide-selected
                hide-details
                item-text="type"
                :placeholder="$t('v2.doc.controlType')"
                @focus="focusInput"
                @blur="unFocusInput"
                @input="inputAutocomplete"
            >
                <template v-slot:item="dataType" class="mh-15">
                    <v-list-item-content class="p-0">
                        <v-list-item>
                            <img
                                :src="
                                    require('./../../../../public/img/document' +
                                        dataType.item.prop.icon)
                                "
                                style="
                                    height: 12px;
                                    width: 14px;
                                    margin-right: 8px;
                                "
                            />
                            <v-list-item-title>{{
                                dataType.item.prop.title
                            }}</v-list-item-title>
                        </v-list-item>
                    </v-list-item-content>
                </template>
            </v-autocomplete>
        </td>
        <td>
            <input
                @focus="focusInput"
                @blur="unFocusInput"
                @keyup="handleKeyup"
                type="text"
                :placeholder="$t('v2.doc.controlName')"
                name="nameControl"
                v-model="rowData.name"
            />
            <!-- <span class="validate-item d1-none">Tên không đúng định dạng</span> -->
        </td>
        <td>
            <input
                @focus="focusInput"
                @blur="unFocusInput"
                @keyup="handleKeyup"
                type="text"
                :placeholder="$t('v2.doc.title')"
                v-model="rowData.title"
            />
        </td>
        <td style="text-align: end">
            <button @click="removeRow()"><v-icon>mdi-close</v-icon></button>
        </td>
    </tr>
</template>
<script>
import { util } from '@/plugins/util.js';

import {
    getAllControlForTableSetting,
    getControlElementForTableSetting,
} from './../../../components/document/controlPropsFactory.js';
export default {
    props: {
        row: {
            type: Object,
            default() {},
        },
    },
    methods: {
        focusInput(e) {
            $(e.target).addClass('on-active');
        },
        unFocusInput(e) {
            $(e.target).removeClass('on-active');
        },

        // hàm lấy icon control
        inputAutocomplete(e) {
            if (e == undefined && typeof e == 'undefined') {
                this.imageControl = '';
            }
            let control = this.listControlType.filter((control) => {
                return control.type == e;
            });
            if (control.length > 0)
                this.imageControl = require('./../../../../public/img/document' +
                    control[0].prop.icon);
        },
        //xóa dòng gọi lại cho tablesetting để xóa data
        removeRow() {
            this.$emit('remove-row', this.row);
        },

        // hàm xử lí gõ lên xuống thì xuống dòng
        handleKeyup(e) {
            if (e.keyCode == 40) {
                let index = $('.on-active').closest('td').index();
                let rowIndex = $('.on-active').closest('tr').index();
                if (
                    rowIndex <
                    $('.on-active').closest('tbody').children().length - 1
                ) {
                    $('.on-active')
                        .closest('tbody')
                        .children()
                        .eq(rowIndex + 1)
                        .children()
                        .eq(index)
                        .find('input')
                        .focus();
                }
            }
            if (e.keyCode == 38) {
                let index = $('.on-active').closest('td').index();
                let rowIndex = $('.on-active').closest('tr').index();
                if (rowIndex > 0) {
                    $('.on-active')
                        .closest('tbody')
                        .children()
                        .eq(rowIndex - 1)
                        .children()
                        .eq(index)
                        .find('input')
                        .focus();
                }
            }
            // if(e.keyCode == 37){
            //     if( !$('.on-active').closest('td').prev().find('input[type="text"]').hasClass('on-active'))
            //     $('.on-active').closest('td').prev().find('input[type="text"]').addClass('on-active');
            //     $('.on-active').closest('td').prev().find('input[type="text"]').focus()

            // }
            // if(e.keyCode == 39){
            //     if( !$('.on-active').closest('td').next().find('input[type="text"]').hasClass('on-active'))
            //     $('.on-active').closest('td').next().find('input[type="text"]').addClass('on-active');
            //     $('.on-active').closest('td').next().find('input[type="text"]').focus()
            // }
        },
    },
    data() {
        return {
            controlSelected: '',
            imageControl: '',
        };
    },

    computed: {
        rowData() {
            return this.row;
        },
        listControlType() {
            return getAllControlForTableSetting([
                'label',
                'image',
                'qrCode',
                'textInput',
                'number',
                'date',
                'dateTime',
                'time',
                'select',
                'combobox',
                'user',
                'percent',
                'checkbox',
                'inputFilter',
            ]);
        },
    },
    mounted() {},
};
</script>
<style scoped>
input {
    max-width: 120px;
    padding: 2px 4px;
    font-size: 13px;
}
.v-autocomplete-type {
    width: 100px;
}

td {
    padding: 4px;
}
.sortableRow {
    background: white;
}

#rowDrag .v-list-item--dense,
.v-list--dense .v-list-item {
    padding: 0;
    min-height: 20px;
}
#rowDrag .v-list-item--dense,
.v-list--dense .v-list-item .v-list-item__icon {
    margin-right: 10px;
}
</style>
<style>
#rowDrag .v-autocomplete-type .v-input__slot {
    margin-top: 5px !important;
    box-shadow: none;
    background: unset;
}
#rowDrag .v-list-item--dense,
.v-list--dense .v-list-item {
    padding: 0 8px;
    min-height: 20px !important;
}
#rowDrag .v-autocomplete-type .v-input__append-inner {
    display: none;
}
</style>
