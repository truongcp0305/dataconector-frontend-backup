<template>
    <div class="d-flex w-100 h-100 smart-object-config fs-13">
        <SmartObjectSelector
            :listObject="listObject"
            @select-object="selectObject"
            @unselect-object="unselectObject"
            @search-object="searchObject"
            ref="smartObjectSelector"
            :disable="action == 'view'"
        />
        <div class="object-workspace d-flex flex-column w-100">
            <div
                class="smart-object-header d-flex justify-space-between"
                :style="{
                    'margin-right': isShowSideBarConfig ? '320px' : '8px'
                }"
            >
                <div class="header-action">
                    <v-tooltip
                        bottom
                        v-for="(item, key) in headerActions"
                        :key="key"
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                small
                                @click="handleHeaderAction(key)"
                                icon
                                tile
                                class="mr-2 mt-1"
                                style="position: relative; top: -3px"
                            >
                                <v-icon small v-on="on">{{ item.icon }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t(item.text) }}</span>
                    </v-tooltip>
                </div>

                <div class="d-flex smart-object-general-infor">
                    <span
                        class="fs-13 fw-400 value-input text-ellipsis"
                        v-if="!editName"
                        @click="hideName"
                    >
                        {{
                            smartObjectConfig.generalInfo.name
                                ? smartObjectConfig.generalInfo.name
                                : $t('smartObject.enter_name')
                        }}
                    </span>
                    <v-text-field
                        v-else
                        :label="$t('smartObject.enter_name')"
                        single-line
                        ref="name"
                        autofocus
                        @keydown="handleKeyDown"
                        v-model="smartObjectConfig.generalInfo.name"
                        hide-details
                        :class="{
                            'error-name-smart-object': isDuplicateName,
                            'fs-13': true,
                            'text-field': true,
                            name: true
                        }"
                    ></v-text-field>

                    <span class="fs-13 mx-2">/</span>
                    <v-text-field
                        v-if="editDes"
                        single-line
                        autofocus
                        @keydown="handleKeyDown"
                        :label="$t('smartObject.enter_description')"
                        v-model="smartObjectConfig.generalInfo.description"
                        class="fs-13 text-field"
                        hide-details
                    ></v-text-field>
                    <span
                        v-else
                        class="fs-13 fw-400 value-input"
                        @click="hideDes"
                    >
                        {{
                            smartObjectConfig.generalInfo.description
                                ? smartObjectConfig.generalInfo.description
                                : $t('smartObject.enter_description')
                        }}
                    </span>
                </div>

                <div>
                    <v-btn
                        @click="exit()"
                        depressed
                        small
                        color="#F2F2F2"
                        v-if="action != 'view'"
                        class="mr-2"
                    >
                        {{ $t('common.exit') }}
                    </v-btn>
                    <v-btn
                        @click="close()"
                        depressed
                        small
                        color="#F2F2F2"
                        v-else
                        class="mr-2"
                    >
                        {{ $t('common.close') }}
                    </v-btn>
                    <v-btn
                        @click="save()"
                        depressed
                        small
                        color="success"
                        v-if="action != 'view'"
                        :loading="isLoadingSave"
                        :disabled="isLoadingSave"
                    >
                        {{ $t('common.save') }}
                    </v-btn>
                    <v-btn
                        @click="edit()"
                        depressed
                        small
                        color="orange"
                        v-else
                    >
                        <span style="color: white">{{
                            $t('kanban.edit.button-text')
                        }}</span>
                    </v-btn>
                </div>
            </div>
            <div class="w-100 h-100">
                <RelationCanvas
                    ref="relationCanvas"
                    @click-object="clickObject"
                    @click-link="clickLink"
                    @add-link="handleAddLink"
                    @remove-link="handleRemoveLink"
                    @change-link="handleChangeLink"
                    @change-position-object="changePositionObject"
                    :action="action"
                />
            </div>
        </div>
        <SmartObjectSidebarConfig
            :configObject="objectSelected"
            :configLink="linkSelected"
            :typeConfig="typeConfig"
            v-if="typeConfig"
            @change-col-selected="changeColSelected"
            :workflowOptions="listWorkflow"
            :isShowSideBar="isShowSideBarConfig"
            @close-sidebar-config="closeSidebarConfig"
            :action="action"
        />
        <SymperDialogConfirm
            @confirm="confirmDeleteInfo.confirm()"
            @cancel="confirmDeleteInfo.cancel()"
            :title="confirmDeleteInfo.title"
            :content="confirmDeleteInfo.content"
            :showDialog="confirmDeleteInfo.show"
        />
    </div>
</template>

<script>
import SmartObjectSidebarConfig from '@/components/smartObject/SmartObjectSidebarConfig.vue';
import SmartObjectSelector from '@/components/smartObject/SmartObjectSelector.vue';
import SmartObjectConfig from 'worker-loader!@/worker/smartObject/SmartObjectConfig.Worker.js';
import { smartObjectApi } from '@/api/smartObject.js';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
import RelationCanvas from '@/components/smartObject/SmartObjCanvas';
import { util } from '@/plugins/util';
export default {
    name: 'SmartObjectConfig',
    components: {
        SmartObjectSidebarConfig,
        SmartObjectSelector,
        SymperDialogConfirm,
        RelationCanvas
    },
    props: {
        action: {
            type: String,
            default: 'create'
        },
        id: {
            default: ''
        }
    },
    data() {
        const self = this;
        return {
            nameEdit: '',
            editName: false,
            editDes: false,
            isLoadingSave: false,
            smartObjectConfig: {
                generalInfo: {
                    name: '',
                    description: ''
                },
                listObject: {},
                listLink: {}
            },
            headerActions: {
                zoomIn: {
                    icon: 'mdi-minus-circle-outline',
                    text: 'process.header_bar.zoom_in'
                },
                zoomOut: {
                    icon: 'mdi-plus-circle-outline',
                    text: 'process.header_bar.zoom_out'
                },
                zoomToFit: {
                    icon: 'mdi-image-filter-center-focus',
                    text: 'process.header_bar.focus'
                }
            },
            listObject: [],
            listWorkflow: [],
            confirmDeleteInfo: {
                title: this.$t('common.exit_confirm_title'),
                content: this.$t('common.exit_confirm_content'),
                cancel() {},
                confirm() {},
                show: false
            },
            isDuplicateName: false,
            objectSelected: null,
            linkSelected: null,
            typeConfig: '',
            isShowSideBarConfig: false,
            listObjectSelected: [], // lưu trữ các object đã được chọn khi edit/update
            isFinishRestore: false,
            idLinkSelected: '' // mục đích đóng sidebar đang config link khi thực hiện action delete link
        };
    },
    methods: {
        hideName() {
            if (this.action != 'view') {
                this.editName = true;
            }
        },
        hideDes() {
            if (this.action != 'view') {
                this.editDes = true;
            }
        },
        handleKeyDown(event) {
            this.isDuplicateName = false;
            const self = this;
            if (event.key == 'Enter') {
                self.editName = false;
                self.editDes = false;
            }
        },
        handleClickOutSide() {
            const self = this;
            this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
                if (
                    !$(evt.target).closest('.v-input').length &&
                    !$(evt.target).closest('.value-input')
                ) {
                    self.editName = false;
                    self.editDes = false;
                }
            });
        },
        handleHeaderAction(action) {
            if (action == 'zoomIn') {
                this.$refs.relationCanvas.zoomIn();
            } else if (action == 'zoomOut') {
                this.$refs.relationCanvas.zoomOut();
            } else {
                this.$refs.relationCanvas.focus();
            }
        },
        async searchObject(keySearch) {
            let data = {
                page: 1,
                pageSize: 50
            };
            if (keySearch) {
                data.search = keySearch;
            }
            let res = await runBySymperPromiseWorker(
                this.worker,
                'searchObject',
                data
            );
            this.listObject = res;
        },
        async getObjectById(listIdObject) {
            let data = {
                page: 1,
                pageSize: 50,
                filter: [
                    {
                        column: 'id',
                        operation: 'and',
                        conditions: [
                            {
                                name: 'in',
                                value: listIdObject
                            }
                        ]
                    }
                ]
            };
            let res = await runBySymperPromiseWorker(
                this.worker,
                'searchObject',
                data
            );
            this.listObjectSelected = res;
            this.$refs.smartObjectSelector.setObjectSelected(res);
        },
        async selectObject(object) {
            if (
                (this.action != 'create' && this.isFinishRestore) ||
                this.action == 'create'
            ) {
                // chặn action select lại object khi restore
                if (object.type == 'orgchart') {
                    // get all data in orgchart
                    let listCol = [
                        {
                            id: 'id',
                            name: 'id',
                            type: 'number',
                            title: 'ID'
                        },
                        {
                            id: 'type',
                            name: 'type',
                            type: 'text',
                            title: this.$t('v2.smartObject.type')
                        },
                        {
                            id: 'user_id',
                            name: 'user_id',
                            type: 'number',
                            title: this.$t('v2.smartObject.userId')
                        },
                        {
                            id: 'role_id',
                            name: 'role_id',
                            type: 'number',
                            title: this.$t('v2.smartObject.roleId')
                        },
                        {
                            id: 'dpm_id',
                            name: 'dpm_id',
                            type: 'number',
                            title: this.$t('v2.smartObject.dpmId')
                        },
                        {
                            id: 'user_name',
                            name: 'user_name',
                            type: 'text',
                            title: this.$t('v2.smartObject.userName')
                        },
                        {
                            id: 'role_name',
                            name: 'role_name',
                            type: 'text',
                            title: this.$t('v2.smartObject.roleName')
                        },
                        {
                            id: 'dpm_name',
                            name: 'dpm_name',
                            type: 'text',
                            title: this.$t('v2.smartObject.dpmName')
                        },
                        {
                            id: 'dpm_code',
                            name: 'dpm_code',
                            type: 'text',
                            title: this.$t('v2.smartObject.dpmCode')
                        },
                        {
                            id: 'role_code',
                            name: 'role_code',
                            type: 'text',
                            title: this.$t('v2.smartObject.roleCode')
                        },
                        {
                            id: 'parent_id',
                            name: 'parent_id',
                            type: 'text',
                            title: this.$t('v2.smartObject.parentId')
                        },
                        {
                            id: 'parent_name',
                            name: 'parent_name',
                            type: 'text',
                            title: this.$t('v2.smartObject.parentName')
                        },
                        {
                            id: 'org_id',
                            name: 'org_id',
                            type: 'text',
                            title: this.$t('v2.smartObject.orgId')
                        }
                    ];
                    let obj = {
                        idObject: object.id,
                        nameObject: object.name,
                        titleObject: object.title,
                        type: 'orgchart',
                        config: {
                            displayInfor: {
                                listColSelected: []
                            }
                        }
                    };
                    let vizId = util.str.createUUID();
                    // custom object cho canvas render
                    let objectToRenderInCanvas = {};
                    objectToRenderInCanvas[vizId] = obj;
                    // console.log(objectToRenderInCanvas);
                    this.$refs.relationCanvas.addObjectToPaper(
                        objectToRenderInCanvas
                    );
                    obj.config.displayInfor.allColumn = listCol;
                    this.smartObjectConfig.listObject[vizId] = obj;
                } else {
                    // là document
                    // get all control in object
                    let listControl = await this.getAllControlInDoc(object.id);
                    let obj = {
                        idObject: object.id,
                        nameObject: object.name,
                        titleObject: object.title,
                        type: 'document',
                        config: {
                            displayInfor: {
                                listColSelected: []
                            }
                        }
                    };
                    let vizId = util.str.createUUID();
                    // custom object cho canvas render
                    let objectToRenderInCanvas = {};
                    objectToRenderInCanvas[vizId] = obj;
                    this.$refs.relationCanvas.addObjectToPaper(
                        objectToRenderInCanvas
                    );
                    obj.config.displayInfor.allColumn = listControl;
                    obj.action = [];
                    this.smartObjectConfig.listObject[vizId] = obj;
                }
            }
        },
        unselectObject(object) {
            for (let obj in this.smartObjectConfig.listObject) {
                if (
                    this.smartObjectConfig.listObject[obj].idObject == object.id
                ) {
                    delete this.smartObjectConfig.listObject[obj];
                    this.$refs.relationCanvas.deleteObject(obj);
                    if (
                        this.isShowSideBarConfig &&
                        this.objectSelected.idObject == object.id
                    ) {
                        this.isShowSideBarConfig = false;
                    }
                }
            }
        },
        clickObject(idObject) {
            this.isShowSideBarConfig = true;
            this.typeConfig = 'objectConfig';
            this.objectSelected = this.smartObjectConfig.listObject[idObject];
        },
        clickLink(idLink) {
            this.isShowSideBarConfig = true;
            this.typeConfig = 'linkConfig';
            this.linkSelected = this.smartObjectConfig.listLink[idLink];
            this.idLinkSelected = idLink;
        },
        handleAddLink(link) {
            let dataLink = {
                idColSource: link.idColSource,
                idColTarget: link.idColTarget
            };
            for (let obj in this.smartObjectConfig.listObject) {
                if (
                    this.smartObjectConfig.listObject[obj].idObject ==
                    link.idObjectSource
                ) {
                    dataLink.idObjectSource =
                        this.smartObjectConfig.listObject[obj].idObject;
                    dataLink.nameObjectSource =
                        this.smartObjectConfig.listObject[obj].nameObject;
                    dataLink.titleObjectSource =
                        this.smartObjectConfig.listObject[obj].titleObject;
                    dataLink.allColumnSource =
                        this.smartObjectConfig.listObject[
                            obj
                        ].config.displayInfor.allColumn;
                }
                if (
                    this.smartObjectConfig.listObject[obj].idObject ==
                    link.idObjectTarget
                ) {
                    dataLink.idObjectTarget =
                        this.smartObjectConfig.listObject[obj].idObject;
                    dataLink.nameObjectTarget =
                        this.smartObjectConfig.listObject[obj].nameObject;
                    dataLink.titleObjectTarget =
                        this.smartObjectConfig.listObject[obj].titleObject;
                    dataLink.allColumnTarget =
                        this.smartObjectConfig.listObject[
                            obj
                        ].config.displayInfor.allColumn;
                }
            }
            dataLink.config = {
                configSourceToTarget: {
                    name: {
                        title: this.$t('v2.smartObject.linkName'),
                        placeholder: this.$t('v2.smartObject.enterLinkName'),
                        type: 'text',
                        value: dataLink.titleObjectTarget,
                        validateStatus: {},
                        validate() {}
                    },
                    description: {
                        title: this.$t('common.description'),
                        placeholder: this.$t('v2.acessControl.enterDescription'),
                        type: 'textarea',
                        value: '',
                        validateStatus: {},
                        validate() {}
                    }
                },
                configTargetToSource: {
                    name: {
                        title: this.$t('v2.smartObject.linkName'),
                        placeholder: this.$t('v2.smartObject.enterLinkName'),
                        type: 'text',
                        value: dataLink.titleObjectSource,
                        validateStatus: {},
                        validate() {}
                    },
                    description: {
                        title: this.$t('common.description'),
                        placeholder: this.$t('v2.acessControl.enterDescription'),
                        type: 'textarea',
                        value: '',
                        validateStatus: {},
                        validate() {}
                    }
                },
                structure: {
                    condition: [
                        {
                            children: [],
                            condition: true,
                            id: 'root',
                            label: 'AND',
                            name: 'AND',
                            nodeType: 'group',
                            parent: false,
                            root: true
                        }
                    ]
                },
                isViewSourceToTarget : true,
                isViewTargetToSource : true 
            };
            this.smartObjectConfig.listLink[link.id] = dataLink;
        },
        handleChangeLink(data) {
            for (let link in this.smartObjectConfig.listLink) {
                if (link == data.linkId) {
                    if (data.newObjTargetId) {
                        this.smartObjectConfig.listLink[link].idColTarget =
                            data.newColTargetID;
                        if (data.newObjTargetId != data.oldObjTargetId) {
                            let newObject = this.mapIdObjectToDataObject(
                                data.newObjTargetId
                            );
                            this.smartObjectConfig.listLink[
                                link
                            ].idObjectTarget = data.newObjTargetId;
                            this.smartObjectConfig.listLink[
                                link
                            ].nameObjectTarget = newObject.nameObject;
                            this.smartObjectConfig.listLink[
                                link
                            ].titleObjectTarget = newObject.titleObject;
                            this.smartObjectConfig.listLink[
                                link
                            ].allColumnTarget =
                                newObject.config.displayInfor.allColumn;
                            // reset điều kiện config link
                            this.smartObjectConfig.listLink[
                                link
                            ].config.structure = {
                                condition: [
                                    {
                                        children: [],
                                        condition: true,
                                        id: 'root',
                                        label: 'AND',
                                        name: 'AND',
                                        nodeType: 'group',
                                        parent: false,
                                        root: true
                                    }
                                ]
                            };
                        }
                    } else if (data.newObjSourceId) {
                        this.smartObjectConfig.listLink[link].idColSource =
                            data.newColSourceID;
                        if (data.newObjSourceId != data.oldObjSourceId) {
                            let newObject = this.mapIdObjectToDataObject(
                                data.newObjSourceId
                            );
                            this.smartObjectConfig.listLink[
                                link
                            ].idObjectSource = data.newObjSourceId;
                            this.smartObjectConfig.listLink[
                                link
                            ].nameObjectSource = newObject.nameObject;
                            this.smartObjectConfig.listLink[
                                link
                            ].titleObjectSource = newObject.titleObject;
                            this.smartObjectConfig.listLink[
                                link
                            ].allColumnTarget =
                                newObject.config.displayInfor.allColumn;
                            // reset điều kiện config link
                            this.smartObjectConfig.listLink[
                                link
                            ].config.structure = {
                                condition: [
                                    {
                                        children: [],
                                        condition: true,
                                        id: 'root',
                                        label: 'AND',
                                        name: 'AND',
                                        nodeType: 'group',
                                        parent: false,
                                        root: true
                                    }
                                ]
                            };
                        }
                    }
                }
            }
        },
        mapIdObjectToDataObject(idObject) {
            for (let object in this.smartObjectConfig.listObject) {
                if (
                    this.smartObjectConfig.listObject[object].idObject ==
                    idObject
                ) {
                    return this.smartObjectConfig.listObject[object];
                }
            }
        },
        changePositionObject(data) {
            for (let object in this.smartObjectConfig.listObject) {
                if (object == data.idObject) {
                    this.smartObjectConfig.listObject[object].config.position =
                        data.position;
                }
            }
        },
        changeColSelected(data) {
            var newObject = {
                object: {},
                listLinkConnectToObject: []
            };
            for (let object in this.smartObjectConfig.listObject) {
                if (
                    this.smartObjectConfig.listObject[object].idObject ==
                    data.idObject
                ) {
                    newObject.object[object] = data;
                }
            }
            let listLinkConnectToObject = [];
            for (let link in this.smartObjectConfig.listLink) {
                if (
                    this.smartObjectConfig.listLink[link].idObjectSource ==
                        data.idObject ||
                    this.smartObjectConfig.listLink[link].idObjectTarget ==
                        data.idObject
                ) {
                    listLinkConnectToObject.push(link);
                }
            }
            newObject.listLinkConnectToObject = listLinkConnectToObject;
            this.$refs.relationCanvas.changeObject(newObject);
        },
        closeSidebarConfig() {
            this.isShowSideBarConfig = false;
        },
        handleRemoveLink(idLink) {
            delete this.smartObjectConfig.listLink[idLink];
            if (this.isShowSideBarConfig && this.idLinkSelected == idLink) {
                this.isShowSideBarConfig = false;
            }
        },
        // lấy tất cả control trong doc
        async getAllControlInDoc(documentId) {
            let res = await runBySymperPromiseWorker(
                this.worker,
                'getAllControlInDoc',
                documentId
            );
            return res;
        },
        // lấy tất cả quy trình
        getAllWorflow() {
            let res = runBySymperPromiseWorker(this.worker, 'getAllWorflow');
            return res;
        },
        exit() {
            this.confirmDeleteInfo.show = true;
            this.confirmDeleteInfo.confirm = () => {
                this.confirmDeleteInfo.show = false;
                this.$goToPage('/smart-object/');
            };
            this.confirmDeleteInfo.cancel = () => {
                this.confirmDeleteInfo.show = false;
            };
        },
        close() {
            this.$goToPage('/smart-object/');
        },
        async checkValidate() {
            this.isLoadingSave = true;
            let err = false;
            let self = this;
            for (let link in self.smartObjectConfig.listLink) {
                if (
                    self.smartObjectConfig.listLink[
                        link
                    ].config.configSourceToTarget.name.value.trim() == '' ||
                    self.smartObjectConfig.listLink[
                        link
                    ].config.configTargetToSource.name.value.trim() == ''
                ) {
                    self.showWarning(
                        self.$t('smartObject.error.notEmptyLinkName'),
                        function () {
                            self.clickLink(link);
                        }
                    );
                    err = true;
                }
            }
            if (err) {
                self.isLoadingSave = false;
                return;
            }
            for (let object in self.smartObjectConfig.listObject) {
                if (
                    self.smartObjectConfig.listObject[object].type.trim() ==
                    'document'
                ) {
                    for (let action of self.smartObjectConfig.listObject[object]
                        .action) {
                        if (action.name.trim() == '') {
                            self.$snotifyError(
                                'error',
                                self.$t(
                                    'smartObject.error.notEmptyActionName'
                                ) +
                                    self.smartObjectConfig.listObject[object]
                                        .titleObject
                            );
                            err = true;
                            self.isLoadingSave = false;
                            return;
                        } else if (
                            action.value.type.value == 'workflow' &&
                            action.value.workflow.value.trim() == ''
                        ) {
                            self.$snotifyError(
                                'error',
                                self.$t('smartObject.error.notEmptyWorkflow') +
                                    self.smartObjectConfig.listObject[object]
                                        .titleObject
                            );
                            err = true;
                            self.isLoadingSave = false;
                            return;
                        }
                    }
                }
            }
            if (self.smartObjectConfig.generalInfo.name.trim() == '') {
                self.$snotifyError(
                    'error',
                    self.$t('smartObject.error.notEmtyName')
                );
                err = true;
                self.isLoadingSave = false;
                return;
            }
            if (self.smartObjectConfig.generalInfo.name.length > 20) {
                self.$snotifyError(
                    'error',
                    self.$t('smartObject.error.name_max_20')
                );
                err = true;
                self.isLoadingSave = false;
                return;
            }
            if (
                /^[a-z_$][a-z_$0-9]*$/.test(
                    self.smartObjectConfig.generalInfo.name
                ) == false
            ) {
                self.$snotifyError(
                    'error',
                    self.$t('smartObject.error.invalidName')
                );
                err = true;
                self.isLoadingSave = false;
                return;
            }
            if (self.smartObjectConfig.generalInfo.description.length > 120) {
                self.$snotifyError(
                    'error',
                    self.$t('smartObject.error.description_max_120')
                );
                err = true;
                self.isLoadingSave = false;
                return;
            }
            // check trùng tên
            let isExistName = await runBySymperPromiseWorker(
                self.worker,
                'checkExistName',
                self.smartObjectConfig.generalInfo.name
            );
            if (isExistName != false) {
                if (self.action == 'edit') {
                    if (
                        self.nameEdit != self.smartObjectConfig.generalInfo.name
                    ) {
                        err = true;
                        self.isDuplicateName = true;
                        self.$snotify({
                            type: 'error',
                            title: self.$t(
                                'smartObject.error.duplicate_name_title'
                            ),
                            text: self.$t(
                                'smartObject.error.duplicate_name_text'
                            )
                        });
                        self.isLoadingSave = false;
                        return;
                    }
                } else {
                    err = true;
                    self.isDuplicateName = true;
                    self.$snotify({
                        type: 'error',
                        title: self.$t(
                            'smartObject.error.duplicate_name_title'
                        ),
                        text: self.$t('smartObject.error.duplicate_name_text')
                    });
                    self.isLoadingSave = false;
                    return;
                }
            }
            return err;
        },
        async save() {
            let self = this;
            let err = await self.checkValidate();
            if (err == false) {
                let data = {};
                data.name = self.smartObjectConfig.generalInfo.name.trim();
                data.description =
                    self.smartObjectConfig.generalInfo.description;
                let listLink = [];
                for (let link in self.smartObjectConfig.listLink) {
                    listLink.push({
                        idObjectSource:
                            self.smartObjectConfig.listLink[link]
                                .idObjectSource,
                        idObjectTarget:
                            self.smartObjectConfig.listLink[link]
                                .idObjectTarget,
                        idColSource:
                            self.smartObjectConfig.listLink[link].idColSource,
                        idColTarget:
                            self.smartObjectConfig.listLink[link].idColTarget,
                        config: JSON.stringify(
                            self.smartObjectConfig.listLink[link].config
                        )
                    });
                }
                data.links = JSON.stringify(listLink);

                let listObject = [];
                for (let object in self.smartObjectConfig.listObject) {
                    if (
                        self.smartObjectConfig.listObject[object].type.trim() ==
                        'document'
                    ) {
                        let listAction = [];
                        for (let action of self.smartObjectConfig.listObject[
                            object
                        ].action) {
                            if (action.value.type.value == 'formula') {
                                listAction.push({
                                    name: action.name,
                                    value: {
                                        value: action.value.formula.value,
                                        type: action.value.type.value
                                    }
                                });
                            } else {
                                listAction.push({
                                    name: action.name,
                                    value: {
                                        value: action.value.workflow.value,
                                        type: action.value.type.value
                                    }
                                });
                            }
                        }
                        listObject.push({
                            idObject:
                                self.smartObjectConfig.listObject[object]
                                    .idObject,
                            type: self.smartObjectConfig.listObject[object]
                                .type,
                            action: JSON.stringify(listAction),
                            config: JSON.stringify(
                                self.smartObjectConfig.listObject[object].config
                            )
                        });
                    } // là orgchart
                    else
                        listObject.push({
                            idObject:
                                self.smartObjectConfig.listObject[object]
                                    .idObject,
                            type: self.smartObjectConfig.listObject[object]
                                .type,
                            action: '',
                            config: JSON.stringify(
                                self.smartObjectConfig.listObject[object].config
                            )
                        });
                }
                data.objects = JSON.stringify(listObject);

                if (self.action == 'create') {
                    smartObjectApi.createSmartObject(data).then((res) => {
                        if (res.status == 200) {
                            self.isLoadingSave = false;
                            self.$snotify({
                                type: 'success',
                                title: self.$t(
                                    'smartObject.notify.save-success'
                                )
                            });
                            self.$goToPage('/smart-object/');
                        } else {
                            console.log('error');
                        }
                    });
                } else if (self.action == 'edit') {
                    smartObjectApi
                        .updateSmartObject(self.id, data)
                        .then((res) => {});
                    self.$snotify({
                        type: 'success',
                        title: self.$t('smartObject.notify.save-success')
                    });
                    self.$goToPage('/smart-object/');
                }
            }
        },
        edit() {
            this.$goToPage('/smart-object/' + this.id + '/edit');
        },
        customDataObject() {
            for (let object in this.smartObjectConfig.listObject) {
                for (let objectSelected of this.listObjectSelected) {
                    if (
                        objectSelected.id ==
                        this.smartObjectConfig.listObject[object].idObject
                    ) {
                        this.smartObjectConfig.listObject[object].nameObject =
                            objectSelected.name;
                        this.smartObjectConfig.listObject[object].titleObject =
                            objectSelected.title;
                    }
                }
            }
        },
        customDataToRenderInCanvas() {
            let listObject = {};
            for (let object in this.smartObjectConfig.listObject) {
                let obj = {
                    idObject:
                        this.smartObjectConfig.listObject[object].idObject,
                    nameObject:
                        this.smartObjectConfig.listObject[object].nameObject,
                    titleObject:
                        this.smartObjectConfig.listObject[object].titleObject,
                    type: this.smartObjectConfig.listObject[object].type,
                    config: {
                        displayInfor: {
                            listColSelected:
                                this.smartObjectConfig.listObject[object].config
                                    .displayInfor.listColSelected
                        },
                        position:
                            this.smartObjectConfig.listObject[object].config
                                .position
                    }
                };
                listObject[object] = obj;
            }

            let listLink = {};
            for (let link in this.smartObjectConfig.listLink) {
                let linkRender = {
                    idObjectSource:
                        this.smartObjectConfig.listLink[link].idObjectSource,
                    idObjectTarget:
                        this.smartObjectConfig.listLink[link].idObjectTarget,
                    idColSource:
                        this.smartObjectConfig.listLink[link].idColSource,
                    idColTarget:
                        this.smartObjectConfig.listLink[link].idColTarget
                };
                listLink[link] = linkRender;
            }
            this.$refs.relationCanvas.render(listObject, listLink);
        },
        async restoreSmartObjectConfig(id) {
            let self = this;
            let dataSMO = await runBySymperPromiseWorker(
                this.worker,
                'restoreSmartObjectConfig',
                { id: id, listWorkflow: self.listWorkflow }
            );
            self.nameEdit = dataSMO.nameEdit;
            self.smartObjectConfig.generalInfo.name = dataSMO.nameSmartObject;
            self.smartObjectConfig.generalInfo.description =
                dataSMO.desSmartObject;
            self.smartObjectConfig.listObject = util.cloneDeep(
                dataSMO.listObject
            );

            await self.restoreListObjectSelected();
            self.customDataObject(); // xử lý map các thông tin cần thiết của object vào data
            self.restoreLinkConfig(dataSMO.links);

            self.customDataToRenderInCanvas();
            self.isFinishRestore = true;
        },
        restoreLinkConfig(links) {
            let self = this;
            let listLink = links;
            for (let link in listLink) {
                // mapping lại data của control điều kiện
                let dataLink = {
                    idObjectSource: listLink[link].idObjectSource,
                    idObjectTarget: listLink[link].idObjectTarget,
                    idColSource: listLink[link].idColSource,
                    idColTarget: listLink[link].idColTarget,
                    config: JSON.parse(listLink[link].config)
                };
                // lấy ra các thông tin của object gắn với link
                for (let obj in self.smartObjectConfig.listObject) {
                    if (
                        self.smartObjectConfig.listObject[obj].idObject ==
                        listLink[link].idObjectSource
                    ) {
                        dataLink.nameObjectSource =
                            self.smartObjectConfig.listObject[obj].nameObject;
                        dataLink.titleObjectSource =
                            self.smartObjectConfig.listObject[obj].titleObject;
                        dataLink.allColumnSource =
                            self.smartObjectConfig.listObject[
                                obj
                            ].config.displayInfor.allColumn;
                    }
                    if (
                        self.smartObjectConfig.listObject[obj].idObject ==
                        listLink[link].idObjectTarget
                    ) {
                        dataLink.nameObjectTarget =
                            self.smartObjectConfig.listObject[obj].nameObject;
                        dataLink.titleObjectTarget =
                            self.smartObjectConfig.listObject[obj].titleObject;
                        dataLink.allColumnTarget =
                            self.smartObjectConfig.listObject[
                                obj
                            ].config.displayInfor.allColumn;
                    }
                }
                // check cột nối link còn tồn tại hay không

                let mapIdControlToDataControlSource = {};
                for (
                    let index = 0;
                    index < dataLink.allColumnSource.length;
                    index++
                ) {
                    const element = dataLink.allColumnSource[index];
                    mapIdControlToDataControlSource[element.id] = element;
                }

                let mapIdControlToDataControlTarget = {};
                for (
                    let index = 0;
                    index < dataLink.allColumnTarget.length;
                    index++
                ) {
                    const element = dataLink.allColumnTarget[index];
                    mapIdControlToDataControlTarget[element.id] = element;
                }
                if (
                    mapIdControlToDataControlSource[
                        listLink[link].idColSource
                    ] &&
                    mapIdControlToDataControlTarget[listLink[link].idColTarget]
                ) {
                    // check các control cấu hình điều kiện treesql còn tồn tại hay không
                    self.mapDataControlInTreeSql(
                        dataLink.config.structure.condition[0],
                        mapIdControlToDataControlSource,
                        mapIdControlToDataControlTarget
                    );
                    self.smartObjectConfig.listLink[listLink[link].id] =
                        dataLink;
                }
            }
        },
        mapDataControlInTreeSql(
            node,
            mapIdControlToDataControlSource,
            mapIdControlToDataControlTarget
        ) {
            if (!node.condition && node.column && node.columnRight) {
                if (node.column.id) {
                    node.column =
                        mapIdControlToDataControlSource[node.column.id];
                }
                if (node.columnRight.id) {
                    node.columnRight =
                        mapIdControlToDataControlTarget[node.columnRight.id];
                }
            } else if (node.condition) {
                for (let childNode of node.children) {
                    this.mapDataControlInTreeSql(
                        childNode,
                        mapIdControlToDataControlSource,
                        mapIdControlToDataControlTarget
                    );
                }
            }
        },
        async restoreListObjectSelected() {
            let listObjectSelected = [];
            for (let object in this.smartObjectConfig.listObject) {
                listObjectSelected.push(
                    this.smartObjectConfig.listObject[object].idObject
                );
            }
            await this.getObjectById(listObjectSelected);
        },
        showWarning(title, resolveAction) {
            this.$snotify({
                type: 'warn',
                tex: '',
                duration: 100000,
                position: 'top left',
                title: title,
                actionBtns: [
                    {
                        text: 'Resolve',
                        icon: 'mdi-send-check',
                        action: (close) => {
                            resolveAction();
                            close();
                        }
                    }
                ]
            });
        }
    },
    computed: {},
    watch: {},
    async created() {
        this.worker = new SmartObjectConfig();
        let res = await this.getAllWorflow();
        this.listWorkflow = res;
        if (this.action != 'create') {
            this.restoreSmartObjectConfig(this.id);
        }
        if (this.action == 'view') {
            this.$refs.relationCanvas.disableCanvas();
        }
        this.handleClickOutSide();
        this.searchObject();
    }
};
</script>

<style scoped>
.smart-object-config {
    margin: 12px 12px 0px 12px;
}
.smart-object-general-infor .text-field {
    padding-top: 4px !important;
}
.smart-object-general-infor .text-field >>> .v-input__slot {
    margin-bottom: 0px !important;
}
.smart-object-config .object-selector {
    width: 196px;
    margin-right: 8px;
}
.smart-object-config .smart-object-general-infor {
    line-height: 32px;
}
.smart-object-config .smart-object-general-infor >>> .v-label {
    font-size: 13px;
    top: -2px;
}
.smart-object-config .smart-object-general-infor >>> .v-text-field__slot input {
    padding: 0px 0px 4px 0px;
    height: 17px;
}
.error-name-smart-object >>> input {
    color: red;
}
</style>
