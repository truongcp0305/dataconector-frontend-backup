<template>
    <div
        v-show="isShow"
        class="h-100 w-100 card-history-control"
        :style="positionBox"
    >
        <v-data-table
            :headers="headers"
            :items="dataTable"
            disable-pagination
            fixed-header
            hide-default-footer
            :height="tableHeight"
            dense
            class="table"
            :no-data-text="$t('v2.doc.noData')"
            calculate-widths
        >
            <template v-slot:item.userupdate="{ item }">
                <InfoUser :userId="item.userupdate" />
            </template>
            <template v-slot:item.dataChange="{ item }">
                <div v-html="item.dataChange"></div>
            </template>
        </v-data-table>
    </div>
</template>
<script>
import { getControlInstanceFromStore } from './../common/common.js';
import InfoUser from '@/components/myItem/InfoUser.vue';
import { util } from '../../../plugins/util.js';

export default {
    mounted() {},
    components: {
        InfoUser,
    },
    props: {
        focusingControlName: {
            type: String,
            default: '',
        },
        instance: {
            type: Number,
            default: 0,
        },
    },
    watch: {
        focusingControlName: {
            immediate: true,
            deep: true,
            handler: function (vl) {
                if (vl) {
                    this.computeDataTable();
                    setTimeout(
                        (self) => {
                            self.tableHeight = util.getComponentSize(self).h;
                        },
                        10,
                        this,
                    );
                }
            },
        },
    },
    data() {
        return {
            tableHeight: 200,
            isShow: false,
            positionBox: { top: 0, left: 0 },
            headers: [
                { text: this.$t('v2.doc.time'), value: 'date' },
                { text: this.$t('v2.doc.control'), value: 'control' },
                { text: this.$t('v2.doc.userUpdate'), value: 'userupdate' },
                { text: this.$t('v2.doc.change'), value: 'dataChange' },
            ],
            dataTable: [],
            controlId: '',
        };
    },

    methods: {
        computeDataTable() {
            let ctrlName = this.focusingControlName;
            let ctrlObj = getControlInstanceFromStore(this.instance, ctrlName);
            let trackChange =
                this.$store.state.document.detail[this.instance].trackChange;
            let inTable = ctrlObj.inTable;
            let tableControl =
                inTable != false
                    ? getControlInstanceFromStore(this.instance, inTable)
                    : false;
            if (tableControl != false) {
                let cellMeta = tableControl.tableInstance.getFocusedCell();
                let rowNode = tableControl.tableInstance.getRowNode(
                    cellMeta.rowIndex,
                );
                rowId = rowNode.data['childObjectId'];
            }
            let data = [];
            for (let item of trackChange) {
                let info = {
                    date: item.date,
                    userupdate: item.userUpdate,
                };
                for (let ctrl of item.controls) {
                    if (ctrl.name == ctrlName || ctrl.isTable == ctrlName) {
                        let beforeValue = ctrl.data.old;
                        let afterValue = ctrl.data.new;
                        info.control = ctrl.title;
                        if (ctrlObj.type == 'user') {
                            beforeValue = ctrlObj.mapData[beforeValue];
                            afterValue = ctrlObj.mapData[afterValue];
                        }
                        info.dataChange =
                            `<span style="color:red" ><del>` +
                            beforeValue +
                            `</del></span> -> <span style="color:green" >` +
                            afterValue +
                            `</span>`;
                        data.push(info);
                    }
                }
            }
            this.dataTable = data;
        },
        show(el = null) {
            this.isShow = true;
            if (el) {
                this.calculatorPositionBox(el);
            }
        },
        hide() {
            this.isShow = false;
        },
        setData(data) {
            this.dataTable = data.dataBody;
        },
        calculatorPositionBox(el) {
            let autoEL = $(this.$el).detach();
            el.parent().append(autoEL);
            this.positionBox = { top: el.height() + 2 + 'px', left: '0px' };
        },
    },
};
</script>
<style scoped>
.table >>> .text-start {
    font-size: 13px;
}
.card-history-control {
    position: absolute;
    top: 0;
    left: 400px;
    z-index: 99999;
    max-width: unset !important;
}
.active-row {
    background: #f0f0f0;
}
.card-history-control >>> tbody tr {
    font-size: 13px;
    color: #212529;
}
.card-history-control >>> td {
    /* display: flex!important; */
    height: 30px;
    font-size: 13px;
    white-space: nowrap;
}
.card-history-control >>> th {
    /* display: flex!important; */
    white-space: nowrap;
}
.row-item {
    color: red;
}
</style>
