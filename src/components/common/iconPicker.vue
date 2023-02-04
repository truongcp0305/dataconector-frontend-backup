<template>
    <div class="pick-icon">
        <v-menu
            offset-x
            :close-on-content-click="false"
            light
            :min-width="minWidth"
            :max-width="maxWidth"
            :max-height="maxHeight"
            left
        >
            <template v-slot:activator="{ on }">
                <v-btn color="primary" dark small v-on="on">
                    {{ $t('iconPicker.header') }}
                </v-btn>
            </template>
            <v-tabs v-model="tab" grow>
                <v-tab v-for="item in items" :key="item">
                    {{ item }}
                </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <!-- tab Chọn icon -->
                <v-tab-item>
                    <material-icon
                        @selected="selectIcon"
                        :alwaysShow="true"
                    ></material-icon>
                </v-tab-item>
                <!-- Tab chèn link -->
                <v-tab-item class="text-center" style="min-height: 200px">
                    <v-text-field
                        v-model="link"
                        solo
                        :label="$t('common.quickSearch')"
                        flat
                        dense
                        append-icon="mdi-link-variant"
                        class="sym-small-size bg-grey pl-4 pr-4 mt-3"
                    ></v-text-field>
                    <div v-if="!!link" class="w-100">
                        <img
                            :src="link"
                            width="150"
                            max-height="150"
                            class="mt-3"
                            style="max-width: 150px"
                        />
                    </div>
                </v-tab-item>
                <v-tab-item>
                    <Upload ref="fileUpload" @selectFile="selectImg"></Upload>
                </v-tab-item>
            </v-tabs-items>
        </v-menu>
    </div>
</template>

<script>
import MaterialIcon from './MaterialIcon.vue';
import Upload from './Upload';
export default {
    name: 'pickIcon',
    components: {
        Upload,
        MaterialIcon
    },
    props: {
        defaultIcon: {
            type: String,
            default: ''
        },
        minWidth: {
            type: Number,
            default: 300
        },
        maxWidth: {
            type: Number,
            default: 300
        },
        maxHeight: {
            type: Number,
            default: 400
        }
    },
    data: function () {
        return {
            tab: null,
            items: [
                this.$t('iconPicker.tabs.icon'),
                this.$t('iconPicker.tabs.url'),
                this.$t('iconPicker.tabs.upload')
            ],
            link: null
        };
    },
    mounted() {
        this.link = this.defaultIcon;
    },
    methods: {
        reset() {
            this.$refs.fileUpload && this.$refs.fileUpload.reset();
        },
        selectIcon(icon) {
            this.$emit('selected', { icon: icon.trim(), type: 'icon' });
        },
        selectImg(img) {
            this.$emit('selected', { icon: img.trim(), type: 'img' });
        }
    }
};
</script>

<style scoped>
.pick-icon >>> .v-menu__content {
    overflow: hidden;
    height: 500px;
}
.sym-small-size >>> .v-input__slot,
.sym-small-size >>> .v-input__control {
    background: #f5f5f5 !important;
}
.single-icon {
    cursor: pointer;
}
.single-icon:hover {
    background-color: #f5f5f5;
}
.v-menu__content {
    background: #fff;
    overflow: hidden;
}
</style>
