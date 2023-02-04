<template>
    <div class="d-flex h-100 w-100">
        <div class="d-flex flex-column h-100 tab-select fs-13">
            <div
                v-for="(item, i) in listType"
                :key="i"
                :class="{
                    'tab-select-item d-flex flex-column ml-1 mr-1 pl-1 pr-1 mt-1 pt-2 pb-2': true,
                    'selected-item': active == item.action,
                }"
                @click="handleTab(item)"
            >
                <div>
                    <v-icon small class="icon-menu">
                        {{ item.icon }}
                    </v-icon>
                    <span class="ml-2">{{ item.title }}</span>
                </div>
            </div>
            <div class="ml-1 mr-1 d-flex flex-column fs-13">
                <div
                    class="mt-1 pl-6 pt-1 pb-1"
                    :class="{
                        'role-user-item': true,
                        'selected-item': subActive == 'userRole',
                    }"
                    @click="handleUserRoleCLick('userRole')"
                >
                    <v-icon small color="#C4C4C4" class="mb-1">
                        mdi-circle-medium </v-icon
                    >{{ $t('permissions.in_system') }}
                </div>
                <div
                    class="mt-1 pl-6 pt-1 pb-1"
                    :class="{
                        'role-user-item': true,
                        'selected-item': subActive == 'userRoleOrgchart',
                    }"
                    @click="handleUserRoleCLick('userRoleOrgchart')"
                >
                    <v-icon small color="#C4C4C4" class="mb-1">
                        mdi-circle-medium </v-icon
                    >{{ $t('permissions.in_orgchart') }}
                </div>
            </div>
        </div>
        <div class="list-item flex-grow-1 w-100 h-100">
            <ListFilterAccessControl
                v-if="active == 'filter'"
                :containerHeight="containerHeight"
            />
            <ListActionPack
                v-if="active == 'actionPack'"
                :containerHeight="containerHeight"
            />
            <ListPermission
                v-if="active == 'permission'"
                :containerHeight="containerHeight"
            />
            <ListUserRole
                v-if="subActive == 'userRole'"
                :containerHeight="containerHeight"
            />
            <ListUserRoleOrgchart
                v-if="subActive == 'userRoleOrgchart'"
                :containerHeight="containerHeight"
            />
        </div>
    </div>
</template>

<script>
import ListFilterAccessControl from './filter/ListFilterAccessControl.vue';
import ListActionPack from './actionPack/ListActionPack';
import ListPermission from './permission/ListPermission';
import ListUserRole from './role/ListUserRole';
import { util } from '@/plugins/util.js';
import ListUserRoleOrgchart from './role/ListUserRoleOrgchart';
export default {
    components: {
        ListFilterAccessControl,
        ListActionPack,
        ListPermission,
        ListUserRole,
        ListUserRoleOrgchart,
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        return {
            // active: "filter",
            active: 'actionPack',
            containerHeight: null,
            subActive: '',
            listType: [
                {
                    title: this.$t('v2.acessControl.filterConfig'),
                    action: 'filter',
                    icon: 'mdi-filter-outline',
                },
                {
                    title: 'Action pack',
                    action: 'actionPack',
                    icon: 'mdi-tune',
                },
                {
                    title: 'Permission',
                    action: 'permission',
                    icon: 'mdi-shield-account-variant-outline ',
                },
                {
                    title: this.$t('v2.acessControl.userRole'),
                    action: 'userRole',
                    icon: 'mdi-account-circle-outline',
                },
            ],
        };
    },
    methods: {
        handleTab(item) {
            this.active = item.action;
            if (item.action == 'userRole') {
                this.subActive = 'userRole';
            } else {
                this.subActive = '';
            }
        },
        handleUserRoleCLick(type) {
            this.subActive = type;
            this.active = 'userRole';
        },
    },
};
</script>

<style scoped>
.tab-select {
    width: 250px;
    border-right: 1px solid lightgray;
}
.selected-item {
    background-color: #f0f0f0;
    border-radius: 5px;
}
.tab-select-item,
.role-user-item {
    cursor: pointer;
    position: relative;
}
.icon-menu {
    margin-bottom: 2px;
}
</style>
