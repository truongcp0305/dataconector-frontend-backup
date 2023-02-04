<template>
    <div class="h-100 permission d-flex align-content-space-between flex-wrap">
        <div class="w-100">
            <v-row class="w-100">
                <v-col class="col-md-8">
                    <v-btn
                        small
                        outlined
                        class="fs-13 mr-2 button"
                        :style="{
                            'background-color': showOrgchart ? '#E6E5E5' : ''
                        }"
                        @click="showPermissionOrgchart()"
                    >
                        {{ $t('v2.account.orgchartPosition') }}
                    </v-btn>
                    <v-btn
                        small
                        outlined
                        class="fs-13 mr-2"
                        :style="{
                            'background-color': showUser ? '#E6E5E5' : ''
                        }"
                        @click="showPermissionUser()"
                        >{{ $t('v2.account.userType') }}</v-btn
                    >
                </v-col>
                <v-col class="col-md-5">
                    <div>
                        <v-text-field
                            v-if="showUser"
                            class="pt-0 search-input"
                            style="margin-top: -2px"
                            v-model="search"
                            append-icon="mdi-magnify"
                            label="Search"
                            single-line
                            hide-details
                        ></v-text-field>
                    </div>
                </v-col>
            </v-row>
            <div v-if="!showUser">
                <OrgchartElementSelector
                    ref="orgchartSelector"
                    v-model="data"
                />
            </div>
            <div class="w-100" v-if="showUser">
                <v-data-table
                    :options="{ itemsPerPage: 14 }"
                    v-model="selected"
                    show-select
                    dense
                    :headers="headers"
                    :items="listPermission"
                    class="import-table"
                    :search="search"
                    @item-selected="handleSelection"
                >
                </v-data-table>
            </div>
        </div>
        <div class="d-flex justify-end w-100 pr-3 mb-1">
            <v-btn
                small
                color="success"
                :width="50"
                v-if="showOrgchart"
                @click="saveOrgchart()"
            >
                {{ $t('v2.account.save') }}
            </v-btn>
            <v-btn
                small
                color="success"
                :width="50"
                v-if="!showOrgchart"
                @click="insertRole()"
            >
                {{ $t('v2.account.save') }}
            </v-btn>
        </div>
    </div>
</template>
<script>
import { systemRoleApi } from './../../api/systemRole.js';
import { userApi } from './../../api/user.js';
import { orgchartApi } from './../../api/orgchart.js';
import OrgchartElementSelector from './../..//components/common/OrgchartElementSelector.vue';
export default {
    watch: {
        stepper() {
            if (this.stepper == 2) {
                this.setUserRole();
            }
        }
    },
    components: {
        OrgchartElementSelector
    },
    props: ['userId', 'stepper'],
    computed: {
        headers() {
            return [
                {
                    text: 'ID',
                    align: 'start',
                    sortable: false,
                    value: 'id'
                },
                {
                    text: 'Name',
                    value: 'name'
                },
                {
                    text: this.$t('v2.account.describe'),
                    value: 'description'
                }
            ];
        }
    },
    data() {
        return {
            data: [],
            id: 972,
            showUser: false,
            showOrgchart: true,
            selected: [],
            listSelected: [],
            listPermission: [],
            search: ''
        };
    },
    methods: {
        updateUserRole() {
            if (this.actionType == 'edit') {
            }
        },
        async setUserRole() {
            this.selected = [];
            let listUserRole = await userApi.getListSystemRole();
            if (listUserRole.status == 200) {
                this.listPermission = listUserRole.data.systemRole;
            }
            let listSelectedRole = await systemRoleApi.getRolesByUser([
                this.userId
            ]);
            if (listSelectedRole.status == 200) {
                if (listSelectedRole.data.length > 0) {
                    listSelectedRole.data[0].roles.map((role) => {
                        this.selected.push({
                            roleIdentify: role.id,
                            name: role.name,
                            description: role.description,
                            id: role.id.split(':')[1]
                        });
                        this.listSelected.push(role.id);
                    });
                }
            }
        },
        saveOrgchart() {
            let data = [{ userId: this.userId, roles: this.data }];
            userApi
                .updateRole({ items: JSON.stringify(data) })
                .then((res) => {
                    if (res.status == 200) {
                        this.$snotify({
                            type: 'success',
                            title: this.$t('v2.account.saveSuccess')
                        });
                    } else {
                        this.$snotify({
                            type: 'error',
                            title: res.message
                        });
                    }
                })
                .catch(console.error);
        },
        showPermissionUser() {
            this.showOrgchart = false;
            this.showUser = true;
        },
        showPermissionOrgchart() {
            this.showUser = false;
            this.showOrgchart = true;
        },
        handleSelection(data) {
            if (data.value) {
                this.listSelected.push(data.item.roleIdentify);
            } else {
                this.listSelected.pop();
            }
        },
        insertRole() {
            let data = [{ userId: this.userId, roles: this.listSelected }];
            userApi
                .updateRole({ items: JSON.stringify(data) })
                .then((res) => {
                    if (res.status == 200) {
                        this.$snotify({
                            type: 'success',
                            title: res.message
                        });
                    } else {
                        this.$snotify({
                            type: 'error',
                            title: res.message
                        });
                    }
                })
                .catch(console.error);
        }
    }
};
</script>
<style scoped>
button ::v-deep .v-btn--outlined {
    border: thin solid #e6e5e5 !important;
}
.permission ::v-deep .text-start {
    font-size: 13px !important;
}
.search-input {
    height: 30px !important;
}
.search-input ::v-deep .v-label--active {
    display: none;
}
.search-input {
    padding-top: 0px !important;
    border-radius: 4px;
    background-color: #e6e5e5;
}
.search-input ::v-deep .v-input__slot:before {
    border-color: transparent !important;
}
.search-input ::v-deep .v-input__slot {
    padding-left: 10px !important;
}
.search-input ::v-deep .v-label {
    font-size: 13px !important;
}
.search-input ::v-deep .v-input__slot:after {
    border-color: transparent !important;
}
.search-input ::v-deep .v-select__slot {
    padding-left: 10px;
}
</style>
