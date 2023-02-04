<template>
    <div :class="{ 'scheduler-view-day': isViewDay }">
        <preloader
            v-if="!isRenderScheduler"
            :styleLoad="'background-color: var(--ag-modal-overlay-background-color, rgba(255, 255, 255, 0.66)); position: absolute;'"
        />

        <div class="left-bar" v-if="isShowGroup" :style="{width: isListGroupCollapse ? '30px': '220px'}">
            <div class="d-flex justify-space-between">
                <div class="fw-500 color-black fs-13" style="line-height: 28px" v-show="!isListGroupCollapse">
                    {{ $t('scheduler.view_enduser.list_task') }}
                </div>
                <div>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn
                                v-on="on"
                                icon
                                x-small
                                tile
                                style="margin-right: 8px; margin-top: 5px"
                                @click="collapseOrExpandListGroup"
                            >
                                <i :class="{'fs-15 mdi': true, 'mdi-arrow-right':isListGroupCollapse, 'mdi-arrow-left':!isListGroupCollapse }"></i>
                            </v-btn>
                        </template>
                        <span>{{
                            isListGroupCollapse ? $t("scheduler.view_enduser.open_list_task") : $t("scheduler.view_enduser.close_list_task")
                        }}</span>
                    </v-tooltip>
                    <v-tooltip bottom v-if="!isListGroupCollapse">
                        <template v-slot:activator="{ on }">
                            <v-btn
                                v-on="on"
                                icon
                                x-small
                                tile
                                style="margin-right: 8px; margin-top: 5px"
                                @click="refreshGroup"
                            >
                                <i class="fs-15 mdi mdi-refresh"></i>
                            </v-btn>
                        </template>
                        <span>{{ $t('common.refresh') }}</span>
                    </v-tooltip>
                </div>
            </div>
            <SearchBox
                style="width: 218px; margin-top: 2px"
                :placeholder="$t('common.enter_to_search')"
                :searchBlank="true"
                @search-input-change="handleSearchGroup"
                v-show="!isListGroupCollapse"
            />
            <div
                id="treebox"
                style="width: 218px; height: calc(100% - 124px)"
                class="mt-1"
                v-show="!isListGroupCollapse"
            ></div>
        </div>

        <div
            ref="scheduler"
            class="left-container"
            :events="events"
            :style="{
                width: widthScheduler,
                height: isAddFilter ? 'calc(100% - 70px)' : 'calc(100% - 28px)',
                position: 'absolute',
                top: '0px',
                left: leftScheduler,
            }"
        ></div>
        <div id="switch-button">
            <v-menu v-if="!isViewMonth" offset-y>
                <template v-slot:activator="{ attrs, on }">
                    <v-btn
                        color="#F2F2F2"
                        class="btn-switch"
                        v-bind="attrs"
                        v-on="on"
                        margin="0px"
                        height="28px"
                        width="101px"
                    >
                        {{ switchtext }}

                        <img
                            src="@/assets/icon/down_arrow.png"
                            width="9"
                            height="4.79"
                            alt=""
                        />
                    </v-btn>
                </template>

                <v-list
                    class="position-v-list"
                    v-if="this.switchtext == 'Calendar'"
                >
                    <v-list-item link class="switch-list">
                        <v-list-item-title
                            class="switch-text currentview"
                            @click="isViewCalendar()"
                            >Calendar</v-list-item-title
                        >
                    </v-list-item>
                    <v-list-item link class="switch-list">
                        <v-list-item-title
                            class="switch-text"
                            @click="isViewTimeline()"
                            >Timeline</v-list-item-title
                        >
                    </v-list-item>
                </v-list>
                <v-list
                    class="position-v-list"
                    v-if="this.switchtext == 'Timeline'"
                >
                    <v-list-item link class="switch-list">
                        <v-list-item-title
                            class="switch-text"
                            @click="isViewCalendar()"
                            >Calendar</v-list-item-title
                        >
                    </v-list-item>
                    <v-list-item link class="switch-list">
                        <v-list-item-title
                            class="switch-text currentview"
                            @click="isViewTimeline()"
                            >Timeline</v-list-item-title
                        >
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-menu v-if="isViewMonth" offset-y>
                <template v-slot:activator="{ attrs, on }">
                    <v-btn
                        v-bind="attrs"
                        v-on="on"
                        color="#F2F2F2"
                        class="btn-switch"
                        box-shadow="none"
                        margin="0px"
                        height="28px"
                        width="101px"
                    >
                        {{ switchtext }}
                        <div class="div-mty"></div>
                    </v-btn>
                </template>
            </v-menu>
        </div>

        <div v-for="group in groupConfig" :key="group.id">
            <div :id="'group-pagination' + group.id" style="width: 0px">
                <Pagination
                    ref="pagination"
                    :total="group.countTaskDisplay"
                    :totalVisible="0"
                    :pageSizeOptions="[10]"
                    :shortMode="true"
                    :indexPagination="String(group.id)"
                    @on-change-page="changePage"
                    v-show="group.countTaskDisplay > 10"
                    :pageActive="pageActive"
                    style="width: 209px; margin-left: 132px"
                    :hideTotalSection="true"
                ></Pagination>
            </div>
        </div>
        <input
            type="checkbox"
            id="applyRec"
            style="margin-left: 6px; display: none"
            checked
            @click="changeApplyRec"
            v-model="applyRec"
        />
        <div class="dhx_form_repeat" id="symper_form_recurring">
            <label style="margin-left: 13px">{{
                $t('scheduler.view_enduser.config_rec.apply')
            }}</label
            ><br />
            <form>
                <span style="font-weight: 500">{{
                    $t('scheduler.view_enduser.config_rec.scale')
                }}</span>
                <div class="dhx_repeat_left">
                    <label
                        ><input
                            class="dhx_repeat_radio"
                            type="radio"
                            name="repeat"
                            value="day"
                            checked
                        />{{ $t('scheduler.view_enduser.labels.day') }}</label
                    ><br />
                    <label
                        ><input
                            class="dhx_repeat_radio"
                            type="radio"
                            name="repeat"
                            value="week"
                        />{{ $t('scheduler.view_enduser.labels.week') }}</label
                    ><br />
                    <label
                        ><input
                            class="dhx_repeat_radio"
                            type="radio"
                            name="repeat"
                            value="month"
                        />{{ $t('scheduler.view_enduser.labels.month') }}</label
                    ><br />
                    <label
                        ><input
                            class="dhx_repeat_radio"
                            type="radio"
                            name="repeat"
                            value="year"
                        />{{ $t('scheduler.view_enduser.labels.year') }}</label
                    >
                </div>
                <div style="font-weight: 500">
                    {{ $t('scheduler.view_enduser.config_rec.repeat') }}
                </div>
                <div class="dhx_repeat_center">
                    <div id="dhx_repeat_day">
                        <label
                            ><input
                                class="dhx_repeat_radio"
                                type="radio"
                                name="day_type"
                                value="d"
                            />{{
                                $t('scheduler.view_enduser.config_rec.after')
                            }}</label
                        ><input
                            class="dhx_repeat_text"
                            type="text"
                            name="day_count"
                            value="1"
                        />{{ $t('scheduler.view_enduser.config_rec.day')
                        }}<br />
                        <label
                            ><input
                                class="dhx_repeat_radio"
                                type="radio"
                                name="day_type"
                                checked
                                value="w"
                            />{{
                                $t(
                                    'scheduler.view_enduser.config_rec.every_day',
                                )
                            }}</label
                        >
                    </div>
                    <div style="display: none" id="dhx_repeat_week">
                        <table class="dhx_repeat_days">
                            <tr>
                                <td>
                                    <label
                                        ><input
                                            class="dhx_repeat_checkbox"
                                            type="checkbox"
                                            name="week_day"
                                            value="1"
                                        />{{
                                            $t(
                                                'scheduler.view_enduser.day_full.Monday',
                                            )
                                        }}</label
                                    ><br />
                                    <label
                                        ><input
                                            class="dhx_repeat_checkbox"
                                            type="checkbox"
                                            name="week_day"
                                            value="4"
                                        />{{
                                            $t(
                                                'scheduler.view_enduser.day_full.Thursday',
                                            )
                                        }}</label
                                    >
                                </td>
                                <td>
                                    <label
                                        ><input
                                            class="dhx_repeat_checkbox"
                                            type="checkbox"
                                            name="week_day"
                                            value="2"
                                        />{{
                                            $t(
                                                'scheduler.view_enduser.day_full.Tuesday',
                                            )
                                        }}</label
                                    ><br />
                                    <label
                                        ><input
                                            class="dhx_repeat_checkbox"
                                            type="checkbox"
                                            name="week_day"
                                            value="5"
                                        />{{
                                            $t(
                                                'scheduler.view_enduser.day_full.Friday',
                                            )
                                        }}</label
                                    >
                                </td>
                                <td>
                                    <label
                                        ><input
                                            class="dhx_repeat_checkbox"
                                            type="checkbox"
                                            name="week_day"
                                            value="3"
                                        />{{
                                            $t(
                                                'scheduler.view_enduser.day_full.Wednesday',
                                            )
                                        }}</label
                                    ><br />
                                    <label
                                        ><input
                                            class="dhx_repeat_checkbox"
                                            type="checkbox"
                                            name="week_day"
                                            value="6"
                                        />{{
                                            $t(
                                                'scheduler.view_enduser.day_full.Saturday',
                                            )
                                        }}</label
                                    >
                                </td>
                                <td>
                                    <label
                                        ><input
                                            class="dhx_repeat_checkbox"
                                            type="checkbox"
                                            name="week_day"
                                            value="0"
                                        />{{
                                            $t(
                                                'scheduler.view_enduser.day_full.Sunday',
                                            )
                                        }}</label
                                    ><br /><br />
                                </td>
                            </tr>
                        </table>
                        {{ $t('scheduler.view_enduser.config_rec.repeat_every')
                        }}<input
                            class="dhx_repeat_text"
                            type="text"
                            name="week_count"
                            value="1"
                        />{{
                            $t(
                                'scheduler.view_enduser.config_rec.week_next_day',
                            )
                        }}<br />
                    </div>
                    <div id="dhx_repeat_month" style="display: none">
                        <label>
                            <input
                                class="dhx_repeat_radio"
                                type="radio"
                                name="month_type"
                                value="d"
                            />
                            {{ $t('scheduler.view_enduser.config_rec.day_th') }}
                        </label>
                        <input
                            class="dhx_repeat_text"
                            type="text"
                            name="month_day"
                            value="1"
                        />
                        {{ $t('scheduler.view_enduser.config_rec.every') }}
                        <input
                            class="dhx_repeat_text"
                            type="text"
                            name="month_count"
                            value="1"
                        />
                        {{ $t('scheduler.view_enduser.config_rec.month') }}
                        <br />

                        <label>
                            <input
                                class="dhx_repeat_radio"
                                type="radio"
                                name="month_type"
                                checked
                                value="w"
                            />
                        </label>
                        <select name="month_day2">
                            <option value="1" selected>
                                {{
                                    $t('scheduler.view_enduser.day_full.Monday')
                                }}
                            </option>
                            <option value="2">
                                {{
                                    $t(
                                        'scheduler.view_enduser.day_full.Tuesday',
                                    )
                                }}
                            </option>
                            <option value="3">
                                {{
                                    $t(
                                        'scheduler.view_enduser.day_full.Wednesday',
                                    )
                                }}
                            </option>
                            <option value="4">
                                {{
                                    $t(
                                        'scheduler.view_enduser.day_full.Thursday',
                                    )
                                }}
                            </option>
                            <option value="5">
                                {{
                                    $t('scheduler.view_enduser.day_full.Friday')
                                }}
                            </option>
                            <option value="6">
                                {{
                                    $t(
                                        'scheduler.view_enduser.day_full.Saturday',
                                    )
                                }}
                            </option>
                            <option value="0">
                                {{
                                    $t('scheduler.view_enduser.day_full.Sunday')
                                }}
                            </option>
                        </select>
                        {{ $t('scheduler.view_enduser.config_rec.th') }}
                        <input
                            class="dhx_repeat_text"
                            type="text"
                            name="month_week2"
                            value="1"
                        />
                        {{ $t('scheduler.view_enduser.config_rec.every') }}
                        <input
                            class="dhx_repeat_text"
                            type="text"
                            name="month_count2"
                            value="1"
                        />
                        {{ $t('scheduler.view_enduser.config_rec.month') }}
                        <br />
                    </div>

                    <div style="display: none" id="dhx_repeat_year">
                        <label>
                            <input
                                class="dhx_repeat_radio"
                                type="radio"
                                name="year_type"
                                value="d"
                            />
                        </label>
                        {{ $t('scheduler.view_enduser.config_rec.day_th') }}
                        <input
                            class="dhx_repeat_text"
                            type="text"
                            name="year_day"
                            value="1"
                        />
                        {{ $t('scheduler.view_enduser.config_rec.every') }}
                        <select name="year_month">
                            <option value="0" selected>
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.January',
                                    )
                                }}
                            </option>
                            <option value="1">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.February',
                                    )
                                }}
                            </option>
                            <option value="2">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.March',
                                    )
                                }}
                            </option>
                            <option value="3">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.April',
                                    )
                                }}
                            </option>
                            <option value="4">
                                {{
                                    $t('scheduler.view_enduser.month_full.May')
                                }}
                            </option>
                            <option value="5">
                                {{
                                    $t('scheduler.view_enduser.month_full.June')
                                }}
                            </option>
                            <option value="6">
                                {{
                                    $t('scheduler.view_enduser.month_full.July')
                                }}
                            </option>
                            <option value="7">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.August',
                                    )
                                }}
                            </option>
                            <option value="8">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.September',
                                    )
                                }}
                            </option>
                            <option value="9">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.October',
                                    )
                                }}
                            </option>
                            <option value="10">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.November',
                                    )
                                }}
                            </option>
                            <option value="11">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.December',
                                    )
                                }}
                            </option>
                        </select>
                        <br />
                        <label>
                            <input
                                class="dhx_repeat_radio"
                                type="radio"
                                name="year_type"
                                checked
                                value="w"
                            />
                        </label>
                        <select name="year_day2">
                            <option value="1" selected>
                                {{
                                    $t('scheduler.view_enduser.day_full.Monday')
                                }}
                            </option>
                            <option value="2">
                                {{
                                    $t(
                                        'scheduler.view_enduser.day_full.Tuesday',
                                    )
                                }}
                            </option>
                            <option value="3">
                                {{
                                    $t(
                                        'scheduler.view_enduser.day_full.Wednesday',
                                    )
                                }}
                            </option>
                            <option value="4">
                                {{
                                    $t(
                                        'scheduler.view_enduser.day_full.Thursday',
                                    )
                                }}
                            </option>
                            <option value="5">
                                {{
                                    $t('scheduler.view_enduser.day_full.Friday')
                                }}
                            </option>
                            <option value="6">
                                {{
                                    $t(
                                        'scheduler.view_enduser.day_full.Saturday',
                                    )
                                }}
                            </option>
                            <option value="7">
                                {{
                                    $t('scheduler.view_enduser.day_full.Sunday')
                                }}
                            </option>
                        </select>
                        {{ $t('scheduler.view_enduser.config_rec.th') }}
                        <input
                            class="dhx_repeat_text"
                            type="text"
                            name="year_week2"
                            value="1"
                        />
                        {{ $t('scheduler.view_enduser.config_rec.every') }}
                        <select name="year_month2">
                            <option value="0" selected>
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.January',
                                    )
                                }}
                            </option>
                            <option value="1">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.February',
                                    )
                                }}
                            </option>
                            <option value="2">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.March',
                                    )
                                }}
                            </option>
                            <option value="3">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.April',
                                    )
                                }}
                            </option>
                            <option value="4">
                                {{
                                    $t('scheduler.view_enduser.month_full.May')
                                }}
                            </option>
                            <option value="5">
                                {{
                                    $t('scheduler.view_enduser.month_full.June')
                                }}
                            </option>
                            <option value="6">
                                {{
                                    $t('scheduler.view_enduser.month_full.July')
                                }}
                            </option>
                            <option value="7">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.August',
                                    )
                                }}
                            </option>
                            <option value="8">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.September',
                                    )
                                }}
                            </option>
                            <option value="9">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.October',
                                    )
                                }}
                            </option>
                            <option value="10">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.November',
                                    )
                                }}
                            </option>
                            <option value="11">
                                {{
                                    $t(
                                        'scheduler.view_enduser.month_full.December',
                                    )
                                }}
                            </option></select
                        ><br />
                    </div>
                </div>
                <div style="font-weight: 500">
                    {{ $t('scheduler.view_enduser.config_rec.end') }}
                </div>
                <div class="dhx_repeat_right">
                    <label
                        ><input
                            class="dhx_repeat_radio"
                            type="radio"
                            name="end"
                            checked
                        />{{
                            $t('scheduler.view_enduser.config_rec.no_end_date')
                        }}</label
                    ><br />
                    <label
                        ><input
                            class="dhx_repeat_radio"
                            type="radio"
                            name="end"
                        />{{
                            $t('scheduler.view_enduser.config_rec.end_by')
                        }}</label
                    ><input
                        class="dhx_repeat_date"
                        type="text"
                        name="date_of_end"
                        value="'+scheduler.config.repeat_date_of_end+'"
                    /><br />
                </div>
            </form>
        </div>
        <div style="clear: both"></div>
    </div>
</template>

<script>
import '@/../public/vendor/dhtmlx/dhtmlxscheduler.js';
import '@/../public/vendor/dhtmlx/dhtmlxscheduler_material.css';

import SearchBox from '@/components/common/SearchBox.vue';
require('@/../public/vendor/dhtmlx/dhtmlx.js');
import Preloader from '@/components/common/Preloader';
import Pagination from '@/components/common/Pagination';
import CreateEvent from '@/components/scheduler/CreateEvent.vue';

export default {
    name: 'SchedulerView',
    props: {
        groupConfig: {
            type: Array,
            default() {
                return [];
            },
        },
        events: {
            type: Array,
            default() {
                return [];
            },
        },
        isViewTree: {
            type: Boolean,
            default: false,
        },
        idDoc: {
            type: String,
            default: '3025',
        },
        cardConfig: {
            type: Object,
            default() {
                return {};
            },
        },
        isAddFilter: {
            type: Boolean,
            default: false,
        },
        isShowGroup: {
            type: Boolean,
            default: false,
        },
        instanceKey: {
            default: '',
        },
        isCloneEvent: {
            default: false
        },
        listPermission: {
            type: Object,
            default: {}
        },
        hasTreeConfig: {
            type: Boolean,
            default: false
        },
        userColumnControl: {
            type: Array,
            default() {
                return []
            }
        },
        viewModeScheduler: {
            type: String,
            default: 'week'
        }
    },
    components: {
        SearchBox,
        Preloader,
        Pagination,
        CreateEvent,
    },
    data: () => ({
        switchtext: 'Calendar',
        treeInstance: null,
        menuInstance: null,
        isListGroupCollapse: true,
        isRenderScheduler: false,
        currentState: 'week',
        isViewMonth: false,
        pageActive: 0, // mục đích reset về page 1 khi reload cột bản ghi
        textEventAdded: null,
        groupSearchKey: '',
        defaultWidthScheduler: '',
        eventHasConfigRecurring: false,
        addEventByBtn: false,
        applyConfigRec: true,
        applyRec: true,
        changeStateScheduler: true
    }),
    mounted: function () {
        this.renderScheduler();
        $('.left-container.dhx_cal_container').scroll(function () {
            $('.dhx_cal_navline').css(
                'left',
                $('.left-container.dhx_cal_container').scrollLeft(),
            );
            $('#switch-button').css(
                'right',
                12 - $('.left-container.dhx_cal_container').scrollLeft(),
            );
        });
    },
    created() {
        this.$evtBus.$on('change-user-locale', (locale) => {
            this.changeLanguageScheduler();
        });
        this.$evtBus.$on('symper-collapse-left-sidebar', (data) => {
            this.checkAndResizeScheduler();
        });
        this.$evtBus.$on('showlist-display-config-open', (data) => {
            if(!data.isShow && data.instanceKey == this.instanceKey){
                this.checkAndResizeScheduler();
            }
        });
    },

    methods: {
        changeApplyRec(e) {
            if (e.target.checked) {
                $(
                    '.dhx_repeat_checkbox, .dhx_repeat_radio, .dhx_repeat_text, select, .dhx_repeat_date',
                ).prop('disabled', false);
            } else {
                $(
                    '.dhx_repeat_checkbox, .dhx_repeat_radio, .dhx_repeat_text, select, .dhx_repeat_date',
                ).prop('disabled', true);
            }
        },
        updateView() {
            scheduler.updateView();
            scheduler._mark_now();
            this.checkHighlightTabActive();
            if (this.currentState == 'week') {
                // hightlight label ngày hiện tại view calendar week
                this.checkHighlightCurrentDay();
            }
            // this.setHeightScheduler();
        },
        isViewTimeline() {
            this.switchtext = 'Timeline';
            if(this.hasTreeConfig){
                if (this.currentState == 'week') {
                    scheduler.setCurrentView(null, 'tree_mode_week');
                } else if (this.currentState == 'day'
                ) {
                    scheduler.setCurrentView(null, 'tree_mode_day');
                }
            }else {
                if (this.currentState == 'week') {
                    scheduler.setCurrentView(null, 'timeline_week');
                } else if (this.currentState == 'day'
                ) {
                    scheduler.setCurrentView(null, 'timeline_day');
                }
            }
        },
        isViewCalendar() {
            this.switchtext = 'Calendar';
            if (
                this.switchtext == 'Calendar' &&
                (this.currentState == 'timeline_week' || this.currentState == 'tree_mode_week')
            ) {
                scheduler.setCurrentView(null, 'week');
            } else if (
                this.switchtext == 'Calendar' &&
                (this.currentState == 'timeline_day' || this.currentState == 'tree_mode_day')
            ) {
                scheduler.setCurrentView(null, 'day');
            }
        },
        renderScheduler() {
            scheduler.destructor();
            scheduler = Scheduler.getSchedulerInstance({
                plugins: {
                    key_nav: true,
                    timeline: true,
                    limit: true,
                    minical: true,
                    outerdrag: true,
                    recurring: true,
                    daytimeline: true,
                    treetimeline: true
                },
                container: this.$refs.scheduler,
            });
            this.switchtext = this.viewModeScheduler == 'tree_mode_week' || this.viewModeScheduler == 'tree_mode_day' ? 'Timeline' : 'Calendar'
            if(this.switchtext == 'Timeline'){
                this.currentState = this.viewModeScheduler == 'tree_mode_week' ?  'week' : 'day'
            }else {
                this.currentState = this.viewModeScheduler
                this.isViewMonth = this.currentState == 'month' ? true : false
            }
            scheduler.init(this.$refs.scheduler, new Date(), this.currentState);
            scheduler.config.lightbox_recurring = 'instance';
            scheduler.config.recurring_workdays = [1, 2, 3, 4, 5, 6, 7];
            scheduler.config.separate_short_events = true;
            scheduler.config.scroll_hour = new Date().getHours();
            scheduler.config.repeat_date = '%d-%m-%Y';
            scheduler.config.multi_day_height_limit = 97;

            if(!this.listPermission.edit) {
                scheduler.config.drag_move = false;
                scheduler.config.drag_resize = false;
            }
            if(!this.listPermission.submit) {
                scheduler.config.drag_create = false;
                scheduler.config.dblclick_create = false;
            }
            scheduler.skin = 'material';
            scheduler.config.header = [
                'today',
                'prev',
                'next',
                'date',
                'minicalendar',
                'spacer',
                'day',
                'week',
                'month',
            ];
            // View timeline

            scheduler.createTimelineView({
                name: 'timeline_week',
                render: 'days',
                days: 7,
                //time scale is configured to cover 1 day
                x_unit: 'minute',
                x_date: '%H:%i',
                x_step: 60,
                x_size: 24,
                x_start: 0,
                dx: 60,
            });
            scheduler.createTimelineView({
                name: 'timeline_day',
                render: 'bar',
                days: 1,
                //time scale is configured to cover 1 day
                x_unit: 'minute',
                x_date: '%H:%i',
                x_step: 60,
                x_size: 24,
                x_start: 0,
                dx: 0,
                y_unit: scheduler.serverList('sections'),
                y_property: 'date',
            });
            scheduler.date['timeline_day_start'] = function (date) {
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDate();
                var date = new Date(year, month, day);
                return date;
            };
            let formatDate = scheduler.date.date_to_str('%Y-%m-%d');
            let nowDate = formatDate(new Date());
            // version mới không cần add mark now
            // scheduler.addMarkedTimespan({
            //     start_date: new Date(),
            //     end_date: scheduler.date.add(
            //         new Date(),
            //         scheduler.matrix.timeline_day.x_step,
            //         scheduler.matrix.timeline_day.x_unit,
            //     ),
            //     css: 'column_selection',
            // });
            scheduler.templates.timeline_week_cell_class = function (
                ev,
                date,
                section,
            ) {
                if (formatDate(section.label) == nowDate) {
                    return 'timeline_week_cell';
                } else return '';
            };
            scheduler.templates.timeline_week_scale_label = function (
                key,
                label,
                section,
            ) {
                if (label.getDay() == 0) {
                    var format_day_date =
                        scheduler.date.date_to_str(' CN, %d/%m');
                } else if (label.getDay() == 1) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T2, %d/%m');
                } else if (label.getDay() == 2) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T3, %d/%m');
                } else if (label.getDay() == 3) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T4, %d/%m');
                } else if (label.getDay() == 4) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T5, %d/%m');
                } else if (label.getDay() == 5) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T6, %d/%m');
                } else if (label.getDay() == 6) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T7, %d/%m');
                }
                return format_day_date(label);
            };
            scheduler.templates.day_date = function (date) {
                if (date.getDay() == 0) {
                    var format_day_date =
                        scheduler.date.date_to_str(' CN, %d/%m/%Y');
                } else if (date.getDay() == 1) {
                    var format_day_date =
                        scheduler.date.date_to_str(' Thứ 2, %d/%m/%Y');
                } else if (date.getDay() == 2) {
                    var format_day_date =
                        scheduler.date.date_to_str(' Thứ 3, %d/%m/%Y');
                } else if (date.getDay() == 3) {
                    var format_day_date =
                        scheduler.date.date_to_str(' Thứ 4, %d/%m/%Y');
                } else if (date.getDay() == 4) {
                    var format_day_date =
                        scheduler.date.date_to_str(' Thứ 5, %d/%m/%Y');
                } else if (date.getDay() == 5) {
                    var format_day_date =
                        scheduler.date.date_to_str(' Thứ 6, %d/%m/%Y');
                } else if (date.getDay() == 6) {
                    var format_day_date =
                        scheduler.date.date_to_str(' Thứ 7, %d/%m/%Y');
                }
                return format_day_date(date);
            };

            scheduler.templates.week_scale_date = function (date) {
                if (date.getDay() == 0) {
                    var format_day_date =
                        scheduler.date.date_to_str(' CN %d/%m');
                } else if (date.getDay() == 1) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T2 %d/%m');
                } else if (date.getDay() == 2) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T3 %d/%m');
                } else if (date.getDay() == 3) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T4 %d/%m');
                } else if (date.getDay() == 4) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T5 %d/%m');
                } else if (date.getDay() == 5) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T6 %d/%m');
                } else if (date.getDay() == 6) {
                    var format_day_date =
                        scheduler.date.date_to_str(' T7 %d/%m');
                }
                return format_day_date(date);
            };

            scheduler.templates.week_date = function (start, end) {
                var format_week_date = scheduler.date.date_to_str('%d/%m/%Y');
                return (
                    format_week_date(start) +
                    ' - ' +
                    format_week_date(scheduler.date.add(end, -1, 'day'))
                );
            };

            this.changeLanguageScheduler();

            scheduler.config.icons_select = [];
            scheduler.config.event_duration = 120;
            scheduler.config.edit_on_create = false;

            scheduler.config.lightbox.sections = [
                {
                    name: 'description',
                    height: 130,
                    map_to: 'text',
                    type: 'textarea',
                    focus: true,
                },
                {
                    name: 'recurring',
                    type: 'recurring',
                    map_to: 'rec_type',
                    button: 'recurring',
                    form: 'symper_form_recurring',
                },
                { name: 'time', height: 72, type: 'time', map_to: 'auto' },
            ];
            // custom event
            scheduler.xy.min_event_height = 11;
            scheduler.xy.scale_height = 30

            this.getEventTemplate();
            this.getTemplateViewMonth();

            this.defaultWidthScheduler = document.querySelector(
                '.left-container.dhx_cal_container',
            ).offsetWidth;
            scheduler.config.multi_day = true;

            // lấy event hiển thị lên canvas
            this.getAllEvent();

            // menu trên nhóm bản ghi
            var menu = new dhtmlXMenuObject();
            this.menuInstance = menu;
            menu.renderAsContextMenu();
            menu.loadStruct(
                `<menu>
                    <item id="view" text="${this.$t('v2.scheduler.viewDetail')}">
                    </item>
                </menu>`,
            );
            menu.attachEvent('onClick', this.viewDetailEvent);

            scheduler.updateView(); // update header scheduler
            scheduler._mark_now();

            // hightlight label ngày hiện tại view calendar week
            this.checkHighlightCurrentDay();

            // nhóm bản ghi
            if (this.groupConfig.length != 0) {
                this.renderTreeListTask();
            }

            this.listenSchedulerEvent();
        },
        checkCollapseGroup(){
            var hasDataGroup = false
            this.groupConfig.map(gr=>{
                if(gr.data && gr.data.length > 0){
                    hasDataGroup = true
                }
            })
            if(hasDataGroup){
                this.isListGroupCollapse = false
            }
        },

        listenSchedulerEvent() {
            let self = this;
            // scheduler.date.add_timeline_day=function(date,inc){
            //      return scheduler.date.add(date,inc*2,"day");
            // }
            // version mới không kích hoạt sự kiện này
            // scheduler.attachEvent('onAfterSchedulerResize', function () {
            //     if (self.switchtext == 'Timeline') {
            //         const viewWeek =
            //             document.getElementsByClassName('dhx_cal_tab');
            //         for (let i = 0; i < viewWeek.length; i++) {
            //             let state = '';
            //             if (self.currentState == 'timeline_week') {
            //                 state = 'week';
            //             } else state = 'day';
            //             if (viewWeek[i].dataset.viewname == state) {
            //                 viewWeek[i].classList.add('active');
            //             }
            //         }
            //     }
            // });
            // scheduler.attachEvent('onSchedulerResize', function () {
            //     let width = document.querySelector(
            //         '.left-container.dhx_cal_container',
            //     ).offsetWidth;
            //     if (width > self.defaultWidthScheduler) {
            //         return true;
            //     } else return false;
            // });

            scheduler.attachEvent(
                'onBeforeEventChanged',
                function (ev, e, is_new, original) {
                    // resize here
                    if (self.currentState == 'timeline_week') {
                        self.$emit('resize-scheduler-view-timeline-week');
                    }
                    //any custom logic here
                    if (original.id) {
                        let formatDate =
                            scheduler.date.date_to_str('%Y-%m-%d %H:%i:%s');
                        original.start_date_format = formatDate(
                            original.start_date,
                        );
                        original.end_date_format = formatDate(
                            original.end_date,
                        );
                        self.$emit('scheduler-event-beforechanged', {
                            original_event: original,
                        });
                    }
                    if(!is_new){
                        self.$emit('scheduler-event-dragend', {
                            id: original.id,
                            event: scheduler.getEvent(original.id),
                        });
                    }
                    return true;
                },
            );
            scheduler.attachEvent('onEventChanged', function (id, event) {
                self.$emit('scheduler-event-changed', {
                    id: id,
                    event: event,
                });
            });
            scheduler.attachEvent('onLightbox', function (id) {
                var ev = scheduler.getEvent(id);
                if (ev.rec_type) return; // no need to click for existing series
                var block = scheduler.form_blocks['recurring'];
                var node = scheduler.formSection('recurring').node;
                block.button_click(
                    0,
                    node.previousSibling.firstChild.firstChild,
                    node,
                    node,
                );
            });

            // được gọi sau khi submit tạo mới event
            scheduler.attachEvent('onEventSave', function (id, ev, is_new) {
                ev.text = self.textEventAdded;
                let formatRec = scheduler.date.date_to_str('%Y-%m-%d %H:%i:%s');
                if (self.eventHasConfigRecurring == true && ev._end_date) {
                    var _end_date = formatRec(ev._end_date);
                    if(new Date(ev._end_date).getUTCFullYear() != 9999){
                        // lấy ngày kết thúc chuỗi rec
                        _end_date = $('.dhx_repeat_date').val().split("-").reverse().join("-") + ' 00:00:00';
                    }

                }
                if(!self.isCloneEvent){
                    scheduler.deleteEvent(id);
                }

                self.$emit('scheduler-on-save-event', {
                    ev: ev,
                    _end_date: _end_date,
                });
                self.eventHasConfigRecurring = false;
                return true;
            });
            scheduler.attachEvent('onEventAdded', function (id, e) {
                // xác định event ảo được thư viện sinh ra mới rec_type = none khi xóa event ảo -> skip qua event này ( bug xảy ra nếu chọn action quay lại khi xác nhận thay đổi event rec)
                if (e.rec_type != 'none') {
                    self.$emit('schedule-get-id-eventadded', {
                        id: id,
                        e: e,
                    });
                }
                if (
                    !e.originRowData &&
                    !e.rec_type &&
                    self.addEventByBtn == false
                ) {
                    self.showLightbox(id);
                    self.$emit('add-event-after-drag', {
                        id: id,
                        e: e,
                    });
                } else if (self.addEventByBtn == true) {
                    self.$emit('add-event-after-click-button-add', {
                        id: id,
                        e: e,
                    });
                    self.showLightbox(id);
                    self.addEventByBtn = false;
                }
            });
            scheduler.attachEvent('onClick', function (id, event) {
                self.$emit('scheduler-event-click', { id: id, event: event });
            });

            // scheduler.attachEvent('onDragEnd', function (id, mode, e) {
            //     if (mode == 'resize' || mode == 'move') {
            //         var event = scheduler.getEvent(id);
            //         self.$emit('scheduler-event-dragend', {
            //             id: id,
            //             event: event,
            //         });
            //     }
            // });
            //Onbefore viewchange
            scheduler.attachEvent(
                'onBeforeViewChange',
                function (old_mode, old_date, mode, date) {
                    self.changeStateScheduler = true
                    if((old_date == date) && (old_mode == mode)){
                        self.changeStateScheduler = false
                    }
                    if (mode == 'month' && self.switchtext == 'Timeline') {
                        self.switchtext = 'Calendar';
                        return true;
                    } else if (old_mode == 'timeline_day' && mode == 'week') {
                        scheduler.setCurrentView(null, 'timeline_week');
                    } else if (old_mode == 'timeline_week' && mode == 'day') {
                        scheduler.setCurrentView(null, 'timeline_day');
                    }else if (old_mode == 'tree_mode_week' && mode == 'day') {
                        scheduler.setCurrentView(null, 'tree_mode_day');
                    } else if (old_mode == 'tree_mode_day' && mode == 'week') {
                        scheduler.setCurrentView(null, 'tree_mode_week');
                    }  else if (
                        (old_mode == 'timeline_week' || old_mode == 'tree_mode_week') &&
                        mode == 'week' &&
                        self.switchtext == 'Timeline'
                    ) {
                        return false;
                    } else if (
                        (old_mode == 'timeline_day'|| old_mode == 'tree_mode_day') &&
                        mode == 'day' &&
                        self.switchtext == 'Timeline'
                    ) {
                        return false;
                    } else if (mode == 'timeline_day') {
                        if (old_date != date || old_mode != 'timeline_day') {
                            let formatDate =
                                scheduler.date.date_to_str('%Y-%m-%d');
                            let newDate = formatDate(date);
                            scheduler.updateCollection('sections', [
                                { key: newDate, label: 'Day timeline' },
                            ]);
                        }
                        return true;
                    }
                    else return true;
                },
            );
            //xử lí khi view change
            scheduler.attachEvent(
                'onViewChange',
                function (new_mode, new_date) {
                    //any custom logic here

                    if (new_mode == 'timeline_day') {
                        const viewDay = document.getElementsByClassName(
                            'dhx_cal_tab dhx_cal_tab_first',
                        );
                        viewDay[0].classList.add('active');
                    } else if (new_mode == 'timeline_week') {
                        const viewWeek =
                            document.getElementsByClassName('dhx_cal_tab');
                        viewWeek[1].classList.add('active');
                    } else if (new_mode == 'month') {
                        self.isViewMonth = true;
                        // Xem thêm task ở month view
                        let calData = document.querySelector('.dhx_cal_data');
                        scheduler.config.max_month_events = Math.floor(
                            (calData.clientHeight / 5 - 21 * 2) / 21,
                        );
                        scheduler.templates.month_events_link = function (
                            date,
                            count,
                        ) {
                            return `<a>${self.$t('v2.scheduler.viewMore')}...</a>`;
                        };
                    } else {
                        self.isViewMonth = false;
                    }
                    self.currentState = new_mode;
                    self.$emit('scheduler-onViewChange', new_mode);
                    self.defaultWidthScheduler = document.querySelector(
                        '.left-container.dhx_cal_container',
                    ).offsetWidth;
                    if(self.changeStateScheduler){
                        self.refreshCanvasScheduler();
                    }else {
                        self.updateView();
                    }
                },
            );
            // drag từ nhóm bản ghi
            scheduler.attachEvent('onExternalDragIn', function (id, source, e) {
                let checkRenderedEvent = scheduler.getEvent(
                    source.parentObject.id,
                );
                if (checkRenderedEvent) {
                    self.deleteEvent(source.parentObject.id);
                }
                if (self.treeInstance._dragged[0]) {
                    var label = self.treeInstance.getItemText(
                        self.treeInstance._dragged[0].id,
                    );
                    // xóa -> add
                    let event = scheduler.getEvent(id);
                    self.deleteEvent(id);
                    let e = {
                        start_date: event.start_date,
                        end_date: event.end_date,
                        text: label,
                        id: self.treeInstance._dragged[0].id,
                        colorConfig: self.getDefaultFormat(),
                    };
                    if (event.date) {
                        e.date = event.date;
                    }
                    scheduler.addEvent(e);

                    self.$emit(
                        'add-event-from-tree',
                        self.treeInstance._dragged[0].id,
                    );
                    return true;
                } else {
                    return false;
                }
            });

            scheduler.attachEvent('onEventCreated', function (id, e) {
                scheduler.getEvent(id).colorConfig = self.getDefaultFormat();
                var ev = scheduler.getEvent(id);
                ev.end_date = scheduler.date.add(
                    ev.start_date,
                    scheduler.config.event_duration,
                    'minute',
                );
            });
            scheduler.attachEvent('onDblClick', function (id, e) {
                return false;
            });

            if (this.treeInstance) {
                this.treeInstance.attachEvent(
                    'onOpenEnd',
                    function (id, state) {
                        self.groupConfig.map((group) => {
                            if (group.id == id) {
                                if (state == 1) {
                                    let groupPagination =
                                        document.querySelector(
                                            '#group-pagination' + group.id,
                                        );
                                    if (groupPagination) {
                                        groupPagination.style.display = 'block';
                                        group.isOpen = true;
                                    }
                                } else {
                                    let groupPagination =
                                        document.querySelector(
                                            '#group-pagination' + group.id,
                                        );
                                    if (groupPagination) {
                                        groupPagination.style.display = 'none';
                                        group.isOpen = false;
                                    }
                                }
                            }
                        });
                    },
                );
                this.treeInstance.attachEvent(
                    'onDrag',
                    function (sId, tId, sObj, tObj, sInd, tInd) {
                        return false;
                    },
                );

                // disable drag on group name
                this.treeInstance.attachEvent('onBeforeDrag', function (id) {
                    let check = true;
                    self.groupConfig.map((group) => {
                        if (group.id == id) {
                            check = false;
                        }
                    });
                    if (check) {
                        return true;
                    } else return false;
                });

                this.treeInstance.attachEvent('onClick', function (id) {
                    let check = false;
                    self.groupConfig.map((group) => {
                        if (group.id == id) {
                            check = true;
                            let state = self.treeInstance.getOpenState(id);
                            if (state == -1) {
                                self.treeInstance.openItem(id);
                            } else if (state == 1) {
                                self.treeInstance.closeItem(id);
                                let groupPagination = document.querySelector(
                                    '#group-pagination' + group.id,
                                );
                                if (groupPagination) {
                                    groupPagination.style.display = 'none';
                                }
                            }
                        }
                    });
                    if (check) {
                        document.getElementsByClassName(
                            'selectedTreeRow',
                        )[0].className = 'standartTreeRow';
                    }
                });
                this.treeInstance.attachEvent(
                    'onBeforeContextMenu',
                    function (rowId) {
                        let check = true;
                        self.groupConfig.map((group) => {
                            if (group.id == rowId) {
                                check = false;
                            }
                        });
                        if (check) {
                            self.treeInstance.selectItem(rowId);
                            return true;
                        } else return false;
                    },
                );
            }

            scheduler.attachEvent(
                'onEventPasted',
                function (isCopy, modified_ev, original_ev) {
                    if (!isCopy) {
                        self.$emit('scheduler-event-changed', {
                            id: modified_ev.originRowData.document_object_id,
                            event: modified_ev,
                        });
                    } else {
                        // format lại date
                        let formatDate = scheduler.date.date_to_str('%Y-%m-%d');
                        let formatTime = scheduler.date.date_to_str('%H:%i:%s');
                        modified_ev.start_date_formated = formatDate(
                            modified_ev.start_date,
                        );
                        modified_ev.end_date_formated = formatDate(
                            modified_ev.end_date,
                        );
                        modified_ev.start_time_formated = formatTime(
                            modified_ev.start_date,
                        );
                        modified_ev.end_time_formated = formatTime(
                            modified_ev.end_date,
                        );

                        self.$emit('scheduler-handle-copy-event', modified_ev);
                    }
                },
            );

            //Append button switch view timeline and view calendar
            const btnSwitch = document.getElementById('switch-button');
            document
                .getElementsByClassName('left-container dhx_cal_container')[0]
                .appendChild(btnSwitch);
        },
        saveLightbox(text, id) {
            this.textEventAdded = text;
            scheduler.save_lightbox();
        },
        endLightbox() {
            scheduler.endLightbox(
                false,
                document.querySelector('.dhx_cal_light'),
            );
            setTimeout(() => {
                this.updateView();
                if (this.currentState == 'timeline_week') {
                    this.$emit('resize-scheduler-view-timeline-week');
                }
            }, 1000);
        },
        addEventDefaut() {
            // this.eventHasConfigRecurring = true;
            this.addEventByBtn = true;
            scheduler.addEvent({
                start_date: '16-06-2013 09:00',
                end_date: '16-06-2013 11:00',
                text: 'New Event',
            });
        },
        showLightbox(id) {
            scheduler.showLightbox(id);
            $('#symper_form_recurring').prepend($('#applyRec'));
            $('#applyRec').css('display', ' inline-block');
        },
        changeLanguageScheduler() {
            scheduler.locale = {
                date: {
                    // month_full:["January", "February", "March", "April", "May", "June",
                    //     "July", "August", "September", "October", "November", "December"],
                    month_full: [
                        this.$t('scheduler.view_enduser.month_full.January'),
                        this.$t('scheduler.view_enduser.month_full.February'),
                        this.$t('scheduler.view_enduser.month_full.March'),
                        this.$t('scheduler.view_enduser.month_full.April'),
                        this.$t('scheduler.view_enduser.month_full.May'),
                        this.$t('scheduler.view_enduser.month_full.June'),
                        this.$t('scheduler.view_enduser.month_full.July'),
                        this.$t('scheduler.view_enduser.month_full.August'),
                        this.$t('scheduler.view_enduser.month_full.September'),
                        this.$t('scheduler.view_enduser.month_full.October'),
                        this.$t('scheduler.view_enduser.month_full.November'),
                        this.$t('scheduler.view_enduser.month_full.December'),
                    ],
                    month_short: [
                        'Thg 1',
                        'Thg 2',
                        'Thg 3',
                        'Thg 4',
                        'Thg 5',
                        'Thg 6',
                        'Thg 7',
                        'Thg 8',
                        'Thg 9',
                        'Thg 10',
                        'Thg 11',
                        'Thg 12',
                    ],
                    // day_full:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                    //     "Friday", "Saturday"],
                    day_full: [
                        this.$t('scheduler.view_enduser.day_full.Sunday'),
                        this.$t('scheduler.view_enduser.day_full.Monday'),
                        this.$t('scheduler.view_enduser.day_full.Tuesday'),
                        this.$t('scheduler.view_enduser.day_full.Wednesday'),
                        this.$t('scheduler.view_enduser.day_full.Thursday'),
                        this.$t('scheduler.view_enduser.day_full.Friday'),
                        this.$t('scheduler.view_enduser.day_full.Saturday'),
                    ],
                    day_short: [
                        this.$t('scheduler.view_enduser.day_short.Sunday'),
                        this.$t('scheduler.view_enduser.day_short.Monday'),
                        this.$t('scheduler.view_enduser.day_short.Tuesday'),
                        this.$t('scheduler.view_enduser.day_short.Wednesday'),
                        this.$t('scheduler.view_enduser.day_short.Thursday'),
                        this.$t('scheduler.view_enduser.day_short.Friday'),
                        this.$t('scheduler.view_enduser.day_short.Saturday'),
                    ],
                },
                labels: {
                    dhx_cal_today_button: this.$t(
                        'scheduler.view_enduser.labels.today',
                    ),
                    day_tab: this.$t('scheduler.view_enduser.labels.day'),
                    week_tab: this.$t('scheduler.view_enduser.labels.week'),
                    month_tab: this.$t('scheduler.view_enduser.labels.month'),
                    new_event: 'New event',
                    icon_save: 'Save',
                    icon_cancel: 'Cancel',
                    icon_details: 'Details',
                    icon_edit: 'Edit',
                    icon_delete: 'Delete',
                    confirm_closing: '', // Your changes will be lost, are your sure?
                    confirm_deleting:
                        '<h3>' +
                            this.$t('v2.doc.contentConfirmDelete') +
                        '</h3>' +
                        '<br>' +
                        this.$t('v2.kanban.confirmDeleteCard'),
                    section_description: 'Description',
                    section_time: 'Time period',
                    full_day: 'Full day',

                    /*recurring events*/
                    confirm_recurring:
                        'Do you want to edit the whole set of repeated events?',
                    section_recurring: 'Repeat event',
                    button_recurring: 'Disabled',
                    button_recurring_open: 'Enabled',
                    button_edit_series: 'Edit series',
                    button_edit_occurrence: 'Edit occurrence',

                    /*agenda view extension*/
                    agenda_tab: 'Agenda',
                    date: 'Date',
                    description: 'Description',

                    /*year view extension*/
                    year_tab: 'Year',

                    /* week agenda extension */
                    week_agenda_tab: 'Agenda',

                    /*grid view extension*/
                    grid_tab: 'Grid',

                    /* touch tooltip*/
                    drag_to_create: 'Drag to create',
                    drag_to_move: 'Drag to move',

                    /* dhtmlx message default buttons */
                    message_ok: 'OK',
                    message_cancel: 'Thoát',

                    /* wai aria labels for non-text controls */
                    next: 'Next',
                    prev: 'Previous',
                    year: 'Year',
                    month: 'Tháng',
                    day: 'Day',
                    hour: 'Hour',
                    minute: 'Minute',

                    /* recurring event components */
                    repeat_radio_day: 'Daily', //name="repeat" value="day"
                    repeat_radio_week: 'Weekly', //name="repeat" value="week
                    repeat_radio_month: 'Monthly',
                    repeat_radio_year: 'Yearly',
                    repeat_radio_day_type: 'Every',
                    repeat_text_day_count: 'day',
                    repeat_radio_day_type2: 'Every workday',
                    repeat_week: ' Repeat every',
                    repeat_text_week_count: 'week next days:',
                    repeat_radio_month_type: 'Repeat',
                    repeat_radio_month_start: 'On',
                    repeat_text_month_day: 'day every',
                    repeat_text_month_count: 'month',
                    repeat_text_month_count2_before: 'every',
                    repeat_text_month_count2_after: 'month',
                    repeat_year_label: 'On',
                    select_year_day2: 'of',
                    repeat_text_year_day: 'day',
                    select_year_month: 'month',
                    repeat_radio_end: 'No end date',
                    repeat_text_occurences_count: 'occurrences',
                    repeat_radio_end2: 'After',
                    repeat_radio_end3: 'End by',
                    month_for_recurring: [
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                    ],
                    day_for_recurring: [
                        'Chủ nhật',
                        'Thứ hai',
                        'Thứ ba',
                        'Thứ tư',
                        'Thứ năm',
                        'Thứ sáu',
                        'Thứ bảy',
                    ],
                },
            };
        },
        getTemplateViewMonth() {
            let self = this;
            scheduler.templates.event_bar_date = function (start, end, ev) {
                if (ev.colorConfig) {
                    let html =
                        `<b style=" color: ${ev.colorConfig.start_date.color};
                                    background: ${ev.colorConfig.start_date.background}; 
                                    font-weight: ${ev.colorConfig.start_date.fontWeight}; 
                                    font-style: ${ev.colorConfig.start_date.fontStyle}; 
                                    text-decoration: ${ev.colorConfig.start_date.textDecoration}; 
                        ">• ` +
                        scheduler.templates.event_date(start) +
                        ` </b>`;
                    return html;
                }
            };
            scheduler.templates.event_bar_text = function (start, end, ev) {
                if (ev.colorConfig) {
                    if (self.switchtext == 'Timeline') {
                        let html = ''
                        if(scheduler.getState().mode == 'tree_mode_week'){
                            html +=
                            `<b style=" color: ${ev.colorConfig.start_date.color};
                                        background: ${ev.colorConfig.start_date.background}; 
                                        font-weight: ${ev.colorConfig.start_date.fontWeight}; 
                                        font-style: ${ev.colorConfig.start_date.fontStyle}; 
                                        text-decoration: ${ev.colorConfig.start_date.textDecoration};
                                        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                            ">` +
                            scheduler.templates.event_date(start) +
                            ` </b>`;                            
                        }
                        html +=
                            `<b style=" color: ${ev.colorConfig.text.color};
                                        background: ${ev.colorConfig.text.background}; 
                                        font-weight: ${ev.colorConfig.text.fontWeight}; 
                                        font-style: ${ev.colorConfig.text.fontStyle}; 
                                        text-decoration: ${ev.colorConfig.text.textDecoration};
                                        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                            ">` +
                            ev.text.replace(/(<([^>]+)>)/ig,'') +
                            `</b>`;
                        return html;
                    } else {
                        let html =
                            `<b style=" color: ${ev.colorConfig.text.color};
                                        background: ${ev.colorConfig.text.background}; 
                                        font-weight: ${ev.colorConfig.text.fontWeight}; 
                                        font-style: ${ev.colorConfig.text.fontStyle}; 
                                        text-decoration: ${ev.colorConfig.text.textDecoration};
                            ">` +
                            ev.text.replace(/(<([^>]+)>)/ig,'') +
                            `</b>`;
                        return html;
                    }
                }
            };
            scheduler.templates.event_class = function (start, end, ev) {
                if (ev.colorConfig) {
                    ev.color = ev.colorConfig.backgroundAll;
                    ev.textColor = ev.colorConfig.text.color;
                }
                return 'symper_event';
            };
        },

        nextweek(id) {
            var ce = scheduler.getEvent(id);
            var newStartDate = scheduler.date.add(ce.start_date, 7, 'day');
            var newEndDate = scheduler.date.add(ce.end_date, 7, 'day');
            ce.start_date = newStartDate;
            ce.end_date = newEndDate;
        },
        getEvent(id) {
            var ce = scheduler.getEvent(id);
            if(ce){
                var time_format = scheduler.date.date_to_str('%H:%i ');
                let formatDate = scheduler.date.date_to_str('%Y-%m-%d');

                ce.start_time_tooltip = time_format(ce.start_date) + formatDate(ce.start_date);
                ce.end_time_tooltip = time_format(ce.end_date) + formatDate(ce.end_date);

                let formatTime = scheduler.date.date_to_str('%H:%i:%s');
                ce.start_date_formated = formatDate(ce.start_date);
                ce.end_date_formated = formatDate(ce.end_date);
                ce.start_time_formated = formatTime(ce.start_date);
                ce.end_time_formated = formatTime(ce.end_date);

                //format date day len db recurring
                let formatRec = scheduler.date.date_to_str('%Y-%m-%d %H:%i:%s');

                ce.start_time_recurring = formatRec(ce.start_date);
                ce.end_time_recurring = formatRec(ce.end_date);
                const words = id.toString().split('#');
                if (words.length > 1) {
                    var Ev = scheduler.getEvent(words[0]);
                    ce._end_time_recurring = formatRec(Ev.end_date);
                }
            }

            return ce;
        },
        getEventRecuringOrigin(id) {
            var oe = scheduler.getEvent(id);
            let formatRec = scheduler.date.date_to_str('%Y-%m-%d %H:%i:%s');
            oe._end_time_recurring = formatRec(oe._end_date);
            return oe;
        },
        handleSearchGroup(groupSearchKey) {
            this.pageActive = 1;
            this.groupConfig.map((group) => {
                group.page = 1;
            });
            this.groupSearchKey = groupSearchKey;
            this.renderTreeListTask(false, true);
        },
        viewDetailEvent() {
            var id = this.treeInstance.contextID;
            this.$emit('detailEvent', id);
        },
        renderTreeListTask(dataPagination, isSearch = false) {
            var pagination = {
                group: '1',
                page: 1,
            };
            if (dataPagination) {
                pagination.page = dataPagination.page;
                pagination.group = dataPagination.index;
            }

            // menu rỗng khi click chuột phải vào tên group
            var menuNull = new dhtmlXMenuObject();
            menuNull.renderAsContextMenu();
            menuNull.loadStruct(
                `<menu>

                </menu>`,
            );

            if (this.treeInstance) {
                var treeGroup = this.treeInstance;

                // search group
                if (!this.groupSearchKey) {
                    this.groupConfig.map((group) => {
                        if (group.data) {
                            group.data.map((data) => {
                                data.display = true;
                            });
                        }
                    });
                } else {
                    let searchKey = this.groupSearchKey.toLowerCase();
                    this.groupConfig.map((group) => {
                        group.data.map((data, index) => {
                            if (data.title || data.title == '') {
                                data.display = data.title
                                    .toLowerCase()
                                    .includes(searchKey);
                                if (data.display) {
                                    group.isOpen = true;
                                }
                            }
                        });
                    });
                }

                this.groupConfig.map((group) => {
                    treeGroup.deleteChildItems(group.id);
                    if (group.data) {
                        let countTaskDisplay = 0;
                        let index = -1;
                        group.data.map((data) => {
                            if (
                                (data.title || data.title == '') &&
                                data.display
                            ) {
                                countTaskDisplay++;
                                index++;
                                if (group.id == pagination.group) {
                                    group.page = pagination.page;
                                    if (
                                        pagination.page * 10 - 10 <= index &&
                                        index <= pagination.page * 10 - 1
                                    ) {
                                        treeGroup.insertNewItem(
                                            group.id,
                                            data.document_object_id,
                                            data.title,
                                        );
                                    }
                                } else {
                                    // không phân trang
                                    if (0 <= index && index <= 9) {
                                        treeGroup.insertNewItem(
                                            group.id,
                                            data.document_object_id,
                                            data.title,
                                        );
                                    }
                                }
                            }
                        });
                        this.$set(group, 'countTaskDisplay', countTaskDisplay);
                    }
                });
                // custom css tree
                this.groupConfig.map((group, index) => {
                    treeGroup.setItemContextMenu(group.id, menuNull);
                    if (group.data) {
                        let indexTask = -1
                        group.data.map((data) => {
                            if (data.title || data.title == '') {
                                indexTask++;
                                if (group.id == pagination.group) {
                                    if (
                                        pagination.page * 10 - 10 <=
                                            indexTask &&
                                        indexTask <= pagination.page * 10 - 1
                                    ) {
                                        let indexTree = indexTask - (pagination.page * 10 - 10);
                                        if (
                                            treeGroup.htmlNode.childNodes[index]
                                                .childNodes[indexTree].span
                                        ) {
                                            this.customCssListTask(
                                                index,
                                                indexTree,
                                            );
                                        }
                                    }
                                } else if (group.page) {
                                    if (
                                        group.page * 10 - 10 <= indexTask &&
                                        indexTask <= group.page * 10 - 1
                                    ) {
                                        indexTask -= group.page * 10 - 10;
                                        if (
                                            treeGroup.htmlNode.childNodes[index]
                                                .childNodes[indexTask].span
                                        ) {
                                            this.customCssListTask(
                                                index,
                                                indexTask,
                                            );
                                        }
                                    }
                                } else {
                                    if (0 <= indexTask && indexTask <= 9) {
                                        this.customCssListTask(
                                            index,
                                            indexTask,
                                        );
                                    }
                                }
                            }
                        });
                        // count task
                        treeGroup.htmlNode.childNodes[index].span.title =
                            group.nameGroup.name.value;
                        let label = group.nameGroup.name.value;
                        treeGroup.htmlNode.childNodes[index].span.innerHTML =
                            label + ' (' + group.countTaskDisplay + ')';
                    }
                });
                this.renderPaginationGroup();
                // close tree khi mới render / refresh
                if (!dataPagination && !this.groupSearchKey) {
                    treeGroup.closeAllItems('0');
                    this.groupConfig.map((group) => {
                        group.isOpen = false;
                        let groupPagination = document.querySelector(
                            '#group-pagination' + group.id,
                        );
                        if (groupPagination) {
                            groupPagination.style.display = 'none';
                        }
                    });
                }
                // mở group này không bị mở group kia
                this.groupConfig.map((group) => {
                    if (!group.isOpen) {
                        treeGroup.closeAllItems(group.id);
                        let groupPagination = document.querySelector(
                            '#group-pagination' + group.id,
                        );
                        if (groupPagination) {
                            groupPagination.style.display = 'none';
                        }
                    } else {
                        let groupPagination = document.querySelector(
                            '#group-pagination' + group.id,
                        );
                        if (groupPagination) {
                            groupPagination.style.display = 'block';
                        }
                    }
                });
            } else {
                this.treeInstance = new dhtmlXTreeObject(
                    'treebox',
                    '100%',
                    '100%',
                    0,
                );
                var treeGroup = this.treeInstance;
                treeGroup.enableDragAndDrop(true);

                treeGroup.setImagePath(
                    '//cdn.dhtmlx.com/edge/imgs/dhxtree_material/',
                );
                let treeView = {
                    id: 0,
                    text: 'tree',
                    item: [],
                };
                treeGroup.enableContextMenu(this.menuInstance);

                this.groupConfig.map((group) => {
                    let tree = {
                        text: group.nameGroup.name.value,
                        id: group.id,
                        item: [],
                    };
                    if (group.data) {
                        let index = -1;
                        group.data.map((data) => {
                            if (data.title || data.title == '') {
                                index++;
                                if (
                                    pagination.page * 10 - 10 <= index &&
                                    index <= pagination.page * 10 - 1
                                ) {
                                    tree.item.push({
                                        text: data.title,
                                        id: data.document_object_id,
                                    });
                                }
                            }
                        });
                    }
                    treeView.item.push(tree);
                });
                treeGroup.enableTreeImages(false);
                treeGroup.parse(treeView, 'json');
                // custom css tree
                this.groupConfig.map((group, index) => {
                    treeGroup.setItemContextMenu(group.id, menuNull);
                    if (group.data) {
                        let indexTask = -1;
                        group.data.map((data) => {
                            if (data.title || data.title == '') {
                                indexTask++;
                                if (
                                    pagination.page * 10 - 10 <= indexTask &&
                                    indexTask <= pagination.page * 10 - 1
                                ) {
                                    if (pagination.page > 1) {
                                        indexTask -= pagination.page * 10 - 10;
                                    }
                                    this.customCssListTask(index, indexTask);
                                }
                            }
                        });

                        treeGroup.htmlNode.childNodes[index].span.title =
                            treeGroup.htmlNode.childNodes[index].span.innerHTML;
                        let label =
                            treeGroup.htmlNode.childNodes[index].span.innerHTML;
                        let countTask = group.data.length;
                        treeGroup.htmlNode.childNodes[index].span.innerHTML =
                            label + ' (' + countTask + ')';
                    }
                });
                this.renderPaginationGroup();
                treeGroup.enableImageDrag(false);
                treeGroup.setDragBehavior('sibling');
                treeGroup.enableKeyboardNavigation(true);
                treeGroup.closeAllItems('0');
            }
        },
        renderPaginationGroup() {
            this.groupConfig.map((group, index) => {
                // add pagination
                let tableIndex = index + 2;
                let domListGroups = document.querySelector(
                    '#treebox > div > table > tbody > tr:nth-child(' +
                        tableIndex +
                        ') > td:nth-child(2) > table',
                );
                let loopCheckLoadGroup = setInterval(() => {
                    let groupPagination = document.querySelector(
                        '#group-pagination' + group.id,
                    );
                    if (groupPagination) {
                        clearInterval(loopCheckLoadGroup);
                        if (domListGroups) {
                            domListGroups.appendChild(groupPagination);
                        }
                    }
                }, 50);
            });
        },
        createTree(tree, newTree, keys , parent = false){
            for(let key in keys){
                var newKey = parent ? parent + '_' + newTree[keys[key]] : newTree[keys[key]]
                let label = newTree[keys[key]]
                if(this.userColumnControl.includes(keys[key])){
                    label = this.$store.state.app.allUsers.filter((col) => {return col.id == newTree[keys[key]]})[0]
                    label = label ? label.displayName : newTree[keys[key]]
                }
                let data = {key:newKey, label: label}
                if(key < keys.length - 1){
                    if(tree[newKey]){
                        data.children = tree[newKey].children
                    }else {
                        data.open = key == keys.length - 2 ? false : true
                        data.children = {}
                        tree[newKey] = data
                    }
                    keys.splice (key, 1);
                    this.createTree(data.children, newTree, keys, newKey)  
                }else {
                    tree[newKey] = data
                }
            }
            return tree
        },
        // chuyển tree về đúng định dạng thư viện
        modifyTreeStructure(elements){
            for(let i = 0 ; i < elements.length; i++){
                if(elements[i].children)  elements[i].children = this.modifyTreeStructure(Object.values(elements[i].children))
            }
            return elements
        },
        createTreeView(listTree){
            let elements = {};
            if(listTree){
                listTree.map(tree=>{
                    elements = this.createTree(elements, tree, Object.keys(listTree[0]))           
                })
            }
            elements = this.modifyTreeStructure(Object.values(elements))
            scheduler.createTimelineView({
                section_autoheight: false,
                name:	"tree_mode_day",
                x_unit:	"minute",
                x_date:	"%H:%i",
                x_step:	60,
                x_size: 24,
                y_unit: elements,
                y_property:	"treeId",
                render: "tree",
                folder_dy:22,
                dy:60,
                dx:120
            });
            scheduler.createTimelineView({
                section_autoheight: false,
                name:	"tree_mode_week",
                x_unit:	"day",
                x_date:	"%d/%m",
                x_step:	1,
                x_size: 7,
                y_unit: elements,
                y_property:	"treeId",
                render: "tree",
                folder_dy:22,
                round_position:true,
                dy:60,
                dx:120
            });
			scheduler.templates['tree_mode_day_scale_label'] = function(key, label, section){
				return label+ `<span class="tooltiptext">`+label.replace(/(<([^>]+)>)/ig,'')+`</span>`; 
			};
            scheduler.templates['tree_mode_week_scale_label'] = function(key, label, section){
                return label+ `<span class="tooltiptext">`+label.replace(/(<([^>]+)>)/ig,'')+`</span>`; 
			};
            scheduler.date.tree_mode_week_start = function(date) {
                return scheduler.date.week_start(date);
            }
            scheduler.templates.tree_mode_week_scale_date = scheduler.templates.week_scale_date;
            if(this.currentState == 'day' && this.switchtext == 'Timeline'){
                scheduler.setCurrentView(null, 'tree_mode_day');              
            }
            if(this.currentState == 'week' && this.switchtext == 'Timeline'){
                scheduler.setCurrentView(null, 'tree_mode_week');              
            }
        },
        renderEvent(events) {
            scheduler.clearAll();
            scheduler.parse(events);
            this.isRenderScheduler = true;
            this.defaultWidthScheduler = document.querySelector(
                '.left-container.dhx_cal_container',
            ).offsetWidth;
            this.updateView();
        },
        setHeightScheduler(){
            setTimeout(() => {
                if($('.dhx_multi_day').height() != 0){
                    var height = $('.dhx_multi_day').height()
                    $('.dhx_multi_day').css({
                        'max-height': '97px',
                        'overflow-y': 'scroll'
                    });
                    let heightViewWeek = $('.dhx_multi_day').height() + 93
                    $('.dhx_cal_data').css({
                        "height" : "calc(100% - "+ heightViewWeek +"px)",
                        "top" : $('.dhx_multi_day').height() + 92 + 'px'
                    });
                    let heightViewDay = $('.dhx_multi_day').height() + 63
                    $('.scheduler-view-day .dhx_cal_data').css({
                        "height" : "calc(100% - "+ heightViewDay +"px)",
                        "top" : $('.dhx_multi_day').height() + 62 + 'px'
                    });
                    $('.dhx_multi_day_icon').css({
                        'max-height': '97px',
                    });
                    $('.dhx_multi_day').scroll(function () {
                        if($('.dhx_multi_day').scrollTop() < height - 91){
                            $('.dhx_multi_day_icon').css(
                                'margin-top',
                                $('.dhx_multi_day').scrollTop(),
                            );
                        }                            
                    });
                }
                if(!$('.dhx_multi_day').height()) {
                    $('.dhx_cal_data').css({
                        "height" : "calc(100% - 93px)",
                        "top" : "92px"
                    });
                    $('.scheduler-view-day .dhx_cal_data').css({
                        "height" : "calc(100% - 62px)",
                        "top" : "61px"
                    });                 
                }
            }, 500);
        },
        customCssListTask(index, indexTask) {
            let treeGroup = this.treeInstance;
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.border = '0.5px dashed #B5B5B5';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.borderRadius = '4px';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.left = '10px';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.overflow = 'hidden';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.textOverflow = 'ellipsis';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.whiteSpace = 'nowrap';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.lineHeight = '28px';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.display = 'inline-block';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.width = '210px';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.height = '28px';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.paddingLeft = '8px';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.style.paddingRight = '8px';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].span.title =
                treeGroup.htmlNode.childNodes[index].childNodes[
                    indexTask
                ].span.innerHTML;
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].htmlNode.children[0].children[0].children[0].style.display =
                'none';
            treeGroup.htmlNode.childNodes[index].childNodes[
                indexTask
            ].tr.cells[0].style.display = 'none';
        },
        getAllEvent() {
            let dateState = scheduler.getState();
            let formatDate = scheduler.date.date_to_str('%Y-%m-%d');
            let min_date = formatDate(dateState.min_date);
            let max_date = formatDate(dateState.max_date);
            this.$emit('get-event-scheduler', {
                min_date: min_date,
                max_date: max_date,
            });
        },
        refreshCanvasScheduler() {
            this.isRenderScheduler = false;
            this.getAllEvent();
            this.getEventTemplate();
            this.checkHighlightCurrentDay();
        },
        getEventTemplate() {
            let self = this;
            scheduler.renderEvent = function (
                container,
                ev,
                width,
                height,
                header_content,
                body_content,
            ) {
                if (ev.colorConfig) {
                    container.style.top = parseFloat(container.style.top) - 1 + 'px'
                    container.style.height = height + 'px';
                    var container_width = container.style.width;
                    if (ev.colorConfig.backgroundAll) {
                        container.style.background =
                            ev.colorConfig.backgroundAll;
                    } else {
                        container.style.background = '#0288d1';
                    }
                    var body_height = height - 8;
                    // move section
                    var html =
                        "<div class='dhx_event_move symper_event_move' style='height: " +
                        body_height +
                        'px; width: ' +
                        container_width +
                        "'></div>";
                    // container for event contents
                    let padding = '4px 0px 4px 4px';
                    var fontSize = '12px';
                    if (height <= 16) {
                        padding = '0px 0px 0px 4px';
                        fontSize = '11px';
                    }
                    let heightContent = body_height + 6;
                    html +=
                        "<div class='symper_event_body' style='height: " +
                        heightContent +
                        'px; padding: ' +
                        padding +
                        "; color: white;'>";
                    // start date
                    if (height >= 36) {
                        html +=
                            `<div style="overflow: hidden; white-space: nowrap; -webkit-mask-image: linear-gradient(90deg, #000 95%, transparent); "><span style="color: ${ev.colorConfig.start_date.color};
                                                background: ${ev.colorConfig.start_date.background}; 
                                                font-weight: ${ev.colorConfig.start_date.fontWeight}; 
                                                font-style: ${ev.colorConfig.start_date.fontStyle}; 
                                                text-decoration: ${ev.colorConfig.start_date.textDecoration}; 
                            " class='event_start_date'>` +
                            scheduler.templates.event_date(ev.start_date) +
                            `&nbsp;-&nbsp; </span> `;
                        // end date
                        html +=
                            `<span style="color: ${ev.colorConfig.end_date.color};
                                                background: ${ev.colorConfig.end_date.background}; 
                                                font-weight: ${ev.colorConfig.end_date.fontWeight}; 
                                                font-style: ${ev.colorConfig.end_date.fontStyle}; 
                                                text-decoration: ${ev.colorConfig.end_date.textDecoration}; 
                            " class='event_end_date'>` +
                            scheduler.templates.event_date(ev.end_date) +
                            `</span></div>`;
                    }

                    // displaying event text
                    var text_line = height > 11 ?  Math.floor((body_height - 14) / 14) : 1;
                    text_line = text_line <= 0 ? 1 : text_line

                    var maxHeight = height <= 11 ? text_line * 11 + 'px' : text_line * 14 + 'px';
                    var lineHeight = height <= 11 ? '11px' : '14px';
                    html +=
                        `<div style="color: ${ev.colorConfig.text.color};
                                            background: ${ev.colorConfig.text.background}; 
                                            font-weight: ${ev.colorConfig.text.fontWeight}; 
                                            font-style: ${ev.colorConfig.text.fontStyle}; 
                                            text-decoration: ${ev.colorConfig.text.textDecoration};
                                            max-height: ${maxHeight};
                                            font-weight: 500;
                                            font-size: ${fontSize};
                                            -webkit-mask-image: linear-gradient(90deg, #000 95%, transparent);
                                            line-height: ${lineHeight}
                        " class='event_text'>` +
                        scheduler.templates.event_text(
                            ev.start_date,
                            ev.text,
                            ev,
                        ) +
                        `</div>`;

                    html += '</div>';

                    // resize section
                    let resize_with = width - 16;
                    html +=
                        "<div class='dhx_event_resize symper_event_resize dhx_footer' style='width: " +
                        resize_with +
                        "px;'></div>";

                    container.innerHTML = html;
                    return true;
                } else {
                    var container_width = container.style.width;
                    container.style.background = 'rgb(2, 136, 209)';
                    var body_height = height - 8;
                    // move section
                    var html =
                        "<div class='dhx_event_move symper_event_move' style='height: " +
                        body_height +
                        'px; width: ' +
                        container_width +
                        "'></div>";
                    // container for event contents
                    html +=
                        "<div class='symper_event_body' style='height: " +
                        body_height +
                        "px; color: white;'>";
                    // start date
                    let max_width_time = width - 16;
                    html +=
                        `<div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: ` +
                        max_width_time +
                        `px;"><span
                        class='event_start_date'>` +
                        scheduler.templates.event_date(ev.start_date) +
                        `</span> &nbsp;-&nbsp;`;
                    // end date
                    html +=
                        `<span class='event_end_date'>` +
                        scheduler.templates.event_date(ev.end_date) +
                        `</span></div>`;

                    // displaying event text
                    let text_line = Math.floor((body_height - 20) / 20);
                    html +=
                        `<div style="color: display: -webkit-box;
											-webkit-box-orient: vertical;
											overflow: hidden;
											text-overflow: ellipsis;
											-webkit-line-clamp: ${text_line};
						" class='event_text'>` +
                        scheduler.templates.event_text(
                            ev.start_date,
                            ev.text,
                            ev,
                        ) +
                        `</div>`;

                    html += '</div>';

                    // resize section
                    let resize_with = width - 16;
                    html +=
                        "<div class='dhx_event_resize symper_event_resize dhx_footer' style='width: " +
                        resize_with +
                        "px;'></div>";

                    container.innerHTML = html;
                    return true;
                }
            };
        },
        getDefaultFormat() {
            return {
                start_date: {
                    color: '',
                    background: '',
                },
                end_date: {
                    color: '',
                    background: '',
                },
                text: {
                    color: '',
                    background: '',
                },
                backgroundAll: '',
            };
        },
        updateFormatEvent(newEvent) {
            var event = scheduler.getEvent(newEvent.id);
            event.colorConfig = newEvent.colorConfig;
            event.originRowData = newEvent.originRowData;
            if (newEvent.user) {
                event.user = newEvent.user;
                event.userName = newEvent.userName;
            }
            scheduler.updateEvent(newEvent.id);
            this.updateView();
        },
        selectEvent(id) {
            scheduler.select(id);
        },
        unSelectEvent(id) {
            scheduler.unselect(id);
        },
        updateIdEvent(oldEvent, dataObject) {
            // xóa -> add
            this.deleteEvent(oldEvent.id);
            let event = {
                start_date: oldEvent.start_date,
                end_date: oldEvent.end_date,
                text: oldEvent.text,
                id: dataObject.document_object_id,
                colorConfig: oldEvent.colorConfig,
                originRowData: dataObject,
            };
            if (
                this.cardConfig.other &&
                dataObject[this.cardConfig.other.field]
            ) {
                event.other = dataObject[this.cardConfig.other.field];
            }
            if (
                this.cardConfig.type &&
                dataObject[this.cardConfig.type.field]
            ) {
                event.type = dataObject[this.cardConfig.type.field];
            }
            scheduler.addEvent(event);
            this.$emit('get-new-format-for-a-event', event);
        },
        updateEventRecWithRecTypeEmpty(oldEvent, newId, originRowData) {
            // xóa -> add
            this.deleteEvent(oldEvent.id);
            originRowData[this.cardConfig.start_time.field] =
                oldEvent.start_time_formated;
            originRowData[this.cardConfig.end_time.field] =
                oldEvent.end_time_formated;
            let event = {
                start_date: oldEvent.start_date,
                end_date: oldEvent.end_date,
                text: oldEvent.text,
                id: newId,
                colorConfig: this.getDefaultFormat(),
                originRowData: originRowData,
                event_length: oldEvent.event_length,
                event_pid: oldEvent.event_pid,
                rec_type: '',
            };

            if (
                this.cardConfig.other &&
                originRowData[this.cardConfig.other.field]
            ) {
                event.other = originRowData[this.cardConfig.other.field];
            }
            if (
                this.cardConfig.type &&
                originRowData[this.cardConfig.type.field]
            ) {
                event.type = originRowData[this.cardConfig.type.field];
            }
            scheduler.addEvent(event);
            this.$emit('get-new-format-for-a-event', event);
        },
        updateEvent(id) {
            scheduler.updateEvent(id);
        },
        refreshGroup() {
            this.pageActive = 1;
            this.$emit('refresh-group');
            this.groupConfig.map((group) => {
                group.page = 1;
            });
        },
        changePage(vl) {
            // reset biến
            this.pageActive = 0;
            this.renderTreeListTask(vl);
        },
        deleteEvent(id) {
            if(this.getEvent(id)){
                scheduler.deleteEvent(id);
            }
        },
        addEvent(data, res) {
            //neu data da co truong colorconfig thi ...
            if (data.colorConfig) {
                let event = {
                    id: data.id,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    text: data.text,
                    colorConfig: data.colorConfig,
                    originRowData: data.originRowData,
                    type: data.type,
                    user: data.user,
                    other: data.other,
                };
                scheduler.addEvent(event);
                this.$emit('update-format-event', event);
            } else {
                let event = {
                    id: data.id,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    date: data.date,
                    text: data.text,
                    colorConfig: this.getDefaultFormat(),
                    originRowData: res,
                };
                if (this.cardConfig.other && res[this.cardConfig.other.field]) {
                    event.other = res[this.cardConfig.other.field];
                }
                if (this.cardConfig.type && res[this.cardConfig.type.field]) {
                    event.type = res[this.cardConfig.type.field];
                }
                if(data.treeId){
                    event.treeId = data.treeId
                }
                scheduler.addEvent(event);
                this.$emit('update-format-event', event);
            }
        },
        editEventRecurringWhenSubmit(data_event, idOld, dataObject) {
            // xóa event ảo trong chuỗi recurring -> add event mới
            this.deleteEvent(idOld);
            let event = {
                start_date: data_event.start_date,
                end_date: data_event.end_date,
                text: data_event.text,
                id: dataObject.document_object_id,
                colorConfig: this.getDefaultFormat(),
                originRowData: dataObject,
            }
            if(data_event.treeId){
                event.treeId = data_event.treeId
            }
            scheduler.addEvent(event);
            this.$emit('get-new-format-for-a-event', this.getEvent(dataObject.document_object_id));
        },
        delEventRecurring(id) {
            var ev = scheduler.getEvent(id);
            const words = id.split('#');

            var ce = {};
            ce.rec_type = 'none';
            ce.rec_pattern = 'none';
            ce.event_length = words[1];
            ce.start_date = ev.start_date;
            ce.end_date = ev.end_date;
            ce.event_pid = ev.event_pid;
            scheduler.addEvent(ce);
            scheduler.updateView();
        },
        delEventRecurringSeries(id) {
            const words = id.split('#');
            var ev = scheduler.getEvent(words[0]);
            var cur_event = scheduler.getEvent(id);
            ev.end_date = cur_event.start_date;
            scheduler.updateEvent(words[0]);
        },
        updateEventRecurringAffterSave(id, end_date) {
            const words = id.split('#');
            var ev = scheduler.getEvent(words[0]);
            ev.end_date = end_date;
            scheduler.updateEvent(id);
        },

        updateEventAdded(id) {
            var ev = scheduler.getEvent(id);
            ev.rec_type = '';
            ev.event_length = '';
            ev.event_pid = '';
            ev._pid_time = '';
            scheduler.updateEvent(id);
        },
        addEventRecurringAfterEdit(data, res) {
            const start_date = new Date(data.start_date);
            let event = {
                id: data.id,
                start_date: start_date,
                end_date: data.end_date,
                // date: data.date,
                text: data.text,
                event_length: data.event_length,
                event_pid: data.event_pid,
                rec_type: data.rec_type,
                colorConfig: this.getDefaultFormat(),
                originRowData: res,
            };
            if (this.cardConfig.other && res[this.cardConfig.other.field]) {
                event.other = res[this.cardConfig.other.field];
            }
            if (this.cardConfig.type && res[this.cardConfig.type.field]) {
                event.type = res[this.cardConfig.type.field];
            }
            if(data.treeId){
                event.treeId = data.treeId
            }

            scheduler.addEvent(event);
            this.$emit('update-format-event', event);
        },
        editEventRecurringAfterEdit(data) {
            var ev = scheduler.getEvent(data.id);
            ev.end_date = data.end_date;
            ev.rec_type = data.rec_type;
            ev.event_length = data.event_length;
            ev.start_date = new Date(data.start_date);
            ev.end_date = new Date(data.end_date);
            ev.event_pid = data.event_pid;
            ev.text = data.text
            scheduler.updateEvent(data.id);
        },
        addEventRectypeNone(data) {
            scheduler.addEvent({
                start_date: data.start_date,
                end_date: data.end_date,
                text: data.text,
                event_length: data.event_length,
                event_pid: data.event_pid,
                rec_type: data.rec_type,
            });
        },
        addEventRecurring(data, id) {
            let event = {
                id: data.id,
                start_date: data.start_date,
                end_date: data.end_date,
                date: data.date,
                text: data.text,
                event_length: data.event_length,
                event_pid: data.event_pid,
                rec_type: data.rec_type,
                colorConfig: this.getDefaultFormat(),
                originRowData: data.originRowData,
                type: data.type,
                user: data.user,
                other: data.other,
            };
            if(data.treeId){
                event.treeId = data.treeId
            }
            scheduler.addEvent(event);
            this.$emit('update-format-event', event);
        },
        setStatusEventHasConfigRecurring(status) {
            this.eventHasConfigRecurring = status;
        },
        checkHighlightTabActive() {
            if (this.switchtext == 'Timeline') {
                const viewWeek = document.getElementsByClassName('dhx_cal_tab');
                for (let i = 0; i < viewWeek.length; i++) {
                    let state = '';
                    if (this.currentState == 'timeline_week' || this.currentState == 'tree_mode_week') {
                        state = 'week';
                    } else state = 'day';
                    if (viewWeek[i].dataset.tab == state) {
                        viewWeek[i].classList.add('active');
                    }
                }
            }
        },
        checkHighlightCurrentDay() {
            // hightlight label ngày hiện tại view calendar week
            if (this.switchtext == 'Calendar') {
                let headerDateNow = document.querySelector(
                    '[aria-label="' +
                        scheduler.templates.timeline_week_scale_label(
                            '',
                            new Date(),
                            '',
                        ) +
                        '"]',
                );
                if (headerDateNow) {
                    headerDateNow.style.color = '#FB7E00';
                }
            }
        },
        checkAndResizeScheduler() {
            let self = this;
            setTimeout(() => {
                let width = document.querySelector(
                    '.left-container.dhx_cal_container',
                ).offsetWidth;
                if (width > self.defaultWidthScheduler) {
                    scheduler.updateView();
                    scheduler._mark_now();
                    self.defaultWidthScheduler = width;
                    if (self.currentState == 'timeline_week') {
                        self.$emit('resize-scheduler-view-timeline-week');
                    }
                    this.checkHighlightCurrentDay();
                    this.checkHighlightTabActive();
                }
            }, 500);
        },
        collapseOrExpandListGroup(){
            this.isListGroupCollapse = !this.isListGroupCollapse
            setTimeout(() => {
                this.updateView();
            }, 500);
        }
    },
    computed: {
        isViewDay() {
            if (this.currentState != 'day') {
                return false;
            } else return true;
        },
        dateView(){
            let dateState = scheduler.getState();
            let formatDate = scheduler.date.date_to_str('%Y-%m-%d');
            return formatDate(dateState.min_date);
        },
        widthScheduler(){
            if(this.isShowGroup){
                if(this.isListGroupCollapse){
                    return 'calc(100% - 30px)'
                }else return 'calc(100% - 220px)'
            }
            return '100%'
        },
        leftScheduler(){
            if(this.isShowGroup){
                if(this.isListGroupCollapse){
                    return '30px'
                }else return '220px'
            }
            return ''
        }
    },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
@import url('https://cdn.dhtmlx.com/edge/dhtmlx.css?v=5.3.13');
.dhx_cal_event.dhx_cal_select_menu {
    display: none;
}
.dhx_cal_tab {
    height: 28px !important;
    background-color: #f2f2f2;
    margin: 0 4px;
    border: none;
    border-radius: 4px;
    color: #1b1b1b;
    font-size: 12px !important;
    font-family: 'Robonto', sans-serif;
    font-weight: 500;
    padding-top: 0px;
    text-transform: none;
    line-height: 28px;
}
.dhx_cal_navline.dhx_cal_navline_flex .dhx_cal_tab_last {
    margin-right: 8px;
}
.dhx_cal_tab.active {
    background-color: #fb7e00;
    border: none;
}
.dhx_cal_tab.active:hover {
    background-color: #e97502 !important;
}
.dhx_cal_navline.dhx_cal_navline_flex .dhx_cal_tab {
    box-shadow: none;
    width: 52px;
}

.dhx_cal_navline .dhx_cal_today_button {
    color: black;
    background-color: #f2f2f2;
    border-radius: 4px;
    height: 28px !important;
    border: none;
    font-size: 12px;
    font-family: 'Robonto', sans-serif;
    font-weight: 500 !important;
    text-transform: none;
    line-height: 28px;
}
.dhx_cal_navline.dhx_cal_navline_flex .dhx_cal_today_button {
    margin: 0 10px;
}
.dhx_cal_navline .dhx_cal_today_button:hover {
    border: none;
}

.dhx_cal_next_button.dhx_cal_nav_button {
    background-color: #f2f2f2;
    border-radius: 4px;
    margin-right: 10px;
    margin-left: 12px;
    height: 22px !important;
    width: 21px !important;
    border: none;
}
.dhx_cal_navline .dhx_cal_next_button:hover,
.dhx_cal_navline .dhx_cal_prev_button:hover {
    background-color: #edf8ff;
    border-radius: 4px;
    height: 22px !important;
    width: 21px !important;
    border: none;
}

.dhx_cal_prev_button.dhx_cal_nav_button {
    background-color: #f2f2f2;
    border-radius: 4px;
    height: 22px !important;
    width: 21px !important;
    border: none;
}
.dhx_scale_holder {
    background-repeat: repeat;
}
.dhx_scale_holder_now {
    background-repeat: repeat;
    background-color: #fff3e0;
}
.scheduler-view-day .dhx_scale_holder_now {
    background-repeat: repeat;
    background-color: transparent;
}
.scheduler-view-day .dhx_scale_bar {
    display: none;
}
.scheduler-view-day .dhx_cal_scale_placeholder {
    box-shadow: none !important;
    height: 0px;
    border-bottom: 1px solid #e0e0e0;
    top: 41px !important;
}
.dhx_scheduler_day .dhx_cal_scale_placeholder {
    display: none !important;;
}
.scheduler-view-day .dhx_cal_header {
    height: 0px !important;
}
.dhx_cal_navline.dhx_cal_navline_flex .dhx_cal_date {
    flex-grow: 0;
    margin-right: 8px;
    font-family: 'Roboto', sans-serif;
    font-size: 16px;
    font-weight: 500;
    border: none;
}

.dhx_cal_navline div.dhx_minical_icon {
    width: 24px !important;
    height: 24px !important;
    background-color: #f2f2f2;
    border-radius: 4px;
}

.dhx_cal_navline div.dhx_minical_icon:hover {
    background-color: #edf8ff;
    border-radius: 4px !important;
}
.dhx_cal_navline.dhx_cal_navline_flex .dhx_cal_date, .dhx_scell_name {
    font-size: 13px;
    font-weight: 400!important;
}
.dhx_scell_name p {
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 13px;
    max-height: 50px;
    margin: 4px 4px 0px 0px!important;
}
.container {
    height: 100%;
    width: 100%;
}
.left-container {
    position: relative;
    height: 100%;
    display: inline-block;
    width: 100%;
}

.right-container {
    border-right: 1px solid #cecece;
    float: right;
    height: 100%;
    width: 340px;
    box-shadow: 0 0 5px 2px #aaa;
    position: relative;
    z-index: 2;
}

.scheduler-messages {
    list-style-type: none;
    height: 50%;
    margin: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding-left: 5px;
}

.scheduler-messages > .scheduler-message {
    background-color: #f4f4f4;
    box-shadow: inset 5px 0 #d69000;
    font-family: Geneva, Arial, Helvetica, sans-serif;
    font-size: 14px;
    margin: 5px 0;
    padding: 8px 0 8px 10px;
}
.dhx_now .dhx_month_head {
    background-color: #fff3e0 !important;
    color: rgba(0, 0, 0, 0.87) !important;
    font-weight: 500 !important;
}
.dhx_month_head {
    color: black;
}

.dhx_now .dhx_month_body {
    background-color: #fff3e0 !important;
}
.dhtmlXTooltip.tooltip {
    padding: 20px 10px;
    border-radius: 5px;
}
.dhtmlXTooltip.tooltip h1 {
    font-weight: 500px;
    font-size: 16px;
}
.dhtmlx_popup_text {
    text-align: left;
    margin: 28px 15px 15px 25px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.87);
    min-height: 30px;
    border-radius: 6px;
}
.dhtmlx_popup_button.dhtmlx_ok_button div {
    color: #ff584c;
    background-color: white;
    border: none;
}
.dhtmlx_button input,
.dhtmlx_popup_button div,
.dhtmlx_popup_button {
    color: black;
}
.dhtmlx_modal_box
    .dhtmlx_popup_controls
    .dhtmlx_popup_button.dhtmlx_cancel_button,
.dhtmlx_modal_box .dhtmlx_popup_controls .dhtmlx_popup_button.dhtmlx_ok_button {
    text-transform: none;
}
.dhtmlx_popup_button.dhtmlx_ok_button div:hover {
    background-color: #d9edf8;
    border-color: #d9edf8;
    transition: all 0.1s ease-in-out;
}
.dhtmlx_popup_button.dhtmlx_ok_button:hover {
    background: #d9edf8;
    border-color: #d9edf8;
}
.dhtmlx_popup_button.dhtmlx_ok_button {
    border: 1px solid white;
    background: none;
}
.dhx_now_time {
    width: 100%;
    border-bottom: 2px solid red;
    opacity: unset;
}
.left-bar {
    height: 100%;
    border-right: 0.5px solid #b5b5b5;
}
.standartTreeRow {
    font-size: 13px;
}
.standartTreeImage {
    width: 18px;
}
.selectedTreeRow {
    background: white;
    color: black;
    border: 0.5px solid #fb7e00 !important;
    font-size: 13px;
}
.dhxtree_material .selectedTreeRowFull .dhxTextCell {
    background-color: white;
}
.dragSpanDiv {
    color: white;
    font-size: 13px;
    border: 0.5px solid #b5b5b5;
    border-radius: 4px;
    background-color: rgba(0, 85, 251, 0.7);
    height: 22px;
    line-height: 22px;
    padding-left: 8px;
    padding-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    max-width: 400px;
}
.dhx_month_link a,
.dhx_month_link a:hover {
    font-size: 11px;
    color: #939393;
    margin-right: 6px;
}
.dhx_month_link a{
    width: 76px!important;
    position: absolute;
    bottom: -18px;
    left: -5px;
}
.dhx_cal_event.symper_event {
    border-radius: 4px;
    border: 1px solid #fff;
}
.symper_event{
    font-size: 12px;
}
.symper_event_move {
    position: absolute;
    top: 0;
    cursor: pointer;
    z-index: 2;
}
#switch-button {
    position: absolute;
    top: 15.5px;
    right: 12px;
    width: 101px;
    height: 28px;
}

#switch-button .v-btn--contained {
    box-shadow: none !important;
    background-color: #f2f2f2 !important;
}
#switch-button .v-btn--contained .v-btn__content {
    color: #1b1b1b;
    line-height: 22px;
}
#switch-button .v-btn--contained:hover,
#switch-button .v-btn--contained:before {
    background-color: rgba(0 0 0 / 0.1) !important;
}
.switch-text {
    font-size: 12px;
    font-weight: 400;
    font-family: 'Robonto', sans-serif;
}
.switch-list {
    min-height: 22px;
    padding-left: 13px;
    padding-right: 13px;
}
.position-v-list {
    background-color: #f2f2f2 !important;
    padding: 4px 0px;
}
#switch-button .v-menu__content {
    margin-top: 2px;
    background-color: #f2f2f2 !important;
    box-shadow: none !important;
}
#switch-button .v-btn--contained .v-btn__content img {
    margin-left: 12px;
}
.dhx_cal_navline.dhx_cal_navline_flex {
    width: calc(100% - 98px) !important;
}
.currentview {
    background-color: #d9d9d9;
    border-radius: 4px;
    padding: 4px 35px 4px 9px;
    margin-left: -10px;
    margin-right: -10px;
}
.div-mty {
    display: block;
    width: 21px;
    height: 28px;
}
.filter-bar {
    position: absolute;
    top: 0px;
    right: 0px;
    height: 100%;
    z-index: 100;
    background-color: white;
    width: 250px;
}
.btn-switch {
    font-size: 12px !important;
    padding: 0 12px !important;
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
}
.dhx_mini_calendar div.dhx_month_head.dhx_calendar_click {
    border: 1px solid rgba(251, 126, 0, 0.7) !important;
    background-color: #ffffff;
    color: black;
}
.dhx_mini_calendar .dhx_month_head {
    color: black;
}

.dhx_mini_calendar .dhx_now .dhx_month_head {
    color: white !important;
}
.dhx_mini_calendar div.dhx_month_head.dhx_year_event {
    color: black;
    background-color: #ffffff;
}
.dhx_mini_calendar div.dhx_month_head.dhx_year_event.dhx_calendar_click {
    background-color: transparent;
}
.dhxtree_material .selectedTreeRowFull .dhxTextCell {
    color: black;
}
.dhx_month_head.dhx_calendar_click {
    color: rgba(0, 0, 0, 0.87) !important;
}
.dhx_scale_bar,
.dhx_scale_hour {
    color: rgba(0, 0, 0, 0.8);
}
.dhx_scale_hour {
    font-size: 11px;
}
.dhx_scale_bar {
    font-size: 13px;
    font-weight: 400;
    font-family: 'Robonto', sans-serif;
    line-height: 30px;
}
.dhx_cal_prev_button {
    background-image: url(../../assets/icon/chevron-left.svg);
}
.dhx_cal_next_button {
    background-image: url(../../assets/icon/chevron-right.svg);
}
.dhx_cal_navline div.dhx_minical_icon {
    background-image: url(../../assets/icon/calendar-text-outline.svg);
}
.dhx_matrix_scell.folder.opened .dhx_scell_expand{
    background-image: url(../../assets/icon/chevron-down.svg);
    height: 16px;
    width: 16px;
}
.dhx_matrix_scell.folder.closed .dhx_scell_expand{
    background-image: url(../../assets/icon/chevron-up.svg);
    height: 16px;
    width: 16px;
}
.dhx_matrix_scell.folder.closed .dhx_scell_expand:after, .dhx_matrix_scell.folder.opened .dhx_scell_expand:after{
    background: none;
}
.dhx_cal_event .dhx_footer {
    background: none;
    height: 10px;
}
.dhx_year_week .dhx_scale_bar {
    color: rgba(0, 0, 0, 0.54);
}
.dhx_year_body {
    margin-left: 2px;
}
.dhx_year_week {
    margin-bottom: 6px;
    margin-left: 2px;
}
.dhx_mini_calendar .dhx_month_head {
    height: 28px;
    width: 28px;
    padding: 3px 0 0 1px;
}
.dhx_scheduler_timeline_week .dhx_timeline_label_row {
    line-height: 1.5rem !important;
}
.dhx_matrix_cell div, .dhx_matrix_scell div{
    text-align: start;
    overflow: unset;
    white-space: nowrap;
    padding-left: 0px !important;
}
.dhx_matrix_scell.item .dhx_scell_name{
    padding-left: 8px!important;
}
.dhx_row_item div {
    white-space: unset;
}
.dhx_matrix_scell.folder .dhx_scell_name, .dhx_matrix_scell{
    text-transform: none;
    color: rgba(0, 0, 0, 0.8);
}
.dhx_mini_calendar .dhx_year_month {
    background: #f2f2f2;
    margin: 0px 61px;
    border-radius: 4px;
    line-height: 25px;
}
.dhx_year_grid {
    margin-top: 8px;
}
.dhx_mini_calendar .dhx_cal_next_button,
.dhx_mini_calendar .dhx_cal_prev_button {
    margin-top: 4px;
}
.dhx_mini_calendar .dhx_now .dhx_month_body {
    background-color: transparent !important;
}
.dhx_mini_calendar .dhx_now .dhx_month_head {
    background-color: #fb7e00 !important;
}
.dhx_focus_slot {
    background: none;
}
.dhtmlxMenu_material_SubLevelArea_Polygon {
    border-radius: 4px;
    cursor: pointer !important;
}
.dhtmlxMenu_material_SubLevelArea_Polygon .sub_item_hk {
    display: none;
}
.dhx_cal_container :focus {
    outline-style: none;
}
.dhx_cal_container.dhx_scheduler_month :focus b {
    text-decoration: underline;
}
.dhx_cal_container {
    overflow-x: scroll;
}
.dhx_cal_event_selected {
    box-shadow: 0px 6px 10px 0px rgb(0 0 0 / 14%),
        0px 1px 18px 0px rgb(0 0 0 / 12%), 0px 3px 5px -1px rgb(0 0 0 / 20%);
}
.dhx_cal_light {
    height: 90vh !important;
    width: 850px !important;
    background-color: transparent !important;
}

.dhx_cal_larea {
    background-color: transparent !important;
    position: absolute;
    margin-top: 70px !important;
}
.dhx_cal_navline div.dhx_minical_icon:hover,
.dhx_cal_navline .dhx_cal_next_button:hover,
.dhx_cal_navline .dhx_cal_prev_button:hover,
.dhx_cal_tab:hover {
    background-color: rgba(0 0 0 / 0.1) !important;
}

.dhx_cal_light .dhx_cal_ltitle,
.dhx_cal_light .dhx_btn_set {
    display: none;
}
.dhx_cal_light input {
    border: none;
    color: blue;
}
.dhx_cal_light #symper_form_recurring input {
    color: black;
    font-size: 13px;
}
.dhx_form_repeat input {
    border: 1px solid #a9a9a9;
}
.dhx_form_repeat {
    display: none;
    height: 400px !important ;
    width: 400px !important;
    margin: auto !important;
}
.left-container .v-overlay--active {
    display: none;
}
.v-dialog {
    margin: 0px !important;
}
.dhx_cal_lsection {
    display: none;
}
.dhx_section_time,
.dhx_cal_ltext {
    display: none;
}
.dhx_marked_timespan {
    z-index: 2 !important;
}
.dhx_time_block {
    z-index: 1 !important;
    background: #fff3e0 !important;
}
.timeline_week_cell {
    background: #fff3e0;
}
#create-event .accent--text {
    color: #82b1ff !important;
    caret-color: #82b1ff !important;
}
#create-event .accent {
    background-color: #82b1ff !important;
    border-color: #82b1ff !important;
}
.dhtmlx_message_area {
    display: none;
}
.dhx_cal_navline.dhx_cal_navline_flex {
    padding: 0 1vw 0 0;
}
#symper_form_recurring .dhx_repeat_radio:checked {
    background-color: #fb7e00;
    appearance: none;
    width: 13px;
    height: 13px;
    border: 1px solid #fb7e00;
    border-radius: 50%;
    background-clip: content-box;
    padding: 2px;
}
#symper_form_recurring .dhx_repeat_text,
.dhx_repeat_date,
select {
    border-radius: 4px !important;
    height: 28px !important;
}
#symper_form_recurring .dhx_repeat_text {
    width: 20px !important;
}
#symper_form_recurring .dhx_repeat_text:focus-visible,
select:focus-visible {
    outline: 1px solid orange;
}
#symper_form_recurring label {
    font-size: 13px;
    color: black;
    font-family: 'Roboto';
    display: inline;
}
#symper_form_recurring .dhx_repeat_left label {
    padding-right: 40px;
}
#symper_form_recurring .dhx_repeat_left,
.dhx_repeat_center,
.dhx_repeat_right {
    border-bottom: none;
    padding: 0px !important;
    float: none;
    width: 370px !important;
}
#symper_form_recurring .dhx_repeat_left {
    height: 30px !important;
}
#symper_form_recurring .dhx_repeat_center {
    height: 78px !important;
}
.dhx_data_table.folder .dhx_matrix_cell, .dhx_matrix_scell.folder{
    background-color: #E9ECFE;
}
.dhx_matrix_scell .dhx_scell_level0{
    padding-left: 0px;
}
.left-container.dhx_cal_container .tooltiptext {
    visibility: hidden;
    background-color: rgba(0, 0, 0, 0.6);
    color: #fff;
    text-align: center;
    border-radius: 4px;
    padding: 3px 12px 4px;
    position: absolute;
    z-index: 1;
    top: 60px;
    line-height: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 500px;
    left: 0px;
}
.dhx_row_item .dhx_scell_name:hover .tooltiptext {
    visibility: visible;
}
</style>