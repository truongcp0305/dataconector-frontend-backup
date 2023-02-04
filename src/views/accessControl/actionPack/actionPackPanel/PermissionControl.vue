<template>
    <div class="permission-control">
        <div class="loading" v-if="loading">
            <Preloader style="position: static !important" class="mx-auto" />
        </div>
        <div class="table-permission-control">
            <!-- <div v-if="itemData.outTable && itemData.outTable.colDef" 
                class="fs-13 mb-2 fw-430">
                {{$t("permissions.permissionControl.infoOutsideTable")}}
            </div> -->
            <!-- <AgTable 
                v-if="itemData.outTable && itemData.outTable.colDef"
                :columnDefs="itemData.outTable.colDef"
                :styleTable="'height:200px'"
                :rowData="itemData.outTable.rowData"
            /> -->
            <div
                v-if="itemData.table && itemData.table.rowData.length > 0"
                class="fs-13 mb-2 fw-430"
            >
                {{ $t('permissions.permissionControl.table') }}
            </div>
            <AgTable
                @row-click="handleRowClick"
                :name="'tableInDoc'"
                v-if="itemData.table && itemData.table.rowData.length > 0"
                :columnDefs="itemData.table.colDef"
                :rowData="itemData.table.rowData"
                :autoHeight="true"
            />
            <div
                class="list-table-in-doc mb-10 fw-430"
                v-if="JSON.stringify(itemData.inTable) != '{}'"
            >
                <div v-for="(item, tblName) in itemData.inTable" :key="tblName">
                    <div class="fs-13 mb-2">
                        {{ $t('permissions.permissionControl.infoTable') }} :
                        {{ tblName }}
                    </div>
                    <AgTable
                        :name="tblName"
                        :columnDefs="item.colDef"
                        @row-click="handleRowClick"
                        :autoHeight="true"
                        :rowData="item.rowData"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-balham.css';
import AgTable from './AgTable';

import Preloader from '@/components/common/Preloader.vue';

export default {
    props: {
        itemData: {
            type: Object,
            default() {
                return {};
            }
        },
        loading: {
            type: Boolean,
            default() {
                return false;
            }
        }
    },
    components: {
        Preloader,
        AgTable
    },

    data() {
        return {};
    },
    methods: {
        handleRowClick(nameTable) {
            this.$emit('click-row', nameTable);
        }
    }
};
</script>
<style scoped>
.permission-control {
    overflow: auto;
}
</style>