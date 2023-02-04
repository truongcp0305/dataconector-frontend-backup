<template>
    <div width="500px" style="padding: 10px" class="search-modal">
        <v-text-field
            :label="$t('apps.search')"
            single-line
            solo
            append-icon="mdi-magnify"
            v-model="myValue"
        ></v-text-field>
        <VuePerfectScrollbar :style="{ height: menuItemsHeight }">
            <div class="app-item" v-for="(itemT, i) in listItems" :key="i">
                <div class="title-app">
                    <v-icon>{{ itemT.icon }}</v-icon>
                    <h4>{{ itemT.title }}</h4>
                </div>
                <ul
                    class="app-child-item"
                    v-for="(childItem, i) in itemT.item"
                    :key="i"
                    @click="clickItem(childItem, itemT.name)"
                >
                    <li>
                        <div style="position: relative">
                            <v-tooltip
                                bottom
                                v-if="
                                    itemT.name == 'document_category' ||
                                    itemT.name == 'document_major'
                                "
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <div
                                        class="title-document"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <span>{{ childItem.title }}</span>
                                        <span
                                            style="font: 10px; opacity: 0.4"
                                            >{{ childItem.name }}</span
                                        >
                                    </div>
                                </template>
                                <span style="font: 13px roboto">{{
                                    childItem.title
                                }}</span>
                                <span style="font: 8px; opacity: 0.4">{{
                                    childItem.name
                                }}</span>
                            </v-tooltip>
                            <div v-else>{{ childItem.name }}</div>
                            <v-icon
                                v-if="childItem.active == true"
                                style="position: absolute; top: 0px; right: 0px"
                                >mdi-check</v-icon
                            >
                        </div>
                    </li>
                </ul>
            </div>
        </VuePerfectScrollbar>
    </div>
</template>
<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import ApplicationWorker from 'worker-loader!@/worker/application/Application.Worker.js';
var delayTimer;
let self = this;
export default {
    data: function () {
        return {
            myValue: '',
            menuItemsHeight: '450px',
            applicationWorker: null,
            listItems: {
                document_category: {
                    icon: 'mdi-file-document-outline',
                    title: this.$t('apps.listType.documentCategory'),
                    name: 'document_category',
                    item: []
                },
                document_major: {
                    icon: 'mdi-file-edit-outline',
                    title: this.$t('apps.listType.documentMajor'),
                    name: 'document_major',
                    item: []
                },
                orgchart: {
                    icon: 'mdi-widgets-outline',
                    title: this.$t('apps.listType.orgchart'),
                    name: 'orgchart',
                    item: []
                },
                dashboard: {
                    icon: 'mdi-view-dashboard',
                    title: this.$t('apps.listType.dashboard'),
                    name: 'dashboard',
                    item: []
                },
                workflow_definition: {
                    icon: 'mdi-lan',
                    title: this.$t('apps.listType.workflow'),
                    name: 'workflow_definition',
                    item: []
                }
            }
        };
    },
    components: {
        VuePerfectScrollbar
    },
    computed: {
        sAppManagement() {
            return this.$store.state.appConfig.listItemSelected;
        }
    },
    created() {
        this.applicationWorker = new ApplicationWorker();
        this.getListSearch('');
        let self = this;
        this.applicationWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'search':
                    for (let i in data.dataAfter) {
                        self.checkChildrenItem(
                            data.dataAfter[i],
                            self.sAppManagement[i].item
                        );
                        self.listItems[i].item = data.dataAfter[i];
                    }
                    break;
                default:
                    break;
            }
        });
    },
    methods: {
        clearSelectedItem() {
            for (let i in this.listItems) {
                for (let j in this.listItems[i].item) {
                    this.listItems[i].item[j].active = false;
                }
            }
        },
        setActiveItem(sApp) {
            for (let i in this.listItems) {
                for (let k in sApp[i].item) {
                    for (let j in this.listItems[i].item) {
                        if (
                            this.listItems[i].item[j].id == sApp[i].item[k].id
                        ) {
                            this.listItems[i].item[j].active = true;
                        }
                    }
                }
            }
        },
        clickItem(obj, type) {
            obj.active = !obj.active;
            this.$store.commit('appConfig/updateListItemSelected', {
                obj: obj,
                type: type
            });
        },
        doSearch(val, time) {
            clearTimeout(delayTimer);
            let self = this;
            delayTimer = setTimeout(function () {
                self.getListSearch(val);
            }, time);
        },
        checkChildrenItem(resData, storeData) {
            if (resData.length > 0) {
                resData.forEach(function (e) {
                    e.active = false;
                    if (storeData.length > 0) {
                        storeData.forEach(function (f) {
                            if (e.id == f.id) {
                                e.active = true;
                            }
                        });
                    }
                });
            }
            return resData;
        },
        getListSearch(value) {
            let self = this;
            for (let i in this.listItems) {
                this.listItems[i].item = [];
            }
            this.applicationWorker.postMessage({
                action: 'search',
                data: {
                    value: value
                }
            });
        }
    },
    watch: {
        myValue: function (val) {
            this.doSearch(val, 500);
        }
    }
};
</script>

<style scoped>
.search-modal {
    font: 13px roboto;
}
.search-modal >>> .v-input__control {
    box-shadow: unset;
    text-shadow: unset;
}
.search-modal >>> .v-input__control .v-input__slot {
    background-color: #f7f7f7;
    min-height: unset;
    height: 36px;
    box-shadow: unset !important;
}
.search-modal >>> .v-input__control .v-icon {
    font-size: 13px;
}
.search-modal >>> .v-input__control .v-text-field__details {
    display: none;
}
.search-modal >>> .app-item ul {
    list-style: none;
}
.search-modal >>> .app-item .title-app {
    display: flex;
    cursor: pointer;
    padding: 10px 0px;
}
.search-modal >>> .app-item .title-app .v-icon {
    font-size: 13px;
}
.search-modal >>> .app-item .title-app h4 {
    padding-left: 10px;
    font-weight: 500;
}
.search-modal >>> .app-item .app-child-item .v-icon {
    font-size: 13px;
    float: right;
    padding-top: 2px;
    color: green;
}
.search-modal >>> .app-item .app-child-item .title-document {
    white-space: nowrap;
    width: 480px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.search-modal >>> .app-item li {
    cursor: pointer;
    padding: 8px 8px;
    margin-right: 6px;
    margin-left: -10px;
}
.search-modal >>> .app-item li:hover {
    background-color: #f7f7f7;
    border-radius: 5px;
}
</style>
