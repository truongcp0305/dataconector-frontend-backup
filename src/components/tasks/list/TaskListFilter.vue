<template>
    <div class="symper-task-list-filter bg-white py-3">
        <div v-for="(item, key) in listFilter" :key="key" class="pt-2">
            <div class="fs-13 pl-3">
                {{ item.label }}
            </div>
            <v-combobox
                v-model="item.value"
                :items="item.items"
                :filter="filterItems"
                :hide-no-data="!item.searchKey"
                :search-input.sync="item.searchKey"
                :item-value="'id'"
                hide-details
                @change="handleFilterChange"
                chips
                dense
                flat
                class="select-orgchart border-all mx-4 mb-2 mt-1 sym-small-size"
                style="background-color: "
                :multiple="!item.singleValue"
                solo
            >
                <template v-slot:selection="{ attrs, item, select, selected }">
                    <v-chip
                        class="mt-1 ml-0"
                        color="blue-grey lighten-5"
                        close-icon="mdi-close"
                        v-bind="attrs"
                        :input-value="selected"
                        close
                        x-small
                        @click="select"
                        @click:close="removeItem(item, key)"
                    >
                        {{ item.displayName }}
                    </v-chip>
                </template>

                <template v-slot:item="{ index, item }">
                    <span class="fs-13 py-1">{{ item.displayName }}</span>
                </template>
            </v-combobox>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        removeItem(item, key) {
            let vl = this.listFilter[key].value;
            if ($.isArray(vl)) {
                let idx = 0;
                for (let i = 0; i < vl.length; i++) {
                    if (vl[i].id == item.id) {
                        idx = i;
                        break;
                    }
                }
                vl.splice(idx, 1);
            } else {
                this.listFilter[key].value = null;
            }
            this.handleFilterChange();
        },
        handleFilterChange() {
            let filterData = {};
            for (let key in this.listFilter) {
                if (this.listFilter[key].value) {
                    filterData[key] = [];

                    if ($.isArray(this.listFilter[key].value)) {
                        filterData[key] = this.listFilter[key].value.reduce(
                            (arr, ele) => {
                                if (key == 'processDefinitionKey') {
                                    arr.push(ele.processKey);
                                } else {
                                    arr.push(ele.id);
                                }
                                return arr;
                            },
                            [],
                        );
                        filterData[key] = filterData[key].join(',');
                    } else {
                        filterData[key] = this.listFilter[key].value.id;
                    }
                }
            }
            this.$emit('filter-change-value', filterData);
        },
        filterItems(item, queryText, itemText) {
            const hasValue = (val) => (val != null ? val : '');
            const text = item.displayName;
            const query = hasValue(queryText);
            return (
                text
                    .toString()
                    .toLowerCase()
                    .indexOf(query.toString().toLowerCase()) > -1
            );
        },
    },
    computed: {
        allProcessDefinition() {
            return this.$store.state.process.allDefinitions;
        },
    },
    watch: {
        allProcessDefinition: {
            deep: true,
            immediate: true,
            handler(afterValue) {
                let arr = [];
                for (let definitionId in afterValue) {
                    let def = afterValue[definitionId];
                    def.displayName = def.name;
                    arr.push(def);
                }
                this.$set(this.listFilter.processDefinitionKey, 'items', arr);
            },
        },
    },
    data() {
        return {
            searchCombo: null,
            listFilter: {
                assignee: {
                    label: this.$t('tasks.header.assignee'),
                    items: this.$store.state.app.allUsers,
                    value: null,
                    searchKey: '',
                },
                owner: {
                    label: this.$t('tasks.header.owner'),
                    items: this.$store.state.app.allUsers,
                    value: null,
                    searchKey: '',
                },
                processDefinitionKey: {
                    label: this.$t('process.instance.process_definition_name'),
                    items: [],
                    value: null,
                    searchKey: '',
                },
                status: {
                    label: this.$t('common.status'),
                    items: [
                        {
                            id: 'done',
                            displayName: this.$t('common.done'),
                        },
                        {
                            id: 'notDone',
                            displayName: this.$t('common.notDone'),
                        },
                    ],
                    value: {
                        id: 'notDone',
                        displayName: this.$t('common.notDone'),
                    },
                    singleValue: true,
                    searchKey: '',
                },
            },
        };
    },
};
</script>

<style></style>
