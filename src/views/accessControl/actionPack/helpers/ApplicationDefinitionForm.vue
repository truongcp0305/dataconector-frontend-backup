<template>
    <div class="w-100 h-100">
        <div class="d-flex w-100 mt-1 align-center">
            <ListItemSelector
                :name="$t('objects.application')"
                :listItem="itemData.listApp"
                @item-selected="handleClickApp"
                @list-item-selected="handleSelectListApp"
                :values="listApp"
                :showBtn="true"
            />
        </div>
        <div class="d-flex w-100 mr-2 children-application">
            <ObjectInApplication
                ref="objectInApplication"
                :idApplication="selectedApplication"
                :listApp="listApp"
                :gridOptions="gridOptions"
                :defaultColDef="defaultColDef"
                :itemData="itemData"
            />
        </div>
        <div>
            <OrgchartSelector
                v-if="active == 'orgchart'"
                :checkboxes="checkboxes"
                :selectedApplication="selectedApplication"
                @permission-selected="handlePermissionSelected"
            />
        </div>
    </div>
</template>
<script>
import OrgchartSelector from './OrgchartSelector';
import ListItemSelector from './ListItemSelector.vue';
import ObjectInApplication from './../actionPackPanel/ObjectInApplication';
import { util } from '@/plugins/util';

export default {
    props: {
        listApp: {
            type: Array,
            default() {
                return [];
            }
        },
        gridOptions: {
            type: Object,
            default() {
                return {};
            }
        },
        defaultColDef: {
            type: Object,
            default() {
                return {};
            }
        },
        itemData: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    components: {
        ListItemSelector,
        OrgchartSelector,
        ObjectInApplication
    },
    data() {
        return {
            active: '',
            selectedApplication:
                this.listApp.length > 0 ? this.listApp[0].id : [],
            checkboxes: []
        };
    },
    mounted() {
        const self = this;
        this.$evtBus.$on('set-app-info', (app) => {
            if (app.app) {
                self.selectedApplication = app.app;
            }
        });
    },
    computed: {},
    methods: {
        // khi click app
        handleClickApp(value) {
            this.selectedApplication = value;
            this.$refs.objectInApplication.setLoadingTable();
            this.$emit('app-selected', value);
        },
        // khi chọn danh sách app
        handleSelectListApp(lists) {
            this.$emit('list-item-selected', lists);
        },
        // xử lý những app được xóa
        handlePermissionSelected(value) {
            this.checkboxes = value;
        }
    }
};
</script>

<style scoped>
.title-children-application {
    cursor: pointer;
    margin-left: auto;
    margin-right: auto;
}
.title-children-application:hover {
    background-color: #f7f7f7;
}
.title-children-application-active {
    background-color: #f0f0f0;
}
</style>