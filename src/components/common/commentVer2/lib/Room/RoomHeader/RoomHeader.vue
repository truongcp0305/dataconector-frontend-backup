<template>
    <div class="vac-room-header vac-app-border-b">
        <slot name="room-header" v-bind="{ room, typingUsers, userStatus }">
            <div class="vac-room-wrapper">
                <div
                    v-if="!singleRoom"
                    class="vac-svg-button vac-toggle-button"
                    :class="{ 'vac-rotate-icon': !showRoomsList && !isMobile }"
                    @click="$emit('toggle-rooms-list')"
                >
                    <slot name="toggle-icon">
                        <svg-icon name="toggle" />
                    </slot>
                </div>
                <div
                    class="vac-info-wrapper"
                    :class="{ 'vac-item-clickable': roomInfoEnabled }"
                    @click="$emit('room-info')"
                >
                    <slot name="room-header-avatar" v-bind="{ room }">
                        <div
                            v-if="room.avatar"
                            class="vac-avatar"
                            :style="{
                                'background-image': `url('${room.avatar}')`,
                            }"
                        />
                    </slot>
                    <slot
                        name="room-header-info"
                        v-bind="{ room, typingUsers, userStatus }"
                    >
                        <div class="vac-text-ellipsis" style="display: flex">
                            <div class="vac-room-name" style="color: #f48634">
                                {{ $t('comment.title') }}
                            </div>
                            <div
                                v-if="typingUsers"
                                class="vac-room-info vac-text-ellipsis"
                            >
                                {{ typingUsers }}
                            </div>
                            <div v-else class="vac-room-info vac-text-ellipsis">
                                {{ userStatus }}
                            </div>
                        </div>
                        <div>
                            <v-tooltip bottom style="z-index: 161">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        v-bind="attrs"
                                        v-on="on"
                                        icon
                                        small
                                        @click="refreshComment()"
                                    >
                                        <v-icon>mdi-refresh</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ $t('common.refresh') }}</span>
                            </v-tooltip>
                        </div>
                        <div>
                            <v-tooltip bottom style="z-index: 161">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                        v-bind="attrs"
                                        v-on="on"
                                        icon
                                        small
                                        @click="hideCommentPanel()"
                                        v-if="showBtnClose"
                                    >
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ $t('common.close') }}</span>
                            </v-tooltip>
                        </div>
                    </slot>
                </div>
                <slot v-if="room.roomId" name="room-options">
                    <div
                        v-if="menuActions.length"
                        class="vac-svg-button vac-room-options"
                        @click="menuOpened = !menuOpened"
                    >
                        <slot name="menu-icon">
                            <svg-icon name="menu" />
                        </slot>
                    </div>
                    <transition v-if="menuActions.length" name="vac-slide-left">
                        <div
                            v-if="menuOpened"
                            v-click-outside="closeMenu"
                            class="vac-menu-options"
                        >
                            <div class="vac-menu-list">
                                <div
                                    v-for="action in menuActions"
                                    :key="action.name"
                                >
                                    <div
                                        class="vac-menu-item"
                                        @click="menuActionHandler(action)"
                                    >
                                        {{ action.title }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </slot>
            </div>
        </slot>
    </div>
</template>

<script>
import vClickOutside from 'v-click-outside';

import SvgIcon from '../../../components/SvgIcon/SvgIcon';

import typingText from '../../../utils/typing-text';

export default {
    name: 'RoomHeader',
    components: {
        SvgIcon,
    },

    directives: {
        clickOutside: vClickOutside.directive,
    },

    props: {
        currentUserId: { type: [String, Number], required: true },
        textMessages: { type: Object, required: true },
        singleRoom: { type: Boolean, required: true },
        showRoomsList: { type: Boolean, required: true },
        isMobile: { type: Boolean, required: true },
        roomInfoEnabled: { type: Boolean, required: true },
        menuActions: { type: Array, required: true },
        room: { type: Object, required: true },
        showBtnClose: { type: Boolean, default: false },
    },

    emits: [
        'toggle-rooms-list',
        'room-info',
        'menu-action-handler',
        'hide-comment-panel',
        'refresh-comment',
    ],

    data() {
        return {
            menuOpened: false,
            timeOut: null,
        };
    },

    computed: {
        typingUsers() {
            return typingText(this.room, this.currentUserId, this.textMessages);
        },
        userStatus() {
            if (!this.room.users || this.room.users.length !== 2) return;

            const user = this.room.users.find(
                (u) => u._id !== this.currentUserId,
            );

            if (!user.status) return;

            let text = '';

            if (user.status.state === 'online') {
                text = this.textMessages.IS_ONLINE;
            } else if (user.status.lastChanged) {
                text = this.textMessages.LAST_SEEN + user.status.lastChanged;
            }

            return text;
        },
    },

    methods: {
        refreshComment() {
            const self = this;

            clearTimeout(self.timeOut);
            self.timeOut = setTimeout(() => {
                this.$emit('refresh-comment');
            }, 600);
        },
        hideCommentPanel() {
            this.$emit('hide-comment-panel');
        },
        menuActionHandler(action) {
            this.closeMenu();
            this.$emit('menu-action-handler', action);
        },
        closeMenu() {
            this.menuOpened = false;
        },
    },
};
</script>
