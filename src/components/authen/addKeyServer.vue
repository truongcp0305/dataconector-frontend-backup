<template>
    <div>
        <div class="fs-16 fw-430 pb-1">
            <span v-if="typeView == 'add'">
                {{ $t('authen.view.add_title') }}
            </span>
            <span v-else>
                {{ $t('authen.view.update_title') }}
            </span>
        </div>
        <v-divider> </v-divider>
        <v-row class="mt-1">
            <v-col class="col-md-3 fs-13 mt-1">
                {{ $t('authen.view.key_name') }}
                <span class="color-red">*</span>
            </v-col>
            <v-col class="col-md-9">
                <v-text-field
                    class="sym-small-size key-name"
                    single-line
                    outlined
                    dense
                    v-model="nameKey"
                    label="Nhập tên key "
                    :placeholder="$t('common.search')"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row class="mt-1">
            <v-col class="col-md-3 fs-13 mt-1">
                {{ $t('authen.view.key_description') }}
            </v-col>
            <v-col class="col-md-9">
                <v-textarea
                    dense
                    solo
                    text
                    flat
                    outlined
                    class="sym-small-size sym-small-lineheight"
                    v-model="descriptionKey"
                ></v-textarea>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="col-md-12 fs-13">
                {{ $t('authen.view.key_status') }}
                <v-checkbox
                    style="margin-top: -25px; margin-left: 98px"
                    v-model="statusKey"
                    color="green"
                >
                </v-checkbox>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="d-flex flex-row justify-end">
                <v-btn
                    v-if="typeView == 'add'"
                    class="fs-13 fw-400"
                    color="success"
                    @click="addKey()"
                >
                    {{ $t('authen.view.save') }}
                </v-btn>
                <v-btn
                    v-else
                    class="fs-13 fw-400"
                    color="success"
                    @click="updateKey()"
                >
                    {{ $t('authen.view.update') }}
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>
<script>
import { systemRoleApi } from '@/api/systemRole.js';
import { accessControlApi } from './../../api/accessControl';
export default {
    created() {
        this.getLastRole();
    },
    watch: {},
    props: {
        typeView: {
            type: String,
            default: 'add',
        },
        detailKey: {
            type: Object,
            default: {},
        },
    },
    methods: {
        freshAll() {
            this.nameKey = '';
            this.descriptionKey = '';
            this.statusKey = '';
        },
        async addKey() {
            let data = {
                name: this.nameKey,
                description: this.descriptionKey,
                status: this.statusKey ? 1 : 0,
            };
            let res = await accessControlApi.addServerKey(data);
            if (res.status == 200) {
                this.$snotify({
                    type: 'success',
                    title:
                        this.$t('authen.view.add_title') +
                        this.$t(+'authen.notify.success'),
                });
                this.$emit('close-panel');
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t(
                        'authen.view.add_title' + 'authen.notify.error',
                    ),
                });
            }
        },
        async updateKey() {
            let data = {
                name: this.nameKey,
                description: this.descriptionKey,
                status: this.statusKey ? 1 : 0,
            };
            let res = await accessControlApi.updateServerKey(this.keyId, data);
            if (res.status == 200) {
                this.$snotify({
                    type: 'success',
                    title:
                        this.$t('authen.view.update_title') +
                        this.$t(+'authen.notify.success'),
                });
                this.$emit('close-panel');
            } else {
                this.$snotify({
                    type: 'error',
                    title: this.$t(
                        'authen.view.update_title' + 'authen.notify.error',
                    ),
                });
            }
        },
    },
    data() {
        return {
            nameKey: '',
            keyId: '',
            descriptionKey: '',
            statusKey: '',
        };
    },
};
</script>
<style scoped>
.key-name >>> .v-label {
    color: grey !important;
}
</style>
