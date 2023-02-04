<template>
    <div class="body h-100 tenant-info d-flex">
        <div>
            <p class="fw-500 fs-13 mb-3">
                {{ $t('tenantManager.tenantInfo') }}
            </p>
            <FormTpl
                class="input-data-tenant"
                :allInputs="tenantInfo"
                :singleLine="true"
                :labelWidth="'100px'"
                :titleSize="'medium'"
            />
            <p class="fw-500 fs-13">
                {{ $t('tenantManager.accountInfo') }}
            </p>
            <FormTpl
                class="input-data-tenant"
                :allInputs="accountInfo"
                :singleLine="true"
                :labelWidth="'100px'"
                :titleSize="'medium'"
            />
        </div>
        <div class="logo d-flex">
            <v-tooltip bottom v-if="imageUrl == ''">
                <template v-slot:activator="{ on }">
                    <div class="icon-file">
                        <v-icon
                            v-on="on"
                            :color="'#a09b94'"
                            @click="selectImage"
                            >mdi-file-image-outline</v-icon
                        >
                    </div>
                </template>
                <span>{{ $t('tenantManager.tooltipUploadImage') }}</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-img
                        v-on="on"
                        :src="imageUrl"
                        :max-width="'124'"
                        :max-height="'124'"
                        @click="selectImage"
                        :class="{ image: imageUrl != '' ? true : false }"
                    ></v-img>
                </template>
                <span>{{ $t('tenantManager.tooltipUploadImage') }}</span>
            </v-tooltip>

            <UploadFile
                ref="uploadLogo"
                :pickAvatar="true"
                :autoUpload="false"
                :fileName="fileName"
                @selected-file="handleAvatarSelected"
                :disabled="disabled"
                @change="changeLogo"
                :clipSquare="true"
                :acceptType="'image/png, image/gif, image/jpeg'"
            />
        </div>
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';
import UploadFile from '@/components/common/UploadFile.vue';
import { util } from '@/plugins/util.js';
import { appConfigs } from '../../configs';
export default {
    components: {
        FormTpl,
        UploadFile
    },
    data() {
        return {
            imageUrl: '',
            fileName: ''
        };
    },
    watch: {
        logoName(vl) {
            this.fileName = util.cloneDeep(vl);
        }
    },
    props: {
        disabled: {
            type: Boolean
        },
        tenantInfo: {
            type: Object
        },
        accountInfo: {
            type: Object
        },
        logoName: {
            type: String,
            default: ''
        }
    },
    methods: {
        selectImage() {
            this.$refs.uploadLogo.onButtonClick();
        },
        handleAvatarSelected(tempUrl) {
            this.imageUrl = tempUrl;
            this.fileName = 'logo' + Date.now();
            setTimeout(() => {
                this.$refs.uploadLogo.uploadFile();
            }, 200);
        },
        getImageUrl() {
            if (this.logoName != '') {
                this.imageUrl =
                    appConfigs.apiDomain.fileManagement +
                    'readFile/' +
                    this.logoName;
            } else this.imageUrl = '';
        },
        changeLogo(obj) {
            this.$emit('change-logo', obj);
        }
    },
    created() {
        this.getImageUrl();
        this.fileName = util.cloneDeep(this.logoName);
    }
};
</script>

<style scoped>
.tenant-info {
    color: #1b1b1b !important;
}
.tenant-info >>> .input-data-tenant .v-input {
    min-width: 223px !important;
    width: 223px !important;
}
.tenant-info >>> .input-data-tenant .v-input__slot {
    box-shadow: unset !important;
    /* border: 0.5px solid #b5b5b5; */
    height: 28px !important;
    /* background: #ffffff !important; */
}
.tenant-info >>> .input-data-tenant .sym-style-input:not(.v-input--checkbox) {
    /* border: none !important; */
}

.tenant-info >>> .border-all {
    /* border: none !important; */
}
.tenant-info >>> .active-tenant {
    margin-left: 102px;
}
.tenant-info >>> .logo {
    margin-left: 20px;
    /* margin-right: auto; */
    margin-top: 31px;
    flex-direction: column;
    display: flex;
    align-items: center;
}
.tenant-info >>> .icon-file {
    border: 2px dashed #b1b1b1;
    border-radius: 8px;
}
.tenant-info >>> .v-icon.v-icon::after {
    transform: scale(1);
    border-radius: unset !important;
}
.tenant-info >>> .icon-file .v-icon {
    font-size: 70px;
    background-color: #fbfbfb;
    padding: 25px !important;
    border-radius: 8px;
}
.tenant-info >>> .icon-attach-file,
.tenant-info >>> .symper-upload-file {
    display: none !important;
}
.tenant-info >>> .image {
    cursor: pointer;
    border-radius: 8px;
    border: 2px solid #fb7e00;
}
</style>