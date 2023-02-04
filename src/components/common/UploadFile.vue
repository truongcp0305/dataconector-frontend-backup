<template>
    <div class="symper-upload-file">
        <v-btn
            icon
            tile
            class="ml-1 mb-1 btn-upload"
            :loading="isSelecting"
            @click="onButtonClick"
            x-small
            :disabled="disabled"
        >
            <v-icon class="icon-attach-file">{{ iconName }}</v-icon>
            <input
                ref="uploader"
                class="d-none"
                type="file"
                @change="onFileChanged"
                :multiple="uploadMultyFile"
                @click="onInputClick"
                :accept="acceptType"
            />
        </v-btn>
        <span
            class="ml-1 text-ellipsis"
            v-if="uploadDisplayName && !isSelecting"
            style="width: calc(100% - 35px); display: inline-block"
        >
            {{ uploadDisplayName }}
        </span>
        <div style="overflow-y: scroll !important">
            <v-dialog v-model="dialog" width="500" scrollable>
                <v-card>
                    <v-card-title>
                        {{ $t('v2.general.selectAvatar') }}
                    </v-card-title>
                    <clipper-basic
                        v-if="spliting"
                        class="my-clipper"
                        :class="{
                            clipSquare: clipSquare,
                            clipCircle: !clipSquare
                        }"
                        ref="clipper"
                        :ratio="1 / 1"
                        preview="cropResult"
                        :src="previewImg"
                        :min-width="20"
                        :min-height="20"
                    >
                        <div class="placeholder" slot="placeholder">
                            {{ $t('v2.general.noImage') }}
                        </div>
                    </clipper-basic>
                    <img
                        v-else
                        class="result"
                        :src="previewImg"
                        alt=""
                        style="
                            width: 450px;
                            height: 450px;
                            margin-left: 25px;
                            margin-right: auto;
                        "
                    />
                    <v-divider></v-divider>
                    <v-card-actions class="bg-white">
                        <v-spacer></v-spacer>
                        <v-btn
                            v-show="showSplit"
                            color="primary"
                            text
                            @click="splitImg"
                            :uploadHandler="splitImg"
                        >
                            {{ $t('v2.general.clip') }}
                        </v-btn>
                        <v-btn color="danger" text @click="dialog = false">
                            {{ $t('v2.general.cancel') }}
                        </v-btn>
                        <v-btn color="success" @click="selectImg">
                            {{ $t('v2.general.select') }}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
    </div>
</template>

<script>
import { fileManagementApi } from '@/api/FileManagement.js';
import { emit } from 'process';
import { clipperUpload, clipperBasic, clipperPreview } from 'vuejs-clipper';
import { appConfigs } from '../../configs';

let formData = new FormData();
export default {
    components: {
        clipperUpload,
        clipperBasic,
        clipperPreview
    },
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        src: {
            type: String,
            default: ''
        },
        showSplit: {
            type: Boolean,
            default: false
        },
        fileName: {
            type: String,
            default: ''
        },
        useDefaultName: {
            type: Boolean,
            default: false
        },
        autoUpload: {
            type: Boolean,
            default: true
        },
        pickAvatar: {
            type: Boolean,
            default: false
        },
        objectType: {
            type: String,
            default: ''
        },
        objectIdentifier: {
            type: String,
            default: ''
        },
        objectContext: {
            type: String,
            default: ''
        },
        uploadMultyFile: {
            type: Boolean,
            default: false
        },
        iconName: {
            type: String,
            default: 'mdi-attachment'
        },
        uploadFileFunction: {
            type: Function,
            default: null
        },
        uploadDisplayName: {
            default: ''
        },
        clipSquare: {
            type: Boolean,
            default: false
        },
        acceptType: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isSelecting: false,
            dialog: false,
            previewImg: '',
            spliting: true,
            formDatas: {},
            selectedFile: null
        };
    },
    mounted() {},
    methods: {
        onInputClick(event) {
            event.target.value = '';
        },
        onButtonClick() {
            this.isSelecting = true;
            window.addEventListener(
                'focus',
                () => {
                    this.isSelecting = false;
                },
                { once: true }
            );
            this.$refs.uploader.click();
        },
        onFileChanged(e) {
            formData = new FormData();
            if (this.uploadMultyFile == true) {
                let self = this;
                e.target.files.forEach(function (k) {
                    self.formDatas = {};
                    let form = new FormData();
                    form.append(
                        'user',
                        self.$store.state.app.endUserInfo.displayName
                    );
                    form.append('objectType', self.objectType);
                    form.append('objectIdentifier', self.objectIdentifier);
                    form.append('file', k);
                    self.formDatas = form;
                    if (self.useDefaultName) {
                        form.append('fileName', k.name);
                    }
                    self.uploadFile();
                });
            } else {
                this.selectedFile = e.target.files[0];
                formData.append(
                    'user',
                    this.$store.state.app.endUserInfo.displayName
                );
                formData.append('objectType', this.objectType);
                formData.append('objectIdentifier', this.objectIdentifier);
                if (this.useDefaultName) {
                    form.append('fileName', e.target.files[0].name);
                }
                if (this.pickAvatar == true) {
                    if (
                        this.selectedFile.type == 'image/jpeg' ||
                        this.selectedFile.type == 'image/jpg' ||
                        this.selectedFile.type == 'image/png'
                    ) {
                        this.dialog = true;
                        this.previewImg = window.URL.createObjectURL(
                            e.target.files[0]
                        );
                    }
                } else {
                    formData.append('file', this.selectedFile);
                    this.formDatas = formData;
                    let emitData = window.URL.createObjectURL(
                        e.target.files[0]
                    );
                    this.$emit('selected-file', emitData);
                    if (this.autoUpload) {
                        this.uploadFile();
                    }
                }
            }
        },
        splitImg() {
            const canvas = this.$refs.clipper.clip();
            this.previewImg = canvas.toDataURL('image/jpeg', 1);
        },
        selectImg() {
            const canvas = this.$refs.clipper.clip();
            this.previewImg = canvas.toDataURL('image/jpeg', 1);
            formData = new FormData();
            this.dialog = false;
            let file = this.dataURItoBlob(this.previewImg);
            var Fname = this.fileName + '.jpeg';
            formData.append('file', file, Fname);
            this.formDatas = formData;
            this.$emit('selected-file', this.previewImg);
            if (this.autoUpload) {
                this.uploadFile();
            }
        },
        dataURItoBlob(dataURI) {
            var byteString = window.atob(dataURI.split(',')[1]);
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mimeString });
        },
        uploadFile() {
            this.isSelecting = true;
            if (this.fileName != '') {
                this.formDatas.append('fileName', this.fileName);
            }
            let uploadFunc = this.uploadFileFunction;
            if (uploadFunc === null) {
                uploadFunc = fileManagementApi.uploadFileSymper;
            }
            uploadFunc(this.formDatas, {
                dataType: 'text',
                contentType: false,
                processData: false
            })
                .then((res) => {
                    this.isSelecting = false;
                    let resObj = JSON.parse(res);
                    if (resObj.status == 200) {
                        this.$emit('uploaded-file', resObj.data);
                        this.$emit('change', resObj.data);

                        if (this.objectType && this.objectIdentifier) {
                            this.$store.commit(
                                'file/setWaitingFileCountPerObj',
                                this.objectType + ':' + this.objectIdentifier
                            );
                        }
                    } else {
                        this.$emit('upload-error', resObj.message);
                    }
                })
                .catch((err) => {
                    this.$snotifyError(
                        err,
                        this.$t('v2.general.uploadFileErr')
                    );
                    this.isSelecting = false;
                });
        }
    }
};
</script>

<style>
.clipCircle .vuejs-clipper-basic__zoom-area {
    border-radius: 50% !important;
}
.clipSquare .vuejs-clipper-basic__zoom-area {
    border-radius: 20px !important;
}
</style>
