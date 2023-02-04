<template>
    <v-autocomplete
        v-model="selected"
        :items="allUser"
        filled
        dense
        :disabled="disabled"
        solo
        flat
        chips
        item-text="name"
        item-value="code"
        background-color="#fbfbfb"
        :placeholder="$t('common.search')"
        class="sym-small-size sym-pad-0 sym-style-input"
        :multiple="isMulti"
        @change="handleChangeValue"
        ref="userSelectAutocomplete"
    >
        <template v-slot:selection="data">
            <v-chip :input-value="data.selected" small>
                <v-list-item-avatar
                    height="20"
                    width="20"
                    size="20"
                    class="mt-1 mb-1"
                >
                    <v-img
                        :src="data.item.image ? data.item.image : avatarDefault"
                    >
                    </v-img>
                </v-list-item-avatar>
                <span class="fs-11">{{ data.item.name }}</span>
            </v-chip>
        </template>
        <template v-slot:item="data">
            <template>
                <v-list-item-avatar
                    height="20"
                    width="20"
                    size="20"
                    class="mt-1 mb-1"
                >
                    <v-img
                        :src="data.item.image ? data.item.image : avatarDefault"
                    >
                    </v-img>
                </v-list-item-avatar>
                <v-list-item-content class="pt-0 pb-0">
                    <v-list-item-title
                        v-html="data.item.name"
                    ></v-list-item-title>
                </v-list-item-content>
                <v-list-item-action class="mt-0 mb-0">
                    <v-icon
                        v-if="
                            typeof selected.indexOf != 'undefined' &&
                            selected.indexOf(data.item.code) >= 0
                        "
                        color="success"
                        small
                        >mdi-check</v-icon
                    >
                </v-list-item-action>
            </template>
        </template>
    </v-autocomplete>
</template>

<script>
import avatarDefault from '@/assets/image/avatar_default.jpg';
import symperAvatar from '@/components/common/SymperAvatar.vue';
import { orgchartApi } from '@/api/orgchart';
export default {
    components: {
        symperAvatar,
    },
    name: 'userSelector',
    props: {
        value: {
            type: Array,
            default() {
                return [];
            },
        },
        homeConfig: {
            type: Object,
            default() {
                return {};
            },
        },
        isMulti: {
            type: Boolean,
            default: true,
        },
        compactChip: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: true,
        },
    },
    watch: {
        value: {
            deep: true,
            immediate: true,
            handler(after) {
                this.selected = after;
            },
        },
        homeConfig: {
            deep: true,
            immediate: true,
            handler(obj) {
                let self = this;
                if (obj.mappingDoc) {
                    if (obj.mappingDoc.value != '') {
                        if (!obj.scriptMapping.value) {
                            obj.scriptMapping.value = '';
                        }
                        orgchartApi
                            .getDocInstance({
                                id: obj.mappingDoc.value,
                                script: obj.scriptMapping.value,
                            })
                            .then((res) => {
                                res.data.listObject.forEach(function (e) {
                                    let item = {};
                                    obj.tableMapping.value.forEach(function (
                                        k,
                                    ) {
                                        if (k.control != '' && k.control) {
                                            item[k.nodeColumn] = e[k.control];
                                        }
                                    });
                                    self.allUser.push(item);
                                });
                            });
                    }
                }
            },
        },
    },
    mounted() {
        this.selected = this.value;
    },
    data: function () {
        return {
            avatarDefault: avatarDefault,
            autoUpdate: true,
            isUpdating: false,
            selected: null,
            allUser: [],
        };
    },
    methods: {
        remove(item) {
            const index = this.selected.indexOf(item.id);
            if (index >= 0) {
                this.selected.splice(index, 1);
                this.$emit('change', this.selected);
                this.$emit('input', this.selected);
            }
        },
        handleChangeValue(value) {
            let userToInput = this.selected;
            this.$emit('change', userToInput);
            this.$emit('input', userToInput);
        },
    },
};
</script>

<style scoped>
div#symper-app >>> .v-application >>> .v-list-item--active:hover::before,
div#symper-app >>> .v-application >>> .v-list-item--active::before {
    opacity: 0;
}
.v-avatar {
    margin-left: unset !important;
    margin-right: 8px !important;
    padding: 4px 2px;
}
.v-chip {
    margin: 2px 0px !important;
}
.v-icon {
    opacity: 0.8;
}
#listUser {
    overflow: auto;
    max-height: calc(100vh - 185px);
}
</style>
