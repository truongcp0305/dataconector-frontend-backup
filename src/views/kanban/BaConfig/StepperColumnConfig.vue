<template>
    <div class="h-100 w-100">
        <div class="d-flex justify-space-between">
            <span>
                <FormTpl
                    class="select-control"
                    singleLine
                    :titleSize="'medium'"
                    :labelWidth="`100px`"
                    :viewOnly="typeAction == 'view'"
                    :allInputs="columnConfig.allInput"
                />
            </span>
            <v-btn
                small
                v-show="typeAction != 'view'"
                class="ml-1 px-2"
                solo
                depressed
                color="orange"
                @click="addColumn"
            >
                <v-icon color="white" size="12">mdi-plus</v-icon>
                <span style="color: white">{{ $t('common.add-column') }}</span>
            </v-btn>
        </div>
        <div class="d-flex h-100 kan-ban-board pl-2">
            <draggable
                :disabled="!draggable || typeAction == 'view'"
                :list="columnConfig.cols"
                :animation="250"
                class="py-4 h-100 w-100"
            >
                <transition-group
                    type="transition"
                    name="flip-list"
                    class="d-flex"
                >
                    <div
                        v-for="(column, index) in columnConfig.cols"
                        :key="column.id"
                        class="board-column mr-2"
                    >
                        <div class="column">
                            <div class="top d-flex justify-space-between mb-2">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on }">
                                        <v-icon
                                            @mouseover="draggable = true"
                                            @mouseout="draggable = false"
                                            v-show="typeAction != 'view'"
                                            v-on="on"
                                            :size="15"
                                            class="apps-icon"
                                            >mdi-apps</v-icon
                                        >
                                    </template>
                                    <span>{{ $t('common.drag') }}</span>
                                </v-tooltip>
                                <v-tooltip top>
                                    <template v-slot:activator="{ on }">
                                        <v-icon
                                            v-show="typeAction != 'view'"
                                            v-on="on"
                                            class="ml-1"
                                            :size="15"
                                            @click="removeColumn(index)"
                                            >mdi-close</v-icon
                                        >
                                    </template>
                                    <span>{{ $t('common.delete') }}</span>
                                </v-tooltip>
                            </div>
                            <div class="d-flex">
                                <v-text-field
                                    :disabled="typeAction == 'view'"
                                    :rules="[rules.max, rules.match]"
                                    :placeholder="
                                        $t('kanban.enter_column_name')
                                    "
                                    class="sym-small-size sym-style-input mb-1"
                                    v-model="column.name"
                                    solo
                                ></v-text-field>
                            </div>
                            <div class="d-flex">
                                <v-text-field
                                    :disabled="typeAction == 'view'"
                                    :placeholder="$t('kanban.enter_column_des')"
                                    class="sym-small-size sym-style-input"
                                    v-model="column.value"
                                    solo
                                ></v-text-field>
                            </div>
                        </div>
                    </div>
                </transition-group>
            </draggable>
        </div>
    </div>
</template>
<script>
import FormTpl from '@/components/common/FormTpl.vue';
import draggable from 'vuedraggable';
export default {
    name: 'columnConfig',
    components: {
        draggable,
        FormTpl,
    },
    props: {
        columnConfig: {
            type: Object,
            default() {
                return {};
            },
        },
        typeAction: {
            type: String,
            default: 'add',
        },
    },
    watch: {
        'columnConfig.cols': {
            deep: true,
            handler() {
                this.$emit('change-name-column');
            },
        },
    },
    data() {
        return {
            draggable: false,
            rules: {
                max: (value) =>
                    value.length <= 100 || this.$t('validate.max_100'),
                match: (value) =>
                    this.columnConfig.cols.filter(
                        (c) => c.name == value && value,
                    ).length <= 1 || this.$t('kanban.error.existNameCol'),
            },
        };
    },
    methods: {
        removeColumn(index) {
            if (this.columnConfig.cols.length > 2) {
                this.$emit('delete-column', this.columnConfig.cols[index].id);
                this.columnConfig.cols.splice(index, 1);
            } else {
                this.$snotifyError(
                    '',
                    this.$t('kanban.notify.can_not_delete_col'),
                );
            }
        },
        addColumn() {
            let colId = Date.now();
            this.columnConfig.cols.push({ id: colId, value: '', name: '' });
            this.$emit('add-column', colId);
        },
    },
};
</script>

<style scoped>
.board-column {
    width: 171px;
    min-width: 171px !important;
}
.column {
    font-weight: 400;
    padding: 4px;
    border-radius: 4px;
    background: var(--symper-background-active);
}
.title-column {
    padding: 0 8px;
}
.sym-style-input >>> .v-input__slot {
    box-shadow: none !important;
    border: none !important;
}

.kan-ban-board {
    overflow-x: scroll;
    background: #f2f2f2;
    border-radius: 4px;
}
textarea::-webkit-input-placeholder {
    font-size: 11px !important;
    color: var(--symper-text-color-default);
    font-weight: 400;
}
textarea::-webkit-input {
    font-size: 11px !important;
    font-weight: 400;
}
.apps-icon:hover {
    background: orange;
}
.sym-small-size {
    height: 40px;
}
.sym-small-size >>> .v-input--radio-group .v-messages {
    display: block !important;
}
.sym-small-size >>> .v-text-field__details {
    display: block !important;
    padding-top: 3px !important;
}
.sym-style-input:not(.v-input--checkbox) {
    border: none !important;
}
.select-control >>> .v-select__selections input {
    padding: 10px 0px !important;
}
</style>
