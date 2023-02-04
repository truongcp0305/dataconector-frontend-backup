<template>
    <div ref="cardBase" class="symper-card-cell p-1">
        <div class="card-value pl-1 pr-1" :style="viewOptions.valueStyle">
            {{ viewOptions.value }}
        </div>
        <div
            class="card-delta pl-2 pr-1"
            v-if="viewOptions.compareValue !== false"
        >
            <div
                class="equal"
                v-if="
                    viewOptions.sign == 'equal' &&
                    viewOptions.mode != 'progress'
                "
            >
                {{ $t('v2.dashboard.equal') }}
            </div>
            <div
                :style="viewOptions.deltaStyle"
                v-else-if="viewOptions.sign == 'less'"
                class="less"
            >
                <i class="ms-Icon ms-Icon--CaretSolidDown pr-2"></i>
                <span>{{ viewOptions.delta }}</span>
            </div>
            <div
                :style="viewOptions.deltaStyle"
                v-else-if="viewOptions.sign == 'greater'"
                class="greater"
            >
                <i class="ms-Icon ms-Icon--CaretSolidUp pr-2"></i>
                <span>{{ viewOptions.delta }}</span>
            </div>

            <div
                :style="viewOptions.deltaStyle"
                v-else-if="viewOptions.sign == 'notSub'"
                class="greater"
            >
                <span>{{ viewOptions.delta }}</span>
            </div>

            <div v-if="viewOptions.mode == 'progress'" class="progress-bar">
                <div
                    class="progress-runner"
                    :style="{
                        width:
                            viewOptions.delta > 100
                                ? '100%'
                                : viewOptions.delta + '%',
                        backgroundColor: perc2Color(
                            viewOptions.delta,
                            viewOptions.revert
                        )
                    }"
                >
                    <span>{{ viewOptions.delta }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { util } from '@/plugins/util';
export default {
    props: ['cellConfigs'],
    computed: {
        viewOptions() {
            return this.cellConfigs.viewConfigs.displayOptions;
        }
    },
    methods: {
        perc2Color(perc, revert = false) {
            perc = perc > 100 ? 100 : perc;
            perc = revert ? 100 - perc : perc;
            var r,
                g,
                b = 0;
            if (perc < 50) {
                r = 255;
                g = Math.round(5.1 * perc);
            } else {
                g = 255;
                r = Math.round(510 - 5.1 * perc);
            }
            var h = r * 0x10000 + g * 0x100 + b * 0x1;
            return '#' + ('000000' + h.toString(16)).slice(-6);
        },
        printInnerHTML(headerHTML) {
            let bodyHtml = this.$refs.cardBase.innerHTML;
            let domHtml = headerHTML + bodyHtml;
            util.printDOM(domHtml);
        }
    }
};
</script>
<style>
.card-value {
    line-height: 1.2 !important;
}
.symper-card-cell .progress-bar {
    position: relative;
    padding: 2px;
    border: 1px solid #ededed;
}
.symper-card-cell .progress-bar .progress-runner {
    overflow: visible;
    padding: 2px;
    padding-left: 10px;
    font-size: 10px;
}

.card-value,
.card-delta {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-delta .equal {
    text-align: center;
    padding-bottom: 3px;
}
</style>
