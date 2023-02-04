<template>
    <v-combobox
        @keydown="enter"
        class="auto-complete"
        style="border-radius: 4px"
        :hide-no-data="true"
        no-filter
        :items="searchItems"
        :menu-props="{ maxHeight: 300, maxWidth: 330, nudgeBottom: 5 }"
        :search-input.sync="value"
        :label="$t('v2.general2.search')"
    >
        <template v-slot:append>
            <i
                style="font-size: 20px"
                class="v-icon notranslate mdi mdi-magnify theme--light"
            >
            </i>
        </template>
        <template v-slot:item="{ item, attrs }">
            <template v-if="item.group">
                <v-list-item style="margin-top: -10px; margin-bottom: -10px">
                    <v-list-item-content>
                        <v-list-item-title class="item-header">
                            {{ $t('objects.' + item.group) }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>
            <template v-else>
                <v-list-item
                    @mouseleave="hideDotButton(searchItems.indexOf(item))"
                    @mousemove="showDotButton(searchItems.indexOf(item))"
                    class="pl-7 search-menu"
                    :attrs="attrs"
                >
                    <SymperAvatar
                        v-if="item.type == 'account'"
                        style="
                            height: 35px !important;
                            width: 35px !important;
                            margin-left: -5px;
                        "
                        class="mr-4"
                        :userId="item.userId"
                    />
                    <v-list-item-content style="margin-left: -15px">
                        <v-list-item-title
                            v-if="item.type == 'account'"
                            class="item-title"
                        >
                            <span
                                v-if="
                                    item.searchField != undefined &&
                                    item.type != 'account'
                                "
                                v-html="item.searchField"
                            ></span>
                            <span v-else v-html="item.displayName"></span>
                        </v-list-item-title>
                        <v-list-item-title
                            v-else
                            style="margin-left: 0.5rem"
                            class="item-title"
                            v-html="item.displayName"
                        >
                        </v-list-item-title>

                        <v-list-item-subtitle
                            v-if="
                                item.type != 'document_definition' &&
                                item.type != 'workflow_definition' &&
                                item.type != 'account' &&
                                item.type != 'knowledge'
                            "
                            :style="{
                                'margin-left':
                                    item.type === 'account' ? '0' : '0.5rem'
                            }"
                            class="item-subtitle mt-1"
                            v-html="item.searchField"
                        >
                        </v-list-item-subtitle>
                        <v-list-item-title
                            v-else-if="item.type != 'account'"
                            :style="{
                                'margin-left':
                                    item.type === 'account' ? '0' : '0.5rem'
                            }"
                            class="item-subtitle"
                            v-html="item.description"
                        >
                        </v-list-item-title>
                        <v-list-item-title
                            v-else
                            class="item-subtitle"
                            v-html="item.email"
                        >
                        </v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action
                        v-show="item.actions.length > 0"
                        class="dot"
                    >
                        <v-menu bottom offset-y transition="scale-transition">
                            <template v-slot:activator="{ on }">
                                <button v-on="on">
                                    <i
                                        style="
                                            height: 20px !important;
                                            width: 20px !important;
                                        "
                                        class="dot mdi mdi-dots-horizontal"
                                    ></i>
                                </button>
                            </template>
                            <v-list>
                                <v-list-item-title
                                    v-for="(itemsAction, index) in item.actions"
                                    :key="index"
                                    class="
                                        fm
                                        fs-13
                                        mr-1
                                        mt-1
                                        action-button
                                        ml-2
                                    "
                                    style="width: 130px !important"
                                    @click="
                                        gotoPage(
                                            itemsAction,
                                            item.type,
                                            item.id,
                                            item.displayName
                                        )
                                    "
                                >
                                    <div style="cursor: pointer; padding: 4px">
                                        {{
                                            $t(
                                                'objects.listAction.' +
                                                    itemsAction
                                            )
                                        }}
                                    </div>
                                </v-list-item-title>
                            </v-list>
                        </v-menu>
                    </v-list-item-action>
                </v-list-item>
            </template>
        </template>
    </v-combobox>
</template>
<script>
import _debounce from 'lodash/debounce';
import _groupBy from 'lodash/groupBy';
import SymperAvatar from '../../components/common/SymperAvatar';
import searchApi from '../../api/search.js';
export default {
    components: {
        SymperAvatar
    },
    data: function () {
        return {
            value: '',
            menu: [],
            searchItemsAll: [],
            searchItems: [],
            dataResultSearch: [],
            defineAction: {
                document_definition: {
                    module: 'document',
                    resource: 'document_definition',
                    scope: 'document'
                },
                workflow_definition: {
                    module: 'workflow',
                    resource: 'workflow_definition',
                    scope: 'workflow'
                },
                user: {
                    module: 'orgchart',
                    resource: 'orgchart',
                    scope: 'orgchart'
                },
                dataflow: {
                    module: 'bi',
                    resource: 'dataflow',
                    scope: 'bi'
                },
                document_instance: {
                    module: 'document',
                    resource: 'document_instance',
                    scope: 'document'
                },
                orgchart: {
                    module: 'orgchart',
                    resource: 'orgchart',
                    scope: 'orgchart'
                },
                process_definition: {},
                application_deninition: {}
            }
        };
    },
    created: function () {
        this.debouncedGetValueSearch = _debounce(this.getValueSearch, 200);
    },
    watch: {
        value() {
            this.debouncedGetValueSearch();
        }
    },
    methods: {
        enter(event) {
            if (event.code == 'Enter') {
                this.setMenu();
                this.$store.commit('search/setSearch', this.searchItems);
                this.$store.commit('search/setSearchAll', this.searchItemsAll);
                this.$store.commit('search/setShowGeneral', true);
                this.$store.commit(
                    'search/setCountResult',
                    this.searchItems.filter((x) => x.type).length
                );
                this.$router.push('/search/general');
            }
            this.menu = this.searchItemsAll;
            this.searchItems = [];
            this.$store.commit('search/setSearch', this.menu);
        },
        setMenu() {
            let menu = [];
            for (let i = 0; i < this.menu.length; i++) {
                // console.log(this.newSearch[i].group);
                let name = Object.keys(this.menu[i]);
                if (name[0] == 'group') {
                    menu.push(this.menu[i].group);
                }
            }
            this.$store.commit('search/setMenu', menu);
        },
        gotoPage(action, type, id, name) {
            this.defineAction[type].action = action;
            this.$evtBus.$emit(
                'symper-app-call-action-handler',
                this.defineAction[type],
                this,
                { id: id, name: name, title: name }
            );
        },
        showDotButton(id) {
            this.searchItems[id].enable = true;
        },
        hideDotButton(id) {
            this.searchItems[id].enable = true;
        },
        //hiển thị tên của thuộc tính
        getValueSearch() {
            let newVal = this.value;
            // this.debouncedGetAnswer();
            this.searchItems = [];
            this.$store.commit('search/setWordSearch', newVal);
            if (newVal) {
                const self = this;
                if (newVal != '') {
                    searchApi
                        .getData(newVal)
                        .then((res) => {
                            if (res.status === 200) {
                                self.dataResultSearch = res.data;
                                console.log('Đã gửi thành công');
                                // display name, search field, type, avatar (user)
                                const regex = new RegExp(newVal, 'gi');
                                const normalizedData = res.data.map((data) => {
                                    const returnObjSearch = {};
                                    if (data.type == 'application_definition') {
                                        returnObjSearch.iconType =
                                            data.iconType;
                                        returnObjSearch.iconName =
                                            data.iconName;
                                    }
                                    if (data.type === 'account') {
                                        returnObjSearch.displayName =
                                            data.displayName
                                                ? data.displayName
                                                : self.$t(
                                                      'v2.general2.noName'
                                                  );
                                        returnObjSearch.email = data.email;
                                        returnObjSearch.userId = data.id;
                                    } else if (
                                        data.type == 'document_definition'
                                    ) {
                                        returnObjSearch.displayName = data.title
                                            ? data.title
                                            : self.$t(
                                                  'v2.general2.noName'
                                              );
                                        returnObjSearch.description = data.note
                                            ? data.note
                                            : self.$t(
                                                  'v2.general2.emptyDescription'
                                              );
                                    } else if (
                                        data.type == 'document_instance'
                                    ) {
                                        returnObjSearch.displayName =
                                            data.values
                                                ? JSON.parse(data.values)
                                                      .document_name
                                                : self.$t(
                                                      'v2.general2.noName'
                                                  );
                                        //  returnObjSearch.description = data.values?JSON.parse(JSON.parse(data.values).data).mo_ta:'Chưa điền mô tả';
                                        returnObjSearch.description =
                                            returnObjSearch.displayName;
                                    } else if (
                                        data.type == 'workflow_definition' ||
                                        data.type == 'knowledge'
                                    ) {
                                        returnObjSearch.displayName = data.name
                                            ? data.name
                                            : self.$t(
                                                  'v2.general2.noName'
                                              );
                                        returnObjSearch.description =
                                            data.description
                                                ? data.description
                                                : self.$t(
                                                      'v2.general2.emptyDescription'
                                                  );
                                    } else {
                                        returnObjSearch.displayName = data.name
                                            ? data.name
                                            : self.$t(
                                                  'v2.general2.noName'
                                              );
                                    }
                                    const keys = Object.keys(data);
                                    // xử lý bôi cam
                                    for (
                                        let i = 0, len = keys.length;
                                        i < len;
                                        i++
                                    ) {
                                        const key = keys[i];
                                        if (
                                            typeof data[key] === 'string' &&
                                            data[key]
                                                .toLowerCase()
                                                .includes(
                                                    newVal.trim().toLowerCase()
                                                )
                                        ) {
                                            returnObjSearch.searchField = data[
                                                key
                                            ]
                                                .substring(0, 40)
                                                .replace(
                                                    regex,
                                                    (x) =>
                                                        '<span style="color: orange; font-weight: bold">' +
                                                        x +
                                                        '</span>'
                                                );
                                            break;
                                        }
                                    }
                                    returnObjSearch.searchField =
                                        returnObjSearch.searchField != undefined
                                            ? returnObjSearch.searchField.indexOf(
                                                  '{'
                                              ) > -1
                                                ? self.$t(
                                                      'v2.general2.noDescription'
                                                  )
                                                : returnObjSearch.searchField
                                            : undefined;
                                    returnObjSearch.avatar = data.avatar;
                                    returnObjSearch.type = data.type;
                                    returnObjSearch.id = data.id;
                                    returnObjSearch.actions = data.actions;
                                    returnObjSearch.enable = false;
                                    if (
                                        data.type != 'document_definition' &&
                                        data.type != 'workflow_definition' &&
                                        data.type != 'knowledge'
                                    ) {
                                        returnObjSearch.description =
                                            data.description
                                                ? data.description
                                                : data.description == null ||
                                                  data.description == ''
                                                ? self.$t(
                                                      'v2.general2.descriptionBlank'
                                                  )
                                                : 'Symper';
                                    }
                                    if (data.type == 'file') {
                                        !data.source
                                            ? (data.source = 'Chưa có nguồn')
                                            : 'Document';
                                        returnObjSearch.searchField =
                                            self.$t('v2.general2.source') +
                                            (data.objectType
                                                ? data.objectType
                                                : self.$t(
                                                      'v2.general2.blank'
                                                  ));
                                        returnObjSearch.description =
                                            self.$t('v2.general2.source') +
                                            (data.objectType
                                                ? data.objectType
                                                : self.$t(
                                                      'v2.general2.blank'
                                                  ));
                                    }
                                    if (data.type == 'comment') {
                                        returnObjSearch.displayName =
                                            data.content
                                                ? data.content
                                                : self.$t(
                                                      'v2.general2.noContent'
                                                  );
                                        returnObjSearch.searchField =
                                            self.$t('v2.general2.source') +
                                            data.objectType +
                                            self.$t(
                                                'v2.general2.commentDate'
                                            ) +
                                            (data.updatedAt
                                                ? data.updatedAt
                                                : data.createdAt);
                                        returnObjSearch.description =
                                            self.$t('v2.general2.source') +
                                            data.objectType +
                                            self.$t(
                                                'v2.general2.commentDate'
                                            ) +
                                            (data.updatedAt
                                                ? data.updatedAt
                                                : data.createdAt);
                                    }
                                    return returnObjSearch;
                                });
                                const groupByType = _groupBy(
                                    normalizedData,
                                    'type'
                                );
                                const searchData = [];
                                const allData = [];
                                Object.keys(groupByType).forEach((type) => {
                                    let name = type;
                                    searchData.push({ group: name });
                                    allData.push({ group: name });
                                    searchData.push(
                                        ...groupByType[type].slice(0, 3)
                                    );
                                    allData.push(...groupByType[type]);
                                });
                                self.searchItemsAll = allData.filter(
                                    (data) =>
                                        data.type != 'syql' &&
                                        data.group != 'syql'
                                );
                                self.searchItems = searchData.filter(
                                    (data) =>
                                        data.type != 'syql' &&
                                        data.group != 'syql'
                                );
                                self.$store.commit(
                                    'search/setSearch',
                                    self.searchItems
                                );
                                self.$store.commit(
                                    'search/setSearchAll',
                                    allData
                                );
                                self.$store.commit(
                                    'search/setCountResult',
                                    self.searchItems.filter((x) => x.type)
                                        .length
                                );
                                self.$store.commit(
                                    'search/setShowGeneral',
                                    true
                                );
                            }
                        })
                        .catch((err) => {
                            console.log('Đã gửi mà lỗi');
                            console.log(err);
                            this.$store.commit('search/setSearch', []);
                        });
                }
            } else {
                this.$store.commit('search/setSearch', []);
                this.$store.commit('search/setMenu', []);
                this.$store.commit('search/setWordSearch', newVal);
            }
        }
    }
};
</script>
<style scoped>
.item-header {
    font-size: 13px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.6);
}
.item-avatar {
    margin-left: -0.3rem;
    height: 30px !important;
    width: 29px !important;
}
.item-title {
    font-size: 13px;
    margin-left: 0.5rem;
}
.item-subtitle {
    font-size: 11px;
    margin-left: 0.5rem;
    color: rgba(0, 0, 0, 0.4);
}
.auto-complete ::v-deep .v-input__slot {
    background-color: #f7f7f7 !important;
}

.auto-complete ::v-deep .v-label {
    font-size: 13px !important;
    font-family: Roboto !important;
    margin-top: -2px !important;
    padding-left: 10px;
}
.auto-complete ::v-deep .v-input__slot:after {
    border-color: transparent !important;
}

.auto-complete ::v-deep .v-input__slot:before {
    border-color: transparent !important;
}

.auto-complete ::v-deep .v-label--active {
    display: none;
}

.auto-complete ::v-deep .v-select__slot {
    height: 28px;
}

.auto-complete ::v-deep .v-input__icon {
    padding-bottom: 6px !important;
}

.auto-complete ::v-deep .v-select__slot > input {
    padding-top: 12px;
    padding-left: 5px;
}

.auto-complete ::v-deep .v-input__icon > button {
    font-size: 14px !important;
}
.auto-complete {
    margin-top: 0 !important;
    padding-top: 6px !important;
}
.dot {
    color: black;
}
.action-button:hover {
    background: rgba(0, 0, 0, 0.05);
}
.auto-complete ::v-deep .v-list-item:hover {
    background: rgba(0, 0, 0, 0.05);
}
.auto-complete ::v-deep .v-select__slot {
    font-size: 13px;
}
.auto-complete >>> .v-autocomplete__content {
    max-width: 330px !important;
    top: 40px !important;
    z-index: 108;
    min-height: 100px !important;
    background-color: white;
}

.v-list-item:hover {
    background: rgba(0, 0, 0, 0.05);
}
.search-menu {
    margin-top: -10px;
    margin-bottom: -10px;
    margin-left: -5px;
}
</style>
