<template>
    <v-autocomplete
        v-model="selected"
        :items="allUser"
        :label="label"
        :outlined="outlined"
        filled
        dense
        :disabled="disabled"
        :solo="solo"
        flat
        chips
        item-text="displayName"
        item-value="id"
        background-color="#fbfbfb"
        :placeholder="$t('common.search')"
        class="sym-small-size sym-pad-0 sym-style-input"
        :multiple="isMulti"
        @change="handleChangeValue"
        ref="userSelectAutocomplete"
    >
        <template v-slot:selection="data">
            <v-chip
                :color="color"
                :input-value="data.selected"
                :close="!compactChip"
                small
                :class="textColor + ' mt-1'"
                @click:close="remove(data.item)"
            >
                <!-- <v-avatar sizes="23" left v-if="compactChip">
                    <v-img  sizes="23" :src="data.item.avatar ? data.item.avatar : avatarDefault"></v-img>
                </v-avatar> -->
                <symperAvatar :size="20" :userId="data.item.id" />
                <span class="fs-11">{{ data.item.displayName }}</span>
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
                    <!-- <v-img sizes="20" height="20" width="20" :src="data.item.avatar ? data.item.avatar : avatarDefault"></v-img> -->
                    <symperAvatar :size="20" :userId="data.item.id" />
                </v-list-item-avatar>
                <v-list-item-content class="pt-0 pb-0">
                    <v-list-item-title
                        v-html="data.item.displayName"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                        class="caption"
                        style="font-size: 10px !important"
                        v-html="data.item.role"
                    ></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action class="mt-0 mb-0">
                    <v-icon
                        v-if="
                            typeof selected.indexOf != 'undefined' &&
                            selected.indexOf(data.item.id) >= 0
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

export default {
    components: {
        symperAvatar,
    },
    name: 'userSelector',
    props: {
        outlined: {
            type: Boolean,
            default: false,
        },
        label: {
            type: String,
            default: '',
        },
        solo: {
            type: Boolean,
            default: true,
        },
        color: {
            type: String,
            default: 'green lighten-4',
        },
        textColor: {
            type: String,
            default: 'blue-grey--text',
        },
        value: {
            type: Array,
            default() {
                return [];
            },
        },
        valueObj: {
            type: Object,
            default() {
                return { id: '921' };
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
        flat: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
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
    },
    mounted() {
        if (this.isMulti) {
            this.selected = this.value;
        } else {
            this.selected = this.valueObj;
        }
    },
    data: function () {
        const srcs = {};
        return {
            avatarDefault: avatarDefault,
            autoUpdate: true,
            isUpdating: false,
            selected: null,
            users: [],
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
            //  this.$refs.userSelectAutocomplete.lazySearch= '';
        },
        getUser(id) {
            if (id == null || id == NaN) {
                return null;
            }
            this.users = this.$store.state.app.allUsers;
            let obj = this.users.find((data) => data.id === id);
            return obj;
        },
    },
    computed: {
        allUser() {
            return this.$store.state.app.allUsers;
        },
    },
};
</script>

<style scoped>
div#symper-app >>> .v-application >>> .v-list-item--active:hover::before,
div#symper-app >>> .v-application >>> .v-list-item--active::before {
    opacity: 0;
}
#listUser {
    overflow: auto;
    max-height: calc(100vh - 185px);
}
.sym-style-input
    >>> .v-input__control
    >>> .v-input__slot
    >>> .v-select__slot
    >>> .v-select__selections
    >>> input {
    padding-top: 11px !important;
    padding-bottom: 10px !important;
}
</style>
