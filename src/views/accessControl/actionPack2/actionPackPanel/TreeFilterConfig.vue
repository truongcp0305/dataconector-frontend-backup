<template>
    <div>
        <div class="d-flex justify-space-between mr-16">
            <span span class="fw-430 fs-13 ml-3"
                >{{ $t('v2.acessControl.groupFilterAndAction') }}
                {{ index + 1 }}</span
            >
            <span span class="fs-430">
                <v-btn
                    icon
                    small
                    @click="deleteFilter"
                    :disabled="action == 'view' ? true : false"
                    ><v-icon :size="13">mdi-close</v-icon></v-btn
                >
            </span>
        </div>
        <div class="action">
            <v-autocomplete
                return-object
                class="autocomplete-action symper-autocomplete-input"
                item-text="headerName"
                item-value="field"
                v-model="filters.actions"
                :items="actions"
                dense
                chips
                deletable-chips
                small-chips
                :label="$t('v2.acessControl.chooseAction')"
                multiple
                solo
                :disabled="action == 'view'"
            >
            </v-autocomplete>
        </div>
        <TreeSqlConfig
            :customCss="true"
            :showCondition="false"
            class="tree-config"
            :hideCondition="true"
            ref="treeConfig"
            :defaultData="filters.conditions"
            :listColumn="listFilters"
            :disabled="action == 'view' ? true : false"
        />
    </div>
</template>
<script>
import TreeSqlConfig from '@/views/document/sideright/items/TreeSqlConfig';

export default {
    components: {
        TreeSqlConfig
    },
    created() {},
    methods: {
        deleteFilter() {
            this.$emit('delete-filter', this.index);
        }
    },
    props: {
        action: {
            type: String,
            default: 'create'
        },
        index: {
            type: Number,
            default: 1
        },
        actions: {
            type: Array,
            default() {
                return [];
            }
        },
        filters: {
            type: Object,
            default() {
                return {};
            }
        },
        listFilters: {
            type: Array,
            default() {
                return [];
            }
        }
    }
};
</script>
<style scoped>
.autocomplete-action >>> .v-input__slot {
    width: 350px !important;
    box-shadow: unset !important;
    background: #fbfbfb !important;
    border: 1px solid #f2f2f2 !important;
    margin-left: 12px !important;
}
.autocomplete-action ::v-deep .v-select__slot {
    width: 400px !important;
}
.autocomplete-action >>> .v-input__control {
    min-height: 26px !important;
}
.tree-config {
    width: 460px;
    margin-top: -20px;
    margin-bottom: -10px;
}
.autocomplete-action >>> .v-chip__close {
    font-size: 14px !important;
}
.autocomplete-action >>> .v-input__slot {
    padding: 4px !important;
}
.v-list-item__action {
    margin: 0 !important;
}
.autocomplete-action >>> .theme--light.v-label {
    color: rgba(0, 0, 0, 0.6) !important;
}
.autocomplete-action >>> .v-select.v-input--dense .v-chip {
    margin: 0 4px 0 0;
}
.autocomplete-action >>> .v-input__slot {
    padding: 0 4px !important;
}
.autocomplete-action >>> .v-list-item__action:first-child {
    margin-right: 8px !important;
}
.autocomplete-action >>> .mdi-checkbox-marked {
    font-size: 18px !important;
}
::v-deep .v-list-item {
    min-height: 32px !important;
    padding: 0 10px !important;
}
::v-deep .v-list-item__action {
    margin-right: 12px !important;
}
</style>
