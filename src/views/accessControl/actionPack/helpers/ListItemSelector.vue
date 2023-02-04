<template>
    <div class="d-flex list-item-selector align-center w-100">
        <span class="fs-13 fw-500 ml-1" style="width: 100px"> {{ name }}:</span>
        <v-btn
            tile
            depressed
            x-small
            class="ml-1 mr-2 add-app"
            v-if="!selectingApp && showBtn"
            @click="selectApplication"
        >
            <v-icon x-small> mdi-plus-thick </v-icon>
        </v-btn>
        <v-autocomplete
            ref="selectApp"
            max-width="100"
            style="max-width: 200px"
            class="autocomplete ml-1"
            v-model="apps"
            v-show="selectingApp"
            :items="listItem"
            dense
            chips
            item-text="name"
            return-object
            small-chips
            @change="handleChange"
            multiple
        ></v-autocomplete>
        <v-sheet style="max-width: calc(100% - 209px)">
            <v-chip-group mandatory show-arrows class="select-items">
                <v-chip
                    v-for="value in apps"
                    :key="value.id"
                    small
                    label
                    :class="{
                        'orange--text text--accent-4 v-chip--active':
                            appSelected == value.id,
                    }"
                    class="fs-13"
                    @click="handleAppClick(value)"
                >
                    {{ value.name }}
                </v-chip>
            </v-chip-group>
        </v-sheet>
    </div>
</template>

<script>
export default {
    props: {
        listItem: {
            type: Array,
            default() {
                return [];
            },
        },
        name: {
            type: String,
            default: '',
        },
        values: {
            type: Array,
            default() {
                return [];
            },
        },
        showBtn: {
            type: Boolean,
            default: true,
        },
    },
    mounted() {
        const self = this;
        this.$evtBus.$on('set-app-info', (app) => {
            if (app.app) {
                this.appSelected = app.app;
            }
        });
        this.$evtBus.$on('hide-btn-add-app', () => {
            self.selectingApp = false;
        });
    },
    data() {
        return {
            selectingApp: false,
            apps: this.values,
            isShowApp: false,
            appSelected: this.values.length > 0 ? this.values[0].id : [],
        };
    },
    computed: {},
    methods: {
        selectApplication() {
            this.selectingApp = true;
        },
        cancelSelect() {
            this.selectingApp = false;
        },
        handleAppClick(app) {
            this.selectingApp = false;
            this.appSelected = app.id;
            this.$emit('item-selected', app.id);
        },
        handleChange() {
            this.$emit('list-item-selected', this.apps);
            if (
                this.apps.length < this.values.length &&
                this.apps.length != 0
            ) {
                // trường hợp xóa set lại ứng dụng được select là cái cuối
                this.$emit('item-selected', this.apps[this.apps.length - 1].id);
            }
        },
    },
};
</script>

<style scoped>
.list-item-selector >>> .v-chip--select {
    display: none !important;
}
</style>
