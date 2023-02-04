<template>
    <div class="stepper">
        <v-stepper v-model="stepper" vertical>
            <!-- step-1 -->
            <v-stepper-step
                color="#FB7E00"
                :complete="maxStep > 0"
                class="fs-13"
                step="1"
                @click="stepper = 1"
            >
                {{ tabConfig[0].text }}
                <small class="btn-action">{{
                    $t(tabConfig[0].description)
                }}</small>
            </v-stepper-step>
            <v-stepper-content step="1">
                <MatchingItemConfigTable
                    @change-input-body="changeInputBody"
                    @remove-table="removeTable"
                    @change-name="changeNameSourceArea"
                    @change-name-target="changeNameTargetAndResultArea"
                    :data="matchingItemsData"
                    :listControl="listControl"
                />
                <div>
                    <span v-show="disableStep1" class="color-red fs-13">{{
                        disableStep1
                    }}</span>
                </div>

                <v-btn
                    small
                    :disabled="disableStep1 ? true : false"
                    v-show="maxStep <= 1"
                    color="primary"
                    class="mb-5"
                    @click="clickStep2"
                    >{{ $t('common.continue') }}</v-btn
                >
            </v-stepper-content>
            <v-stepper-step
                color="#FB7E00"
                class="fs-13"
                :complete="!disableStep1"
                step="2"
                @click="clickStep2"
            >
                {{ tabConfig[1].text }}
                <small class="btn-action">{{
                    $t(tabConfig[1].description)
                }}</small>
            </v-stepper-step>
            <v-stepper-content step="2">
                <MatchingItemConfigColumn :data="matchingItemsData" />
            </v-stepper-content>
        </v-stepper>
    </div>
</template>
<script>
import MatchingItemConfigColumn from './MatchingItemConfigColumn';
import MatchingItemConfigTable from './MatchingItemConfigTable';

export default {
    name: 'MatchingItemBA',
    components: {
        MatchingItemConfigColumn,
        MatchingItemConfigTable
    },
    props: {
        listControl: {
            type: Array,
            defautl: () => {
                return [];
            }
        },
        data: {
            type: Object,
            defautl: () => {
                return {};
            }
        }
    },
    watch: {
        data: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (Object.keys(vl).length > 0) {
                    this.matchingItemsData = vl;
                }
            }
        },
        matchingItemsData: {
            deep: true,
            immediate: true,
            handler: function () {
                this.checkValidate();
            }
        }
    },
    data() {
        return {
            matchingItemsData: {
                nameSourceArea: '',
                nameTargetAndResultArea: '',
                sourceTables: {
                    tb1: {
                        formula: '',
                        quantityColumn: '',
                        name: '',
                        colSearch: [],
                        col: [],
                        rowGroup: [],
                        identityColumn: ''
                    },
                    tb2: {
                        formula: '',
                        quantityColumn: '',
                        name: '',
                        colSearch: [],
                        col: [],
                        rowGroup: []
                    }
                },
                targetAndResultTable: {
                    col: [],
                    rowGroup: [],
                    colSearch: []
                },
                isDuplicateData: false,
                formulaValidate: '',
                formulaUpdate: ''
            },
            disableStep1: false,
            stepper: 1,
            maxStep: 0,
            tabConfig: [
                {
                    key: 'general_info',
                    text: this.$t('document.editor.matchingItem.config_table'),
                    description: this.$t(
                        'document.editor.matchingItem.config_table_des'
                    )
                },
                {
                    key: 'config_column',
                    text: this.$t('document.editor.matchingItem.config_column'),
                    description: this.$t(
                        'document.editor.matchingItem.config_column_des'
                    )
                }
            ]
        };
    },
    methods: {
        clickStep2() {
            if (!this.disableStep1) {
                this.stepper = 2;
            }
        },
        checkValidate() {
            this.disableStep1 = false
            if (this.matchingItemsData.nameSourceArea.length > 100) {
                this.disableStep1 = this.$t(
                    'document.editor.matchingItem.max_length_for'
                ).replace('{number}', 100);
            }
            if (this.matchingItemsData.nameTargetAndResultArea.length > 100) {
                this.disableStep1 = this.$t(
                    'document.editor.matchingItem.max_length_for'
                ).replace('{number}', 100);
            }
            Object.keys(this.matchingItemsData.sourceTables).map(tb => {
                let dataSourceTb = this.matchingItemsData.sourceTables[tb];
                if (dataSourceTb.name == '') {
                    this.disableStep1 =
                        this.$t('validate.required') +
                        ' ' +
                        this.$t('common.name') +
                        ' ' +
                        this.$t('common.table')
                }else if (dataSourceTb.name.length > 100) {
                    this.disableStep1 =
                        this.$t('common.name') +
                        ' ' +
                        this.$t('validate.max_100');
                }else if (!dataSourceTb.identityColumn) {
                    this.disableStep1 =
                        this.$t('validate.required') +
                        ' ' +
                        this.$t(
                            'document.editor.matchingItem.identity_column'
                        ) +
                        ' ' +
                        this.$t('common.table')
                }
            });
        },
        refreshData() {
            this.stepper = 1;
        },
        changeNameSourceArea(name) {
            this.data.nameSourceArea = name;
        },
        changeInputBody() {
            this.checkValidate();
        },
        removeTable(name) {
            this.data.sourceTables = name;
        },
        changeNameTargetAndResultArea(name) {
            this.data.nameTargetAndResultArea = name;
        }
    }
};
</script>
<style scoped>
.v-stepper {
    box-shadow: unset !important;
}
.v-stepper__content {
    width: calc(100%-500px);
    padding: 0px 0px 0px 10px !important;
}
.v-stepper__step:hover {
    background: #80808026;
    border-radius: 191px;
}
.v-stepper__step {
    margin-left: 8px !important;
    padding: 10px;
    margin: 15px !important;
}
.stepper {
    max-height: 100%;
    overflow: scroll;
}
.btn-action {
    font-size: 11px;
    color: grey;
    margin-top: 8px;
}
</style>