<template>
    <div class="validate-config mb-4">
        <FormTpl :allInputs="validateConfigs" />
    </div>
</template>
<script>
import FormTpl from '@/components/common/FormTpl.vue';
export default {
    components: {
        FormTpl
    },
    props: {
        nodeData: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            listKeyworks: {}
        };
    },
    computed: {
        validateConfigs() {
            if (this.nodeData?.configs?.validateConfigs) {
                let groupKeys = Object.keys(
                    this.nodeData?.configs?.validateConfigs
                );
                groupKeys.forEach((key) => {
                    this.nodeData.configs.validateConfigs[key].title.includes(
                        'v2.dataflow.'
                    )
                        ? (this.nodeData.configs.validateConfigs[key].title =
                              this.$t(
                                  this.nodeData.configs.validateConfigs[key]
                                      .title
                              ))
                        : '';
                });
            }

            return this.nodeData.configs.validateConfigs;
        }
    },
    watch: {
        'nodeData.input': {
            deep: true,
            handler(nodeData) {
                this.setListKeyword(nodeData);
            }
        }
    },
    mounted() {
        this.setListKeyword(this.nodeData.input);
    },
    methods: {
        setListKeyword(inputs) {
            let rsl = [];
            for (let col of inputs) {
                rsl.push({
                    label: `${col.columnName}: ${col.title}`,
                    insertText: `[${col.columnName}]`
                });
            }
            this.nodeData.configs.validateConfigs.validateFormula.listKeyworks =
                {
                    columns: rsl
                };
            this.nodeData.configs.validateConfigs.objectQuery.listKeyworks = {
                columns: rsl
            };
        }
    }
};
</script>

<style scoped></style>
