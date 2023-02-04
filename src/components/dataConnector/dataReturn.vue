<template>
    <div class="data-return">
        <div class="data-status  justify-space-between w-100">
            <div class="left" style="width: 50px; margin-top: -5px">
                <span class="fw-430 fs-11">{{$t('v2.dataconnector.result')}}</span>
                <p></p>
            </div>
            <div
                class="right d-flex justify-space-between"
                style="width: 350px"
            >
                <span class="fs-400 fs-11" style="width: 30%"
                    >{{$t('v2.dataconnector.status')}}
                    <span style="color: orange"
                        >{{
                            JSON.stringify(data) != '{}' &&
                            data.status &&
                            !disabled
                                ? data.status
                                : ''
                        }}
                    </span></span
                >
                <span class="fs-400 fs-11" style="width: 30%"
                    >{{$t('v2.dataconnector.time')}} :
                    <span style="color: orange"
                        >{{
                            JSON.stringify(data) != '{}' && !disabled
                                ? duration
                                : ''
                        }}
                    </span>
                </span>
                <span class="fs-400 fs-11" style="width: 30%"
                    >{{$t('v2.dataconnector.size')}}:
                    <span style="color: orange"
                        >{{
                            JSON.stringify(data) != '{}' && !disabled
                                ? getSize(data)
                                : ''
                        }}
                    </span></span
                >
            </div>
        </div>
        <div
            v-if="isLoading"
            class="loading"
            :style="{ height: isLoading ? '300px' : '0px' }"
        >
            <Preloader />
            <div class="info-loading fs-11">{{$t('v2.dataconnector.apiRunning')}}</div>
        </div>

        <div class="result-data-return w-100"></div>
    </div>
</template>
<script>
import Preloader from '@/components/common/Preloader.vue';
import {
    syntaxHighlight,
    getSize,
} from './../../components/dataConnector/formatObject';
export default {
    watch: {
        data: {
            deep: true,
            immediate: true,
            handler() {
                const self = this;
                if (JSON.stringify(this.data) != '{}') {
                    self.formatCssObject();
                } else {
                }
            },
        },
        hightlight: null,
    },
    components: { Preloader },
    mounted() {
        this.formatCssObject();
    },
    methods: {
        setLoading() {
            this.isLoading = true;
            $('.result-data-return').html('');
        },
        refreshData() {
            this.isLoading = false;
            $('.result-data-return').html('');
        },
        formatCssObject() {
            this.isLoading = false;
            if (JSON.stringify(this.data) != '{}' && this.data) {
                let hightlight =
                    "<pre style='height:300px;overflow: auto!important;'>" +
                    syntaxHighlight(JSON.stringify(this.data, null, 2)) +
                    '</pre>';
                $('.result-data-return').html(hightlight);
                this.hightlight = hightlight;
            }
        },
        getSize(data) {
            return getSize(data);
        },
    },
    data() {
        return {
            isLoading: false,
        };
    },
    props: ['data', 'duration', 'disabled'],
};
</script>
<style scoped>
.loading >>> .preloader {
    height: 50px !important;
    margin-top: 100px;
}
.info-loading {
    position: absolute;
    z-index: 300;
    margin-left: 265px;
    margin-top: 155px;
}
.preloader {
    width: 590px !important;
}
</style>
<style>
pre {
    height: 300px;
    overflow: auto !important;
}
pre span {
    font-size: 11px !important;
}
.number {
    color: blue;
}
.boolean {
    color: blue;
}
.null {
    color: blue;
}
.key {
    color: red;
}
.string {
    color: blue !important;
}
pre #text {
    font-size: 11px;
}
</style>
