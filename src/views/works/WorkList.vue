<template>
    <div class="list-objects h-100 w-100">
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
                    @get-list-process-instance="listProrcessInstances = $event"
                ></listHeader>
                <v-divider v-if="!sideBySideMode"></v-divider>
                <v-row class="ml-0 mr-0" v-if="!sideBySideMode">
                    <v-col cols="12" class="list-tasks pt-0 pb-0">
                        <v-row>
                            <v-col
                                :cols="
                                    sideBySideMode ? 12 : compackMode ? 6 : 4
                                "
                                class="pl-3 fs-13 font-weight-bold"
                                >{{ $t('process.instance.name') }}</v-col
                            >
                            <v-col
                                :cols="2"
                                class="pl-3 fs-13 font-weight-bold"
                                >{{
                                    $t(
                                        'process.instance.process_definition_name',
                                    )
                                }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-bold"
                                >{{
                                    $t('process.instance.business_key')
                                }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="!sideBySideMode"
                                class="fs-13 font-weight-bold"
                                >{{ $t('process.instance.user_start') }}</v-col
                            >
                            <v-col
                                cols="2"
                                v-if="
                                    !sideBySideMode &&
                                    !compackMode &&
                                    !smallComponentMode
                                "
                                class="fs-13 font-weight-bold"
                            >
                                {{ $t('process.instance.ended') }}
                                <v-btn
                                    icon
                                    x-small
                                    @click="isSmallRow = !isSmallRow"
                                    class="float-right"
                                >
                                    <v-icon size="17">{{
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

                <v-row
                    v-for="obj in flatInstances"
                    :key="obj.id"
                    :index="obj.id"
                    :class="{
                        'mr-0 ml-0 single-row': true,
                        'selected-instance': selectedInstance.id == obj.id,
                    }"
                    @click="selectObject(obj)"
                >
                    <v-col
                        :cols="sideBySideMode ? 12 : compackMode ? 6 : 4"
                        class="pl-3 pr-1"
                        :class="{
                            'pt-0': isSmallRow,
                            'pb-0': isSmallRow,
                            'pb-1': !isSmallRow,
                            'pt-1': !isSmallRow,
                        }"
                    >
                        <!-- <div style="width: 25px" class="d-inline-block h-100 pt-1">
                                                <icon :icon="obj.icon" class="mr-2 float-left"></icon>
                        </div>-->
                        <div class="pl-1">
                            <div
                                class="instance-item"
                                @click="selectProcessInstance(obj)"
                            >
                                <div
                                    class="instance-item-title w-100 lh-initial"
                                >
                                    <span class="fs-13">{{ obj.name }}</span>
                                </div>
                                <div class="instance-item-creator float-left">
                                    <i
                                        class="mdi mdi-account-cog mr-1 fs-14 grey--text"
                                    ></i
                                    ><span class="grey--text fs-12">{{
                                        obj.startUserId
                                    }}</span>
                                </div>
                                <div class="instance-item-time float-right">
                                    <span class="grey--text fs-12">{{
                                        $moment(obj.startTime).fromNow()
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </v-col>

                    <v-col
                        cols="2"
                        v-if="
                            !sideBySideMode &&
                            !compackMode &&
                            !smallComponentMode
                        "
                    >
                        <span class="mt-1 d-inline-block fs-13">{{
                            obj.processDefinitionName
                        }}</span>
                    </v-col>

                    <v-col
                        cols="2"
                        v-if="
                            !sideBySideMode &&
                            !compackMode &&
                            !smallComponentMode
                        "
                    >
                        <span class="mt-1 d-inline-block fs-13">{{
                            obj.businessKey
                        }}</span>
                    </v-col>
                    <v-col
                        v-if="!sideBySideMode"
                        cols="2"
                        class="fs-13 pl-1 pr-1"
                        :class="{ 'pt-0': isSmallRow, 'pb-0': isSmallRow }"
                    >
                        {{ obj.assignee }}
                        <v-chip
                            color="transparent"
                            small
                            class="mt-0 pl-1 pr-0 d-inline-block text-truncate"
                            label
                            v-if="obj.assignee != null"
                        >
                            <v-avatar size="25" class="mr-2">
                                <img
                                    :src="obj.assignee.avatar"
                                    alt
                                    v-if="!!obj.assignee.avatar"
                                />
                                <v-icon
                                    v-else
                                    v-text="obj.assignee.avatar"
                                ></v-icon>
                            </v-avatar>
                            {{ obj.startUserId }}
                        </v-chip>
                    </v-col>
                    <v-col
                        cols="2"
                        v-if="
                            !sideBySideMode &&
                            !compackMode &&
                            !smallComponentMode
                        "
                    >
                        <span v-if="obj.ended">
                            <i
                                class="mt-1 d-inline-block fs-15 mdi mdi-flag-checkered mr-2"
                            ></i>
                            <span class="fs-13">{{$t('v2.workflow.finished')}}</span>
                        </span>
                        <span v-else>
                            <i
                                class="mt-1 d-inline-block fs-15 mdi mdi-run-fast"
                            ></i>
                            <span class="fs-13">{{$t('v2.workflow.running')}}</span>
                        </span>
                    </v-col>
                </v-row>
            </v-col>
            <v-col
                :cols="!sideBySideMode ? 0 : 8"
                :md="!sideBySideMode ? 0 : 9"
                v-if="sideBySideMode"
                class="pt-0 px-0"
                style="border-left: 1px solid #e0e0e0"
            >
                <processInstanceDetail
                    :componentHeight="containerHeight"
                    :instanceId="this.selectedInstance.id"
                    @close-detail="closeDetail"
                ></processInstanceDetail>
            </v-col>
            <userSelector ref="user" class="d-none"></userSelector>
        </v-row>
    </div>
</template>

<script>
import BPMNEngine from './../../api/BPMNEngine';
import icon from '../../components/common/SymperIcon';
import taskDetail from './../tasks/taskDetail';
import listHeader from './../tasks/listHeader';
import userSelector from './../tasks/userSelector';
import processInstanceDetail from './../process/processInstanceDetail';
import { util } from '../../plugins/util';

export default {
    name: 'WorkList',
    computed: {
        flatInstances() {
            let instances = [];
            for (let instance of this.listProrcessInstances) {
                for (let task of instance.objects) {
                    task.bizKey = ''; // Business key của process instance
                    instances.push(task);
                }
            }
            return instances;
        },
    },
    components: {
        icon: icon,
        taskDetail: taskDetail,
        listHeader: listHeader,
        userSelector: userSelector,
        processInstanceDetail: processInstanceDetail,
    },
    props: {
        compackMode: {
            type: Boolean,
            default: false,
        },
        height: {
            type: String,
            default: 'calc(100vh - 120px)',
        },
        // component này có ở chế độ là component con của một component khác hay ko, false nếu component này là view
        smallComponentMode: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            containerHeight: 300,
            selectedInstance: {},
            selectedTask: {},
            listProrcessInstances: [],
            isSmallRow: false,
            sideBySideMode: false,
            openPanel: [0, 1, 2, 3, 4],
        };
    },
    mounted() {
        this.calcContainerHeight();
    },
    methods: {
        calcContainerHeight() {
            this.containerHeight = util.getComponentSize(this).h;
        },
        selectProcessInstance(instance) {
            for (let key in instance) {
                this.$set(this.selectedInstance, key, instance[key]);
            }
        },
        getUser(id) {
            this.$refs.user.getUser(id);
        },
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
                                    // let index = 0;
                                    for (const index in listTasks) {
                                        listTasks[index].assignee =
                                            this.getUser(
                                                parseInt(
                                                    listTasks[index].assignee,
                                                ),
                                            );
                                        listTasks[index].owner = this.getUser(
                                            parseInt(listTasks[index].owner),
                                        );
                                        if (
                                            listTasks[index]
                                                .processInstanceId ==
                                            instance.id
                                        ) {
                                            this.listProrcessInstances[
                                                processIndex
                                            ].objects[instanceIndex].tasks.push(
                                                listTasks[index],
                                            );
                                            listTasks.splice(index, 1);
                                        }
                                    }
                                },
                            );
                        },
                    );
                    this.addOtherProcess(listTasks);
                }
            });
        },
        addOtherProcess(listTasks) {
            for (const index in listTasks) {
                listTasks[index].assignee = this.getUser(
                    parseInt(listTasks[index].assignee),
                );
                listTasks[index].owner = this.getUser(
                    parseInt(listTasks[index].owner),
                );
            }
            this.listProrcessInstances.push({
                processDefinitionId: null,
                processDefinitionName: this.$t('common.other'),
                objects: [
                    {
                        id: null,
                        name: null,
                        tasks: listTasks,
                    },
                ],
            });
        },
    },
};
</script>

<style scoped>
.instance-item {
    padding: 7px 10px;
    cursor: pointer;
    width: 100%;
}

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

.selected-instance {
    background-color: #f4f4f4 !important;
}
</style>
