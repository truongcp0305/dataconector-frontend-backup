<template>
    <v-overlay
        v-if="media[select]"
        :opacity="0.9"
        :value="showDialog"
        class="light-box-full-screen"
    >
        <div
            @click.stop="closeLightBox"
            style="width: 100%; height: 100%; z-index: 1001; margin: 0 auto"
        >
            <div class="w-100 d-flex justify-space-between mt-4 px-3">
                <v-tooltip bottom z-index="10000">
                    <template v-slot:activator="{ on }">
                        <span
                            v-on="on"
                            style="
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                display: inline-block;
                                max-width: 240px;
                                height: 21px;
                            "
                            >{{ media[select] ? media[select].name : '' }}</span
                        >
                    </template>
                    <span>{{ media[select] ? media[select].name : '' }}</span>
                </v-tooltip>
                <div class="mb-4" style="margin-top: -10px">
                    <v-tooltip
                        bottom
                        v-if="isShowStar || media[select].isMainPicture"
                        z-index="6000"
                    >
                        <template v-slot:activator="{ on }">
                            <v-btn
                                :style="{
                                    color: media[select].isMainPicture
                                        ? 'yellow'
                                        : 'white'
                                }"
                                v-on="on"
                                @click.stop="setMain()"
                                v-if="closable"
                                icon
                                :title="$t('v2.general.setAva')"
                                class="vue-lb-button-close"
                            >
                                <i class="mdi mdi-star-outline"></i>
                            </v-btn>
                        </template>
                        <span>{{ $t('document.upload.setMain') }}</span>
                    </v-tooltip>
                    <v-tooltip bottom v-else z-index="6000">
                        <template v-slot:activator="{ on }">
                            <v-btn
                                v-if="media[select].isMainPicture"
                                :style="{
                                    color: media[select].isMainPicture
                                        ? 'yellow'
                                        : 'white'
                                }"
                                v-on="on"
                                icon
                                :title="$t('v2.general.setAva')"
                                class="vue-lb-button-close"
                            >
                                <i class="mdi mdi-star-outline"></i>
                            </v-btn>
                        </template>
                        <span>{{ $t('document.upload.setMain') }}</span>
                    </v-tooltip>
                    <v-tooltip bottom z-index="6000">
                        <template v-slot:activator="{ on }">
                            <v-btn
                                @click.stop="rotateRight()"
                                v-on="on"
                                v-if="closable"
                                icon
                                :title="$t('v2.general.rotateRight')"
                                class="vue-lb-button-close"
                                small
                            >
                                <i class="mdi mdi-rotate-right"></i>
                            </v-btn>
                        </template>
                        <span>{{ $t('common.rotateRight') }}</span>
                    </v-tooltip>
                    <v-tooltip bottom z-index="6000">
                        <template v-slot:activator="{ on }">
                            <v-btn
                                @click.stop="rotateLeft()"
                                v-on="on"
                                v-if="closable"
                                icon
                                :title="$t('v2.general.rotateLeft')"
                                class="vue-lb-button-close"
                            >
                                <i class="mdi mdi-rotate-left"></i>
                            </v-btn>
                        </template>
                        <span> {{ $t('common.rotateLeft') }}</span>
                    </v-tooltip>
                    <v-tooltip bottom z-index="6000">
                        <template v-slot:activator="{ on }">
                            <v-btn
                                @click.stop="download()"
                                v-on="on"
                                v-if="closable"
                                icon
                                :title="$t('v2.general.download')"
                                class="vue-lb-button-close"
                            >
                                <i class="mdi mdi-download"></i>
                            </v-btn>
                        </template>
                        <span> {{ $t('common.download') }}</span>
                    </v-tooltip>
                    <v-btn
                        v-if="closable"
                        icon
                        :title="closeText"
                        @click.stop="showDialog = false"
                        class="vue-lb-button-close"
                    >
                        <i class="mdi mdi-close"></i>
                    </v-btn>
                </div>
            </div>
            <transition
                mode="out-in"
                name="vue-lb-content-transition"
                @afterEnter="enableImageTransition"
                @beforeLeave="disableImageTransition"
            >
                <div
                    v-if="media"
                    class="h-100"
                    v-show="lightBoxOn"
                    ref="container"
                >
                    <div class="vue-lb-content h-100">
                        <div
                            class="
                                vue-lb-figure
                                d-flex
                                justify-space-between
                                align-center
                            "
                            style="height: 80%"
                            @click.stop
                        >
                            <div
                                style="width: 100px"
                                class="d-flex justify-end"
                            >
                                <v-btn
                                    icon
                                    v-if="media.length > 1"
                                    fab
                                    dark
                                    small
                                    color="white"
                                    style="background: rgba(255, 255, 255, 0.2)"
                                    @click.stop="previousImage()"
                                    :title="previousText"
                                >
                                    <i
                                        style="font-size: 30px"
                                        class="mdi mdi-chevron-left"
                                    ></i>
                                </v-btn>
                            </div>
                            <transition
                                style="width: 800px"
                                mode="out-in"
                                :name="modalImageTransitionName"
                            >
                                <v-img
                                    height="100%"
                                    :width="imgWidth ? imgWidth : '90%'"
                                    style="margin-bottom: 15px"
                                    :style="{
                                        transform: 'rotate(' + rotate + 'deg)'
                                    }"
                                    v-if="isTypeImage(media[select].type)"
                                    :src="
                                        media[select].src.replace(
                                            'readFile',
                                            'readFile'
                                        )
                                    "
                                    contain
                                    class="px-3 pt-15 vue-lb-modal-image"
                                >
                                </v-img>
                                <div
                                    v-else
                                    style="
                                        height: 270px;
                                        background: white;
                                        margin-top: 55px;
                                    "
                                    class="d-flex align-center"
                                >
                                    <v-icon
                                        :size="200"
                                        style="color: black"
                                        v-if="fileTypes[media[select].type]"
                                        >{{
                                            fileTypes[media[select].type]
                                        }}</v-icon
                                    >
                                    <v-icon
                                        :size="200"
                                        style="color: black"
                                        v-else
                                        >mdi-file-code-outline</v-icon
                                    >
                                </div>
                                <!-- <video
                style="max-height:500px"
                v-if="media[select]&&media[select].type == 'video'"
                ref="video"
                :key="media[select].sources[0].src"
                :width="media[select].width"
                :height="media[select].height"
                :autoplay="media[select].autoplay"
                controls>
                <source
                  v-for="source in media[select].sources"
                  :key="source.src"
                  :src="source.src"
                  :type="source.type"
                >
              </video> -->
                            </transition>
                            <div style="width: 100px">
                                <v-btn
                                    fab
                                    dark
                                    style="background: rgba(255, 255, 255, 0.2)"
                                    icon
                                    color="white"
                                    small
                                    v-if="media.length > 1"
                                    @click.stop="nextImage()"
                                    :title="nextText"
                                >
                                    <i
                                        style="font-size: 30px"
                                        class="mdi mdi-chevron-right"
                                    ></i>
                                </v-btn>
                            </div>
                        </div>
                        <div class="vue-lb-footer">
                            <div class="vue-lb-footer-info" />
                            <div
                                class="
                                    vue-lb-footer-count
                                    d-flex
                                    justify-center
                                "
                                v-show="showFooterCount"
                            >
                                <slot
                                    name="footer"
                                    :current="select + 1"
                                    :total="media.length"
                                >
                                    {{ select + 1 }} / {{ media.length }}
                                </slot>
                            </div>
                        </div>
                        <!-- list image -->
                        <div class="slider-image mt-4" @click.stop>
                            <v-sheet
                                @click.stop
                                style="
                                    background-color: unset !important;
                                    max-width: 90%;
                                "
                                class="mx-auto d-flex justify-center"
                            >
                                <v-slide-group show-arrows>
                                    <v-slide-item
                                        @click.stop
                                        v-for="(image, index) in imagesThumb"
                                        v-show="
                                            index >= thumbIndex.begin &&
                                            index <= thumbIndex.end
                                        "
                                        :key="
                                            typeof image.src === 'string'
                                                ? `${image.src}${index}`
                                                : index
                                        "
                                        v-slot="{ toggle }"
                                    >
                                        <v-card
                                            class="mx-1 h-100"
                                            width="40"
                                            height="40"
                                            @click.stop="showImage(index)"
                                        >
                                            <v-img
                                                v-if="isTypeImage(image.type)"
                                                :style="{
                                                    opacity:
                                                        index == select
                                                            ? 1
                                                            : 0.5,
                                                    border:
                                                        index == select
                                                            ? '4px solid white'
                                                            : '',
                                                    height: '40px'
                                                }"
                                                v-lazy="
                                                    image.src.replace(
                                                        'readFile',
                                                        'readFileThumbnail'
                                                    )
                                                "
                                                max-height="40"
                                                max-width="40"
                                                @click="toggle"
                                                :src="
                                                    image.src.replace(
                                                        'readFile',
                                                        'readFileThumbnail'
                                                    )
                                                "
                                            ></v-img>
                                            <div
                                                v-else
                                                style="
                                                    height: 40px;
                                                    width: 40px;
                                                    background: white;
                                                "
                                            >
                                                <v-icon
                                                    class="ml-2 mt-2"
                                                    style="color: black"
                                                    v-if="
                                                        fileTypes[
                                                            media[select].type
                                                        ]
                                                    "
                                                    >{{
                                                        fileTypes[
                                                            media[select].type
                                                        ]
                                                    }}</v-icon
                                                >
                                                <v-icon
                                                    class="ml-2 mt-2"
                                                    style="color: black"
                                                    v-else
                                                    >mdi-file-code-outline</v-icon
                                                >
                                            </div>
                                        </v-card>
                                    </v-slide-item>
                                </v-slide-group>
                            </v-sheet>
                        </div>
                        <!-- list image -->
                    </div>
                </div>
            </transition>
        </div>
    </v-overlay>
</template>

<script>
import { fileManagementApi } from '@/api/FileManagement';
import VideoIcon from './VideoIcon';
let Hammer;
if (typeof window !== 'undefined') {
    Hammer = require('hammerjs');
}
export default {
    components: {
        VideoIcon
    },
    props: {
        isShowStar: {
            type: Boolean,
            default: true
        },
        media: {
            type: Array,
            required: true
        },
        isSetMain: {
            type: Boolean,
            default: true
        },
        disableScroll: {
            type: Boolean,
            default: true
        },
        showLightBox: {
            type: Boolean,
            default: true
        },
        closable: {
            type: Boolean,
            default: true
        },
        startAt: {
            type: Number,
            default: 0
        },
        nThumbs: {
            type: Number,
            default: 17
        },
        showThumbs: {
            type: Boolean,
            default: true
        },
        showFooterCount: {
            type: Boolean,
            default: true
        },
        // Mode
        autoPlay: {
            type: Boolean,
            default: false
        },
        autoPlayTime: {
            type: Number,
            default: 3000
        },
        siteLoading: {
            type: String,
            default: ''
        },
        showCaption: {
            type: Boolean,
            default: false
        },
        lengthToLoadMore: {
            type: Number,
            default: 0
        },
        closeText: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.general.closeText');
            }
        },
        previousText: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.general.previousText');
            }
        },
        nextText: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.general.nextText');
            }
        },
        previousThumbText: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.general.previousText');
            }
        },
        nextThumbText: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.general.nextText');
            }
        },
        imgWidth: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            typeImage: ['jpg', 'png', 'gif', 'svg', 'link', 'jpeg'],
            fileTypes: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    'mdi-microsoft-excel',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document ':
                    'mdi-file-document-outline',
                csv: 'mdi-file-document-outline',
                'application/pdf': 'mdi-file-pdf-outline',
                'application/x-msdownload': 'mdi-file-pdf-outline',
                'video/webm': 'mdi-file-video-outline',
                'application/x-zip-compressed': 'mdi-folder-zip-outline'
            },
            rotate: 0,
            starColor: 'white',
            showDialog: false,
            select: this.startAt,
            lightBoxOn: this.showLightBox,
            timer: null,
            modalImageTransitionName: 'vue-lb-modal-image-no-transition'
        };
    },
    computed: {
        thumbIndex() {
            const halfDown = Math.floor(this.nThumbs / 2);
            if (
                this.select >= halfDown &&
                this.select < this.media.length - halfDown
            )
                return {
                    begin: this.select - halfDown + (1 - (this.nThumbs % 2)),
                    end: this.select + halfDown
                };
            if (this.select < halfDown)
                return {
                    begin: 0,
                    end: this.nThumbs - 1
                };
            return {
                begin: this.media.length - this.nThumbs,
                end: this.media.length - 1
            };
        },
        imagesThumb() {
            if (this.siteLoading) {
                return this.media.map(({ thumb, type }) => ({
                    src: thumb,
                    type,
                    loading: this.siteLoading,
                    error: this.siteLoading
                }));
            }
            return this.media.map(({ thumb, type }) => ({
                src: thumb,
                type
            }));
        }
    },
    watch: {
        lightBoxOn(value) {
            if (document != null) {
                this.onToggleLightBox(value);
            }
        },
        select() {
            this.$emit('onImageChanged', this.select);
            if (this.select >= this.media.length - this.lengthToLoadMore - 1)
                this.$emit('onLoad');
            if (this.select === this.media.length - 1)
                this.$emit('onLastIndex');
            if (this.select === 0) this.$emit('onFirstIndex');
            if (this.select === this.startAt) this.$emit('onStartIndex');
        }
    },
    mounted() {
        if (this.autoPlay) {
            this.timer = setInterval(() => {
                this.nextImage();
            }, this.autoPlayTime);
        }
        this.onToggleLightBox(this.lightBoxOn);
        if (this.$refs.container) {
            const hammer = new Hammer(this.$refs.container);
            hammer.on('swiperight', () => {
                this.previousImage();
            });
            hammer.on('swipeleft', () => {
                this.nextImage();
            });
        }
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.addKeyEvent);
        if (this.autoPlay) {
            clearInterval(this.timer);
        }
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
        setMain() {
            if (this.isSetMain) {
                let selectedImg = -1;
                if (this.media[this.select].isMainPicture) {
                    // bỏ tích
                    this.$set(this.media[this.select], 'isMainPicture', false);
                } else {
                    this.media.map((m) => (m.isMainPicture = false));
                    this.$set(this.media[this.select], 'isMainPicture', true);
                    selectedImg = this.select;
                }
                if (selectedImg > -1) {
                    this.$emit('set-main-picture', this.select);
                }
            }
        },
        download() {
            let fileId = this.media[this.select].id;
            fileManagementApi.download(fileId).then((res) => {});
        },
        rotateRight() {
            this.rotate = this.rotate + 90;
        },
        rotateLeft() {
            this.rotate = this.rotate - 90;
        },
        onLightBoxOpen() {
            this.$emit('onOpened');
            if (this.disableScroll) {
                document.querySelector('html').classList.add('no-scroll');
            }
            document.querySelector('body').classList.add('vue-lb-open');
            document.addEventListener('keydown', this.addKeyEvent);
            if (this.$refs.video && this.$refs.video.autoplay) {
                this.$refs.video.play();
            }
        },
        onLightBoxClose() {
            this.$emit('onClosed');
            if (this.disableScroll) {
                document.querySelector('html').classList.remove('no-scroll');
            }
            document.querySelector('body').classList.remove('vue-lb-open');
            document.removeEventListener('keydown', this.addKeyEvent);
            if (this.$refs.video) {
                this.$refs.video.pause();
                this.$refs.video.currentTime = 0;
            }
        },
        onToggleLightBox(value) {
            if (value) {
                this.onLightBoxOpen();
            } else {
                this.onLightBoxClose();
            }
        },
        showImage(index) {
            this.$set(this, 'select', index);
            this.$set(this, 'lightBoxOn', true);
        },
        addKeyEvent(event) {
            if (event.keyCode === 37) this.previousImage(); // left arrow
            if (event.keyCode === 39) this.nextImage(); // right arrow
            if (event.keyCode === 27) this.closeLightBox(); // esc
        },
        closeLightBox() {
            this.showDialog = false;
            if (!this.closable) return;
            this.$set(this, 'lightBoxOn', false);
        },
        nextImage() {
            this.$set(this, 'select', (this.select + 1) % this.media.length);
        },
        previousImage() {
            this.$set(
                this,
                'select',
                (this.select + this.media.length - 1) % this.media.length
            );
        },
        enableImageTransition() {
            this.$set(
                this,
                'modalImageTransitionName',
                'vue-lb-modal-image-transition'
            );
        },
        disableImageTransition() {
            this.$set(
                this,
                'modalImageTransitionName',
                'vue-lb-modal-image-no-transition'
            );
        }
    }
};
</script>
<style scoped>
.light-box-full-screen >>> .v-overlay__content {
    width: 100%;
    height: 100%;
    margin: 0 auto;
}
.light-box-full-screen {
    z-index: 5000 !important;
}
</style>
