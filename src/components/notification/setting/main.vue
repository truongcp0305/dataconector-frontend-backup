<template>
    <div class="w-100 ml-6 mt-2">
        <div class="body" style="margin-top: -25px">
            <v-list
                :expand="true"
                dense
                class="overflow-y-auto notification"
                :max-height="'850px'"
            >
                <v-list-group
                    active-class="black--text"
                    v-for="item in listItems"
                    :key="item.title"
                    v-model="item.active"
                    no-action
                    class="mr-3"
                    style="border-bottom: 1px solid rgba(0, 0, 0, 0.07)"
                >
                    <template v-slot:prependIcon>
                        <v-icon class="ml-1 icon-group">
                            {{ $i('input.' + item.icon) }}
                        </v-icon>
                    </template>
                    <template v-slot:activator>
                        <v-list-item-content style="margin-left: -17px">
                            <v-list-item-title v-if="type == 'main'">{{
                                $t('objects.' + item.title)
                            }}</v-list-item-title>
                            <v-list-item-title v-else>
                                {{ $t('objects.' + item.title) }}
                                <v-list-action style="float: right">
                                    <v-btn
                                        x-small
                                        text
                                        @click.stop="tickAll(item.title, true)"
                                        v-if="type == 'unfollow'"
                                    >
                                        <span class="fs-13 fw-400 light-grey">
                                            {{
                                                $t(
                                                    'notificationConfig.unfollow',
                                                )
                                            }}
                                        </span>
                                    </v-btn>
                                    <v-btn
                                        x-small
                                        text
                                        @click.stop="tickAll(item.title, false)"
                                        v-if="type == 'follow'"
                                    >
                                        <span class="fs-13 fw-400 light-grey">
                                            {{
                                                $t('notificationConfig.follow')
                                            }}
                                        </span>
                                    </v-btn>
                                </v-list-action>
                            </v-list-item-title>
                            <v-list-item-subtitle
                                v-if="type == 'main'"
                                class="fw-400 fs-11"
                            >
                                <span v-for="sub in item.subTitle" :key="sub">
                                    <span v-if="sub != ','">{{
                                        $t('notificationConfig.' + sub)
                                    }}</span>
                                    <span v-else class="mr-1">{{ sub }}</span>
                                </span>
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-else class="fw-400 fs-11">
                                {{ $t('objects.' + item.title) }}
                                <v-list-action style="float: right">
                                    <span
                                        class="fs-13 fw-400 ml-1 light-grey"
                                        style="margin-left: -20px"
                                    >
                                        {{ item.userFilterAt }}
                                    </span>
                                </v-list-action>
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </template>
                    <div class="mb-3 ml-10">
                        <span class="fs-13 fw-430" style="color: black">
                            {{ $t('notificationConfig.have_action') }}</span
                        >
                    </div>
                    <v-list-item
                        style="margin-top: -20px"
                        v-for="child in item.items"
                        :key="child.title"
                    >
                        <v-list-item-content class="ml-10 mb-1">
                            <v-list-item-title class="font-normal fs-12"
                                >{{ $t('notificationConfig.' + child.name) }}
                                <span v-if="type != 'main'">
                                    -
                                    {{
                                        $t(
                                            'notificationConfig.' +
                                                child.defaultUser,
                                        )
                                    }}
                                </span>
                            </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action class="my-2 mr-3">
                            <v-switch
                                x-small
                                dense
                                v-model="child.active"
                                color="success"
                            ></v-switch>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>
            </v-list>
        </div>
    </div>
</template>
<script>
import notification from './../../../api/settingNotification';
export default {
    watch: {
        listItems: {
            deep: true,
            immediate: true,
            handler(newValue) {
                for (let i = 0; i < newValue.length; i++) {
                    if (newValue[i].active) {
                        for (let j = 0; j < newValue[i].items.length; j++) {
                            if (newValue[i].items[j].active) {
                                this.subcribedAllChanel(
                                    newValue[i].title,
                                    newValue[i].items[j].title,
                                    i,
                                    j,
                                );
                            } else {
                                this.unsubcribedAllChanel(
                                    newValue[i].title,
                                    newValue[i].items[j].title,
                                    i,
                                    j,
                                );
                            }
                        }
                    }
                }
            },
        },
    },
    props: ['type', 'listItems', 'listSubcribed', 'allListChanel'],
    methods: {
        tickAll(objectType, isFollow) {
            let data = { state: false };
            for (let i = 0; i < this.allListChanel.length; i++) {
                if (this.allListChanel[i].objectType == objectType) {
                    if (!isFollow) {
                        for (let j = 0; j < this.listItems.length; j++) {
                            if (this.listItems[j].title == objectType) {
                                this.listItems[j].items.map(
                                    (x) => (x.active = false),
                                );
                            }
                        }
                        notification
                            .subscribeChanel(this.allListChanel[i].id)
                            .then((res) => {
                                if (res.status == 200) {
                                }
                            });
                    } else {
                        for (let j = 0; j < this.listItems.length; j++) {
                            if (this.listItems[j].title == objectType) {
                                this.listItems[j].items.map(
                                    (x) => (x.active = true),
                                );
                            }
                        }
                        notification
                            .subscribeChanel(this.allListChanel[i].id, data)
                            .then((res) => {
                                if (res.status == 200) {
                                }
                            });
                    }
                }
            }
        },
        subscribedOneChanel(id) {
            notification.subscribeChanel(id).then((res) => {
                if (res.status == 200) {
                }
            });
        },
        //subcribed all
        subcribedAllChanel(
            objectType,
            event,
            listItemsIdx,
            childrenListItemsIdx,
        ) {
            for (let i = 0; i < this.allListChanel.length; i++) {
                if (
                    this.allListChanel[i].objectType == objectType &&
                    this.allListChanel[i].event == event &&
                    !this.allListChanel[i].userFilterState
                ) {
                    notification
                        .subscribeChanel(this.allListChanel[i].id)
                        .then((res) => {
                            if (res.status == 200) {
                            }
                        });
                }
            }
        },
        unsubcribedAllChanel(objectType, event, k, h) {
            const self = this;
            let data = { state: false };
            for (let i = 0; i < this.allListChanel.length; i++) {
                if (
                    this.allListChanel[i].objectType == objectType &&
                    this.allListChanel[i].event == event &&
                    this.allListChanel[i].userFilterState
                ) {
                    notification
                        .subscribeChanel(this.allListChanel[i].id, data)
                        .then((res) => {
                            if (res.status == 200) {
                            }
                        });
                }
            }
        },
    },
    data() {
        return {
            items: this.listItems,
            listModuleStates: [],
        };
    },
};
</script>
<style scoped>
.notification ::v-deep .v-list-item {
    padding: 0px !important;
}
.light-grey {
    font-family: Roboto;
    color: rgba(0, 0, 0, 0.4);
}
</style>
