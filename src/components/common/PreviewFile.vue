<template>
    <v-dialog
        v-model="showDialog"
        persistent
        class="h-100 w-100"
        content-class="bg-white overflow-hidden"
    >
        <div class="h-90 w-90 d-flex flex-column">
            <div class="d-flex flex-row-reverse">
                <v-btn icon tile small @click="hide">
                    <v-icon small> mdi-close </v-icon>
                </v-btn>
                <v-btn icon tile small @click="downloadFile">
                    <v-icon small> mdi-download </v-icon>
                </v-btn>
            </div>
            <div class="preview-image-wrapper">
                <v-img
                    v-if="
                        fileInfor.type == 'png' ||
                        fileInfor.type == 'jpg' ||
                        fileInfor.type == 'jpeg'
                    "
                    :src="fileInfor.serverPath"
                    style="
                        max-height: 100%;
                        max-width: 100%;
                        vertical-align: bottom;
                    "
                >
                </v-img>
                <div v-else style="margin-right: auto; margin-left: auto">
                    <iframe
                        v-if="fileInfor.type == 'txt'"
                        :src="fileInfor.serverPath"
                        frameborder="0"
                        height="700"
                        width="700"
                    ></iframe>
                    <iframe
                        v-else
                        :src="
                            'https://docs.google.com/viewerng/viewer?url=' +
                            fileInfor.serverPath +
                            '&embedded=true'
                        "
                        frameborder="0"
                        height="700"
                        width="700"
                    ></iframe>
                </div>
            </div>
        </div>
    </v-dialog>
</template>

<script>
import { fileManagementApi } from '@/api/FileManagement.js';
export default {
    data() {
        return {
            showDialog: false,
        };
    },
    props: {
        fileInfor: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    methods: {
        show() {
            this.showDialog = true;
        },
        hide() {
            this.showDialog = false;
        },
        downloadFile() {
            fileManagementApi.download(this.fileInfor.id).then((res) => {});
        },
    },
};
</script>

<style>
.preview-image-wrapper {
    overflow: auto;
    height: 800px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
}
</style>
