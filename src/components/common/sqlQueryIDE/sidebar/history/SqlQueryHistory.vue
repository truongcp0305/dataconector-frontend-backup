<template>
    <div class="px-1" style="height: 100%; position: relative">
        <!-- Search -->
        <v-row class="mx-1 pt-1">
            <v-col class="p-0">
                <v-text-field
                    solo
                    height="20"
                    dense
                    background-color="#F7F7F7"
                    flat
                    hide-details
                    :placeholder="$t('sqlQueryIDE.searchQuery')"
                    v-model="searchKey"
                    v-on:keyup.enter="searchData"
                >
                    <template v-slot:append>
                        <v-icon dense> mdi-magnify </v-icon>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <!-- Search end -->

        <!-- List history -->
        <div class="mx-1 mt-1" style="height: 90%" v-show="!isEmptyHistory">
            <v-list dense nav class="p-0">
                <v-list-item-group>
                    <v-virtual-scroll
                        :items="cacheListHistory"
                        :item-height="65"
                        bench="10"
                    >
                        <template v-slot="item">
                            <ItemHistory
                                :item="item.item"
                                :key="index"
                                @run="run"
                            />
                        </template>
                    </v-virtual-scroll>
                </v-list-item-group>
            </v-list>
        </div>
        <div
            class="mt-10 text-center"
            v-if="isEmptyHistory"
            style="width: 100%"
        >
            <p class="ms-2 mt-2" style="font-size: 14px">
                {{ $t('sqlQueryIDE.emptyColumn') }}
            </p>
        </div>
        <!-- List history end -->

        <!-- Pagination -->

        <!-- Pagination end -->
    </div>
</template>

<script>
import Pagination from '@/components/common/Pagination';
import ItemHistory from './ItemHistory.vue';

export default {
    components: {
        Pagination,
        ItemHistory,
    },
    data() {
        return {
            searchKey: '',
            listHistory: [],
            cacheListHistory: [],
            totalRecord: 0,
            page: 1,
            pageSize: 4,
            pageSizeArray: [4],
            isEmptyHistory: false,
        };
    },
    created() {
        this.$evtBus.$on('script-editor-ide-add-history', () => {
            this.isEmptyHistory = false;
            this.getAllhistory();
        });
        this.getAllhistory();
    },
    methods: {
        getAllhistory() {
            if (localStorage.getItem('history')) {
                try {
                    this.cacheListHistory = JSON.parse(
                        localStorage.getItem('history'),
                    );
                } catch (e) {
                    localStorage.removeItem('history');
                }
            } else {
                this.isEmptyHistory = true;
            }
            this.totalRecord = this.cacheListHistory.length;
        },

        run(x) {
            this.$evtBus.$emit('script-editor-ide-run-history-query', x);
        },
        searchData() {
            let key = this.searchKey.trim();
            if (key == false && key != '') {
                this.isEmptyHistory = true;
                return;
            }
            this.getAllhistory();
            let k = [];
            if (key != '') {
                k = this.cacheListHistory.filter((value) => {
                    let text = value.sql.toLowerCase();
                    return text.includes(key.toLowerCase());
                });
                this.cacheListHistory = k;
                this.totalRecord = this.cacheListHistory.length;
                this.showData();
            }
            this.isEmptyHistory =
                this.cacheListHistory.length > 0 ? false : true;
        },
        changePage(vl) {
            this.page = vl.page;
            this.showData();
        },
    },
};
</script>

<style scoped>
.list-history {
    height: 315px;
}
button:hover {
    background: none !important;
}
button:focus {
    background: none !important;
}
.v-sheet.v-list {
    height: 100% !important;
}
.v-item-group.theme--light.v-list-item-group {
    height: 100% !important;
}
</style>
