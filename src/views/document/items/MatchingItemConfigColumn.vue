<template>
    <div class="matching-item-config-column pa-1">
        <div class="d-flex flex-start align-center pl-1">
            <span class="fs-13">{{
                $t('document.editor.matchingItem.duplicate_value')
            }}</span>
            <v-switch
                :ripple="false"
                inset
                dense
                color="#FF8003"
                flat
                class="m-0 ml-5"
                v-model="isDuplicateData"
                hide-details
                @click="changeSwitch()"
            ></v-switch>
        </div>
        <FormTpl
            style="width: 400px"
            class="select-control pa-1"
            :titleSize="'medium'"
            @input-value-changed="changeInput"
            :allInputs="allInputs"
        />
    </div>
</template>
<script>
import FormTpl from '@/components/common/FormTpl.vue';
export default {
    name: 'MatchingItemConfigColumn',
    components: {
        FormTpl
    },
    props: {
        data: {
            type: Object,
            defautl: () => {
                return {};
            }
        }
    },
    data() {
        return {
            isDuplicateData: false,
            allInputs: {
                formulaValidate: {
                    title: this.$t(
                        'document.editor.matchingItem.formula_validate'
                    ),
                    type: 'script',
                    value: ''
                },
                formulaUpdate: {
                    title: this.$t(
                        'document.editor.matchingItem.formula_update'
                    ),
                    type: 'script',
                    value: '',
                    hidden: false
                }
            }
        };
    },
    created() {},
    watch: {
        'data.isDuplicateData': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.isDuplicateData = vl;
                if (vl) {
                    this.allInputs.formulaUpdate.hidden = true;
                } else {
                    this.allInputs.formulaUpdate.hidden = false;
                    this.allInputs.formulaUpdate.value = '';
                }
            }
        },
        'data.formulaValidate': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.allInputs.formulaValidate.value = vl;
            }
        },
        'data.formulaUpdate': {
            deep: true,
            immediate: true,
            handler: function (vl) {
                this.allInputs.formulaUpdate.value = vl;
            }
        }
    },

    methods: {
        changeSwitch() {
            this.data.isDuplicateData = this.isDuplicateData;
        },
        changeInput(name, inputInfo, data) {
            this.data[name] = inputInfo.value;
        }
    }
};
</script>