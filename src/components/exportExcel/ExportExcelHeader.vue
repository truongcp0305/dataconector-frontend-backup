<template>
    <div>
        <v-menu
            v-model="isShowListFileExport"
            persistent
            max-width="300"
            max-height="300"
            :nudge-width="570"
            offset-y
            left
            style="z-index: 1000"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-on="on" v-bind="attrs">
                    <v-progress-circular
                        :value="progressAvg"
                        size="20"
                        rotate="-90"
                        color="#F98E00"
                        width="2"
                    >
                        <v-icon size="12">mdi-download</v-icon>
                    </v-progress-circular>
                </v-btn>
            </template>
            <v-card
                v-if="Object.keys(listFileExport).length != 0"
                class="pa-3 pb-0 pt-4"
            >
                <v-card-text
                    class="pa-0 pb-5 selected-file-export"
                    v-for="file in listFileExport"
                    :key="file.uuid"
                    style="line-height: 0.5rem"
                >
                    <span
                        class="float-left black--text"
                        style="font-size: 11px; font-weight: normal"
                        >{{ file.fileName }}.xlsx</span
                    >
                    <span
                        class="float-right black--text hide-process-export"
                        ref="progress"
                        :id="file.uuid"
                        style="font-size: 11px; font-weight: normal"
                        v-if="file.isError == false"
                        >{{ file.progress + '%' }}</span
                    >
                    <span
                        class="float-right red--text hide-process-export"
                        v-if="file.isError == true"
                        style="font-size: 11px; font-weight: normal"
                        >{{ $t('common.error') }}</span
                    >
                    <br />
                    <div class="d-flex align-center" style="height: 20px">
                        <v-progress-linear
                            :value="file.progress"
                            :color="file.isError == true ? 'red' : '#F98E00'"
                            background-color="rgba(0, 0, 0, 0.2)"
                        ></v-progress-linear>
                        <v-btn
                            color="red"
                            text
                            @click="cancelExport(file.uuid)"
                            class="pa-1 cancel-export"
                            style="
                                font-size: 11px;
                                height: 20px;
                                min-width: 35px;
                                margin-left: 5px;
                            "
                        >
                            {{ $t('common.cancel') }}
                        </v-btn>
                    </div>
                    <span
                        class="orange--text"
                        style="font-size: 13px; font-weight: normal"
                        >{{ file.message }}</span
                    >
                </v-card-text>
            </v-card>
        </v-menu>
        <v-dialog
            persistent
            v-model="isConfirmCancelExport"
            max-width="320"
            overlay-color="white"
            overlay-opacity="0"
        >
            <v-card>
                <v-card-title class="pa-3" style="height: 45px">
                    <span class="black--text" style="font-size: 15px">{{
                        $t('common.confirm')
                    }}</span>
                </v-card-title>
                <v-card-text class="pa-3 pt-0" style="height: 26px">
                    <span
                        class="black--text"
                        style="font-size: 13px; font-weight: normal"
                        >{{ $t('export.confirm_cancel-export') }}</span
                    >
                </v-card-text>
                <v-card-actions class="pt-0 pa-3">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="black"
                        text
                        @click="handleDisagreeCancelExport"
                        style="font-size: 13px; height: 22px; min-width: 35px"
                    >
                        {{ $t('common.exit') }}
                    </v-btn>
                    <v-btn
                        color="red"
                        text
                        @click="handleAgreeCancelExport"
                        style="font-size: 13px; height: 22px; min-width: 35px"
                    >
                        {{ $t('common.cancel') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import exportApi from '@/api/dataIO';
import { util } from '@/plugins/util';
import { appConfigs } from '@/configs.js';
export default {
    data() {
        return {
            isShowListFileExport: false,
            isConfirmCancelExport: false,
            progress: '',
            uuidCancelExport: '',
        };
    },
    computed: {
        progressAvg() {
            let sumProgress = 0;
            if (Object.keys(this.listFileExport).length != 0) {
                for (let file in this.listFileExport) {
                    sumProgress += this.listFileExport[file].progress;
                }
                return sumProgress / Object.keys(this.listFileExport).length;
            } else return 0;
        },
        listFileExport() {
            return this.$store.state.exportExcel.listFileExport;
        },
    },
    watch: {
        listFileExport: {
            deep: true,
            async handler(val) {
                if (Object.keys(val).length != 0) {
                    this.$emit('handle-show-file-export');
                    for (let uuid in val) {
                        if (!val[uuid].processing) {
                            val[uuid].processing = true;
                            let loopCheckProcess = setInterval(async () => {
                                if (val[uuid] != undefined) {
                                    try {
                                        let res = await exportApi.getProcessing(
                                            uuid,
                                        );
                                        if (res.status == 200) {
                                            this.$store.commit(
                                                'exportExcel/handleUpdateProgress',
                                                {
                                                    uuid: uuid,
                                                    progress: res.data.process,
                                                    message: this.$t(
                                                        'export.' +
                                                            res.data.message,
                                                    ),
                                                },
                                            );
                                            if (
                                                res.data.process == 100 &&
                                                (res.data.message == 'Done' ||
                                                    res.data.message ==
                                                        'Hoàn thành')
                                            ) {
                                                this.$store.commit(
                                                    'exportExcel/handleUpdateProgress',
                                                    {
                                                        uuid: uuid,
                                                        progress: 0,
                                                        message: this.$t(
                                                            'export.data.download',
                                                        ),
                                                    },
                                                );
                                                clearInterval(loopCheckProcess);

                                                let loopCheckDownloadFile =
                                                    setInterval(() => {
                                                        this.progress =
                                                            this.$refs[
                                                                'progress'
                                                            ][0].innerText;
                                                        this.progress =
                                                            this.progress.replace(
                                                                '%',
                                                                '',
                                                            );
                                                        this.$store.commit(
                                                            'exportExcel/handleUpdateProgress',
                                                            {
                                                                uuid: uuid,
                                                                progress:
                                                                    this
                                                                        .progress,
                                                                message:
                                                                    this.$t(
                                                                        'export.data.download',
                                                                    ),
                                                            },
                                                        );
                                                    }, 50);

                                                await util.getExcelFile(
                                                    { uuid: uuid },
                                                    appConfigs.apiDomain
                                                        .download,
                                                    val[uuid].fileName,
                                                    null,
                                                    true,
                                                    uuid,
                                                );
                                                this.$evtBus.$emit(
                                                    'finish-export-excel',
                                                    uuid,
                                                );
                                                clearInterval(
                                                    loopCheckDownloadFile,
                                                );
                                                this.$store.commit(
                                                    'exportExcel/handleDeleteFileExport',
                                                    uuid,
                                                );
                                                if (
                                                    Object.keys(val).length == 0
                                                ) {
                                                    this.isShowListFileExport = false;
                                                }
                                                this.isConfirmCancelExport = false;
                                            }
                                        } else {
                                            this.$store.commit(
                                                'exportExcel/handleUpdateStatusError',
                                                { uuid: uuid, isError: true },
                                            );
                                            this.showErrorFile(
                                                this.listFileExport[uuid]
                                                    .fileName,
                                            );
                                        }
                                    } catch (err) {
                                        clearInterval(loopCheckProcess);
                                        this.$store.commit(
                                            'exportExcel/handleUpdateStatusError',
                                            { uuid: uuid, isError: true },
                                        );
                                        this.showErrorFile(
                                            this.listFileExport[uuid].fileName,
                                        );
                                    }
                                }
                            }, 2000);
                        }
                    }
                } else this.$emit('handle-hide-file-export');
            },
        },
    },
    methods: {
        cancelExport(uuid) {
            if (this.listFileExport[uuid].isError == false) {
                this.isConfirmCancelExport = true;
                this.uuidCancelExport = uuid;
            } else {
                this.handleCancelExport(uuid);
            }
        },
        async handleCancelExport(uuid) {
            try {
                await exportApi.cancelExport({ uuid: uuid });
                this.$evtBus.$emit('finish-export-excel', uuid);
                this.$store.commit('exportExcel/handleDeleteFileExport', uuid);
            } catch {
                this.$snotify({
                    type: 'error',
                    title: this.$t('export.errorStopExport'),
                    text: this.listFileExport[uuid].fileName + '.xlsx',
                });
            }
        },
        handleDisagreeCancelExport() {
            this.isConfirmCancelExport = false;
        },
        handleAgreeCancelExport() {
            this.handleCancelExport(this.uuidCancelExport);
            this.isConfirmCancelExport = false;
        },
        showErrorFile(fileError) {
            this.$snotify({
                type: 'error',
                title: this.$t('export.error'),
                text: fileError + '.xlsx',
            });
        },
    },
    created() {
        this.$evtBus.$on('show-file-export-excel', () => {
            this.isShowListFileExport = true;
        });
    },
};
</script>
<style scoped>
.selected-file-export .cancel-export {
    display: none;
}
.selected-file-export:hover .cancel-export {
    display: inline-block;
}
.selected-file-export:hover .hide-process-export {
    display: none;
}
</style>
