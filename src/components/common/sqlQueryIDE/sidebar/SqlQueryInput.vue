<template>
    <div class="px-5" style="height: 100%">
        <div class="pt-1" style="height: 85%">
            <VuePerfectScrollbar :style="{ height: '100%' }">
                <template v-for="(item, index) in listInput">
                    <span class="font-weight-regular subtitle-2 black--text">{{
                        index
                    }}</span>
                    <v-text-field
                        solo
                        height="20"
                        dense
                        background-color="#F7F7F7"
                        flat
                        hide-details
                        :key="index"
                        class="mb-2 subtitle-2 font-weight-regular"
                        v-model="item.value"
                    >
                    </v-text-field>
                </template>
            </VuePerfectScrollbar>
        </div>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

export default {
    components: {
        VuePerfectScrollbar,
    },
    data() {
        return {
            listInput: [],
        };
    },
    created() {
        this.$evtBus.$on('sql-query-input', (data) => {
            this.listInput = data;
        });
    },
    watch: {
        listInput: {
            handler(after, before) {
                this.$evtBus.$emit('script-editor-ide-input-change', after);
            },
            deep: true,
        },
    },
};
</script>

<style scoped>
.list-input {
    height: 370px;
}
</style>
