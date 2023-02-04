<template>
    <div>
        <div class="fs-13 fw-430 mt-2">{{$t('v2.dataconnector.declareToPeriodicallyRunTheAPI')}}</div>
        <div>
            <v-radio-group v-model="isRepeat" column>
                <v-radio
                    :label="$t('v2.dataconnector.manualRun')"
                    value="true"
                    :disabled="disabled"
                ></v-radio>
                <v-radio
                    :disabled="disabled"
                    :label="$t('v2.dataconnector.runPeriodically')"
                    value="false"
                ></v-radio>
            </v-radio-group>
        </div>
        <div v-if="isRepeat == 'false'">
            <ConfigRepeat
                style="height: 320px"
                ref="configRepeat"
                @value="crontab"
                :cronTab="cronjob"
                :disabled="disabled"
            />
            <span class="fs-12" style="color: grey">
                {{$t('v2.dataconnector.choseOrInputValueToCronJob')}}
            </span>
            <v-row>
                <v-col class="col-md-10">
                    <FormTpl
                        class="mr-2 mt-4"
                        :inputMinwidth="'200px'"
                        :labelWidth="'130px'"
                        :allInputs="allInputs"
                        :titleSize="'normal'"
                        :single-line="true"
                    />
                </v-col>
                <v-col class="col-md-2">
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn
                                depressed
                                @click="viewCronjob"
                                v-on="on"
                                x-small
                                height="28"
                                style="margin-top: 17px; margin-left: -20px"
                            >
                                <v-icon>mdi mdi-check</v-icon>
                            </v-btn>
                        </template>
                        <span>{{$t('v2.dataconnector.checkConfiguration')}}</span>
                    </v-tooltip>
                </v-col>
            </v-row>
        </div>
    </div>
</template>
<script>
import FormTpl from './../../components/common/FormTpl';
import ConfigRepeat from './../../components/common/CronjobFiveParams.vue';

export default {
    watch: {
        isRepeat() {
            if (this.isRepeat == 'true') {
                this.allInputs.cronjob.value = this.cronjob;
                this.$emit('change-crontab', '{}');
            }
        },
        'allInputs.cronjob.value': function (data) {
            if (data) {
                this.$emit('change-crontab', data);
            }
        },
    },
    props: {
        disabled: {
            type: Boolean,
            default() {
                return false;
            },
        },
        oldData: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            isRepeat: 'true',
            cronjob: '',
            allInputs: {
                cronjob: {
                    disabled: this.disabled,
                    info: '',
                    title: this.$t('v2.dataconnector.cronjobValue'),
                    type: 'text',
                    value: '',
                    info: '',
                },
            },
        };
    },
    components: {
        ConfigRepeat,
        FormTpl,
    },
    methods: {
        viewCronjob() {
            this.$refs.configRepeat.refreshData();
            this.cronjob = this.allInputs.cronjob.value;
        },
        refreshData() {
            this.isRepeat = 'true';
            this.allInputs.cronjob.value = '';
            this.cronjob = '';
        },
        crontab(crobTab) {
            if (crobTab && crobTab.join(' ') != '* * * * *') {
                this.allInputs.cronjob.value = crobTab.join(' ');
                this.$emit('change-crontab', crobTab.join(' '));
            } else {
                this.allInputs.cronjob.value = this.cronjob;
            }
        },
        setData(data) {
            if (data && data != '{}' && data != 'undefined') {
                this.isRepeat = 'false';
                this.cronjob = JSON.parse(data).cronjob;
                this.allInputs.cronjob.value = this.cronjob;
            }
        },
    },
    created() {
        this.setData(this.oldData);
    },
};
</script>
