<template>
    <div class="content-file-upload">
        <div style="font-size: 12px; height: 100px">
            <div class="upload-file-wrapper-outtb">
                <div
                    class="file-add"
                    :title="$t('v2.showlist.addFile')"
                    data-rowid="null"
                >
                    <div
                        class="wrap-button-upload-file"
                        style="
                            margin-top: 6px;
                            position: absolute;
                            top: -2px;
                            right: 35px;
                        "
                    >
                        <v-btn x-small icon @click="addFile" class="mx-1">
                            <span
                                class="mdi mdi-plus"
                                style="
                                    font-size: 20px;
                                    color: rgba(0, 0, 0, 0.54);
                                "
                            ></span>
                        </v-btn>
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    x-small
                                    icon
                                    dark
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <span
                                        class="mdi mdi-dots-vertical"
                                        style="
                                            font-size: 20px;
                                            color: rgba(0, 0, 0, 0.54);
                                        "
                                    ></span>
                                </v-btn>
                            </template>
                            <v-list dense>
                                <v-list-item class="m-1">
                                    <v-list-item-title
                                        style="cursor: grab"
                                        class="fs-13 fw-400"
                                        @click="downloadAll()"
                                    >
                                        {{ $t('v2.showlist.downloadAll') }}
                                    </v-list-item-title>
                                </v-list-item>
                                <v-list-item>
                                    <v-list-item-title
                                        style="cursor: grab"
                                        class="fs-13 fw-400"
                                        @click="deleteAll()"
                                        >{{
                                            $t('v2.showlist.deleteAll')
                                        }}</v-list-item-title
                                    >
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </div>
                <VuePerfectScrollbar class="list-file">
                    <div
                        v-for="(file, index) in listFile"
                        :key="file.id"
                        class="file-item file-item-popup"
                        @click="openFile(file, index)"
                    >
                        <span style="font-size: 14px">
                            <v-icon :size="14" v-if="fileType[file.type]">{{
                                fileType[file.type]
                            }}</v-icon>
                            <v-icon :size="14" v-else
                                >mdi-file-code-outline</v-icon
                            >
                        </span>
                        <span
                            class="file-item__name"
                            style="width: 65%"
                            @keydown="onSaveFileName($event, file)"
                            :contenteditable="file.isEditting"
                            >{{ file.name }}</span
                        >
                        <div class="file-item__action">
                            <span
                                class="file-item__edit mdi mdi-lead-pencil mx-2"
                                @click.stop.prevent="editFile(file)"
                            ></span>
                            <span
                                class="file-item__download mdi mdi-download"
                                @click.stop.prevent="downloadFile(file.id)"
                            ></span>
                            <span
                                class="
                                    file-item__remove
                                    mdi mdi-trash-can-outline
                                    mx-2
                                "
                                @click.stop.prevent="removeFile(file)"
                            ></span>
                        </div>
                        <span class="file-item__size">{{
                            getFileSize(file.size)
                        }}</span>
                    </div>
                </VuePerfectScrollbar>
            </div>
        </div>
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import { str } from '@/plugins/utilModules/str';
import { fileManagementApi } from '@/api/FileManagement';
import { SYMPER_APP } from './../../main';
import { fileTypes } from './../../views/document/submit/uploadControl';
export default {
    props: {
        keyInstance: {
            type: Number,
            default: 0
        },
        listUploadFile: {
            type: Array,
            default() {
                return [];
            }
        },
        currentFileControl: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    components: {
        VuePerfectScrollbar
    },
    created() {
        this.listFile = this.listUploadFile;
        if (this.currentFileControl.type) {
            this.control = this.currentFileControl;
        }
    },
    data() {
        return {
            fileType: fileTypes,
            listFile: [],
            control: {}
        };
    },
    methods: {
        setControl(control) {
            this.control = control;
        },
        refreshData() {
            this.listFile = [];
        },
        setListFile(files) {
            this.listFile = files;
        },
        addFile() {
            this.$emit('add-file-click', { control: this.control });
        },
        addFileToList(file) {
            this.listFile.push(file);
        },
        openFile(file, id) {
            SYMPER_APP.$evtBus.$emit('document-item-control-file-click', {
                control: this.control,
                value: this.listFile,
                inTable: true,
                imgIdx: id
            });
        },
        getFileSize(size) {
            return str.getFileSize(size);
        },
        editFile(file) {
            this.$set(file, 'isEditting', true);
        },
        downloadFile(fileId) {
            fileManagementApi.download(fileId).then((res) => {});
        },
        onSaveFileName(event, file) {
            fileManagementApi.renameFile(file.id, $(event.target).text());
        },
        downloadAll() {
            let ids = [];
            this.listFile.map((file) => {
                ids.push(file.id);
            });
            ids = ids.join(',');
            fileManagementApi.downloadListFile(ids).then((res) => {
                if (res.status == 200) {
                    SYMPER_APP.$evtBus.$emit(
                        'show-notification-download-all-file',
                        true
                    );
                } else {
                    SYMPER_APP.$evtBus.$emit(
                        'show-notification-download-all-file',
                        false
                    );
                }
            });
        },
        deleteAll() {
            this.listFile = [];
            this.$emit('after-remove-all-file', this.control);
        },
        removeFile(file) {
            let fileItem = this.listFile.find((el) => el.id == file.id);
            this.listFile.splice(this.listFile.indexOf(fileItem), 1);
            this.$emit('after-remove-file', {
                file: file,
                control: this.control
            });
        }
    }
};
</script>

<style scoped>
.v-list-item:hover {
    background: lightgrey;
}
.upload-file-wrapper-outtb .list-file .file-item:hover {
    background: var(--symper-background-hover);
}
.file-item-popup:hover {
    background: lightgrey !important;
}
</style>
