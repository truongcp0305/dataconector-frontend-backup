<template>
    <div class="w-100 mr-10">
        <v-row class="header ml-3">
            <v-col class="col-md-8 col-sm-8">
                <span class="fs-15 fw-430" v-if="showMain">{{
                    $t('notificationConfig.unfollow')
                }}</span>
                <span class="fs-15 fw-430" v-if="showFollow">{{
                    $t('notificationConfig.list_of_followed_object')
                }}</span>
                <span class="fs-15 fw-430" v-if="showUnfollow">{{
                    $t('notificationConfig.list_of_unfollowed_objects')
                }}</span>
            </v-col>
            <v-col
                class="col-md-4 col-sm-4 d-flex justify-end"
                style="margin-right: -10px"
            >
                <v-text-field
                    v-if="!showMain"
                    solo
                    flat
                    hide-details
                    class="sym-small-size sym-style-input"
                    single-line
                    v-model="search"
                >
                </v-text-field>
                <v-btn
                    @click="isShowMain()"
                    v-if="!showMain"
                    text
                    class="ml-3 fw-400 font-normal color-red"
                >
                    <i class="mdi-24px mdi mdi-home-outline mdi-dark"></i>
                </v-btn>
                <v-btn
                    @click="isShowUnFollow()"
                    v-if="!showUnfollow"
                    text
                    class="fw-400 font-normal color-red"
                >
                    {{ $t('notificationConfig.unfollow') }}
                </v-btn>
                <v-btn
                    @click="isShowFollow()"
                    v-if="!showFollow"
                    text
                    class="fw-400 font-normal color-green"
                >
                    {{ $t('notificationConfig.follow') }}
                </v-btn>
            </v-col>
        </v-row>
        <SettingNotification
            v-if="showMain"
            :type="type"
            :listItems="items"
            :allListChanel="allListChanel"
        />
        <SettingNotification
            v-if="showFollow"
            :allListChanel="allListChanel"
            :type="type"
            :listItems="listSubcribed"
        />
        <SettingNotification
            v-if="showUnfollow"
            :allListChanel="allListChanel"
            :type="type"
            :listItems="listUnsubcribed"
        />
    </div>
</template>
<script>
import _groupBy from 'lodash/groupBy';
import NotificationPopUp from './../../components/notification/DetailPopPup.vue';
import UserPopUp from './../../components/user/UserPopUp';
import notification from './../../api/settingNotification';
import SettingNotification from './../../components/notification/setting/main.vue';
export default {
    watch: {
        search() {
            this.searchList();
        },
    },
    components: {
        SettingNotification,
        UserPopUp,
        NotificationPopUp,
    },
    created() {
        this.getSource();
        this.getAllListChanel();
        //this.getListFollowed();
    },
    data() {
        return {
            type: 'main',
            search: '',
            isSearchSuscribed: false,
            listSubcribed: [],
            showMain: true,
            listUnsubcribed: [],
            listModules: [],
            listSource: [],
            allListChanel: [],
            listNameModules: [],
            showUnfollow: false,
            showFollow: false,
            items: [],
        };
    },
    methods: {
        renameReceiver(nameModule, receiver) {
            let name = receiver;
            for (
                let i = 0;
                i < this.listSource[nameModule].receiver.length;
                i++
            ) {
                if (this.listSource[nameModule].receiver[i].value == receiver) {
                    name = this.listSource[nameModule].receiver[i].text;
                }
            }
            return name;
        },
        searchList() {
            this.listSubcribed = [];
            this.listUnsubcribed = [];
            const self = this;
            if (this.search) {
                let subscribe = this.showFollow ? true : false;
                let dataSend = {
                    subscribed: subscribe,
                    keyword: this.search,
                };
                notification.showListsSubcribed(dataSend).then((res) => {
                    if (res.status == 200) {
                        let format = [];
                        let listModules = res.data;
                        for (let i = 0; i < listModules.length; i++) {
                            if (listModules[i].objectType) {
                                format.push(listModules[i]);
                            }
                        }
                        let formatListModules = _groupBy(format, 'objectType');
                        let name = Object.keys(formatListModules);
                        for (let i = 0; i < name.length; i++) {
                            if (subscribe) {
                                self.listSubcribed.push({
                                    title: name[i],
                                    subTitle: [],
                                    items: [],
                                    icon: name[i],
                                });
                            } else {
                                self.listUnsubcribed.push({
                                    title: name[i],
                                    subTitle: [],
                                    icon: name[i],
                                    items: [],
                                });
                            }
                            for (
                                let j = 0;
                                j < formatListModules[name[i]].length;
                                j++
                            ) {
                                if (subscribe) {
                                    self.listSubcribed[i].items.push({
                                        title: formatListModules[name[i]][j]
                                            .event,
                                        name: self.rename(
                                            name[i],
                                            formatListModules[name[i]][j].event,
                                        ),
                                        id: formatListModules[name[i]][j].id,
                                        active: self.checkSubcribe(
                                            name[i],
                                            formatListModules[name[i]][j].event,
                                        ),
                                    });
                                } else {
                                    self.listUnsubcribed[i].items.push({
                                        title: formatListModules[name[i]][j]
                                            .event,
                                        name: self.rename(
                                            name[i],
                                            formatListModules[name[i]][j].event,
                                        ),
                                        id: formatListModules[name[i]][j].id,
                                        active: self.checkSubcribe(
                                            name[i],
                                            formatListModules[name[i]][j].event,
                                        ),
                                    });
                                }
                                self.items[i].subTitle.pop();
                            }
                        }
                    }
                });
            }
        },
        async getAllListChanel() {
            this.items = [];
            const self = this;
            let res = await notification.showAllLists();
            if (res.status == 200) {
                let format = [];
                let listModules = res.data;
                self.allListChanel = res.data;
                for (let i = 0; i < listModules.length; i++) {
                    if (listModules[i].objectType) {
                        format.push(listModules[i]);
                    }
                }
                let formatListModules = _groupBy(format, 'objectType');
                let name = Object.keys(formatListModules);
                for (let i = 0; i < name.length; i++) {
                    self.items.push({
                        title: name[i],
                        subTitle: [],
                        items: [],
                        // defaultUser:
                        icon: name[i],
                    });
                    let groupByEvent = Object.keys(
                        _groupBy(formatListModules[name[i]], 'event'),
                    );
                    for (let k = 0; k < groupByEvent.length; k++) {
                        self.items[i].items.push({
                            title: groupByEvent[k],
                            name: self.rename(name[i], groupByEvent[k]),
                            active: self.checkSubcribe(
                                name[i],
                                groupByEvent[k],
                            ),
                        });
                    }
                    self.items[i].subTitle.pop();
                }
            }
        },
        checkSubcribe(objectType, event) {
            let check = false;
            for (let i = 0; i < this.allListChanel.length; i++) {
                if (
                    this.allListChanel[i].objectType == objectType &&
                    this.allListChanel[i].event == event &&
                    this.allListChanel[i].userFilterState
                ) {
                    check = true;
                    for (let j = 0; j < this.items.length; j++) {
                        if (this.items[j].title == objectType) {
                            this.items[j].subTitle.push(
                                this.rename(objectType, event),
                            );
                            this.items[j].subTitle.push(',');
                        }
                    }
                }
            }
            return check;
        },
        getSource() {
            const self = this;
            notification.showAllModuleConfig().then((res) => {
                if (res.status == 200) {
                    self.listSource = res.data;
                }
            });
        },
        rename(nameModule, event) {
            let name = event;
            for (let i = 0; i < this.listSource[nameModule].event.length; i++) {
                if (this.listSource[nameModule].event[i].value == event) {
                    name = this.listSource[nameModule].event[i].text;
                }
            }
            return name;
        },

        getListFollowed() {
            this.listSubcribed = [];
            const self = this;
            let isSubcribed = true;
            notification
                .showListsSubcribed({ subscribed: isSubcribed })
                .then((res) => {
                    if (res.status == 200) {
                        let listSubcribed = res.data;
                        // let grouplistByObjId = _groupBy(listSubcribed, 'objectIdentifier');
                        let grouplistByObjId = _groupBy(
                            listSubcribed,
                            'objectType',
                        );
                        let objId = Object.keys(grouplistByObjId);
                        for (let j = 0; j < objId.length; j++) {
                            self.listSubcribed.push({
                                items: [],
                                subTitle: [],
                                title: objId[j],
                                userFilterAt: '',
                                icon:
                                    objId[j].indexOf(':') > 0
                                        ? objId[j].split(':')[0]
                                        : objId[j],
                            });
                            for (
                                let i = 0;
                                i < grouplistByObjId[objId[j]].length;
                                i++
                            ) {
                                self.listSubcribed[j].items.push({
                                    title: grouplistByObjId[objId[j]][i].event,
                                    defaultUser: self.renameReceiver(
                                        objId[j],
                                        grouplistByObjId[objId[j]][i]
                                            .defaultUser,
                                    ),
                                    active: true,
                                    name: self.rename(
                                        objId[j],
                                        grouplistByObjId[objId[j]][i].event,
                                    ),
                                    id: grouplistByObjId[objId[j]][i].id,
                                });
                                self.listSubcribed[j].userFilterAt =
                                    self.getDateFollow(
                                        objId[j],
                                        grouplistByObjId[objId[j]][i].event,
                                        true,
                                    );
                            }
                        }
                    }
                });
        },
        getDateFollow(nameModule, event, isFollow) {
            let date = '';
            for (let i = 0; i < this.allListChanel.length; i++) {
                if (
                    this.allListChanel[i].event == event &&
                    this.allListChanel[i].objectType == nameModule
                ) {
                    if (isFollow) {
                        date = this.$moment(
                            this.allListChanel[i].createAt,
                        ).format('DD/MM/YYYY hh:mm');
                    } else {
                        date = this.$moment(
                            this.allListChanel[i].userFilterAt,
                        ).format('DD/MM/YYYY hh:mm');
                    }
                }
            }
            return date;
        },
        getListUnFollowed() {
            this.listUnsubcribed = [];
            const self = this;
            let isSubcribed = false;
            notification
                .showListsSubcribed({ subscribed: isSubcribed })
                .then((res) => {
                    if (res.status == 200) {
                        let listSubcribed = res.data;
                        let grouplistByObjId = _groupBy(
                            listSubcribed,
                            'objectType',
                        );
                        let objId = Object.keys(grouplistByObjId).filter(
                            (x) => x != '' && x != 'null',
                        );
                        for (let j = 0; j < objId.length; j++) {
                            self.listUnsubcribed.push({
                                items: [],
                                title: objId[j],
                                subTitle: [],
                                userFilterAt: '',
                                icon:
                                    objId[j].indexOf(':') > 0
                                        ? objId[j].split(':')[0]
                                        : objId[j],
                            });
                            for (
                                let i = 0;
                                i < grouplistByObjId[objId[j]].length;
                                i++
                            ) {
                                self.listUnsubcribed[j].items.push({
                                    title: grouplistByObjId[objId[j]][i].event,
                                    name: self.rename(
                                        objId[j],
                                        grouplistByObjId[objId[j]][i].event,
                                    ),
                                    active: false,
                                    defaultUser: self.renameReceiver(
                                        objId[j],
                                        grouplistByObjId[objId[j]][i]
                                            .defaultUser,
                                    ),
                                    id: grouplistByObjId[objId[j]][i].id,
                                });
                                self.listUnsubcribed[j].userFilterAt =
                                    self.getDateFollow(
                                        objId[j],
                                        grouplistByObjId[objId[j]][i].event,
                                        false,
                                    );
                            }
                        }
                    }
                });
        },
        isShowMain() {
            this.type = 'main';
            this.showFollow = false;
            this.showUnfollow = false;
            this.showMain = true;
            this.getAllListChanel();
        },
        isShowUnFollow() {
            this.type = 'unfollow';
            this.showFollow = false;
            this.showUnfollow = true;
            this.showMain = false;
            this.getListUnFollowed();
            this.search = '';
        },
        isShowFollow() {
            this.type = 'follow';
            this.showFollow = true;
            this.showUnfollow = false;
            this.showMain = false;
            this.getListFollowed();
            this.search = '';
        },
    },
};
</script>
<style scoped>
.sym-small-size {
    border: none !important;
    margin-top: 3px;
}
</style>
