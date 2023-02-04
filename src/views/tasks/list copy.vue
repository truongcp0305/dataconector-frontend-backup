<template>
    <div class="list-objects">
        <v-row class="mr-0 ml-0">
            <v-col
                :cols="!sideBySideMode ? 12 : 4"
                :md="!sideBySideMode ? 12 : 3"
                class="pt-0 pl-0 pr-0 pb-0"
            >
                <listHeader
                    :isSmallRow="isSmallRow"
                    :sideBySideMode="sideBySideMode"
                    :compackMode="compackMode"
                    @change-density="isSmallRow = !isSmallRow"
                ></listHeader>
                <v-divider v-if="!sideBySideMode"></v-divider>
                <v-row class="ml-0 mr-0" v-if="!sideBySideMode">
                    <v-col cols="12" class="list-tasks pt-0 pb-0">
                        <v-row>
                            <v-col
                                :cols="
                                    sideBySideMode ? 12 : compackMode ? 6 : 4
                                "
                                class="pl-8 fs-13 font-weight-bold"
                            >
                                {{ $t('tasks.header.name') }}
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-bold"
                            >
                                {{ $t('tasks.header.assignee') }}
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-bold"
                            >
                                {{ $t('tasks.header.dueDate') }}
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-bold"
                            >
                                {{ $t('tasks.header.owner') }}
                            </v-col>
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode && !compackMode"
                                class="text-right fs-13 font-weight-bold"
                            >
                                <v-btn
                                    text
                                    x-small
                                    @click="isSmallRow = !isSmallRow"
                                    class="pr-0 pl-0"
                                >
                                    <v-icon size="18">{{
                                        isSmallRow
                                            ? 'mdi-view-stream'
                                            : 'mdi-view-headline'
                                    }}</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-divider></v-divider>
                <v-row class="ml-0 mr-0">
                    <v-col
                        cols="12"
                        class="pt-0 pb-0 pl-0 pr-0 scrollable"
                        :style="{ height: height }"
                    >
                        <v-expansion-panels
                            tile
                            flat
                            multiple
                            class="pl-0"
                            v-model="openPanel"
                        >
                            <v-expansion-panel
                                v-for="(
                                    process, processIndex
                                ) in listProrcessInstances"
                                :key="processIndex"
                                :index="processIndex"
                                class="mt-0 pl-0 pr-0"
                            >
                                <v-expansion-panel-header
                                    class="pt-0 pb-0 pl-0 pr-0"
                                    style="min-height: 30px"
                                >
                                    <div class="fs-13 font-weight-bold pl-2">
                                        <icon
                                            :icon="'mdi-apps'"
                                            class="mr-1"
                                        ></icon>
                                        {{ process.processDefinitionName }}
                                    </div>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content
                                    class="pl-0 pr-0"
                                    v-for="(
                                        instance, instanceIndex
                                    ) in process.objects"
                                    :key="instanceIndex"
                                    :index="instanceIndex"
                                    v-show="instance.tasks.length > 0"
                                >
                                    <div
                                        class="fs-13 font-weight-bold pl-8"
                                        :class="{ 'pt-2': !isSmallRow }"
                                    >
                                        {{ instance.name }}
                                    </div>
                                    <v-row
                                        v-for="obj in instance.tasks"
                                        :key="obj.id"
                                        :index="obj.id"
                                        class="mr-0 ml-0 single-row"
                                        @click="selectObject(obj)"
                                    >
                                        <v-col
                                            :cols="
                                                sideBySideMode
                                                    ? 12
                                                    : compackMode
                                                    ? 6
                                                    : 4
                                            "
                                            class="pl-7 pr-1"
                                            :class="{
                                                'pt-0': isSmallRow,
                                                'pb-0': isSmallRow,
                                                'pb-1': !isSmallRow,
                                                'pt-1': !isSmallRow
                                            }"
                                        >
                                            <div
                                                style="width: 25px"
                                                class="
                                                    d-inline-block
                                                    h-100
                                                    pt-1
                                                "
                                            >
                                                <icon
                                                    :icon="obj.icon"
                                                    class="mr-2 float-left"
                                                ></icon>
                                            </div>
                                            <div
                                                style="width: calc(100% - 25px)"
                                                class="d-inline-block"
                                            >
                                                <div
                                                    class="
                                                        fz-13
                                                        text-truncate
                                                        d-inline-block
                                                        float-left
                                                    "
                                                >
                                                    {{ obj.name }}
                                                </div>
                                                <v-col
                                                    cols="12"
                                                    class="
                                                        pt-0
                                                        pb-0
                                                        pr-0
                                                        pl-0
                                                        grey--text
                                                        lighten-2
                                                        float-left
                                                    "
                                                >
                                                    <v-col
                                                        cols="6"
                                                        class="
                                                            text-left
                                                            fs-11
                                                            pt-0
                                                            pb-0
                                                            float-left
                                                            pl-0
                                                            pr-0
                                                        "
                                                    >
                                                        {{
                                                            $t(
                                                                'v2.myItem.listOrder'
                                                            )
                                                        }}
                                                        +SSS1291
                                                    </v-col>
                                                    <v-col
                                                        cols="6"
                                                        class="
                                                            text-left
                                                            fs-11
                                                            pt-0
                                                            pb-0
                                                            float-left
                                                            pl-0
                                                            pr-0
                                                        "
                                                    >
                                                        <v-icon
                                                            class="
                                                                grey--text
                                                                lighten-2
                                                                mr-1
                                                            "
                                                            x-small
                                                            >mdi-clock</v-icon
                                                        >
                                                        12:15
                                                    </v-col>
                                                </v-col>
                                            </div>
                                        </v-col>
                                        <!-- <v-col 
                                            v-if="!sideBySideMode"
                                            cols="2" 
                                            class="fs-13 pl-1 pr-1"
                                            :class="{'pt-0': isSmallRow, 'pb-0': isSmallRow}"
                                        >
                                            <v-chip
                                                color="transparent"
                                                small
                                                class="mt-0 pl-1 pr-0 d-inline-block text-truncate"
                                                label
                                            >
                                                <v-avatar size="25" class="mr-2">
                                                    <img 
                                                        :src="obj.assignee.avatar" alt=""
                                                        v-if="!!obj.assignee.avatar"
                                                    >
                                                    <v-icon
                                                        v-else
                                                        v-text="obj.assignee.avatar"
                                                    ></v-icon>
                                                </v-avatar>
                                                {{obj.assignee.name}}
                                            </v-chip>
                                        </v-col>
                                        <v-col 
                                            v-if="!sideBySideMode"
                                            cols="2" class="fs-13 pl-1 pr-1"
                                            :class="{'pt-0': isSmallRow, 'pb-0': isSmallRow}"
                                        >
                                            <span class="mt-1 d-inline-block">{{obj.dueDate}}</span>
                                        </v-col>
                                        <v-col 
                                            v-if="!sideBySideMode"
                                            cols="2" 
                                            class="fs-13 pl-1 pr-1"
                                            :class="{'pt-0': isSmallRow, 'pb-0': isSmallRow}"
                                        >
                                            <v-chip
                                                color="transparent"
                                                class="mt-0 pl-1 pr-0 d-inline-block text-truncate"
                                                small
                                                label
                                            >
                                                <v-avatar size="25" class="mr-2">
                                                    <img 
                                                        :src="obj.assignee.avatar" alt=""
                                                        v-if="!!obj.assignee.avatar"
                                                    >
                                                    <v-icon
                                                        v-else
                                                        v-text="obj.assignee.avatar"
                                                    ></v-icon>
                                                </v-avatar>
                                                {{obj.owner.name}}
                                            </v-chip>
                                        </v-col> -->
                                        <v-col
                                            cols="2"
                                            v-if="
                                                !sideBySideMode && !compackMode
                                            "
                                        ></v-col>
                                    </v-row>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-col>
                </v-row>
            </v-col>
            <v-col
                :cols="!sideBySideMode ? 0 : 8"
                :md="!sideBySideMode ? 0 : 9"
                v-if="sideBySideMode"
                class="pt-0"
                style="border-left: 1px solid #e0e0e0"
            >
                <taskDetail
                    :task="selectedTask"
                    @close-detail="closeDetail"
                ></taskDetail>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import BPMNEngine from './../../api/BPMNEngine';
import icon from '../../components/common/SymperIcon';
import taskDetail from './taskDetail';
import listHeader from './listHeader';
export default {
    name: 'listTask',
    components: {
        icon: icon,
        taskDetail: taskDetail,
        listHeader: listHeader
    },
    props: {
        compackMode: {
            type: Boolean,
            default: false
        },
        height: {
            type: String,
            default: 'calc(100vh - 120px)'
        }
    },
    data: function () {
        return {
            selectedTask: {},
            listProrcessInstances: [],
            isSmallRow: false,
            sideBySideMode: false,
            openPanel: [0, 1, 2, 3, 4],
            testObjs: [
                {
                    name: this.$t(
                        'v2.myItem.proposingToMakeAnExportTransferSlips'
                    ),
                    icon: 'mdi-arrow-down-bold-hexagon-outline',
                    date: '02-03-2020',
                    dueDate: '02-03-2020',
                    owner: {
                        name: 'Nguyễn Quốc Tân 1',
                        id: '',
                        role: 'BA',
                        avatar: 'https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/avat-01-512.png'
                    },
                    assignee: {
                        name: 'Nguyễn Tiến Đạt 1',
                        id: '',
                        role: 'Dev',
                        avatar: 'https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/avat-01-512.png'
                    }
                },
                {
                    name: this.$t(
                        'v2.myItem.proposingToMakeAnExportTransferSlips'
                    ),
                    icon: 'mdi-arrow-down-bold-hexagon-outline',
                    date: '02-03-2020',
                    dueDate: '02-03-2020',
                    owner: {
                        name: 'Nguyễn Quốc Tân',
                        id: '',
                        role: 'BA',
                        avatar: 'https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/avat-01-512.png'
                    },
                    assignee: {
                        name: 'Nguyễn Trọng Thắng',
                        id: '',
                        role: 'BA',
                        avatar: 'https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/avat-01-512.png'
                    }
                }
            ]
        };
    },
    mounted() {
        this.getProcessInstance();
    },
    methods: {
        selectObject(obj) {
            if (!this.compackMode) {
                this.sideBySideMode = true;
                this.selectedTask = obj;
                this.$emit('change-height', 'calc(100vh - 88px)');
            }
        },
        closeDetail() {
            this.sideBySideMode = false;
            this.$emit('change-height', 'calc(100vh - 120px)');
        },
        getProcessInstance() {
            BPMNEngine.getProcessInstance()
                .then((res) => {
                    if (res.total > 0) {
                        let listProccess = [];
                        let objects = [];
                        res.data.forEach((item) => {
                            if (
                                listProccess.indexOf(item.processDefinitionId) <
                                0
                            ) {
                                listProccess.push(item.processDefinitionId);
                            }
                            let index = listProccess.indexOf(
                                item.processDefinitionId
                            );
                            item.tasks = [];
                            if (objects[index] != undefined) {
                                objects[index].objects.push(item);
                            } else {
                                objects.push({
                                    processDefinitionId:
                                        item.processDefinitionId,
                                    processDefinitionName:
                                        item.processDefinitionName,
                                    objects: [item]
                                });
                            }
                        });
                        this.listProrcessInstances = objects;
                        this.addOtherProcess();
                        this.getTasks();
                    }
                })
                .catch((err) => {});
        },
        getTasks() {
            BPMNEngine.getTask().then((res) => {
                if (res.data != undefined && res.data.length) {
                    let listTasks = res.data;
                    this.listProrcessInstances.forEach(
                        (process, processIndex) => {
                            process.objects.forEach(
                                (instance, instanceIndex) => {
                                    this.listProrcessInstances[
                                        processIndex
                                    ].objects[instanceIndex].tasks = [];
                                    let index = 0;
                                    listTasks.forEach((item) => {
                                        if (
                                            item.processInstanceId ==
                                            instance.id
                                        ) {
                                            this.listProrcessInstances[
                                                processIndex
                                            ].objects[instanceIndex].tasks.push(
                                                item
                                            );
                                        }
                                    });
                                }
                            );
                        }
                    );
                }
            });
        },
        addOtherProcess() {
            this.listProrcessInstances.push({
                processDefinitionId: this.$t('common.other'),
                processDefinitionName: '',
                objects: [
                    {
                        id: null,
                        name: null
                    }
                ]
            });
        }
    }
};
</script>

<style scoped>
.list-tasks .fs-13 {
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 5px;
    padding-bottom: 5px;
}
.v-expansion-panels .v-expansion-panel-content {
    padding: 0;
}
.v-expansion-panels
    .v-expansion-panel-content
    >>> .v-expansion-panel-content__wrap {
    padding: 0 0 0px;
}
.single-row:hover {
    background: #f5f5f5;
    cursor: pointer;
}
.theme--light.v-list-item--active:hover::before,
.theme--light.v-list-item--active::before {
    opacity: 0;
}
.v-list--nav.v-list--dense .v-list-item:not(:last-child):not(:only-child),
.v-list--nav .v-list-item--dense:not(:last-child):not(:only-child) {
    margin-bottom: 0;
}
.scrollable {
    overflow: auto;
    overflow-x: hidden;
}
.v-text-field >>> .v-input__control >>> .v-input__slot,
.theme--light.v-text-field--solo >>> .v-input__control >>> .v-input__slot,
.list-objects .v-application >>> .v-input__control >>> .v-input__slot {
    padding-left: 5px !important;
    padding-right: 5px !important;
}
.v-application
    >>> .v-input__control
    >>> .v-input__slot
    >>> .v-input__append-inner
    >>> .v-input__icon {
    min-width: 10px;
    width: 5px;
}
.list-objects
    >>> .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)
    >>> .v-input__control
    >>> .v-input__slot,
.list-objects >>> .v-text-field.v-text-field--enclosed .v-text-field__details {
    padding-left: 5px !important;
    padding-right: 5px !important;
}
.v-list-item >>> .v-list-item__icon,
.v-list-group
    >>> .v-list-item__icon:first-child
    .v-list-group
    >>> .v-list-item--dense
    >>> .v-list-item__icon,
.v-list-group >>> .v-list--dense >>> .v-list-item >>> .v-list-item__icon {
    margin-top: 3px;
    margin-bottom: 3px;
}
</style>
