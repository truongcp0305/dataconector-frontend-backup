<template>
    <div>
        <v-dialog
            v-model="dialog"
            max-width="700"
            style="z-index: 1001"
            persistent
        >
            <v-card>
                <span class="mdi mdi-close close-btn" @click="close"></span>
                <v-btn @click="saveConfig" class="save-btn" style="">{{
                    $t('common.save')
                }}</v-btn>
                <v-card-title class="fs-15"> {{$t('v2.orgchart.searchInformation')}}</v-card-title>
                <Department
                    ref="listDepartments"
                    :level="level"
                    :idOrgchart="idOrgchart"
                    :selectedItems="selectedItems"
                    :controlName="controlName"
                    :selectMultiple="selectMultiple"
                    :openCpn="openCpn"
                    :filterByUsers="filterByUsers"
                />
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import Department from '@/components/common/Department';
export default {
    components: {
        Department,
    },
    data() {
        return {
            selectedArrs: [],
            dialog: false,
            openCpn: false,
        };
    },
    computed: {},
    props: {
        idOrgchart: {
            type: String,
            default: '113',
        },
        level: {
            type: String,
            default: 'position',
        },
        selectedItems: {
            type: Array,
            default: function () {
                return [];
            },
        },
        controlName: {
            type: String,
            default: '',
        },
        selectMultiple: {
            type: Boolean,
        },
        filterByUsers: {
            type: Array,
            default: function () {
                return [];
            },
        },
    },
    methods: {
        show() {
            this.dialog = true;
            this.openCpn = true;
        },
        close() {
            this.$refs.listDepartments.closeCpn();
            this.openCpn = false;
            this.dialog = false;
        },
        saveConfig() {
            this.$emit('save', this.$refs.listDepartments.saveConfig());
            this.$refs.listDepartments.closeCpn();
            this.dialog = false;
            this.openCpn = false;
        },
    },
};
</script>

<style scoped>
.save-btn {
    position: absolute !important;
    right: 60px !important;
    top: 16px !important;
    width: 48px !important;
    height: 31px !important;
    background-color: #61c454 !important;
    color: #fff !important;
    font-weight: 400 !important;
    font-size: 15px !important;
    box-shadow: none !important;
}
.close-btn {
    position: absolute !important;
    right: 20px !important;
    top: 16px !important;
    font-size: 20px !important;
    padding: 8px !important;
    border-radius: 0px !important;
}
</style>
<style>
.v-dialog {
    overflow: hidden !important;
}
</style>