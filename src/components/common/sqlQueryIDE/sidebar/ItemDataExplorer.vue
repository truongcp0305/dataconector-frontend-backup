<template>
    <v-list-item-group class="p-0 me-1">
        <!-- View -->
        <v-hover v-slot:default="{ hover }">
            <v-list-item
                class="py-0 ps-6 m-0 black--text"
                dense
                @click="showColumn(tableParent.name, tableParent.id, 'view')"
            >
                <v-list-item-content class="pt-1 pb-0">
                    <v-list-item-title>
                        <v-icon dense color="#626262" class="me-2"
                            >mdi-set-merge</v-icon
                        >
                        <span class="body-2">{{ tableParent.name }}</span>
                    </v-list-item-title>
                </v-list-item-content>
                <v-list-item-icon dense v-show="hover" class="pt-2 m-0">
                    <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon dense v-bind="attrs" v-on="on" @click.stop>
                                mdi-information-outline
                            </v-icon>
                        </template>
                        <v-list subheader dense>
                            <v-subheader>{{
                                $t('sqlQueryIDE.informationDataset')
                            }}</v-subheader>
                            <v-list-item dense>
                                <v-list-item-title
                                    class="caption font-weight-regular"
                                >
                                    <span class="me-6"
                                        >{{ $t('common.name') }}:</span
                                    >{{ tableParent.name }}
                                </v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title
                                    class="caption font-weight-regular"
                                >
                                    <span class="me-4"
                                        >{{ $t('common.type') }}:</span
                                    >
                                    View
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-list-item-icon>
            </v-list-item>
        </v-hover>
        <template v-for="item in listTable">
            <v-hover v-slot:default="{ hover }">
                <v-list-item
                    class="py-0 ps-6 black--text"
                    :key="item.id"
                    dense
                    @click="
                        showColumn(
                            item.name,
                            tableParent.id,
                            'viewChild',
                            item.id,
                        )
                    "
                >
                    <v-list-item-content class="pt-1 pb-0">
                        <v-list-item-title>
                            <v-icon dense color="#626262" class="me-2"
                                >mdi-set-merge</v-icon
                            >
                            <span class="body-2"
                                >{{ tableParent.name }}_{{ item.name }}</span
                            >
                        </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon class="pt-2 m-0" v-show="hover">
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                    dense
                                    v-bind="attrs"
                                    v-on="on"
                                    v-on:click.stop
                                >
                                    mdi-information-outline
                                </v-icon>
                            </template>
                            <v-list subheader dense>
                                <v-subheader>{{
                                    $t('sqlQueryIDE.informationDataset')
                                }}</v-subheader>
                                <v-list-item dense>
                                    <v-list-item-title
                                        class="caption font-weight-regular"
                                    >
                                        <span class="me-6"
                                            >{{ $t('common.name') }}:</span
                                        >{{ item.name }}
                                    </v-list-item-title>
                                </v-list-item>
                                <v-list-item>
                                    <v-list-item-title
                                        class="caption font-weight-regular"
                                    >
                                        <span class="me-4"
                                            >{{ $t('common.type') }}:</span
                                        >
                                        View
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-list-item-icon>
                </v-list-item>
            </v-hover>
        </template>
        <!-- View end -->

        <!-- Document -->
        <v-hover v-slot:default="{ hover }">
            <v-list-item
                class="py-0 ps-6 black--text"
                dense
                @click="
                    showColumn(tableParent.name, tableParent.id, 'docParent')
                "
            >
                <v-list-item-content class="pt-1 pb-0">
                    <v-list-item-title>
                        <v-icon dense color="#626262" class="me-2"
                            >mdi-table-large</v-icon
                        >
                        <span class="body-2">{{ tableParent.tableName }}</span>
                    </v-list-item-title>
                </v-list-item-content>
                <v-list-item-icon class="pt-2 m-0" v-show="hover">
                    <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                dense
                                v-bind="attrs"
                                v-on="on"
                                v-on:click.stop
                            >
                                mdi-information-outline
                            </v-icon>
                        </template>
                        <v-list subheader dense>
                            <v-subheader>{{
                                $t('sqlQueryIDE.informationDataset')
                            }}</v-subheader>
                            <v-list-item dense>
                                <v-list-item-title
                                    class="caption font-weight-regular"
                                >
                                    <span class="me-6"
                                        >{{ $t('common.name') }}:</span
                                    >{{ tableParent.name }}
                                </v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title
                                    class="caption font-weight-regular"
                                >
                                    <span class="me-4"
                                        >{{ $t('common.type') }}:</span
                                    >
                                    {{ tableParent.type }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-list-item-icon>
            </v-list-item>
        </v-hover>
        <template v-for="item in listTable">
            <v-hover v-slot:default="{ hover }">
                <v-list-item
                    class="py-0 ps-6 m-0 black--text"
                    :key="item.id"
                    dense
                    @click="showColumn(item.name, item.id, 'doc')"
                >
                    <v-list-item-content class="pt-1 pb-0">
                        <v-list-item-title>
                            <v-icon dense color="#626262" class="me-2"
                                >mdi-table-large</v-icon
                            >
                            <span class="body-2">{{ item.tableName }}</span>
                        </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-icon class="pt-2 m-0" v-show="hover">
                        <v-menu offset-y>
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                    dense
                                    v-bind="attrs"
                                    v-on="on"
                                    v-on:click.stop
                                >
                                    mdi-information-outline
                                </v-icon>
                            </template>
                            <v-list subheader dense>
                                <v-subheader>{{
                                    $t('sqlQueryIDE.informationDataset')
                                }}</v-subheader>
                                <v-list-item dense>
                                    <v-list-item-title
                                        class="caption font-weight-regular"
                                    >
                                        <span class="me-6"
                                            >{{ $t('common.name') }}:</span
                                        >{{ item.name }}
                                    </v-list-item-title>
                                </v-list-item>
                                <v-list-item>
                                    <v-list-item-title
                                        class="caption font-weight-regular"
                                    >
                                        <span class="me-4"
                                            >{{ $t('common.type') }}:</span
                                        >
                                        {{ item.type }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-list-item-icon>
                </v-list-item>
            </v-hover>
        </template>
        <!-- Document end -->
    </v-list-item-group>
</template>

<script>
import { datasetApi } from '@/api/dataset.js';

export default {
    props: {
        tableParent: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            listTable: [],
        };
    },
    mounted() {
        const self = this;
        const h = [this.tableParent.symperId];
        let filter = {
            filter: [
                {
                    column: 'idParent',
                    operation: 'and',
                    conditions: [
                        {
                            name: 'in',
                            value: h,
                        },
                    ],
                },
            ],
        };
        datasetApi.getListByFilter(filter).then((res) => {
            if (res.status == 200) {
                self.listTable = res.data.listObject;
            }
        });
    },
    methods: {
        showColumn(name, id, type, childId = '') {
            let data = {
                tableId: id,
                tableType: type,
                tableParentAliasName: this.tableParent.aliasName,
                tableParentName: this.tableParent.name,
                tableChildName: name,
                tableChildId: childId,
            };
            this.$emit('get-column', data);
        },
    },
};
</script>

<style scoped>
button:hover {
    background: none !important;
}
</style>
