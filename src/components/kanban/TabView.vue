<template>
    <div class="h-100">
        <v-tabs v-model="tab" align-with-title color="orange" height="35">
            <v-tabs-slider color="orange"></v-tabs-slider>
            <v-tab
                v-for="item in listTabs"
                :key="item"
                class="px-3 fs-13 ml-0 view-tab"
                style="text-transform: none"
            >
                {{ item }}
            </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab" class="h-100">
            <v-tab-item> </v-tab-item>

            <v-tab-item class="h-100">
                <EndUserKanban :idDoc="idDoc" />
            </v-tab-item>

            <v-tab-item> </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
import EndUserKanban from '@/views/kanban/EndUser/EndUserKanban';
export default {
    components: {
        EndUserKanban,
    },
    props: {
        idDoc: {
            type: String,
            default: '',
        },
    },
    created() {
        this.$evtBus.$on('set-tab-view', (tab) => {
            this.tab = tab;
        });
    },
    data() {
        return {
            tab: null,
            listTabs: ['Danh sách', 'Kanban'],
        };
    },
    watch: {
        tab: function (val) {
            if (val != 0) {
                this.$emit('hide-table', val);
            } else this.$emit('show-table');
        },
    },
    methods: {},
};
</script>
<style scoped>
.view-tab.v-tab:not(.v-tab--active) {
    color: black !important;
}
</style>
