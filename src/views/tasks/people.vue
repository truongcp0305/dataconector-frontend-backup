<template>
    <div class="w-100 symper-task-people px-5">
        <div class="w-100 py-4 mb-6">
            <span class="symper-title float-left">
                {{ $t('tasks.relatedPeople.title') }}
            </span>
            <v-text-field
                dense
                hide-details
                v-model="searchUserKey"
                append-icon="mdi-magnify"
                single-line
                outlined
                style="width: 300px"
                class="d-inline-block mx-2 sym-small-size float-right"
            ></v-text-field>
        </div>
        <v-row class="list-users-in-task w-100">
            <div
                class="w-100 mb-2 pl-3"
                v-for="(users, role) in tabData"
                :key="role"
            >
                <div
                    v-if="users.length > 0"
                    style="height: 30px"
                    class="
                        fs-13
                        font-weight-medium
                        symper-user-role-in-task
                        d-flex
                    "
                >
                    <span>
                        <v-icon class="mr-3" size="18">mdi-account</v-icon>
                        <span mt-1>{{ $t('tasks.header.' + role) }}</span>
                    </span>
                    <v-btn
                        small
                        icon
                        @click="addUserForRole(role)"
                        class="ml-3 symper-add-user-btn"
                        style="display: none"
                        v-if="roleCanAddUser[role]"
                    >
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </div>
                <div
                    class="pl-10 py-2 d-flex justify-space-between user-show"
                    v-for="userItem in tabData[role]"
                    :key="userItem.id"
                >
                    <user :user="userItem" class="float-left"></user>
                    <div class="float-right action-for-role d-flex">
                        <div
                            v-for="(btn, idx) in actionsForRole[role]"
                            :key="idx"
                            class="d-flex"
                        >
                            <v-menu
                                v-if="btn.showUserSelect == true"
                                v-model="showDelegatedUser[role + '_' + idx]"
                                :offset-y="true"
                                class="symper-select-user-autocomplete"
                                :close-on-content-click="false"
                                :close-on-click="false"
                            >
                                <template
                                    v-slot:activator="{ on: menu, attrs }"
                                >
                                    <v-tooltip bottom>
                                        <template
                                            v-slot:activator="{ on: tooltip }"
                                        >
                                            <v-btn
                                                text
                                                v-bind="attrs"
                                                depressed
                                                v-on="{ ...tooltip, ...menu }"
                                                class="mr-3"
                                                small
                                                @click="
                                                    handleAction(
                                                        btn.name,
                                                        role,
                                                        idx
                                                    )
                                                "
                                            >
                                                <v-icon left>{{
                                                    btn.icon
                                                }}</v-icon>
                                                {{ btn.text }}
                                            </v-btn>
                                        </template>
                                        <span>{{ btn.text }}</span>
                                    </v-tooltip>
                                </template>
                                <div
                                    class="bg-white"
                                    style="width: 200px; z-index: 99999"
                                    :ref="
                                        'selectUserWrapper_' + role + '_' + idx
                                    "
                                ></div>
                            </v-menu>

                            <!-- <v-btn v-else depressed class="mr-3" small @click="handleAction(btn.name, role, idx)" >
                                <v-icon left>{{btn.icon}}</v-icon> {{btn.text}}
                            </v-btn> -->
                        </div>
                    </div>
                </div>
            </div>
        </v-row>
        <div
            class="w-100 h-100 symper-select-user-autocomplete"
            v-show="statusChange"
            ref="selectUserAutocomplete"
        >
            <v-autocomplete
                ref="selectDelegateUser"
                return-object
                full-width
                solo
                append-icon=""
                :items="sapp.allUsers"
                background-color="grey lighten-4"
                flat
                v-model="selectedUserForAssignment"
                dense
                color="blue-grey lighten-2"
                :label="$t('common.search')"
                item-text="displayName"
                @change="changeUserSelect"
                item-value="name"
                :filter="filterUser"
            >
                <template v-slot:item="data">
                    <div class="fs-13 py-1">
                        <i class="mdi mdi-account mr-2 fs-16"> </i>
                        <span> {{ data.item.displayName }}</span>
                    </div>
                </template>
            </v-autocomplete>
        </div>
    </div>
</template>

<script>
import OrgchartSelector from './../../components/user/OrgchartSelector';
import user from './user';
import BPMNEngine from '../../api/BPMNEngine';
export default {
    name: 'people',
    components: {
        user,
        OrgchartSelector: OrgchartSelector
    },
    watch: {
        tabData: {
            deep: true,
            immediate: true,
            handler(after) {
                this.showDelegatedUser = {};
                for (let role in this.tabData) {
                    for (let idx in this.tabData[role]) {
                        this.$set(
                            this.showDelegatedUser,
                            role + '_' + idx,
                            false
                        );
                    }
                }
            }
        }
    },
    props: {
        tabData: {
            type: Object,
            default: () => {}
        },
        taskInfo: {
            type: Object,
            default: () => {}
        }
    },
    computed: {
        sapp() {
            return this.$store.state.app;
        },
        roleCanAddUser() {
            let canAddAssignee = false;
            let assignee = this.tabData.assignee[0];
            if (!assignee && this.tabData.owner[0]) {
                canAddAssignee =
                    this.$store.state.app.endUserInfo.id ==
                    this.tabData.owner[0].id;
            }
            return {
                participant: true,
                watcher: true,
                assignee: canAddAssignee
            };
        }
    },
    data: function () {
        return {
            statusChange: false,
            selectedUserForAssignment: {},
            showDelegatedUser: {},
            autoUpdate: true,
            isUpdating: false,
            friends: [],
            searchUserKey: '',
            selectingPosition: {
                role: '',
                idx: ''
            },
            actionsForRole: {
                assignee: [
                    {
                        icon: 'mdi-account-switch-outline',
                        name: 'change',
                        text: this.$t('v2.myItem.change'),
                        showUserSelect: true
                    },
                    {
                        icon: 'mdi-sitemap',
                        name: 'orgchart',
                        text: this.$t('v2.myItem.orgchart')
                    }
                ],
                owner: [
                    {
                        icon: 'mdi-account-switch-outline',
                        name: 'change',
                        text: this.$t('v2.myItem.change'),
                        showUserSelect: false
                    },
                    {
                        icon: 'mdi-sitemap',
                        name: 'orgchart',
                        text: this.$t('v2.myItem.orgchart')
                    }
                ],
                participant: [
                    {
                        icon: 'mdi-delete-outline',
                        name: 'delete',
                        text: this.$t('v2.myItem.remove')
                    },
                    {
                        icon: 'mdi-sitemap',
                        name: 'orgchart',
                        text: this.$t('v2.myItem.orgchart')
                    }
                ],
                watcher: [
                    {
                        icon: 'mdi-delete-outline',
                        name: 'delete',
                        text: this.$t('v2.myItem.remove')
                    },
                    {
                        icon: 'mdi-sitemap',
                        name: 'orgchart',
                        text: this.$t('v2.myItem.orgchart')
                    }
                ]
            }
        };
    },
    methods: {
        async changeUserSelect(value) {
            let updateData = {};
            for (let role in this.tabData) {
                let userIds = this.tabData[role].reduce((arr, user) => {
                    arr.push(user.id);
                    return arr;
                }, []);

                if (role == this.selectingPosition.role) {
                    userIds[this.selectingPosition.idx] = value.id;
                }
                if (userIds.length > 0) {
                    updateData[role] = userIds.join(',');
                }
            }
            this.selectedUserForAssignment = {};
            try {
                let res = await BPMNEngine.updateTask(
                    this.taskInfo.action.parameter.taskId,
                    updateData
                );
                this.$evtBus.$emit('symper-update-task-assignment', res);
                this.$snotifySuccess(
                    this.$t('v2.myItem.updateTaskSuccess')
                );
            } catch (error) {
                this.$snotifyError(
                    error,
                    this.$t('v2.myItem.updateTaskFail')
                );
            }
            this.statusChange = false;
        },
        filterUser(item, queryText, itemText) {
            let lowcaseText = queryText.toLowerCase();
            return item.displayName.toLowerCase().includes(lowcaseText);
        },
        remove(item) {
            const index = this.friends.indexOf(item.id);
            if (index >= 0) this.friends.splice(index, 1);
        },
        delegateUser() {},
        addUserForRole(role) {
            let users = this.tabData[role].reduce((urs, el) => {
                urs.push({});
                return urs;
            }, []);
        },
        handleAction(actionName, role, idx) {
            this.statusChange = true;
            this.selectingPosition.role = role;
            this.selectingPosition.idx = idx;

            let self = this;
            let refKey = 'selectUserWrapper_' + role + '_' + idx;
            if (!this.$refs[refKey]) {
                setTimeout(() => {
                    self.showSelectUser(role, idx, refKey);
                }, 200);
            } else {
                self.showSelectUser(role, idx, refKey);
            }
        },
        showSelectUser(role, idx, refKey) {
            if (this.actionsForRole[role][idx].showUserSelect) {
                $(this.$refs[refKey]).html('');
                $(this.$refs[refKey]).append(this.$refs.selectUserAutocomplete);
                setTimeout(
                    (self) => {
                        $(self.$refs[refKey]).find('.v-select__slot').click();
                    },
                    200,
                    this
                );
            }
        }
    },
    created() {
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (
                !(
                    $(evt.target).hasClass('symper-select-user-autocomplete') ||
                    $(evt.target).parents('.symper-select-user-autocomplete')
                        .length > 0
                )
            ) {
                for (let key in this.showDelegatedUser) {
                    this.showDelegatedUser[key] = false;
                }
            }
        });
    }
};
</script>

<style scoped>
div#symper-app >>> .v-application >>> .v-list-item--active:hover::before,
div#symper-app >>> .v-application >>> .v-list-item--active::before {
    opacity: 0;
}

#listUser {
    overflow: auto;
    max-height: calc(100vh - 185px);
}

/* .symper-task-people .symper-user-role-in-task:hover {
    background-color: antiquewhite;
} */
.symper-task-people .symper-user-role-in-task:hover .symper-add-user-btn {
    display: block !important;
}

.symper-task-people .action-for-role {
    visibility: hidden;
}

.symper-task-people .user-show:hover .action-for-role {
    visibility: visible;
}

.symper-task-people .user-show:hover {
    background-color: #eeeeee;
}
</style>
