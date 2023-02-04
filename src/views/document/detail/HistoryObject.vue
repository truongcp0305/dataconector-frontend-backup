<template>
    <div class="wraper-comment h-100">
        <div style="display: flex">
            <span
                class="mdi mdi-keyboard-backspace"
                @click="hideHistory"
            ></span>
            <span style="font-size: 15px">{{
                $t('document.detail.sideBarDetail.trackChange')
            }}</span>
        </div>

        <v-divider></v-divider>

        <VuePerfectScrollbar style="height: calc(100% - 25px); margin-top: 8px">
            <div
                v-for="(history, key) in listHistoryControl"
                :key="key"
                class="history-item"
            >
                <div class="d-flex">
                    <div class="history-item__node">
                        <div class="history-item__time">
                            {{ getDateChange(key) }}
                        </div>
                    </div>

                    <div style="margin: 0px 1px 0px 88px">
                        {{ $t('document.detail.sideBarDetail.by') }}
                    </div>
                    <InfoUser
                        class="user-info"
                        :isShowAvatar="false"
                        :userId="getUserId(key)"
                    />
                </div>
                <div
                    class="history-item__change d-flex"
                    v-for="(his, index) in history"
                    :key="index"
                >
                    <div class="history-item__node">
                        <div class="history-item__node--child">
                            <div></div>
                        </div>
                    </div>
                    <div
                        class="history-item__content"
                        @click="highlightControl(his)"
                    >
                        <span style="font-weight: 500">{{ his.title }}: </span>
                        <span style="color: red"
                            ><del>{{ his.data.old }}</del></span
                        >&nbsp; -> &nbsp;<span style="color: green">{{
                            his.data.new
                        }}</span>
                    </div>
                </div>
            </div>
        </VuePerfectScrollbar>
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import InfoUser from '@/components/myItem/InfoUser.vue';
export default {
    props: {
        listHistoryControl: {
            type: Object,
            default() {
                return {};
            },
        },
        keyInstance: {
            default: null,
        },
    },
    data() {
        return {
            activeControl: null,
        };
    },
    components: {
        VuePerfectScrollbar,
        InfoUser,
    },
    methods: {
        hideHistory() {
            if (this.activeControl) {
                this.activeControl.unHighlightControl();
            }
            this.$emit('hide-history');
        },
        getDateChange(key) {
            let date = key.split('=====')[0];
            return date;
        },
        getUserId(key) {
            let date = key.split('=====')[1];
            return date;
        },
        highlightControl(history) {
            this.activeControl = history.ctrl;
            history.ctrl.highlightControl(history.rowObjectId);
        },
    },
};
</script>
<style scoped>
.mdi-keyboard-backspace {
    font-size: 15px;
    cursor: pointer;
    margin-right: 8px;
}
.history-item {
    cursor: pointer;
    font-size: 13px;
    transition: all ease-in-out 300ms;
    margin-left: 35px;
}
.history-item__info {
    display: flex;
}
.history-item__info >>> .user-info {
    margin: 0 !important;
    font-weight: 500;
}
.history-item__info span {
    margin: 0 4px 0 0;
}
.history-item .date-update {
    font-weight: 500;
}
.history-item img {
    border-radius: 50%;
    margin-bottom: -2px;
    margin-right: 8px;
}
.history-item__node {
    background: #ababab;
    width: 4px;
    margin: 0 16px 0 6px;
    position: relative;
}
.history-item__node--child {
    position: absolute;
    background: #e67d23;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    top: 7px;
    left: -4px;
}
.history-item__node--child > div {
    height: 8px;
    width: 8px;
    background: white;
    border-radius: 50%;
    margin: 2px;
}
.history-item__change {
    line-height: 2.2;
}
.history-item__time {
    color: white;
    border-radius: 15px;
    position: absolute;
    width: 140px;
    background: #e67d23;
    padding: 0 8px;
    left: -38px;
    font-weight: 500;
}
.user-info {
    font-weight: 500;
}
.history-item__content {
    cursor: pointer;
    width: 100%;
}
</style>
