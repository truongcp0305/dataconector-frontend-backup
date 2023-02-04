<template>
    <div>
        <div v-for="column in listColumns" :key="column.key">
            <div :id="'column-option' + column.key" class="d-flex">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <span
                            v-bind="attrs"
                            v-on="on"
                            class="kanban-name-column"
                            >{{ column.label }}</span
                        >
                    </template>
                    <span>{{ column.label }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <span
                            v-bind="attrs"
                            v-on="on"
                            class="label-sum-card"
                            v-if="column.sumCard > 99"
                            >99+</span
                        >
                        <span
                            v-bind="attrs"
                            v-on="on"
                            class="label-sum-card"
                            v-else
                            >{{ column.sumCard }}</span
                        >
                    </template>
                    <span>{{ column.sumCard }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-bind="attrs"
                            v-on="on"
                            x-small
                            icon
                            class="column-option d-inline-block refresh-kanban"
                            style="margin-right: 24px"
                            @click="refreshColumn(column.id)"
                        >
                            <i class="fs-15 mdi mdi-refresh"></i>
                        </v-btn>
                    </template>
                    <span>{{ $t('common.refresh') }}</span>
                </v-tooltip>
                <span class="column-option">
                    <v-menu
                        offset-y
                        nudge-left="16"
                        @input="
                            (data) => {
                                openMenuOption(column.id, data);
                            }
                        "
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                v-on="on"
                                x-small
                                icon
                                class="float-right d-inline-block"
                            >
                                <i class="fs-18 mdi mdi-dots-horizontal"></i>
                            </v-btn>
                        </template>

                        <v-list v-if="isShowColumnOption">
                            <v-list-item
                                @click="openFilterColumn(column.id)"
                                class="menu-item"
                            >
                                <span class="fs-13">{{
                                    $t(
                                        'kanban.enduser_view.column.filter.filter_column',
                                    )
                                }}</span>
                            </v-list-item>

                            <v-list-item class="menu-item" divided>
                                <v-menu
                                    bottom
                                    offset-x
                                    :close-on-content-click="
                                        closeOnContentClick
                                    "
                                    nudge-right="13"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                        <div v-bind="attrs" v-on="on">
                                            <span class="fs-13">{{
                                                $t('bi.dashboard.sort')
                                            }}</span>
                                        </div>
                                    </template>
                                    <SortData
                                        :selectedColumns="
                                            column.dataFilterColumn.rawConfigs
                                                .setting.column.selectedColums
                                        "
                                        @apply-sort="applySort(column.id)"
                                    />
                                </v-menu>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </span>
            </div>
            <div
                :id="'column-pagination' + column.key"
                class="column svelte-bzo6n1"
            >
                <Pagination
                    ref="pagination"
                    :total="Number(column.sumCard)"
                    :totalVisible="0"
                    :pageSizeOptions="[10]"
                    :isConfigKanban="true"
                    :shortMode="true"
                    :showRange="false"
                    :indexPagination="String(column.id)"
                    v-show="column.sumCard > 10"
                    @on-change-page="changePage"
                    :pageActive="pageActive"
                ></Pagination>
            </div>
            <div
                :id="'empty-card' + column.key"
                class="fs-13"
                style="text-align: center; margin-top: 16px; "
            >
                <div v-show="column.sumCard <= 0">
                    <span>{{ $t('kanban.enduser_view.card.empty_card') }}</span>
                    <span
                        style="
                            color: #fb7e00;
                            text-decoration: underline;
                            cursor: pointer;
                        "
                        @click="showSeeMoreInforEmptyCard(column.label)"
                    >
                        {{ $t('common.more_infor') }}</span
                    >
                </div>
            </div>
            <div
                :id="'loading-column' + column.key"
                :style="{
                    visibility:
                        column.isLoadingDataColumn == true
                            ? 'visible'
                            : 'hidden',
                }"
                class="fs-13 column svelte-bzo6n1"
                style="text-align: center; margin-bottom: 4px"
            >
                <v-progress-linear
                    indeterminate
                    background-color="none"
                    color="#FB7E00"
                ></v-progress-linear>
            </div>
        </div>
        <div id="column-pagination" class="content svelte-167afmv"></div>
        <div id="column-loading" class="content svelte-167afmv"></div>
        <v-dialog v-model="moreInforEmptyCard" max-width="550">
            <v-card>
                <v-card-title class="text-h7">
                    {{ $t('kanban.enduser_view.card.notify_empty_card.title') }}
                    <v-spacer></v-spacer>
                    <v-btn x-small icon @click="closeSeeMoreInforEmptyCard()">
                        <i class="mdi mdi-close fs-16"></i>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <span
                        >{{ $t('common.column') }} {{ nameColumnSelected }}
                        {{
                            $t(
                                'kanban.enduser_view.card.notify_empty_card.content',
                            )
                        }}</span
                    ><br />
                    <span>{{
                        $t(
                            'kanban.enduser_view.card.notify_empty_card.solution',
                        )
                    }}</span>
                    <ul>
                        <li>
                            {{
                                $t(
                                    'kanban.enduser_view.card.notify_empty_card.method_1',
                                )
                            }}
                        </li>
                        <li>
                            {{
                                $t(
                                    'kanban.enduser_view.card.notify_empty_card.method_2_1',
                                )
                            }}
                            {{ nameColumnSelected }}.
                            {{
                                $t(
                                    'kanban.enduser_view.card.notify_empty_card.method_2_2',
                                )
                            }}
                        </li>
                    </ul>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import Pagination from '@/components/common/Pagination';
import SortData from '@/components/dashboard/components/SortData';
export default {
    components: {
        SortData,
        Pagination,
    },
    props: {
        listColumns: {
            type: Array,
            default() {
                return [];
            },
        },
        pageActive: {
            type: Number,
            default: 0,
        }
    },

    data() {
        return {
            closeOnContentClick: false,
            moreInforEmptyCard: false,
            nameColumnSelected: '',
            isShowColumnOption: false,
        };
    },
    watch: {},
    methods: {
        refreshColumn(idColumn) {
            this.$emit('refresh-column', idColumn);
        },
        applySort(idColumn) {
            this.closeOnContentClick = true;
            setTimeout(
                (self) => {
                    self.closeOnContentClick = false;
                },
                1000,
                this,
            );
            this.$emit('apply-sort', idColumn);
        },
        openFilterColumn(idColumn) {
            this.$emit('open-filter-column', idColumn);
        },
        changePage(vl) {
            this.$emit('change-page', vl);
        },
        closeSeeMoreInforEmptyCard() {
            this.moreInforEmptyCard = false;
        },
        showSeeMoreInforEmptyCard(nameColumn) {
            this.moreInforEmptyCard = true;
            this.nameColumnSelected = nameColumn;
        },
        openMenuOption(idColumn, data) {
            if (!data) {
                this.isShowColumnOption = false;
            } else {
                setTimeout(() => {
                    this.isShowColumnOption = true;
                }, 50);
            }
        },
    },
};
</script>
<style scoped>
.column-option {
    position: absolute;
    top: calc(50% - 10px);
    right: 10px;
    cursor: pointer;
    background: #FFFFFF;
    border-radius: 25px;
}
.menu-item {
    min-height: 30px;
    padding: 0 8px;
    margin: 0 4px;
}
.menu-item:hover {
    background-color: #f5f5f5;
    border-radius: 4px;
}
.report-self-filter-container {
    position: absolute;
    right: 0px;
    width: 250px;
    background-color: white;
    height: 100%;
    box-shadow: 1px 4px 7px 0px rgb(115 115 115 / 75%);
    z-index: 2;
}
.label-sum-card {
    margin-left: 8px;
    background-color: #919191;
    border-radius: 30px;
    text-align: center;
    padding: 2px 6px;
    color: white;
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;
    height: 16px;
    margin-top: 2px;
    border: 1px solid #FFFFFF;
}
.kanban-name-column {
    left: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 21px;
    display: inline-block;
    max-width: 168px;
    font-size: 13px;
    color: #6D6E6F;
    font-weight: 500;
}
.column.svelte-bzo6n1 >>> .v-pagination__navigation {
    background-color: #F4F5F7 !important;
}
#column-pagination,
#column-loading {
    position: absolute;
    bottom: 4px;
}
#column-pagination .column,
#column-loading .column {
    min-width: 280px;
    width: 280px;
    margin-right: 8px;
    background: #F4F5F7;
    border-radius: 0px 0px 8px 8px;
    height: 36px;
}
#column-pagination .column{
    margin-top: 4px;
    line-height: 40px;
}
#column-loading{
    top: 32px;
}
#column-loading .column{
    padding: 0px 8px;
}
#column-loading >>> .v-progress-linear__indeterminate {
    border-radius: 4px;
}
.column.svelte-bzo6n1 >>> .s-pagination ul.v-pagination{
    justify-content: end !important;
}
#column-loading >>> .v-progress-linear{
    border-radius: 4px;
}

</style>
