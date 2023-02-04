<template>
    <div class="w-100 h-100">
        <process-editor :action="'edit'"> </process-editor>
    </div>
</template>

<script>
import ProcessEditor from './../../components/process/ProcessEditor';
export default {
    components: {
        'process-editor': ProcessEditor,
    },
};
</script>

<style></style>
