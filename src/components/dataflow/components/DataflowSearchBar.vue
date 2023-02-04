<template>
    <div
        class="symper-search-container"
        :class="{
            'd-none': isHideSearch
        }"
        style="z-index: 1; position: absolute; left: 45%; top: 10px"
    >
        <v-autocomplete
            ref="dataflowSearchInput"
            :menu-props="{
                maxHeight: 300,
                minWidth: 251,
                maxWidth: 251,
                nudgeLeft: 8,
                nudgeBottom: 3
            }"
            class="mr-2 ml-2"
            full-width
            solo
            return-object
            :search-input.sync="searchKey"
            :items="searchValue"
            item-text="text"
            item-value="id"
            background-color="grey lighten-4"
            :filter="filterNode"
            flat
            autofocus
            @click:prepend="$emit('hide-search-toggle',true)"
            prepend-icon="mdi-close-circle-outline"
            dense
            color="blue-grey lighten-2"
            @keydown="
                (data) => {
                    searchActionHanderler(data);
                }
            "
            :hide-no-data="true"
            :label="$t('v2.dataflow.search')"
        >
            <template slot="item" slot-scope="{ item }">
                <v-list-item @click="$emit('center-el',item.id)">
                    <v-list-item-content>
                        <v-list-item-title
                            class="symper-dataflow-search-item"
                            >{{ item.text }}</v-list-item-title
                        >
                        <div>
                            <div
                                class="symper-dataflow-search-sub-item text-ellipsis"
                                :style="{
                                    'max-width': item.nameToSaveAs
                                        ? 'calc(50% - 8px) !important'
                                        : '100% !important'
                                }"
                            >
                                {{ item.id }}
                            </div>
                            <div
                                v-if="item.nameToSaveAs"
                                style="
                                    width: 50% !important;
                                    margin-left: 8px !important;
                                "
                                class="text-ellipsis symper-dataflow-search-sub-item"
                            >
                                <v-icon size="12"
                                    >mdi-content-save-outline</v-icon
                                >
                                {{ item.nameToSaveAs }}
                            </div>
                        </div>
                    </v-list-item-content>
                </v-list-item>
            </template>
        </v-autocomplete>
    </div>
</template>

<script>
export default {
    name: 'dataflowSearch',
    props: {
        isHideSearch: {
            type: Boolean,
            default: false
        },
        instanceKey: {
            defaul: ''
        }
    },
    watch: {
        isHideSearch(after) {
            if (!after) {
                this.covertListItem();
            } else {
                this.resetData();
            }
        }
    },
    data() {
        return {
            searchValue: [],
            searchKey: ''
        };
    },
    computed: {
        dataflowInfo() {
            return this.$store.state.dataflow.allDataflow[this.instanceKey];
        }
    },
    methods: {
        
        resetData() {
            this.$set(this, 'searchValue', []);
            this.searchKey = '';
        },
        
        searchActionHanderler(event = null) {
            if (event.key == 'Escape' || (event.key == 'f' && event.ctrlKey)) {
                this.$emit('hide-search-toggle',true)
            } else if (this.searchValue.length == 0) {
                this.covertListItem();
            }
        },
        filterNode(item, queryText, itemText) {
            let lowcaseText = String(queryText).toLowerCase();
            return (
                String(item.text).toLowerCase().includes(lowcaseText) ||
                String(item.id).toLowerCase().includes(lowcaseText) ||
                String(item.nameToSaveAs).toLowerCase().includes(lowcaseText)
            );
        },
        covertListItem() {
            let dataflowKeys = Object.keys(this.dataflowInfo.allWidget);
            let nodes = [];
            dataflowKeys.forEach((key) => {
                if (key != 'home') {
                    nodes.push({
                        id: key,
                        text: this.dataflowInfo.allWidget[key].configs.wgName
                            ? this.dataflowInfo.allWidget[key].configs.wgName
                            : this.dataflowInfo.allWidget[key].type,
                        nameToSaveAs:
                            this.dataflowInfo.allWidget[key].configs
                                .nameToSaveAs
                    });
                }
            });
            this.$set(this, 'searchValue', nodes);
        }
    }
};
</script>

<style>
.symper-dataflow-search-item,
.symper-dataflow-search-sub-item {
    margin: 0 !important;
    padding: 0 !important;
}
.symper-dataflow-search-sub-item {
    display: inline-block;
    font-size: 12px;
    color: gray;
}
</style>
