<template>
    <div>
        <div class="modal-overlay" v-show="isShow" @click="close()"></div>
        <div class="container-action" :style="position" v-show="isShow">
            <div class="top-bar">
                <div class="i5a7ie">
                    <div class="top-bar-items">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    v-bind="attrs"
                                    v-on="on"
                                    x-small
                                    icon
                                    tile
                                    @click="close()"
                                >
                                    <i class="fs-15 mdi mdi-close"></i>
                                </v-btn>
                            </template>
                            <span>{{ $t('common.close') }}</span>
                        </v-tooltip>

                        <div class="select-button">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        v-bind="attrs"
                                        v-on="on"
                                        x-small
                                        icon
                                        tile
                                        class="mr-2"
                                        @click="detail()"
                                        v-if="listPermission.detail"
                                    >
                                        <i
                                            class="
                                                fs-15
                                                mdi mdi-arrow-expand-all
                                            "
                                        ></i>
                                    </v-btn>
                                </template>
                                <span>{{
                                    $t(
                                        'scheduler.view_enduser.action_event.detail'
                                    )
                                }}</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        v-bind="attrs"
                                        v-on="on"
                                        x-small
                                        icon
                                        tile
                                        class="mr-2"
                                        @click="del()"
                                        v-if="listPermission.delete"
                                    >
                                        <i
                                            class="
                                                fs-15
                                                mdi mdi-delete-sweep-outline
                                            "
                                        ></i>
                                    </v-btn>
                                </template>
                                <span>{{
                                    $t(
                                        'scheduler.view_enduser.action_event.remove'
                                    )
                                }}</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        v-bind="attrs"
                                        v-on="on"
                                        x-small
                                        icon
                                        tile
                                        class="mr-2"
                                        @click="edit()"
                                        v-if="listPermission.update"
                                    >
                                        <i
                                            class="fs-15 mdi mdi-pencil-outline"
                                        ></i>
                                    </v-btn>
                                </template>
                                <span>{{
                                    $t(
                                        'scheduler.view_enduser.action_event.edit'
                                    )
                                }}</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        v-bind="attrs"
                                        v-on="on"
                                        x-small
                                        icon
                                        tile
                                        class="mr-2"
                                        @click="nextweek()"
                                        :disabled="isEventRec"
                                        v-if="listPermission.update"
                                    >
                                        <i
                                            class="
                                                fs-15
                                                mdi mdi-calendar-end-outline
                                            "
                                        ></i>
                                    </v-btn>
                                </template>
                                <span>{{
                                    $t(
                                        'scheduler.view_enduser.action_event.next_week'
                                    )
                                }}</span>
                            </v-tooltip>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        v-bind="attrs"
                                        v-on="on"
                                        x-small
                                        icon
                                        tile
                                        class="mr-2"
                                        @click="cloneEvent()"
                                        :disabled="isEventRec"
                                        v-if="listPermission.clone"
                                    >
                                        <i
                                            class="
                                                fs-15
                                                mdi mdi-content-copy
                                            "
                                        ></i>
                                    </v-btn>
                                </template>
                                <span>{{
                                    $t(
                                        'scheduler.view_enduser.action_event.clone'
                                    )
                                }}</span>
                            </v-tooltip>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content" v-if="currentEvent">
                <div>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <span
                                v-bind="attrs"
                                v-on="on"
                                class="title-content"
                                >{{ currentEvent.text.replace(/(<([^>]+)>)/ig,'') }}</span
                            >
                        </template>
                        <span>{{ currentEvent.text.replace(/(<([^>]+)>)/ig,'') }}</span>
                    </v-tooltip>
                </div>
                <div class="other-content" v-if="currentEvent.other">
                    <span>{{ currentEvent.other }}</span>
                </div>
                <div class="date">
                    <i class="fs-15 mdi mdi-calendar-blank-outline"></i>
                    <div class="date-content">
                        {{ currentEvent.start_time_tooltip }}
                    </div>
                    <div class="date-content end-time">
                        {{ currentEvent.end_time_tooltip }}
                    </div>
                </div>
                <div class="creator" v-if="currentEvent.user && isShow">
                    <div class="creator-icon">
                        <img
                            v-if="!errorImg"
                            style="
                                width: 18px;
                                height: 18px;
                                border-radius: 12px;
                                float: left;
                            "
                            :src=" fileUrl + 'user-avatar?userId=' +
                                currentEvent.user
                            "
                            @error="imgError()"
                        />
                        <img
                            v-else
                            style="
                                width: 15px;
                                height: 15px;
                                border-radius: 12px;
                                float: left;
                            "
                            :src=" fileUrl + 'user-avatar?userId=default_avatar'"
                        />
                    </div>
                    <div class="creator-content">
                        {{ currentEvent.userName }}
                    </div>
                </div>
                <div class="type" v-if="currentEvent.type">
                    <i class="fs-15 mdi mdi-archive-outline"></i>
                    <div class="type-content">{{ currentEvent.type }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { calculatorPositionSelectBar } from '@/components/scheduler/positionbox.js';
import {appConfigs} from "@/configs.js";
export default {
    data: () => ({
        offset: true,
        isShow: false,
        position: {},
        errorImg: false,
        fileUrl: appConfigs.apiDomain.fileManagement 
    }),
    props: {
        idEvent: {
            type: String
        },
        currentEvent: {
            type: Object
        },
        viewChange: {
            type: String
        },
        listPermission: {
            type: Object
        }
    },
    methods: {
        imgError() {
            this.errorImg = true;
        },
        show(event, context) {
            this.errorImg = false;
            this.isShow = true;
            this.position = calculatorPositionSelectBar(event, context);
        },
        hide() {
            this.isShow = false;
        },
        edit() {
            this.isShow = false;
            this.$emit('editEvent', this.idEvent);
        },
        del() {
            this.isShow = false;
            this.$emit('delEvent', this.idEvent);
        },
        detail() {
            this.isShow = false;
            this.$emit('detailEvent', this.idEvent);
        },
        nextweek() {
            this.isShow = false;
            this.$emit('nextweek', this.idEvent);
        },
        close() {
            this.isShow = false;
            this.$emit('close-tooltip-event', this.idEvent);
        },
        cloneEvent(){
            this.isShow = false;
            this.$emit('clone-event', this.idEvent);            
        }
    },
    computed: {
        isEventRec() {
            if (this.idEvent) {
                const id = this.idEvent.toString().split('#');
                if (id.length > 1) {
                    return true;
                }
            }
            return false;
        }
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

.modal-overlay {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    z-index: 10;
}
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes growth {
    from {
        transform: scale(var(--growth-from));
    }
    to {
        transform: scale(var(--growth-to));
    }
}
.container-action {
    color: #1b1b1b;
    font-family: 'Roboto', sans-serif;
    font-size: 15px;
    font-weight: 400;
    background-color: #fff;
    width: 340px;
    position: absolute;
    z-index: 11;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* box-shadow:
		0px 24px 38px 3px rgb(0 0 0 / 14%),
		0px 9px 46px 8px rgb(0 0 0 / 12%),
		0px 11px 15px -7px rgb(0 0 0 / 20%); */
    box-shadow: 0px 5px 5px -3px rgb(0 0 0 / 20%),
        0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%);
    border-radius: 4px;
    animation: fadeIn linear 0.1s;
    animation: growth linear 0.1s;
    --growth-from: 0.7;
    --growth-to: 1;
}
.top-bar {
    background-color: #fff;
    flex: none;
    overflow: visible;
    position: relative;
}
.top-bar .i5a7ie {
    color: #fff;
    display: flex;
    flex-direction: column;
    height: 40px;
    overflow: hidden;
    margin-bottom: 4px;
}
.top-bar .i5a7ie .top-bar-items {
    flex: none;
    padding: 16px 16px 0 16px;
    display: flex;
    flex-flow: row-reverse;
}
.achi201 {
    transition: background 0.3s;
    border: 0;
    -webkit-border-radius: 50%;
    border-radius: 50%;
    cursor: pointer;
    display: inline-block;
    flex-shrink: 0;
    height: 48px;
    outline: none;
    overflow: hidden;
    position: relative;
    text-align: center;
    z-index: 0;
    height: 40px;
    width: 40px;
}
.achi201:hover {
    border-radius: 50%;
    background-color: rgba(95, 99, 104, 0.039);
}
.top-bar-items .close-button {
    margin-left: 8px;
    display: block;
    color: #5f6368;
    fill: #5f6368;
}
.lpt247 {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    position: relative;
    width: 100%;
}
.select-button {
    display: flex;
    color: #5f6368;
    fill: #5f6368;
}

.content {
    background: white;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0px 16px 12px 16px;
}

.content .title-content {
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    color: black;
}
.content .other-content {
    margin-bottom: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    color: #6d6d6d;
    font-style: italic;
}
.date {
    margin-bottom: 8px;
}
.date .date-icon {
    display: inherit;
    align-items: center;
}
.date .date-content {
    display: inline-block;
    padding-left: 10px;
    font-size: 13px;
    color: #6d6d6d;
    line-height: 22px;
}
.date .date-content.end-time {
    display: block!important;
    padding-left: 26px;
}
.creator {
    display: flex;
    margin-bottom: 8px;
}
.creator .creator-icon {
    display: inherit;
    align-items: center;
}
.creator .creator-content,
.type .type-content {
    display: inline-block;
    padding-left: 12px;
    font-size: 13px;
    color: #6d6d6d;
}
</style>
