<template>
    <div class="w-100 h-100">
        <OrgchartEditor
            @save-orgchart-data="saveOrgchart"
            :action="action"
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
    data() {
        return {
            action: 'clone',
        };
    },
    methods: {
        async saveOrgchart(orgchartData) {
            try {
                let res = null;
                if (this.action == 'clone') {
                    res = await orgchartApi.createOrgchart(orgchartData);
                    if (res.status == 200) {
                        this.$snotifySuccess(this.$t('v2.orgchart.createOrgchartSuccessfully'));
                        this.action = 'edit';
                        this.orgchartId = res.data.id;
                        this.$router.push('/orgchart')
                    } else {
                        this.$snotifyError(
                            res,
                            this.$t('v2.orgchart.canNotCreateOrgchart'),
                            res.message,
                        );
                    }
                } else if (this.action == 'edit') {
                    res = await orgchartApi.updateOrgchart(
                        this.orgchartId,
                        orgchartData,
                    );
                    if (res.status == 200) {
                        this.$snotifySuccess(this.$t('v2.orgchart.updateOrgchartSuccessfully'));
                        this.$router.push('/orgchart')
                    } else {
                        this.$snotifyError(
                            res,
                           this.$t('v2.orgchart.cantUpdateOrgchart'),
                            res.message,
                        );
                    }
                }
            } catch (error) {
                this.$snotifyError(error, this.$t('v2.orgchart.cantSaveOrgchartData'));
            }
        },
    },
};
</script>

<style></style>
