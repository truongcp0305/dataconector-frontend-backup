<template>
    <v-card flat>
        <div v-if="media[selectIdx]">
            <div
                v-show="selectIdx - 1 >= 0"
                class="w-100 d-flex justify-space-between upload-next-prev px-3"
            >
                <v-btn
                    v-if="showPreBtn"
                    @mouseenter="showUploadIcon = true"
                    :style="{ opacity: showPreBtn ? 1 : 0 }"
                    outlined
                    fab
                    color="white"
                    @click="prevImage()"
                >
                    <i style="font-size: 30px" class="mdi mdi-chevron-left"></i>
                </v-btn>
                <div v-else></div>
                <v-btn
                    v-if="showNextBtn"
                    @mouseenter="showUploadIcon = true"
                    :style="{ opacity: showNextBtn ? 1 : 0 }"
                    outlined
                    fab
                    color="white"
                    @click="nextImage()"
                >
                    <i
                        style="font-size: 30px"
                        class="mdi mdi-chevron-right"
                    ></i>
                </v-btn>
            </div>
            <div
                v-if="media[selectIdx]"
                :style="{
                    background: isTypeImage(media[selectIdx].type)
                        ? 'black'
                        : '#f2f2f2',
                }"
                @mouseenter="showUploadIcon = true"
                class="mt-1 mx-2 d-flex justify-center upload"
            >
                <!-- <video v-if="media[selectIdx]&&media[selectIdx].type=='video'"
                    style="max-height:500px"
                    ref="video">
                <source
                    :src="media[selectIdx]?media[selectIdx].serverPath:''"
                    >
                </video> -->
                <v-img
                    v-if="isTypeImage(media[selectIdx].type)"
                    class="main-image"
                    contain
                    max-width="390"
                    @click="selectMedia()"
                    @mouseenter="showUploadIcon = true"
                    @mouseleave="showUploadIcon = false"
                    :src="
                        media[selectIdx]
                            ? media[selectIdx].serverPath.replace(
                                  'readFile',
                                  'readFileMedium',
                              )
                            : ''
                    "
                ></v-img>
                <!-- {{media[selectIdx].serverPath.replace('readFile1','readFileMedium')}} -->
                <!-- <img v-if="isTypeImage(media[selectIdx])"
                    class="main-image" 
                    @click="selectMedia()"
                    @mouseenter="showUploadIcon = true"
                    @mouseleave="showUploadIcon = false" :src="media[selectIdx]?media[selectIdx].serverPath:''"> -->
                <div
                    v-else
                    style="background: white; height: 270px; margin-top: 55px"
                    class="d-flex align-center"
                >
                    <v-icon
                        :size="200"
                        v-if="fileTypes[media[selectIdx].type]"
                        >{{ fileTypes[media[selectIdx].type] }}</v-icon
                    >
                    <v-icon :size="200" v-else>mdi-file-code-outline</v-icon>
                </div>
                <transition :mode="!showHiddenStar ? 'out-in' : ''">
                    <div
                        @mouseenter="showUploadIcon = true"
                        v-show="
                            (showUploadIcon && !showHiddenStar) ||
                            (showHiddenStar && media[selectIdx])
                        "
                        class="upload-icon"
                    >
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-show="
                                        (showUploadIcon && !showHiddenStar) ||
                                        (showHiddenStar &&
                                            media[selectIdx] &&
                                            media[selectIdx].isMainPicture)
                                    "
                                    v-on="on"
                                    :color="
                                        media[selectIdx] &&
                                        media[selectIdx].isMainPicture
                                            ? 'yellow'
                                            : 'white'
                                    "
                                    @click="setAva()"
                                    icon
                                >
                                    <i class="mdi mdi-star-outline"></i>
                                </v-btn>
                            </template>
                            <span>{{ $t('document.upload.setMain') }}</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-show="showUploadIcon"
                                    v-on="on"
                                    color="white"
                                    @click="download()"
                                    icon
                                    ><i class="mdi mdi-download"></i
                                ></v-btn>
                            </template>
                            <span>{{ $t('common.download') }}</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-show="showUploadIcon"
                                    v-on="on"
                                    color="white"
                                    @click="selectMedia()"
                                    icon
                                    ><i class="mdi mdi-arrow-expand-all"></i
                                ></v-btn>
                            </template>
                            <span>{{ $t('common.zoomOut') }}</span>
                        </v-tooltip>
                    </div>
                </transition>
            </div>
            <div class="slider-image my-3 mx-2">
                <v-sheet class="mx-auto" max-width="480">
                    <v-slide-group show-arrows>
                        <v-slide-item
                            v-for="(img, index) in media"
                            :key="index"
                            v-slot="{ toggle }"
                        >
                            <v-card
                                class="mx-1 mb-1"
                                :class="{
                                    'hightlight-piture':
                                        selectIdx == index ? true : false,
                                    'hightlight-file':
                                        selectIdx == index &&
                                        !isTypeImage(img.type)
                                            ? true
                                            : false,
                                }"
                                style="
                                    max-height: 39px;
                                    height: 39px;
                                    width: 39px;
                                "
                                :style="{
                                    opacity: index == selectIdx ? 1 : 0.5,
                                }"
                                @click="setMainImg(index)"
                            >
                                <v-img
                                    v-if="isTypeImage(img.type)"
                                    v-lazy="
                                        img.serverPath.replace(
                                            'readFile',
                                            'readFileThumbnail',
                                        ) || img.src
                                    "
                                    style="height: 100%"
                                    max-width="39"
                                    @click="toggle"
                                    :src="
                                        img.serverPath.replace(
                                            'readFile',
                                            'readFileThumbnail',
                                        ) || img.src
                                    "
                                >
                                </v-img>
                                <div
                                    v-else
                                    style="width: 39px"
                                    class="d-flex align-items-center"
                                >
                                    <v-icon
                                        v-if="fileTypes[img.type]"
                                        class="mt-2 ml-2"
                                        >{{ fileTypes[img.type] }}</v-icon
                                    >
                                    <v-icon v-else class="mt-2 ml-2"
                                        >mdi-file-code-outline</v-icon
                                    >
                                </div>
                            </v-card>
                        </v-slide-item>
                    </v-slide-group>
                </v-sheet>
            </div>
            <div class="detail-info mx-2">
                <div class="fs-16 fw-430">
                    {{ media[selectIdx] ? media[selectIdx].name : '' }}
                </div>
                <div v-for="(item, index) in mediaInfo" :key="index">
                    <span class="mr-2 mb-2 fs-13">
                        {{ $t('document.upload.' + item.name) + ': '
                        }}{{ item.value }}
                    </span>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="mx-2 no-upload d-flex align-center">
                <div class="fs-16 d-flex justify-center w-100">No image</div>
            </div>
        </div>
    </v-card>
</template>
<script>
export default {
    props: {
        showHiddenStar: {
            // cho phép hiện tích định danh mà không cần hover
            type: Boolean,
            default: false,
        },
        selectedImage: {
            type: Number,
            default: 0,
        },
        media: {
            type: Array,
            default() {
                return [];
            },
        },
        info: {
            type: Object,
            default() {
                return {};
            },
        },
        isSetMain: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            fileTypes: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    'mdi-microsoft-excel',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document ':
                    'mdi-file-document-outline',
                csv: 'mdi-file-document-outline',
                'application/pdf': 'mdi-file-pdf-outline',
                'application/x-msdownload': 'mdi-file-pdf-outline',
                'video/webm': 'mdi-file-video-outline',
                'application/x-zip-compressed': 'mdi-folder-zip-outline',
            },
            selectIdx: 0,
            starColor: 'white',
            showUploadIcon: false,
            typeImage: ['jpg', 'png', 'gif', 'svg', 'link', 'jpeg'],
        };
    },
    computed: {
        showPreBtn() {
            return this.showUploadIcon && Number(this.selectIdx) - 1 >= 0;
        },
        showNextBtn() {
            return (
                this.showUploadIcon &&
                Number(this.selectIdx) + 1 < this.media.length
            );
        },
        mediaInfo() {
            let formatInfo = [
                {
                    value: this.media[this.selectIdx].userCreated
                        ? this.media[this.selectIdx].userCreated
                        : '',
                    name: 'owner',
                },
                { value: this.info.created, name: 'date_upload' },
                { value: this.media[this.selectIdx].type, name: 'type' },
                {
                    value: this.formatBytes(this.media[this.selectIdx].size),
                    name: 'size',
                },
                { value: '300 x 300', name: 'dimension' },
            ];
            return formatInfo;
        },
    },
    methods: {
        isTypeImage(file) {
            let isImage = false;
            if (file) {
                isImage =
                    this.typeImage.includes(file) ||
                    (file && file.split('/')[0] == 'image');
            }
            return isImage;
        },
        formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = [
                'Bytes',
                'KB',
                'MB',
                'GB',
                'TB',
                'PB',
                'EB',
                'ZB',
                'YB',
            ];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return (
                parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) +
                ' ' +
                sizes[i]
            );
        },
        prevImage() {
            if (this.showPreBtn) {
                this.$set(this, 'selectIdx', this.selectIdx - 1);
            }
        },
        nextImage() {
            if (this.showNextBtn) {
                this.$set(this, 'selectIdx', this.selectIdx + 1);
            }
        },
        selectMedia() {
            let newList = [];
            this.media.map((image) => {
                image.src = image.serverPath;
                image.thumb = image.serverPath;
                newList.push(image);
            });
            this.$emit('select-media', {
                listMedia: newList,
                index: this.selectIdx,
            });
        },
        setAva() {
            if (this.isSetMain) {
                let selectedImg = -1;
                if (this.media[this.selectIdx].isMainPicture) {
                    // bỏ tích
                    this.$set(
                        this.media[this.selectIdx],
                        'isMainPicture',
                        false,
                    );
                } else {
                    this.media.map((m) => (m.isMainPicture = false));
                    this.$set(
                        this.media[this.selectIdx],
                        'isMainPicture',
                        true,
                    );
                    selectedImg = this.selectIdx;
                }
                if (selectedImg > -1) {
                    this.$emit('set-main-picture', this.selectIdx);
                }
            }
        },
        download() {
            this.$emit('action', 'download');
        },
        // lấy kích thước ảnh dài x rộng
        getDimensionImage() {
            let width = $('.v-responsive__content')[0].style.width.replace(
                'px',
                '',
            );
            if (this.mediaInfo) {
                this.mediaInfo[4].value = width + 'x' + width;
            }
        },
        // click vào ảnh bé hiện ảnh to
        setMainImg(index) {
            this.$set(this, 'selectIdx', index);
            this.$emit('select-thumbnail-image', index);
        },
    },
    watch: {
        selectedImage() {
            this.$set(this, 'selectIdx', this.selectedImage);
        },
    },
    created() {
        this.selectIdx = this.selectedImage;
    },
};
</script>
<style scoped>
.detail-info {
    margin-top: -10px;
}
.upload-icon {
    position: absolute;
    right: 0;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    margin-right: 7px;
}
.upload {
    height: 379px;
    background: black;
    width: 383px;
    overflow: hidden;
}
.no-upload {
    height: 379px;
    background: #f2f2f2;
    width: 383px;
}
.upload-next-prev {
    position: absolute;
    z-index: 10;
    top: 160px;
}
.main-image {
    max-width: 490px;
}
.slide-image {
    /* margin-top:-10px!important */
}
.hightlight-piture >>> .v-responsive__content {
    border: 1px solid orange !important;
}
.hightlight-file {
    border: 1px solid orange !important;
}
</style>
