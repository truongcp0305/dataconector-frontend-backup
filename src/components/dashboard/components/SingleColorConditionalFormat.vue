<template>
    <div class="h-100" style="overflow-x: hidden">
        <div
            v-for="(item, idx) in value"
            :key="idx"
            class="d-flex justify-space-between mb-1"
        >
            <filter-data
                :nodeData="nodeData"
                :useConditionProps="true"
                :condition="item.condition"
            />

            <div class="d-flex">
                <TextStyleSetting v-model="item.style" />
                <v-icon
                    @click="removeThisItem(idx)"
                    style="height: 25px; margin-left: 5px"
                    class="fs-16"
                    >mdi-close</v-icon
                >
            </div>
        </div>

        <v-btn @click="addMoreCondition()" small depressed class="w-100 py-2">
            {{ $t('v2.dashboard.addMoreCondition') }}
        </v-btn>
    </div>
</template>

<script>
import FilterData from '../../dataflow/components/configs/FilterData.vue';
import TextStyleSetting from '@/components/common/bi/TextStyleSetting';
export default {
    computed: {
        nodeData() {
            let self = this;
            let allColumn = this.columns.reduce((map, el) => {
                map[el.name] = el;
                el.title = el.as;
                return map;
            }, {});
            let nodeConfig = {
                configs: {
                    allColumns: allColumn
                }
            };
            return nodeConfig;
        }
    },
    methods: {
        handleChangeItemSetting() {},
        removeThisItem(idx) {
            this.value.splice(idx, 1);
        },
        addMoreCondition() {
            this.value.push({
                condition: [
                    {
                        id: 'root',
                        label: 'AND',
                        nodeType: 'group',
                        children: [],
                        name: 'AND'
                    }
                ],
                style: {
                    background: '#FFFFFF',
                    fontColor: '#000000',
                    italic: false,
                    bold: false,
                    fontSize: 13,
                    underline: false,
                    strike: false
                }
            });
        }
    },
    components: {
        FilterData,
        TextStyleSetting
    },
    props: {
        columns: {
            type: Array,
            default() {
                return [];
            }
        },
        value: {
            type: Array,
            default() {
                return [
                    // {
                    //     condition : {}, // điều kiện hiển thị, cấu hình giống như cây điều kiện
                    //     style: {} // cách hiển thị khi thỏa mãn điều kiện, các cấu hình giống prop value của component TextStyleSetting.vue
                    // }
                ];
            }
        }
    }
};
</script>

<style></style>
