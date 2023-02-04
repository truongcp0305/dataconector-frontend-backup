<template>
    <div>
        <div class="fs-16 fw-430 pb-1">
            {{ $t('authen.view.view_title') }}
        </div>
        <v-divider class="mb-3"> </v-divider>
        <v-row
            v-for="(key, idx) in detailKey"
            :key="idx"
            style="margin-top: -10px"
        >
            <v-col class="col-md-3 fs-13 fw-430">
                {{ $t('authen.table.' + key.name) }}:
            </v-col>
            <v-col class="col-md-8 fs-13" style="margin-left: -50px !important">
                {{ key.value }}
            </v-col>
            <v-col>
                <v-icon
                    v-if="key.name == 'id' || key.name == 'serverKey'"
                    class="close-btn float-right"
                    @click="$copyTextToClipboard(key.value)"
                    size="15"
                    >mdi-content-copy
                </v-icon>
            </v-col>
        </v-row>
        <permission-selector
            v-model="permissions"
            :disabled="action == 'detail'"
            :height="'calc(100vh - 450px)'"
            :action="action"
        >
        </permission-selector>
        <div class="d-flex flex-row justify-end">
            <v-btn class="fs-13 fw-400" color="success" @click="save()">
                {{ $t('common.save') }}
            </v-btn>
        </div>
    </div>
</template>
<script>
import PermissionSelector from '@/components/permission/PermissionSelector.vue';
import userApi from '@/api/user.js';
import { systemRoleApi } from '@/api/systemRole.js';
export default {
    watch: {},
    methods: {
        save() {
            if (!this.detailKey.idRole) {
                this.createRole();
            } else {
                this.updateRole();
            }
        },
        updateRole() {
            let test = this.detailKey;
            let data = {
                name: this.detailKey[1].value,
                description: this.detailKey[2].value,
                users: JSON.stringify([this.detailKey[0].value]),
                permissions: JSON.stringify(this.getListPermission()),
            };
            systemRoleApi.update(this.detailKey.idRole, data).then((res) => {
                if (res.status == 200) {
                    this.$snotify({
                        type: 'success',
                        title: this.$t(+'authen.notify.success'),
                    });
                    this.$emit('close-detail-key');
                } else {
                    this.$snotify({
                        type: 'error',
                        title: this.$t('authen.notify.error'),
                    });
                }
            });
        },
        createRole() {
            const self = this;
            let data = {
                name: this.detailKey[1].value,
                description: this.detailKey[2].value,
                users: JSON.stringify([this.detailKey[0].value]),
                permissions: JSON.stringify(this.getListPermission()),
            };
            systemRoleApi.create(data).then((res) => {
                if (res.status == 200) {
                    self.$snotify({
                        type: 'success',
                        title: self.$t(+'authen.notify.success'),
                    });
                    self.$emit('close-detail-key');
                } else {
                    self.$snotify({
                        type: 'error',
                        title: self.$t('authen.notify.error'),
                    });
                }
            });
        },
        getListPermission() {
            let listPermissions = [];
            this.permissions.map((p) => {
                listPermissions.push(p.id);
            });
            return listPermissions;
        },
        getLastRole() {
            // if(this.detailKey.idRole){
            //     let role = 'system:'+this.detailKey.idRole;
            //     this.userApi.getPermission(role).then(res=>{
            //         if(res.status==200){
            //             // this.permission = this.res.data;
            //         }
            //     })
            //     // this.permissions =
            // }
        },
    },
    data() {
        return {
            permissions: [],
            action: 'create',
        };
    },
    components: {
        'permission-selector': PermissionSelector,
    },
    created() {},
    props: {
        detailKey: {
            type: Object,
            default() {
                return {};
            },
        },
    },
};
</script>
