<template>
    <v-dialog v-model="isShow" width="800">
        <v-card height="550" style="overflow: hidden">
            <v-card-title class="headline">{{ heading }}</v-card-title>
            <v-card-subtitle class="s-subtitle-control">
                {{ subHeadingTitle
                }}<span class="control-name">{{ oldContext }}</span>
            </v-card-subtitle>
            <v-card-text style="height: calc(100% - 112px); overflow: auto">
                <!-- <v-list-item dense v-for="(formulas, index) in listFormulas" :key="index+formulas">
                    <v-list-item-content>
                        <v-list-item-title>{{formulas}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item> -->
                <v-data-table
                    :headers="headers"
                    :items="dataTable"
                    disable-pagination
                    fixed-header
                    hide-default-footer
                    dense
                    calculate-widths
                    :no-data-text="$t('v2.doc.noDataFound')"
                >
                    <template v-slot:item.icon="{ item }">
                        <v-icon>
                            {{ item.icon }}
                        </v-icon>
                    </template>
                    <template v-slot:item.source="{ item }">
                        <div style="width: 100px">
                            <a
                                style="text-decoration: none"
                                target="_blank"
                                :href="item.source.link"
                                >{{ item.source.documentTitle }}</a
                            >
                        </div>
                    </template>
                    <template v-slot:item.position="{ item }">
                        <div style="width: 100px">
                            <div>{{ item.position.fieldTitle }}</div>
                            <div style="opacity: 0.5">
                                {{ item.position.fieldName }}
                            </div>
                        </div>
                    </template>
                </v-data-table>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions class="s-card-actions">
                <s-pagination
                    @on-change-page="getDataWithPage"
                    @on-change-page-size="getDataWithPage"
                    class="pagination"
                    :total="totalRecord"
                />

                <v-spacer></v-spacer>

                <v-btn
                    color="green darken-1"
                    text
                    right
                    @click="checkUpdateFormulas"
                >
                    {{ $t('common.update') }}
                </v-btn>
                <v-btn color="green darken-1" text right @click="hideDialog">
                    {{ $t('common.close') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { formulasApi } from './../../../api/Formulas';
import { documentApi } from './../../../api/Document';
import Pagination from './../../../components/common/Pagination';
export default {
    computed: {
        sDocumentStore() {
            return this.$store.state.document.documentProps[this.instance];
        },
    },
    props: {
        instance: {
            type: Number,
            default: Date.now(),
        },
    },
    components: {
        's-pagination': Pagination,
    },
    data() {
        return {
            isShow: false,
            listFormulas: [],
            oldContext: '',
            newContext: '',
            headers: [
                { text: '', value: 'icon', width: 50 },
                {
                    text: this.$t(
                        'document.editor.dialog.nameRelated.table.position',
                    ),
                    value: 'position',
                },
                {
                    text: this.$t(
                        'document.editor.dialog.nameRelated.table.source',
                    ),
                    value: 'source',
                },
                {
                    text: this.$t(
                        'document.editor.dialog.nameRelated.table.formulas',
                    ),
                    value: 'formulas',
                },
            ],
            dataTable: [],
            mapIcon: { field: 'mdi-flip-horizontal' },
            listFormulas: [],
            heading: '',
            subHeadingTitle: '',
            type: '',
            totalRecord: 0,
            dataPageSize: {},
        };
    },

    methods: {
        setHeadingTitle(str) {
            this.heading = str;
        },
        setSubHeadingTitle(str) {
            this.subHeadingTitle = str;
        },
        showDialog() {
            this.isShow = true;
        },
        hideDialog() {
            this.$emit('after-close-panel', this.type, this.newContext);
            this.isShow = false;
        },
        getDataWithPage(data) {
            this.dataPageSize = data;
            this.getDataRelated(this.type, this.oldContext, this.newContext);
        },
        getDataRelated(type, fieldName = '', newFieldName = '') {
            this.type = type;
            let thisCpn = this;
            let dataPost = {};
            if (type == 'control') {
                this.oldContext = fieldName;
                this.newContext = newFieldName;
                dataPost = {
                    fieldName: this.oldContext,
                    documentName: this.sDocumentStore.name.value,
                };
            } else {
                this.oldContext = this.sDocumentStore.name.oldName;
                this.newContext = this.sDocumentStore.name.value;
                dataPost = { documentName: this.sDocumentStore.name.oldName };
            }
            dataPost = Object.assign(this.dataPageSize, dataPost);
            formulasApi
                .getRelated(dataPost)
                .then((res) => {
                    if (res.status == 200) {
                        thisCpn.dataTable = [];
                        let data = res.data;
                        if (data != false) {
                            thisCpn.handleData(data.data);
                            thisCpn.totalRecord = parseInt(data.total);
                        }
                    }
                })
                .finally(() => {})
                .catch({});
        },

        handleData(data) {
            let thisCpn = this;
            let listDocName = data.reduce((newArr, obj) => {
                if (obj.context != null && obj.object_type == 'field') {
                    let o = {
                        docName: obj.context,
                        fieldName: obj.object_identifier,
                    };
                    newArr.push(o);
                }
                return newArr;
            }, []);
            documentApi
                .getBatchFieldInfoInDoc({
                    listObject: JSON.stringify(listDocName),
                })
                .then((res) => {
                    if (res.status == 200) {
                        let dataRes = res.data;
                        thisCpn.setDataTable(data, dataRes);
                    } else {
                        thisCpn.setDataTable(data);
                    }
                })
                .finally({})
                .catch({});
        },
        setDataTable(data, dataRes = []) {
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                let curObj = dataRes.filter((c) => {
                    return (
                        c.documentname == element.context &&
                        c.fieldname == element.object_identifier
                    );
                });
                if (curObj.length > 0) {
                    Object.assign(data[index], curObj[0]);
                }
                let icon =
                    this.mapIcon[data[index].object_type] != undefined
                        ? this.mapIcon[data[index].object_type]
                        : 'mdi-cog-outline';
                let item = {
                    icon: icon,
                    position: {
                        fieldName: data[index].fieldname,
                        fieldTitle: data[index].fieldtitle,
                    },
                    source: {
                        documentTitle: data[index].documenttitle,
                        documentName: data[index].documentname,
                        link:
                            window.location.origin +
                            '#/document/editor/' +
                            data[index].id,
                    },
                    formulas: data[index].last_content,
                };
                let itemFormulas = {};
                let id = data[index].id;
                itemFormulas[id] = data[index].last_content;
                this.listFormulas.push(itemFormulas);
                this.dataTable.push(item);
            }
        },
        checkUpdateFormulas() {
            let dataUpdate = {};
            for (let index = 0; index < this.listFormulas.length; index++) {
                const element = this.listFormulas[index];
                let id = Object.keys(element)[0];
                let f = Object.values(element)[0];
                let newFormulas = this.detectControlChangeInFormulas(f);
                dataUpdate['s-' + index] = [
                    { data: { syql: newFormulas, id: id } },
                ];
            }
            formulasApi
                .updateMultiFormulas(JSON.stringify(dataUpdate))
                .then((res) => {
                    this.$snotify({
                        type: 'success',
                        title: this.$t('v2.doc.updateSuccess'),
                    });
                })
                .finally({})
                .catch({});
        },

        detectControlChangeInFormulas(formulas) {
            let regex = new RegExp('\\b(?:' + this.oldContext + ')\\b', 'gm');
            let newFormulas = formulas.replace(regex, this.newContext);
            return newFormulas;
        },
    },
    mounted() {},
};
</script>
<style scoped>
.s-subtitle-control .control-name {
    font-weight: 600;
}
.s-subtitle-control {
    font-size: 13px;
    padding: 14px 0px 0px 24px !important;
}
.headline {
    padding: 8px 0px 0px 24px !important;
}
.pagination {
    margin-left: 12px;
}
.s-card-actions {
    padding: 8px !important;
}
</style>
