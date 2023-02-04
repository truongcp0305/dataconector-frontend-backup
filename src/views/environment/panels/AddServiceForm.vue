<template>
    <div>
        <h4 class="mb-4">{{$t('v2.environment.createNewService')}}</h4>
        <FormTpl
            :labelWidth="'60px'"
            :allInputs="allInputs"
            :single-line="true"
        />
        <v-btn
            small
            color="primary"
            style="margin-bottom: 24px"
            class="btn-fixed-bottom update-btn"
            @click="addService"
        >
            <v-icon class="mr-2">mdi-content-save-outline</v-icon>
            {{ $t('common.add') }}
        </v-btn>
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl';
import { environmentManagementApi } from '@/api/EnvironmentManagement';
export default {
    components: {
        FormTpl,
    },
    data() {
        return {
            allInputs: {
                name: {
                    title: this.$t('v2.environment.serviceName'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                identifier: {
                    title: this.$t('v2.environment.identifier'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                description: {
                    title: this.$t('v2.environment.describe'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                lastVersion: {
                    title: this.$t('v2.environment.version'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                useSql: {
                    title: this.$t('v2.environment.useSql'),
                    type: 'text',
                    value: '',
                    info: '',
                },

                language: {
                    title: this.$t('v2.environment.language'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                webServer: {
                    title: this.$t('v2.environment.webServer'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                status: {
                    title: this.$t('v2.environment.status'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                pingUrl: {
                    title: this.$t('v2.environment.pingUrl'),
                    type: 'text',
                    value: '',
                    info: '',
                },
                git: {
                    title: this.$t('v2.environment.git'),
                    type: 'text',
                    value: '',
                    info: '',
                },
            },
        };
    },
    methods: {
        addService() {
            let self = this;
            let formData = {};
            for (let i in this.allInputs) {
                formData[i] = this.allInputs[i].value;
            }
            environmentManagementApi
                .addService(formData)
                .then((res) => {
                    if (res.status == 200) {
                        self.$emit('add-success');
                        self.$snotify({
                            type: 'success',
                            title: this.$t('v2.environment.addVersionSuccess'),
                        });
                    } else {
                        self.$snotify({
                            type: 'error',
                            title: this.$t('v2.environment.errDetect'),
                        });
                    }
                })
                .catch((err) => {
                    self.$snotify({
                        type: 'error',
                        title: this.$t('v2.environment.errDetect'),
                    });
                });
        },
    },
};
</script>

<style></style>
