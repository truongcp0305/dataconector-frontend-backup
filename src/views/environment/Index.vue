<template>
    <div class="d-flex h-100 w-100">
        <div class="d-flex flex-column h-100 tab-select fs-13">
            <div
                v-for="(item, i) in listType"
                :key="i"
                :class="{
                    'tab-select-item d-flex flex-column ml-1 mr-1 pl-1 pr-1 mt-1 pt-2 pb-2': true,
                    'selected-item': active == item.action,
                }"
                @click="handleTab(item)"
            >
                <div>
                    <v-icon small> mdi-circle-outline </v-icon>
                    <span class="ml-2">{{ item.title }}</span>
                </div>
                <span
                    class="fs-10"
                    style="position: absolute; left: 9px; top: 10px"
                    >{{ i + 1 }}</span
                >
                <span class="fs-10 font-weight-light mt-1"
                    ><v-icon x-small> mdi-information-outline</v-icon>
                    <span class="ml-1">{{ item.subTitle }}</span></span
                >
            </div>
        </div>
        <div class="list-item flex-grow-1 w-100 h-100">
            <ListService
                v-if="active == 'serviceManagement'"
                :containerHeight="containerHeight"
            />
            <ListServer
                v-if="active == 'serverManagement'"
                :containerHeight="containerHeight"
            />
            <EnvManagement
                v-if="active == 'envManagement'"
                :containerHeight="containerHeight"
                :active="active"
            />
        </div>
    </div>
</template>

<script>
import { util } from '@/plugins/util.js';
import EnvManagement from './EnvManagement';
import ListService from './ListService';
import ListServer from './ListServer';
export default {
    components: {
        EnvManagement,
        ListService,
        ListServer,
    },
    created() {
        this.$store.dispatch('app/getAllBA');
        this.$store.dispatch('environmentManagement/getAllEnvirontment');
    },
    mounted() {
        this.containerHeight = util.getComponentSize(this).h;
    },
    data() {
        return {
            active: 'serviceManagement',
            containerHeight: null,
            subActive: '',
            listType: [
                {
                    title: this.$t('v2.environment.serviceManagement'),
                    subTitle:
                    this.$t('v2.environment.serviceManagementSubTitle'),
                    action: 'serviceManagement',
                },
                {
                    title: this.$t('v2.environment.serverManagement'),
                    subTitle:
                    this.$t('v2.environment.serverManagementSubTitle'),
                    action: 'serverManagement',
                },
                {
                    title: this.$t('v2.environment.envManagement'),
                    subTitle:
                    this.$t('v2.environment.envManagementSubTitle'),
                    action: 'envManagement',
                },
            ],
        };
    },
    methods: {
        handleTab(item) {
            this.active = item.action;
        },
    },
};
</script>

<style scoped>
.tab-select {
    width: 250px;
    border-right: 1px solid lightgray;
}
.selected-item {
    background-color: #f0f0f0;
    border-radius: 5px;
}
.tab-select-item,
.role-user-item {
    cursor: pointer;
    position: relative;
}
</style>
