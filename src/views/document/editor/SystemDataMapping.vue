<template>
    <div>
        <v-checkbox
            class="checkbox-system-mapping"
            v-model="checkedMapping"
            :label="$t('document.editor.dialog.saveDoc.systemMapping.title')"
            hide-details
        ></v-checkbox>
        <transition name="fade" mode="out-in">
            <div class="list-mapping-object" v-if="checkedMapping">
                <div
                    class="mapping-object-item"
                    v-for="(mappingItem, index) in listMapping"
                    :key="index"
                >
                    <div class="mapping-object-item__title">
                        <p>
                            {{
                                $t(
                                    'document.editor.dialog.saveDoc.systemMapping.itemTitle',
                                )
                            }}
                        </p>
                        <v-icon
                            v-if="listMapping.length > 1"
                            @click="deleteMappingItem(index)"
                            >mdi-close</v-icon
                        >
                    </div>
                    <v-select
                        :items="listObjectMapping"
                        v-model="mappingItem.objectType"
                        @change="onChangeSelectedObject(mappingItem)"
                        hide-details
                        hide-selected
                        return-object
                        item-text="title"
                        item-value="name"
                        flat
                        solo
                        dense
                        :no-data-text="$t('common.have_no_data')"
                        class="sym-style-input sym-small-size"
                    ></v-select>
                    <p>
                        {{
                            $t(
                                'document.editor.dialog.saveDoc.systemMapping.condition',
                            )
                        }}
                    </p>
                    <div class="condition-mapping">
                        <div class="doc-condition">
                            <span>{{
                                $t(
                                    'document.editor.dialog.saveDoc.systemMapping.conditionDoc',
                                )
                            }}</span>
                            <v-select
                                :items="allControl"
                                v-model="mappingItem.controlIdentifier"
                                return-object
                                item-text="title"
                                item-value="name"
                                hide-details
                                hide-selected
                                flat
                                solo
                                dense
                                :no-data-text="$t('common.have_no_data')"
                                class="sym-style-input sym-small-size"
                            ></v-select>
                        </div>
                        <div class="system-object-condition">
                            <span>{{
                                $t(
                                    'document.editor.dialog.saveDoc.systemMapping.conditionSystem',
                                )
                            }}</span>
                            <v-select
                                :items="
                                    mappingItem.systemObjectIdentifier.options
                                "
                                v-model="
                                    mappingItem.systemObjectIdentifier.selected
                                "
                                @click="onClickObjectIdentifier(mappingItem)"
                                hide-details
                                hide-selected
                                dense
                                return-object
                                item-text="title"
                                item-value="name"
                                flat
                                solo
                                :no-data-text="$t('common.have_no_data')"
                                class="sym-style-input sym-small-size"
                            ></v-select>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <v-btn
            v-if="checkedMapping"
            @click="addMapping"
            color="green darken-1 "
            text
            class="add-system-mapping-btn"
            right
        >
            {{ $t('common.add') }}
        </v-btn>
    </div>
</template>
<script>
import { accessControlApi } from '@/api/accessControl';
import { systemDataMappingApi } from '@/api/systemDataMapping';
import { listControlNotNameProp } from '@/components/document/controlPropsFactory.js';

import Api from '@/api/api.js';
import { util } from '../../../plugins/util';
export default {
    props: {
        instance: {
            type: Number,
        },
    },
    computed: {
        editorStore() {
            return this.$store.state.document.editor[this.instance];
        },
    },
    data() {
        return {
            checkedMapping: false,
            listObjectMapping: [],
            objectSelected: null,
            systemObjectSelected: null,
            controlSelected: null,
            allControl: [],
            allObjectIdentifier: [],
            listMapping: [
                {
                    objectType: {},
                    controlIdentifier: {},
                    systemObjectIdentifier: { selected: null, options: [] },
                    isNew: true,
                },
            ],
            cacheDataObject: {},
        };
    },
    created() {
        let self = this;
        accessControlApi.getAllTypeAction().then((res) => {
            // call api lấy danh sách đối tượng
            let data = res.data;
            for (let typeAction in data) {
                let typeActionDetail = data[typeAction];
                self.listObjectMapping.push({
                    name: typeAction,
                    title: typeActionDetail.name,
                    ownerDomain: typeActionDetail.ownerDomain,
                });
            }
        });
        let allControl = this.editorStore.allControl;
        for (let controlId in allControl) {
            // lấy danh sách control trong document
            let controlObject = allControl[controlId];
            if (
                !listControlNotNameProp.includes(controlObject.type) &&
                controlObject.type != 'table'
            ) {
                this.allControl.push({
                    name: controlObject.properties.name.value,
                    title: controlObject.properties.title.value,
                    id: controlId,
                });
            }
        }
        this.$evtBus.$on('save-document-successful', (data) => {
            if (this._inactive == true) return;
            if (data.type == 'create') {
                this.saveMapping(data.documentId);
            }
        });
        if (this.$getRouteName() == 'editDocument') {
            let documentId = this.$route.params.id;
            systemDataMappingApi.getByDoc(documentId).then((res) => {
                // call api lấy danh sách đối tượng
                let data = res.data;
                if (data && data.length > 0) {
                    self.checkedMapping = true;
                    self.listMapping = [];
                    for (let index = 0; index < data.length; index++) {
                        let mapObject = data[index];
                        let objectType = JSON.parse(mapObject.object_type);
                        let controlIdentifier = this.allControl.filter((c) => {
                            return c.id == mapObject.field_id;
                        });
                        let objectIdentifier = JSON.parse(
                            mapObject.object_identifier,
                        );
                        self.listMapping.push({
                            id: mapObject.id,
                            objectType: objectType,
                            controlIdentifier: controlIdentifier[0],
                            systemObjectIdentifier: {
                                selected: objectIdentifier.selected,
                                options: [objectIdentifier.selected],
                            },
                        });
                    }
                }
            });
        }
    },
    methods: {
        onClickObjectIdentifier(mapItem) {
            this.onChangeSelectedObject(mapItem);
        },
        addMapping() {
            this.listMapping.push({
                objectType: {},
                controlIdentifier: {},
                systemObjectIdentifier: { selected: null, options: [] },
                isNew: true,
            });
        },
        deleteMappingItem(index) {
            if (this.listMapping.length == 1) {
                return;
            }
            if (this.listMapping[index].id) {
                systemDataMappingApi
                    .delete(this.listMapping[index].id)
                    .then((res) => {})
                    .finally({})
                    .catch({});
            }
            this.listMapping.splice(index, 1);
        },
        deleteMappingInDoc(documentId) {
            systemDataMappingApi
                .deleteInDoc(documentId)
                .then((res) => {})
                .finally({})
                .catch({});
        },
        /**
         * Thay đổi kiểu đối tượng thì gọi lại api lấy dánh sách các column của object hệ thống
         */
        onChangeSelectedObject(mappingItem) {
            if (
                !['account', 'department'].includes(mappingItem.objectType.name)
            ) {
                mappingItem.systemObjectIdentifier.options = [];
                return;
            }
            if (this.cacheDataObject[mappingItem.objectType.name]) {
                // nếu có dữ liệu trong cache rồi thì lấy ra
                mappingItem.systemObjectIdentifier.options =
                    this.cacheDataObject[mappingItem.objectType.name];
                return;
            }
            let self = this;
            let domain = mappingItem.objectType.ownerDomain;
            let api = new Api(util.addEnvToUrl('https://' + domain));
            api.get('/object/' + mappingItem.objectType.name).then((res) => {
                let data = res.data;
                for (let columnName in data) {
                    let columnObject = data[columnName];
                    mappingItem.systemObjectIdentifier.options.push({
                        title: columnName,
                        name: columnObject.name,
                    });
                }
                self.cacheDataObject[mappingItem.objectType.name] =
                    mappingItem.systemObjectIdentifier.options;
            });
        },
        saveMapping(documentId, newMappings = []) {
            if (this.checkedMapping) {
                let listMap = this.listMapping;
                if (newMappings.length > 0) {
                    listMap = newMappings;
                }
                listMap = this.reduceData(listMap);
                systemDataMappingApi
                    .saveBatch({
                        values: JSON.stringify(listMap),
                        documentId: documentId,
                    })
                    .then((res) => {})
                    .finally({})
                    .catch({});
            }
        },
        editMapping(documentId) {
            if (this.checkedMapping) {
                let newMapping = this.listMapping.filter((mp) => {
                    return mp.isNew === true;
                });
                let curMapping = this.listMapping.filter((mp) => {
                    return mp.isNew !== true;
                });
                if (newMapping.length > 0) {
                    this.saveMapping(documentId, newMapping);
                }
                if (curMapping.length > 0) {
                    let listMap = this.reduceData(curMapping);
                    systemDataMappingApi
                        .editBatch({
                            values: JSON.stringify(listMap),
                            documentId: documentId,
                        })
                        .then((res) => {})
                        .finally({})
                        .catch({});
                }
            } else {
                this.deleteMappingInDoc(documentId);
            }
        },
        reduceData(allMapping) {
            let listMap = allMapping.reduce((arr, obj) => {
                let newObj = obj;
                delete newObj.systemObjectIdentifier.options;
                arr.push(newObj);
                return arr;
            }, []);
            return listMap;
        },
    },
};
</script>

<style scoped>
.checkbox-system-mapping >>> .v-input--selection-controls__input {
    margin-right: 4px !important;
}
.checkbox-system-mapping >>> .v-icon {
    font-size: 15px !important;
}
.checkbox-system-mapping >>> .v-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--symper-text-color-default);
}
.mapping-object-item__title {
    display: flex;
    margin-bottom: 4px;
}
.mapping-object-item__title p {
    font-size: 12px;
}
.mapping-object-item__title .v-icon {
    margin-left: auto;
    font-size: 18px;
}
.mapping-object-item {
    padding: 4px 8px 8px 8px;
    border: var(--symper-border);
    color: var(--symper-text-color-default);
    margin-bottom: 8px;
}
.condition-mapping {
    font-size: 12px;
    margin-top: 4px;
    display: flex;
}
.mapping-object-item > p {
    font-weight: 500;
    padding-top: 4px;
}
.system-object-condition {
    width: 45%;
    margin-left: auto;
}
.doc-condition {
    width: 45%;
}
.doc-condition span,
.system-object-condition span {
    display: inline-block;
    margin-bottom: 2px;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
.add-system-mapping-btn {
    font-size: 12px;
    padding: 0 8px !important;
    height: 25px !important;
    float: right;
    margin-top: 8px;
}
</style>
