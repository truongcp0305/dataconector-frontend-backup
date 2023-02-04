<template>
    <div class="w-100 h-100 mt-3">
        <AppSelector
            ref="kanbanSelector"
            :name="$t('v2.acessControl.selectKanban')"
            :showBtn="action != 'view' ? true : false"
            @list-item-selected="handleSelectListKanban"
            @item-selected="handleClickKanban"
            :appSelected="kanbanSelected"
            @change-selected-item="changeSelectedKanban"
            @delete-item="deletedKanban"
            :typeSelect="'kanban'"
            :listItem="listKanbans"
            :listAppSelected="listKanbansSelected"
        />
        <GroupByObjectType
            class="mt-2"
            :objectType="'stateflow_flow'"
            :action="action"
            :listOperations="listOperations"
            :tableHeight="tableHeight"
            :key="'stateflow_flow'"
        />
    </div>
</template>
<script>
import AppSelector from './AppSelector.vue';
import GroupByObjectType from './GroupByObjectType';
import Preloader from '@/components/common/Preloader.vue';
import ActionPackWorker from 'worker-loader!@/worker/accessControl/ActionPack.Worker.js';
export default {
    props: {
        action: {
            type: String,
            default: 'create'
        },
        tableHeight: {
            type: Number,
            default: 500
        },
        oldKanban: {
            type: String,
            default: ''
        }
    },
    components: {
        AppSelector,
        GroupByObjectType
    },
    data() {
        return {
            loading: false,
            kanbanSelected: [],
            listOperations: {}
        };
    },
    watch: {
        kanbanSelected(vl) {
            this.$emit('change-kanban-selected', vl);
        }
    },
    created() {
        this.kanbanSelected =
            Object.keys(this.allKanbanSelected).length > 0
                ? this.allKanbanSelected[Object.keys(this.allKanbanSelected)[0]]
                      .id
                : '';
        this.getListOperations();
        let self = this;
        this.actionPackWorker = new ActionPackWorker();
        this.actionPackWorker.addEventListener('message', function (event) {
            let data = event.data;
            switch (data.action) {
                case 'getDetailKanban':
                    self.$store.commit(
                        'actionPack/setDataForKanban',
                        data.dataAfter.kanban
                    );
                    let operations = {
                        stateflow_flow: data.dataAfter.operations
                    };
                    let obj = {
                        operations: operations,
                        typeSelect: 'kanban'
                    };
                    self.$store.commit('actionPack/updateOperation', obj);
                    self.getListOperations();
                default:
                    break;
            }
        });
    },
    computed: {
        allKanbanSelected() {
            return this.$store.state.actionPack.selectedKanban;
        },
        allKanbans() {
            return this.$store.state.actionPack.allKanban;
        },
        listKanbans() {
            let arr = this.allKanbans.filter((e) => {
                return e.isSelected == false;
            });
            return arr;
        },
        listKanbansSelected() {
            let arr = this.allKanbans.filter((e) => {
                return e.isSelected == true;
            });
            return arr;
        }
    },
    methods: {
        getListOperations() {
            if (this.kanbanSelected == '') {
                this.listOperations = {
                    stateflow_flow: []
                };
            } else
                this.listOperations =
                    this.allKanbanSelected[this.kanbanSelected];
        },
        async handleSelectListKanban(kanban) {
            let data = this.allKanbanSelected;
            data[kanban.id] = {
                id: kanban.id,
                name: kanban.name,
                stateflow_flow: []
            };
            this.$store.commit('actionPack/setSelectedKanban', data);
            this.actionPackWorker.postMessage({
                action: 'getDetailKanban',
                data: kanban.id
            });
        },
        handleClickKanban(value) {
            this.kanbanSelected = value;
            this.getListOperations();
        },
        changeSelectedKanban(kanbanDelete) {
            if (this.kanbanSelected == kanbanDelete.id) {
                this.kanbanSelected =
                    this.listKanbansSelected.length > 0
                        ? this.listKanbansSelected[0].id
                        : '';
            }
            this.getListOperations();
        },
        deletedKanban(kanban) {
            this.$store.commit('actionPack/deleteKanban', kanban);
        }
    }
};
</script>

<style scoped>
.title-children-application {
    cursor: pointer;
    margin-left: auto;
    margin-right: auto;
}
.title-children-application:hover {
    background-color: #f7f7f7;
}
.title-children-application-active {
    background-color: #f0f0f0;
}
.v-tab {
    font-size: 13px !important;
    letter-spacing: 0 !important;
    text-transform: unset !important;
    font-weight: 400 !important;
}
.hight-light-children {
    font-weight: 500 !important;
    color: #f48634 !important;
}
</style>
