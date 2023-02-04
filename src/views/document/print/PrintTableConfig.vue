<template>
    <v-dialog v-model="isShow" width="1200" scrollable style="overflow: hidden">
        <v-card height="auto">
            <v-card-title class="headline">{{$t('v2.doc.configPrint')}}</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <VuePerfectScrollbar
                    style="position: relative; height: 100px; padding: 8px 0"
                >
                    <table border="0" class="table">
                        <thead>
                            <tr>
                                <th
                                    class="text-center"
                                    v-for="(col, index) in listRows"
                                    :key="index"
                                    :style="{ width: col.colWidth }"
                                >
                                    <span
                                        contenteditable="true"
                                        @blur="afterChangeColWidth($event, col)"
                                        class="col-width"
                                        >{{ col.colWidth }}
                                    </span>
                                </th>
                            </tr>
                            <tr>
                                <th
                                    class="text-center title-control"
                                    v-for="(col, index) in listRows"
                                    :key="index"
                                    :style="{ width: col.colWidth }"
                                >
                                    <div class="text-ellip">
                                        {{ col.title }}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    class="text-center"
                                    v-for="(col, index) in listRows"
                                    :key="index"
                                >
                                    <button
                                        class="btn-delete-column"
                                        @click="deleteColumn($event, col)"
                                    >
                                        X
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </VuePerfectScrollbar>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <div class="fs-13">
                    <span>{{$t('v2.doc.sum')}}:</span>
                    <span>{{ totalpercent }} %</span>
                </div>
                <v-btn color="green darken-1" text right @click="saveTable">
                    {{$t('v2.doc.save')}}
                </v-btn>

                <v-btn color="green darken-1" text right @click="hideDialog">
                    {{$t('v2.doc.close')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    data() {
        return {
            listRows: [],
            isShow: false,
        };
    },
    components: {
        VuePerfectScrollbar,
    },
    computed: {
        totalpercent() {
            return this.listRows.reduce((total, item) => {
                let colWidth = item.colWidth;
                colWidth = colWidth.replace('%', '');
                if (!isNaN(colWidth)) {
                    total += Number(colWidth);
                }
                return total;
            }, 0);
        },
    },

    methods: {
        setListRow(listRows) {
            this.listRows = listRows;
        },
        showDialog() {
            this.isShow = true;
        },
        hideDialog() {
            this.isShow = false;
        },

        //call lại sự kiện cho editor để them cột vào control bảng
        saveTable() {
            if (this.listRows.length > 0) {
                this.$emit('config-column-table-print', this.listRows);
            }
            this.listRows = [];
            this.hideDialog();
        },
        deleteColumn(e, col) {
            let colIndex = $(e.target).closest('td').index();
            this.listRows.splice(colIndex, 1);
        },
        afterChangeColWidth(e, col) {
            col.colWidth = $(e.target).text();
        },
    },
};
</script>

<style scoped>
.table {
    width: 100%;
    font-size: 13px;
}
.table th .col-width {
    background: orange;
    border-radius: 4px;
    color: white;
    padding: 0 8px;
    font-weight: 300;
    display: inline-block;
    margin-bottom: 5px;
}
.table th .col-width:focus {
    outline: none;
}
.table th input:focus {
    outline: none;
}

td {
    border: var(--symper-border);
    border-collapse: collapse;
}
table thead tr:nth-child(2) th {
    border: var(--symper-border);
    border-collapse: collapse;
    padding: 3px;
}
.btn-delete-column {
    padding: 0 8px;
}
.btn-delete-column:focus {
    outline: none;
}
.text-ellip {
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
</style>
