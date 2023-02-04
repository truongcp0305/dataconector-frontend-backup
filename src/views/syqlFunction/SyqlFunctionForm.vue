<template>
    <div
        class="w-100 h-100 d-flex flex-column form-syql-function"
        :class="{ 'form-syql-function-disable': action == 'view' }"
    >
        <div class="d-flex fs-13" style="height: calc(100vh - 70px)">
            <div class="content-function flex-grow-1">
                <div class="p-2 d-flex flex-column">
                    <div class="d-flex w-100">
                        <div style="width: 30%" class="d-flex flex-column">
                            <span class="title-type"> {{$t('v2.syql.name')}} </span>
                            <div class="d-flex mt-1">
                                <div style="width: 200px">
                                    <v-text-field
                                        v-model="formData.valueName"
                                        single-line
                                        class="fs-13"
                                        solo
                                    ></v-text-field>
                                </div>
                            </div>
                        </div>
                        <div style="width: 70%" class="d-flex flex-column ml-1">
                            <div class="title-type ml-1">{{$t('v2.syql.returns')}}</div>
                            <div class="d-flex mt-1">
                                <div class="ml-1" style="width: 100px">
                                    <v-autocomplete
                                        solo
                                        v-model="formData.valueSetOf"
                                        :items="
                                            dataAutocomplete.returnForm
                                                .formSetOf
                                        "
                                        item-text="title"
                                        item-value="value"
                                    ></v-autocomplete>
                                </div>
                                <div class="ml-1" style="width: 250px">
                                    <v-autocomplete
                                        solo
                                        v-model="formData.valueReturns"
                                        :items="
                                            dataAutocomplete.returnForm
                                                .formReturns
                                        "
                                    ></v-autocomplete>
                                </div>
                                <div
                                    class="ml-1 fixed-autocomplete"
                                    style="width: 70px"
                                >
                                    <v-autocomplete
                                        solo
                                        v-model="formData.valueArray"
                                        :items="
                                            dataAutocomplete.returnForm
                                                .formArray
                                        "
                                        item-text="title"
                                        item-value="value"
                                    ></v-autocomplete>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="position: relative">
                        <span class="title-type"> {{$t('v2.syql.parameter')}} </span>
                        <div style="height: 150px" class="d-flex flex-column">
                            <div class="d-flex">
                                <div style="width: 125px">{{$t('v2.syql.mode')}}</div>
                                <div style="width: 212px">{{$t('v2.syql.nameUppercase')}}</div>
                                <div>{{$t('v2.syql.type')}}</div>
                            </div>
                            <VuePerfectScrollbar
                                class="mt-1"
                                style="height: 130px; margin-right: -6px"
                            >
                                <div
                                    class="d-flex"
                                    v-for="(item, i) in formData.agruments"
                                    :key="i"
                                >
                                    <div style="width: 120px">
                                        <v-autocomplete
                                            solo
                                            v-model="
                                                formData.agruments[i]
                                                    .valueArgModes
                                            "
                                            :items="
                                                dataAutocomplete.formArgModes
                                            "
                                        ></v-autocomplete>
                                    </div>
                                    <div class="ml-1" style="width: 210px">
                                        <v-text-field
                                            single-line
                                            class="fs-13"
                                            v-model="
                                                formData.agruments[i]
                                                    .valueArgName
                                            "
                                            solo
                                        ></v-text-field>
                                    </div>
                                    <div class="d-flex">
                                        <div class="ml-1" style="width: 170px">
                                            <v-autocomplete
                                                solo
                                                v-model="
                                                    formData.agruments[i]
                                                        .valueArgType
                                                "
                                                :items="
                                                    dataAutocomplete.returnForm
                                                        .formReturns
                                                "
                                            ></v-autocomplete>
                                        </div>
                                        <div
                                            class="ml-1 fixed-autocomplete"
                                            style="width: 70px"
                                        >
                                            <v-autocomplete
                                                solo
                                                :items="
                                                    dataAutocomplete.returnForm
                                                        .formArray
                                                "
                                                item-text="title"
                                                v-model="
                                                    formData.agruments[i]
                                                        .valueArgArray
                                                "
                                                item-value="value"
                                            ></v-autocomplete>
                                        </div>
                                    </div>
                                    <div class="d-flex mt-1 ml-2">
                                        <v-btn icon tile x-small @click="up(i)">
                                            <v-icon> mdi-chevron-up </v-icon>
                                        </v-btn>
                                        <v-btn
                                            icon
                                            tile
                                            x-small
                                            @click="down(i)"
                                        >
                                            <v-icon> mdi-chevron-down </v-icon>
                                        </v-btn>
                                        <v-btn
                                            icon
                                            tile
                                            x-small
                                            @click="removeAgrument(i)"
                                        >
                                            <v-icon> mdi-close </v-icon>
                                        </v-btn>
                                    </div>
                                </div>
                            </VuePerfectScrollbar>
                        </div>
                        <div class="d-flex">
                            <div class="flex-grow-1 d-flex mt-1">
                                <v-icon small> mdi-plus </v-icon>
                                <span
                                    class="fs-12 add-another-agrument"
                                    @click="addAnotherAgrument"
                                >
                                {{$t('v2.syql.addAnotherArgument')}}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style="height: 150px" class="mt-1">
                            <FormTpl :allInputs="formData.definition" />
                        </div>
                    </div>
                    <div>
                        <span class="title-type"> {{$t('v2.syql.functionCosting')}} </span>
                        <div class="d-flex">
                            <div style="width: 50%" class="d-flex flex-column">
                                <span class="fs-12"> {{$t('v2.syql.executionCost')}} </span>
                                <div class="d-flex mt-1">
                                    <div style="width: 200px">
                                        <v-text-field
                                            single-line
                                            v-model="formData.executionCost"
                                            class="fs-13"
                                            solo
                                        ></v-text-field>
                                    </div>
                                </div>
                            </div>
                            <div style="width: 50%" class="d-flex flex-column">
                                <span class="fs-12"> {{$t('v2.syql.resultRows')}} </span>
                                <div class="d-flex mt-1">
                                    <div style="width: 200px">
                                        <v-text-field
                                            single-line
                                            class="fs-13"
                                            v-model="formData.resultRows"
                                            solo
                                        ></v-text-field>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <span class="title-type"> {{$t('v2.syql.properties')}} </span>
                        <div class="d-flex mt-1">
                            <div style="width: 200px">
                                <v-autocomplete
                                    solo
                                    v-model="formData.properties[0]"
                                    :items="dataAutocomplete.properties[0]"
                                ></v-autocomplete>
                            </div>
                            <div class="ml-1" style="width: 200px">
                                <v-autocomplete
                                    solo
                                    v-model="formData.properties[1]"
                                    :items="dataAutocomplete.properties[1]"
                                ></v-autocomplete>
                            </div>
                            <div class="ml-1" style="width: 200px">
                                <v-autocomplete
                                    solo
                                    v-model="formData.properties[2]"
                                    :items="dataAutocomplete.properties[2]"
                                ></v-autocomplete>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="comment-area">
                <div class="mt-2 ml-2 mb-1">
                    {{$t('v2.syql.note')}}
                    <v-icon
                        class="fs-13 float-right mr-2"
                        @click="showCommentArea"
                        v-show="action != 'add'"
                    >
                        mdi-comment-outline
                    </v-icon>
                </div>
                <div class="ml-1 comment-content mb-10">
                    <Editor ref="editorBox" />
                </div>
                <div
                    v-show="showComment && action != 'add'"
                    class="syql-comment-wrapper"
                    style="transform: translateX(400px)"
                >
                    <Comment
                        :showComment="true"
                        :objectIdentifier="syqlId"
                        :objectType="'syql-function'"
                        :height="'95%'"
                        :width="'350px'"
                        :buttonClose="true"
                        @close-comment="hideComment"
                    />
                </div>
            </div>
        </div>
        <div>
            <v-btn
                class="float-right mr-2 mt-2"
                small
                v-if="action != 'view'"
                depressed
                color="primary"
                @click="saveSyqlFunction"
            >
                <v-icon class="mr-2" primary>mdi-content-save</v-icon>
                {{ action == 'add' ? $t('common.save') : $t('common.update') }}
            </v-btn>
        </div>
        <DebugDialog :showDialog="showDialog" @cancel="showDialog = false" />
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
import FomulaEditor from '@/components/formula/editor/FormulaEditor';
import DebugDialog from './DebugDialog';
import { syqlFunctionApi } from '@/api/SyqlFunction';
import FormTpl from '@/components/common/FormTpl';
import Editor from '@/components/common/editor/Editor';
import Comment from '@/components/common/comment/Comment';
export default {
    components: {
        VuePerfectScrollbar,
        FomulaEditor,
        DebugDialog,
        FormTpl,
        Editor,
        Comment,
    },
    props: {
        action: {
            type: String,
            default: '',
        },
        syqlId: {
            type: String,
            default: '',
        },
    },
    computed: {
        sDetailFuntion() {
            let sData = this.$store.state.SyqlFunction;
            return sData.detailFunction[sData.currentFunctionId]
                ? sData.detailFunction[sData.currentFunctionId]
                : {};
        },
    },
    watch: {
        sDetailFuntion: {
            deep: true,
            immediate: true,
            handler(arr) {
                if (arr.config) {
                    this.restoreFormdata(arr.config);
                }
            },
        },
        action(val) {
            if (val == 'add') {
                this.$refs.editorBox.setData('');
                this.formData = {
                    valueName: '',
                    valueSetOf: '',
                    valueReturns: '',
                    valueArray: '',
                    agruments: [
                        {
                            valueArgModes: '',
                            valueArgName: '',
                            valueArgType: '',
                            valueArgArray: '',
                        },
                    ],
                    definition: {
                        definition: {
                            title: this.$t('v2.syql.deninition'),
                            type: 'script',
                            value: '',
                            info: '',
                        },
                    },
                    executionCost: '',
                    resultRows: '',
                    properties: {
                        0: '',
                        1: '',
                        2: '',
                    },
                };
            }
        },
    },
    methods: {
        showCommentArea() {
            this.showComment = true;
            setTimeout(
                (self) => {
                    $('.syql-comment-wrapper').css({
                        transform: 'translateX(0px)',
                    });
                },
                10,
                this,
            );
        },
        hideComment() {
            setTimeout(
                (self) => {
                    self.showComment = false;
                },
                250,
                this,
            );
        },
        showDebugDialog() {
            this.$refs.fomulaEditor.toggleDebugView();
        },
        restoreFormdata(config) {
            let configs = JSON.parse(config);
            this.formData = configs.formData;
            this.$refs.editorBox.setData(configs.contentComment);
        },
        addAnotherAgrument() {
            let obj = {
                valueArgModes: '',
                valueArgName: '',
                valueArgType: '',
                valueArgArray: '',
            };
            this.formData.agruments.push(obj);
        },
        removeAgrument(index) {
            this.formData.agruments.splice(index, 1);
        },
        up(index) {
            var f = this.formData.agruments.splice(index, 1)[0];
            this.formData.agruments.splice(index - 1, 0, f);
        },
        down(index) {
            var f = this.formData.agruments.splice(index, 1)[0];
            this.formData.agruments.splice(index + 1, 0, f);
        },
        validateForm() {
            let self = this;
            if (this.formData.valueName == '') {
                this.$snotify({
                    type: 'error',
                    title: this.$t('v2.syql.functionNameCantBeEmpty'),
                });
                return false;
            } else if (this.formData.agruments.length > 0) {
                let flag = true;
                this.formData.agruments.forEach(function (e) {
                    if (
                        e.valueArgModes == '' ||
                        e.valueArgName == '' ||
                        e.valueArgType == ''
                    ) {
                        self.$snotify({
                            type: 'error',
                            title: this.$t('v2.syql.fieldInArgumentCantBeEmpty'),
                        });
                        flag = false;
                    }
                });
                return flag;
            } else {
                return true;
            }
            // if(this.formData.valueDefinition == ""){
            // 	this.$snotify({
            // 		type: "error",
            // 		title: "Không được bỏ trống definition"
            // 	})
            // 	return
            // }
        },
        saveSyqlFunction() {
            let flag;
            flag = this.validateForm();
            if (flag == true) {
                let strAgruments = '';
                let arr = [];
                if (this.formData.agruments.length > 0) {
                    this.formData.agruments.forEach(function (e) {
                        let str =
                            e.valueArgModes +
                            ' ' +
                            e.valueArgName +
                            ' ' +
                            e.valueArgType +
                            e.valueArgArray;
                        arr.push(e.valueArgName);
                        strAgruments += str + ',';
                    });
                    strAgruments = strAgruments.slice(0, -1);
                }
                let costStr =
                    this.formData.executionCost != ''
                        ? 'COST ' + this.formData.executionCost + ' '
                        : '';
                let rowStr =
                    this.formData.resultRows != ''
                        ? 'ROWS ' + this.formData.resultRows + ' '
                        : '';
                let sqls =
                    'CREATE FUNCTION "public"."' +
                    this.formData.valueName +
                    '" (' +
                    strAgruments +
                    ') RETURNS ' +
                    this.formData.valueSetOf +
                    ' ' +
                    this.formData.valueReturns +
                    this.formData.valueArray +
                    ' AS ' +
                    `'` +
                    this.formData.definition.definition.value +
                    "'" +
                    ' LANGUAGE "sql" ' +
                    costStr +
                    rowStr +
                    this.formData.properties[0] +
                    ' ' +
                    this.formData.properties[1] +
                    ' ' +
                    this.formData.properties[2];
                let self = this;
                let contentComment = this.$refs.editorBox.getData();
                let config = {
                    formData: this.formData,
                    contentComment: contentComment,
                };
                let form = {
                    name: this.formData.valueName,
                    parameter: arr.length > 0 ? arr.toString() : '',
                    content: sqls,
                    description: 'test',
                    status: 1,
                    config: JSON.stringify(config),
                };
                if (this.action == 'add') {
                    this.addFunction(form);
                } else {
                    this.editFunction(form);
                }
            }
        },
        addFunction(form) {
            let self = this;
            syqlFunctionApi
                .addFunction(form)
                .then((res) => {
                    if (res.status == 200) {
                        self.$emit('add-success');
                        self.$snotify({
                            type: 'success',
                            title: this.$t('v2.syql.addFunctioneSuccess'),
                        });
                    } else {
                        self.$snotify({
                            type: 'error',
                            title: res.message,
                        });
                    }
                })
                .catch((err) => {
                    self.$snotify({
                        type: 'error',
                        title: err,
                    });
                });
        },
        editFunction(form) {
            let self = this;
            let id = this.$store.state.SyqlFunction.currentFunctionId;
            syqlFunctionApi
                .editFunction(id, form)
                .then((res) => {
                    if (res.status == 200) {
                        self.$emit('add-success');
                        self.$snotify({
                            type: 'success',
                            title: this.$t('v2.syql.editFunctioneSuccess'),
                        });
                    } else {
                        self.$snotify({
                            type: 'error',
                            title: res.message,
                        });
                    }
                })
                .catch((err) => {
                    self.$snotify({
                        type: 'error',
                        title: err,
                    });
                });
        },
    },
    data() {
        return {
            showComment: false,
            showDialog: false,
            boxComment: {
                boxComment: {
                    title: '',
                    type: 'editor',
                    info: '',
                },
            },
            formData: {
                valueName: '',
                valueSetOf: '',
                valueReturns: '',
                valueArray: '',
                agruments: [
                    {
                        valueArgModes: '',
                        valueArgName: '',
                        valueArgType: '',
                        valueArgArray: '',
                    },
                ],
                definition: {
                    definition: {
                        title: this.$t('v2.syql.deninition'),
                        type: 'script',
                        value: '',
                        info: '',
                    },
                },
                executionCost: '',
                resultRows: '',
                properties: {
                    0: '',
                    1: '',
                    2: '',
                },
            },
            dataAutocomplete: {
                returnForm: {
                    formSetOf: [
                        {
                            title: '',
                            value: '',
                        },
                        {
                            title: this.$t('v2.syql.setof'),
                            value: 'SETOF',
                        },
                    ],
                    formReturns: [
                        'abstime',
                        'aclitem',
                        '"any"',
                        'anyarray',
                        'anyelement',
                        'anyenum',
                        'anynonarray',
                        'anyrange',
                        'bigint',
                        'bit',
                        'bit varying',
                        'boolean',
                        'box',
                        'bytea',
                        '"char"',
                        'character',
                        'character varying',
                        'cid',
                        'cidr',
                        'circle',
                        'cstring',
                        'date',
                        'daterange',
                        'double precision',
                        'event_trigger',
                        'favorite',
                        'favorite_file',
                        'favorite_folder',
                        'fdw_handler',
                        'file',
                        'folder',
                        'gtsvector',
                        'history',
                        'index_am_handler',
                        'inet',
                        'information_schema.administrable_role_authorizations',
                        'information_schema.applicable_roles',
                        'information_schema.attributes',
                        'information_schema.cardinal_number',
                        'information_schema.character_data',
                        'information_schema.character_sets',
                        'information_schema.check_constraint_routine_usage',
                        'information_schema.check_constraints',
                        'information_schema.collation_character_set_applicability',
                        'information_schema.collations',
                        'information_schema.column_domain_usage',
                        'information_schema.column_options',
                        'information_schema.column_privileges',
                        'information_schema.columns',
                        'information_schema.column_udt_usage',
                        'information_schema.constraint_column_usage',
                        'information_schema.constraint_table_usage',
                        'information_schema.data_type_privileges',
                        'information_schema.domain_constraints',
                        'information_schema.domains',
                        'information_schema.domain_udt_usage',
                        'information_schema.element_types',
                        'information_schema.enabled_roles',
                        'information_schema.foreign_data_wrapper_options',
                        'information_schema.foreign_data_wrappers',
                        'information_schema.foreign_server_options',
                        'information_schema.foreign_servers',
                        'information_schema.foreign_table_options',
                        'information_schema.foreign_tables',
                        'information_schema.information_schema_catalog_name',
                        'information_schema.key_column_usage',
                        'information_schema.parameters',
                        'information_schema.referential_constraints',
                        'information_schema.role_column_grants',
                        'information_schema.role_routine_grants',
                        'information_schema.role_table_grants',
                        'information_schema.role_udt_grants',
                        'information_schema.role_usage_grants',
                        'information_schema.routine_privileges',
                        'information_schema.routines',
                        'information_schema.schemata',
                        'information_schema.sequences',
                        'information_schema.sql_features',
                        'information_schema.sql_identifier',
                        'information_schema.sql_implementation_info',
                        'information_schema.sql_languages',
                        'information_schema.sql_packages',
                        'information_schema.sql_parts',
                        'information_schema.sql_sizing',
                        'information_schema.sql_sizing_profiles',
                        'information_schema.table_constraints',
                        'information_schema.table_privileges',
                        'information_schema.tables',
                        'information_schema.time_stamp',
                        'information_schema.transforms',
                        'information_schema.triggered_update_columns',
                        'information_schema.triggers',
                        'information_schema.udt_privileges',
                        'information_schema.usage_privileges',
                        'information_schema.user_defined_types',
                        'information_schema.user_mapping_options',
                        'information_schema.user_mappings',
                        'information_schema.view_column_usage',
                        'information_schema.view_routine_usage',
                        'information_schema.views',
                        'information_schema.view_table_usage',
                        'information_schema.yes_or_no',
                        'int2vector',
                        'int4range',
                        'int8range',
                        'integer',
                        'internal',
                        'interval',
                        'json',
                        'jsonb',
                        'language_handler',
                        'line',
                        'link',
                        'lseg',
                        'macaddr',
                        'macaddr8',
                        'money',
                        'name',
                        'numeric',
                        'numrange',
                        'oid',
                        'oidvector',
                        'opaque',
                        'path',
                        'permission',
                        'pg_ddl_command',
                        'pg_dependencies',
                        'pg_lsn',
                        'pg_ndistinct',
                        'pg_node_tree',
                        'point',
                        'polygon',
                        'real',
                        'record',
                        'refcursor',
                        'regclass',
                        'regconfig',
                        'regdictionary',
                        'regnamespace',
                        'regoper',
                        'regoperator',
                        'regproc',
                        'regprocedure',
                        'regrole',
                        'regtype',
                        'reltime',
                        'smallint',
                        'smgr',
                        'tag_file',
                        'tag_folder',
                        'text',
                        'tid',
                        'timestamp without time zone',
                        'timestamp with time zone',
                        'time without time zone',
                        'time with time zone',
                        'tinterval',
                        'trigger',
                        'tsm_handler',
                        'tsquery',
                        'tsrange',
                        'tstzrange',
                        'tsvector',
                        'txid_snapshot',
                        'unknown',
                        '"user"',
                        'uuid',
                        'void',
                        'xid',
                        'xml',
                    ],
                    formArray: [
                        {
                            title: '',
                            value: '',
                        },
                        {
                            title: '[]',
                            value: '[]',
                        },
                    ],
                },
                formArgModes: ['IN', 'OUT', 'INOUT'],
                properties: {
                    0: ['', 'VOLATILE', 'IMMUTABLE', 'STABLE'],
                    1: [
                        '',
                        'CALLED ON NULL INPUT',
                        'RETURNS NULL ON NULL INPUT',
                    ],
                    2: ['', 'SECURITY INVOKER', 'SECURITY DEFINER'],
                },
            },
        };
    },
};
</script>

<style scoped>
.content-function {
    border: 1px solid lightgray;
}
.comment-area {
    width: 300px;
    border: 1px solid lightgray;
    border-left: unset !important;
}
.form-syql-function >>> .v-text-field__details {
    display: none !important;
}
.form-syql-function >>> .v-input__slot {
    box-shadow: unset !important;
    min-height: unset !important;
    border: 1px solid lightgray;
}
.form-syql-function-disable >>> .v-input__slot,
.form-syql-function-disable >>> .tox-tinymce {
    pointer-events: none;
}
.form-syql-function-disable >>> .symper-form-input {
    font: 13px !important;
    font-weight: 500 !important;
}
.form-syql-function >>> .v-input__slot input {
    font-size: 13px !important;
}
.form-syql-function >>> .v-input__control {
    min-height: unset !important;
}
.form-syql-function >>> .title-type {
    font-weight: 500;
}
.form-syql-function >>> .comment-content {
    height: calc(100vh - 106px);
}
.form-syql-function >>> .fixed-autocomplete .v-icon {
    display: none;
}
.form-syql-function >>> .tox-tinymce {
    height: calc(100vh - 106px) !important;
}
.form-syql-function >>> .tox-statusbar__path {
    display: none !important;
}
.form-syql-function >>> .v-list-item__title {
    font-size: 13px !important;
}
.form-syql-function >>> .add-another-agrument {
    cursor: pointer;
}
.form-syql-function >>> .syql-comment-wrapper {
    border: 1px solid lightgray;
    position: absolute;
    top: 0;
    right: 0;
    width: 380px;
    height: 100%;
    background: white;
    z-index: 9999;
    padding: 12px 6px 6px 11px;
    transition: all ease-in-out 250ms;
    /* -webkit-box-shadow: -9px 1px 16px 0px rgba(0,0,0,0.75); */
    /* -moz-box-shadow: -9px 1px 16px 0px rgba(0,0,0,0.75); */
    /* box-shadow: -9px 1px 16px 0px rgba(0,0,0,0.75); */
}
</style>
<style>
.v-list-item__title {
    font-size: 13px !important;
}
</style>
