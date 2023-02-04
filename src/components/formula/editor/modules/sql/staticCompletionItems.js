import { sqlDef } from './sql';

export default function () {
    let staticItems = [];
    let languages = monaco.languages;
    let mapType = {
        keywords: {
            type: languages.CompletionItemKind.Keyword,
        },
        operators: {
            type: languages.CompletionItemKind.Operator,
        },
        builtinFunctions: {
            type: languages.CompletionItemKind.Function,
        },
        builtinVariables: {
            type: languages.CompletionItemKind.Variable,
        },
        variables: {
            type: languages.CompletionItemKind.Variable,
        },
    };

    for (let type in mapType) {
        if (sqlDef[type]) {
            for (let word of sqlDef[type]) {
                if (type != 'variables') {
                    staticItems.push({
                        label: word,
                        kind: languages.CompletionItemKind.Keyword,
                        insertText: word,
                        sortText: 'c',
                    });
                } else {
                    staticItems.push({
                        label: word,
                        kind: languages.CompletionItemKind.Keyword,
                        insertText: '{' + word + '}',
                        sortText: 'b',
                    });
                }
            }
        }
    }
    return staticItems;
}
