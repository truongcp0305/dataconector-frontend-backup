<template>
    <div class="h-100 w-100">
        <HeaderRow
            :objectType="0"
            :noFilter="true"
            :mapRealColWidth="mapRealColWidth"
            :smallSize="true"
        />

        <v-divider></v-divider>
        <VuePerfectScrollbar
            @ps-y-reach-end="handleReachEndList"
            style="height: calc(100vh - 135px)"
        >
            <div style="overflow: hidden">
                <v-row
                    class="item-task"
                    v-for="(obj, idx) in listTaskComputed"
                    :key="idx"
                    :style="{
                        minHeight: '30px'
                    }"
                    :class="{
                        'd-active': indexObj == idx
                    }"
                    @mouseover="indexObj = idx"
                    @mouseout="indexObj = null"
                    @click="selectObject(obj)"
                    style="
                        border-bottom: 1px solid #eeeeee !important;
                        margin-left: 0px !important;
                    "
                >
                    <TableItemRow
                        :obj="obj"
                        :objectType="0"
                        :mapRealColWidth="mapRealColWidth"
                        :smallSize="true"
                        :commentCountPerTask="commentCountPerTask"
                        :fileCountPerTask="fileCountPerTask"
                    />
                </v-row>
            </div>
        </VuePerfectScrollbar>
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import icon from '@/components/common/SymperIcon';
import {
    extractTaskInfoFromObject,
    addMoreInfoToTask
} from '@/components/process/processAction';
import infoUser from './../InfoUser';
import HeaderRow from '@/components/myItem/showList/HeaderRow';
import TableItemRow from '@/components/myItem/showList/TableItemRow';

export default {
    props: {
        listTask: {
            type: Array,
            default: []
        },
        appName: {
            type: String,
            default: null
        }
    },
    watch: {
        listTask(newVl) {
            this.getData();
            if (!newVl) {
                this.$store.dispatch('file/getWaitingFileCountPerObj');
                this.$store.dispatch('comment/getWaitingCommentCountPerObj');
            }
        }
    },
    components: {
        icon: icon,
        VuePerfectScrollbar,
        infoUser,
        TableItemRow,
        HeaderRow
    },
    data: function () {
        return {
            indexObj: null,
            mappingColWidth: {
                type: 0.3,
                name: 3,
                startDate: 1,
                assignee: 2,
                owner: 1.7,
                dueDate: 1.3,
                processDefinitionName: 1.3,
                statusText: 1
            },
            mapRealColWidth: {}
        };
    },
    computed: {
        fileCountPerTask() {
            return this.$store.state.file.fileCountPerObj.list;
        },
        commentCountPerTask() {
            return this.$store.state.comment.commentCountPerObj.list;
        },
        listTaskComputed() {
            let self = this;
            let arrListTask = this.listTask;
            if (arrListTask.length > 0) {
                arrListTask.forEach((task) => {
                    task.taskData = self.getTaskData(task);
                    task = addMoreInfoToTask(task);
                });

                return arrListTask;
            } else {
                return [];
            }
        }
    },
    methods: {
        checkTimeDueDate(item) {
            if (item.dueDate) {
                let dueDate = new Date(item.dueDate).getTime();
                if (dueDate < Date.now()) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
        handleReachEndList() {},
        selectNameApp(variables) {
            const symperAppId = variables.find(
                (element) => element.name == 'symper_application_id'
            );
            if (symperAppId) {
                let appId = symperAppId.value;
                let allApp = this.$store.state.task.allAppActive;
                let app = allApp.find((element) => element.id == appId);
                if (app) {
                    return app.name;
                } else {
                    return '';
                }
            } else {
                return '';
            }
        },
        getTaskData(task) {
            let rsl = {
                content: '',
                extraLabel: '',
                extraValue: ''
            };
            try {
                let taskData = JSON.parse(task.description);
                if (taskData) {
                    rsl = taskData;
                }
            } catch (error) {
                rsl.content = task.description;
            }
            return rsl;
        },
        selectObject(obj) {
            this.$goToPage(
                '/myitem/tasks/' + obj.id,
                this.$t('v2.myItem.detail')
            );
        },
        getData() {
            if (this.listTask && this.listTask.length > 0) {
                let arrListTask = this.listTask;
                let taskIden = [];
                arrListTask.forEach((task) => {
                    taskIden.push('task:' + task.id);
                });
                this.$store.commit('file/setWaitingFileCountPerObj', taskIden);
                this.$store.commit(
                    'comment/setWaitingCommentCountPerObj',
                    taskIden
                );
                this.$store.dispatch('file/getWaitingFileCountPerObj');
                this.$store.dispatch('comment/getWaitingCommentCountPerObj');
            }
        },
        calcDefaultColWidth() {
            for (let colKey in this.mappingColWidth) {
                this.$set(
                    this.mapRealColWidth,
                    colKey,
                    this.caculatorWidth(colKey, this.mappingColWidth)
                );
            }
        },
        caculatorWidth(key, mappingObject = null) {
            let unitWidth = (window.innerWidth * 0.7) / 12;
            let width = unitWidth * mappingObject[key];
            return width + 'px';
        }
    },
    created() {
        this.calcDefaultColWidth();
        this.getData();
    }
};
</script>

<style scoped>
.item-task {
    cursor: pointer;
}
.d-active {
    background: #f5f5f5;
}
.title-quytrinh {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box !important;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
</style>
