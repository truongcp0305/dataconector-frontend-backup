// Dear guys // When I wrote this code, only God and I knew how it worked //
Now, only God knows it

<template>
    <div>
        <v-row justify="center">
            <v-dialog
                content-class="elevation-0"
                hide-overlay
                v-model="dialog"
                persistent
                max-width="850px"
                max-height="640px"
            >
                <div
                    id="detail-event"
                    style="background: white"
                    :style="{ display: confirm ? 'none' : 'block' }"
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
                                @click="openTabShowConfigRec()"
                                style="padding-left: 12px; padding-right: 12px"
                                tag="div"
                            >
                                <span class="text-topbar">{{$t('v2.scheduler.recurring')}}</span>
                            </v-btn>
                        </v-bottom-navigation>
                        <v-spacer></v-spacer>

                        <v-btn
                            v-if="isViewEventDetail == true && listPermission.edit"
                            class="btn-edit"
                            color="#FB7E00"
                            depressed
                            @click="clickButtonEdit()"
                            tag="div"
                            >{{$t('v2.scheduler.edit')}}</v-btn
                        >
                        <v-btn
                            v-if="isViewEventEdit == true"
                            class="btn-save"
                            color="#61C454"
                            depressed
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
                        v-if="isViewEventEdit == true"
                        :style="{ display: value == 1 ? 'none' : 'block' }"
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
                                v-if="
                                    actionOnRightSidebar == 'update' &&
                                    docObjInfo &&
                                    docObjInfo.docObjId
                                "
                                ref="subSubmitView"
                                :showSubmitButton="false"
                                :action="'update'"
                                :isCloneType="isCloneType"
                                :documentObjectId="docObjInfo.docObjId"
                                @submit-document-success="onSubmitEventDone"
                                @submit-document-error="submitEventError"
                                :overrideEventScheduler="customDataEventRec"
                                @cancel-delete-blank-row="continueSubmit"
                                @confirm-delete-row="closeDialog"
                                @close-dialog-validate="continueSubmit"
                                @load-form-success="loadFormSuccess"
                                :isViewPopup="true"
                            />
                        </div>
                    </v-card-actions>
                    <v-card-actions
                        v-if="isViewEventDetail == true"
                        :style="{ display: value == 1 ? 'none' : 'block' }"
                    >
                        <div
                            style="
                                height: calc(90vh - 90px);
                                margin: auto;
                                margin-bottom: 10px;
                            "
                        >
                            <detail-object
                                v-if="
                                    actionOnRightSidebar0 == 'detail' &&
                                    docObjInfo &&
                                    docObjInfo.docObjId
                                "
                                ref="viewDetail"
                                :quickView="true"
                                :docObjInfo="docObjInfo"
                                :customDataEventRecForScheduler="
                                    customDataEventRec
                                "
                                :showActionQuickView="true"
                            />
                        </div>
                    </v-card-actions>
                    <v-card-actions v-if="value == 1">
                        <div
                            id="repeatcpn"
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
import Detail from '@/views/document/detail/Detail.vue';
import DocumentSubmit from '@/views/document/submit/Submit.vue';
export default {
    data: () => ({
        dialog: false,
        confirm: false,
        value: 0,
        show_btnsave: false,
        show_btnedit: true,
        actionOnRightSidebar: 'update',
        actionOnRightSidebar0: 'detail',
        docObjInfo: {
            docObjId: 0
        },
        isViewEventDetail: false,
        isViewEventEdit: false,
        isCloneType: false,
        customDataEventRec: {},
        isLoadingSave: false,
        isDisableButtonSave: true,
        newValueControl: null
    }),
    props: {
        idEvent: {
            type: String
        },
        currentEvent: {
            type: Object
        },
        cardConfig: {
            type: Object
        },
        isFirstEventRecurring: {
            type: Boolean
        },
        listPermission: {
            type: Object
        }
    },
    components: {
        'detail-object': Detail,
        DocumentSubmit
    },
    methods: {
        loadFormSuccess() {
            this.isDisableButtonSave = false;
            if(this.newValueControl){
                this.$refs.subSubmitView.setNewValueWhenDragCardKanban(this.newValueControl.start_date.controlName, this.newValueControl.start_date.newValue);
                this.$refs.subSubmitView.setNewValueWhenDragCardKanban(this.newValueControl.start_date.controlName, this.newValueControl.start_date.newValue);
                this.$refs.subSubmitView.setNewValueWhenDragCardKanban(this.newValueControl.start_time.controlName, this.newValueControl.start_time.newValue);
                this.$refs.subSubmitView.setNewValueWhenDragCardKanban(this.newValueControl.end_time.controlName, this.newValueControl.end_time.newValue);
                this.newValueControl = null
            }
        },
        clickButtonEdit() {
            this.show_btnsave = true;
            this.show_btnedit = false;
            this.isViewEventDetail = false;
            this.isViewEventEdit = true;
            const words = this.idEvent.split('#');
            if (words.length > 1) {
                this.isCloneType = true;
            } else {
                this.isCloneType = false;
            }
        },
        show(id) {
            const words = this.currentEvent.id.split('#');
            if (words.length > 1 || this.currentEvent.rec_type == '') {
                this.customDataEventRec[this.cardConfig.start_time.field] =
                    this.currentEvent.start_time_formated;
                this.customDataEventRec[this.cardConfig.end_time.field] =
                    this.currentEvent.end_time_formated;
                this.customDataEventRec[this.cardConfig.start_date.field] =
                    this.currentEvent.start_date_formated;
                this.customDataEventRec[this.cardConfig.end_date.field] =
                    this.currentEvent.end_date_formated;
            }
            if (this.currentEvent.rec_type == '') {
                // là event ảo trong chuỗi rec đã được kéo thả thay đổi time
                this.docObjInfo.docObjId = this.currentEvent.event_pid;
            } else if (id) {
                this.docObjInfo.docObjId = id;
            } else {
                this.docObjInfo.docObjId = this.idEvent;
            }
            this.dialog = true;
            this.value = 0;
            this.show_btnsave = false;
            this.show_btnedit = true;
            this.isViewEventDetail = true;
            this.isViewEventEdit = false;

            $('#detail-event').css('display', 'block');
        },
        showEdit(id, newValueControl) {
            const words = id.split('#');
            if (words.length > 1 || this.currentEvent.rec_type == '') {
                // nếu là event đầu tiên trong chuỗi rec -> ko insert bản ghi vào database document, chỉ update data
                this.isCloneType = true;
                this.customDataEventRec[this.cardConfig.start_time.field] =
                    this.currentEvent.start_time_formated;
                this.customDataEventRec[this.cardConfig.end_time.field] =
                    this.currentEvent.end_time_formated;
                this.customDataEventRec[this.cardConfig.start_date.field] =
                    this.currentEvent.start_date_formated;
                this.customDataEventRec[this.cardConfig.end_date.field] =
                    this.currentEvent.end_date_formated;
            } else {
                this.isCloneType = false;
            }
            if (this.currentEvent.rec_type == '') {
                // là event ảo trong chuỗi rec đã được kéo thả thay đổi time ( chưa có bản ghi trong dtb doc)
                this.docObjInfo.docObjId = this.currentEvent.event_pid;
            } else if (id) {
                this.docObjInfo.docObjId = id;
            } else {
                k;
                this.docObjInfo.docObjId = this.idEvent;
            }
            this.dialog = true;
            this.value = 0;
            this.show_btnsave = true;
            this.show_btnedit = false;
            this.isViewEventEdit = true;
            if(newValueControl){
                this.newValueControl = newValueControl
            }
            $('#detail-event').css('display', 'block');
        },
        showClone(id){
            this.isCloneType = true;
            if (this.currentEvent.rec_type == '') {
                // là event ảo trong chuỗi rec đã được kéo thả thay đổi time ( chưa có bản ghi trong dtb doc)
                this.docObjInfo.docObjId = this.currentEvent.event_pid;
            } else if (id) {
                this.docObjInfo.docObjId = id;
            } else {
                this.docObjInfo.docObjId = this.idEvent;
            }
            this.dialog = true;
            this.value = 0;
            this.show_btnsave = true;
            this.show_btnedit = false;
            this.isViewEventEdit = true;
            $('#detail-event').css('display', 'block');
        },
        show_returnrepeat() {
            this.confirm = false;
            var element = document.getElementsByClassName('dhx_cal_light');
            element[0].style.display = 'block';
            $('#detail-event').css('display', 'block');
        },
        onSubmitEventDone(dataResponUpdate) {
            this.dialog = false
            this.confirm = true;
            this.isLoadingSave = false;
            this.$emit('btnsave-clicked', dataResponUpdate);
            this.isViewEventEdit = false;
            $('.dhx_form_repeat').css('display', 'none');
            this.$emit('scheduler-set-event-has-recurring', false);
        },
        clickButtonSave() {
            const words = this.idEvent.split('#');
            if (this.isViewEventEdit == true && words.length < 2) {
                this.$refs.subSubmitView.handlerSubmitDocumentClick();
            } else {
                this.$emit('btn-save-rec-event');
            }
            this.isLoadingSave = true;
        },
        submitData(applyForTheFollowingCardsAlso) {
            if(this.isFirstEventRecurring && applyForTheFollowingCardsAlso){
                this.isCloneType = false
            }
            setTimeout(()=>{
                this.$refs.subSubmitView.handlerSubmitDocumentClick();
            }, 100)
        },
        close() {
            this.dialog = false;
            this.confirm = false;
            this.show_btnedit = false;
            this.isViewEventDetail = false;
            this.isLoadingSave = false;
            this.isDisableButtonSave = true;
            this.isViewEventEdit = false;
            this.$emit('btnclose-clicked', this.idEvent);
            $('#detail-event').css('display', 'none');
            $('.dhx_form_repeat').css('display', 'none');
            this.customDataEventRec = {};
            this.$emit('scheduler-set-event-has-recurring', false);
        },
        closeDialog() {
            this.dialog = false;
            this.confirm = false;
            this.show_btnedit = false;
            this.isViewEventDetail = false;
            this.isLoadingSave = false;
            this.isDisableButtonSave = true;
            $('.dhx_cal_cover').css('display', 'none');
            $('.dhx_cal_light').css('display', 'none');
            $('#detail-event').css('display', 'none');
            $('.dhx_form_repeat').css('display', 'none');
            this.customDataEventRec = {};
        },
        openTabShowConfigRec() {
            const a = document.getElementById('detail-event');
            document.querySelector('.dhx_cal_light').appendChild(a);
            this.value = 1;
            $('.dhx_form_repeat').css('display', 'block');
            this.$emit('scheduler-set-event-has-recurring', true);
        },
        openTabShowDetailEvent() {
            this.value = 0;
            $('.dhx_form_repeat').css('display', 'none');
        },
        submitEventError() {
            this.$snotifyError(this.$t('v2.doc.error'), this.$t('v2.doc.errorSubmit'));
        },
        continueSubmit() {
            this.isLoadingSave = false;
        },
        enableButtonSave() {
            this.isLoadingSave = false;
        }
    }
};
</script>

<style scoped>
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
.btn-close {
    margin-left: 10px;
    width: 20px !important;
    height: 20px !important;
}
</style>
