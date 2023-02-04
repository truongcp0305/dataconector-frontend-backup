<template>
    <div
        :style="{
            display: 'block!important',
            width: lazyWidth + '!important',
            height: lazyHeight + '!important',
            backgroundColor:
                $store.state.formulaEditor.loadedMonacoStatus == 'loaded'
                    ? ''
                    : '#f3f3f3',
        }"
    >
        <div
            class="symper-monaco-editor h-100 w-100"
            ref="monacoWrapper"
            :id="keyInstance"
        ></div>
    </div>
</template>

<script>
import setStaticCompletion from './modules/sql/staticCompletionItems';
import { documentApi } from '../../../api/Document';
import { util } from '../../../plugins/util';
import { format } from 'sql-formatter';

export default {
    data() {
        return {
            keyInstance: '',
            editor: null,
            languages: null,
            mapTypeToMonaco: null,
            staticCompletionItems: [],
        };
    },
    methods: {
        focus() {
            this.editor.focus();
        },
        disposeSuggestion() {
            if (this.suggestionsRegister) {
                this.suggestionsRegister.dispose();
            }
        },
        getSuggestionItems() {
            let rsl = [];
            for (let kind in this.listKeyworks) {
                if (!this.mapTypeToMonaco.hasOwnProperty(kind)) {
                    let list = Object.keys(this.mapTypeToMonaco).join(', ');
                    console.error(
                        `"${kind}" does not exist expected key list including: ${list}`,
                    );
                } else {
                    for (let item of this.listKeyworks[kind]) {
                        item =
                            typeof item == 'string'
                                ? {
                                      label: item,
                                      kind: this.mapTypeToMonaco[kind],
                                      insertText: item,
                                      sortText: 'a',
                                  }
                                : item;

                        rsl.push({
                            label: item.label,
                            kind: this.mapTypeToMonaco[kind],
                            insertText: item.insertText
                                ? item.insertText
                                : item.label,
                            sortText: 'a',
                        });
                    }
                }
            }
            return rsl;
        },
        listenEditorEvents() {
            let self = this;
            this.editor.onDidChangeCursorSelection((e) => {
                self.$emit('on-change-selection');
            });

            this.editor.onDidBlurEditorText((e) => {
                self.$emit('blur');
                self.disposeSuggestion();
            });

            this.editor.onDidFocusEditorText((e) => {
                self.$emit('focus');
                let items = self.getSuggestionItems();
                self.initSuggestion(items);
            });

            this.editor.onDidChangeModelContent((e) => {
                let vl = self.getValue();
                self.selfChange = true;
                self.$emit('input', vl);
                self.$emit('change', vl);
                if (this.completionDiv) {
                    this.completionDiv.css('visibility', 'hidden');
                }
                if (self.debouceChangeCompletionPosition) {
                    clearTimeout(self.debouceChangeCompletionPosition);
                }
                setTimeout(() => {
                    self.checkLoadItems();
                }, 0);
            });
        },
        checkLoadItems() {
            let startTime = Date.now();
            let pos = this.editor.getPosition();
            let lineContent = this.model.getLineContent(pos.lineNumber);
            let nearestWord = [];
            for (let i = pos.column - 1; i--; i >= 0) {
                if (lineContent[i] != ' ') {
                    nearestWord.unshift(lineContent[i]);
                } else {
                    break;
                }
            }

            nearestWord = nearestWord.join('');
            if (nearestWord) {
                this.loadRemoteItems(nearestWord);
            }
        },
        async loadRemoteItems(keyword) {
            let loadedItems =
                this.$store.state.formulaEditor.addedCompletionItems;
            let key = `doc:${keyword}`;
            if (loadedItems[key] && !loadedItems[key].loadedField) {
                loadedItems[key].loadedField = true;
                let res = await documentApi.getFieldByDocId(keyword);
                if (res.status == 200) {
                    this.$store.commit(
                        'formulaEditor/addCompletionItemsForDocControls',
                        {
                            docName: keyword,
                            controls: res.data,
                        },
                    );
                } else {
                    this.$snotifyError(
                        res,
                        this.$t('v2.doc.cannotGetFieldsOfDoc') + keyword,
                    );
                }
            }
        },
        getSelectedText() {
            return this.model.getValueInRange(this.editor.getSelection());
        },
        getValue() {
            return this.model.getValue();
        },
        setReadOnly(readOnly = true) {
            this.editor.updateOptions({ readOnly: readOnly });
        },
        initSuggestion(suggestions) {
            if (suggestions && suggestions.length) {
                this.suggestionsRegister =
                    this.languages.registerCompletionItemProvider('sql', {
                        provideCompletionItems: (model, position) => {
                            var word = model.getWordUntilPosition(position);
                            var range = {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: word.startColumn,
                                endColumn: word.endColumn,
                            };
                            for (let item of suggestions) {
                                item.range = range;
                            }
                            return {
                                suggestions,
                            };
                        },
                    });
            }
        },
        setStaticCompletionItems() {
            if (!this.$store.state.formulaEditor.didSetStaticCompletionItems) {
                this.languages.registerCompletionItemProvider('sql', {
                    provideCompletionItems: (model, position) => {
                        var suggestions = this.staticCompletionItems;
                        var word = model.getWordUntilPosition(position);
                        var range = {
                            startLineNumber: position.lineNumber,
                            endLineNumber: position.lineNumber,
                            startColumn: word.startColumn,
                            endColumn: word.endColumn,
                        };
                        for (let item of suggestions) {
                            item.range = range;
                        }
                        return { suggestions: suggestions };
                    },
                });
                this.$store.state.formulaEditor.didSetStaticCompletionItems = true;
            }
        },
        formatQuery() {
            monaco.languages.registerDocumentFormattingEditProvider('sql', {
                provideDocumentFormattingEdits: function (
                    model,
                    options,
                    token,
                ) {
                    var formatted = format(model.getValue(), {
                        indent: ' '.repeat(options.tabSize),
                    });
                    return [
                        {
                            range: model.getFullModelRange(),
                            text: formatted,
                        },
                    ];
                },
            });
            this.editor.trigger('editor', 'editor.action.formatDocument');
        },
        createMonaco() {
            let self = this;

            let editorOption = Object.assign(
                {
                    language: 'sql',
                    value: self.value,
                    wordWrap: 'on',
                    fontSize: 12,
                    automaticLayout: true,
                    quickSuggestions: true,
                    fixedOverflowWidgets: true,
                },
                self.options,
            );
            self.editor = monaco.editor.create(
                document.getElementById(self.keyInstance),
                editorOption,
            );
            self.languages = monaco.languages;
            self.staticCompletionItems = setStaticCompletion();
            self.$store.commit(
                'formulaEditor/setGlobalMonacoEditorLanuages',
                self.languages,
            );
            self.$store.dispatch('document/setListDocuments');
            self.mapTypeToMonaco = {
                columns: self.languages.CompletionItemKind.Keyword,
                table: self.languages.CompletionItemKind.Keyword,
                docs: self.languages.CompletionItemKind.Keyword,
                controls: self.languages.CompletionItemKind.Keyword,
                common: self.languages.CompletionItemKind.Keyword,
            };

            // Register a completion item provider for the new language
            self.setStaticCompletionItems();
            self.$emit('init', self.editor);
            self.listenEditorEvents();
            self.model = self.editor.getModel();
        },
        loadMonacoEditor() {
            let self = this;
            let formulaEditorData = self.$store.state.formulaEditor;
            if (formulaEditorData.loadedMonacoStatus == 'loaded') {
                self.createMonaco();
            } else if (formulaEditorData.loadedMonacoStatus == 'not_load') {
                formulaEditorData.loadedMonacoStatus = 'loading';
                if (window.require) {
                    window.require.paths = {
                        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.31.1/min/vs',
                    };
                } else {
                    window.require = {
                        paths: {
                            vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.31.1/min/vs',
                        },
                    };
                }
                $.when(
                    $.getScript(
                        'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.31.1/min/vs/loader.min.js',
                    ),
                    $.getScript(
                        'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.31.1/min/vs/editor/editor.main.nls.js',
                    ),
                    $.getScript(
                        'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.31.1/min/vs/editor/editor.main.js',
                    ),
                    // $.getScript('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.31.1/min/vs/language/typescript/tsMode.js'),
                    // $.getScript('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs/basic-languages/javascript/javascript.js')
                )
                    .done(function () {
                        let waitForJQuery = setInterval(function () {
                            if (typeof monaco !== 'undefined') {
                                clearInterval(waitForJQuery);
                                self.$evtBus.$emit('create-monaco-editor');
                                formulaEditorData.loadedMonacoStatus = 'loaded';
                            }
                        }, 10);
                    })
                    .catch((err) => {
                        debugger;
                    });
            }
        },
    },
    mounted() {
        this.loadMonacoEditor();
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        listKeyworks: {
            type: Object,
            default() {
                return {
                    columns: [],
                    table: [],
                    docs: [],
                    controls: [],
                    common: [],
                };
            },
        },
        height: {
            default: '100%',
        },
        width: {
            default: '100%',
        },
        options: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    computed: {
        lazyWidth() {
            return isNaN(this.width) ? this.width : this.width + 'px';
        },
        lazyHeight() {
            return isNaN(this.height) ? this.height : this.height + 'px';
        },
    },
    watch: {
        options: {
            deep: true,
            immediate: true,
            handler(newValue) {
                if (this.editor) {
                    this.editor.updateOptions(newValue);
                }
            },
        },
        value(vl) {
            if (!this.selfChange) {
                this.model.setValue(vl);
            }
            this.selfChange = false;
        },
        height() {
            setTimeout(
                (self) => {
                    self.editor.layout();
                },
                300,
                this,
            );
        },
        width() {
            setTimeout(
                (self) => {
                    self.editor.layout();
                },
                300,
                this,
            );
        },
    },
    created() {
        this.keyInstance = util.str.randomString(6);
        this.$evtBus.$on('create-monaco-editor', () => {
            this.createMonaco();
        });
    },
};
</script>

<style>
@import 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.31.1/min/vs/editor/editor.main.min.css';
.symper-monaco-editor .monaco-list-row.show-file-icons.string-label {
    visibility: visible !important;
}
</style>
