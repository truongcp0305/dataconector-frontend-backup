<template>
    <div class="d-flex flex-column detail-job fs-13 ml-6">
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold"> ID </span>
            <span class="content-detail-job font-weight-bold">
                {{ timerJobDetail.id }}
            </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.processName') }}
            </span>
            <span class="content-detail-job">
                {{ processDefination.key }}
            </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.processTitle') }}
            </span>
            <span class="content-detail-job">
                {{ processDefination.name }}
            </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.typeService') }}
            </span>
            <span class="content-detail-job">
                {{ $t('v2.admin.evantTime') }}
            </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.status') }}</span
            >
            <span class="content-detail-job content-status-detail-job">
                <v-chip
                    class="ma-2"
                    x-small
                    color="primary"
                    label
                    v-if="processDefination.suspended == false"
                    text-color="white"
                >
                    {{ $t('v2.admin.work') }}
                </v-chip>
                <v-chip
                    class="ma-2"
                    x-small
                    color="orange"
                    label
                    v-else
                    text-color="white"
                >
                    {{ $t('v2.admin.stop') }}
                </v-chip>
            </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.total') }}</span
            >
            <span class="content-detail-job"> 11312 </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.deployTime') }}
            </span>
            <span class="content-detail-job">
                {{ timerJobDetail.createTime }}
            </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.startTime') }}
            </span>
            <span class="content-detail-job"> 2020-11-06 23:32:49 </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.repeatTime') }}
            </span>
            <span class="content-detail-job"> 2020-11-06 23:32:49 </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.runtimeBeforeExcute') }}
            </span>
            <span class="content-detail-job"> 2020-11-06 23:32:49 </span>
        </div>
        <div class="d-flex pt-2">
            <span class="title-detail-job font-weight-bold">
                {{ $t('v2.admin.moreInfo') }}
            </span>
        </div>
        <div class="more-infor mr-6 text-wrap">
            <pre>
				<code>
					{{timerJobDetail}}
				</code>
			</pre>
        </div>
    </div>
</template>

<script>
import { adminApi } from '@/api/Admin.js';
export default {
    computed: {
        timerJobDetail() {
            return this.$store.state.admin.timerJobDetail;
        }
    },
    data() {
        return {
            processDefination: {}
        };
    },
    watch: {
        timerJobDetail: {
            deep: true,
            immediate: true,
            handler(obj) {
                let self = this;
                if (obj.processDefinitionId) {
                    adminApi
                        .getProcessDefinationDetail(obj.processDefinitionId)
                        .then((res) => {
                            self.processDefination = res;
                        })
                        .catch((err) => {});
                }
            }
        }
    }
};
</script>

<style scoped>
.title-detail-job {
    width: 35% !important;
}
.content-status-detail-job {
    margin: -8px;
}
.more-infor {
    border: 1px solid lightgray;
}
</style>
