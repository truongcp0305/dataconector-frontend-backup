<template>
    <div v-if="configLink">
        <p class="fs-13 fw-500 mb-2">{{$t('v2.smartObject.configLink')}}</p>
        <div class="config mb-4">
            <div multiple flat class="fs-13 mb-0">
                <div>
                    <span class="mb-2 fs-13 config-header">
                        {{
                            $t('v2.smartObject.linkDimentuin') +
                            configLink.nameObjectSource +
                            ' - ' +
                            configLink.nameObjectTarget
                        }}
                    </span>
                    <div class="mb-1">
                        <FormTpl
                            :allInputs="configSourceToTarget"
                            :labelWidth="'70px'"
                            :singleLine="true"
                            :titleSize="'medium'"
                        />
                    </div>
                    <input
                        type="checkbox"
                        checked
                        v-model="configLink.config.isViewSourceToTarget"
                    />
                    <label> {{$t('v2.smartObject.showLinkForUser')}}</label>
                </div>

                <div>
                    <span class="mb-2 fs-13 config-header">
                        {{
                            $t('v2.smartObject.linkDimentuin')+
                            configLink.nameObjectTarget +
                            ' - ' +
                            configLink.nameObjectSource
                        }}
                    </span>
                    <div>
                        <FormTpl
                            :allInputs="configTargetToSource"
                            :labelWidth="'70px'"
                            :singleLine="true"
                            :titleSize="'medium'"
                            @input-value-changed="handleChangeInput"
                        />
                    </div>
                    <input
                        type="checkbox"
                        checked
                        v-model="configLink.config.isViewTargetToSource"
                    />
                    <label> {{$t('v2.smartObject.showLinkForUser')}}</label>
                </div>

                <div>
                    <span class="mb-2 fs-13 config-header"> {{$t('v2.smartObject.structure')}}</span>
                    <div class="fs-13 structure-name">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <span
                                    v-on="on"
                                    class="structure-title"
                                    style="text-align: left"
                                    >{{ configLink.titleObjectSource }}</span
                                >
                            </template>
                            <span>{{ configLink.titleObjectSource }}</span>
                        </v-tooltip>

                        <span class="mr-1">
                            <span class="mr-2">-</span> {{$t('v2.smartObject.condition')}}
                            <span class="ml-2">-</span></span
                        >

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <span
                                    v-on="on"
                                    class="structure-title"
                                    style="text-align: right"
                                    >{{ configLink.titleObjectTarget }}</span
                                >
                            </template>
                            <span class="structure-title">{{
                                configLink.titleObjectTarget
                            }}</span>
                        </v-tooltip>
                    </div>
                    <div style="margin-left: -8px">
                        <TreeSqlConfig
                            class="treeSql"
                            :defaultData="configLink.config.structure.condition"
                            :customAutocomplete="true"
                            @change-config="handleChangeConfig"
                            :customCss="true"
                            :dataRight="configLink.allColumnTarget"
                            :dataLeft="configLink.allColumnSource"
                            :disabled="action == 'view' ? true : false"
                            :typeInputRight="'combobox'"
                            :typeInputLeft="'combobox'"
                            :isDoubleAutocomplete="true"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';
import TreeSqlConfig from '@/views/document/sideright/items/TreeSqlConfig';
export default {
    components: {
        TreeSqlConfig,
        FormTpl
    },
    watch: {
        keyConfig: {
            deep: true,
            immediate: true,
            handler: function () {
                this.disabledInput();
            }
        }
    },
    computed: {
        configTargetToSource() {
            let data = this.configLink.config.configTargetToSource;

            data.name.validateStatus.isValid = true;
            data.name.validateStatus.message = '';
            if (data.name.value == '' || data.name.value.trim() == '') {
                data.name.validateStatus.isValid = false;
                data.name.validateStatus.message =
                    this.$t('v2.smartObject.linkNameNotBlank');
            }
            if (data.name.value.length > 30) {
                data.name.validateStatus.isValid = false;
                data.name.validateStatus.message =
                    this.$t('v2.smartObject.linkNameCannotExceed30');
            }
            data.description.validateStatus.isValid = true;
            data.description.validateStatus.message = '';
            if (data.description.value.length > 120) {
                data.description.validateStatus.isValid = false;
                data.description.validateStatus.message =
                    this.$t('v2.smartObject.linkDescriptionCannotExceed120');
            }
            return data;
        },
        configSourceToTarget() {
            let data = this.configLink.config.configSourceToTarget;
            data.name.validateStatus.isValid = true;
            data.name.validateStatus.message = '';
            if (data.name.value == '' || data.name.value.trim() == '') {
                data.name.validateStatus.isValid = false;
                data.name.validateStatus.message =
                    this.$t('v2.smartObject.linkNameNotBlank');
            }
            if (data.name.value.length > 30) {
                data.name.validateStatus.isValid = false;
                data.name.validateStatus.message =
                    this.$t('v2.smartObject.linkNameCannotExceed30');
            }
            data.description.validateStatus.isValid = true;
            data.description.validateStatus.message = '';
            if (data.description.value.length > 120) {
                data.description.validateStatus.isValid = false;
                data.description.validateStatus.message =
                    this.$t('v2.smartObject.linkDescriptionCannotExceed120');
            }
            return data;
        },
        keyConfig() {
            return (
                this.configLink.idColSource +
                this.configLink.idColTarget +
                this.configLink.idObjectSource +
                this.configLink.idObjectTarget
            );
        }
    },
    props: {
        configLink: {
            type: Object,
            default: () => {
                return {};
            }
        },
        action: {
            type: String,
            default: 'view'
        }
    },
    methods: {
        disabledInput() {
            if (this.action == 'view') {
                if (this.configTargetToSource && this.configSourceToTarget) {
                    this.configTargetToSource.name.disabled = true;
                    this.configTargetToSource.description.disabled = true;
                    this.configSourceToTarget.name.disabled = true;
                    this.configSourceToTarget.description.disabled = true;
                }
            } else {
                if (this.configTargetToSource && this.configSourceToTarget) {
                    this.configTargetToSource.name.disabled = false;
                    this.configTargetToSource.description.disabled = false;
                    this.configSourceToTarget.name.disabled = false;
                    this.configSourceToTarget.description.disabled = false;
                }
            }
        },
        changeType(data) {
            for (let key in data) {
                if (
                    data[key].type != 'number' &&
                    data[key].type != 'date' &&
                    data[key].type != 'datetime' &&
                    data[key].type != 'time'
                ) {
                    data[key].type = 'text';
                }
            }
        },
        handleChangeInput(name, input, data) {
            this.$emit('change-input-value', name, input, data);
        },
        handleChangeConfig(data) {
            let where = data ? data.where : '';
            this.configLink.config.structure.sqlQuery = where;
            this.$emit('change-config', data);
        }
    }
};
</script>

<style scoped>
.config >>> .v-text-field__details {
    display: none !important;
}
.config >>> .v-input__control {
    min-height: unset !important;
    margin-bottom: 0px !important;
}
.config >>> .v-input__control .v-input__slot input {
    font-size: 12px !important;
    padding: 8px 12px;
}

.config >>> .treeSql .v-input__slot input {
    font-size: 11px !important;
}
.config >>> .v-input__slot {
    box-shadow: unset !important;
    /* border: 0.5px solid #b5b5b5; */
    /* height: 28px !important; */
    background: #ffffff !important;
    padding: 0 !important;
}

.config >>> .sym-style-input:not(.v-input--checkbox) {
    border: 0.5px solid #b5b5b5 !important;
}
.config
    >>> .sym-small-size.v-autocomplete
    > .v-input__control
    > .v-input__slot {
    padding: 0 !important;
}
.config >>> .v-input--selection-controls {
    margin-top: 0;
}

.config >>> .v-text-field.v-input--dense:not(.v-text-field--outlined) input {
    padding: 8px 0;
    padding-left: 4px;
}

.config >>> .v-select.v-input--dense .v-chip {
    margin: 0 !important;
    padding: 0 !important;
}

.config >>> .v-input__slot .v-icon {
    font-size: 18px !important;
    color: #b5b5b5;
}
.config >>> .v-input {
    flex: unset !important;
}
.config >>> .v-input__append-inner {
    padding: 0 !important;
}
.config >>> .v-textarea.v-text-field--enclosed .v-text-field__slot textarea {
    padding-left: 12px;
    margin-top: 4px !important;
    margin-bottom: 4px !important;
    line-height: 17px !important;
    height: 60px !important;
    overflow-y: scroll !important;
}
.config >>> .config-header {
    position: relative !important;
    width: 100%;
    background: #f2f2f2;
    border-radius: 4px;
    min-height: 24px !important;
    padding: 4px 8px 4px 12px !important;
    display: flex;
    align-items: center;
}

.config >>> .sym-small-size .v-text-field__slot input {
    padding: 8px 12px !important;
}

.config >>> .tree__list-columns .v-input__slot {
    width: 100% !important;
}
.config >>> .tree__list-operations {
    width: 40px !important;
}
.config >>> .tree__list-columns {
    margin-left: unset !important;
    /* width: calc((100% - 56px) / 2) !important; */
}
.config >>> .structure-name {
    display: flex;
    align-items: center;
    justify-content: center;
}
.config >>> .structure-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>