<template>
    <div class="symper-permission-selector">
        <div class="d-flex">
            <v-text-field
                style="width: calc(100% - 80px) !important"
                v-if="actionOnSearchItem == 'search'"
                class="d-inline-block mr-2 sym-small-size w-100"
                outlined
                single-line
                append-icon="mdi-magnify"
                v-model="searchKey"
                dense
                label="Search"
                :placeholder="$t('v2.acessControl.searchSelectedPermissionPack')"
            ></v-text-field>
            <v-autocomplete
                style="width: calc(100% - 80px) !important"
                v-if="actionOnSearchItem == 'add'"
                v-model="selectedPermission"
                :items="allPermission"
                filled
                dense
                :disabled="disabled"
                solo
                flat
                outlined
                return-object
                item-text="name"
                item-value="id"
                :placeholder="$t('v2.acessControl.findPermissionPackToAdd')"
                class="sym-small-size sym-pad-0 mr-2"
                multiple
                @change="addPermission"
            >
            </v-autocomplete>
        </div>
        <VuePerfectScrollbar :style="{ height: height }">
            <v-list dense>
                <v-list-item-group class="mt-1 mr-4">
                    <v-list-item
                        v-for="(item, i) in filterLazyValue"
                        :key="i"
                        class="w-100 selected-permission-pack"
                    >
                        <span class="fs-13">
                            <v-icon :size="15" class="mr-2"
                                >mdi-shield-account-variant-outline</v-icon
                            >
                            {{ item.name }}
                        </span>

                        <v-btn
                            depressed
                            icon
                            v-if="!disabled"
                            small
                            class="delete-selected-permission"
                        >
                            <v-icon
                                size="18"
                                @click="deleteSelectedPermission(item, i)"
                            >
                                mdi-trash-can-outline
                            </v-icon>
                        </v-btn>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    components: {
        VuePerfectScrollbar,
    },
    created() {
        this.$store.dispatch('permission/getAllPermission');
        this.addEnable();
    },
    methods: {
        addEnable() {
            for (let i = 0; i < this.allPermission.length; i++) {
                this.newPermission.push(this.allPermission[i]);
                this.allPermission[i].enable = false;

                this.newPermission[i].enable = false;
            }
        },
        // showCheck(id){
        //     //  this.allPermission[id].enable = true;
        // },
        deleteSelectedPermission(item, i) {
            this.lazyValue.splice(i, 1);
            this.$emit('input', this.lazyValue);
        },
        changeSearchAction() {
            this.searchKey = '';
            if (this.actionOnSearchItem == 'add') {
                this.actionOnSearchItem = 'search';
            } else {
                this.actionOnSearchItem = 'add';
            }
        },
        filterSelectedPack(search) {},
        addPermission(pks) {
            this.lazyValue = pks;
            this.$emit('input', this.lazyValue);
        },
    },
    computed: {
        allPermission() {
            return Object.values(
                this.$store.state.permission.allPermissionPack,
            );
        },
        filterLazyValue() {
            let searchKey = this.searchKey;
            if (!searchKey) {
                return this.lazyValue;
            } else {
                return this.lazyValue.filter((el) => {
                    if (
                        el.name.toLowerCase().includes(searchKey.toLowerCase())
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                });
            }
        },
    },
    props: {
        /**
         * Dạng: [
         *      {
         *          id: '',
         *          name: '',
         *          description: ''
         *      }
         * ]
         */
        value: {
            type: Array,
            default() {
                return [];
            },
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        height: {
            type: String,
            default: '100%',
        },
        action: {
            type: String,
        },
    },
    watch: {
        value: {
            deep: true,
            immediate: true,
            handler: function (after) {
                this.lazyValue = [];
                this.selectedPermission = [];
                this.lazyValue = after;
                this.selectedPermission = after;
            },
        },
        action(val) {
            if (val == 'create') {
                this.lazyValue = [];
                this.selectedPermission = [];
            }
        },
    },
    data() {
        return {
            newPermission: [],
            searchKey: '',
            selectedPermission: null,
            lazyValue: [],
            actionOnSearchItem: 'add', // hành động của thanh tìm kiếm: add hoặc search
        };
    },
};
</script>

<style scoped>
.delete-selected-permission {
    position: absolute !important;
    right: 5px;
}

.selected-permission-pack .delete-selected-permission {
    display: none;
}

.selected-permission-pack:hover .delete-selected-permission {
    display: block;
}
.symper-permission-selector >>> .v-select__selection {
    display: none !important;
}
</style>
