<template>
    <v-row style="margin-top: 5px">
        <v-col cols="2">
            <v-row>
                <v-list-item-avatar
                    style="margin-top: -10px"
                    class="mx-2"
                    v-if="!item.icon"
                >
                    <SymperAvatar :userId="item.userRelatedId" />
                </v-list-item-avatar>
                <v-list-item-avatar style="margin-top: -10px" v-else>
                    <SymperAvatar v-if="item.icon == 'default.png'" />
                    <v-avatar v-else>
                        <img
                            v-if="!checkIcon(item.icon)"
                            :src="setAvaOrIcon(item.icon)"
                        />
                        <v-icon v-else>{{ item.icon }}</v-icon>
                    </v-avatar>
                </v-list-item-avatar>
            </v-row>
        </v-col>
        <v-col
            cols="10"
            style="padding: 6px !important"
            @click="openNotification(item)"
        >
            <v-row v-if="item.title.indexOf('<*') > -1" class="mt-s10">
                <v-col style="margin-top: -8px" class="text-ellipsis">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <span
                                v-on="on"
                                style="margin-left: -12px"
                                class="notification-item-title"
                            >
                                {{ reNameContent(item.title) }}
                            </span>
                        </template>
                        <span>{{ reNameContent(item.title) }}</span>
                    </v-tooltip>
                </v-col>
                <v-col style="margin-top: -8px" class="text-right pr-3">
                    <v-chip
                        v-if="
                            getDeadline(item.title) != 'Invalid date' &&
                            getDeadline(item.title)
                        "
                        class="notification-item-title deadline-tag"
                    >
                        {{ getDeadline(item.title) }}
                    </v-chip>
                </v-col>
            </v-row>
            <v-row v-else class="mt-s10 text-ellipsis">
                <v-col style="margin-top: -8px" class="text-ellipsis">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <span
                                v-on="on"
                                style="margin-left: -12px"
                                class="notification-item-title"
                            >
                                {{ reNameContent(item.title) }}
                            </span>
                        </template>
                        <span>{{ reNameContent(item.title) }}</span>
                    </v-tooltip>
                </v-col>
            </v-row>
            <v-row class="notification-item-info" style="margin-top: -5px">
                <v-col cols="6" class="text-ellipsis">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-icon v-on="on" class="mr-2" size="12">{{
                                $i('input.' + getScope(item.action))
                            }}</v-icon>
                            <span v-on="on"
                                >{{ item.extraLabel ? item.extraLabel : '' }}
                                {{
                                    item.extraValue ? item.extraValue : ''
                                }}</span
                            >
                        </template>
                        <span
                            >{{ item.extraLabel ? item.extraLabel : '' }}
                            {{ item.extraValue ? item.extraValue : '' }}</span
                        >
                    </v-tooltip>
                </v-col>
                <v-col cols="6" class="text-right pr-3">
                    <span>{{ convertTime(item.createTime) }}</span>
                    <v-icon
                        size="9"
                        color="blue"
                        class="ml-1"
                        v-if="item.state == '0'"
                        >mdi-circle</v-icon
                    >
                </v-col>
            </v-row>
        </v-col>
        <v-divider
            style="width: 95%; margin-top: -8px"
            class="ml-2"
        ></v-divider>
        <v-menu
            :close-on-content-click="true"
            :open-on-hover="true"
            :max-width="200"
            :min-width="200"
            :max-height="500"
            offset-y
        >
            <template v-slot:activator="{ on }">
                <v-btn
                    depressed
                    icon
                    v-on="on"
                    :absolute="true"
                    :right="true"
                    class="mt-3 notification-item-action"
                >
                    <v-avatar color="#ffffff" size="30">
                        <v-icon>mdi-dots-horizontal</v-icon>
                    </v-avatar>
                </v-btn>
            </template>
            <v-list dense light nav>
                <v-list-item
                    dense
                    flat
                    v-for="(actionItem, i) in item.actionMenu"
                    :key="i"
                >
                    <template>
                        <v-list-item-content
                            class="pt-0 pb-0"
                            @click="actionNotification(item, actionItem.value)"
                        >
                            <v-list-item-title
                                class="font-weight-regular"
                                v-text="actionItem.text"
                            >
                            </v-list-item-title>
                        </v-list-item-content>
                    </template>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-row>
</template>
<script>
import SymperAvatar from '@/components/common/SymperAvatar';
import Api from '../../api/api.js';
import { appConfigs } from '../../configs';
export default {
    methods: {
        convertTime(time) {
            return this.$moment.unix(time).locale(this.$i18n.locale).fromNow();
        },
        actionNotification(notificationItem, action) {
            switch (action) {
                case 'read':
                    this.markRead(notificationItem);
                    break;
                default:
                    var actionData = JSON.parse(notificationItem.action);
                    actionData['action'] = action;
                    console.log(actionData, 'actionDataactionDataactionData');
                    this.$evtBus.$emit(
                        'symper-app-call-action-handler',
                        actionData,
                        this,
                        { openInNewTab: true }
                    );
                    this.markRead(notificationItem);
                    break;
            }
        },
        getScope(action) {
            let result = '';
            try {
                if (
                    JSON.parse(action).module == 'document' &&
                    JSON.parse(action).scope == 'workflow'
                ) {
                    result = 'taskBPM';
                } else {
                    result = JSON.parse(action).module;
                }
            } catch (error) {}
            return result;
        },
        getDeadline(description) {
            let deadline = description.split('<*')[1].split('*>')[0];
            deadline = deadline.slice(0, 10);
            let result = '';
            if (deadline) {
                result = this.$moment
                    .unix(deadline)
                    .fromNow()
                    .replace('giờ', 'h')
                    .replace('trước', '')
                    .replace('tới', '')
                    .replace('năm', 'y');
                result
                    .replace('ngày', 'd')
                    .replace('tháng', 'm')
                    .replace('một', '1');
            }
            return result;
        },
        reNameContent(description) {
            let name = description;

            //this.deadLine = '';
            if (description.indexOf('<*') > -1) {
                let newValue = '';
                let value = description.split('<*')[1].split('*>')[0];
                //
                let oldValue = '<*' + value + '*>';
                name = name.replace(oldValue, newValue);
            }
            if (this.$i18n.locale == 'en') {
                name = name.replace(
                    'Bạn đã được nhắc đến trong 1 bình luận',
                    'You has mentioned in a comment'
                );
            }
            return name;
        },
        openNotification(notificationItem) {
            let action = JSON.parse(notificationItem.action);
            if (action.scope == 'comment') {
                this.$emit('open-popup-detail', action.parameter.id);
            } else {
                this.$evtBus.$emit('symper-open-notification');

                let extraParams = {
                    openInNewTab: true
                };
                this.$evtBus.$emit(
                    'symper-app-call-action-handler',
                    notificationItem.action,
                    this,
                    extraParams
                );
            }
            this.markRead(notificationItem);
        },
        checkIcon(icon) {
            let check = true;
            if (icon.indexOf('user_avatar_') > -1) {
                check = false;
            }
            return check;
        },
        setAvaOrIcon(icon) {
            if (icon) {
                if (
                    icon.indexOf('user_avatar_') > -1 ||
                    icon == 'default.png'
                ) {
                    return (
                        appConfigs.apiDomain.fileManagement + 'readFile/' + icon
                    );
                }
            }
        },
        markRead(notificationItem) {
            if (notificationItem.state == '0') {
                let req = new Api(appConfigs.apiDomain.nofitication);
                req.post('/notifications/' + notificationItem.id + '/read')
                    .then((res) => {
                        if (res.status == 200) {
                            notificationItem.state = '1';
                            this.$store.state.app.unreadNotification -= 1;
                        } else {
                            this.showError();
                        }
                    })
                    .catch((err) => {
                        this.showError();
                    });
            }
        }
    },
    data() {
        return {};
    },
    props: {
        item: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    created() {},
    components: {
        SymperAvatar
    }
};
</script>
<style scoped>
.deadline-tag {
    height: 13px;
    font-size: 10px;
    background-color: #2196f3 !important;
    color: white;
    top: 3px;
}
.v-card .list-app {
    max-height: 700px;
    overflow: auto;
}
.v-list-item {
    cursor: pointer;
}
.v-list-item:hover {
    background: #eeeeee;
}
.notification-global-action >>> .v-chip,
.notification-global-action >>> .v-chip-content:hover {
    background: none;
    cursor: pointer;
}
.theme--light.v-divider {
    border-color: rgba(0, 0, 0, 0.05);
}
.notification-item-title {
    font-size: 12px;
}
.notification-item-info .col {
    padding: 0;
    font-size: 11px;
}
.right-180 {
    right: -180px !important;
}
.right-200 {
    right: -200px !important;
}
.notification-item-info {
    color: #8e8e8e;
}
.notification-item-action {
    display: none;
}
.notification-item:hover .notification-item-action {
    display: block;
}
</style>
