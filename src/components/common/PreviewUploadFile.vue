<template>
    <v-navigation-drawer
        class="info-upload-file"
        fixed
        :stateless="true"
        v-model="showInfoPanel"
        :temporary="typeDisplay == 'temporary' ? true : false"
        :hide-overlay="true"
        :width="width"
        right
    >
        <div
            style="padding-right: 18px"
            class="ma-2 d-flex justify-space-between"
        >
            <span class="fs-16 fw-430 mt-2">{{ title }}</span>
            <span>
                <v-tooltip v-if="isShowHideDoc" left>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            v-on="on"
                            :style="{ color: isOffDoc ? 'blue' : 'lightgrey' }"
                            depressed
                            icon
                            text
                            @click="onOffDoc()"
                        >
                            <span class="fs-16"
                                ><i class="mdi mdi-format-page-break"></i
                            ></span>
                        </v-btn>
                    </template>
                    {{
                        isOffDoc
                            ? $t('document.upload.hideDoc')
                            : $t('document.upload.showRelatedRecords')
                    }}
                </v-tooltip>
                <v-btn @click="close()" depressed icon text>
                    <span class="fs-16"><i class="mdi mdi-close"></i></span>
                </v-btn>
            </span>
        </div>
        <v-tabs fixed-tabs class="mx-2" v-model="tab">
            <v-tab
                style="text-transform: none !important"
                v-for="(control, controlIdx) in allControl"
                :key="controlIdx"
            >
                {{ control.title }}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-tab-item v-for="(item, i) in allControl" :key="i">
                <v-row
                    class="ml-1"
                    v-if="inTable && titleKeyControl"
                    style="margin-top: -7px; margin-bottom: -12px"
                >
                    <v-col class="col-md-4 fs-13 mt-2">
                        {{ titleKeyControl }}
                    </v-col>
                    <v-col class="col-md-7 ml-6 d-flex justify-end">
                        <v-menu
                            v-if="item.inTable"
                            offset-y
                            right
                            :close-on-content-click="false"
                            v-model="menu"
                        >
                            <template v-slot:activator="{ on }">
                                <span v-on="on" class="w-100">
                                    <input
                                        class="w-100 search-row-upload-table"
                                        :controlName="item.name"
                                        disabled
                                        type="text"
                                        :placeholder="
                                            $t('v2.general.selectValue')
                                        "
                                    />
                                </span>
                            </template>
                            <div
                                style="width: 350px; height: 400px"
                                class="bg-white pa-2"
                            >
                                <input-filter
                                    ref="inputFilter"
                                    :dataUploadFile="item.dataTable"
                                    @save-input-filter="saveInputFilter"
                                    @search-data="searchDataFilter"
                                />
                            </div>
                        </v-menu>
                    </v-col>
                </v-row>
                <SmallSlideImage
                    :showHiddenStar="showHiddenStar"
                    :isSetMain="isSetMain"
                    @set-main-picture="setMainPicture"
                    ref="slideImage"
                    :info="allControl[0]"
                    @action="handleAction"
                    :media="item.value"
                    :selectedImage="selectedImage"
                    @select-thumbnail-image="selectThumbnailImage"
                    @select-media="selectMedia"
                />
            </v-tab-item>
        </v-tabs-items>
    </v-navigation-drawer>
</template>
<script>
import Filter from './../../views/document/submit/items/Filter';
import { fileManagementApi } from '@/api/FileManagement';
import SmallSlideImage from './../../components/common/imageSlideShow/SmallSlideImage';
import { SYMPER_APP } from '@/main.js';
export default {
    watch: {
        currentImage() {
            this.show();
        },
        tab() {
            // truyền lên tên control
            if (this.inTable) {
                let columnSelected = [];
                this.configUploadInTable.columnSelected.map((col) => {
                    columnSelected.push(col.name);
                });
            }
        }
    },
    props: {
        showHiddenStar: {
            type: Boolean,
            default: false
        },
        typeDisplay: {
            type: String,
            default: 'permanent'
        },
        showInfoDoc: {
            type: Boolean,
            default: false
        },
        width: {
            type: Number,
            default: 500
        },
        isSetMain: {
            type: Boolean,
            default: true
        },
        title: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('common.info');
            }
        },
        isShowHideDoc: {
            type: Boolean,
            default: true
        },
        listUploadControl: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    components: {
        SmallSlideImage,
        'input-filter': Filter
    },
    computed: {
        allControl() {
            return this.listUploadControl.allControl;
        },
        currentImage() {
            return this.listUploadControl.imgIdx;
        },
        titleKeyControl() {
            let name = '';
            if (this.inTable && this.configUploadInTable) {
                let configUploadInTable =
                    this.configUploadInTable.columnSelected;
                configUploadInTable.map((control) => {
                    if (control.primary) {
                        name = control.title;
                    }
                });
            }
            return name;
        },
        nameKeyControl() {
            let name = '';
            if (this.inTable && this.configUploadInTable) {
                let configUploadInTable =
                    this.configUploadInTable.columnSelected;
                configUploadInTable.map((control) => {
                    if (control.primary) {
                        name = control.name;
                    }
                });
            }
            return name;
        },
        currentControl() {
            return this.listUploadControl.currentControl;
        },
        inTable() {
            if (!this.tab) this.tab = 0;
            if (
                this.listUploadControl.allControl[this.tab] &&
                this.listUploadControl.allControl[this.tab].inTable
            ) {
                return this.listUploadControl.allControl[this.tab].inTable;
            } else {
                return false;
            }
        },
        configUploadInTable() {
            // thông tin cấu hình upload trong table
            return this.listUploadControl.allControl[this.tab].configInTable;
        }
    },
    data() {
        return {
            tab: 0,
            menu: false,
            listUploadInTable: [],
            selectedImage: 0, // ảnh được chọn để hiển thị
            isOffDoc: false,
            showInfoPanel: false,
            selectedImg: 0 // index của image đang trỏ đến
        };
    },
    methods: {
        saveInputFilter(data) {
            let filterMedia = [];
            let list = data.value.split(',');
            let controlName = this.allControl[this.tab].name;
            $('[controlName=' + controlName + ']').val(data.value);
            this.allControl[this.tab].dataTable.allData.map((row) => {
                if (list.includes("'" + row[data.controlName] + "'")) {
                    if (row[controlName] != '') {
                        let listImage = JSON.parse(row[controlName]);
                        listImage.map((img) => {
                            filterMedia.push(img);
                        });
                    }
                }
            });

            this.allControl[this.tab].value = filterMedia;
            this.menu = false;
        },
        searchDataFilter(search) {
            search = search.search;
            let afterFilterData = [];
            let dataTable = this.allControl[this.tab].dataTable.data;
            let controlName = this.nameKeyControl;
            if (search != '') {
                dataTable.map((row) => {
                    if (
                        row[controlName]
                            .toLowerCase()
                            .includes(search.toLowerCase())
                    ) {
                        afterFilterData.push(row);
                    }
                });
            } else {
                afterFilterData = dataTable;
            }
            this.$refs.inputFilter[0].setData(afterFilterData);
        },
        selectThumbnailImage(selectedImage) {
            this.$emit('select-thumbnail-image', {
                selectedImage: selectedImage,
                control: this.currentControl
            });
        },
        onOffDoc() {
            this.isOffDoc = !this.isOffDoc;
            this.$emit('show-doc-info', this.isOffDoc);
        },
        handleAction(action) {
            if (action == 'download') {
                let fileId =
                    this.allControl[this.tab].value[this.selectedImage].id;
                fileManagementApi.download(fileId).then((res) => {
                    if (res.status == 200) {
                    } else {
                        this.$snotifyError(
                            this.$t('v2.general.error'),
                            this.$t('v2.general.loadImageErr')
                        );
                    }
                });
            }
        },
        // tích định danh
        setMainPicture(imgIdx) {
            this.allControl.map((control) => {
                if (control.name != this.currentControl.name) {
                    control.value.map((img) => {
                        img.isMainPicture = false;
                    });
                }
            });

            this.$emit('set-main-picture', {
                imgIdx: imgIdx,
                control: this.currentControl.name
            });
        },
        selectMedia(listMedia) {
            this.selectedImg = listMedia;
            this.$emit('select-image', listMedia);
        },
        // chuyển đến vị trí của tab được chọn
        showTabActive() {
            let control = this.allControl.filter(
                (control) => control.name == this.currentControl.name
            )[0];
            let controlCurrentIdx = 0;
            this.allControl.map((ctrl, i) => {
                if (ctrl == control) controlCurrentIdx = i;
            });
            return controlCurrentIdx;
        },
        show() {
            this.showInfoPanel = true;
            this.tab = this.showTabActive();
            this.$set(this, 'selectedImage', this.listUploadControl.imgIdx);
            if (this.inTable) {
                $('.search-row-upload-table').val('');
            }
        },
        close() {
            this.showInfoPanel = false;
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
.info-upload-file >>> .v-tabs-slider-wrapper {
    color: orange !important;
}
.info-upload-file >>> .v-tab--active {
    color: orange !important;
    background: antiquewhite;
}
.info-upload-file >>> .v-tabs-bar {
    height: 28px !important;
}
.v-navigation-drawer {
    transition-duration: 0ms;
    transition-timing-function: 0ms;
    will-change: unset !important;
    transition-property: unset !important;
}
.search-row-upload-table {
    background: #f2f2f2 !important;
    border: none !important;
    padding-left: 8px !important;
    height: 25px !important;
}
.v-navigation-drawer--is-mobile:not(.v-navigation-drawer--close),
.v-navigation-drawer--temporary:not(.v-navigation-drawer--close) {
    box-shadow: none !important;
}
</style>
