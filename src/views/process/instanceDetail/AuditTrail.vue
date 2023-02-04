<template>
    <div class="h-100 w-100 pl-4">
        <TimelineTreeview>
            <template slot="tree-item-content" slot-scope="{ itemData }">
                <i :class="'mdi mr-2 ' + itemData.icon"></i>
                <span>{{ itemData.name }}</span>
            </template>
        </TimelineTreeview>
    </div>
</template>

<script>
import TimelineTreeview from './../../../components/common/TimelineTreeview';
import VueResizable from 'vue-resizable';
import TrackingProcessInstance from './../../../views/process/TrackingProcessInstance';
export default {
    data() {
        return {};
    },
    computed: {},
    props: {
        instanceId: {
            type: String,
            default: '',
        },
    },
    watch: {
        instanceId() {},
    },
    components: {
        TimelineTreeview,
        'vue-resizable': VueResizable,
        TrackingProcessInstance: TrackingProcessInstance,
    },
};
</script>

<style></style>
