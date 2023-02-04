<template>
    <div class="h-100">
        <h3 class="header-title" v-if="actionType == 'add'">
            {{ $t('service.panel.add.title') }}
        </h3>
        <h3 class="header-title" v-if="actionType == 'edit'">
            {{ $t('service.panel.edit.title') }}
        </h3>
        <v-divider></v-divider>
        <div class="form-add-service-content">
            <form-tpl
                :singleLine="true"
                :labelWidth="`160px`"
                :allInputs="allInputs"
            />
            <repeat-time ref="repeatTime"></repeat-time>
            <div class="mt-3">
                <div
                    :style="{ width: '160px', 'vertical-align': 'top' }"
                    class="title-form"
                >
                    <span>{{$t('v2.app.active')}}</span>
                </div>
                <div class="active-service">
                    <v-checkbox
                        v-model="activeService"
                        hide-details
                        :style="{
                            'margin-top': '0',
                            'font-weight': '500',
                            'font-size': '13px',
                        }"
                    ></v-checkbox>
                </div>
            </div>
        </div>
        <v-btn
            :loading="savingConfigs"
            small
            color="primary"
            class="float-right"
            @click="saveService"
        >
            <v-icon class="mr-2">mdi-content-save-outline</v-icon>
            {{ $t('common.save') }}
        </v-btn>
    </div>
</template>
<script>
import FormTpl from './../../components/common/FormTpl.vue';
import RepeatConfig from './../../components/common/RepeatConfig.vue';
import { serviceApi } from './../../api/service.js';
export default {
    components: {
        'form-tpl': FormTpl,
        'repeat-time': RepeatConfig,
    },
    data() {
        return {
            allInputs: null,
            savingConfigs: false,
            activeService: true,
            actionType: 'add',
            serviceId: 0,
        };
    },

    methods: {
        resetData() {
            this.allInputs = {
                name: {
                    title: this.$t('v2.noti.nameService'),
                    type: 'text',
                    value: '',
                },
                description: {
                    title: this.$t('v2.kanban.description'),
                    type: 'text',
                    value: '',
                },
                formulas: {
                    title: this.$t('v2.noti.exeFormula'),
                    type: 'script',
                    value: '',
                },
                ifCondition: {
                    title: this.$t('v2.noti.runCondition'),
                    type: 'script',
                    value: '/*Bỏ trống nếu luôn chạy*/',
                },
                startAt: {
                    title: this.$t('v2.noti.startTime'),
                    type: 'script',
                    value: '/*Nếu bỏ trống thì thời gian chạy sẽ bắt đầu vào 0h hằng ngày*/',
                    isDateTime: true,
                },
                endAt: {
                    title: this.$t('v2.noti.endTime'),
                    type: 'script',
                    value: '/*Nếu bỏ trống không có thời gian kết thúc*/',
                    isDateTime: true,
                },
            };
        },

        // hoangnd: hàm xử lí dữ liệu để lấy dataPost trước khi add hoặc edit
        saveService() {
            let dataLoopConfig = this.$refs.repeatTime.getData();
            let loopConfig = {};
            if (dataLoopConfig.isRepeat) {
                loopConfig = dataLoopConfig.loopConfig;
            }
            let dataPost = {};
            for (let i in this.allInputs) {
                dataPost[i] = this.allInputs[i].value;
            }
            dataPost['active'] = this.activeService;
            dataPost['loopConfig'] = JSON.stringify(loopConfig);
            if (this.actionType == 'add') {
                this.addService(dataPost);
            } else {
                this.editService(dataPost);
            }
        },
        addService(dataPost) {
            let thisCpn = this;

            serviceApi
                .add(dataPost)
                .then((res) => {
                    if (res.status == 200) {
                        thisCpn.$emit('refresh-list');
                    }
                })
                .catch((err) => {
                    console.log('error from add service api!!!', err);
                })
                .finally(() => {});
        },
        editService(dataPost) {
            let thisCpn = this;
            dataPost['id'] = this.serviceId;
            serviceApi
                .edit(dataPost)
                .then((res) => {
                    if (res.status == 200) {
                        thisCpn.$emit('refresh-list');
                    }
                })
                .catch((err) => {
                    console.log('error from edit service api!!!', err);
                })
                .finally(() => {});
        },
        setData(service) {
            this.actionType = 'edit';
            this.serviceId = service.id;
            this.allInputs.name.value = service.name;
            this.allInputs.description.value = service.description;
            this.activeService = service.status == 1;
            this.$refs.repeatTime.setData(
                service.loop_config,
                service.is_repeat,
            );
        },
        openPanel() {
            this.actionType = 'add';
            this.resetData();
            this.$refs.repeatTime.resetRepeatData();
        },
    },
};
</script>

<style scoped>
.form-add-service-content {
    margin-top: 8px;
    overflow: auto;
    height: calc(100vh - 100px);
}
.active-service {
    display: inline-block;
}
.active-service >>> .mdi {
    font-size: 16px !important;
}
.title-form {
    display: inline-block;
    font-weight: 500;
    font-size: 13px;
    margin-right: 8px;
    margin-top: 6px;
}
</style>
