var monacoCompletionItemKind = {
    Method: 0,
    Function: 1,
    Constructor: 2,
    Field: 3,
    Variable: 4,
    Class: 5,
    Struct: 6,
    Interface: 7,
    Module: 8,
    Property: 9,
    Event: 10,
    Operator: 11,
    Unit: 12,
    Value: 13,
    Constant: 14,
    Enum: 15, // custom document
    EnumMember: 16, //doccontroll
    Keyword: 17, //
    Text: 18,
    Color: 19,
    File: 20,
    Reference: 21,
    Customcolor: 22,
    Folder: 23,
    TypeParameter: 24,
    User: 25,
    Issue: 26,
    Snippet: 27,
};
var mappingDocControlWithKind = {
    textInput: monacoCompletionItemKind.Text,
    date: monacoCompletionItemKind.File,
    number: monacoCompletionItemKind.EnumMember,
};

const addCompletionItemsForDocs = (state, docs) => {
    let items = [];
    let word = '';
    let item = {};
    for (let doc of docs) {
        word = ` ${doc.name} (${doc.id} - ${doc.title})`;
        if (!state.addedCompletionItems[doc.name]) {
            item = {
                label: word,
                symperKind: 'doc',
                kind: monacoCompletionItemKind.Enum,
                insertText: doc.name,
            };
            items.push(item);
            state.addedCompletionItems[`doc:${doc.name}`] = item;
        }
    }
    addCompletionItems(state, items);
};

const addCompletionItemsForDocControls = (state, data) => {
    let controls = data.controls;
    let docName = data.docName;
    let items = [];
    let word = '';
    let item = {};
    for (let ctrl of controls) {
        let kind;
        if (mappingDocControlWithKind[ctrl.type]) {
            kind = mappingDocControlWithKind[ctrl.type];
        } else {
            kind = monacoCompletionItemKind.Keyword;
        }
        word = `${docName}.${ctrl.name} (${ctrl.title})`;
        if (!state.addedCompletionItems[ctrl.name]) {
            item = {
                label: word,
                symperKind: 'control',
                kind: kind,
                insertText: ctrl.name,
            };
            items.push(item);
            state.addedCompletionItems[`control:${docName}:${ctrl.name}`] =
                item;
        }
    }
    addCompletionItems(state, items);
};

const addCompletionItems = (state, items) => {
    if (window.monacoEditorLanuages) {
        let languages = window.monacoEditorLanuages;
        languages.registerCompletionItemProvider('sql', {
            provideCompletionItems: (model, position) => {
                var suggestions = items;
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
    } else {
        if (!state.penddingKeywords) {
            state.penddingKeywords = [];
        }
        state.penddingKeywords = state.penddingKeywords.concat(items);
    }
};

const setGlobalMonacoEditorLanuages = (state, languages) => {
    if (!window.monacoEditorLanuages) {
        window.monacoEditorLanuages = languages;
        if (state.penddingKeywords) {
            addCompletionItems(state, state.penddingKeywords);
        }
    }
};

export {
    addCompletionItemsForDocs,
    addCompletionItemsForDocControls,
    addCompletionItems,
    setGlobalMonacoEditorLanuages,
};
