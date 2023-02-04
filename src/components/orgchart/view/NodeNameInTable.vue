<template>
    <span
        margin-left:-2px
        style="margin-top: -4px"
        :class="{
            'title-department-active': true
        }"
    >
        <i :class="'mdi mr-2 fs-12 ' + icon"></i>
        <span style="padding-right: 8px; margin-top: -4px; font: 12px roboto">{{
            text
        }}</span>
        <span
            v-if="count != 0"
            style="padding-right: 8px; margin-top: -6px; font: 12px roboto"
            >{{ '(' + count + ')' }}</span
        >
    </span>
</template>
<script>
import Detail from '@/views/document/detail/Detail.vue';

let mapNodeTypeIcon = {
    position: 'mdi-briefcase-outline',
    department: 'mdi-office-building-outline'
    // none: 'mdi-book-multiple-outline'
};
export default {
    components: {
        Detail
    },
    data() {
        return {
            icon: null,
            text: '',
            count: 0,
            parentId: null,
            permission: true,
            listVizidValid: [],
            listParentVizId: []
        };
    },
    beforeMount() {},
    mounted() {
        this.params.data.orgchartId = this.$route.params.id;
        let type = this.params.data ? this.params.data.nodeType : 'none';
        this.text = this.getValue();
        this.$store.dispatch('orgchart/getUserByVizId', this.params.data);
        let listUser = this.$store.getters['orgchart/listUserInCurrentNode'];
        this.count = listUser.length;
        // this.permission = this.checkPermission();
        this.icon = mapNodeTypeIcon[type];
    },
    methods: {
        getIcon() {
            return this.params.data.icon;
        },
        getValue() {
            let vls = this.params.value;
            if (typeof vls == 'string') {
                return vls;
            } else {
                return vls[vls.length - 1];
            }
        },
        checkPermission() {
            let self = this;
            if (this.$store.state.app.baInfo.email != '') {
                // day la tai khoan BA
                return true;
            } else {
                // day la tai khoan End user
                let idCurrentUser = this.$store.state.app.endUserInfo.id;
                let viewOnlySub = this.$store.state.orgchart.viewOnlySub;
                let listVizParentId =
                    this.$store.state.orgchart.listVizParentId;
                let self = this;
                let data = this.params.data;
                if (this.$store.state.app.userOperations.department) {
                    let permission =
                        this.$store.state.app.userOperations.department;
                    if (permission[0].view_all) {
                        return true;
                    }
                    if (permission[0].view_only_owner) {
                        if (data.users.includes(idCurrentUser)) {
                            return true;
                        }
                    }
                    if (permission[0].view_only_sub) {
                        if (data.users.includes(idCurrentUser)) {
                            this.$store.commit(
                                'orgchart/updateListVizParentId',
                                data.vizId
                            );
                            return true;
                        }
                        if (listVizParentId.length > 0) {
                            data.data.forEach(function (e) {
                                if (listVizParentId.includes(e.vizParentId)) {
                                    self.$store.commit(
                                        'orgchart/updateListVizParentId',
                                        e.vizId
                                    );
                                    self.listVizidValid.push(e.vizId);
                                }
                            });
                            if (self.listVizidValid.includes(data.vizId)) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                    if (Object.keys(permission).length > 1) {
                        for (let i in permission) {
                            if (i != '0') {
                                self.listVizidValid.push(i);
                            }
                        }
                        if (
                            self.listVizidValid.includes(
                                'orgchart:' + data.orgchartId + ':' + data.vizId
                            )
                        ) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                } else {
                    return false;
                }
            }
        }
    }
};
</script>
<style scoped>
.item-no-permission {
    color: #c1c1c1 !important;
}
.title-department-active {
    color: #212529 !important;
}
</style>
