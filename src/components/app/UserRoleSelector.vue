<template>
    <div class="bg-white" style="width: 170px">
        <div
            v-if="Object.values(userRoles).length == 0"
            class="pt-2 fs-13 px-4 red--text font-weight-medium"
        >
            {{ $t('userRole.userHasNoRole') }}
        </div>
        <div v-else>
            <div class="pb-0 pt-2" v-for="(roles, key) in userRoles" :key="key">
                <div v-if="key != 'auto'" class="font-weight-medium fs-13 px-4">
                    {{ mapRoleTitle[key] }}
                </div>
                <div
                    class="py-1 px-0 fs-16 pl-4 pr-2 grey-hover position-relative"
                    @click="selectUserRole(item)"
                    v-show="!item.hidden"
                    v-for="(item, i) in roles"
                    :key="i"
                >
                    <i
                        v-if="currentRole.id == item.id"
                        class="orange--text text--darken-3 position-absolute mdi mdi-check"
                        :style="{
                            'line-height': '40px',
                            right: '12px',
                        }"
                    >
                    </i>
                    <div
                        :style="{
                            width: 'calc(100% - 30px)',
                            height: item.orgchartName ? '' : '40px',
                            'line-height': item.orgchartName ? '' : '40px',
                        }"
                        class="fs-13 text-ellipsis"
                    >
                        {{ item.name }}
                    </div>
                    <div
                        style="width: calc(100% - 30px)"
                        class="fs-11 grey--text text-ellipsis"
                    >
                        {{ item.orgchartName }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    created() {
        let self = this;
    },
    data() {
        return {
            mapRoleTitle: {
                orgchart: this.$t('common.orgchart'),
                systemRole: this.$t('systemRole.name'),
                auto: this.$t('common.auto'),
            },
        };
    },
    computed: {
        userRoles() {
            let roles = this.$store.state.app.endUserInfo.roles;
            let rsl = {};
            // rsl.auto = roles.auto;
            // rsl.auto[0].name = this.$t('common.auto')
            if (roles.orgchart.length) {
                rsl.orgchart = roles.orgchart;
            }

            if (roles.systemRole.length) {
                rsl.systemRole = roles.systemRole;
            }
            return rsl;
        },
        currentRole() {
            return this.$store.state.app.endUserInfo.currentRole;
        },
    },
    mounted() {},
    methods: {
        async selectUserRole(role) {
            await this.$store.dispatch('app/changeUserRole', role);
            location.reload();
        },
    },
};
</script>
