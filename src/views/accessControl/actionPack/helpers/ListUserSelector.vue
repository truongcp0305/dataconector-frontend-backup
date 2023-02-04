<template>
    <div
        class="d-flex flex-column list-item-selector"
        style="position: absolute"
    >
        <div
            style="position: relative; width: 100px; top: -30px; left: 90px"
            class="d-flex"
        >
            <v-autocomplete
                v-model="listUser"
                :items="listItem"
                dense
                chips
                v-show="selectingApp == true && action != 'detail'"
                :disabled="action == 'detail'"
                solo
                flat
                outlined
                @change="handleChangeValue"
                :item-text="columnInfor"
                return-object
                class="ml-1"
                style="margin-top: -6px"
                small-chips
                multiple
            ></v-autocomplete>
            <v-btn
                icon
                tile
                x-small
                class="ml-1 mr-8"
                color="green"
                :disabled="action == 'detail'"
                v-if="selectingApp == false"
                @click="selectApp"
            >
                <v-icon x-small> mdi-plus-thick </v-icon>
            </v-btn>
            <v-btn
                icon
                tile
                x-small
                class="ml-1 mr-2"
                color="error"
                v-if="selectingApp == true && action != 'detail'"
                @click="selectingApp = false"
            >
                <v-icon x-small> mdi-close </v-icon>
            </v-btn>
        </div>
        <div style="width: 350px; margin-top: -32px; margin-left: -4px">
            <v-sheet>
                <v-chip-group mandatory active-class="primary--text">
                    <v-chip
                        v-for="(value, i) in listUser"
                        :key="i + Date.now()"
                        small
                        color="lightskyblue"
                        label
                        @click="selectingApp = false"
                        class="fs-13"
                    >
                        {{ value ? value[columnInfor] : '' }}
                    </v-chip>
                </v-chip-group>
            </v-sheet>
        </div>
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
        value: {
            type: Array,
            default() {
                return [];
            },
        },
        columnInfor: {
            type: String,
            default: 'name',
        },
        action: {
            type: String,
        },
    },
    data() {
        return {
            selectingApp: false,
            listUser: [],
        };
    },
    methods: {
        selectApp() {
            this.selectingApp = true;
        },
        cancelSelect() {
            this.selectingApp = false;
        },
        handleAppClick(app) {
            this.$emit('item-selected', app.id);
        },
        handleChangeValue(list) {
            let arr = [];
            if (list.length > 0) {
                list.forEach(function (e) {
                    if (e && e.id) {
                        arr.push(e.id);
                    }
                });
            }
            this.$emit('change', arr);
            this.$emit('input', arr);
        },
    },
    watch: {
        value: {
            deep: true,
            immediate: true,
            handler(arr) {
                let self = this;
                this.selectingApp = false;
                self.listUser = [];
                if (arr.length > 0) {
                    let mapIdToUser = this.$store.getters['app/mapIdToUser'];
                    arr.forEach(function (e) {
                        self.listUser.push(mapIdToUser[e]);
                    });
                }
            },
        },
    },
};
</script>

<style scoped>
.list-item-selector >>> .v-slide-group__prev,
.list-item-selector >>> .v-slide-group__next {
    min-width: unset !important;
}
.list-item-selector >>> .selecting-app {
    width: 250px !important;
}
.list-item-selector >>> .v-input__control {
    min-height: unset !important;
    width: 300px !important;
}
.list-item-selector >>> .v-input__slot {
    min-height: unset !important;
}
.list-item-selector >>> .v-text-field__details {
    /* display: none !important; */
}
.list-item-selector >>> .v-chip--select {
    display: none !important;
}
</style>
