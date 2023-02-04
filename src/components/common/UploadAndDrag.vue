<template>
    <uploader
        @change="handleChange"
        @file-progress="progressFile"
        ref="upload"
        class="uploader-example"
    >
        <uploader-unsupport></uploader-unsupport>
        <uploader-drop>
            <p>{{ $t('v2.general.dropFileHereToUploadOr') }}</p>
            <uploader-btn
                :single="control.type == 'image' ? true : false"
                ref="selectFile"
                >{{ $t('v2.general.selectFile') }}</uploader-btn
            >
        </uploader-drop>
        <uploader-list></uploader-list>
    </uploader>
</template>

<script>
import { fileTypes } from '@/views/document/submit/uploadControl';
import { fileManagementApi } from '@/api/FileManagement.js';
import { appConfigs } from '../../configs';
let formData = new FormData();
export default {
    data() {
        return {
            formDatas: {},
            control: ''
        };
    },
    mounted() {},
    props: {
        objectType: {
            type: String,
            default: ''
        },
        objectIdentifier: {
            type: String,
            default: ''
        }
    },
    methods: {
        openFile() {
            $('.uploader-btn').find('input')[0].click();
        },
        // lấy từng phần trăm upload của list file
        progressFile(value) {
            let percentUploadedOfList = [];
            this.$refs.upload.fileList.map((file) => {
                percentUploadedOfList.push({
                    progress: file.progress(),
                    name: file.name
                });
            });
            this.$emit('percent-uploaded', {
                listProgress: percentUploadedOfList,
                control: this.control
            });
        },
        handleDragAndDrop(e) {
            this.handleChange(e);
        },
        handleChange(e) {
            const self = this;
            e.target.files.forEach((file) => {
                self.formDatas = {};
                let form = new FormData();
                form.append(
                    'user',
                    self.$store.state.app.endUserInfo.displayName
                );
                form.append('objectType', self.objectType);
                form.append('objectIdentifier', self.objectIdentifier);
                form.append('file', file);
                let strRegex = '.(' + Object.keys(fileTypes).join('|') + ')$';
                let typeValid = new RegExp(strRegex, 'g');
                let fileName = file.name;
                form.append('fileName', file.name.replace(typeValid, ''));
                self.formDatas = form;
                let dateCreated = self.$moment().format('DD/MM/YYYY HH:mm');
                let newFile = {
                    id: '',
                    uid: '',
                    name: file.name.replace(typeValid, ''),
                    type: file.type,
                    serverPath:
                        appConfigs.apiDomain.fileManagement +
                        'readFile/' +
                        fileName,
                    size: file.size,
                    created: dateCreated,
                    userCreated: self.$store.state.app.endUserInfo.displayName
                };
                let mb = file.size / (1024 * 1024);
                if (mb > 40) {
                    self.$snotifyError(
                        self.$t('v2.general.error'),
                        self.$t('v2.general.fileTooLargeErr')
                    );
                } else {
                    if (fileTypes[newFile.type]) {
                        self.$emit('uploaded-file', {
                            control: this.control,
                            data: newFile
                        });
                        self.uploadFile();
                    } else {
                        this.$snotifyError(
                            self.$t('v2.general.error'),
                            self.$t('v2.general.invalidImageFile')
                        );
                    }
                }
            });
        },
        uploadFile() {
            fileManagementApi
                .uploadFileSymper(this.formDatas, {
                    dataType: 'text',
                    contentType: false,
                    processData: false
                })
                .then((res) => {
                    let resObj = JSON.parse(res);
                    if (resObj.status == 200) {
                        this.$emit('remove-progress', {
                            data: resObj.data,
                            control: this.control
                        });
                        if (this.objectType && this.objectIdentifier) {
                            this.$store.commit(
                                'file/setWaitingFileCountPerObj',
                                this.objectType + ':' + this.objectIdentifier
                            );
                        }
                    } else {
                        this.$snotifyError(
                            this.$t('v2.general.uploadImageFail'),
                            resObj.message
                        );
                    }
                });
        }
    }
};
</script>
