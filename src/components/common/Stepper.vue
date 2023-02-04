<template>
    <div class="stepper pr-5">
        <v-stepper
            v-model="stepper"
            vertical
            v-for="(step, index) in tabConfig"
            :key="step.key"
        >
            <v-stepper-step
                color="#FB7E00"
                :complete="maxStep > index + 1"
                class="fs-13"
                @click="showStepper(index + 1)"
                :step="index + 1"
            >
                {{ step.text }}
                <small class="fs-11 color-grey mt-2">{{
                    step.description
                }}</small>
            </v-stepper-step>

            <v-stepper-content :step="index + 1">
                <slot v-if="stepper == index + 1" :name="'step' + stepper" />
                <v-btn
                    small
                    v-show="
                        action == 'create' &&
                        maxStep <= index + 1 &&
                        stepper != tabConfig.length
                    "
                    color="primary"
                    class="mb-3"
                    @click="stepper = index + 2"
                    :disabled="disableBtnNextStep"
                    >{{ $t('common.continue') }}</v-btn
                >
            </v-stepper-content>
        </v-stepper>
    </div>
</template>

<script>
export default {
    methods: {
        showStepper(stepper) {
            this.$emit('show-stepper', stepper);
            if (
                this.stepper >= stepper ||
                this.maxStep >= stepper ||
                this.action != 'create'
            ) {
                if (
                    this.error.notEmtyName ||
                    this.error.notEmtyDoc ||
                    this.error.validate
                ) {
                    return;
                }
                this.stepper = stepper;
                if (this.maxStep < stepper) {
                    this.maxStep = stepper;
                }
            }
        }
    },
    watch: {
        stepper() {
            if (this.stepper > this.maxStep) this.maxStep = this.stepper;
        }
    },
    created() {},
    data() {
        return {
            stepper: 1,
            maxStep: 0
        };
    },
    props: {
        tabConfig: {
            type: Array,
            default() {
                return [];
            }
        },
        action: {
            type: String,
            default: 'create'
        },
        disableBtnNextStep: {
            type: Boolean,
            default: false
        },
        error: {
            type: Object,
            default() {
                return {};
            }
        }
    }
};
</script>

<style>
.v-stepper {
    box-shadow: unset !important;
}
.v-stepper__content {
    width: calc(100%-500px);
    border-left: 1px solid rgba(0, 0, 0, 0.12);
}
.v-stepper__step:hover {
    background: #80808026;
    border-radius: 191px;
}
.v-stepper__step {
    margin-left: 8px !important;
}
.stepper {
    max-height: 100%;
    overflow: scroll;
}
.v-stepper--vertical .v-stepper__step {
    padding: 16px !important;
}
.v-stepper--vertical {
    padding-bottom: 0px !important;
}
.d-inline-block {
    font-size: 13px !important;
}
</style>