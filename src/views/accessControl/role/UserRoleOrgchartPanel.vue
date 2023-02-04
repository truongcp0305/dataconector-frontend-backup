<template>
    <div class="d-flex flex-column user-role-orgchart fs-13 pa-3">
        <div class="fw-430 border-bottom d-flex justify-space-between pb-2">
            <span class="fs-15">
                <v-icon class="fs-16 mr-1 ml-1"
                    >mdi mdi-account-circle-outline</v-icon
                >
                {{ $t('common.userRoleSetting') }} + Orgchart
            </span>
            <span>
                <v-btn small color="primary" @click="debounceSave" class="mr-2">
                    {{ $t('common.save') }}
                </v-btn>
                <v-btn icon text small @click="close">
                    <v-icon :size="15">mdi-close</v-icon>
                </v-btn>
            </span>
        </div>
        <div class="d-flex">
            <div
                class="list-department-orgchart pr-2 mr-2 h-100 pt-2"
                style="overflow: scroll"
            >
                <span class="fw-430">{{
                    $t('permissions.list_departments')
                }}</span>
                <OrgchartElement
                    :idOrgchart="idOrgchart"
                    :height="'calc(100vh - 150px)'"
                    @current-node="handleCurrentNodeClick"
                />
            </div>
            <div class="w-100 pt-2">
                <div class="mb-2 fw-430">{{$t('v2.acessControl.selectPermission')}}</div>
                <PermissionSelector
                    :height="'calc(100vh - 350px)'"
                    v-model="selectingNode.permissions"
                    :disabled="currentType == 'department'"
                />
            </div>
        </div>
    </div>
</template>
<script>
import PermissionSelector from '@/components/permission/PermissionSelector';
import OrgchartElement from './OrgchartElement';
import _debounce from 'lodash/debounce';
import RoleWorker from 'worker-loader!@/worker/accessControl/Role.Worker.js';

export default {
    props: {
        idOrgchart: {
            type: String,
        },
    },
    components: {
        PermissionSelector,
        OrgchartElement,
    },
    created() {},
    mounted() {
        let self = this;
        this.roleWorker = new RoleWorker();
        this.roleWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'savePermission':
                    if (data.dataAfter == 'success') {
                        self.$snotifySuccess(self.$t('v2.acessControl.assigningPermissionSuccessfully'));
                    } else {
                        self.$snotifyError(self.$t('v2.acessControl.anErrorOccurred'));
                    }
                    self.$emit('close-form');
                    break;
                case 'getNodePermission':
                    self.handlerGetNodePermission(data.dataAfter);
                    break;

                default:
                    break;
            }
        });
    },
    data() {
        return {
            selectingNode: [],
            currentType: '',
            roleWorker: null,
            listNode: {},
        };
    },
    methods: {
        close() {
            this.$emit('close-form');
        },
        handlerGetNodePermission(dataAfter) {
            let self = this;
            if (dataAfter.res.status == 200) {
                let mapIdToPermission =
                    this.$store.state.permission.allPermissionPack;
                let permissions = dataAfter.res.data.reduce((arr, el) => {
                    if (mapIdToPermission[el.permissionPackId]) {
                        arr.push(mapIdToPermission[el.permissionPackId]);
                    }
                    return arr;
                }, []);
                let obj = {
                    role_identifier: dataAfter.id,
                    role_type: 'orgchart',
                    permissions: permissions,
                    permission_id: [],
                };
                self.listNode[dataAfter.id] = obj;
                self.selectingNode = self.listNode[dataAfter.id];
            }
        },
        handleCurrentNodeClick(id, type) {
            let self = this;
            self.currentType = type;
            if (type == 'department') {
                self.selectingNode = {
                    permissions: [],
                };
            } else {
                if (!self.listNode[id]) {
                    this.roleWorker.postMessage({
                        action: 'getNodePermission',
                        data: {
                            id: id,
                        },
                    });
                } else {
                    self.selectingNode = self.listNode[id];
                }
            }
        },
        debounceSave: _debounce(
            function (e) {
                this.handleSaveClick();
            },
            300,
            this,
        ),
        handleSaveClick() {
            let permissions = [];
            let self = this;
            for (let i in this.listNode) {
                self.listNode[i].permissions.forEach(function (e) {
                    self.listNode[i].permission_id.push(e.id);
                });
                delete self.listNode[i].permissions;
                permissions.push(this.listNode[i]);
            }
            this.roleWorker.postMessage({
                action: 'savePermission',
                data: {
                    dataToSave: JSON.stringify(permissions),
                },
            });
        },
    },
    watch: {
        idOrgchart(val) {
            this.listNode = [];
            this.selectingNode = {
                permissions: [],
            };
            this.currentType = 'department';
        },
    },
};
</script>

<style scoped>
.user-role-orgchart .list-department-orgchart {
    width: 850px;
    border-right: 1px solid lightgray;
}
</style>
