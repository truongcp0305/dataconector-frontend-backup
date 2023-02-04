<template>
    <div class="w-100 h-100">
        <div
            class="position-absolute pa-2 amber darken-3 white--text text-center"
            style="
                width: fit-content;
                width: fit-content;
                left: 374px;
                height: 40px;
                line-height: 27px;
                font-size: 13px;
            "
        >
            {{$t('v2.dataflow.youInTestModeWithClickhouse')}}
        </div>
        <DataflowEditor
            :action="'edit'"
            :idObject="$route.params.id"
            :experimentalMode="'clickhouse'"
        />
    </div>
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
