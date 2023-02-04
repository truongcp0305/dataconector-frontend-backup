<template>
    <div style="background: white !important">
        <div class="ml-2 mr-2 mb-3 fs-13 pt-3 fw-430">
            <v-icon
                class="eyedropper-btn"
                style="
                    font-size: 16px;
                    margin-right: 4px;
                    border-radius: 4px;
                    padding: 2px;
                "
                @click="colorPicker"
            >
                mdi-eyedropper
            </v-icon>
            {{ name }}
        </div>
        <!-- <div>
            <v-btn x-small text><i class="mdi mdi-close"></i></v-btn>
        </div> -->
        <v-color-picker
            mode="hexa"
            v-model="color"
            show-swatches
            :swatches="swatchesColor ? swatchesColor : swatches"
            swatches-max-height="200"
        ></v-color-picker>
        <div v-if="reset" class="ml-2 d-flex fs-13 justify-center mb-2">
            <v-icon size="16" class="mr-2">mdi-delete-sweep</v-icon
            >{{ $t('v2.showlist.reset') }}
        </div>
        <div
            v-if="random"
            style="margin-top: -10px"
            class="ml-2 d-flex fs-13 justify-center"
        >
            <v-switch
                v-model="randomColor"
                :label="$t('v2.showlist.randomColor')"
            ></v-switch>
        </div>
        <div v-if="showSaveBtn" class="pr-2 d-flex justify-end pb-2">
            <v-btn
                class="fs-13 fw-400"
                x-small
                color="primary"
                @click="save()"
                >{{ $t('v2.showlist.apply') }}</v-btn
            >
        </div>
    </div>
</template>
<script>
export default {
    created() {},
    methods: {
        colorPicker() {
            let textContent = '';
            if (!window.EyeDropper) {
                textContent = this.$t('v2.showlist.notSupportEyeDropperAPI');
                return;
            }
            const eyeDropper = new EyeDropper();
            eyeDropper
                .open()
                .then((result) => {
                    textContent = result.sRGBHex;
                    this.color = result.sRGBHex;
                })
                .catch((e) => {
                    textContent = e;
                });
            if (textContent) {
                this.$snotify({
                    type: 'error',
                    title: textContent
                });
            }
        },
        save() {
            this.$emit('save', this.randomColor);
        }
    },
    props: {
        value: {
            type: String,
            default: ''
        },
        reset: {
            type: Boolean,
            default: false
        },
        randomColor: {
            type: Boolean,
            default: false
        },
        showSaveBtn: {
            type: Boolean,
            default: false
        },
        random: {
            type: Boolean,
            default: false
        },
        name: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.showlist.selectColor');
            }
        },
        swatchesColor: {
            type: Array,
            default() {
                return this.swatches;
            }
        }
    },
    watch: {
        color() {
            if (!this.showButton) {
                this.$emit('input', this.color);
            }
        },
        value(vl) {
            this.color = vl;
        }
    },
    data() {
        return {
            color: this.value,
            // randomColor:false,
            swatches: [
                ['#FF0000', '#AA0000', '#550000', '#000000'],
                ['#FFFF00', '#AAAA00', '#555500', '#00A0AA'],
                ['#00FF00', '#00AA00', '#005500', '#000555'],
                ['#00FFF0', '#00AAAA', '#005555', '#0000FF'],
                ['#00FFFF', '#00AAA0', '#005545', '#000055']
            ]
        };
    }
};
</script>
<style>
.v-color-picker__swatches {
    margin-bottom: -20px;
}
.eyedropper-btn:hover {
    background: none;
}
.eyedropper-btn:focus::after {
    background: none;
    opacity: 1;
}
.eyedropper-btn {
    background: rgba(0 0 0 / 0.1) !important;
}
</style>
