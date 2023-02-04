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
                        <img v-if="avatarUrl != ''" :src="avatarUrl" />
                        <img
                            v-if="avatarUrl == ''"
                            :src="
                                require('./../../../assets/image/avatar_default.jpg')
                            "
                        />
                    </v-avatar>
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
                style="margin-bottom: -15px"
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
            <v-row class="pt-0" style="margin-bottom: -10px">
                <v-col class="fs-13 col-md-5" style="margin-top: 5px"
                    >{{$t('v2.noti.generatedModule')}}</v-col
                >
                <v-col class="col-md-7">
                    <v-autocomplete
                        outlined
                        return-object
                        item-value="value"
                        item-text="name"
                        class="sym-small-size"
                        :items="listModuleObj"
                        v-model="objectType"
                        dense
                        clearable
                        :label="$t('v2.noti.select')"
                    >
                    </v-autocomplete>
                </v-col>
            </v-row>
            <v-row class="pt-0" style="margin-bottom: -10px">
                <v-col class="fs-13 col-md-5" style="margin-top: 5px"
                    >{{$t('v2.noti.generatedModule')}}</v-col
                >
                <v-col class="col-md-7">
                    <v-autocomplete
                        outlined
                        class="sym-small-size"
                        clearable
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
            <v-row class="pt-0" style="margin-bottom: -10px">
                <v-col class="fs-13 col-md-5" style="margin-top: 5px"
                    >{{$t('v2.noti.objectReceiveNoti')}}</v-col
                >
                <v-col class="col-md-7">
                    <v-autocomplete
                        class="sym-small-size"
                        dense
                        outlined
                        clearable
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
                        outlined
                        clearable
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
            <v-row class="pt-0" style="margin-bottom: -35px">
                <v-col class="fs-13 col-md-5">{{$t('v2.noti.notiContent')}}</v-col>
                <v-col class="fs-13 col-md-2 ml-15"> {{$t('v2.noti.parameter')}} </v-col>
            </v-row>
            <v-row class="col-12" style="margin-bottom: -35px">
                <draggable
                    :list="list2"
                    group="des"
                    @change="log"
                    style="height: 180px !important"
                    handle=".handle"
                >
                    <v-textarea
                        :rows="5"
                        type="text"
                        style="width: 250px"
                        v-model="description"
                    />
                </draggable>
                <div class="col-md-4 ml-8">
                    <div
                        class="mt-1 mt-1"
                        style="
                            border: 1px solid grey;
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
                                class="list-group-item"
                                color="primary"
                                v-for="element in parameter"
                                :key="element.value"
                            >
                                {{ element.text }}
                            </v-chip>
                        </draggable>
                    </div>
                </div>
            </v-row>
            <div class="col-12">
                <v-row class="pt-0" style="margin-bottom: -25px">
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
        </div>
        <div v-else>
            <ViewBaConfig :detail="detailNotification"></ViewBaConfig>
        </div>
    </div>
</template>
<script>
import ViewBaConfig from './../../../components/notification/setting/viewBaConfig';
import draggable from 'vuedraggable';
import iconPicker from '../../../components/common/iconPicker';
import { util } from '../../../plugins/util';
import UploadFile from './../../../components/common/UploadFile';
import { userApi } from './../../../api/user';
import notification from './../../../api/settingNotification';
export default {
    props: ['type'],
    watch: {
        objectType() {
            //  this.refreshSelected();
            //   this.getSource(this.objectType.value);
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
    },
    data() {
        return {
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
            avatarFileName: '',
            allListObj: {},
            listModule: [],
            listModuleObj: [],
            objectType: 'account',
            listAction: [],
            action: { value: '', text: '' },
            listReceiver: [],
            listActionClickNotifi: [],
            receiver: { value: '', text: '' },
            actionClickNotifi: { value: '', text: '' },
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
        viewNotificationInfo(des) {
            //  this.detailNotification.avatarUrl='123';
            this.detailNotification.icon = des.icon;
            this.detailNotification.objectType = des.objectType;
            this.detailNotification.content = des.content;
            this.detailNotification.action = des.event;
            this.detailNotification.receiver = des.defaultUser;
            this.detailNotification.actionClickNotifi = des.icon;
            this.detailNotification.state =
                des.state == 'Theo dõi' ? true : false;
        },
        setNotificationInfo(des) {
            //this.action.value,
            this.state = des.state == 'Theo dõi' ? true : false;
            // this.objectType.value='Nhân viên';
            //this.objectType.name='account';

            // state:this.state?1:0,

            // objectType:this.objectType,
            // receiver:this.receiver.value,
            // action:this.actionClickNotifi,
        },
        handleAvatarSelected(tempUrl) {
            this.avatarUrl = tempUrl;
            this.avatarFileName =
                'user_avatar_' + util.str.randomString(6) + Date.now();
            this.$refs.uploadAvatar.uploadFile();
        },
        replaceDescription() {
            let description = this.description;
            for (let i = 0; i < this.parameter.length; i++) {
                let oldValue = new RegExp('<' + this.parameter[i].text + '>');
                let newValue = this.parameter[i].value;
                description = description.replace(oldValue, newValue);
            }
            // description = this.description;
            return description;
        },
        getDataUpdate(des) {
            if (this.avatarFileName) {
                this.$refs.uploadAvatar.uploadFile();
            }
            this.state = des.originState;
            this.objectType.value = des.originObjectType;
            this.receiver.value = des.originDefaultUser;
            this.action.value = des.originEvent;
            this.actionClickNotifi = des.action;
            this.iconName.iconName = des.icon;
            this.content = des.content;
            this.updateData = {
                id: des.id,
                event: this.action.value,
                source: this.objectType.value,
                state: this.state ? 1 : 0,
                objectType: this.objectType,
                receiver: this.receiver.value,
                action: this.actionClickNotifi,
                icon: this.iconName.iconName
                    ? 'mdi ' + this.iconName.iconName
                    : this.avatarFileName,
                content: this.replaceDescription(),
            };
        },
        update() {
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
                icon: this.iconName.iconName
                    ? 'mdi ' + this.iconName.iconName
                    : this.avatarFileName,
                content: this.replaceDescription(),
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
            this.state = false;
            this.receiver.value = '';
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
            }
        },
        log: function (evt) {
            this.description += evt.added.element.name;
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
