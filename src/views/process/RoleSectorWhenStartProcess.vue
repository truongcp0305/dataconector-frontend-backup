<template>
    <v-dialog persistent v-model="dialog" max-width="300px">
        <div class="h-100 w-100 pa-3 pb-2 bg-white">
            <!-- title -->
            <div class="font-weight-medium fs-15 mb-2">
                {{ $t('process.instance.selectRole') }}
            </div>

            <!-- Content -->
            <div>
                <div class="mb-2">
                    <span>{{ subTitle }}</span>
                </div>

                <VuePerfectScrollbar style="max-height: 300px">
                    <div
                        class="pb-0"
                        v-for="(roles, key) in candidateRoles"
                        :key="key"
                    >
                        <div
                            v-if="roles.length"
                            class="font-weight-medium fs-13 px-4"
                        >
                            {{ mapRoleTitle[key] }}
                        </div>
                        <div
                            class="py-1 px-0 fs-16 pl-4 pr-2 grey-hover position-relative"
                            @click="selectRole(item)"
                            v-for="(item, i) in roles"
                            :key="i"
                        >
                            <i
                                v-if="selectedRole.id == item.id"
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
                                    'line-height': item.orgchartName
                                        ? ''
                                        : '40px',
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
                </VuePerfectScrollbar>
            </div>

            <!-- Actions -->
            <div class="w-100 pt-3 d-inline-block">
                <div class="float-right">
                    <v-btn
                        small
                        class="mr-3"
                        depressed
                        @click="cancelSelect()"
                        >{{ $t('common.cancel') }}</v-btn
                    >
                    <v-btn
                        small
                        color="primary"
                        depressed
                        @click="applySelectedRole()"
                        >{{ $t('common.apply') }}</v-btn
                    >
                </div>
            </div>
        </div>
    </v-dialog>
</template>

<script>
import processApi from '@/api/BPMNEngine.js';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

export default {
    components: {
        VuePerfectScrollbar,
    },
    data() {
        return {
            subTitle: this.$t('process.instance.subtitleSelectRoleWhenStart'),
            selectedRole: {},
            dialog: false,
            candidateRoles: {
                orgchart: [],
                system: [],
            },
            startBySelectRoleResolver: null,
            mapRoleTitle: {
                orgchart: this.$t('common.orgchart'),
                system: this.$t('systemRole.name'),
            },
        };
    },
    methods: {
        selectRole(role) {
            this.selectedRole = role;
            this.$set(this.selectedRole, 'id', role.id);
        },
        cancelSelect() {
            this.dialog = false;
            this.startBySelectRoleResolver({
                status: false,
                reason: this.$t('process.instance.cancelSelectRole'),
            });
        },
        applySelectedRole() {
            this.dialog = false;
            this.setRoleToContinue(this.selectedRole);
            this.startBySelectRoleResolver({
                status: true,
                newRole: this.selectedRole,
            });
        },
        setRoleToContinue(role) {
            this.$store.state.app.endUserInfo.selectedRoleForWorkflow = role;
        },
        getCandidateRoles(
            id,
            type = 'workflow_definition',
            action = 'start_instance',
        ) {
            let app = this.$store.state.app;
            let roles = app.endUserInfo.roles.orgchart.concat(
                app.endUserInfo.roles.systemRole,
            );
            let operationsByRole = this.$store.state.app.operationsByRole;

            let mapRoles = roles.reduce((map, el) => {
                map[el.id] = el;
                return map;
            }, {});
            this.candidateRoles = {
                orgchart: [],
                system: [],
            };

            for (let roleId in operationsByRole) {
                if (
                    operationsByRole[roleId][type] &&
                    operationsByRole[roleId][type][id] &&
                    operationsByRole[roleId][type][id][action]
                ) {
                    if (roleId.includes('orgchart')) {
                        this.candidateRoles.orgchart.push(mapRoles[roleId]);
                    } else {
                        this.candidateRoles.system.push(mapRoles[roleId]);
                    }
                }
            }
            this.autoSelectFirstRole();
        },
        autoSelectFirstRole() {
            if (this.candidateRoles.orgchart.length) {
                this.selectedRole = this.candidateRoles.orgchart[0];
            } else if (this.candidateRoles.system.length) {
                this.selectedRole = this.candidateRoles.system[0];
            }
        },
        async getProcessId() {
            if (this.processId) {
                return this.processId;
            } else if (this.processKey) {
                let process = await processApi.getProcessByProcessKey(
                    this.processKey,
                );
                return process.data.id;
            } else {
                return '';
            }
        },
        startBySelectRole() {
            let self = this;
            let rsl = new Promise(async (resolve, reject) => {
                let rolesFromProps = self.displayData.roles.orgchart.concat(
                    self.displayData.roles.system,
                );
                if (rolesFromProps.length > 0) {
                    // N???u truy???n role v??o t??? props th?? x??? l?? theo data t??? props, r???i return lu??n
                    if (rolesFromProps.length == 1) {
                        self.setRoleToContinue(rolesFromProps[0]);
                        resolve({ status: true });
                    } else {
                        self.$set(
                            self.candidateRoles,
                            'orgchart',
                            self.displayData.roles.orgchart,
                        );
                        self.$set(
                            self.candidateRoles,
                            'system',
                            self.displayData.roles.system,
                        );
                        self.subTitle = self.displayData.subTitle;
                        this.autoSelectFirstRole();
                        // N???u c?? nhi???u h??n 1 role c?? th??? th???c thi th?? m??? dialog ????? user ch???n role,
                        self.dialog = true;
                        // Khi user ch???n xong role th?? m???i g???i startBySelectRoleResolver ????? b???t ?????u quy tr??nh
                        self.startBySelectRoleResolver = resolve;
                    }
                    return;
                }
                if (
                    this.objectInfo.id &&
                    this.objectInfo.action &&
                    this.objectInfo.type
                ) {
                    this.getCandidateRoles(
                        this.objectInfo.id,
                        this.objectInfo.type,
                        this.objectInfo.action,
                    );
                } else {
                    let proecessId = await self.getProcessId();
                    this.getCandidateRoles(proecessId);
                }
                let info = self.$store.state.app.endUserInfo;
                let roles = info.roles.orgchart.concat(info.roles.systemRole);
                let currentRole = info.currentRole.id;
                let flatCandidateRole = self.candidateRoles.orgchart.concat(
                    self.candidateRoles.system,
                );
                if (currentRole == 'auto') {
                    if (roles.length > 1) {
                        if (flatCandidateRole.length == 0) {
                            if (self.$store.state.app.baInfo.email) {
                                // N???u l?? t??i kho???n BA m?? kh??ng c?? role n??o th?? v???n ti???p t???c th???c thi v???i role r???ng
                                self.setRoleToContinue({});
                                resolve({ status: true });
                            } else {
                                // N???u kh??ng c?? role n??o ???????c ph??p b???t ?????u quy tr??nh th?? kh??ng ???????c ph??p th???c thi
                                resolve({
                                    status: false,
                                    reason: self.$t(
                                        'process.instance.noRoleToStart',
                                    ),
                                });
                            }
                        } else if (flatCandidateRole.length == 1) {
                            // N???u c?? ????ng duy nh???t 1 role ??k ch???y quy tr??nh th?? ch???n lu??n role ????
                            self.setRoleToContinue(flatCandidateRole[0]);
                            resolve({ status: true });
                        } else {
                            // N???u c?? nhi???u h??n 1 role c?? th??? th???c thi th?? m??? dialog ????? user ch???n role,
                            self.dialog = true;
                            // Khi user ch???n xong role th?? m???i g???i startBySelectRoleResolver ????? b???t ?????u quy tr??nh
                            self.startBySelectRoleResolver = resolve;
                        }
                    } else {
                        // N???u user ch??? c?? ????ng 1 role ho???c kh??ng c?? role n??o th?? b???t ?????u lu??n
                        resolve({ status: true });
                    }
                } else {
                    // N???u ch??? ?????nh r?? role r???i th?? b???t ?????u lu??n
                    resolve({ status: true });
                }
            });
            return rsl;
        },
    },
    props: {
        processId: {
            default: '',
        },
        processKey: {
            default: '',
        },
        displayData: {
            default() {
                return {
                    subTitle: '',
                    roles: {
                        orgchart: [],
                        system: [],
                    },
                };
            },
        },
        objectInfo: {
            default() {
                return {
                    id: '',
                    type: '',
                    action: '',
                };
            },
        },
    },
};
</script>

<style></style>
