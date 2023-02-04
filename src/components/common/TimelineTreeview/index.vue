<template>
    <div class="symper-timeline-tree-view">
        <!-- <div class="milestone-datetimes">
            <div
                v-for="(times, date) in listMilestoneTime"
                :key="date"
                class="milestone-datetime-item"
            >
                <div
                    class="milestone-date"
                    :style="{
                        'line-height': minItemHeight+'px',
                }"
                >{{date}}</div>
                <div class="milestone-times">
                    <div
                        v-for="(time, idx) in times"
                        :key="idx"
                        class="milestone-time-item"
                        :style="{
                        'min-height': minItemHeight+'px',
                        'line-height': minItemHeight+'px',
                    }"
                    >{{time}}</div>
                </div>
            </div>
        </div> -->
        <div class="tree-view w-100">
            <TimelineTreeviewItem
                :item="treeData"
                :itemIndent="itemIndent"
                :minItemHeight="minItemHeight"
            >
                <template slot="item-content" slot-scope="{ itemData }">
                    <slot name="tree-item-content" :itemData="itemData"></slot>
                </template>
            </TimelineTreeviewItem>
        </div>
    </div>
</template>

<script>
import TimelineTreeviewItem from './TimelineTreeviewItem';
export default {
    name: 'TimelineTreeview',
    components: {
        TimelineTreeviewItem
    },
    data() {
        return {};
    },
    methods: {
        getFlatMilestone(result, tree) {
            let datetime = tree[this.milestoneTimeKey];

            let splitTime = datetime ? datetime.split(' ') : ['', ''];
            if (!result[splitTime[0]]) {
                result[splitTime[0]] = [];
            }
            result[splitTime[0]].push(splitTime[1]);
            if (tree.children) {
                for (let child of tree.children) {
                    this.getFlatMilestone(result, child);
                }
            }
        }
    },
    computed: {
        listMilestoneTime() {
            let rsl = {};
            this.getFlatMilestone(rsl, this.treeData);
            return rsl;
        }
    },
    props: {
        itemIndent: {
            type: Number,
            default: 15
        },
        minItemHeight: {
            type: Number,
            default: 30
        },
        milestoneTimeKey: {
            type: String,
            default: 'time'
        },
        treeData: {
            type: Object,
            default() {
                return {
                    name: 'My Tree',
                    time: '2020-05-10 09:08:07',
                    icon: 'mdi-record',
                    children: [
                        {
                            icon: 'mdi-account',
                            name: 'hello',
                            time: '2020-05-10 09:10:07'
                        },
                        {
                            icon: 'mdi-email',
                            name: 'wat',
                            time: '2020-05-10 09:11:07'
                        },
                        {
                            icon: 'mdi-record',
                            name: 'child folder',
                            time: '2020-05-11 08:11:07',
                            children: [
                                {
                                    icon: 'mdi-email',
                                    name: 'child folder',
                                    time: '2020-05-11 09:11:07',
                                    children: [
                                        {
                                            icon: 'mdi-account',
                                            time: '2020-05-13 09:12:07',
                                            name: 'hello'
                                        },
                                        {
                                            icon: 'mdi-cog',
                                            time: '2020-05-13 09:12:07',
                                            name: 'wat'
                                        }
                                    ]
                                },
                                {
                                    icon: 'mdi-email',
                                    name: 'hello',
                                    time: '2020-05-12 09:12:07'
                                },
                                {
                                    icon: 'mdi-account',
                                    name: 'wat',
                                    time: '2020-05-13 09:12:07'
                                },
                                {
                                    icon: 'mdi-cog',
                                    name: 'child folder',
                                    time: '2020-05-13 10:12:07',
                                    children: [
                                        {
                                            icon: 'mdi-server',
                                            time: '2020-05-13 09:12:07',
                                            name: 'hello'
                                        },
                                        {
                                            icon: 'mdi-server',
                                            time: '2020-05-13 09:12:07',
                                            name: 'wat'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            }
        }
    }
};
</script>

<style>
.symper-timeline-tree-view
    > .tree-view
    > .time-line-treeview-item
    > .milestone-marker {
    display: none;
}
.symper-timeline-tree-view > .tree-view > .time-line-treeview-item {
    border-left: none !important;
    padding-left: 0px !important;
}

.symper-timeline-tree-view,
.milestone-datetime-item {
    display: flex;
}
.milestone-date {
    font-weight: 500;
}

.milestone-date,
.milestone-datetimes {
    margin-right: 15px;
    font-size: 13px;
    color: #909090;
}
</style>
