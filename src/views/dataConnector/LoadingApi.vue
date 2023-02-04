<template>
    <v-dialog
        class="mx-2 mt-2"
        v-model="dialog"
        width="350"
        height="200"
        hide-overlay
        persistent
    >
        <v-card class="px-2 pb-3 pt-2">
            <div class="fs-13 fw-430">{{$t('v2.dataconnector.runApi')}}</div>
            <div class="fw-400 fs-11">
                <span class="pr-2"
                    >{{ loading ? $t('v2.dataconnector.apiRunning') : $t('v2.dataconnector.apiRunFinished') }}:</span
                >
                <span class="color:orange" style="text-transform: uppercase">{{
                    name
                }}</span>
            </div>
            <div class="fs-11" v-if="loading">
                <p></p>
                <div>
                    {{$t('v2.dataconnector.progress')}}
                    <span
                        v-if="data[1].value == 'Đang đẩy dữ liệu vào Document'"
                        >2</span
                    >
                    <span v-else>1</span>
                    /2
                </div>
                <div
                    v-for="(info, index) in data.filter(
                        (d) => d.name != 'Size' && d.name != $t('v2.dataconnector.time'),
                    )"
                    :key="index"
                    class="fw-400 fs-11"
                >
                    <span class="pr-2">{{ info.name }} </span>
                    <span class="color-orange">{{ info.value }} </span>
                    <v-progress-linear
                        v-if="info.name == $t('v2.dataconnector.percent')"
                        color="amber"
                        :value="info.value"
                    >
                    </v-progress-linear>
                </div>
            </div>
            <div v-else>
                <div class="d-flex justify-space-between my-2">
                    <div
                        v-for="(info, index) in data.filter(
                            (d) => d.name != $t('v2.dataconnector.percent'),
                        )"
                        :key="index"
                    >
                        <div class="fs-11">
                            <span>{{ info.name }} </span>
                            <span class="color-orange">{{ info.value }} </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-100 d-flex justify-end mt-2">
                <v-btn x-small depressed @click="close()">{{$t('v2.dataconnector.close')}}</v-btn>
            </div>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    watch: {},
    methods: {
        show() {
            this.dialog = true;
        },
        close() {
            this.dialog = false;
            this.$emit('close');
        },
    },
    created() {},
    data() {
        return {
            dialog: this.loading,
        };
    },
    props: {
        name: {
            type: String,
            default() {
                return '';
            },
        },
        loading: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Array,
            default() {
                return [
                    { name: this.$t('v2.dataconnector.time'), value: '' },
                    {
                        name: this.$t('v2.dataconnector.status'),
                        value: this.$t('v2.dataconnector.gettingDataFormApi'),
                    },
                    { name: this.$t('v2.dataconnector.percent'), value: '0' },
                    { name: this.$t('v2.dataconnector.size'), value: '0' },
                ];
            },
        },
    },
};
</script>
