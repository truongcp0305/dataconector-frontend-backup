<template>
    <div class="w-100 h-100">
        <OrgchartEditor
            @save-orgchart-data="saveOrgchart"
            :action="'structureManagement'"
            :id="$route.params.id"
        >
        </OrgchartEditor>
    </div>
</template>

<script>
import OrgchartEditor from '@/components/orgchart/editor/OrgchartEditor.vue';
import { orgchartApi } from '../../api/orgchart';

export default {
    components: {
        OrgchartEditor,
    },
    methods: {
        async saveOrgchart(orgchartData) {
            let res = await orgchartApi.updateOrgchart(
                this.$route.params.id,
                orgchartData,
            );
            if (res.status == 200) {
                this.$snotifySuccess(this.$t('v2.orgchart.updateOrgchartSuccessfully'));
                this.$router.push('/orgchart')
            } else {
                this.$snotifyError(
                    error,
                    this.$t('v2.orgchart.cantUpdateOrgchart'),
                    res.message,
                );
            }
        },
    },
};
</script>

<style></style>
