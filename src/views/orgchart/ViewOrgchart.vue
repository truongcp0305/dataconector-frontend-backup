<template>
    <div class="w-100 h-100">
        <OrgchartTableView
            :allDepartments="allDepartments"
            :allPositions="allPositions"
            :idOrgchart="idOrgchart"
            :allUsers="allUsers"
        >
        </OrgchartTableView>
    </div>
</template>

<script>
import OrgchartEditor from '@/components/orgchart/editor/OrgchartEditor.vue';
import OrgchartTableView from '@/components/orgchart/view/OrgchartTableView.vue';
import { orgchartApi } from '../../api/orgchart';
export default {
    components: {
        OrgchartEditor,
        OrgchartTableView,
    },
    created() {
        this.getOrgchartDetail();
    },
    methods: {
        async getOrgchartDetail() {
            let res = await orgchartApi.getOrgchartDetail(this.idOrgchart);
            let listUser = [];
            res.data.userInPostion.forEach(function (e) {
                if (listUser.includes(e.userId) == false) {
                    listUser.push(e.userId);
                }
            });
            // this.$store.commit('orgchart/setAllUserInOrgchart',{
            //     orgchartId: res.data.orgchart.id,
            //     listUsers: listUser
            // })
            this.$store.commit('orgchart/setDataOrgchartSideBySide', {
                orgchartId: res.data.orgchart.id,
                object: res.data,
            });
            this.allDepartments = res.data.departments;
            this.allPositions = res.data.positions;
            this.allUsers = res.data.userInPostion;
        },
    },
    data() {
        return {
            allDepartments: null,
            allPositions: null,
            allUsers: null,
            idOrgchart: this.$route.params.id,
        };
    },
};
</script>

<style></style>
