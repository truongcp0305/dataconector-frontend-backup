<template>
    <div class="list-comment" :style="{ height: heightListComment + 'px' }">
        <VuePerfectScrollbar :style="{ height: heightListComment - 50 + 'px' }">
            <div
                :v-if="listItemFilter.length > 0"
                v-for="(item, index) in listItemFilter"
                :key="index"
                class="comment-item"
            >
                <CommentItem
                    :activeTab="activeTab"
                    :item="item"
                    :instanceKey="instanceKey"
                    :itemIndex="index"
                />
            </div>
        </VuePerfectScrollbar>
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import InputComment from './InputComment.vue';
import CommentItem from './CommentItem.vue';
export default {
    name: 'ListComment',
    props: {
        listComment: {
            type: Object,
        },
        searchItem: {
            type: String,
            default: '',
        },
        heightListComment: {
            type: Number,
        },
        heightComment: {
            type: [Number, String],
        },
        instanceKey: {
            type: [Number, String],
        },
        activeTab: {
            type: Number,
        },
    },
    components: {
        VuePerfectScrollbar,
        InputComment,
        CommentItem,
    },
    data() {
        return {
            resItem: [],
        };
    },
    computed: {
        listItemFilter() {
            if (this.searchItem == '') {
                return this.listComment;
            } else {
                this.filterItem();
                return this.resItem;
            }
        },
    },
    methods: {
        filterItem() {
            let self = this;
            self.resItem = [];
            if (this.listComment.length > 0) {
                this.listComment.filter(function (item) {
                    if (
                        item.content
                            .toLowerCase()
                            .includes(self.searchItem.toLowerCase())
                    ) {
                        self.resItem.push(item);
                    }
                    if (item.childrens.length > 0) {
                        item.childrens.filter(function (itemChild) {
                            if (
                                itemChild.content
                                    .toLowerCase()
                                    .includes(self.searchItem.toLowerCase())
                            ) {
                                if (self.resItem.includes(item) == false) {
                                    self.resItem.push(item);
                                }
                            }
                        });
                    }
                });
            }
        },
    },
};
</script>

<style scoped>
.list-comment >>> .ps__rail-x {
    display: none;
}
</style>
