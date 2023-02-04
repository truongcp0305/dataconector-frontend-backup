<template>
    <div class="d-flex flex-row">
        <div>
            <span style="font-size: 13px; font-weight: 500">{{
                $t('kanban.card_config.card_config')
            }}</span>
            <v-card
                color="#B5B5B5"
                max-height="500"
                max-width="720"
                class="mt-1"
            >
                <div class="pa-2 pt-0 card-kanban-config">
                    <v-row class="pa-4 pl-6 pb-0 pt-0" style="height: 68px">
                        <v-col class="pr-6 pt-2" style="max-width: 173px">
                            <v-row>
                                <span class="title-control-card"
                                    >{{
                                        $t(
                                            'kanban.card_config.mother_card_identifier'
                                        )
                                    }}
                                    <span style="color: red">*</span></span
                                >
                            </v-row>
                            <v-row>
                                <v-autocomplete
                                    v-model="
                                        cardConfig['mother_card_identifier']
                                    "
                                    return-object
                                    :items="listColumn"
                                    item-text="headerName"
                                    dense
                                    :placeholder="$t('v2.kanban.selectControl')"
                                    solo
                                    flat
                                    :disabled="action == 'view'"
                                    append-icon="mdi-chevron-down"
                                    clearable
                                >
                                </v-autocomplete>
                            </v-row>
                        </v-col>

                        <v-col class="pt-2" style="max-width: 330px">
                            <v-row>
                                <span class="title-control-card"
                                    >{{
                                        $t(
                                            'kanban.card_config.mother_card_title'
                                        )
                                    }}
                                    <span style="color: red">*</span></span
                                >
                            </v-row>
                            <v-row>
                                <v-autocomplete
                                    v-model="cardConfig['mother_card_title']"
                                    return-object
                                    :items="listColumn"
                                    item-text="headerName"
                                    dense
                                    :placeholder="$t('v2.kanban.selectControl')"
                                    solo
                                    flat
                                    :disabled="action == 'view'"
                                    append-icon="mdi-chevron-down"
                                    clearable
                                >
                                </v-autocomplete>
                            </v-row>
                        </v-col>
                    </v-row>

                    <div
                        class="mx-auto"
                        style="background-color: white; border-radius: 4px"
                    >
                        <div class="pa-6 pt-2 pb-0">
                            <v-row>
                                <span class="title-control-card"
                                    >{{ $t('kanban.card_config.priority') }}
                                    <span style="color: red">*</span></span
                                >
                            </v-row>
                            <v-row>
                                <v-autocomplete
                                    v-model="cardConfig['priority']"
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
                                    style="max-width: 160px"
                                    append-icon="mdi-chevron-down"
                                    clearable
                                >
                                </v-autocomplete>
                            </v-row>
                            <v-row>
                                <span class="title-control-card"
                                    >{{ $t('kanban.card_config.title') }}
                                    <span style="color: red">*</span></span
                                >
                            </v-row>
                            <v-row>
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
                                    style="max-width: 502px"
                                    append-icon="mdi-chevron-down"
                                    clearable
                                >
                                </v-autocomplete>
                            </v-row>
                            <v-row>
                                <v-col
                                    class="pr-6 pt-0 pb-2"
                                    style="max-width: 184px"
                                >
                                    <v-row>
                                        <span class="title-control-card"
                                            >{{
                                                $t('kanban.card_config.user')
                                            }}
                                            <span style="color: red"
                                                >*</span
                                            ></span
                                        >
                                    </v-row>
                                    <v-row>
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
                                </v-col>
                                <v-col
                                    class="pr-15 pt-0 pb-2"
                                    style="max-width: 308px"
                                >
                                    <v-row>
                                        <span class="title-control-card"
                                            >{{
                                                $t('kanban.card_config.time')
                                            }}
                                            <span style="color: red"
                                                >*</span
                                            ></span
                                        >
                                    </v-row>
                                    <v-row>
                                        <v-autocomplete
                                            v-model="cardConfig['time']"
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
                                            style="max-width: 184px"
                                            append-icon="mdi-chevron-down"
                                            clearable
                                        >
                                        </v-autocomplete>
                                    </v-row>
                                </v-col>
                                <v-col
                                    style="max-width: 250px"
                                    class="pt-0 pb-2"
                                >
                                    <v-row>
                                        <span class="title-control-card"
                                            >{{
                                                $t('kanban.card_config.date')
                                            }}
                                            <span style="color: red"
                                                >*</span
                                            ></span
                                        >
                                    </v-row>
                                    <v-row>
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
                                            clearable
                                        >
                                        </v-autocomplete>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </div>
                    </div>
                </div>
            </v-card>
        </div>

        <div
            :style="{
                height: isConfigFormat ? '630px' : '360px',
                marginLeft: '25px',
                width: '470px',
                'white-space': 'nowrap'
            }"
        >
            <span style="font-size: 13px; font-weight: 500">{{
                $t('kanban.card_config.card_format')
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
            default: []
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
                        this.$t('v2.kanban.deleteFromListFormats');
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
.card-kanban-config >>> .v-input__slot {
    min-height: 32px !important;
    font-size: 13px !important;
}
.card-kanban-config >>> .v-icon {
    font-size: 17px !important;
}
.card-kanban-config >>> .v-icon.mdi-close {
    font-size: 15px !important;
    margin-right: -12px;
}
</style>
