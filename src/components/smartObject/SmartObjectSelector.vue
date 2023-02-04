<template>
    <div>
        <div class="object-selector">
            <div class="mb-2 mt-1">
                {{ $t('smartObject.selector.select_object') }}
            </div>
            <v-autocomplete
                v-model="listObjectSelected"
                :items="listObject"
                :search-input.sync="searchKey"
                :multiple="true"
                no-filter
                solo
                item-value="id"
                :placeholder="$t('smartObject.selector.select_object_placeholder')"
                item-text="id"
                return-object
                append-icon="mdi-chevron-down"
                :disabled="disable"
            >
                <template v-slot:item="data">
                    <div class="d-flex flex-column mt-1">
                        <div class="d-flex">
                            <v-icon x-small>
                                {{
                                    data.item.type == 'orgchart'
                                        ? 'mdi-sitemap-outline'
                                        : 'mdi-file-document-multiple-outline'
                                }}
                            </v-icon>
                            <span class="fs-13 ml-2" v-if=" data.item.id">
                                {{
                                    data.item.name
                                    ? data.item.name
                                    : ''
                                }}
                            </span>
                        </div>
                        <div
                            class="fs-13 title-object"
                            v-if="data.item.title"
                            style="opacity: 0.5"
                        >
                            {{ data.item.id + ' - ' + data.item.title }}
                        </div>
                    </div>
                </template>
            </v-autocomplete>
        </div>
        <VuePerfectScrollbar
            class="mt-2 ml-3"
            v-if="listObjectSelected.length > 0"
        >
            <div 
            v-for="(item, i) in listObjectSelected"
            :key="i"
            >
                <div :title="item.aliasName" style="position: relative; width: 95%">
                    <v-icon x-small style="top: -8px;">
                        {{
                            item.type == 'orgchart'
                                ? 'mdi-sitemap-outline'
                                : 'mdi-file-document-multiple-outline'
                        }}
                    </v-icon>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <span
                                v-bind="attrs"
                                v-on="on"
                                class="object-name ml-1 mt-1"
                                v-if="item.title"
                                >{{ item.name + ' - ' + item.title  }}
                            </span>
                            <span
                                v-bind="attrs"
                                v-on="on"
                                class="object-name ml-1 mt-1"
                                v-else
                                >{{item.name}}
                            </span>
                        </template>
                        <span v-if="item.title">{{ item.name + ' - ' + item.title  }}</span>
                        <span v-else>{{ item.name }}</span>
                    </v-tooltip>
                    <v-icon
                        @click="handleRemoveObject(item)"
                        class="icon-remove-item"
                        small
                        :disabled="disable"
                        >mdi-close</v-icon
                    >
                </div>
            </div>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import _debounce from 'lodash/debounce';
export default {
    name: 'SmartObjectSelector',
    components: {
        VuePerfectScrollbar
    },
    data() {
        return {
            listObjectSelected: [],
            searchKey: null,
        };
    },
    computed: {},
    created() {},
    props: {
        listObject: {
            type: Array,
            default: []
        },
        disable: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        searchKey(val) {
            this.debounceSearch(val);
        },
        listObjectSelected(newValue, oldValue){
            if(newValue.length > oldValue.length){
                this.$emit('select-object', newValue[newValue.length - 1]);
            }else {
                oldValue.map((oldObject)=>{
                    let check = false
                    newValue.map((newObject)=>{
                        if(newObject.id == oldObject.id){
                            check = true
                        }
                    })
                    if(!check){
                        this.$emit('unselect-object', oldObject);
                    }
                })
            }
        },
    },
    methods: {
        handleRemoveObject(item) {
            this.listObjectSelected.splice(
                this.listObjectSelected.indexOf(item),
                1,
            );
            this.$emit('unselect-object', item);
        },
        debounceSearch: _debounce(
            function (val) {
                this.$emit('search-object', val);
            },
            300,
            this,
        ),
        setObjectSelected(listObject){
            this.listObjectSelected =  listObject
        }
    },
};
</script>

<style scoped>
.object-selector .title-object {
    white-space: nowrap;
    width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.object-selector >>> .v-text-field__details {
    display: none !important;
}
.object-selector >>> .v-input__control {
    min-height: unset !important;
}
.object-selector >>> .v-input__slot {
    box-shadow: unset !important;
    border: 1px solid lightgray;
    height: 28px !important;
}
.object-selector >>> input{
    font-size: 12px !important;
}
.object-selector >>> .v-select__selection {
    display: none;
}
.object-selector >>> .v-input {
    max-width: 202px;
}
.object-selector {
    margin-right: 12px;
    width: 180px;
    margin-left: 12px;
}
.icon-remove-item {
    position: absolute !important;
    right: 0px;
    top: 4px;
}
.object-name{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 21px;
    display: inline-block;
    max-width: 146px;
}
.v-list-item__title{
    font-size: 13px;
}
.v-select__selection { display:none }
::v-deep .v-select.v-input--is-dirty ::placeholder {
  color: #6D6D6D !important;
}
</style>