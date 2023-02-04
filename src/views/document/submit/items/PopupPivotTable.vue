<template>
    <v-dialog
        v-model="isShow"
        width="350"
        scrollable
        class="pivotTable"
        style="overflow: hidden"
    >
        <v-card :height="250">
            <v-card-title class="s-card-title"> {{$t('v2.doc.putData')}} </v-card-title>
            <v-card-text class="s-card-text">
                <div v-for="(item, i) in data" :key="i">
                    <div v-if="!item.isDisable">
                        <div :class="{ 'mt-1': i > 0 }">
                            {{$t('v2.doc.valueFor')}} {{ item.controlTitle }}
                        </div>
                        <v-combobox
                            class="sym-small-size sym-style-input"
                            hide-selected
                            hide-details
                            :label="item.detailTitle"
                            solo
                            v-model="item.selected"
                            :items="item.value"
                        ></v-combobox>
                    </div>
                </div>
                <div
                    v-for="(item, i) in dataColPivot"
                    :key="i + item.controlName"
                    class="mt-1"
                >
                    <div>{{$t('v2.doc.valueFor')}} {{ item.controlTitle }}</div>
                    <v-menu nudge-top="-40" content-class="elevation-0">
                        <template v-slot:activator="{ on }">
                            <v-text-field
                                class="sym-small-size sym-style-input"
                                @click="afterClickInput(item, i)"
                                dense
                                :readonly="isShowDatePicker"
                                solo
                                v-on="on"
                                hide-details
                                v-model="item.selected"
                            ></v-text-field>
                        </template>
                        <v-date-picker
                            style="border: 1px solid lightgrey"
                            v-if="isShowDatePicker"
                            @input="handleClickDatePicker"
                            v-model="item.date"
                            no-title
                            scrollable
                        >
                        </v-date-picker>
                    </v-menu>
                </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text right @click="saveData">
                    {{ $t('common.save') }}
                </v-btn>

                <v-btn
                    color="green darken-1"
                    text
                    right
                    @click="isShow = false"
                >
                    {{ $t('common.close') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { getControlInstanceFromStore } from '../../common/common';
export default {
    props: {
        data: {
            type: Array,
        },
        dataColPivot: {
            type: Array,
        },
        instance: {
            type: Number,
            default: 0,
        },
    },
    watch: {
        isShow(vl) {
            this.selected = null;
        },
    },
    data() {
        return {
            isShowDatePicker: false,
            isShow: false,
            type: null,
            date: '',
            tableName: null,
        };
    },
    methods: {
        handleClickDatePicker(value) {
            this.dataColPivot.map((data) => {
                if (data.date == value) {
                    data.selected = this.$moment(value).format(data.formatDate);
                }
            });
        },
        afterClickInput(input, index) {
            let control = getControlInstanceFromStore(
                this.instance,
                input.controlName,
            );
            if (control.type == 'date') {
                this.dataColPivot[index].formatDate =
                    control.controlProperties.formatDate.value;
                this.isShowDatePicker = true;
            }
        },
        saveData() {
            this.$emit('before-add-pivot-data', {
                tableName: this.tableName,
                type: this.type,
                dataColPivot: this.dataColPivot,
                dataRowGroup: this.data,
            });
        },
        show(type, tableName) {
            this.type = type;
            this.tableName = tableName;
            this.isShow = true;
        },
        hide() {
            this.isShow = false;
        },
    },
};
</script>
<style scoped>
.s-card-title {
    padding: 4px 8px !important;
    font-size: 15px !important;
}
.s-card-text {
    padding: 12px !important;
    font-size: 13px;
}
.sym-small-size >>> .v-input__slot {
    box-shadow: unset !important;
    font-size: 12px;
}
.pivotTable >>> .v-menu__content {
    z-index: 900 !important;
}
</style>
