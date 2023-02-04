<template>
    <div class="content-file-upload mt-2">
        <div style="font-size: 12px; height: 100px">
            <div class="upload-file-wrapper-outtb">
                <div
                    class="file-add"
                    @click="addFile"
                    :title="$t('v2.doc.addFile')"
                    data-rowid="null"
                >
                    <div class="wrap-button-upload">
                        <span
                            class="mdi mdi-cloud-upload"
                            style="color: blue; font-size: 30px"
                        ></span>
                    </div>
                    <div style="margin-bottom: 4px">
                        <span>{{$t('v2.doc.chooseFile')}}</span>
                    </div>
                </div>
                <VuePerfectScrollbar class="list-file">
                    <div
                        v-for="file in listFile"
                        :key="file.id"
                        class="file-item"
                        @click="openFile(file)"
                    >
                        <span
                            class="mdi mdi-microsoft-excel"
                            style="font-size: 14px"
                        ></span>
                        <span
                            class="file-item__name"
                            @keydown="onSaveFileName($event, file)"
                            :contenteditable="file.isEditting"
                            >{{ file.name }}</span
                        >
                        <div class="file-item__action">
                            <span
                                class="file-item__edit mdi mdi-lead-pencil"
                                @click.stop.prevent="editFile(file)"
                            ></span>
                            <span
                                class="file-item__remove mdi mdi-trash-can-outline"
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
export default {
    components: {
        VuePerfectScrollbar,
    },
    data() {
        return {
            listFile: [],
        };
    },
    methods: {
        setListFile(files) {
            this.listFile = files;
        },
        addFile() {
            this.$emit('add-file-click');
        },
        addFileToList(file) {
            this.listFile.push(file);
        },
        openFile(file) {
            window.open(file.serverPath);
        },
        getFileSize(size) {
            return str.getFileSize(size);
        },
        editFile(file) {
            this.$set(file, 'isEditting', true);
        },
        onSaveFileName(event, file) {
            fileManagementApi.renameFile(file.id, $(event.target).text());
        },
        removeFile(file) {
            let fileItem = this.listFile.find((el) => el.id == file.id);
            this.listFile.splice(this.listFile.indexOf(fileItem), 1);
            this.$emit('after-remove-file', file);
        },
    },
};
</script>

<style scoped></style>
