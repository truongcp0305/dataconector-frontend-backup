<template>
    <v-dialog v-model="isShow" max-width="500px">
        <v-card style="height: 400px">
            <v-card-title>
                <span class="fs-16">{{
                    $t('v2.dashboard.ganttConfig')
                }}</span>
            </v-card-title>
            <v-card-text style="height: 290px">
                <v-tabs vertical class="tab-config fs-13">
                    <v-tab class="s-tab">
                        <v-icon left> mdi-gradient </v-icon>
                        {{ $t('v2.dashboard.selectDocument') }}
                    </v-tab>
                    <v-tab class="s-tab">
                        <v-icon left> mdi-pencil-outline </v-icon>
                        {{ $t('v2.dashboard.fomulas') }}
                    </v-tab>
                    <v-tab-item class="s-item fs-13">
                        <div class="mb-1 font-weight-bold">
                            {{ $t('v2.dashboard.selectDocument') }}
                        </div>
                        <symper-list-autocomplete
                            class="select-document"
                            :items="listDocument"
                            :isEmitOnSearch="true"
                            :showSelection="false"
                            @symper-autocomplete-search-vl="onSearch"
                            @change="selectItem"
                        />
                        <VuePerfectScrollbar style="max-height: 240px">
                            <v-list dense>
                                <v-list-item
                                    v-for="item in cellConfigs.rawConfigs
                                        .fomulasConfig.listDocuments"
                                    :key="item.id"
                                >
                                    <div class="w-100">
                                        <span>{{ item.title }}</span>
                                        <v-icon
                                            @click.prevent.stop="
                                                removeDocSelected(item)
                                            "
                                            class="fs-14"
                                            style="
                                                float: right;
                                                padding-top: 4px;
                                            "
                                            >mdi-close</v-icon
                                        >
                                    </div>
                                </v-list-item>
                            </v-list>
                        </VuePerfectScrollbar>
                    </v-tab-item>
                    <v-tab-item class="s-item fs-13">
                        <form-tpl
                            :allInputs="
                                cellConfigs.rawConfigs.fomulasConfig.fomulas
                            "
                        />
                    </v-tab-item>
                </v-tabs>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    :loading="isLoading"
                    @click="saveConfig"
                >
                    {{ $t('v2.dashboard.select') }}
                </v-btn>
                <v-btn color="red darken-1" text @click="cancel">
                    {{ $t('common.cancel') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import SymperListAutocomplete from '@/components/common/symperInputs/SymperListAutocomplete.vue';
import GanttchartWorker from 'worker-loader!@/worker/dashboard/ganttchart/Ganttchart.Worker.js';
import { util } from '@/plugins/util';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import FormTpl from '@/components/common/FormTpl.vue';

export default {
    components: {
        SymperListAutocomplete,
        VuePerfectScrollbar,
        FormTpl
    },
    data() {
        let self = this;
        return {
            ganttchartWorker: null,
            isLoading: false,
            isShow: false,
            listDocument: [],
            filter: {
                page: 1,
                pageSize: 30,
                distinct: true
            },
            originFomulas: null
        };
    },
    props: {
        cellConfigs: {
            default() {
                return {};
            }
        }
    },
    computed: {
        allDoc() {
            return this.$store.state.document.listAllDocument;
        }
    },
    watch: {
        isShow(val) {
            if (val) {
                this.originFomulas = util.cloneDeep(
                    this.cellConfigs.rawConfigs.fomulasConfig.fomulas
                );
            }
        }
    },
    methods: {
        removeDocSelected(item) {
            let obj =
                this.cellConfigs.rawConfigs.fomulasConfig.listDocuments.find(
                    (data) => data.id === item.id
                );
            var index =
                this.cellConfigs.rawConfigs.fomulasConfig.listDocuments.indexOf(
                    obj
                );
            if (index > -1) {
                this.cellConfigs.rawConfigs.fomulasConfig.listDocuments.splice(
                    index,
                    1
                );
            }
        },
        cancel() {
            this.isShow = false;
            this.cellConfigs.rawConfigs.fomulasConfig.fomulas =
                this.originFomulas;
        },
        saveConfig() {
            this.isShow = false;
        },
        show() {
            this.isShow = true;
        },
        onSearch(val) {
            let filter = util.cloneDeep(this.filter);
            filter.search = val;
            this.getListDocument(filter);
        },
        selectItem(data) {
            let docId = data.value;
            if (
                this.cellConfigs.rawConfigs.fomulasConfig.listDocuments.length >
                0
            ) {
                let item =
                    this.cellConfigs.rawConfigs.fomulasConfig.listDocuments.find(
                        (ele) => ele.id == docId
                    );
                if (item) {
                    return;
                }
            }
            this.cellConfigs.rawConfigs.fomulasConfig.listDocuments.push(
                data.items.find((ele) => ele.id == docId)
            );
        },
        getListDocument(filter = null) {
            this.ganttchartWorker.postMessage({
                action: 'getListDocumentBefor',
                data: {
                    filter: filter ? filter : util.cloneDeep(this.filter)
                }
            });
        },
        getListDocumentBeforAfter(data) {
            this.listDocument = data.listDocument;
        },
        listenFromWorker() {
            let self = this;
            this.ganttchartWorker.addEventListener('message', function (event) {
                let data = event.data;
                let action = data.action;
                if (self[action]) {
                    self[action](data.data);
                } else {
                    console.error(` action ${action} not found `);
                }
            });
        }
    },
    created() {
        this.ganttchartWorker = new GanttchartWorker();
        this.listenFromWorker();
        this.getListDocument();
    }
};
</script>

<style scoped>
.dialog-config-gantt {
    height: 400px;
}
.tab-config >>> .v-slide-group__wrapper {
    width: 180px;
}
.tab-config >>> .v-window__container {
    height: 100%;
}
.tab-column {
    height: 100%;
}
.tab-config >>> .v-tab {
    height: 35px;
    justify-content: left;
    text-transform: unset;
}
.s-tab {
    font-size: 13px;
}
.s-tab i {
    font-size: 16px;
}
.s-item {
    padding-left: 10px;
}
.select-document {
    border: 1px solid #aaa;
}
.select-document >>> .v-input__control {
    min-height: 30px !important;
}
</style>
