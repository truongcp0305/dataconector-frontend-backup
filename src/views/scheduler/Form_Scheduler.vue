<template>
    <div style="position: relative; width: 100%; height: 100%">
        <SymperScheduler
            ref="scheduler"
            class="left-container"
            :style="{
                width: schedulerWidth + '!important',
                'margin-top': isAddFilter ? '37px' : ''
            }"
            @scheduler-event-click="handleEventClick"
            @scheduler-event-dragend="handleEventDragEnd"
            @scheduler-onViewChange="handleOnViewChange"
            @add-event-from-tree="handleAddEventFromTree"
            @add-event-after-drag="handleAddEventAfterDrag"
            @scheduler-handle-copy-event="handleCopyEvent"
            @scheduler-event-changed="handleEventChanged"
            @scheduler-event-beforechanged="handleEventBeforeChanged"
            @add-event-after-click-button-add="
                handleAddEventAfterClickButtonAdd
            "
            @schedule-get-id-eventadded="handleGetIdEventAdded"
            :groupConfig="groupConfig"
            v-if="isLoadingGetConfigScheduler"
            @detailEvent="showRecordDetail"
            @get-event-scheduler="getEventScheduler"
            :events="events"
            @update-format-event="updateColorEvent"
            @refresh-group="refreshGroup"
            :isViewTree="isViewTree"
            @scheduler-on-save-event="handleOnSaveEvent"
            @get-new-format-for-a-event="getNewFormatForAEvent"
            :cardConfig="cardConfig"
            :isAddFilter="isAddFilter"
            @resize-scheduler-view-timeline-week="
                handleResizeSchedulerWhenViewTimelineWeek
            "
            :isShowGroup="isShowGroup"
            :instanceKey="instanceKey"
            :isCloneEvent="isCloneEvent"
            :listPermission="listPermission"
            :hasTreeConfig="treeConfig && treeConfig.length > 0"
            :userColumnControl="userColumnControl"
            :viewModeScheduler="viewModeScheduler"
        >
        </SymperScheduler>
        <SelectBar
            :viewChange="viewChange"
            :idEvent="idcurrentEvent"
            :currentEvent="currentEvent"
            ref="selectBar"
            @delEvent="handleEventDeleted"
            @editEvent="handleEventEdit"
            @detailEvent="handleEventDetail"
            @nextweek="handleNextWeek"
            @close-tooltip-event="handleCloseTooltipEvent"
            @clone-event="handleCloneEvent"
            :listPermission="listPermission"
        />
        <DelConfirm
            ref="deleteconfirm"
            :idEvent="idcurrentEvent"
            @delconfirm="handledelconfirm"
        >
        </DelConfirm>
        <DetailEventForm
            ref="detaileventform"
            :idEvent="idcurrentEvent"
            :currentEvent="currentEvent"
            :cardConfig="cardConfig"
            @btnsave-clicked="handleEditEventAfterSubmit"
            @btnclose-clicked="handleBtnCloseDetail"
            @btn-save-rec-event="handleBtnSaveRecEvent"
            @scheduler-set-event-has-recurring="
                setStatusEventHasConfigRecurring
            "
            :isFirstEventRecurring="isFirstEventRecurring"
            :listPermission="listPermission"
        >
        </DetailEventForm>
        <RepeatConfirm
            ref="repeatconfirm"
            :idEvent="idcurrentEvent"
            @repeatconfirm="handleRepeatConfirm"
            @cancel-change-event-rec="cancelChangeEventRec"
        >
        </RepeatConfirm>
        <CreateEvent
            ref="createevent"
            :idEvent="idEventAdded"
            :docSubFormId="idDoc"
            :currentEvent="currentEvent"
            @btnsave-clicked="handleAddEventAfterSubmit"
            @btnclose-clicked="handleBtnCloseClicked"
            @scheduler-set-event-has-recurring="
                setStatusEventHasConfigRecurring
            "
        />
        <v-navigation-drawer
            v-show="isOpenFilterScheduler"
            absolute
            right
            :style="{
                width: '250px',
                height: isAddFilter ? 'calc(100% - 48px)' : 'calc(100% - 12px)',
                top: isAddFilter ? '36px' : '',
                'z-index': '1000',
                'overflow-y': 'scroll',
                'border-top': '1px solid #eee',
                'box-shadow': '-2px 0 10px rgba(0, 0, 0, 0.19)'
            }"
            class="sidebar-filter-scheduler"
        >
            <ReportSelfFilter
                v-if="isLoadingGetConfigScheduler"
                @close="closeFilterColumn"
                :report="dataForSelfFilter"
                :isViewScheduler="true"
                @apply-self-filter="applySelfFilter"
                :idDoc="idDoc"
            />
        </v-navigation-drawer>
    </div>
</template>

<script>
import SymperScheduler from '@/components/scheduler/Scheduler.vue';
import SelectBar from '@/components/scheduler/SelectBar.vue';
import DelConfirm from '@/components/scheduler/DeleteConfirm.vue';
import DetailEventForm from '@/components/scheduler/DetailEventForm.vue';
import SchedulerEndUserWorker from 'worker-loader!@/worker/scheduler/SchedulerViewEndUser.Worker.js';
import RepeatConfirm from '@/components/scheduler/RepeatConfirm.vue';
import CreateEvent from '@/components/scheduler/CreateEvent.vue';
import { schedulerApi } from '@/api/scheduler.js';

import { util } from '@/plugins/util';
import ReportSelfFilter from '@/components/dashboard/components/ReportSelfFilter.vue';
export default {
    name: 'SchedulerViewEndUser',
    props: {
        msg: String,
        idDoc: {
            type: String,
            default: '3930'
        },
        filterScheduler: {
            type: Object,
            default() {
                return {};
            }
        },
        instanceKey: {
            default: ''
        },
        userColumnControl: {
            type: Array,
            default() {
                return []
            }
        },
        viewModeScheduler: {
            type: String,
            default: ''
        }
    },
    data: () => ({
        idEventAdded: null,
        isViewScheduler: false,
        viewChange: null,
        idcurrentEvent: null,
        currentEvent: null,
        cardConfig: {},
        conditionalFormat: [],
        groupConfig: [],
        schedulerEndUserWorker: null,
        isLoadingGetConfigScheduler: false,
        events: [],
        isRefresh: false,
        groupFilter: null,
        isViewTree: false,
        formulaUpdate: '',
        idDocAddded: null,
        eventAdded: null,
        textDocAddded: null,
        dataForSelfFilter: {},
        isOpenFilterScheduler: false,
        isAddFilter: false,
        listControlInDoc: [],
        schedulerWidth: '100%',
        nameDoc: '',
        applyOnlyForCurrentEvent: false,
        applyForTheFollowingCardsAlso: false,
        delEventRec: false,
        isEditEventRec: false,
        eventEdit: null,
        idEventEdit: null,
        originalEvent: null,
        dataResponSubmit: null, // xử lý sau khi submit ở 2 hàm handleAddEventAfterSubmit và handleOnSaveEvent nên cần biến trung gian lưu trữ data
        repeatConfirm: null,
        eventHasConfigRecurring: false,
        isShowGroup: false,
        isCloneEvent: false,
        isShowFormWhenDrag: false,
        listPermission: null,
        treeConfig: null,
    }),
    components: {
        SymperScheduler,
        SelectBar,
        DelConfirm,
        DetailEventForm,
        RepeatConfirm,
        CreateEvent,
        ReportSelfFilter
    },
    computed: {
        conditionalFormatEndUser() {
            return util
                .cloneDeep(this.$store.state.scheduler.conditionalFormat)
                .reverse();
        },
        allUsers() {
            return this.$store.state.app.allUsers;
        },
        isFirstEventRecurring() {
            if (this.idcurrentEvent) {
                const words = this.idcurrentEvent.split('#');
                if (words.length > 1) {
                    var ce = this.$refs.scheduler.getEvent(words[0]);
                    if (ce.date == this.currentEvent.start_date_formated) {
                        return true;
                    } else return false;
                } else return false;
            }
        }
    },
    watch: {
        isOpenFilterScheduler(vl) {
            this.checkWidthSchedulerWhenOpenSidebarFilter();
            this.$refs.scheduler.checkAndResizeScheduler();
        },
        $route(to, from) {
            $('#detail-event').css('display', 'none');
            $('.dhx_form_repeat').css('display', 'none');
            $('#create-event').css('display', 'none');
            $('.dhx_cal_cover').css('display', 'none');
        }
    },
    methods: {
        getTreeIdForNewEvent(dataEvent){
            let treeId = ''
            this.treeConfig.map(c=>{
                treeId += dataEvent[c] + '_'
            })
            treeId = treeId.slice(0, -1);
            return treeId
        },
        getAllPermission() {
            let docId = this.idDoc;
            let documentInstancePermission =
                this.$store.state.app.userOperations['document_instance'];
            let documentDefinitonPermission =
                this.$store.state.app.userOperations['document_definition'];
            if (!util.auth.isSupportter()) {
                if(documentInstancePermission && documentInstancePermission[docId + ':0']){
                    this.listPermission = documentInstancePermission[docId + ':0']
                }
                if(documentDefinitonPermission && documentDefinitonPermission[docId]){
                    this.listPermission = {... this.listPermission, ... documentDefinitonPermission[docId]}
                }
            }else {
                this.listPermission = {
                    "update": true,
                    "submit": true,
                    "delete": true,
                    "detail": true,
                    "clone": true
                }
            }
        },
        setStatusEventHasConfigRecurring(hasConfigRec) {
            this.eventHasConfigRecurring = hasConfigRec;
            this.$refs.scheduler.setStatusEventHasConfigRecurring(hasConfigRec);
        },
        handleAddEventAfterSubmit(dataResponSubmit) {
            this.idDocAddded = dataResponSubmit['document_object_id'];
            this.textDocAddded = dataResponSubmit[this.cardConfig.title.field];
            this.dataResponSubmit = dataResponSubmit;
            this.$refs.scheduler.saveLightbox(
                dataResponSubmit[this.cardConfig.title.field],
                dataResponSubmit['document_object_id']
            );
            this.$refs.scheduler.endLightbox();
        },

        handleOnSaveEvent(dataE) {
            var data = {};
            data.id = this.idDocAddded;
            data.text = this.textDocAddded;
            data.date = this.$refs.scheduler.dateView;
            if (this.cardConfig.other) {
                data.other = this.dataResponSubmit[this.cardConfig.other.field];
            }
            if (this.cardConfig.type) {
                data.type = this.dataResponSubmit[this.cardConfig.type.field];
            }
            if (this.cardConfig.user) {
                data.user = this.dataResponSubmit[this.cardConfig.user.field];
            }
            data.originRowData = this.dataResponSubmit;
            data.end_date = this.dataResponSubmit[
                this.cardConfig.end_date.field
            ].concat(
                ' ' + this.dataResponSubmit[this.cardConfig.end_time.field]
            );
            data.start_date = this.dataResponSubmit[
                this.cardConfig.start_date.field
            ].concat(
                ' ' + this.dataResponSubmit[this.cardConfig.start_time.field]
            );
            if(this.treeConfig && this.$refs.scheduler.switchtext == 'Timeline'){
                data.treeId = this.getTreeIdForNewEvent(this.dataResponSubmit);
            }
            if (dataE._end_date && this.$refs.scheduler.applyRec) {
                // nếu có config recurring
                data.end_date = dataE._end_date;
                data.rec_type = dataE.ev.rec_type;
                data.id_event = this.idDocAddded;
                var t1 = new Date(
                    this.dataResponSubmit[
                        this.cardConfig.start_date.field
                    ].concat(
                        ' ' +
                            this.dataResponSubmit[
                                this.cardConfig.start_time.field
                            ]
                    )
                );
                var t2 = new Date(
                    this.dataResponSubmit[
                        this.cardConfig.end_date.field
                    ].concat(
                        ' ' +
                            this.dataResponSubmit[
                                this.cardConfig.end_time.field
                            ]
                    )
                );
                var dif = (t2.getTime() - t1.getTime()) / 1000;

                data.event_length = dif;

                data.event_pid = 0;
            }

            if (
                // user không nhập 2 trường thông tin start_time và end_time
                !this.dataResponSubmit[this.cardConfig.start_time.field] &&
                !this.dataResponSubmit[this.cardConfig.end_time.field]
            ) {
                data.start_date = data.date + ' 00:00:00';
                if (dataE._end_date && this.$refs.scheduler.applyRec) {
                    // có config recurring
                    data.event_length = 7200; // event 2 tiếng
                    this.$refs.scheduler.addEventRecurring(data);
                    schedulerApi.recurring(data).then((res) => {});
                } else {
                    // không config recurring
                    data.end_date = data.date + ' 02:00:00';
                    this.$refs.scheduler.addEvent(data, this.dataResponSubmit);
                }

                // update thời gian bắt đầu, thời gian kết thúc vào bản ghi khi user ko nhập thời gian
                let event = {};
                event.start_date_formated =
                    this.dataResponSubmit[this.cardConfig.start_date.field];
                event.end_date_formated =
                    this.dataResponSubmit[this.cardConfig.end_date.field];
                event.start_time_formated = '00:00:00';
                event.end_time_formated = '02:00:00';
                event['id'] = this.idDocAddded;
                let config = {
                    cardConfig: this.cardConfig,
                    event: event,
                    idDoc: this.idDoc
                };
                this.schedulerEndUserWorker.postMessage({
                    action: 'updateDocument',
                    data: config
                });
            } else {
                if (dataE._end_date && this.$refs.scheduler.applyRec) {
                    // nếu là event đầu chuỗi rec -> chỉ edit, ko add rec mới
                    if (this.isFirstEventRecurring) {
                        this.$refs.scheduler.editEventRecurringAfterEdit(data);
                    } else {
                        this.$refs.scheduler.addEventRecurring(data);
                    }
                    schedulerApi.recurring(data).then((res) => {});
                } else {
                    // ko config rec
                    this.$refs.scheduler.addEvent(data, this.dataResponSubmit);
                }
            }
            this.$refs.scheduler.endLightbox();
            this.isCloneEvent = false;
        },
        handleBtnCloseDetail(id) {
            this.$refs.scheduler.endLightbox();
        },
        handleBtnCloseClicked() {
            this.$refs.scheduler.deleteEvent(this.idEventAdded);
            this.$refs.scheduler.endLightbox();
        },
        handleAddEventAfterDrag(data) {
            this.idEventAdded = data.id.toString();
            let event = this.$refs.scheduler.getEvent(data.id);
            this.eventAdded = event;
            let dataEventAdded = {};
            dataEventAdded[this.cardConfig.start_date.field] =
                event.start_date_formated;
            dataEventAdded[this.cardConfig.end_date.field] =
                event.end_date_formated;
            dataEventAdded[this.cardConfig.start_time.field] =
                event.start_time_formated;
            dataEventAdded[this.cardConfig.end_time.field] =
                event.end_time_formated;
            if(this.treeConfig && this.$refs.scheduler.switchtext == 'Timeline' && event.treeId){
                dataEventAdded[this.treeConfig[this.treeConfig.length - 1]] = event.treeId.split('_')[this.treeConfig.length - 1]
            }
            this.$refs.createevent.showAdd(dataEventAdded);
        },
        handleOnBtnAddEventClicked() {
            this.$refs.scheduler.addEventDefaut();
            this.$refs.createevent.showAdd();
        },
        handleAddEventAfterClickButtonAdd(data) {
            this.idEventAdded = data.id.toString();
        },
        handleGetIdEventAdded(data) {
            // xóa event ảo do thư viện tự động sinh ra với logic sử lý mở form nhập liệu khi kéo thả sau đó add lại event cũ
            if(this.isShowFormWhenDrag && data.e.rec_type == "" && data.e.event_pid){
                this.$refs.scheduler.deleteEvent(data.e.id)
                setTimeout(() => {
                    this.$refs.scheduler.addEventRecurring(
                        this.originalEvent.original_event
                    );               
                });
            }else {
                this.idEventAdded = data.e.id.toString(); 
            }
        },
        handleBtnSaveRecEvent() {
            this.$refs.repeatconfirm.show();
        },
        handleRepeatConfirm(data) {
            this.applyOnlyForCurrentEvent = data.checkbox1;
            this.applyForTheFollowingCardsAlso = data.checkbox2;
            this.repeatConfirm = true;
            if (this.isEditEventRec == true && this.delEventRec == false) {
                // update event ảo khi drag
                if (data.checkbox1 == true) {
                    // chỉ áp dụng cho thẻ này
                    // không insert vào dtb document, add a record in dtb recurring với rec_type = rỗng -> khi đến thời điểm recurring vẫn tự động sinh bản ghi
                    const words = this.idEventEdit.split('#');
                    let data_event = {};
                    data_event.text = this.originalEvent.original_event.text;
                    data_event.end_date = this.eventEdit.end_time_recurring;
                    data_event.start_date = this.eventEdit.start_time_recurring;
                    data_event.event_pid = words[0];
                    data_event.rec_type = '';
                    data_event.event_length = words[1];

                    schedulerApi.recurring(data_event).then((res) => {
                        if (res.status == 200) {
                            // update thành event có rec_type = rỗng
                            let eventRec = this.$refs.scheduler.getEvent(
                                Number(this.idEventAdded)
                            );
                            var eventOrigin = this.$refs.scheduler.getEvent(
                                words[0]
                            );
                            this.$refs.scheduler.updateEventRecWithRecTypeEmpty(
                                eventRec,
                                res.data.id,
                                eventOrigin.originRowData
                            );
                        }
                    });
                    this.eventEdit = null;
                } else if (data.checkbox2 == true) {
                    const words = this.idEventEdit.split('#');

                    var event = this.$refs.scheduler.getEvent(words[0]);
                    this.schedulerEndUserWorker.postMessage({
                        action: 'handleCopyEvent',
                        data: {
                            event: event,
                            idDoc: this.idDoc,
                            cardConfig: this.cardConfig,
                            eventEdit: this.eventEdit
                        }
                    });
                }
                this.isEditEventRec = false;
            } else if (this.delEventRec == true) {
                this.$refs.deleteconfirm.show();
                this.eventEdit = null;
            } else {
                // update event ảo khi nhâp liệu
                this.$refs.detaileventform.submitData(
                    this.applyForTheFollowingCardsAlso
                );
                this.eventEdit = null;
            }
        },
        cancelChangeEventRec(id) {
            this.repeatConfirm = false;
            this.$refs.detaileventform.enableButtonSave();
            if (this.delEventRec == true) {
            } else if (this.isEditEventRec == true) {
                this.$refs.scheduler.deleteEvent(this.idEventAdded);
                this.$refs.scheduler.addEventRecurring(
                    this.originalEvent.original_event
                );

                this.isEditEventRec = false;
            } else {
                this.$refs.detaileventform.show_returnrepeat(id);
            }
        },
        handleAfterCopyEventSuccess(res) {
            if (this.applyOnlyForCurrentEvent == true) {
                this.applyOnlyForCurrentEvent = false;
            } else if (this.applyForTheFollowingCardsAlso == true) {
                this.$refs.scheduler.deleteEvent(this.idEventAdded); // xóa event ảo do thư viện mặc định sinh ra
                const words = this.idEventEdit.split('#');

                var event = this.$refs.scheduler.getEvent(words[0]);

                var data = {
                    end_date:
                        this.originalEvent.original_event.start_date_format
                };
                schedulerApi.updateRecurring(words[0], data).then((res) => {});
                if (
                    event.start_time_recurring ==
                    this.originalEvent.original_event.start_date_format
                ) {
                    this.schedulerEndUserWorker.postMessage({
                        action: 'deleteEvent',
                        data: words[0]
                    });
                }
                let data_event = {};
                data_event.start_date = this.eventEdit.start_time_recurring;
                data_event.text = this.originalEvent.original_event.text;
                data_event.end_date = event.end_time_recurring;

                data_event.event_pid = '0';
                data_event.id_event = res.data['document_object_id'];
                data_event.rec_type = event.rec_type;
                data_event.id = res.data['document_object_id'];

                var t1 = new Date(this.eventEdit.start_time_recurring);
                var t2 = new Date(this.eventEdit.end_time_recurring);
                data_event.event_length = (t2.getTime() - t1.getTime()) / 1000;
                if(this.treeConfig && this.$refs.scheduler.switchtext == 'Timeline'){
                    data_event.treeId = this.getTreeIdForNewEvent(res.data);
                }

                // tao event voi rectype none de scheduler khong duplicate o thoi diem chinh sua event
                let data_rec_none = {
                    text: this.originalEvent.original_event.text,
                    end_date: this.originalEvent.original_event.end_date,
                    start_date: this.originalEvent.original_event.start_date,
                    event_pid: this.originalEvent.original_event.event_pid,
                    event_length: words[1],
                    rec_type: 'none'
                };

                this.$refs.scheduler.updateEventRecurringAffterSave(
                    this.idEventEdit,
                    this.originalEvent.original_event.start_date
                );

                this.$refs.scheduler.addEventRecurringAfterEdit(
                    data_event,
                    this.originalEvent.original_event.originRowData
                );
                schedulerApi.recurring(data_event).then((res) => {});
                this.applyForTheFollowingCardsAlso = false;
            } else {
                // add event after clone
                this.currentEvent.id = res.data['document_object_id'];
                this.$refs.scheduler.addEvent(this.currentEvent, res);
            }
            this.eventEdit = null;
        },

        handleEditEventAfterSubmit(dataResponUpdate) {
            var data_event = {};
            data_event.text = dataResponUpdate[this.cardConfig.title.field];
            data_event.start_date = dataResponUpdate[
                this.cardConfig.start_date.field
            ].concat(' ' + dataResponUpdate[this.cardConfig.start_time.field]);
            data_event.end_date = dataResponUpdate[
                this.cardConfig.end_date.field
            ].concat(' ' + dataResponUpdate[this.cardConfig.end_time.field]);
            data_event.date = this.$refs.scheduler.dateView;
            if (this.cardConfig.other) {
                data_event.other =
                    dataResponUpdate[this.cardConfig.other.field];
            }
            if (this.cardConfig.type) {
                data_event.type = dataResponUpdate[this.cardConfig.type.field];
            }
            if (this.cardConfig.user) {
                data_event.user = dataResponUpdate[this.cardConfig.user.field];
            }
            data_event.originRowData = dataResponUpdate;
            if(this.treeConfig && this.$refs.scheduler.switchtext == 'Timeline'){
                data_event.treeId = this.getTreeIdForNewEvent(dataResponUpdate);
            }

            const words = this.idcurrentEvent.split('#');
            if (words.length > 1) {
                // edit event recurring
                if (this.applyOnlyForCurrentEvent == true) {
                    // sau khi insert object to document , add a record in dtb recurring với rec_type = none -> khi đến thời điểm recurring ko tự động sinh bản ghi nữa
                    data_event.event_pid = words[0];
                    data_event.rec_type = 'none';
                    data_event.rec_pattern = '';
                    data_event.event_length =
                        new Date(
                            this.currentEvent.start_time_recurring.concat(
                                ' GMT+0700'
                            )
                        ).getTime() / 1000;

                    this.$refs.scheduler.editEventRecurringWhenSubmit(
                        data_event,
                        this.idcurrentEvent,
                        dataResponUpdate
                    );

                    this.$refs.scheduler.endLightbox();

                    schedulerApi.recurring(data_event).then((res) => {
                        console.log(res);
                    });
                    this.applyOnlyForCurrentEvent = false;
                } else if (this.applyForTheFollowingCardsAlso == true) {
                    // update chuỗi event rec cũ phía front-end

                    this.$refs.scheduler.updateEventRecurringAffterSave(
                        this.idcurrentEvent,
                        new Date(this.currentEvent.start_time_recurring)
                    );

                    // update rec cũ trong dtb rec
                    schedulerApi
                        .updateRecurring(words[0], {
                            end_date: this.currentEvent.start_time_recurring
                        })
                        .then((res) => {});

                    // add chuỗi rec mới
                    this.idDocAddded = dataResponUpdate['document_object_id'];
                    this.textDocAddded =
                        dataResponUpdate[this.cardConfig.title.field];
                    this.dataResponSubmit = dataResponUpdate;
                    this.$refs.scheduler.saveLightbox(
                        dataResponUpdate[this.cardConfig.title.field],
                        dataResponUpdate['document_object_id']
                    );
                }
            } else {
                // edit event thường
                if (
                    this.eventHasConfigRecurring &&
                    this.$refs.scheduler.applyRec
                ) {
                    // check xem có cấu hình rec hay ko, tái sử dụng hàm handleOnSaveEvent để xử lý lưu cấu hình rec
                    if (this.currentEvent.rec_type == '') {
                        // event ảo đã bị tách khỏi chuỗi rec đã được submit để insert vào dtb document -> sửa rec_type = none ở dtb recurring để tránh hiển thị double, lần sau tới thời điểm sẽ không tự động sinh bản ghi
                        schedulerApi
                            .updateRecWithEventEditted(this.idcurrentEvent)
                            .then((res) => {});
                    }
                    this.idDocAddded = dataResponUpdate['document_object_id'];
                    this.textDocAddded =
                        dataResponUpdate[this.cardConfig.title.field];
                    this.dataResponSubmit = dataResponUpdate;
                    this.$refs.scheduler.saveLightbox(
                        dataResponUpdate[this.cardConfig.title.field],
                        dataResponUpdate['document_object_id']
                    );
                    this.$refs.scheduler.endLightbox();
                } else {
                    data_event.id = dataResponUpdate['document_object_id'];
                    if (
                        this.$refs.scheduler.getEvent(
                            dataResponUpdate['document_object_id']
                        )
                    ) {
                        // xóa -> add
                        this.$refs.scheduler.deleteEvent(
                            dataResponUpdate['document_object_id']
                        );

                        this.$refs.scheduler.addEvent(
                            data_event,
                            dataResponUpdate
                        );
                    } else {
                        // add event after clone
                        this.$refs.scheduler.addEvent(
                            data_event,
                            dataResponUpdate
                        );
                    }
                    this.$refs.scheduler.endLightbox();
                }
            }
        },
        listenFromWorker() {
            let self = this;
            this.schedulerEndUserWorker.addEventListener(
                'message',
                function (event) {
                    let data = event.data;
                    let action = data.action;
                    if (self[action]) {
                        self[action](data.data);
                    } else {
                        console.error(` action ${action} not found `);
                    }
                }
            );
        },
        handledelconfirm(id) {
            if (this.delEventRec == true) {
                if (this.applyOnlyForCurrentEvent == true) {
                    let data_event = {};
                    data_event.text = this.currentEvent.text;
                    data_event.end_date = this.currentEvent.end_time_recurring;
                    data_event.start_date =
                        this.currentEvent.start_time_recurring;
                    data_event.event_pid = this.currentEvent.event_pid;
                    data_event.rec_type = 'none';
                    data_event.event_length =
                        new Date(
                            data_event.start_date.concat(' GMT+0700')
                        ).getTime() / 1000;

                    this.$refs.scheduler.delEventRecurring(id);
                    schedulerApi.recurring(data_event).then((res) => {});
                    this.applyOnlyForCurrentEvent = false;
                    this.delEventRec = false;
                } else if (this.applyForTheFollowingCardsAlso == true) {
                    const words = this.idcurrentEvent.split('#');
                    var ce = this.$refs.scheduler.getEvent(id);
                    var original_ev = this.$refs.scheduler.getEvent(words[0]);

                    this.$refs.scheduler.delEventRecurringSeries(id);

                    var data = {
                        end_date: this.currentEvent.start_time_recurring
                    };
                    // neu xoa the reccurring goc thi xoa luon ban ghi .
                    if (
                        ce.start_time_recurring ==
                        original_ev.start_time_recurring
                    ) {
                        this.$refs.scheduler.deleteEvent(words[0]);
                        this.schedulerEndUserWorker.postMessage({
                            action: 'deleteEvent',
                            data: words[0]
                        });
                    }

                    schedulerApi.updateRecurring(words[0], data).then((res) => {
                        console.log(res);
                    });

                    this.applyForTheFollowingCardsAlso = false;
                    this.delEventRec = false;
                }
            } else {
                if (this.currentEvent.rec_type == '') {
                    // event ảo đã bị tách khỏi chuỗi rec -> update rec_type = none
                    schedulerApi
                        .updateRecWithEventEditted(this.idcurrentEvent)
                        .then((res) => {});
                } else {
                    this.schedulerEndUserWorker.postMessage({
                        action: 'deleteEvent',
                        data: id
                    });
                }
                this.$refs.scheduler.deleteEvent(id);
            }
            this.$refs.scheduler.updateView();
        },

        handleEventDeleted() {
            const words = this.idcurrentEvent.split('#');
            if (words.length > 1) {
                this.delEventRec = true;
                this.$refs.repeatconfirm.show();
            } else this.$refs.deleteconfirm.show();
        },
        handleEventEdit(id, newValueControl) {
            const words = id.split('#');
            if (words.length > 1) {
                // sử dụng id event gốc để show lightbox -> sau khi save lightbox sẽ mất cấu hình rec cũ
                // sử dụng id ảo để show lightbox -> thư viện không hỗ trợ cấu hình rec cho id event ảo
                // add event ảo để lấy cấu hình rec mới cho event ảo trong chuỗi rec
                this.$refs.scheduler.addEventDefaut();
            } else this.$refs.scheduler.showLightbox(id);
            if(newValueControl){
                this.$refs.detaileventform.showEdit(id, newValueControl)
            }else {
                this.$refs.detaileventform.showEdit(id);
            }
        },
        handleEventDetail(id) {
            this.$refs.scheduler.showLightbox(id);
            this.$refs.detaileventform.show(id);
        },
        showRecordDetail(id) {
            this.$evtBus.$emit('scheduler-view-record', id);
        },
        handleClickedFilter() {
            this.$refs.scheduler.showFilter();
        },
        handleNextWeek(id) {
            let event = this.$refs.scheduler.getEvent(id);
            const words = id.split('#');
            if (words.length > 1) {
                let data_event = {};
                data_event.text = this.currentEvent.text;
                data_event.end_date = this.currentEvent.end_time_recurring;
                data_event.start_date = this.currentEvent.start_time_recurring;
                data_event.event_pid = this.currentEvent.event_pid;
                data_event.rec_type = 'none';
                data_event.event_length =
                    new Date(
                        data_event.start_date.concat(' GMT+0700')
                    ).getTime() / 1000;

                this.$refs.scheduler.delEventRecurring(id);
                schedulerApi.recurring(data_event).then((res) => {});

                var event_or = this.$refs.scheduler.getEvent(words[0]);
                const start_date = new Date(event.start_date_formated);
                start_date.setDate(start_date.getDate() + 7);

                var nextWeek = {
                    start_date_formated: start_date.toISOString().slice(0, 10),
                    end_date_formated: event.end_date_formated,
                    start_time_formated: event.start_time_formated,
                    end_time_formated: event.end_time_formated
                };
                this.schedulerEndUserWorker.postMessage({
                    action: 'handleCopyEvent',
                    data: {
                        event: event_or,
                        idDoc: this.idDoc,
                        cardConfig: this.cardConfig,
                        eventEdit: nextWeek
                    }
                });
            } else {
                this.$refs.scheduler.nextweek(id);
                let event = this.$refs.scheduler.getEvent(id);

                event.originRowData[this.cardConfig.start_date.field] =
                    event.start_date_formated;
                event.originRowData[this.cardConfig.end_date.field] =
                    event.end_date_formated;

                let config = {
                    cardConfig: this.cardConfig,
                    event: event,
                    idDoc: this.idDoc
                };
                this.schedulerEndUserWorker.postMessage({
                    action: 'updateDocument',
                    data: config
                });
            }
        },
        handleCloneEvent(id) {
            this.isCloneEvent = true;
            this.$refs.scheduler.showLightbox(id);
            this.$refs.detaileventform.showClone(id);
        },
        handleEventClick(data) {
            let id = data.id;
            let e = data.event;
            e.curTarget = e.target;
            this.idcurrentEvent = id;
            var ce = this.$refs.scheduler.getEvent(id);
            console.log(ce);
            this.currentEvent = util.cloneDeep(ce);
            this.$refs.selectBar.show(e, $('.left-container'));
            this.$refs.scheduler.selectEvent(id);
            const words = id.split('#');
        },
        handleAddEventFromTree(id) {
            // cùng doc -> update bản ghi theo time mới
            // khác doc -> insert
            this.$refs.scheduler.selectEvent(id);
            let customEvent = this.$refs.scheduler.getEvent(id);
            var checkIsOtherDocument = false;
            let groupFormula = '';
            let docName = '';
            let objectDoc = {};

            this.groupConfig.map((gr) => {
                let formulaLowerCase =
                    gr.formulaValue[gr.id].value.toLowerCase();
                let indexOfFrom = formulaLowerCase.indexOf('from');
                let indexOfWhere = formulaLowerCase.indexOf('where');

                let formula = gr.formulaValue[gr.id].value;
                docName = formula.slice(indexOfFrom + 4, indexOfWhere).trim();

                if (
                    !(
                        docName == this.nameDoc ||
                        docName == 'document_' + this.nameDoc
                    )
                ) {
                    gr.data.map((data) => {
                        if (data.document_object_id == id) {
                            objectDoc = data;
                            groupFormula = formula;
                            checkIsOtherDocument = true;
                        }
                    });
                }
            });
            // khác doc
            if (checkIsOtherDocument) {
                let config = {
                    cardConfig: this.cardConfig,
                    event: customEvent,
                    idDoc: this.idDoc,
                    groupFormula: groupFormula,
                    docName: docName,
                    objectDoc: objectDoc
                };
                this.schedulerEndUserWorker.postMessage({
                    action: 'insertDocuemntWhenDragFromTree',
                    data: config
                });
            } else {
                // cùng doc
                let config = {
                    cardConfig: this.cardConfig,
                    event: customEvent,
                    idDoc: this.idDoc
                };
                this.schedulerEndUserWorker.postMessage({
                    action: 'updateDocument',
                    data: config
                });
            }
        },
        // lay event truoc khi thay doi de lay du lieu phuc vu edit recurring
        handleEventBeforeChanged(original_event) {
            this.originalEvent = original_event;
            // const words = original_event.original_event.id.split('#');
        },
        handleEventChanged(data) {
            // nội dung hàm chỉ nhắm xử lý event rec
            // logic xử lý chọn action "Quay lại" khi xác nhận thay đổi event rec
            // lần đầu thay đổi, thư viện tự động xóa event gốc -> add event mới
            // chọn "Quay lại" -> xóa event mới -> add 1 event giống event gốc ( event này do mình tự add nên lần kéo kéo thả chính event này thì thư viện sẽ ko tự động xóa cho mình)
            // -> cần phải xóa event mình vừa add ở trên đi
            const words = data.id.split('#');
            if (words.length > 1 && !this.isShowFormWhenDrag) {
                this.idEventEdit = data.id;
                let event = this.$refs.scheduler.getEvent(data.id);
                this.eventEdit = util.cloneDeep(event);
                this.$refs.scheduler.deleteEvent(data.id);
                this.isEditEventRec = true;
                this.$refs.repeatconfirm.show();
            }
        },
        checkEventRecurring(id) {
            const idEvent = id.split('#');
            if (idEvent.length > 1) {
                return true;
            } else return false;
        },
        handleEventDragEnd(data) {
            if(this.isShowFormWhenDrag){
                let event = this.$refs.scheduler.getEvent(data.id);

                // biến newValueControl để open form set giá trị mới
                let newValueControl = {
                    start_date: {
                        controlName: this.cardConfig.start_date.field,
                        newValue: event.start_date_formated
                    },
                    end_date: {
                        controlName: this.cardConfig.end_date.field,
                        newValue: event.end_date_formated
                    },
                    start_time: {
                        controlName: this.cardConfig.start_time.field,
                        newValue: event.start_time_formated
                    },
                    end_time: {
                        controlName: this.cardConfig.end_time.field,
                        newValue: event.end_time_formated
                    }
                }
                // reset event về trạng thái cũ
                event.start_date = this.originalEvent.original_event.start_date
                event.end_date = this.originalEvent.original_event.end_date
                event.start_time_recurring = this.originalEvent.original_event.start_date_format

                if(!this.checkEventRecurring(data.id)){
                    this.$refs.scheduler.updateEvent(event.id);
                }
                // nếu update event rec luôn -> id tạo ra sẽ là id ảo -> sử lý qua hàm handleGetIdEventAdded do thư viện tự động sinh ra 1 event ảo khi kéo event rec
                this.currentEvent = util.cloneDeep(event);
                this.idcurrentEvent = data.id;
                setTimeout(() => {
                    this.handleEventEdit(data.id, newValueControl)
                });
            }else {
                // nếu ko phải event recurring mới update, là event recurring sẽ show popup xác nhận ở hàm handleEventChanged
                if (!this.checkEventRecurring(data.id)) {
                    let id = data.id;
                    var event;
                    if (this.eventEdit) {
                        event = this.eventEdit;
                    } else {
                        event = this.$refs.scheduler.getEvent(id);
                    }
                    // check xem có phải event recurring đã được edit hay không ( chưa sinh bản ghi ) -> chỉ update event vào dtb rec
                    if (event.rec_type == '') {
                        let data = {
                            start_date: event.start_time_recurring,
                            end_date: event.end_time_recurring
                        };
                        schedulerApi
                            .updateRecurringWithRecTypeEmpty(event.id, data)
                            .then((res) => {});
                    } else {
                        // 3 control cần update
                        event.originRowData[this.cardConfig.start_date.field] =
                            event.start_date_formated;
                        event.originRowData[this.cardConfig.end_date.field] =
                            event.end_date_formated;
                        event.originRowData[this.cardConfig.start_time.field] =
                            event.start_time_formated;
                        event.originRowData[this.cardConfig.end_time.field] =
                            event.end_time_formated;
                        let config = {
                            cardConfig: this.cardConfig,
                            event: event,
                            idDoc: this.idDoc
                        };
                        if(this.treeConfig && this.$refs.scheduler.switchtext == 'Timeline'){
                            config.treeConfig = this.treeConfig
                        }
                        this.schedulerEndUserWorker.postMessage({
                            action: 'updateDocument',
                            data: config
                        });
                    }
                }
            }
        },
        handleOnViewChange(new_mode) {
            if (new_mode == 'month') {
                this.viewChange = 'month';
            } else {
                this.viewChange = 'false';
            }
            if (this.debounceRenderScheduler) {
                clearTimeout(this.debounceRenderScheduler);
            }
            let self = this;
            this.debounceRenderScheduler = setTimeout(async () => {
                if (self.$refs.scheduler.currentState == 'timeline_week') {
                    self.handleResizeSchedulerWhenViewTimelineWeek();
                }
            }, 1000);
            this.$evtBus.$emit('save-view-scheduler', new_mode);
        },
        getEventScheduler(schedulerSate) {
            this.isViewScheduler = true;
            let schedulerConfig = {
                idDoc: this.idDoc,
                cardConfig: this.cardConfig,
                schedulerSate: schedulerSate,
                conditionalFormat: this.conditionalFormat,
                allUsers: this.allUsers
            };
            if (this.groupFilter) {
                schedulerConfig['groupFilter'] = this.groupFilter;
            }
            if (this.treeConfig && this.$refs.scheduler.switchtext == 'Timeline') {
                schedulerConfig['treeConfig'] = this.treeConfig;
            }
            if (this.conditionalFormatEndUser) {
                schedulerConfig.conditionalFormat = [
                    ...this.conditionalFormat,
                    ...this.conditionalFormatEndUser
                ];
            }
            if (JSON.stringify(this.dataForSelfFilter) != '{}') {
                schedulerConfig['filter'] = this.dataForSelfFilter;
            }
            this.schedulerEndUserWorker.postMessage({
                action: 'getEventScheduler',
                data: schedulerConfig
            });
        },
        async handleGetScheduler(res) {
            try {
                this.groupConfig = JSON.parse(res.data[0].group_config);
                this.cardConfig = JSON.parse(res.data[0].card_config);
                // emit lên listItem để config conditional format
                this.$evtBus.$emit('get-card-scheduler', this.cardConfig);
                this.conditionalFormat = JSON.parse(
                    res.data[0].conditional_format
                );
                this.formulaUpdate = JSON.parse(res.data[0].formula_update);
                if(this.formulaUpdate.checkbox){
                    this.isShowFormWhenDrag = this.formulaUpdate.checkbox.value
                }
                var treeConfig = {
                        children: []
                    }
                if(res.data[0].tree_config){
                    treeConfig = JSON.parse(
                        res.data[0].tree_config
                    );
                }
                let columnsArr = []
                for (let i in treeConfig.children) {
                    if (treeConfig.children[i].value) {
                        columnsArr.push(treeConfig.children[i].value);
                    }
                }
                this.treeConfig = columnsArr
                this.nameDoc = res.data[0].name_doc;
                this.isLoadingGetConfigScheduler = true;

                if (this.isRefresh && this.$refs.scheduler) {
                    this.$refs.scheduler.refreshCanvasScheduler();
                }
                if (this.groupConfig.length != 0) {
                    // chạy công thức lấy group
                    this.schedulerEndUserWorker.postMessage({
                        action: 'getGroup',
                        data: this.groupConfig
                    });
                    this.isShowGroup = true;
                } else {
                    this.isShowGroup = false;
                }
            } catch (error) {
                this.$snotifyError(
                    'err',
                    this.$t('v2.scheduler.errorLoadData')
                );
            }
        },
        handleGetDataGroup(res) {
            for (let index = 0; index < res.length; index++) {
                if (res[index].data.data.length > 0) {
                    if (
                        this.groupConfig[index].id ==
                        Number(res[index].data.data[0].symper_scheduler_group)
                    ) {
                        this.$set(
                            this.groupConfig[index],
                            'data',
                            res[index].data.data
                        );
                    }
                } else {
                    this.$set(this.groupConfig[index], 'data', []);
                }
            }
            this.$refs.scheduler.checkCollapseGroup();
            this.$refs.scheduler.renderTreeListTask();
        },
        handleGetEventScheduler(res) {
            this.$refs.scheduler.createTreeView(res.listTree);
            let listEvents = util.cloneDeep(res.listEvents);
            this.$refs.scheduler.renderEvent(listEvents);
            this.events = util.cloneDeep(listEvents);
            this.$evtBus.$emit('finish-load-data');
        },
        refreshScheduler() {
            if (this.$route.params.id == this.idDoc) {
                if (this.debounceGetData) {
                    clearTimeout(this.debounceGetData);
                }
                let self = this;
                this.debounceGetData = setTimeout(async () => {
                    self.isRefresh = true;
                    self.events = [];
                    self.schedulerEndUserWorker.postMessage({
                        action: 'getScheduler',
                        data: self.idDoc
                    });
                }, 500);
            }
        },
        updateColorEvent(event) {
            let resetColor = this.$refs.scheduler.getDefaultFormat();
            event.colorConfig = util.cloneDeep(resetColor);
            this.getNewFormatForAEvent(event);
        },
        getNewFormatForAEvent(event) {
            let schedulerConfig = {
                idDoc: this.idDoc,
                cardConfig: this.cardConfig,
                conditionalFormat: this.conditionalFormat,
                updateEvent: true,
                allUsers: this.allUsers
            };
            if (this.conditionalFormatEndUser) {
                schedulerConfig.conditionalFormat = [
                    ...this.conditionalFormat,
                    ...this.conditionalFormatEndUser
                ];
            }
            this.schedulerEndUserWorker.postMessage({
                action: 'calcConditionalFormat',
                data: { events: [event], config: schedulerConfig }
            });
        },
        handleGetNewFormatForAEvent(newEvent) {
            this.$refs.scheduler.updateFormatEvent(newEvent[0]);
        },
        viewByTreeview(data) {
            this.filterTreeScheduler(data);
        },
        async filterTreeScheduler(filter) {
            this.groupFilter = filter;
            await this.refreshScheduler();
        },
        showformsubmitdoc() {
            this.$refs.detaileventform.show();
        },
        handleUpdateDocument(res) {
            res.event.originRowData = res.document;
            let event = this.$refs.scheduler.getEvent(res.event.id);
            if (event.text != res.document[this.cardConfig.title.field]) {
                event.text = res.document[this.cardConfig.title.field];
            }
            if (
                this.cardConfig.other &&
                res.document[this.cardConfig.other.field]
            ) {
                event.other = res.document[this.cardConfig.other.field];
            }
            if (
                this.cardConfig.type &&
                res.document[this.cardConfig.type.field]
            ) {
                event.type = res.document[this.cardConfig.type.field];
            }
            if (
                this.cardConfig.user &&
                res.document[this.cardConfig.user.field]
            ) {
                event.user = res.document[this.cardConfig.user.field];
            }
            this.$refs.scheduler.updateEvent(event.id);
            this.updateColorEvent(res.event);
            // chạy công thức update đã được config bên BA config
            if (this.formulaUpdate.script.value) {
                this.runFormulasUpdate(res.document);
            }
        },
        handleRunFormulaUpdateSuccess(data) {
            for (let object in data) {
                let config = {
                    idObject: data[object].document_object_id
                };
                this.schedulerEndUserWorker.postMessage({
                    action: 'updateDocumentAfterRunFormula',
                    data: config
                });
            }
        },
        handleUpdateDocumentAfterRunFormula(res) {
            let event = this.$refs.scheduler.getEvent(res.idObject);
            event.originRowData = res.document;
            event.text = res.document[this.cardConfig.title.field];
            if (this.cardConfig.other) {
                event.other = res.document[this.cardConfig.other.field];
            }
            if (this.cardConfig.type) {
                event.type = res.document[this.cardConfig.type.field];
            }
            if (this.cardConfig.user) {
                event.user = res.document[this.cardConfig.user.field];
            }
            this.$refs.scheduler.updateEvent(event.id);
            this.updateColorEvent(event);
        },
        refreshGroup() {
            this.schedulerEndUserWorker.postMessage({
                action: 'getGroup',
                data: this.groupConfig
            });
        },
        runFormulasUpdate(data) {
            let formulas = {
                dataInput: data,
                formulas: this.formulaUpdate
            };
            this.schedulerEndUserWorker.postMessage({
                action: 'runFormularUpdate',
                data: formulas
            });
        },
        handleCopyEvent(event) {
            this.schedulerEndUserWorker.postMessage({
                action: 'handleCopyEvent',
                data: {
                    event: event,
                    idDoc: this.idDoc,
                    cardConfig: this.cardConfig
                }
            });
        },
        openFilterScheduler() {
            // lấy lại filter khi đã cấu hình filter trước đó
            let hasFilterScheduler = false;
            if (JSON.stringify(this.dataForSelfFilter) != '{}') {
                hasFilterScheduler = true;
            }
            if (!hasFilterScheduler && !this.isAddFilter) {
                this.dataForSelfFilter = {};
                this.isOpenFilterScheduler = false;
            } else if (!hasFilterScheduler) {
                let defaultFilterConfig = {
                    hasSelfFilter: true,
                    rawConfigs: {
                        setting: {
                            column: {
                                selectedColums: []
                            }
                        },
                        style: {
                            title: {
                                children: {
                                    titleText: {
                                        value: ''
                                    }
                                }
                            }
                        }
                    },
                    sharedConfigs: {
                        cellId: 'allEvent',
                        data: [],
                        filter: {},
                        selfFilter: {
                            cols: {},
                            applied: false,
                            opening: []
                        },
                        searchKey: ''
                    },
                    viewConfigs: {
                        displayOptions: {}
                    }
                };
                for (let control in this.listControlInDoc) {
                    let isControlUser = false;
                    if (this.listControlInDoc[control].type == 'user') {
                        isControlUser = true;
                    }
                    let configFilter = {
                        as: this.listControlInDoc[control].headerName,
                        name: this.listControlInDoc[control].field,
                        type: this.listControlInDoc[control].type,
                        sort: 'none',
                        desInfo: {
                            as: this.listControlInDoc[control].headerName,
                            des: this.listControlInDoc[control].headerName
                        },
                        cond: {
                            type: 'notin',
                            val: ''
                        },
                        isControlUser: isControlUser
                    };
                    if (
                        configFilter.type != 'text' &&
                        configFilter.type != 'date' &&
                        configFilter.type != 'number' &&
                        configFilter.type != 'datetime'
                    ) {
                        configFilter.type = 'text';
                    }
                    defaultFilterConfig.rawConfigs.setting.column.selectedColums.push(
                        configFilter
                    );
                }

                this.dataForSelfFilter = defaultFilterConfig;
            }
        },
        openSidebarConfigFilter() {
            this.isOpenFilterScheduler = true;
        },
        closeFilterColumn() {
            this.isOpenFilterScheduler = false;
            this.$refs.scheduler.checkAndResizeScheduler();
        },
        handleGetAllControlInDoc(res) {
            this.listControlInDoc = res;
        },
        // xử lý apply filter
        applySelfFilter() {
            this.$evtBus.$emit(
                'scheduler-filter-config',
                this.dataForSelfFilter
            );
            this.refreshScheduler();
        },
        checkWidthSchedulerWhenOpenSidebarFilter() {
            if (this.isOpenFilterScheduler) {
                this.schedulerWidth = 'calc(100% - 250px)';
            } else {
                this.schedulerWidth = '100%';
            }
        },
        handleResizeSchedulerWhenViewTimelineWeek() {
            // let schedulerContainer = document.getElementsByClassName('left-container')
            // schedulerContainer[0].style.width = '200%';
            // setTimeout(() => {
            //     this.$refs.scheduler.updateView();
            // }, 1000);
            // setTimeout(() => {
            //     schedulerContainer[0].style.width = '100%';
            // }, 1000);
        },
        handleInsetDocumentWhenDragFromTree(res) {
            if (!res.dataObject) {
                this.$snotify({
                    type: 'error',
                    title: this.$t('scheduler.error.drag'),
                    text: this.$t('scheduler.error.drag')
                });
                // xóa event
                this.$refs.scheduler.deleteEvent(res.id);
            } else {
                // update id event
                this.$refs.scheduler.updateIdEvent(res.event, res.dataObject);
            }
        },
        handleCloseTooltipEvent(id) {
            this.$refs.scheduler.unSelectEvent(id);
        }
    },

    async created() {
        this.dataForSelfFilter = this.$store.state.document.filterConfig;
        this.$evtBus.$on(
            'showlist-update-report',
            async (instanceKey, typeView) => {
                if (
                    typeView == 'scheduler' &&
                    instanceKey == this.instanceKey
                ) {
                    this.listDataFilter =
                        this.$store.state.document.filterConfig;
                    if (navigator.onLine) {
                        this.dataForSelfFilter =
                            this.$store.state.document.filterConfig;
                        this.openFilterScheduler();
                        // if (data.action && data.action == 'edit') {
                        //     this.openSidebarConfigFilter();
                        // }
                        this.refreshScheduler();
                    } else {
                        this.$snotifyError(
                            'err',
                            this.$t('v2.kanban.errorNetwork')
                        );
                        return;
                    }
                }
            }
        );
        this.$evtBus.$on('after-open-add-panel-btnaddevent', () => {
            this.handleOnBtnAddEventClicked();
        });

        this.$evtBus.$on('refresh-scheduler', () => {
            if (navigator.onLine) {
                this.refreshScheduler();
            } else {
                this.$snotifyError(
                    'err',
                    this.$t('v2.kanban.errorNetwork')
                );
                return;
            }
        });
        this.$evtBus.$on('change-type-flat-scheduler', (data) => {
            this.groupFilter = null;
            this.isViewTree = false;
            this.refreshScheduler();
        });
        this.$evtBus.$on('get-data-scheduler', (filter) => {
            this.viewByTreeview(filter);
            this.isViewTree = true;
        });
        this.$evtBus.$on('apply-conditional-format', () => {
            this.refreshScheduler();
        });
        this.$evtBus.$on('scheduler-add-filter', () => {
            this.isAddFilter = true;
            this.openFilterScheduler();
            this.openSidebarConfigFilter();
        });
        this.$evtBus.$on('scheduler-cancel-add-filter', () => {
            this.isAddFilter = false;
        });
        this.$evtBus.$on('config-filter-scheduler', (data) => {
            if (navigator.onLine) {
                if (JSON.stringify(data.filter) == '{}') {
                    this.refreshScheduler();
                    this.dataForSelfFilter = {};
                    this.isOpenFilterScheduler = false;
                } else {
                    this.dataForSelfFilter = util.cloneDeep(data.filter);
                    this.openFilterScheduler();
                    if (data.action && data.action == 'edit') {
                        this.openSidebarConfigFilter();
                    }
                    this.refreshScheduler();
                }
            } else {
                this.$snotifyError(
                    'err',
                    this.$t('v2.kanban.errorNetwork')
                );
                return;
            }
        });
        this.$evtBus.$on('show-filter-scheduler', () => {
            this.openSidebarConfigFilter();
        });
        if (navigator.onLine) {
            this.schedulerEndUserWorker = new SchedulerEndUserWorker();
            this.listenFromWorker();

            this.schedulerEndUserWorker.postMessage({
                action: 'getScheduler',
                data: this.idDoc
            });
            this.schedulerEndUserWorker.postMessage({
                action: 'getAllControlInDoc',
                data: this.idDoc
            });
            this.$evtBus.$emit('get-default-filter-scheduler');
            this.getAllPermission();
        } else {
            this.$snotifyError(
                'err',
                this.$t('v2.kanban.errorNetwork')
            );
        }
    },
    destroyed() {
        this.$evtBus.$off('after-open-add-panel-btnaddevent');
        this.$evtBus.$off('refresh-scheduler');
        this.$evtBus.$off('change-type-flat-scheduler');
        this.$evtBus.$off('get-data-scheduler');
        this.$evtBus.$off('apply-conditional-format');
        this.$evtBus.$off('scheduler-add-filter');
        this.$evtBus.$off('scheduler-cancel-add-filter');
        this.$evtBus.$off('config-filter-scheduler');
        this.$evtBus.$off('show-filter-scheduler');
    }
};
</script>
