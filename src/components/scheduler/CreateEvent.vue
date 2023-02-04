<template>
    <div>
        <v-row justify="center">
            <v-dialog
                v-model="dialog"
                persistent
                max-width="850px"
                max-height="670px"
                content-class="elevation-0"
                hide-overlay
            >
                <div
                    style="background: white"
                    id="create-event"
                >
                    <v-toolbar height="40px" class="header-detail">
                        <v-bottom-navigation
                            height="38px"
                            class="topbar-detail"
                            v-model="value"
                            color="#FB7E00"
                        >
                            <v-btn
                                style="padding-left: 12px; padding-right: 12px"
                                @click="openTabShowDetailEvent()"
                                tag="div"
                            >
                                <span class="text-topbar">{{$t('v2.scheduler.cardDetail')}}</span>
                            </v-btn>
                            <v-btn
                                style="padding-left: 12px; padding-right: 12px"
                                @click="openTabShowConfigRec()"
                                tag="div"
                            >
                                <span class="text-topbar">{{$t('v2.scheduler.recurring')}}</span>
                            </v-btn>
                        </v-bottom-navigation>
                        <v-spacer></v-spacer>

                        <v-btn
                            class="btn-save"
                            depressed
                            small
                            color="#61C454"
                            @click="clickButtonSave()"
                            :loading="isLoadingSave"
                            :disabled="isLoadingSave || isDisableButtonSave"
                            tag="div"
                            >{{$t('v2.doc.save')}}</v-btn
                        >

                        <v-btn depressed @click="close" small tag="div">
                            <v-icon class="fs-18" :size="15"
                                >mdi mdi-close
                            </v-icon>
                        </v-btn>
                    </v-toolbar>
                    <v-card-actions
                        v-if="isViewTabSubmitEvent"
                        :style="{
                            display: isViewTabConfigRecurring
                                ? 'none'
                                : 'block',
                        }"
                    >
                        <div
                            style="
                                height: calc(90vh - 90px);
                                margin: auto;
                                margin-bottom: 10px;
                            "
                        >
                            <DocumentSubmit
                                class="popup-context"
                                v-if="docSubFormId != 0"
                                :showSubmitButton="false"
                                :parrentInstance="keyInstance"
                                ref="subSubmitView"
                                :action="'submit'"
                                :docId="docSubFormId"
                                @submit-document-success="onSubmitEventDone"
                                @submit-document-error="submitEventError"                        
                                :overrideEventScheduler="eventAdded"
                                @cancel-delete-blank-row="continueSubmit"
                                @confirm-delete-row="closeDialog"
                                @close-dialog-validate="continueSubmit"
                                @load-form-success="loadFormSuccess"
                                :isViewPopup="true"
                            />
                        </div>
                    </v-card-actions>
                    <v-card-actions v-if="value == 1">
                        <div
                            style="
                                height: calc(90vh - 90px);
                                margin: auto;
                                margin-bottom: 10px;
                            "
                        ></div>
                    </v-card-actions>
                </div>
            </v-dialog>
        </v-row>
    </div>
</template>
<script>
import RepeatConfig from '@/components/common/RepeatConfig.vue';
import DocumentSubmit from '@/views/document/submit/Submit.vue';
export default {
    data: () => ({
        isViewTabSubmitEvent: true,
        isViewTabConfigRecurring: false,
        dialog: false,
        value: 0,
        actionOnRightSidebar: 'update',
        keyInstance: 0,
        currentEvent: {},
        eventAdded: {},
        isLoadingSave: false,
        isDisableButtonSave: true
    }),
    props: {
        idEvent: {
            type: String,
        },
        docSubFormId: {
            type: String,
            default: 0,
        },
    },
    components: {
        RepeatConfig,
        DocumentSubmit,
    },

    methods: {
        loadFormSuccess(){
            this.isDisableButtonSave = false
        },
        onSubmitEventDone(dataResponSubmit) {
            this.dialog = false;
            this.isLoadingSave = false
            this.isDisableButtonSave = true
            this.$emit('btnsave-clicked', dataResponSubmit);
            $('.dhx_form_repeat').css('display', 'none');
            $('#create-event').css('display', 'none');
            this.isViewTabSubmitEvent = false;
            this.$emit('scheduler-set-event-has-recurring', false);
        },
        showAdd(event) {
            this.isViewTabSubmitEvent = true;
            this.dialog = true;
            this.value = 0;
            if (event) {
                this.eventAdded = event;
            }
            this.isViewTabConfigRecurring = false;
            $('#create-event').css('display', 'block');
        },
        clickButtonSave() {
            this.$refs.subSubmitView.handlerSubmitDocumentClick();
            $('.dhx_form_repeat').css('display', 'none');
            this.eventAdded = {}
            this.isLoadingSave = true
        },
        closeDialog(){
            this.dialog = false;
            this.isLoadingSave = false
            this.isDisableButtonSave = true
            $('#create-event').css('display', 'none');
            $('.dhx_cal_cover').css('display', 'none');
        },
        continueSubmit(){
            this.isLoadingSave = false
        },
        close() {
            this.dialog = false;
            this.isDisableButtonSave = true
            this.$emit('btnclose-clicked', this.idEvent);
            $('.dhx_form_repeat').css('display', 'none');
            $('#create-event').css('display', 'none');
            this.isViewTabConfigRecurring = true;
            this.isViewTabSubmitEvent = false;
            this.eventAdded = {};
            this.$emit('scheduler-set-event-has-recurring', false);
        },
        submitEventError() {
            (this.value = 0), (this.isViewTabConfigRecurring = false);
            $('.dhx_form_repeat').css('display', 'none');
        },
        openTabShowDetailEvent() {
            this.value = 0;
            this.isViewTabConfigRecurring = false;
            $('.dhx_form_repeat').css('display', 'none');
        },
        openTabShowConfigRec() {
            const a = document.getElementById('create-event');

            document.querySelector('.dhx_cal_light').appendChild(a);
            this.value = 1;
            this.isViewTabConfigRecurring = true;
            $('.dhx_form_repeat').css('display', 'block');
            this.$emit('scheduler-set-event-has-recurring', true);
        },
    },
};
</script>

<style scoped>
.wrap-content-submit >>> .v-speed-dial--bottom {
    display: none !important;
}
.text-topbar {
    font-size: 13px;
    font-weight: 500;
}
.topbar-detail {
    justify-content: left;
    box-shadow: none;
    width: 50%;
}
.v-item-group.v-bottom-navigation .v-btn.v-btn--active .text-topbar{
    text-underline-offset: 10px;
    text-decoration: underline 2px;
}
.v-item-group.v-bottom-navigation .v-btn.v-btn--contained:not(.v-btn--active) .text-topbar{
    color: black;
}
.title-detail {
    display: flex;
    justify-content: center;
    color: #fb7e00;
    font-size: 30px;
    font-weight: 500;
    border-bottom: 1px solid #fb7e00;
}

.header-detail {
    border-bottom: 0.5px solid #b5b5b5;
    box-shadow: none !important;
}
.btn-edit,
.btn-save {
    color: white;
    font-size: 12px;
    border-radius: 4px;
    height: 28px !important;
    padding: 0 12px !important;
    margin-right: 5px;
}
.btn-save:hover {
    background-color: rgb(97, 196, 84) !important;
}
.btn-edit:hover {
    background-color: rgb(251, 126, 0) !important;
}

.v-card {
    overflow-wrap: none;
}
.topbar-detail >>> button:hover {
    background-color: transparent !important;
}
#create-event .v-overlay--active {
    display: none !important;
}
</style>
