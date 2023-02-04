<template>
    <div class="dpm-group mb-4" style="border: none !important">
        <v-expansion-panels
            v-for="(group, groupidx) in dataConfig"
            :key="groupidx"
            :name="groupidx"
            multiple
            flat
            class="fs-13 mb-0"
        >
            <v-expansion-panel class="sym-expand-panel">
                <v-expansion-panel-header
                    class="v-expand-header pa-3 mb-2 fs-13"
                    style="height: 35px !important; min-height: 35px !important"
                >
                    <div class="w-100">
                        <span class="float-left"
                            >{{ 'Group ' + (groupidx + 1) }}
                        </span>
                    </div>
                    <span
                        :class="{
                            mdi: true,
                            'mdi-close': true,
                            'close-btn': true,
                            disabled: disableBtn
                        }"
                        @click="delGroup(groupidx)"
                    ></span>
                </v-expansion-panel-header>

                <v-expansion-panel-content class="sym-v-expand-content mb-1">
                    <form-tpl
                        :allInputs="group"
                        :labelWidth="'109px'"
                        :titleSize="'medium'"
                        @input-value-changed="handleChangeConfig"
                    />
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>

        <v-btn @click="addGroup" class="w-100 add-btn" outlined small>
            {{$t('v2.doc.addGroup')}}
        </v-btn>
    </div>
</template>

<script>
import _cloneDeep from 'lodash/cloneDeep';
import { orgchartApi } from '@/api/orgchart.js';

export default {
    components: {
        'form-tpl': () => import('@/components/common/FormTpl.vue')
    },
    props: {
        dataConfig: {
            type: Array,
            default: function () {
                return [];
            }
        },
        conditionControls: {
            type: Array,
            default: function () {
                return [];
            }
        }
    },
    watch: {
        dataConfig: {
            deep: true,
            immediate: true,
            handler: function () {
                this.dataConfig[0].orgchart.options = this.optionOrgchart;
                if (!this.dataConfig[0].conditionControls) {
                    this.addConditionControl();
                }
            }
        },
        conditionControls: {
            deep: true,
            immediate: true,
            handler: function () {
                this.dataConfig.map((d, index) => {
                    {
                        this.dataConfig[index].conditionControls.options =
                            this.conditionControls;
                    }
                });
            }
        }
    },
    computed: {
        disableBtn() {
            return this.dataConfig.length == 1 ? true : false;
        }
    },
    data() {
        return {
            optionOrgchart: []
        };
    },
    created() {
        this.getListOrgchart();
        let option = this.optionOrgchart;
        this.dataConfig.forEach(function (e) {
            e.orgchart.options = option;
        });
    },
    methods: {
        async getListOrgchart() {
            let res = await orgchartApi.getAllOrgChart();
            let data = res.data.listObject;
            for (let key in data) {
                this.optionOrgchart.push({
                    text: data[key].name,
                    value: data[key].id
                });
            }
        },
        addConditionControl() {
            this.dataConfig[0].conditionControls = {
                title: this.$t('v2.doc.conditionControl'),
                type: 'autocomplete',
                value: [],
                options: this.conditionControls,
                deleteable: true,
                isSelectionChip: true,
                showId: false
            };
        },
        addGroup() {
            let newGroup = {
                orgchart: {
                    title: this.$t('v2.doc.orgchart'),
                    type: 'select',
                    value: '',
                    placeholder: this.$t('v2.doc.selectOrgchart'),
                    options: this.optionOrgchart
                },
                level: {
                    title: this.$t('v2.doc.availableLevel'),
                    type: 'select',
                    value: '',
                    placeholder: this.$t('v2.doc.selectLevel'),
                    options: [
                        {
                            text: this.$t('v2.doc.department'),
                            value: 'department'
                        },
                        {
                            text: this.$t('v2.doc.position'),
                            value: 'position'
                        },
                        {
                            text: 'User',
                            value: 'user'
                        }
                    ]
                },
                formula: {
                    id: 0,
                    title: this.$t('v2.doc.activeFormula'),
                    type: 'script',
                    value: '',
                    instance: Date.now()
                },
                selectMultiple: {
                    title: this.$t('v2.doc.chooseMultipleOptions'),
                    type: 'checkbox',
                    value: false
                },
                conditionControls: {
                    title: this.$t('v2.doc.conditionControl'),
                    type: 'autocomplete',
                    value: [],
                    options: this.conditionControls,
                    deleteable: true,
                    isSelectionChip: true,
                    showId: false
                }
            };
            this.dataConfig.push(newGroup);
            this.$emit('input-value-changed', this.dataConfig);
        },
        delGroup(groupidx) {
            if (this.dataConfig.length > 1) {
                this.dataConfig.splice(groupidx, 1);
            }
            this.$emit('input-value-changed', this.dataConfig);
        },
        handleChangeConfig() {
            this.$emit('input-value-changed', this.dataConfig);
        }
    }
};
</script>

<style scope>
.dpm-group .v-expand-header {
    width: 100%;
    background: #f2f2f2;
    border-radius: 6px;
}
.dpm-group .v-text-field.v-text-field--enclosed {
    margin-top: 8px !important;
    margin-bottom: 8px !important;
}
.dpm-group .sym-style-input:not(.v-input--checkbox) .v-input__slot {
    background-color: #fff !important;
}
.dpm-group
    .theme--light.v-expansion-panels
    .v-expansion-panel-header
    .v-expansion-panel-header__icon
    .v-icon {
    color: #000000 !important;
    margin-right: 16px;
}
.dpm-group .v-list .v-list-item {
    font-size: 12px;
}
.dpm-group .add-btn {
    background-color: var(--symper-color) !important;
    border: none !important;
}
.dpm-group .add-btn .v-btn__content {
    color: #fff !important;
}
.dpm-group .add-btn:hover {
    background-color: var(--symper-color) !important;
    opacity: 0.85;
}
.dpm-group .close-btn {
    position: absolute;
    right: 10px !important;
}
.dpm-group .close-btn:hover {
    background-color: unset !important;
}
.disabled {
    display: none;
}
.dpm-group .sym-small-size.v-input--checkbox .v-label {
    font-size: 13px !important;
}
.dpm-group .v-input__slot {
    background-color: unset !important;
}
</style>