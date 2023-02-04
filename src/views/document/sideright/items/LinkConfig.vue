<template>
    <div class="s-list-link">
        <div
            class="s-list-link__item"
            v-for="(item, index) in listConfig"
            :key="index"
        >
            <p>Link1</p>
            <div>
                <div class="title-input">{{$t('v2.doc.objectType')}}</div>
                <v-autocomplete
                    :items="listObject"
                    v-model="item.objectType"
                    item-text="title"
                    return-object
                    item-value="name"
                    @change="saveConfig"
                    dense
                    solo
                ></v-autocomplete>
            </div>
            <div class="mt-2 mb-2">{{$t('v2.doc.formulaGetLink')}}</div>
            <div class="formula-content">
                <FormulaEditor
                    ref="edtFormula"
                    class="sym-small-size"
                    :simpleMode="true"
                    v-model="item.formula.value"
                    @change="saveConfig"
                    :height="'80px'"
                ></FormulaEditor>
            </div>
            <div class="mt-2 mb-1">
                <div class="title-input">{{$t('v2.doc.displayTitle')}}</div>
                <v-text-field
                    v-model="item.title"
                    dense
                    @change="saveConfig"
                    solo
                ></v-text-field>
            </div>
        </div>

        <div>
            <button v-show="false" class="btn-add-config" @click="addItem">
                {{$t('v2.doc.add')}}
            </button>
        </div>
    </div>
</template>
<script>
import FormulaEditor from '@/components/formula/editor/FormulaEditor';

export default {
    components: {
        FormulaEditor,
    },
    props: {
        dataConfig: {
            type: Array,
        },
    },
    watch: {
        dataConfig: {
            deep: true,
            immediate: true,
            handler: function (vl) {
                if (vl && vl.length > 0) {
                    this.listConfig = vl;
                } else {
                    this.listConfig = [
                        {
                            objectType: null,
                            formula: { id: 0, value: '', instance: Date.now() },
                            title: '',
                        },
                    ];
                }
            },
        },
    },
    data() {
        return {
            listObject: [
                { type: 'document', title: this.$t('v2.doc.text') },
                { type: 'report', title: this.$t('v2.doc.report') },
            ],
            listConfig: [
                {
                    objectType: null,
                    formula: { id: 0, value: '', instance: Date.now() },
                    title: '',
                },
            ],
        };
    },
    methods: {
        addItem() {
            this.listConfig.push({
                objectType: null,
                formula: { id: 0, value: '', instance: Date.now() },
                title: '',
            });
        },
        saveConfig() {
            this.$emit('change', this.listConfig);
        },
    },
};
</script>
<style scoped>
.s-list-link {
    font-size: 11px !important;
}
.s-list-link__item .title-input {
    width: 80px;
    display: inline-block;
    margin-right: 2px;
}
.s-list-link__item > p {
    font-weight: 500;
}
.s-list-link__item {
    border: var(--symper-border);
    margin: 4px;
    padding: 4px;
}
.s-list-link__item >>> .v-input {
    display: inline-block;
    width: calc(100% - 86px);
}
.s-list-link__item >>> .v-input__icon--append {
    display: none;
}
.s-list-link__item >>> .v-input__slot {
    padding: 0 6px !important;
    box-shadow: unset !important;
}
.s-list-link__item >>> .v-select__slot {
    padding: 0 !important;
    font-size: 11px !important;
}
.formula-content {
    border: var(--symper-border);
}
.btn-add-config {
    float: right;
    margin: 0 6px 2px 0;
    padding: 0 4px;
    border-radius: 2px;
}
.btn-add-config:focus {
    outline: none;
}
</style>
