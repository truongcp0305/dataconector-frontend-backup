<template>
    <div class="ml-4 mr-3 mt-3 show-error-import">
        <div class="mb-1">
            <span class="ml-3 mt-3 fs-15" style="font-weight: 430px">
                {{$t('v2.importExport.import')}}
                <span
                    style="color: orange"
                    v-if="importInfo.status == this.$t('v2.importExport.notImport')"
                >
                    {{ importInfo.status }}
                </span>
                <span
                    style="color: blue"
                    v-if="importInfo.status == this.$t('v2.importExport.processing')"
                >
                    {{ importInfo.status }}
                </span>
                <span
                    style="color: green"
                    v-if="importInfo.status == this.$t('v2.importExport.finished')"
                >
                    {{ importInfo.status }}
                </span>
                <span style="color: red" v-if="importInfo.status == this.$t('v2.importExport.err')">
                    {{ importInfo.status }}
                </span>
            </span>
        </div>
        <div class="mb-1">
            <span class="ml-3 mt-3 fs-13">{{$t('v2.importExport.objName')}} </span>
            <span class="ml-3 mt-3 fs-13" style="color: grey"
                >{{ importInfo.objId }}
            </span>
        </div>
        <div class="mb-1">
            <span class="ml-3 mt-3 fs-13">{{$t('v2.importExport.content')}} </span>
            <span class="ml-3 mt-3 fs-13" style="color: grey"
                >{{ importInfo.nameImport }}
            </span>
        </div>
        <div>
            <span class="ml-3 mt-3 fs-13">{{$t('v2.importExport.note')}} </span>
            <span class="ml-3 mt-3 fs-13" style="color: grey"
                >{{ importInfo.description }}
            </span>
        </div>
        <div class="mb-1">
            <span class="ml-3 mt-3 fs-13">{{$t('v2.importExport.detailInformation')}} </span>
            <span class="ml-3 mt-3 fs-13" style="color: grey">
                {{ importInfo.fileName }}</span
            >
        </div>
        <div class="mb-1">
            <div v-if="importInfo.status == this.$t('v2.importExport.processing')" class="fs-13 ml-3">
                {{$t('v2.importExport.stopImportExcel')}}
            </div>
        </div>
        <div class="mb-1">
            <div v-if="importInfo.status == this.$t('v2.importExport.processing')">
                <v-btn
                    small
                    color="primary"
                    class="mt-4 ml-3"
                    @click="stopImport()"
                    >{{$t('v2.importExport.stop')}}</v-btn
                >
            </div>
            <v-data-table
                v-if="errorImport && errorImport.validating.errors.length > 0"
                dense
                :headers="headers"
                :items="dataImport"
            >
            </v-data-table>
        </div>
    </div>
</template>
<script>
import { documentApi } from './../../api/Document';
import importApi from './../../api/ImportExcel';

export default {
    props: ['importInfo'],
    computed: {
        sapp() {
            return this.$store.state.app;
        },
        errorImport() {
            return JSON.parse(this.importInfo.infoImport);
        },
        headers() {
            return [
                {
                    text: this.$t('v2.importExport.serialNumber'),
                    align: 'start',
                    sortable: false,
                    value: 'stt',
                },
                {
                    text: this.$t('v2.importExport.row'),
                    value: 'row',
                },
                {
                    text: this.$t('v2.importExport.value'),
                    value: 'value',
                },
                { text: this.$t('v2.importExport.sheet'), value: 'sheet' },
                { text: this.$t('v2.importExport.status'), value: 'status' },
            ];
        },
    },

    data() {
        return {
            nameDocument: '',
            dataImport: [],
        };
    },
    created() {
        this.getDetailDocument();
    },
    watch: {
        importInfo() {
            this.getDetailDocument();
            this.pushImportDataToTable();
        },
    },
    methods: {
        stopImport() {
            importApi
                .cancelImport(this.importInfo.fileName)
                .then((res) => {
                    if (res.status === 200) {
                    }
                })
                .catch(console.log);
        },
        async getDetailDocument() {
            let self = this;
            let id = self.importInfo.id;
            let docInfo = await documentApi.detailDocument(id);
            if (docInfo.status == 200) {
                this.nameDocument = docInfo.name;
            }
        },
        pushImportDataToTable() {
            this.dataImport = [];
            let dataImport = JSON.parse(this.importInfo.infoImport).validating
                ? JSON.parse(this.importInfo.infoImport).validating.errors
                : '';
            let dem = 0;
            for (let i = 0; i < dataImport.length; i++) {
                for (let j = 0; j < dataImport[i].errors.length; j++) {
                    for (
                        let k = 0;
                        k < dataImport[i].errors[j].info.length;
                        k++
                    ) {
                        this.dataImport.push({
                            stt: dem + 1,
                            row: dataImport[i].errors[j].info[k].row,
                            sheet: dataImport[i].sheet,
                            status:
                                dataImport[i].errors[j].type ==
                                'invalidDataType'
                                    ? this.$t('v2.importExport.invalidDataType')
                                    : dataImport[i].errors[j].type,
                            value: dataImport[i].errors[j].info[k].value,
                        });
                        dem++;
                    }
                }
            }
        },
    },
};
</script>
<style scoped>
.show-error-import ::v-deep .text-start {
    font-size: 13px !important;
}
</style>
