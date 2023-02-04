<template>
    <div class="ml-4 config-notification choose-picture">
        <div v-if="type != 'view'">
            <div class="mb-3">
                <h4>{{ $t('notificationConfig.setting') }}</h4>
            </div>
            <v-row class="pt-0" style="margin-top: -10px">
                <v-col class="fs-13 col-md-5" style="margin-top: 5px"
                    >{{$t('v2.noti.avatar')}}</v-col
                >
                <v-col class="col-md-7">
                    <v-select
                        outlined
                        class="sym-small-size"
                        :items="typeSelected"
                        v-model="typePictureSelected"
                        dense
                    >
                    </v-select>
                </v-col>
            </v-row>
            <v-row
                class="pt-0"
                v-if="typeSelected[0] == typePictureSelected"
                style="margin-bottom: -20px; margin-top: -10px"
            >
                <v-col class="fs-13 col-md-5" style="margin-top: -5px"
                    >{{$t('v2.noti.picture')}}</v-col
                >
                <v-col class="col-md-7" style="margin-top: -10px">
                    <v-avatar :size="60">
                        <img
                            v-if="avatarUrl == ''"
                            :src="
                                require('./../../../assets/image/avatar_default.jpg')
                            "
                        />
                        <img v-else :src="avatarUrl" />
                    </v-avatar>
                    <!-- <v-icon v-else class="display-3 pt-0">{{iconName.iconName}}</v-icon> -->
                    <UploadFile
                        ref="uploadAvatar"
                        :fileName="avatarFileName"
                        :autoUpload="false"
                        @click="handleAvatarSelected"
                        :iconName="'mdi mdi-plus-circle'"
                        @selected-file="handleAvatarSelected"
                    />
                </v-col>
            </v-row>
            <v-row
                class="pt-0"
                style="margin-bottom: -18px"
                v-if="typeSelected[1] == typePictureSelected"
            >
                <v-col class="fs-13 col-md-5" style="margin-top: -10px"
                    >Icon</v-col
                >
                <v-col class="col-md-6 ml-2" style="margin-top: -10px">
                    <v-icon class="display-3 pt-0">{{
                        iconName.iconName
                    }}</v-icon>
                    <iconPicker
                        style="margin-left: -10px"
                        ref="iconPicker"
                        :icon="'mdi mdi-plus-box'"
                        @selected="pickIcon"
                    ></iconPicker>
                </v-col>
            </v-row>
            <v-row class="pt-0" style="margin-bottom: -18px">
                <v-col class="fs-13 col-md-5" style="margin-top: 5px"
                    >{{$t('v2.noti.generatedModule')}}</v-col
                >
                <v-col class="col-md-7">
                    <v-autocomplete
                        style="border: 1px solid grey; border-radius: 4px"
                        hide-details
                        return-object
                        item-value="value"
                        item-text="name"
                        class="sym-small-size"
                        :items="listModuleObj"
                        v-model="objectType"
                        dense
                        :label="$t('v2.noti.select')"
                    >
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-row class="pt-0" style="margin-bottom: -18px">
                <v-col class="fs-13 col-md-5" style="margin-top: 5px"
                    >{{$t('v2.noti.actionGeneratesNoti')}}</v-col
                >
                <v-col class="col-md-7">
                    <v-autocomplete
                        style="border: 1px solid grey; border-radius: 4px"
                        class="sym-small-size"
                        return-object
                        item-value="value"
                        item-text="text"
                        :items="listAction"
                        v-model="action"
                        dense
                        :label="$t('v2.noti.select')"
                    >
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-row class="pt-0" style="margin-bottom: -18px">
                <v-col class="fs-13 col-md-5" style="margin-top: 5px"
                    >{{$t('v2.noti.objectReceiveNoti')}}</v-col
                >
                <v-col class="col-md-7">
                    <v-autocomplete
                        class="sym-small-size"
                        dense
                        style="border: 1px solid grey; border-radius: 4px"
                        return-object
                        v-model="receiver"
                        :items="listReceiver"
                        item-value="value"
                        item-text="text"
                        :label="$t('v2.noti.select')"
                    >
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-row class="pt-0" style="margin-bottom: -10px">
                <v-col class="fs-13 col-md-5" style="margin-top: 5px"
                    >{{$t('v2.noti.actionWhenClickNoti')}}</v-col
                >
                <v-col class="col-md-7">
                    <v-autocomplete
                        class="sym-small-size"
                        style="border: 1px solid grey; border-radius: 4px"
                        dense
                        item-value="value"
                        item-text="text"
                        v-model="actionClickNotifi"
                        :items="listActionClickNotifi"
                        :label="$t('v2.noti.select')"
                    >
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-row class="pt-0">
                <v-col class="fs-13 col-md-5"> {{$t('v2.noti.notiContent')}} </v-col>
                <v-col class="fs-13 col-md-2 ml-15"> {{$t('v2.noti.parameter')}} </v-col>
            </v-row>
            <v-row class="col-12" style="margin-top: -30px">
                <draggable
                    :list="list2"
                    group="des"
                    @change="log"
                    handle=".handle"
                >
                    <v-textarea
                        :rows="5"
                        type="text"
                        style="width: 250px; font-size: 13px"
                        v-model="description"
                    />
                </draggable>
                <div class="col-md-4">
                    <div
                        class="mt-1 ml-2"
                        style="
                            height: 143px;
                            margin-left: -30px;
                            margin-right: -49px;
                        "
                    >
                        <draggable
                            style="
                                height: 180px !important;
                                border: 1px solid white;
                            "
                            :list="parameter"
                            :group="{ name: 'des', pull: 'clone', put: false }"
                            :clone="cloneValue"
                            @change="log"
                        >
                            <v-chip
                                class="list-group-item mr-1"
                                style="
                                    background-color: #e0e0e0;
                                    font-size: 11px;
                                    border-radius: 4px;
                                    height: 20px;
                                "
                                v-for="element in parameter"
                                :key="element.value"
                            >
                                {{ element.text }}
                            </v-chip>
                        </draggable>
                    </div>
                </div>
            </v-row>

            <!-- <v-row class="pt-0" style="margin-top:-80px">
            <v-col class="fs-13 col-md-5">
                Nội dung label
            </v-col>
            <v-col class="fs-13 col-md-2 ml-15">  
                Tham số
            </v-col>
        </v-row>
         <v-row class="col-12" style="margin-top:-30px" >
           <draggable
              :list="list2"
              group="des"
              @change="log1"
              style="height: 50px!important"
              handle=".handle"
            >
            <v-textarea
                :rows="2" type="text"
                style="width:250px;font-size:13px" v-model="label"
              />
            </draggable>
          <div class="col-md-4" > 
              <div 
                class="mt-1 ml-2" 
                style="height: 143px; margin-left:-30px; margin-right:-49px; ">
                <draggable
                style="height: 180px!important; border:1px solid white"
                  :list="parameter1"
                  :group="{ name: 'des', pull: 'clone', put: false }"
                  :clone="cloneValue"
                  @change="log1"
                >
                  <v-chip class="list-group-item mr-1"   
                    style="background-color:#e0e0e0; font-size: 11px; border-radius: 4px; height: 20px;"
                    v-for="element in parameter1" :key="element.value">
                      {{ element.text }}
                  </v-chip>
              </draggable>
            </div>
          </div>
        </v-row> -->
            <v-row class="pt-0" style="margin-top: -35px">
                <v-col class="fs-13 col-md-5"> {{$t('v2.noti.filterCondition')}} </v-col>
                <v-col class="fs-13 col-md-2 ml-15"> {{$t('v2.noti.parameter')}} </v-col>
            </v-row>
            <v-row class="col-12" style="margin-top: -30px">
                <draggable
                    :list="list2"
                    group="des"
                    @change="log2"
                    handle=".handle"
                >
                    <v-textarea
                        :rows="3"
                        type="text"
                        style="width: 250px; font-size: 13px"
                        v-model="filter"
                    />
                </draggable>
                <div class="col-md-4">
                    <div
                        class="mt-1 ml-2"
                        style="
                            height: 143px;
                            margin-left: -30px;
                            margin-right: -49px;
                        "
                    >
                        <draggable
                            style="
                                height: 180px !important;
                                border: 1px solid white;
                            "
                            :list="parameter"
                            :group="{ name: 'des', pull: 'clone', put: false }"
                            :clone="cloneValue"
                            @change="log2"
                        >
                            <v-chip
                                class="list-group-item mr-1"
                                style="
                                    background-color: #e0e0e0;
                                    font-size: 11px;
                                    border-radius: 4px;
                                    height: 20px;
                                "
                                v-for="element in parameter"
                                :key="element.value"
                            >
                                {{ element.text }}
                            </v-chip>
                        </draggable>
                    </div>
                </div>
            </v-row>
            <v-row class="pt-0" style="margin-top: -80px">
                <v-col class="fs-13 col-md-5" style="margin-top: 5px"
                    >{{$t('v2.noti.status')}}</v-col
                >
                <v-col class="col-md-6">
                    <v-checkbox v-model="state" style="margin-top: 0px">
                    </v-checkbox>
                </v-col>
            </v-row>
            <v-row
                class="mt-5 d-flex justify-end"
                style="margin-top: -20px !important"
            >
                <v-btn text color="green" @click="save()">{{
                    type == 'add' ? $t('v2.doc.save') : $t('v2.noti.update')
                }}</v-btn>
            </v-row>
        </div>
        <div v-else>
            <ViewBaConfig :detail="detailNotification"></ViewBaConfig>
        </div>
    </div>
</template>
<script>
import FormulaEditor from '../../formula/editor/FormulaEditor';
import ViewBaConfig from './../../../components/notification/setting/viewBaConfig';
import draggable from 'vuedraggable';
import iconPicker from '../../../components/common/iconPicker';
import { util } from '../../../plugins/util';
import UploadFile from './../../../components/common/UploadFile';
import { userApi } from './../../../api/user';
import { appConfigs } from '../../../configs';
import notification from './../../../api/settingNotification';
export default {
    props: ['type'],
    watch: {
        action() {
            this.reformatNameReviewer();
        },
        objectType() {
            this.refreshSelected();
            if (this.objectType.value) {
                this.getSource(this.objectType.value);
            } else {
                this.getSource(this.objectType);
            }
        },
    },
    created() {
        this.getNameModule();
    },
    components: {
        UploadFile,
        iconPicker,
        ViewBaConfig,
        draggable,
        FormulaEditor,
    },
    data() {
        return {
            id: 0,
            label: '',
            filter: '',
            listVariable: [],
            detailNotification: {},
            updateData: {},
            list2: [{ name: '', id: 0 }],
            typeSelected: [this.$t('v2.noti.avatarObjectCaused'), this.$t('v2.noti.selectIcon')],
            typePictureSelected: this.$t('v2.noti.avatarObjectCaused'),
            iconName: {
                icon: '',
                iconName: '',
                name: '',
                note: '',
                status: false,
            },
            avatarUrl: '',
            parameter: [],
            parameter1: [
                {
                    text: this.$t('v2.noti.relatedUser'),
                    value: '{userRelatedId}',
                },
                {
                    text: this.$t('v2.noti.relatedModuleName'),
                    value: '{relatedObjectTitle}',
                },
                //  {
                //   text:'Người liên quan',
                //   value:"{userRelatedId}"
                // },
            ],
            avatarFileName: '',
            allListObj: {},
            listModule: [],
            listModuleObj: [],
            objectType: '',
            listAction: [],
            action: '',
            listReceiver: [],
            listActionClickNotifi: [],
            receiver: '',
            actionClickNotifi: '',
            listSource: [],
            state: true,
            avatar: '',
            icon: '',
            dragging: false,
            description: '',
        };
    },
    computed: {},
    methods: {
        reformatNameReviewer() {
            if (this.objectType.value == 'comment') {
                if (this.action.value != 'tag') {
                    this.listReceiver = {
                        value: '{data.userId}',
                        text: this.$t('v2.noti.subject'),
                    };
                } else {
                    this.listReceiver = [
                        {
                            value: '{data.userId}',
                            text: this.$t('v2.noti.subject'),
                        },
                        {
                            value: '{data.tags.objectIdentifier}',
                            text: this.$t('v2.noti.userTagged'),
                        },
                    ];
                }
            }
        },
        // nếu là ảnh trả về false
        checkIcon(icon) {
            let check = true;
            if (icon.indexOf('user_avatar_') > -1) {
                check = false;
            }
            return check;
        },
        setAvaOrIcon(icon) {
            if (icon) {
                if (icon.indexOf('user_avatar_') > -1) {
                    return (
                        appConfigs.apiDomain.fileManagement + 'readFile/' + icon
                    );
                }
            }
        },
        viewNotificationInfo(des) {
            this.detailNotification.icon = des.icon;
            this.detailNotification.objectType = des.objectType;
            this.detailNotification.content = des.content;
            this.detailNotification.action = des.event;
            this.detailNotification.receiver = des.defaultUser;
            this.detailNotification.actionClickNotifi = des.originAction;
            this.detailNotification.filter = des.filter;
            this.detailNotification.state =
                des.state == 'Theo dõi' ? true : false;
        },
        setNotificationInfo(des) {
            this.state = des.state == 'Theo dõi' ? true : false;
        },
        handleAvatarSelected(tempUrl) {
            this.avatarUrl = tempUrl;
            this.avatarFileName =
                'user_avatar_' + util.str.randomString(6) + Date.now();
            this.$refs.uploadAvatar.uploadFile();
        },
        replaceDescription(description) {
            // let description = this.description;
            if (description.indexOf('<Deadline>') > -1) {
                let oldValue = '<Deadline>';
                let newValue = '<*{data.dueDate}*>';
                description = description.replace(oldValue, newValue);
                if (this.type == 'add') {
                }
            } else {
                if (description.indexOf('<*Deadline*>') > -1) {
                    let oldValue = '<*Deadline*>';
                    let newValue = '<*{data.dueDate}*>';
                    description = description.replace(oldValue, newValue);
                }
            }
            for (let i = 0; i < this.parameter.length; i++) {
                let oldValue = new RegExp('<' + this.parameter[i].text + '>');
                let newValue = '<' + this.parameter[i].value + '>';
                description = description.replace(oldValue, newValue);
            }

            return description;
        },
        getDataUpdate(des) {
            this.id = des.id;
            this.state = des.originState;
            this.objectType = des.originObjectType;
            this.receiver = des.originDefaultUser;
            this.filter = des.filter;
            this.action = des.originEvent;
            this.actionClickNotifi = des.action;
            this.iconName.iconName = des.icon;
            this.description = des.content;
            this.avatarUrl =
                appConfigs.apiDomain.fileManagement + 'readFile/' + des.icon;
            if (this.checkIcon(des.icon)) {
                this.typePictureSelected = this.typeSelected[1];
                this.avatarUrl = '';
            } else {
                this.typePictureSelected = this.typeSelected[0];
                this.avatarFileName = des.icon;
                this.iconName.iconName = '';
            }
        },
        update() {
            if (this.avatarFileName) {
                try {
                    this.$refs.uploadAvatar.uploadFile();
                } catch (error) {}
            }
            this.updateData = {
                id: this.id,
                event: this.action.value,
                source: this.objectType.value,
                state: this.state ? 1 : 0,
                objectType: this.objectType.value,
                receiver: this.receiver.value,
                action: this.actionClickNotifi,
                icon:
                    this.typeSelected[1] == this.typePictureSelected
                        ? 'mdi ' + this.iconName.iconName
                        : this.avatarFileName,
                content: this.replaceDescription(this.description),
                filter: this.replaceDescription(this.filter),
            };
            const self = this;
            notification
                .updateChanel(this.updateData.id, this.updateData)
                .then((res) => {
                    if (res.status == 200) {
                        self.$snotify({
                            type: 'success',
                            title: self.$t('v2.noti.updateSuccess'),
                        });
                        self.refreshAll();
                        self.$emit('refreshList');
                    } else {
                        self.$snotify({
                            type: 'error',
                            title: self.$t('v2.noti.updateFailed'),
                        });
                    }
                });
        },
        add() {
            if (this.avatarFileName) {
                this.$refs.uploadAvatar.uploadFile();
            }
            let data = {
                event: this.action.value,
                source: this.objectType.value,
                state: this.state ? 1 : 0,
                objectType: this.objectType,
                receiver: this.receiver.value,
                action: this.actionClickNotifi,
                icon:
                    this.typeSelected[1] == this.typePictureSelected
                        ? 'mdi ' + this.iconName.iconName
                        : this.avatarFileName,
                content: this.replaceDescription(this.description),
                filter: this.replaceDescription(this.filter),
            };
            const self = this;
            notification.addChanel(data).then((res) => {
                if (res.status == 200) {
                    self.$snotify({
                        type: 'success',
                        title: self.$t('v2.noti.addNotiSuccess'),
                    });
                    self.refreshAll();
                    self.$emit('refreshList');
                } else {
                    self.$snotify({
                        type: 'error',
                        title: self.$t('v2.noti.addMessageFailure'),
                    });
                }
            });
        },
        save() {
            if (this.type == 'add') {
                this.add();
            } else {
                this.update();
            }
        },
        pickIcon(data) {
            this.$set(this.iconName, 'iconName', data.icon.trim());
            this.$set(this.iconName, 'iconType', data.type);
        },
        refreshSelected() {
            this.listActionClickNotifi = [];
            this.listAction = [];
            this.listReceiver = [];
        },
        refreshAll() {
            this.objectType = '';
            this.state = true;
            this.receiver = '';
            this.actionClickNotifi = '';
            this.iconName.iconName = '';
            this.avatarUrl = '';
            this.parameter = '';
            this.avatarFileName = '';
            this.description = '';
        },
        getNameModule() {
            const self = this;
            notification.showAllModuleConfig().then((res) => {
                if (res.status == 200) {
                    self.allListObj = res.data;
                    self.listModule = Object.keys(res.data);
                    for (let i = 0; i < self.listModule.length; i++) {
                        self.listModuleObj.push({
                            name: self.$t('objects.' + self.listModule[i]),
                            value: self.listModule[i],
                        });
                    }
                }
            });
        },
        getSource(nameModule) {
            this.listReceiver = [];
            this.listActionClickNotifi = [];
            this.parameter = [];
            //self.listModule = Object.keys(res.data);
            for (
                let i = 0;
                i < this.allListObj[nameModule].receiver.length;
                i++
            ) {
                this.listReceiver.push(this.allListObj[nameModule].receiver[i]);
            }
            for (
                let i = 0;
                i < this.allListObj[nameModule].action.length;
                i++
            ) {
                this.listActionClickNotifi.push(
                    this.allListObj[nameModule].action[i],
                );
            }
            for (let i = 0; i < this.allListObj[nameModule].event.length; i++) {
                this.listAction.push({
                    text: this.allListObj[nameModule].event[i].text,
                    value: this.allListObj[nameModule].event[i].value,
                });
            }
            for (
                let i = 0;
                i < this.allListObj[nameModule].parameter.length;
                i++
            ) {
                this.parameter.push({
                    text: this.allListObj[nameModule].parameter[i].text,
                    value: this.allListObj[nameModule].parameter[i].value,
                });
                // this.listVariable.push({
                //   caption: this.allListObj[nameModule].parameter[i].text,
                //   value: this.allListObj[nameModule].parameter[i].value,
                //   meta: "variable",
                //   docHTML:"123",
                // })
            }
        },
        log: function (evt) {
            this.description += evt.added.element.name;
        },
        log1: function (evt) {
            this.label += evt.added.element.name;
        },
        log2: function (evt) {
            this.filter += evt.added.element.name;
        },
        cloneValue(value) {
            return {
                value: value.value,
                name: `<${value.text}>`,
            };
        },
    },
};
</script>
<style scoped>
.list-group {
    height: 60px;
    text-decoration: none;
}
.button {
    margin-top: 35px;
}
.handle {
    float: left;
    padding-top: 8px;
    padding-bottom: 8px;
}
.close {
    float: right;
    padding-top: 8px;
    padding-bottom: 8px;
}
input {
    display: inline-block;
    width: 50%;
}
.text {
    margin: 20px;
}
.config-notification ::v-deep fieldset {
    height: 35px !important;
}
.config-notification ::v-deep .v-label {
    display: none;
}
.config-notification ::v-deep .v-text-field__slot {
    border: 1px solid grey;
}
.config-notification >>> .symper-upload-file {
    margin-top: -28px;
    margin-left: 12px;
}
.choose-picture ::v-deep .v-select__slot {
    margin-top: -5px !important;
}
</style>
