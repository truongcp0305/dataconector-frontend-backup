<template>
    <div class="d-flex flex-column h-100 relation-link-config">
        <div style="margin-left: auto; margin-right: auto">
            <span class="fs-15 mt-1">{{$t('v2.relation.columnsLinks')}}</span>
        </div>
        <div class="mx-1 d-flex flex-column">
            <VuePerfectScrollbar :style="{ 'max-height': menuItemsHeight }">
                <v-expansion-panels multiple>
                    <v-expansion-panel
                        v-for="(item, i) in relationLinkData"
                        :key="i"
                    >
                        <v-expansion-panel-header>
                            <div class="flex-grow-1">{{$t('v2.relation.groupLink')}} {{ i }}</div>
                            <div class="d-flex flex-row-reverse">
                                <v-icon
                                    small
                                    @click="removeGroup(item, i, $event)"
                                >
                                    mdi-close
                                </v-icon>
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div
                                v-for="(childItem, j) in item.childItem"
                                :key="j"
                            >
                                <RelationLinkItem
                                    @remove-column="removeColumn(i, j)"
                                    :listDatasetSelected="listDatasetSelected"
                                    :item="childItem"
                                    @change-value="handleChangeValue(item)"
                                />
                            </div>
                            <v-btn x-small color="gray" @click="addColumn(i)">
                                <v-icon x-small class="mr-2">mdi-plus</v-icon>
                                <span class="fs-13 font-weight-light">
                                    {{ $t('common.add-column') }}
                                </span>
                            </v-btn>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </VuePerfectScrollbar>
            <v-btn x-small color="gray" class="mt-1" @click="addGroup">
                <v-icon x-small class="mr-2">mdi-plus</v-icon>
                <span class="fs-13 font-weight-light"> {{$t('v2.relation.addGroup')}} </span>
            </v-btn>
        </div>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { util } from '@/plugins/util.js';
import RelationLinkItem from '@/components/relation/RelationLinkItem';

export default {
    components: {
        VuePerfectScrollbar,
        RelationLinkItem
    },
    props: {
        listDatasetSelected: {
            type: Array,
            default() {
                return [];
            }
        },
        mapColumnKey: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            menuItemsHeight: '',
            relationLinkData: {}
        };
    },

    mounted() {
        this.menuItemsHeight = util.getComponentSize(this).h - 80 + 'px';
    },
    methods: {
        reduceLinks(allLinks) {
            this.relationLinkData = {};
            for (let i in allLinks) {
                let firstLinkInfo = this.translateLinkToGroupItem(allLinks[i]);
                let subItem = [];
                let obj = {
                    childItem: firstLinkInfo
                };
                subItem.push(allLinks[i].to);
                for (let j = 1; j < allLinks.length; j++) {
                    if (allLinks[j]) {
                        if (subItem.includes(allLinks[j].from)) {
                            let item = this.translateLinkToGroupItem(
                                allLinks[j]
                            );
                            obj.childItem = obj.childItem.concat(item[1]);
                            subItem.push(allLinks[j].to);
                            delete allLinks[j];
                        }
                    }
                }
                this.$set(
                    this.relationLinkData,
                    Object.keys(this.relationLinkData).length + 1,
                    obj
                );
            }
        },
        translateLinkToGroupItem(link) {
            let arrFrom = this.mapColumnKey[link.from];
            let arrTo = this.mapColumnKey[link.to];

            return [
                {
                    dataset: arrFrom.dataset,
                    column: arrFrom.column
                },
                {
                    dataset: arrTo.dataset,
                    column: arrTo.column,
                    uid: link.uid
                }
            ];
        },
        removeGroup(item, idx, event) {
            event.preventDefault();
            event.stopPropagation();
            let self = this;
            if (item.childItem.length > 1) {
                let flag = true;
                item.childItem.forEach(function (e) {
                    if (e.uid) {
                        flag = false;
                        self.$emit('delete-link', e.uid);
                    }
                });
                if (flag) {
                    delete this.relationLinkData[idx];
                }
            }
        },
        addGroup() {
            let index = Object.keys(this.relationLinkData).length + 1;
            let obj = {
                childItem: [
                    {
                        dataset: '',
                        column: ''
                    },
                    {
                        dataset: '',
                        column: ''
                    }
                ]
            };
            this.$set(this.relationLinkData, index, obj);
        },
        addColumn(idx) {
            this.relationLinkData[idx].childItem.push({
                dataset: '',
                column: ''
            });
        },
        removeColumn(i, j) {
            let flag = true;
            if (j == 0 && this.relationLinkData[i].childItem.length > 1) {
                if (this.relationLinkData[i].childItem[1].uid) {
                    this.$emit(
                        'delete-link',
                        this.relationLinkData[i].childItem[1].uid != ''
                    );
                    flag = false;
                }
            } else {
                if (
                    this.relationLinkData[i].childItem[j] &&
                    this.relationLinkData[i].childItem[j].uid != ''
                ) {
                    flag = false;
                    this.$emit(
                        'delete-link',
                        this.relationLinkData[i].childItem[j].uid
                    );
                }
            }
            if (flag) {
                this.relationLinkData[i].childItem.splice(j, 1);
            }
        },
        handleChangeValue(data) {
            if (data.childItem.length > 1) {
                let flag = true;
                for (let k in data.childItem) {
                    for (let j in data.childItem[k]) {
                        if (data.childItem[k][j] == '') {
                            flag = false;
                        }
                    }
                }
                if (flag) {
                    for (let i = 0; i < data.childItem.length - 1; i++) {
                        if (
                            data.childItem[i + 1].column != '' &&
                            data.childItem[i + 1].dataset != ''
                        ) {
                            let obj = this.translateItemToLink(
                                data.childItem[i],
                                data.childItem[i + 1]
                            );
                            this.$emit('add-link', obj);
                        }
                    }
                }
            }
        },
        translateItemToLink(from, to) {
            return {
                source: {
                    id: from.dataset,
                    port: from.dataset + '_' + from.column
                },
                symperLinkType: 'oo',
                target: {
                    id: to.dataset,
                    port: to.dataset + '_' + to.column,
                    uid: to.uid ? to.uid : ''
                }
            };
        }
    }
};
</script>

<style scoped>
.relation-link-config >>> .v-expansion-panel-header {
    min-height: unset !important;
    padding: 8px !important;
    font-size: 13px;
}
.relation-link-config >>> .v-expansion-panel::before {
    box-shadow: unset !important;
}
.relation-link-config >>> .v-expansion-panel-content__wrap {
    padding: 0 10px !important;
}
</style>
