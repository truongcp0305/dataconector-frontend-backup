<template>
    <div class="s-floatting-popup elevation-6" :style="style" v-show="isShow">
        <v-tabs
            height="40"
            class="pt-2 pl-1 px-1"
            v-model="currentTab"
            background-color="transparent"
            grow
        >
            <v-tab v-for="item in tabs" :key="item.name">
                {{ item.text }}
            </v-tab>
        </v-tabs>
        <div style="height: calc(100% - 40px)">
            <v-tabs-items v-model="currentTab" class="h-100">
                <v-tab-item
                    v-for="item in tabs"
                    :key="item.name"
                    class="h-100 p-2"
                >
                    <component
                        class="h-100"
                        :focusingControlName="focusingControlName"
                        :ref="'comp_' + item.name"
                        :is="item.component"
                        :instance="instance"
                        :rowIndex="rowIndex"
                    />
                </v-tab-item>
            </v-tabs-items>
        </div>
    </div>
</template>
<script>
import HistoryControl from './../detail/HistoryControl';
import LinkControl from './LinkControl';
import { calculatorPositionBox } from '@/views/document/common/common.js';
export default {
    components: {
        HistoryControl,
        LinkControl,
    },
    props: {
        instance: {
            default: 0,
        },
        focusingControlName: {
            type: String,
            default: '',
        },
    },
    watch: {
        currentTab(vl) {
            setTimeout(
                (self) => {
                    switch (vl) {
                        case 0:
                            self.showLinkControl();
                            break;

                        case 1:
                            self.showTrackChangeComp();
                            break;

                        case 2:
                            break;

                        default:
                            break;
                    }
                },
                10,
                this,
            );
        },
    },
    data() {
        return {
            date: null,
            isShow: false,
            style: {},
            currentTab: 0,
            rowIndex: null,
            tabs: [],
        };
    },
    computed: {
        viewType() {
            return this.$store.state.document.viewType[this.instance];
        },
    },
    beforeMount() {
        this.style.top = '26px';
        this.style.left = '0px';
    },
    mounted() {
        if (this.viewType == 'detail') {
            this.tabs = [
                {
                    text: this.$t('v2.doc.link'),
                    name: 'link',
                    component: LinkControl,
                },
                {
                    text: this.$t('v2.doc.editHistory'),
                    name: 'trackChange',
                    component: HistoryControl,
                },
            ];
            this.style.width = '600px';
            this.style.height = '300px';
        } else {
            this.tabs = [
                {
                    text: this.$t('v2.doc.link'),
                    name: 'link',
                    component: LinkControl,
                },
            ];
            this.style.width = '150px';
            this.style.height = 'auto';
        }
    },
    methods: {
        showLinkControl() {
            if (this.$refs.comp_link && this.focusingControlName != '') {
                this.$refs.comp_link[0].show(
                    this.focusingControlName,
                    this.rowIndex,
                );
            }
        },
        showTrackChangeComp() {
            if (this.$refs.comp_trackChange) {
                this.$refs.comp_trackChange[0].show();
            }
        },
        hide() {
            this.isShow = false;
        },
        /**
         * context: ngữ cảnh sử dụng (detail, submit)
         * rowId : nếu là trong table thì có biến này
         */
        show(e, context, rowIndex = null, isShowLink = false) {
            this.rowIndex = rowIndex;
            this.isShow = true;
            if (this.viewType == 'detail') {
                this.currentTab = 1;
                this.showTrackChangeComp();
            } else if (isShowLink) {
                this.currentTab = 0;
                this.showLinkControl();
            }
            e.curTarget = e.target;
            let position = calculatorPositionBox(e, context);
            position.width = this.style.width;
            position.height = this.style.height;
            this.style = position;
        },
    },
};
</script>
<style scoped>
.s-floatting-popup {
    height: 250px;
    max-height: 500px;
    background: white;
    position: absolute;
    z-index: 200;
    width: 700px;
}
.s-floatting-popup .v-tab {
    font-size: 13px;
}
.s-floatting-popup >>> .v-tabs-bar {
    height: 30px !important;
}
</style>
