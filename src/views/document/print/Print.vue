<template>
    <detail-view
        :isPrint="true"
        :formId="formPrintId"
        :documentObjectId="docObjectId"
    />
</template>

<script>
import Detail from './../detail/Detail';
export default {
    props: {
        docObjectId: {
            default: 0,
        },
        formId: {
            default: 0,
        },
    },
    components: {
        'detail-view': Detail,
    },
    data() {
        return {
            formPrintId: this.formId,
        };
    },
    watch: {
        formId(after) {
            this.formPrintId = after;
        },
    },
    created() {
        if (this.$getRouteName() == 'printDocument') {
            this.formPrintId = this.$route.params.formId;
        }
    },
};
</script>
