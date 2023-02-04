<template>
    <div class="w-100 d-flex" style="height: 226px">
        <div class="general-cofig pa-2" style="width: 779px">
            <div class="d-flex justify-space-between pb-2">
                <div>
                    <span class="fs-13 fw-500" style="line-height: 28px">{{
                        $t('scheduler.group_config.title')
                    }}</span>
                    <i
                        class="mdi mdi-message-question color-red fs-15 ml-1"
                        style="line-height: 28px; cursor: pointer"
                        @click="showInstrucFormulaValue"
                    ></i>
                </div>
                <v-btn
                    small
                    v-show="action != 'view'"
                    class="ml-1 px-2"
                    solo
                    depressed
                    color="orange"
                    @click="addColumn"
                >
                    <v-icon color="white" size="12">mdi-plus</v-icon>
                    <span style="color: white">{{
                        $t('common.add-group')
                    }}</span>
                </v-btn>
            </div>

            <div v-if="groupConfig.length != 0" class="scheduler-group-config">
                <transition-group
                    type="transition"
                    name="flip-list"
                    class="d-flex"
                >
                    <div
                        v-for="(group, index) in groupConfig"
                        :key="group.id"
                        class="board-group mr-2"
                    >
                        <div class="group">
                            <div class="top d-flex justify-space-between mb-2">
                                <FormTpl
                                    :viewOnly="action == 'view'"
                                    :allInputs="group.nameGroup"
                                />
                                <v-tooltip top>
                                    <template v-slot:activator="{ on }">
                                        <i
                                            class="mdi mdi-close fs-15"
                                            style="
                                                line-height: 38px;
                                                cursor: pointer;
                                            "
                                            v-show="action != 'view'"
                                            @click="removeColumn(index)"
                                            v-on="on"
                                        ></i>
                                    </template>
                                    <span>{{ $t('common.delete') }}</span>
                                </v-tooltip>
                            </div>

                            <FormTpl
                                :viewOnly="action == 'view'"
                                :allInputs="group.formulaValue"
                                :titleSize="'11px'"
                            />
                        </div>
                    </div>
                </transition-group>
            </div>
            <div
                v-else
                class="fs-13"
                style="text-align: center; line-height: 174px"
            >
                {{ $t('scheduler.group_config.empty_group') }}
            </div>
        </div>

        <div class="general-cofig ml-3 pa-2" style="width: 240px; height: 150px">
            <FormTpl
                :viewOnly="action == 'view'"
                :allInputs="formulaUpdate"
                @show-more-infor="showMoreInforFormulaUpdate"
                :titleSize="'11px'"
            />
            <small class="fs-10 color-grey">{{ $t('kanban.validateInfor') }}</small>
        </div>
        <v-dialog v-model="isShowMoreInforFormulaUpdate" max-width="550">
            <v-card>
                <v-card-title class="text-h7">
                    {{ $t('scheduler.formulaUpdate.more_infor.title') }}
                    <v-spacer></v-spacer>
                    <v-btn
                        x-small
                        icon
                        @click="isShowMoreInforFormulaUpdate = false"
                    >
                        <i class="mdi mdi-close fs-16"></i>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <ul>
                        <li class="color-black">
                            {{ $t('scheduler.formulaUpdate.more_infor.note1') }}
                        </li>
                        <div class="color-black">
                            {{
                                $t('scheduler.formulaUpdate.more_infor.example')
                            }}
                            :
                        </div>
                        <div>
                            <span class="color-blue mr-8">UPDATE</span
                            >document_object_id
                        </div>
                        <div>
                            <span class="color-blue mr-15">SET</span>part_name =
                            UPPER (part_name)
                        </div>
                        <div>
                            <span class="color-blue mr-9">WHERE</span
                            >part_number = 1
                        </div>
                        <div>
                            <span class="color-blue mr-1">RETURNING </span
                            >document_object_id
                        </div>

                        <li class="color-black">
                            {{ $t('scheduler.formulaUpdate.more_infor.note2') }}
                        </li>
                    </ul>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="isShowMoreInforFormulaValue" max-width="650">
            <v-card>
                <v-card-title class="text-h7">
                    {{ $t('scheduler.formulaValue.title') }}
                    <v-spacer></v-spacer>
                    <v-btn
                        x-small
                        icon
                        @click="isShowMoreInforFormulaValue = false"
                    >
                        <i class="mdi mdi-close fs-16"></i>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <ul>
                        <li class="color-black">
                            {{ $t('scheduler.formulaValue.instruc1') }}
                        </li>
                        <div class="color-black ml-5">
                            <span class="color-orange">title - </span
                            >{{ $t('scheduler.formulaValue.instruc1_1')
                            }}<span class="color-grey">{{
                                $t('scheduler.formulaValue.required')
                            }}</span>
                        </div>
                        <div class="color-black ml-5">
                            <span class="color-orange">assignee - </span
                            >{{ $t('scheduler.formulaValue.instruc1_2')
                            }}<span class="color-grey">{{
                                $t('scheduler.formulaValue.optional')
                            }}</span>
                        </div>
                        <div class="color-black ml-5">
                            <span class="color-orange">type - </span
                            >{{ $t('scheduler.formulaValue.instruc1_3')
                            }}<span class="color-grey">{{
                                $t('scheduler.formulaValue.optional')
                            }}</span>
                        </div>
                        <div class="color-black ml-5">
                            <span class="color-orange">detail - </span
                            >{{ $t('scheduler.formulaValue.instruc1_4')
                            }}<span class="color-grey">{{
                                $t('scheduler.formulaValue.optional')
                            }}</span>
                        </div>

                        <div class="color-black">
                            {{ $t('scheduler.formulaValue.example') }} :
                        </div>
                        <div>
                            <span class="color-blue mr-8">SELECT</span>control_a
                            as <span class="color-orange">title</span>,
                            control_b as
                            <span class="color-orange">assignee</span>,
                            control_c as <span class="color-orange">type</span>,
                            control_d as
                            <span class="color-orange">detail</span>
                        </div>
                        <div>
                            <span class="color-blue mr-11">FROM</span
                            >document_object_id
                        </div>
                        <div>
                            <span class="color-blue mr-9">WHERE</span>control_x
                            = 1
                        </div>

                        <li class="color-black mt-1">
                            {{ $t('scheduler.formulaValue.instruc2') }}
                        </li>
                        <div class="color-black">
                            {{ $t('scheduler.formulaValue.example') }} :
                        </div>
                        <div>
                            <span class="color-blue mr-8">SELECT</span>control_a
                            as <span class="color-orange">title</span>
                        </div>
                        <div>
                            <span class="color-blue mr-11">FROM</span
                            >document_object_id
                        </div>
                        <div>
                            <span class="color-blue mr-9">WHERE</span>control_x
                            = 1
                        </div>
                    </ul>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
import FormTpl from '@/components/common/FormTpl.vue';
export default {
    name: 'schedulerGeneralConfig',
    components: {
        FormTpl,
    },
    props: {
        groupConfig: {
            type: Array,
            default() {
                return [];
            },
        },
        action: {
            type: String,
            default: 'create',
        },
        formulaUpdate: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    watch: {},
    data() {
        return {
            isShowMoreInforFormulaUpdate: false,
            isShowMoreInforFormulaValue: false,
        };
    },
    methods: {
        removeColumn(index) {
            this.groupConfig.splice(index, 1);
        },
        addColumn() {
            let colId = Date.now();
            let formula = {
                id: colId,
                nameGroup: {
                    name: {
                        placeholder: this.$t('scheduler.group_config.name'),
                        type: 'text',
                        value: '',
                        minWidth: '208px',
                        hideTitle: true
                    },
                },
                formulaValue: {},
            };
            formula.formulaValue[colId] = {
                marginTop: '4px',
                title: this.$t('scheduler.group_config.script'),
                type: 'script',
                value: '',
                info: '',
            };
            this.groupConfig.push(formula);
        },
        showMoreInforFormulaUpdate() {
            this.isShowMoreInforFormulaUpdate = true;
        },
        showInstrucFormulaValue() {
            this.isShowMoreInforFormulaValue = true;
        },
    },
};
</script>

<style scoped>
.board-group {
    width: 249px;
    min-width: 249px !important;
}
.group {
    font-weight: 400;
    padding: 8px 8px 0px 8px;
    border-radius: 4px;
    background: var(--symper-background-active);
}

.general-cofig {
    background: #f2f2f2;
    border-radius: 4px;
}

.scheduler-group-config {
    max-width: 764px;
    overflow-x: scroll;
    overflow-y: hidden;
}
.scheduler-group-config::-webkit-scrollbar-track {
    background: none !important;
}
.scheduler-group-config::-webkit-scrollbar-thumb {
    background: var(--symper-background-active);
}
</style>
