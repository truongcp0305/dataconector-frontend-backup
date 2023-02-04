<template>
    <div>
        <div class="fs-15 font-weight-bold">{{$t('v2.acessControl.manipulatingObjects')}}</div>
        <div class="fs-13">
            <v-list v-for="(permission, i) in permissions" :key="i">
                <v-list-item>
                    <v-checkbox
                        :value="permission.value"
                        :key="permission.title"
                        @change="handleChange"
                        :label="permission.title"
                        v-model="selectedPermission"
                    >
                    </v-checkbox>
                </v-list-item>
            </v-list>
        </div>
        <OrgchartElementSelector
            v-if="showTreeOrgchart"
            :value="departmentSelected"
            :checkboxMode="checkboxMode"
            @change-node-selected="handleChangeNodeSelected"
        />
    </div>
</template>

<script>
import OrgchartElementSelector from '@/components/common/OrgchartElementSelector.vue';
export default {
    components: {
        OrgchartElementSelector,
    },
    data() {
        return {
            selectedPermission: [],
            checkboxMode: ['department', 'position'],
            showTreeOrgchart: false,
            permissions: [
                {
                    title: this.$t('permissions.actionPack.orgchart.viewAll'),
                    value: 'view_all',
                },
                {
                    title: this.$t(
                        'permissions.actionPack.orgchart.viewItself',
                    ),
                    value: 'view_only_owner',
                },
                {
                    title: this.$t(
                        'permissions.actionPack.orgchart.viewItselfAndChild',
                    ),
                    value: 'view_only_sub',
                },
                {
                    title: this.$t('permissions.actionPack.orgchart.viewOther'),
                    value: 'view_other',
                },
            ],
        };
    },
    props: {
        checkboxes: {
            type: Array,
        },
        departmentSelected: {
            type: Array,
        },
    },
    methods: {
        handleChangeNodeSelected(data) {
            let departmentId =
                'department:orgchart:' + data.orgchartId + ':' + data.vizId;
            this.$emit('department-selected', departmentId);
        },
        handleChange() {
            this.$emit('permission-selected', this.selectedPermission);
        },
    },
    watch: {
        checkboxes: {
            deep: true,
            immediate: true,
            handler(arr) {
                this.selectedPermission = arr;
                if (arr.includes('view_other')) {
                    this.showTreeOrgchart = true;
                } else {
                    this.showTreeOrgchart = false;
                }
            },
        },
    },
};
</script>

<style scoped>
.v-list {
    padding: unset;
}
.v-list-item {
    min-height: unset;
    height: 40px;
}
.v-input__slot label {
    font: 13px roboto !important;
}
</style>
