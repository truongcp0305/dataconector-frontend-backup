<template>
    <div
        :class="{
            'w-100 position-relative': true,
            's-pagination-mini': contentSize == 'mini',
            's-pagination-normal': contentSize != 'mini',
            'short-mode': shortMode || pageMode == 'short'
        }"
    >
        <v-select
            class="s-select-page-size float-left"
            :style="
                shortMode || pageMode == 'short' ? 'width:40px' : 'width:75px'
            "
            v-model="size"
            :items="pageSizeOptions"
            hide-details
            solo
            dense
            flat
            @change="changePageSize"
            v-if="!isConfigKanban && pageMode !== 'mini' && !hideTotalSection"
        ></v-select>
        <div
            :style="{
                'vertical-align': 'middle',
                width: paginationMode ? pageWidth : pagesWidth
            }"
            :class="{
                'float-left': !isConfigKanban,
                'float-right': isConfigKanban
            }"
        >
            <v-pagination
                class="s-pagination"
                v-model="page"
                :length="pageLength"
                small
                next-icon="mdi-chevron-right"
                prev-icon="mdi-chevron-left"
                :total-visible="totalVisibleView"
                @next="emitChangeInfo"
                @prev="emitChangeInfo"
                @input="emitChangeInfo"
                :style="{ 'margin-left': isConfigKanban ? '30px' : '' }"
            ></v-pagination>
        </div>
        <div
            class="mr-2 items-range"
            style="line-height: 25px"
            v-if="
                showRange &&
                !isConfigKanban &&
                pageMode !== 'mini' &&
                pageMode == 'full' &&
                !shortMode
            "
        >
            {{ $t('common.show') }}
            <span class="font-weight-medium">{{ rowRange }}</span>
            {{ $t('common.of') }}
            <span class="font-weight-medium">{{ total }}</span>
            {{ $t('common.records') }}
        </div>
        <div
            class="mr-2 items-range"
            style="line-height: 25px"
            v-else-if="
                showRange &&
                (shortMode || pageMode == 'short' || pageMode == 'medium') &&
                pageMode !== 'mini'
            "
        >
            <span class="font-weight-medium">{{ rowRange }}</span> /
            <span class="font-weight-medium">{{ total }}</span>
        </div>
    </div>
</template>
<script>
export default {
    computed: {
        rowRange() {
            let start = (this.page - 1) * this.size;
            let end = 0;
            if (this.page * this.size >= this.total) {
                end = this.total;
            } else {
                end = this.page * this.size;
            }
            return `${start} - ${end}`;
        },
        pageLength() {
            if (this.total % this.size == 0) {
                return this.total / this.size;
            } else {
                return Math.floor(this.total / this.size) + 1;
            }
        },
        pagesWidth() {
            if (this.shortMode && this.totalVisible == 3) {
                return '100px';
            } else if (this.shortMode) {
                return '210px';
            } else {
                return 36 * this.totalVisible + 100 + 'px';
            }
        }
    },
    props: {
        hideTotalSection: {
            type: Boolean,
            default: false
        },
        contentSize: {
            type: String,
            default: 'normal'
        },

        total: {
            type: Number,
            default: 0
        },
        pageSizeOptions: {
            type: Array,
            default: function () {
                return [50, 75, 100];
            }
        },
        totalVisible: {
            type: Number,
            default: 7
        },
        showRange: {
            type: Boolean,
            default: true
        },
        paginationMode: {
            type: String,
            default: ''
        },
        shortMode: {
            type: Boolean,
            default: false
        },
        containerWidth: {
            type: Number,
            default: 470
        },
        isConfigKanban: {
            type: Boolean,
            default: false
        },
        indexPagination: {
            type: String,
            default: ''
        },
        pageActive: {
            type: Number,
            default: 0
        }
    },
    mounted() {
        this.totalVisibleView = this.totalVisible;
        if (this.paginationMode == 'auto') {
            if (Number(this.containerWidth) <= 500) {
                this.calcPagesWidth('medium', this.totalVisible);
            } else {
                this.calcPagesWidth('full', this.totalVisible);
            }
        }
    },
    watch: {
        containerWidth: function (val) {
            if (this.paginationMode == 'auto') {
                if (val > 580) {
                    this.calcPagesWidth('full', this.totalVisible);
                    this.totalVisibleView = this.totalVisible;
                } else if (val <= 580 && val > 445) {
                    this.calcPagesWidth('medium', this.totalVisible);
                    this.totalVisibleView = this.totalVisible;
                } else if (val <= 445 && val > 380) {
                    this.calcPagesWidth('short', 3);
                    this.totalVisibleView = 3;
                } else if (val <= 380 && val > 240) {
                    this.calcPagesWidth('short', 0);
                    this.totalVisibleView = 0;
                } else {
                    this.calcPagesWidth('mini', 0);
                    this.totalVisibleView = 0;
                }
            }
        },

        pageActive: {
            handler(page) {
                if (page == 1 && this.indexPagination) {
                    this.page = 1;
                }
            }
        }
    },
    data: () => {
        return {
            pageWidth: '377px',
            page: null,
            size: 50,

            pageMode: 'full',
            totalVisibleView: 7
        };
    },
    beforeMount() {
        this.page = 1;
        this.size = this.pageSizeOptions[0];
    },
    methods: {
        calcPagesWidth(paginaMode, totalVisible) {
            this.pageMode = paginaMode;
            if (paginaMode == 'mini' && totalVisible <= 0) {
                this.pageWidth = '60px';
            } else if (paginaMode == 'short' && totalVisible <= 3) {
                this.pageWidth = '100px';
            } else if (paginaMode == 'short') {
                this.pageWidth = '210px';
            } else if (paginaMode == 'medium') {
                this.pageWidth = 36 * this.totalVisible + 120 + 'px';
            } else {
                this.pageWidth = 36 * this.totalVisible + 220 + 'px';
            }
        },
        emitChangeInfo() {
            if (this.debounce) {
                clearTimeout(this.debounce);
            }
            this.debounce = setTimeout(
                (self) => {
                    if (self.indexPagination) {
                        self.$emit('on-change-page', {
                            page: self.page,
                            index: self.indexPagination
                        });
                    } else {
                        self.$emit('on-change-page', {
                            page: self.page,
                            pageSize: self.size
                        });
                    }
                },
                20,
                this
            );
        },
        changePageSize() {
            this.$emit('on-change-page-size', {
                page: this.page,
                pageSize: this.size
            });
        }
    }
};
</script>

<style scoped>
.s-select-page-size {
    font-size: 12px !important;
}
.s-select-page-size ::v-deep .v-input__control {
    min-height: unset !important;
    width: 65px;
    height: 25px;
}
.s-select-page-size ::v-deep .v-input__slot {
    padding: 0 6px !important;
    background: rgb(0 0 0 / 0.05) !important;
}
.s-select-page-size ::v-deep .v-input__slot .mdi-menu-down {
    color: rgb(0 0 0 / 0.6) !important;
}
.s-pagination {
    margin-left: 8px;
    justify-content: start !important;
}
.s-pagination ::v-deep li > button,
.s-pagination ::v-deep li > .v-pagination__more {
    margin: 0 2px !important;
    font-size: 12px;
    box-shadow: none !important;
    margin-right: 6px;
    background: white !important;
    transition: all ease-in-out 250ms;
    color: rgb(0 0 0 / 0.6) !important;
    height: 25px;
    min-width: 25px;
    padding: 0 !important;
}
.s-pagination ::v-deep li > .v-pagination__navigation .mdi {
    font-size: 20px;
}
.s-pagination ::v-deep li > .v-select__slot {
    height: 25px;
}
.s-pagination ::v-deep li > .v-pagination__more {
    margin: 0 2px !important;
    font-size: 12px !important;
    box-shadow: none !important;
    margin-right: 6px;
    background: white !important;
    transition: all ease-in-out 250ms;
    color: rgb(0 0 0 / 0.6) !important;
    height: 25px;
    width: 25px;
    min-width: unset !important;
    padding: 0 !important;
}
.s-pagination ::v-deep li > button:hover {
    background: rgb(0 0 0 / 0.1) !important;
}
.s-pagination ::v-deep li > button:focus {
    outline: none !important;
}
.s-pagination ::v-deep li > .v-pagination__item--active {
    background: rgb(0 0 0 / 0.05) !important;
}

.s-pagination ::v-deep ul.v-pagination {
    justify-content: start !important;
}
.s-pagination-mini {
    font-size: 11px !important;
}
.s-pagination-mini >>> .v-input__control {
    font-size: 11px !important;
}
.s-pagination-mini >>> .v-input__control .v-select__selection {
    font-size: 11px !important;
}
.s-pagination-mini >>> .v-select__slot {
    height: 20px !important;
}
.s-pagination-mini >>> .v-input__slot {
    /* width: 66px !important; */
}
.s-pagination-mini >>> ul {
    height: 20px !important;
}
.s-pagination-mini >>> li {
    width: 20px;
    margin-left: 2px;
    margin-right: 2px;
}
.s-pagination-mini >>> li button {
    min-width: 20px !important;
}
.s-pagination-mini >>> .v-pagination__navigation,
.s-pagination-mini >>> .v-pagination__more,
.s-pagination-mini >>> .v-pagination__item {
    height: 20px !important;
    font-size: 10px !important;
    width: 20px !important;
}
.s-pagination-mini >>> .v-icon {
    font-size: 15px !important;
}
.s-pagination-normal {
    font-size: 13px !important;
}
.items-range {
    position: absolute;
    right: 4px;
    top: 0px;
}
</style>
<style>
.short-mode .s-select-page-size .v-input__append-inner {
    display: none;
}
</style>
