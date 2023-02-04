<template>
    <div class="pa-3">
        <div class="d-flex justify-space-between align-center mb-2">
            <span class="fw-430 fs-15">
                {{ $t('permissions.config_filter_and_action') }}
                <v-icon
                    :size="15"
                    class="mb-1 mx-2"
                    style="margin-top: 3px"
                    @click="showIconInfo = true"
                    >mdi-information-outline</v-icon
                >
            </span>
            <span class="fw-430 fs-15">
                <v-btn small color="success" depressed @click="saveFilter">
                    <span>{{ $t('common.save') }}</span>
                </v-btn>
                <span>
                    <v-btn small class="ml-2" icon @click="close">
                        <v-icon text :size="14">mdi-close</v-icon>
                    </v-btn>
                </span>
            </span>
        </div>
        <div>
            <SymperAlert
                class="mt-2"
                v-show="showIconInfo"
                :context="filterInfo"
                @hide="showIconInfo = false"
            />
        </div>
        <div class="condition-tree" style="overflow: hidden">
            <!-- <div class="fs-13 ml-15 mb-2"  v-show="showEditor">{{$t("permissions.content_notifying_when_input_not_satisfied")}}</div> -->
            <!-- <FormulaEditor
                class="formular-editor"
                v-show="showEditor"
                v-model="editor"
                ref="edtFormula"
                :height="'100px'"
            ></FormulaEditor> -->
            <!-- <v-textarea
                class="sym-small-size sym-small-lineheight mx-15"
                dense
                solo
                flat
                style="border:1px solid lightgrey"
                v-show="showEditor"
                ref="edtFormula"
                v-model="editor">
            </v-textarea> -->
            <div v-for="(filter, idx) in value" :key="idx" class="mt-2">
                <TreeFilterConfig
                    @delete-filter="deleteFilter"
                    class="tree-filter-config ml-12"
                    :index="idx"
                    :item="item"
                    :filter="filter"
                />
            </div>
        </div>
        <div class="add-condition d-flex justify-center">
            <v-btn
                text
                color="warning"
                depressed
                dark
                small
                class="fs-13 fw-400 mt-1"
                @click="addCondition()"
            >
                {{ $t('permissions.add_config_filter') }}
            </v-btn>
        </div>
    </div>
</template>
<script>
import FormulaEditor from '@/components/formula/editor/FormulaEditor';
import SymperAlert from '@/components/common/SymperAlert.vue';
import TreeFilterConfig from './TreeFilterConfig';

export default {
    watch: {},
    methods: {
        setData(data) {
            this.value = data;
        },
        getData() {
            return this.value;
        },
        close() {
            this.$emit('close');
            this.editor = '';
        },
        addCondition() {
            this.$emit('add-filter');
        },
        saveFilter() {
            // if(this.value.length > 0){
            this.$emit('save-filter', this.value);
            // }else{
            //     this.$snotifyError("", 'Không thể lưu khi chưa chọn filter')
            // }
        },
        deleteFilter(index) {
            this.$emit('delete-filter', index);
        },
        hideObjectTypeInfo() {},
    },
    created() {},
    components: {
        TreeFilterConfig,
        FormulaEditor,
        SymperAlert,
    },
    props: {
        showEditor: {
            type: Boolean,
            default: false,
        },
        item: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            showIconInfo: true,
            editor: '',
            value: [
                {
                    conditions: [
                        {
                            id: 'root',
                            name: 'AND',
                            root: true,
                            label: 'AND',
                            parent: false,
                            children: [
                                {
                                    id: Date.now(),
                                    condition: false,
                                    name: '',
                                    parent: 'root',
                                    formulas: '',
                                    nodeType: 'item',
                                    operator: '=',
                                },
                            ],
                            nodeType: 'group',
                            condition: true,
                        },
                    ],
                    actions: [],
                },
            ],
            filterInfo: ` 
            ${this.$t('v2.acessControl.filterInforTitle')}
         </br>${this.$t('v2.acessControl.filterInfor')}`,
        };
    },
};
</script>
<style scoped>
.formular-editor {
    margin: 0 60px !important;
    width: 350px;
}
</style>
