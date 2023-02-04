<template>
    <div>
        <div class="s-title fs-13">
            {{ $t('document.editor.matchingItem.config_row_group') }}
        </div>
        <v-row class="ml-1">
            <v-col class="col-md-5 list-columns pa-1">
                <draggable
                    :list="rows"
                    :animation="200"
                    group="control-group"
                    @change="changeListRows"
                >
                    <div
                        class="column-row-item fs-11 mb-1"
                        v-for="(item, index) in rows"
                        :data-index="index"
                        :key="index"
                    >
                        {{ item.name }}
                    </div>
                </draggable>
            </v-col>
            <v-col class="col-md-6 list-columns-selected ml-2 pa-0">
                <!-- <div class="fs-11" style="color: #b5b5b5">
                    {{
                        $t('document.editor.matchingItem.config_row_group_drag')
                    }}
                </div> -->
                <draggable
                    @change="changeRowSelected"
                    :list="rowSelected"
                    :animation="200"
                    group="control-group"
                    class="h-100 pa-1"
                >
                    <div
                        class="column-row-item-selected fs-11 mb-1"
                        v-for="(item, index) in rowSelected"
                        :key="index"
                    >
                        {{ item.name }}
                    </div>
                </draggable>
            </v-col>
        </v-row>
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    components: {
        VuePerfectScrollbar
    },
    props: {
        rows: {
            type: Array,
            defautl: () => {
                return [];
            }
        },
        rowSelected: {
            type: Array,
            defautl: () => {
                return [];
            }
        }
    },
    data() {
        return {};
    },
    created() {},
    methods: {
        changeRowSelected() {
            this.$emit('change-row-selected');
        },
        changeListRows() {
            this.$emit('change-list-rows');
        }
    },
    watch: {}
};
</script>
<style scoped>
.list-columns-selected {
    background: white;
    border-radius: 4px;
}
.list-columns-selected,.list-columns {
    height: 81px;
    overflow-y: scroll;
}
.list-columns::-webkit-scrollbar-track {
    background: rgb(242, 242, 242);
}
.column-row-item-selected {
    border: 1px solid #6d6d6d33;
}
.column-row-item, .column-row-item-selected {
    padding: 0px 8px;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    background: white;
}
</style>