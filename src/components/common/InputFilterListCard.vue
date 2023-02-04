<template>
    <v-card
        :style="positionBox"
        v-show="isShowPopup"
        class="input-filter-card-detail pa-2"
    >
        <div>
            <v-text-field
                prepend-inner-icon="mdi-magnify"
                outlined
                dense
                :placeholder="$t('v2.doc.search')"
                height="22"
                class="search-input-card"
                @keyup="handleKeyupSearch"
                v-model="search"
                hide-details
            ></v-text-field>
        </div>
        <div class="d-flex justify-space-between mt-2">
            <div class="color-grey pl-1 mb-1"> {{ $t('v2.doc.sum') +': '+ list.length }}</div>
            <div>
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-btn x-small icon v-on="on">
                            <v-icon
                                x-small
                                @click="deleteAll"
                                class="mdi mdi-close"
                            ></v-icon>
                        </v-btn>
                    </template>
                    {{$t('v2.doc.deleteAll')}}
                </v-tooltip>
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-btn x-small icon v-on="on">
                            <v-icon
                                x-small
                                @click="copyAll"
                                class="mdi mdi-content-copy"
                            ></v-icon>
                        </v-btn>
                    </template>
                    {{$t('v2.doc.copyAll')}}
                </v-tooltip>
            </div>
        </div>
        <!-- <v-menu  -->
        <div v-for="(item, index) in list" :key="index" :offset-x="true">
            <div
                :style="{
                    background: currenFocusIdx == index ? 'lightgrey' : '',
                }"
                class="pl-1 d-flex justify-space-between my-1 card"
                @mouseleave="hideIcon()"
                @click="changeBackgroundColor(index)"
                @mousemove="showIcon(index)"
            >
                <div v-on="on" @click="changeBackgroundColor(index)">
                    {{ item[controlName] }}
                </div>
                <div
                    class="action"
                    :style="{
                        visibility: currenIdx == index ? 'visible' : 'hidden',
                    }"
                >
                    <v-btn
                        x-small
                        style="margin-top: -2px"
                        icon
                        @click="deleteCard(index)"
                    >
                        <v-icon x-small icon class="mdi mdi-close"></v-icon>
                    </v-btn>
                    <v-btn
                        x-small
                        style="margin-top: -2px"
                        icon
                        @click="$copyTextToClipboard(item[controlName])"
                    >
                        <v-icon
                            x-small
                            icon
                            class="mdi mdi-content-copy"
                        ></v-icon>
                    </v-btn>
                </div>
            </div>
            <!--
                   <div class="px-4 mt-2 card-detail-sub-menu">
                        <v-row v-for="(sub, subIdx) in item" :key="subIdx" class="sub-menu-column">
                            <v-col class="col-md-3 " >
                                <span class="fs-11 fw-430">
                                    {{getTitle(subIdx)?getTitle(subIdx):subIdx}}
                                </span>
                            </v-col>
                            <v-col class="sub-menu-description">
                                {{sub}}
                            </v-col>
                        </v-row>
                    </div>
              -->
        </div>
    </v-card>
</template>
<script>
export default {
    created() {
        if (this.listCards.listSelected) {
            this.list = this.listCards.listSelected;
        }
    },
    watch: {
        listCards: {
            deep: true,
            immediate: true,
            handler() {
                if (this.listCards.listSelected) {
                    this.list = this.listCards.listSelected;
                }
            },
        },
    },
    props: {
        keyInstance: {
            type: Number,
            default: 0,
        },
        listCards: {
            // thông tin card
            type: Object,
            default() {
                return {};
            },
        },
        listTitle: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    computed: {
        controlName() {
            return this.listCards.controlName;
        },
    },
    data() {
        return {
            list: [],
            positionBox: { top: 0, left: 0 },
            isShowPopup: false,
            search: '',
            currenIdx: -1,
            currenFocusIdx: -1,
        };
    },
    methods: {
        getTitle(name) {
            if (this.listTitle && JSON.stringify(this.listTitle) != '{}') {
                return this.listTitle[name];
            } else {
                return false;
            }
        },

        deleteCard(cardIdx) {
            this.list.splice(cardIdx, 1);
            this.$emit('delete-card-item', {
                value: this.list,
                controlName: this.controlName,
            });
        },
        deleteAll() {
            this.list = [];
            this.$emit('delete-all-card-item', {
                value: this.list,
                controlName: this.controlName,
            });
        },
        copyAll() {
            let data = [];
            let alldata = [];
            this.list.map((l) => {
                alldata.push(l[this.controlName]);
            });
            data.push(alldata);
            const csv = data.map((row) => row.join('\t')).join('\n');
            const temp = document.createElement('textarea');
            temp.value = csv;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
        },
        hideIcon() {
            this.currenIdx = -1;
        },
        showIcon(idx) {
            this.currenIdx = idx;
        },
        changeBackgroundColor(idx) {
            this.currenFocusIdx = idx;
        },
        handleKeyupSearch() {
            let newVal = [];
            if (this.search == '') {
                this.list = this.listCards.listSelected;
            } else {
                this.list.map((l) => {
                    if (
                        l[this.controlName]
                            .toLowerCase()
                            .includes(this.search.toLowerCase())
                    ) {
                        newVal.push(l);
                    }
                });
                this.$set(this, 'list', newVal);
                this.list = newVal;
            }
        },
        show(e) {
            this.isShowPopup = true;
            let inputOffset = e.getOffSet;
            let positionBox = {};
            let submitFormOffset = $(
                '#sym-submit-' + this.keyInstance,
            ).offset();
            let submitFormWidth = $('#sym-submit-' + this.keyInstance).width();
            let leftDiff = inputOffset.left - submitFormOffset.left;
            let cardContext = $('.input-filter-card-detail');
            let cardWidth = cardContext.width();
            let cardHeight = cardContext.height();
            let inputWidth = 138;
            if (cardWidth + leftDiff > submitFormWidth) {
                positionBox = {
                    top: inputOffset.top - submitFormOffset.top + 26 + 'px',
                    left:
                        Math.abs(leftDiff + inputWidth - cardWidth + 10) + 'px',
                };
            } else {
                positionBox = {
                    top: inputOffset.top - submitFormOffset.top + 26 + 'px',
                    left: Math.abs(leftDiff) + 'px',
                };
            }
            if (window.innerHeight < inputOffset.top + cardHeight + 40) {
                positionBox.top =
                    Math.abs(
                        inputOffset.top - submitFormOffset.top - cardHeight,
                    ) + 'px';
            }
            this.positionBox = positionBox;
        },
        hide() {
            if (this.isShowPopup) {
                this.isShowPopup = false;
            }
        },
    },
};
</script>
<style scoped>
.v-menu__content {
    min-height: 40px !important;
    overflow-y: hidden;
}
.card {
    height: 22px;
    padding-top: 3px;
}
.sub-menu-column {
    margin-top: -10px;
    margin-bottom: -10px;
}
.sub-menu-description {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.card-detail-sub-menu {
    background-color: white;
    max-height: 500px;
    height: auto;
    width: auto;
}
.card:hover {
    background: #f2f2f2;
}
.time-item {
    font-size: 13px;
    font-weight: 500;
    height: 25px;
    line-height: 25px;
    text-align: center;
    cursor: pointer;
    transition: background ease-in-out 150ms;
}
.time-item:hover {
    background: #f2f2f2;
}
.input-filter-card-detail {
    height: auto;
    max-height: 300px;
    overflow: auto;
    position: absolute;
    width: auto;
    z-index: 99999;
}
.active-item {
    background: #dadada !important;
}
.search-input-card >>> .v-input__slot {
    min-height: unset !important;
    margin-right: 8px !important;
    padding-left: 8px !important;
}
.search-input-card >>> input {
    font-size: 13px;
}
.search-input-card >>> .v-input__prepend-inner {
    margin-top: 25px;
    width: 10px;
    margin-left: -5px;
}
.search-input-card >>> .v-input__icon {
    height: 7px !important;
    justify-content: unset !important;
}
.search-input-card >>> .mdi {
    font-size: 15px !important;
}
.search-input-card >>> input {
    border-bottom: none !important;
    font-size: 11px !important;
    color: grey;
}
.search-input-card >>> .v-label {
    font-size: 13px;
    top: 6px !important;
}
.search-input-card >>> fieldset {
    border-color: #c1c1c1 !important;
}
.search-input-card >>> .v-text-field__slot {
    margin-left: 10px !important;
}
</style>
