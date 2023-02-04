<template>
    <div class="d-flex flex-row">
        <div>
            <span style="font-size: 13px; font-weight: 500">{{
                $t('scheduler.config_card')
            }}</span>
            <v-card
                outlined
                style="background-color: rgba(0, 85, 251, 0.3)"
                max-height="490"
                width="454"
                class="mt-1 pa-6 mb-9"
            >
                <div class="pa-2 pt-0 card-scheduler-config">
                    <v-row class="mb-1">
                        <span class="title-control-card"
                            >{{ $t('scheduler.card_config.title') }}
                            <span style="color: red">*</span></span
                        >
                    </v-row>
                    <v-row class="mb-3">
                        <v-autocomplete
                            v-model="cardConfig['title']"
                            return-object
                            :items="listColumn"
                            item-text="headerName"
                            dense
                            :placeholder="$t('v2.kanban.selectControl')"
                            outlined
                            solo
                            flat
                            hide-details
                            :disabled="action == 'view'"
                            append-icon="mdi-chevron-down"
                            clearable
                        >
                        </v-autocomplete>
                    </v-row>

                    <!-- <v-row class="mb-1">
                        <span class="title-control-card"
                            >{{ $t('scheduler.card_config.date') }}
                            <span style="color: red">*</span></span
                        >
                    </v-row> -->
                    <!-- <v-row class="mb-3">
                        <v-autocomplete
                            v-model="cardConfig['date']"
                            return-object
                            :items="listColumn"
                            item-text="headerName"
                            dense
                            :placeholder="$t('v2.kanban.selectControl')"
                            outlined
                            solo
                            flat
                            hide-details
                            :disabled="action == 'view'"
                            append-icon="mdi-chevron-down"
                        >
                        </v-autocomplete>
                    </v-row> -->
                    <v-row class="justify-space-between">
                        <v-col class="pb-0 pt-0" style="max-width: 200px">
                            <v-row class="mb-1">
                                <span class="title-control-card"
                                    >{{
                                        $t('scheduler.card_config.start_date')
                                    }}
                                    <span style="color: red">*</span></span
                                >
                            </v-row>
                            <v-row class="mb-3">
                                <v-autocomplete
                                    v-model="cardConfig['start_date']"
                                    return-object
                                    :items="listColumn"
                                    dense
                                    item-text="headerName"
                                    :placeholder="$t('v2.kanban.selectControl')"
                                    outlined
                                    solo
                                    flat
                                    hide-details
                                    :disabled="action == 'view'"
                                    append-icon="mdi-chevron-down"
                                    clearable
                                >
                                </v-autocomplete>
                            </v-row>
                        </v-col>

                        <v-col class="pb-0 pt-0" style="max-width: 200px">
                            <v-row class="mb-1">
                                <span class="title-control-card"
                                    >{{
                                        $t('scheduler.card_config.start_time')
                                    }}
                                    <span style="color: red">*</span></span
                                >
                            </v-row>
                            <v-row class="mb-3">
                                <v-autocomplete
                                    v-model="cardConfig['start_time']"
                                    return-object
                                    :items="listColumn"
                                    dense
                                    item-text="headerName"
                                    :placeholder="$t('v2.kanban.selectControl')"
                                    outlined
                                    solo
                                    flat
                                    hide-details
                                    :disabled="action == 'view'"
                                    append-icon="mdi-chevron-down"
                                    clearable
                                >
                                </v-autocomplete>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row class="justify-space-between">
                        <v-col class="pb-0 pt-0" style="max-width: 200px">
                            <v-row class="mb-1">
                                <span class="title-control-card"
                                    >{{ $t('scheduler.card_config.end_date') }}
                                    <span style="color: red">*</span></span
                                >
                            </v-row>
                            <v-row class="mb-3">
                                <v-autocomplete
                                    v-model="cardConfig['end_date']"
                                    return-object
                                    :items="listColumn"
                                    dense
                                    item-text="headerName"
                                    :placeholder="$t('v2.kanban.selectControl')"
                                    outlined
                                    solo
                                    flat
                                    hide-details
                                    :disabled="action == 'view'"
                                    append-icon="mdi-chevron-down"
                                    clearable
                                >
                                </v-autocomplete>
                            </v-row>
                        </v-col>

                        <v-col class="pb-0 pt-0" style="max-width: 200px">
                            <v-row class="mb-1">
                                <span class="title-control-card"
                                    >{{ $t('scheduler.card_config.end_time') }}
                                    <span style="color: red">*</span></span
                                >
                            </v-row>
                            <v-row class="mb-3">
                                <v-autocomplete
                                    v-model="cardConfig['end_time']"
                                    return-object
                                    :items="listColumn"
                                    item-text="headerName"
                                    dense
                                    :placeholder="$t('v2.kanban.selectControl')"
                                    outlined
                                    solo
                                    flat
                                    hide-details
                                    :disabled="action == 'view'"
                                    append-icon="mdi-chevron-down"
                                    clearable
                                >
                                </v-autocomplete>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row class="mb-1">
                        <span class="title-control-card">{{
                            $t('scheduler.card_config.user')
                        }}</span>
                    </v-row>
                    <v-row class="mb-3">
                        <v-autocomplete
                            v-model="cardConfig['user']"
                            return-object
                            :items="listColumn"
                            item-text="headerName"
                            dense
                            :placeholder="$t('v2.kanban.selectControl')"
                            outlined
                            solo
                            flat
                            hide-details
                            :disabled="action == 'view'"
                            append-icon="mdi-chevron-down"
                            clearable
                        >
                        </v-autocomplete>
                    </v-row>

                    <v-row class="mb-1">
                        <span class="title-control-card">{{
                            $t('scheduler.card_config.type')
                        }}</span>
                    </v-row>
                    <v-row class="mb-3">
                        <v-autocomplete
                            v-model="cardConfig['type']"
                            return-object
                            :items="listColumn"
                            item-text="headerName"
                            dense
                            :placeholder="$t('v2.kanban.selectControl')"
                            outlined
                            solo
                            flat
                            hide-details
                            :disabled="action == 'view'"
                            append-icon="mdi-chevron-down"
                            clearable
                        >
                        </v-autocomplete>
                    </v-row>

                    <v-row class="mb-1">
                        <span class="title-control-card">{{
                            $t('scheduler.card_config.other')
                        }}</span>
                    </v-row>
                    <v-row class="mb-3">
                        <v-autocomplete
                            v-model="cardConfig['other']"
                            return-object
                            :items="listColumn"
                            item-text="headerName"
                            dense
                            :placeholder="$t('v2.kanban.selectControl')"
                            outlined
                            solo
                            flat
                            hide-details
                            :disabled="action == 'view'"
                            append-icon="mdi-chevron-down"
                            clearable
                        >
                        </v-autocomplete>
                    </v-row>
                </div>
            </v-card>
        </div>

        <div
            :style="{
                height: '490px',
                marginLeft: '25px',
                width: '454px',
                'white-space': 'nowrap'
            }"
        >
            <span style="font-size: 13px; font-weight: 500">{{
                $t('scheduler.conditional_format.title')
            }}</span>

            <ConditionalFormatting
                :conditionalFormat="conditionalFormat"
                :tableColumns="customDataFormat"
                @change-apply="changeApply"
                @change-format="changeFormat"
                :isConfigCard="true"
                :disable="action == 'view'"
                :isBorder="true"
                @add-conditonal-format="addConditonalFormat"
                @config-conditional-format="configConditionalFormat"
                :allControlInDoc="listColumn"
                :isConfigCardScheduler="true"
            />
        </div>
        <SymperDialogConfirm
            @confirm="confirmDeleteInfo.confirm()"
            @cancel="confirmDeleteInfo.cancel()"
            :title="confirmDeleteInfo.title"
            :content="confirmDeleteInfo.content"
            :showDialog="confirmDeleteInfo.show"
            :titleCancelBtn="$t('v2.doc.exit')"
            :titleConfirmBtn="$t('v2.doc.delete')"
            :colorCancelBtn="'#000000'"
            :colorConfirmBtn="'#ED6B5F'"
        />
    </div>
</template>
<script>
import AddConditionalFormatting from '@/components/common/listItemComponents/AddConditionalFormatting';
import ConditionalFormatting from '@/components/common/listItemComponents/ConditionalFormatting';
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
export default {
    components: {
        ConditionalFormatting,
        AddConditionalFormatting,
        SymperDialogConfirm
    },
    props: {
        rowData: {
            type: Array,
            default() {
                return [];
            }
        },
        headerPrefixKeypath: {
            type: String,
            default: ''
        },
        cardConfig: {
            type: Object,
            default() {
                return {};
            }
        },
        docId: {
            type: String,
            default: ''
        },
        conditionalFormatConfig: {
            type: Array,
            default() {
                return [];
            }
        },
        listColumn: {
            type: Array,
            default: []
        },
        action: {
            type: String,
            default: 'create'
        }
    },
    mounted() {},
    data() {
        return {
            conditionalFormat: [],
            confirmDeleteInfo: {
                title: '',
                content: '',
                cancel() {},
                confirm() {},
                show: false
            },
            isConfigFormat: false
        };
    },
    watch: {
        conditionalFormatConfig: {
            immediate: true,
            handler(vl) {
                this.conditionalFormat = vl;
            }
        }
    },
    methods: {
        changeApply(data) {
            this.$emit('change-apply', data);
        },
        changeFormat(data) {
            let index = data.index;
            switch (data.type) {
                case 'delete':
                    let self = this;
                    this.confirmDeleteInfo.show = true;
                    this.confirmDeleteInfo.title = this.$t('v2.kanban.deleteFormat');
                    this.confirmDeleteInfo.content =
                        this.$t('v2.kanban.deleteFormat') +
                        this.conditionalFormat[index].nameGroup +
                        this.$t('v2.kanban.deleteFromListFormats')
                    this.confirmDeleteInfo.confirm = () => {
                        self.confirmDeleteInfo.show = false;
                        self.conditionalFormat = self.conditionalFormat.filter(
                            (c, i) => i != index
                        );
                        this.$emit('change-format', this.conditionalFormat);
                    };
                    this.confirmDeleteInfo.cancel = () => {
                        self.confirmDeleteInfo.show = false;
                    };
                    break;
            }
        },
        addConditonalFormat() {
            this.isConfigFormat = false;
        },
        configConditionalFormat() {
            this.isConfigFormat = true;
        }
    },
    computed: {
        customDataFormat() {
            let fieldCards = [];
            Object.keys(this.cardConfig).map((cardKey) => {
                let card = this.cardConfig[cardKey];
                fieldCards.push(card);
            });
            return fieldCards;
        }
    }
};
</script>
<style scoped>
.title-control-card {
    font-size: 13px;
    color: black;
}
.card-scheduler-config >>> .v-input__slot {
    min-height: 32px !important;
    font-size: 13px !important;
}
.card-scheduler-config >>> .v-icon {
    font-size: 17px !important;
}
.card-scheduler-config >>> .v-icon.mdi-close {
    font-size: 15px !important;
    margin-right: -12px;
}
</style>
