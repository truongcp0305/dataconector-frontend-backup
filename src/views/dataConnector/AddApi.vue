<template>
    <div class="h-100 add-api">
        <div class="upper-body" style="height: 90%">
            <div class="d-flex">
                <div class="fw-430 ml-2 mt-1">{{ $t('v2.dataconnector.apiInformation') }}</div>

                <div class="save-btn lower-body mt-2 d-flex justify-end" v-show="tab != 'tab-import'">
                    <v-btn v-show="tab != 'tab-import'
                    && !this.disabled"
                    :class="{ disable: this.api.partnerValid == false || this.api.url == '' || this.api.name == '' }"
                     class="mr-2"
                     @click="save()" small depressed color="#b0e097">
                     <span style="color: white">{{ $t('common.save') }}</span>
                    </v-btn>
                    <v-btn v-show="
                    tab != 'tab-import' &&
                    !this.disabled &&
                    checkHasPermission('run')
                    "
                        :class="{ disable: this.api.partnerValid == false || this.api.url == '' || this.api.name == '' }"
                         class="mr-2" @click="extractApiData" small depressed color="rgba(251, 126, 0, 0.5)">
                        <span style="color: white">{{ $t('common.run-test') }}</span>
                    </v-btn>
                </div>
            </div>

            <v-row class="d-flex justify-start ml-2 mb-2 mt-6">
                <v-select :disabled="disabled" :menu-props="{
                    height: 400,
                    nudgeBottom: 35,
                    minWidth: 90,
                    maxWidth: 90,
                }" background="black" class="sym-select" :items="listType" append-icon="mdi-chevron-down"
                    v-model="api.method" hide-details dense>
                </v-select>
                <input v-if="disabled" disabled v-model="api.url" type="text" class="url px-2 mt-1" />
                <input v-else v-model="api.url" type="text" class="url px-2 mt-1" />
                <v-btn class="mx-2 mt-1" v-show="this.disabled" @click="extractApiData" small color="primary" depressed>
                    <i class="mdi fs-16 mdi-play-outline"></i>
                </v-btn>
            </v-row>
            <div class="add-api-tab mt-3 mx-2">
                <v-tabs v-model="tab" class="h-100">
                    <v-tab href="#tab-info" class="fs-13 v-tab">{{ $t('v2.dataconnector.information') }}</v-tab>
                    <v-tab href="#tab-params" class="fs-13 v-tab">{{ $t('v2.dataconnector.params') }}</v-tab>
                    <v-tab href="#tab-header" class="fs-13">{{ $t('v2.dataconnector.header') }}</v-tab>
                    <v-tab href="#tab-body" class="fs-13">{{ $t('v2.dataconnector.body') }}</v-tab>
                    <v-tab href="#tab-import" class="fs-13">{{ $t('v2.dataconnector.writeData') }}</v-tab>
                    <v-tab href="#tab-config" class="fs-13">{{ $t('v2.dataconnector.runPeriodically') }}</v-tab>
                    <v-tabs-items v-model="tab">
                        <v-tab-item :value="'tab-info'">
                            <info-api :disabled="disabled" ref="info" :value="infoApi" @change="changeInfo" />
                            <info-partner-api :disabled="disabled" ref="infoPartner" :value="infoPartnerApi"
                                @changeP="changePartnerInfor" @changePartner="changePartner" @changeValid="changePInputValid" />
                        </v-tab-item>
                        <v-tab-item :value="'tab-params'">
                            <params-api ref="params" :headers="api.params" :disabled="disabled" :typeAction="typeAction"
                                @change-header="changeParams" :dataRunApi="dataRunApi" @run-api="runApi" />
                        </v-tab-item>
                        <v-tab-item :value="'tab-header'">
                            <header-api ref="header" :headers="api.headers" :disabled="disabled"
                                :typeAction="typeAction" @change-header="changeHeader" :dataRunApi="dataRunApi"
                                @run-api="runApi" />
                        </v-tab-item>
                        <v-tab-item :value="'tab-body'">
                            <body-api ref="body" :disabled="disabled" :headers="api.body" :typeAction="typeAction"
                                @change-header="changeBody" :dataRunApi="dataRunApi" @run-api="runApi" />
                        </v-tab-item>
                        <v-tab-item :value="'tab-import'">
                            <import-api ref="import" @change-key="changeKey" @change-path="changePath"
                                @save-and-run="saveAndRun()" :oldDataImport="oldDataImport"
                                @change-type-api="changeTypeApi" @change-delete-conditions="
                                    changeDeleteConditions
                                " :disabled="disabled" @set-mapping="setMapping" @save="save()"
                                :dataRunApi="dataRunApi" :listDoc="listDoc" />
                        </v-tab-item>
                        <v-tab-item :value="'tab-config'">
                            <repeat-api ref="config" :oldData="api.cronjobConfig" :disabled="disabled"
                                @change-crontab="changeCrobTab" />
                        </v-tab-item>
                    </v-tabs-items>
                </v-tabs>
                <div class="result" style="height: 300px">
                    <DataReturn v-if="
                        tab == 'tab-body' ||
                        tab == 'tab-header' ||
                        tab == 'tab-params'
                    " ref="dataReturn" :duration="duration" :data="dataRunApiSmall" :disabled="isDisabled" />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import dataConnectorApi from '@/api/dataConnector';
import { getDurationTime } from './../../components/dataConnector/formatObject';
import { actionHelper } from '@/action/actionHelper';
import InfoApi from './InfoApi.vue';
import HeaderApi from './HeaderApi.vue';
import ParamsApi from './HeaderApi.vue';
import DataReturn from './../../components/dataConnector/dataReturn.vue';
import BodyApi from './HeaderApi.vue';
import ImportApi from './ImportApi.vue';
import RepeatRunApi from './RepeatRunApi.vue';
import InforPartnerApi from './InforPartnerApi.vue';
export default {
    watch: {},
    computed: {
        infoApi() {
            return {
                name: this.api.name,
                note: this.api.note,
            };
        },
        infoPartnerApi() {
            return {
                partner: this.api.partner,
                typeAction: this.typeAction,
            }
        },
    },
    props: {
        dataRunApi: {
            type: Object,
            default() {
                return {};
            },
        },
        listDoc: {
            type: Array,
            default() {
                return [];
            },
        },
        disabled: {
            type: Boolean,
            default() {
                return false;
            },
        },
        typeAction: {
            type: String,
            default() {
                return '';
            },
        },
    },
    methods: {
        checkHasPermission(action) {
            let objectType = 'data_connector';
            return actionHelper.checkHasPermission(objectType, action);
        },

        showButton() {
            valid = this.api.partnerValid;
            if (this.api.partnerSelected=='Misa') {
                if (valid == true) {
                    return valid;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        },
        
        extractApiData() {
            let tabToOpen = 'header';
            let names = ['body', 'header', 'params'];
            let self = this;
            for (let n of names) {
                let ref = self.$refs[n];
                if (ref) {
                    tabToOpen = n;
                    break;
                }
            }
            this.tab = 'tab-' + tabToOpen;
            setTimeout(() => {
                this.isDisabled = false;
                this.timeStart = Date.now();
                this.runApi();
            }, 100);
        },
        changeKey(data) {
            this.api.updateByKey = data.updateByKey;
        },
        changeDeleteConditions(data) {
            this.api.deleteConditions = data.deleteConditions;
        },
        changePath(data) {
            this.api.pathToData = data.pathToData;
            this.api.pathToTotal = data.pathToTotal;
        },
        changeInfo(value) {
            this.api.name = value.name;
            this.api.note = value.note;
        },
        changePartnerInfor(value) {
            this.api.partner = value;
        },
        changePartner(value) {
            this.api.partnerSelected = value;
        },
        changePInputValid(value){
            this.api.partnerValid = value;
        },
        setMapping(data) {
            if (JSON.stringify(data.mappings) != '{}') {
                data.mappings.data = this.spliceData(this.dataRunApi).data;
            }
            this.api.mappings = JSON.stringify(data.mappings);
            this.api.updateColumnInfo = data.updateColumnInfo;
            this.api.updateByKey = data.updateByKey;
        },
        refreshData() {
            this.tab = 0;
            this.api = {
                url: '',
                headers: '',
                method: 'GET',
                name: '',
                note: '',
                partnerId: 1,
                partner: '',
                partnerSelected: 'khac',
                partnerValid: true,
                params: '',
                updateColumnInfo: '',
                type: 0,
                pathToData: 'items',
                pathToTotal: 'totalRecords',
                mappings: '{}',
                env: SYMPER_ENV.environment,
                cronjobConfig: '{}',
                uuid: '',
            };
            this.dataRunApiSmall = {};
            if (this.$refs.body) this.$refs.body.refreshData();
            if (this.$refs.header) this.$refs.header.refreshData();
            if (this.$refs.import) this.$refs.import.refreshData();
            if (this.$refs.config) this.$refs.config.refreshData();
            if (this.$refs.info) this.$refs.info.refreshData();
            if (this.$refs.info) this.$refs.infoPartner.refreshData();
            if (this.$refs.params) this.$refs.params.refreshData();
            if (this.$refs.dataReturn) this.$refs.dataReturn.refreshData();
        },
        save() {
            if (this.$refs.infoPartner) this.$refs.infoPartner.sendInputs();
            if (this.api.partnerSelected == 'Misa') {
                this.api.partnerId = 2;
                this.api.partner.namePartner = 'Misa';
            } else if (this.api.partnerSelected == 'Bravo') {
                this.api.partnerId = 3;
                this.api.partner.namePartner = 'Bravo';
            } else {
                this.api.partnerId = 1;
                this.api.partner.namePartner = 'Khác';
            };
            this.api.partner = JSON.stringify(this.api.partner);
            if (this.typeAction == 'add') {
                this.$emit('save-api', this.api);
            } else {
                this.$emit('update-api', this.api);
            }
        },
        saveAndRun() {
            this.$emit('save-and-run');
            this.save();
        },
        changeTypeApi(type) {
            this.api.type = type;
        },
        setUpdateData(data) {
            this.tab = 0;
            this.dataRunApiSmall =
                data.mappings != '{}' ? JSON.parse(data.mappings) : '{}';
            if (this.dataRunApiSmall != '{}') {
                this.dataRunApiSmall = this.spliceData(
                    JSON.parse(data.mappings),
                ).data;
                this.dataRunApi = this.dataRunApiSmall;
            }
            this.api.url = data.url;
            this.api.uuid = data.uuid;
            this.infoApi.name = data.name;
            this.infoApi.note = data.note;
            data.partner == '' ? this.api.partner = {}
                : this.api.partner = JSON.parse(data.partner);
            this.api.partnerId = data.partner_id;
            this.api.mappings = data.mappings;
            this.api.name = data.name;
            this.api.note = data.note;
            this.api.pathToData = data.path_to_data;
            this.api.pathToTotal = data.path_to_total;
            this.api.method = data.method.toUpperCase();
            this.api.type = data.type;
            this.api.updateColumnInfo = data.update_column_info;
            this.setHeader(data.headers);
            this.$set(this.api, 'body', data.body);
            this.$set(this.api, 'params', data.params);
            this.oldDataImport.mappings = data.mappings;
            this.oldDataImport.pathToData = data.path_to_data;
            this.oldDataImport.pathToTotal = data.path_to_total;
            this.oldDataImport.dataExtract = data.dataExtract;
            this.oldDataImport.type = data.type;
            this.oldDataImport.updateByKey = data.update_by_key;
            this.oldDataImport.deleteConditions = data.delete_conditions;
            this.oldDataImport.updateColumnInfo = data.update_column_info;
            if (this.$refs.import)
                this.$refs.import.setData(this.oldDataImport);
            if (this.$refs.params) this.$refs.params.setData(data.params);
            if (this.$refs.header) this.$refs.header.setData(this.api.headers);
            if (this.$refs.body) this.$refs.body.setData(data.body);
            if (this.$refs.info) this.$refs.info.setData(this.infoApi);
            if (this.$refs.infoPartner) this.$refs.infoPartner.setData(this.infoPartnerApi);
            if (this.$refs.infoPartner) this.$refs.infoPartner.changeInputValid();
            this.api.cronjobConfig = data.cronjob_config;
            if (this.$refs.config)
                this.$refs.config.setData(data.cronjob_config);
        },
        setHeader(headers) {
            if (this.api.partnerSelected == 'Misa') {
                var newHeader = {}
                if(headers && headers!=''){
                    newHeader = JSON.parse(headers);
                }
                newHeader.Authorization = {
                    value: "Misa token",
                    formula : ''
                };
                this.$set(this.api, 'headers', JSON.stringify(newHeader));
            } else {                
                this.$set(this.api, 'headers', headers);
            }
        },
        changeNameApi(data) {
            this.api.name = data;
        },
        changeNoteApi(data) {
            this.api.note = data;
        },
        changeHeader(author) {
            this.api.headers = author;
        },
        changeParams(data) {
            this.api.params = data;
        },
        changeBody(body) {
            this.api.body = body;
        },
        spliceData(data) {
            if (data.data && data.data.data) {
                if (data.data.data.length > 8) {
                    data.data.data = data.data.data.slice(0, 7);
                }
                if (data.data.data.length > 0) {
                    data.data.data.map((d, index) => {
                        let keyApiObj = Object.keys(d);
                        keyApiObj.map((key) => {
                            if (Array.isArray(d[key]) && d[key].length > 2) {
                                data.data.data[index][key] = data.data.data[
                                    index
                                ][key].slice(0, 2);
                            }
                        });
                    });
                }
            }
            return data;
        },
        runApi() {
            this.$refs.dataReturn.setLoading();
            if (this.$refs.infoPartner) this.$refs.infoPartner.sendInputs();
            this.api.partner = JSON.stringify(this.api.partner)
            dataConnectorApi.runApi(this.api).then((res) => {
                if (res.status == 200) {
                    this.dataRunApiSmall = this.spliceData(res);
                    this.duration = getDurationTime(this.timeStart, Date.now());
                    this.dataRunApi = this.dataRunApiSmall;
                } else {
                    this.dataRunApiSmall = {};
                    this.$snotifyError(data.message, this.$t('v2.dataconnector.errorApiNotExis'));
                }
            });
            //   this.$emit('run-api', this.api);
        },
        changeCrobTab(data) {
            if (data != '{}') {
                this.api.cronjobConfig = JSON.stringify({ cronjob: data });
            } else {
                this.api.cronjobConfig = '{}';
            }
        },
    },
    data() {
        return {
            tab: null,
            isLoading: false,
            timeStart: 0,
            duration: 0,
            oldDataImport: {
                mappings: '',
                dataExtract: '',
                type: 0,
            },
            dataRunApiSmall: '',
            isDisabled: false,
            listType: [
                'GET',
                'POST',
                'PUT',
                'PATCH',
                'DELETE',
                'COPY',
                'HEAD',
                'OPTIONS',
                'LINK',
                'UNLINK',
                'PURGE',
                'LOCK',
                'UNLOCK',
                'PROFIND',
                'VIEW',
            ],
            type: 'GET',
            url: '',
            api: {
                url: '',
                params: '',
                body: '',
                headers: '',
                method: 'GET',
                name: '',
                note: '',
                partnerId: 1,
                partnerSelected: 'Khác',
                partner: '',
                partnerValid: true,
                updateColumnInfo: '',
                type: 0,
                pathToTotal: 'totalRecords',
                pathToData: 'items',
                mappings: '{}',
                env: SYMPER_ENV.environment,
                cronjobConfig: '{}',
                insertByKey: '',
                updateByKey: '',
                deleteConditions: '',
            },
        };
    },
    components: {
        'info-api': InfoApi,
        'header-api': HeaderApi,
        'body-api': BodyApi,
        'import-api': ImportApi,
        'params-api': ParamsApi,
        'repeat-api': RepeatRunApi,
        'info-partner-api': InforPartnerApi,
        DataReturn,
    },
};
</script>
<style scoped>
.sym-select {
    height: 30px !important;
    max-width: 90px;
    min-width: 90px;
}
.sym-select>>>.v-select__slot {
    background: #fbfbfb !important;
    height: 30px !important;
    padding-left: 5px;
    font-size: 11px;
    border-radius: 4px 0 0 4px;
    border: 1px solid #efefef;
}

.url {
    height: 30px !important;
    background: #fbfbfb;
    border: 1px solid #efefef;
    border-left: 1px solid lightgrey;
    border-radius: 0 4px 4px 0;
    width: 440px;
    font-size: 11px;
}

.url:focus {
    outline: none;
}

.sym-select>>>.v-input__slot:before,
.sym-select>>>.v-input__slot:after {
    border: none !important;
}

.mdi-chevron-down {
    background: red;
}

.v-tab--active {
    color: orange !important;
    border: none !important;
}

.v-tabs>>>.v-tabs-slider {
    background: orange !important;
}

.v-tabs-slider-wrapper {
    color: orange !important;
}

.v-tab {
    text-transform: none !important;
    font-family: Roboto;
    border: none !important;
}

.v-tabs-slider {
    color: orange !important;
}

.v-tabs>>>.v-slide-group {
    height: 30px !important;
}

.add-api-tab {
    height: 300px;
}
</style>
<style>
.v-list-item__title {
    font-size: 11px !important;
}

.lower-body {
    margin-left: 310px;
}
.disable{
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}
</style>
