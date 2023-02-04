<template>
    <div class="sort-content p-2" style="margin-right: -8px">
        <VuePerfectScrollbar style="max-height: 200px">
            <div
                v-for="(item, i) in selectedColumns"
                :key="i"
                class="d-flex mt-1 mb-1 justify-space-between"
            >
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <span class="fs-11 name-control-filter" v-on="on">
                            {{ item.desInfo.as }}
                        </span>
                    </template>
                    <span
                        >{{ item.desInfo.as }}
                        <span v-if="item.desInfo.des != item.desInfo.as"
                            >({{ item.desInfo.des }})</span
                        ></span
                    >
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            x-small
                            text-white
                            elevation="0"
                            @click="changeItemSortType(item)"
                            class="mr-2 ml-2"
                            v-on="on"
                            :color="item.sort != 'none' ? 'orange' : 'gray'"
                        >
                            <span
                                class="text-uppercase text-white"
                                :style="{
                                    color:
                                        item.sort != 'none' ? 'white' : 'black',
                                }"
                            >
                                {{ item.sort }}
                            </span>
                        </v-btn>
                    </template>
                    <span>{{ $t('bi.dashboard.changeSort') }}</span>
                </v-tooltip>
            </div>
        </VuePerfectScrollbar>

        <div class="d-flex flex-row-reverse mt-2 w-100 pr-2">
            <v-btn
                color="primary"
                class="w-100"
                small
                @click="applySort"
                elevation="0"
            >
                {{ $t('common.apply') }}
            </v-btn>
        </div>
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    components: {
        VuePerfectScrollbar,
    },
    props: {
        selectedColumns: {
            type: Array,
            default() {
                return [];
            },
        },
    },

    data() {
        return {};
    },
    watch: {},
    methods: {
        changeItemSortType(item) {
            let value =
                item.sort == 'none'
                    ? 'asc'
                    : item.sort == 'asc'
                    ? 'desc'
                    : 'none';
            this.$set(item, 'sort', value);
        },
        applySort() {
            this.$emit('apply-sort');
        },
    },
};
</script>
<style scoped>
.sort-content {
    background-color: #ffffff;
    z-index: 10000;
    max-height: 400px;
}
.name-control-filter {
    left: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 21px;
    display: inline-block;
    max-width: 100px;
}
</style>
