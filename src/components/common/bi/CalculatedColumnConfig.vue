<template>
    <div
        v-if="showConfigs"
        :style="{ top: top + 'px', right: '250px' }"
        class="caculated-column-config d-flex flex-column pt-1 pl-3 pr-3"
    >
        <FormTpl
            :titleSize="'normal'"
            :allInputs="commonInputs"
            @input-value-changed="handleValueChange"
        />

        <div class="mt-2 mb-2 d-flex flex-row-reverse">
            <v-btn small color="primary" class="ml-2" @click="applyConfigs">
                {{ $t('common.apply') }}
            </v-btn>
            <v-btn small color="error" @click="hide">
                {{ $t('common.cancel') }}
            </v-btn>
        </div>
    </div>
</template>

<script>
import FormTpl from '@/components/common/FormTpl.vue';
import { util } from '@/plugins/util';
export default {
    components: {
        FormTpl,
    },

    methods: {
        setKeywordSuggestion(columns) {
            let items = [];
            for (let col of columns) {
                items.push({
                    label: `${col.name}: ${col.title}`,
                    insertText: `[${col.name}]`,
                });
            }
            this.commonInputs.formula.listKeyworks = {
                columns: items,
            };
        },
        show(inforColumn, event) {
            let obj = util.cloneDeep(inforColumn);

            for (let i in this.commonInputs) {
                this.commonInputs[i].value = obj[i];
            }
            let h = window.innerHeight;

            if (h - event.y < 200) {
                this.top = h - 350;
            } else {
                this.top = event.y - 150;
            }
            this.showConfigs = true;
        },
        hide() {
            this.showConfigs = false;
        },
        applyConfigs() {
            let obj = {};
            for (let i in this.commonInputs) {
                obj[i] = this.commonInputs[i].value;
            }
            this.$emit('apply-configs', obj);
            this.hide();
        },
        handleValueChange() {},
    },
    data() {
        return {
            showConfigs: false,
            inforColumn: null,
            top: 0,
            commonInputs: {
                name: {
                    title: this.$t('common.name'),
                    type: 'text',
                    value: '',
                },
                title: {
                    title: this.$t('common.title'),
                    type: 'text',
                    value: '',
                },
                formula: {
                    title: this.$t('v2.bi.formula'),
                    type: 'script',
                    value: '',
                },
                type: {
                    title: this.$t('v2.bi.dataType'),
                    type: 'autocomplete',
                    value: '',
                    options: [
                        {
                            id: 'date',
                            name: 'date',
                        },
                        {
                            id: 'number',
                            name: 'number',
                        },
                        {
                            id: 'text',
                            name: 'text',
                        },
                    ],
                },
            },
        };
    },
};
</script>

<style scoped>
.caculated-column-config {
    width: 320px;
    height: 330px;
    position: absolute;
    background-color: #ffffff;
    z-index: 100000;
    border: 1px solid lightgray;
}
</style>
