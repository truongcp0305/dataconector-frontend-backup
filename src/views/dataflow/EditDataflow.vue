<template>
    <DataflowEditor :action="'edit'" :idObject="$route.params.id" />
</template>

<script>
import DataflowEditor from '@/components/dataflow/DataflowEditor.vue';
export default {
    components: {
        DataflowEditor,
    },
    data() {
        return {};
    },
};
</script>

<style></style>
