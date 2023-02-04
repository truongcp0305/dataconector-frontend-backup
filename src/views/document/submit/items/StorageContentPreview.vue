<template>
    <div class="h-100">
        <div class="list-control-data p-2">
            <table class="w-100">
                <tr
                    v-for="item in storageDocumentData.listControlOutsideTable"
                    :key="item.name"
                >
                    <td class="control-name">{{ item.title }}</td>
                    <td class="control-value">
                        <div>{{ item.value }}</div>
                    </td>
                </tr>
            </table>
        </div>
        <div class="table-data p-2">
            <div v-for="item in storageDocumentData.listTable" :key="item.name">
                <h4>{{ item.title }}</h4>
                <VuePerfectScrollbar style="height: 400px">
                    <table class="w-100">
                        <tr>
                            <th
                                class="control-header"
                                v-for="(th, i) in item.columns"
                                :key="th + i"
                            >
                                {{ th }}
                            </th>
                        </tr>
                        <tr v-for="(row, index) in item.value" :key="index">
                            <td
                                class="control-name"
                                v-for="(td, ii) in row"
                                :key="td + ii"
                            >
                                {{ td }}
                            </td>
                        </tr>
                    </table>
                </VuePerfectScrollbar>
            </div>
        </div>
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    props: {
        storageDocumentData: {
            type: Object,
            default: { listTable: [], listControlOutsideTable: [] },
        },
    },
    components: {
        VuePerfectScrollbar,
    },
};
</script>

<style scoped>
.control-name {
    width: 200px;
}
.control-value div {
    color: blue;
    width: 670px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.list-control-data {
    font-size: 12px;
}

td,
th {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 4px;
}
</style>
