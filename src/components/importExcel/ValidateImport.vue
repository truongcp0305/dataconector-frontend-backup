<template>
    <div>
        <v-list-item style="min-height: 25px; margin-top: -5px" class="pb-1">
            <v-list-item-content class="py-0">
                <v-list-item-title>
                    <span>
                        <i class="mdi mdi-check fs-16 mr-1"></i>
                        <span class="font-normal">{{$t('v2.importExport.importProcess')}}</span>
                    </span>
                    <button @click="cancel()" class="mr-0" style="float: right">
                        <i class="mdi mdi-close fs-16 mr-2"></i>
                    </button>
                </v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <v-divider width="271" class="ml-4"></v-divider>
        <!-- trước xử lý -->
        <v-list
            v-if="processing.preprocessing.isDone == false"
            class="ml-6 fs-13"
        >
            <v-row class="mb-2 ml-1 color-grey"
                >{{$t('v2.importExport.preProcess')}}<span class="fw-400 ml-1">
                    {{
                        processing.preprocessing.processed
                            ? processing.preprocessing.processed
                            : 0
                    }}</span
                ></v-row
            >
            <div class="loader"></div>
        </v-list>
        <v-list>
            <v-btn small color="primary" class="mt-4 ml-7" @click="stopImport()"
                >{{$t('v2.importExport.stop')}}</v-btn
            >
        </v-list>
        <!-- kiểm tra dữ liêu -->
        <v-list
            dense
            class="mr-8 fs-13"
            v-if="
                processing.preprocessing.isDone == true &&
                processing.importing.processed == 0
            "
        >
            <v-row class="mb-1 ml-5 color-normal"
                >{{$t('v2.importExport.preProcess')}}
                <span style="color: green; font-size: 16px; margin-top: -3px">
                    <i class="mdi mdi-check ml-4"></i>
                </span>
            </v-row>
            <v-row class="ml-5 color-normal" style="margin-bottom: -10px"
                >{{$t('v2.importExport.checkData')}}
                <span
                    v-if="processing.validating.errors == null"
                    style="color: green; font-size: 16px; margin-top: -3px"
                >
                    <i class="mdi mdi-check ml-4"></i>
                </span>
                <span v-else class="fw-400"
                    >:
                    {{
                        processing.validating.processed
                            ? Math.round(
                                  (processing.validating.processed /
                                      processing.validating.total) *
                                      100,
                              )
                            : 0
                    }}%
                </span>
            </v-row>
            <div v-if="processing.validating.errors != null">
                <v-row
                    v-for="(errorControl, errorControlIdx) in processing
                        .validating.errors"
                    :key="errorControlIdx"
                    class="ml-5"
                >
                    <v-row class="w-100 mt-3 color-grey ml-0"
                        >{{$t('v2.importExport.errSheet')}}
                        <span
                            style="
                                margin-left: 5px;
                                color: red;
                                font-weight: 430;
                            "
                        >
                            {{ errorControl.sheet }}</span
                        >
                    </v-row>
                    <v-row
                        class="d-flex ml-0 mt-2"
                        style="margin-bottom: -18px"
                    >
                        <span style="" class="color-grey fs-13"
                            >{{$t('v2.importExport.wrongDocField')}}
                            <span
                                style="
                                    margin-left: 5px;
                                    color: red;
                                    font-weight: 400;
                                "
                            >
                                {{ errorControl.controlName }}
                            </span>
                        </span>
                    </v-row>
                    <v-row style="width: 100%" class="mt-6 color-grey ml-0"
                        >{{$t('v2.importExport.wrongColumnInExcel')}}
                        <span
                            style="
                                margin-left: 5px;
                                color: red;
                                font-weight: 400;
                            "
                        >
                            {{ errorControl.columnName }}</span
                        >
                    </v-row>
                    <div
                        class="mt-2"
                        v-for="(error, errorIdx) in errorControl.errors"
                        :key="errorIdx"
                    >
                        <!-- xử lý trường hợp không đúng định dạng dữ liệu -->
                        <div v-if="error.type == 'invalidDataType'">
                            <span class="font">
                                <b class="color-grey fw-500">
                                    {{$t('v2.importExport.theDataTypeIsNotCorrectForTheDestinationDocument')}}</b
                                >
                            </span>
                            <v-row
                                class="ml-0 mt-1 mr-3 color-grey fs-12 fw-300"
                            >
                                <span
                                    style="
                                        float: left;
                                        width: 110px;
                                        display: block;
                                    "
                                    class="color-grey fs-12"
                                    >{{$t('v2.importExport.wrongDataType')}}
                                </span>
                                <div
                                    style="
                                        float: right;
                                        width: 140px;
                                        padding-left: 1px;
                                    "
                                >
                                {{$t('v2.importExport.rightFormat')}} {{ errorControl.dataType }}
                                </div>
                            </v-row>
                            <v-row
                                style="background-color: #f5f5f5; height: 30px"
                                class="ml-0 mt-2"
                            >
                                <v-col class="col-md-4"> {{$t('v2.importExport.wrongRow')}} </v-col>
                                <v-col class="col-md-8">
                                    {{$t('v2.importExport.valueIsWrong')}}
                                </v-col>
                            </v-row>
                            <v-row
                                v-for="(errorInfo, i) in error.info"
                                :key="i"
                                class="ml-0"
                                style="background-color: #f5f5f5"
                            >
                                <v-col class="col-md-4" v-if="i < 10">
                                    {{ errorInfo.row }}
                                </v-col>
                                <v-col class="col-md-8" v-if="i < 10">
                                    {{ errorInfo.value }}
                                </v-col>
                            </v-row>
                            <v-row
                                v-if="error.info.length > 10"
                                class="ml-0"
                                style="background-color: #f5f5f5"
                            >
                                <v-col class="col-md-4"> ... </v-col>
                                <v-col class="col-md-8"> ... </v-col>
                            </v-row>
                        </div>
                        <!-- xử lý dữ liệu null -->
                        <div v-if="error.type == 'notBlank'">
                            <span class="font">
                                <b class="color-grey fw-500">
                                    {{$t('v2.importExport.dataMustNotNull')}}</b
                                >
                            </span>
                            <v-row class="ml-0 mr-3 color-grey fs-12 fw-300">
                                <span
                                    style="
                                        float: left;
                                        width: 110px;
                                        display: block;
                                    "
                                    class="color-grey fs-12"
                                ></span>
                                <div
                                    style="
                                        float: right;
                                        width: 140px;
                                        padding-left: 1px;
                                    "
                                ></div>
                            </v-row>
                            <v-row
                                style="background-color: #f5f5f5; height: 30px"
                                class="ml-0 mt-1"
                            >
                                <v-col class="color-normal"> {{$t('v2.importExport.row')}} </v-col>
                                <v-col class="color-normal"> {{$t('v2.importExport.value')}}</v-col>
                            </v-row>
                            <v-row
                                v-for="(errorInfo, i) in error.info"
                                :key="i"
                                class="ml-0"
                                style="
                                    background-color: #f5f5f5;
                                    margin-top: -5px;
                                    margin-bottom: -15px;
                                "
                            >
                                <v-col class="color-normal">
                                    {{ errorInfo.row }}
                                </v-col>
                                <v-col class="color-normal"> {{$t('v2.importExport.null')}} </v-col>
                            </v-row>
                        </div>
                    </div>
                    <!-- xử lý dữ liệu null -->
                </v-row>
            </div>
        </v-list>
        <!-- importing -->
        <v-list
            v-if="
                processing.preprocessing.isDone &&
                processing.validating.errors.length == 0 &&
                processing.importing.processed > 1
            "
            class="ml-6 fs-13"
        >
            <v-row class="mb-1 ml-1 color-normal"
                >{{$t('v2.importExport.preProcess')}}
                <span style="color: green; margin-top: -3px" class="fs-16">
                    <i class="justify-end mdi mdi-check ml-4"></i>
                </span>
            </v-row>
            <v-row class="ml-1 color-normal"
                >{{$t('v2.importExport.checkData')}}
                <span style="color: green; margin-top: -3px" class="fs-16">
                    <i class="mdi mdi-check ml-4"></i>
                </span>
            </v-row>
            <v-row class="ml-1 color-normal mb-4 mt-1"
                >{{$t('v2.importExport.inputData')}}
                <span
                    v-if="
                        processing.importing.processed /
                            processing.importing.total ==
                        1
                    "
                    style="color: green; margin-top: -3px"
                    class="fs-16"
                >
                    <i class="mdi mdi-check ml-4"></i>
                </span>
            </v-row>
            <v-row
                class="mr-6 ml-1"
                v-if="
                    processing.importing.processed /
                        processing.importing.total <
                    1
                "
            >
                <div
                    style="
                        height: 5px;
                        margin-top: -5px;
                        background-color: #dcdcdc;
                    "
                    class="w-100"
                ></div>
                <div
                    :style="{
                        width:
                            (processing.importing.processed /
                                processing.importing.total) *
                                100 +
                            '%',
                    }"
                    style="
                        height: 5px;
                        margin-top: -5px;
                        background-color: orange;
                    "
                ></div>
            </v-row>
            <v-row
                v-if="
                    processing.importing.processed /
                        processing.importing.total <
                    1
                "
                class="fw-500 color-normal mb-4 mt-1 fw-300 fs-12 d-flex justify-md-end mr-7 mt-2"
            >
                {{
                    getPercentage(
                        processing.importing.processed,
                        processing.importing.total,
                    )
                }}
                % ({{ processing.importing.processed }}/{{
                    processing.importing.total
                }})
            </v-row>
        </v-list>
        <!-- showErrorUser -->
        <v-list
            v-if="
                processing.preprocessing.isDone &&
                processing.validating.errors.length == 0 &&
                processing.importing.processed > 1 &&
                processing.dataUserError.length > 0
            "
            class="ml-6 fs-13"
        >
        {{$t('v2.importExport.listImportFail')}}
            <v-row class="ml-0" v-if="existEmail.length > 0">
                {{$t('v2.importExport.emailDuplicateErr')}}</v-row
            >
            <v-row
                v-if="existEmail.length > 0"
                style="background-color: #f5f5f5; height: 30px"
                class="ml-0 mr-5"
            >
                <v-col class="col-md-6"> {{$t('v2.importExport.accountName')}} </v-col>
                <v-col class="col-md-6"> {{$t('v2.importExport.email')}}</v-col>
            </v-row>
            <div
                v-if="existEmail.length > 0"
                class="ml-0 mr-4"
                v-for="(error, errorIdxUser) in existEmail"
                :key="errorIdxUser"
            >
                <!-- xử lý trường hợp không đúng định dạng dữ liệu -->
                <div>
                    <v-row class="ml-0 mr-1" style="background-color: #f5f5f5">
                        <v-col class="col-md-6" v-if="errorIdxUser < 10">
                            {{
                                processing.dataUserError[errorIdxUser]
                                    .displayName
                            }}
                        </v-col>
                        <v-col class="col-md-6" v-if="errorIdxUser < 10">
                            {{ processing.dataUserError[errorIdxUser].email }}
                        </v-col>
                    </v-row>
                    <v-row
                        v-if="processing.dataUserError.length > 10"
                        class="ml-0 mr-4"
                        style="background-color: #f5f5f5"
                    >
                        <v-col class="col-md-4"> ... </v-col>
                        <v-col class="col-md-8"> ... </v-col>
                    </v-row>
                </div>
            </div>
            <!-- invalid Email -->
            <v-row
                v-if="invalidEmail.length > 0"
                class="ml-0"
                style="color: red"
            >
            {{$t('v2.importExport.emailValidateErrMessage')}}</v-row
            >
            <v-row
                v-if="invalidEmail.length > 0"
                style="background-color: #f5f5f5; height: 30px"
                class="ml-0 mr-5"
            >
                <v-col class="col-md-12"> {{$t('v2.importExport.email')}} </v-col>
            </v-row>
            <div
                v-if="invalidEmail.length > 0"
                class="ml-0 mr-4"
                v-for="(error, errorIdxUser) in invalidEmail"
                :key="errorIdxUser"
            >
                <!-- xử lý trường hợp không đúng định dạng dữ liệu -->
                <div>
                    <v-row class="ml-0 mr-1" style="background-color: #f5f5f5">
                        <v-col class="col-md-12" v-if="errorIdxUser < 10">
                            {{ processing.dataUserError[errorIdxUser].email }}
                        </v-col>
                    </v-row>
                    <v-row
                        v-if="processing.dataUserError.length > 10"
                        class="ml-0 mr-4"
                        style="background-color: #f5f5f5"
                    >
                        <v-col class="col-md-4"> ... </v-col>
                        <v-col class="col-md-8"> ... </v-col>
                    </v-row>
                </div>
            </div>
            <!-- invalidPass -->
            <v-row
                v-if="invalidPass.length > 0"
                class="ml-0"
                style="color: red"
            >
            {{$t('v2.importExport.passErrValidateMessage')}}
            </v-row>
            <v-row
                v-if="invalidPass.length > 0"
                class="fs-12 ml-0 mr-3"
                style="color: grey"
                >{{$t('v2.importExport.passValidateMessage')}}
            </v-row>
            <v-row
                v-if="invalidPass.length > 0"
                style="background-color: #f5f5f5; height: 30px"
                class="ml-0 mr-5"
            >
                <v-col class="col-md-12"> {{$t('v2.importExport.password')}} </v-col>
            </v-row>
            <div
                v-if="invalidPass.length > 0"
                class="ml-0 mr-4"
                v-for="(error, errorIdxUser) in invalidPass"
                :key="errorIdxUser"
            >
                <!-- xử lý trường hợp không đúng định dạng dữ liệu -->
                <div>
                    <v-row class="ml-0 mr-1" style="background-color: #f5f5f5">
                        <v-col class="col-md-6" v-if="errorIdxUser < 10">
                            {{
                                processing.dataUserError[errorIdxUser].password
                            }}
                        </v-col>
                    </v-row>
                    <v-row
                        v-if="processing.dataUserError.length > 10"
                        class="ml-0 mr-4"
                        style="background-color: #f5f5f5"
                    >
                        <v-col class="col-md-4"> ... </v-col>
                        <v-col class="col-md-8"> ... </v-col>
                    </v-row>
                </div>
            </div>
        </v-list>
    </div>
</template>

<script>
import importApi from './../../api/ImportExcel';
export default {
    props: ['fileName', 'setInterval', 'importFile'],
    methods: {
        stopImport() {
            importApi
                .cancelImport(this.fileName)
                .then((res) => {
                    if (res.status === 200) {
                        this.$snotify({
                            type: 'success',
                            title: res.message,
                        });
                    }
                })
                .catch(console.error);
        },
        getPercentage(process, total) {
            let result = ((process / total).toFixed(4) * 1000) / 10;
            result = String(result);
            if (result.length > 4) {
                return result.substr(0, 4);
            }
            return result;
        },
        cancel() {
            //xoá data
            this.$store.commit('importExcel/setNewImport', true);
            this.$emit('deleteFileName');
            this.$emit('cancel');
        },
        getApiProcessingImport() {
            const self = this;
            importApi
                .getProcessing(this.fileName)
                .then((res) => {
                    if (res.status === 200) {
                        if (typeof res.data == 'object') {
                            self.processing = res.data;
                        }
                        if (!res.data) {
                            clearInterval(this.loopCheckProcess);
                            this.$snotify({
                                type: 'success',
                                title: this.$t('v2.importExport.importSuccess'),
                            });
                            this.cancel();
                        }
                    } else {
                        clearInterval(this.loopCheckProcess);
                        this.$snotify({
                            type: 'error',
                            title: res.message,
                        });
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        },
    },
    computed: {
        newImport() {
            return this.$store.state.importExcel.newImport;
        },
    },
    watch: {
        newImport(val) {
            if (val) {
                this.processing = {
                    preprocessing: {
                        processed: 0,
                        isDone: false,
                    },
                    validating: {
                        total: 200,
                        processed: 20,
                        errors: [],
                    },
                    importing: {
                        total: 0,
                        processed: 0,
                    },
                };

                clearInterval(this.loopCheckProcess);
            }
        },
        processing() {
            if (
                this.processing.importing.total / this.processing.processed ==
                    1 ||
                this.processing.validating.errors.length > 0
            ) {
                clearInterval(this.loopCheckProcess);
            }
            if (
                this.processing.importing.processed /
                    this.processing.importing.total ==
                1
            ) {
                if (this.objType == 'document') {
                    setTimeout(() => this.$emit('showNotification'), 1000);
                } else {
                    if (this.processing.dataUserError.length > 0) {
                        this.existEmail = this.processing.dataUserError.filter(
                            (x) => x.result == this.$t('v2.importExport.emailAlreadyExist'),
                        );
                        this.invalidEmail =
                            this.processing.dataUserError.filter(
                                (x) => x.result == this.$t('v2.importExport.emailInvalid'),
                            );
                        this.invalidPass = this.processing.dataUserError.filter(
                            (x) => x.result == this.$t('v2.importExport.passwordInvalid'),
                        );
                        setTimeout(() => this.$emit('showNotification'), 1000);
                        this.showErrorImportUser = !this.showErrorImportUser;
                    } else {
                        setTimeout(() => this.$emit('showNotification'), 1000);
                    }
                }

                clearInterval(this.loopCheckProcess);
            }
            if (
                this.processing.importing.processed /
                    this.processing.importing.total >
                1
            ) {
                this.$emit('error',this.$t('v2.importExport.processError'));
                clearInterval(this.loopCheckProcess);
            }
        },
        importFile() {
            if (this.importFile >= 0) {
                const self = this;
                if (this.setInterval) {
                    this.loopCheckProcess = setInterval(() => {
                        self.getApiProcessingImport();
                    }, 500);
                }
            }
        },
    },
    data() {
        return {
            showErrorImportUser: false,
            existEmail: [],
            invalidEmail: [],
            invalidPass: [],
            processing: {
                preprocessing: {
                    processed: 0,
                    isDone: false,
                },
                validating: {
                    total: 200,
                    processed: 20,
                    errors: [],
                },
                importing: {
                    total: 0,
                    processed: 0,
                },
            },
        };
    },
};
</script>

<style lang="scss" scoped>
.loader {
    border: 10px solid #f3f3f3;
    border-radius: 50%;
    border-top: 10px solid #3498db;
    width: 40px;
    height: 40px;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
}

.color-grey {
    color: grey;
}

.btn-null {
    width: 140px;
}

.btn-validate {
    height: 27px;
    border-radius: 2px !important;
}

.btn-row {
    width: 130px;
}
</style>
