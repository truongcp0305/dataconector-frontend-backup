<template>
    <div class="mt-1">
        <div class="fs-15 font-weight-bold">
            {{ $t('v2.acessControl.manipulatingObjects') }}
        </div>
        <div
            class="
                fs-13
                d-flex
                flex-wrap
                permission-selector
                justify-space-between
            "
        >
            <v-list v-for="(permission, i) in permissions" :key="i">
                <v-list-item>
                    <v-checkbox
                        :value="permission.value"
                        :key="permission.title"
                        @change="handleChange"
                        :label="permission.title"
                        v-model="selectedPermission"
                        :disabled="action == 'view' ? true : false"
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
            :action="action"
        />
    </div>
</template>

<script>
import OrgchartElementSelector from '@/components/common/OrgchartElementSelector.vue';
export default {
    components: {
        OrgchartElementSelector
    },
    data() {
        return {
            selectedPermission: [],
            checkboxMode: ['department'],
            showTreeOrgchart: false,
            permissions: [
                {
                    title: this.$t(
                        'permissions.actionPack.orgchart.viewItself'
                    ),
                    value: 'view_only_owner'
                },
                {
                    title: this.$t(
                        'permissions.actionPack.orgchart.viewItselfAndChild'
                    ),
                    value: 'view_only_sub'
                },
                {
                    title: this.$t('permissions.actionPack.orgchart.viewOther'),
                    value: 'view_other'
                }
            ]
        };
    },
    props: {
        checkboxSelected: {
            type: Array
        },
        departmentSelected: {
            type: Array
        },
        action: {
            type: String,
            default: 'create'
        }
    },
    methods: {
        handleChangeNodeSelected(dpm) {
            let departmentId =
                'department:orgchart:' + dpm.orgchartId + ':' + dpm.vizId;
            let data = {
                value: this.departmentSelected.includes(departmentId)
                    ? false
                    : true,
                id: 'orgchart:' + dpm.orgchartId + ':' + dpm.vizId,
                objectType: 'department',
                action: 'view'
            };
            this.$store.commit('actionPack/changeOperation', data);
            if (!data.value) {
                this.departmentSelected.splice(
                    this.departmentSelected.indexOf(departmentId),
                    1
                );
            } else {
                this.departmentSelected.push(departmentId);
            }
        },
        handleChange(e) {
            this.showTreeOrgchart = e.includes('view_other') ? true : false;
            let data = {
                id: '0',
                objectType: 'department',
                action: this.selectedPermission
            };
            this.$store.commit('actionPack/changeOperation', data);
        }
    },
    created() {
        if (this.departmentSelected.length > 0) {
            this.checkboxSelected.push('view_other');
            this.showTreeOrgchart = true;
        }
        this.selectedPermission = this.checkboxSelected;
    }
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
