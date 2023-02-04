var defaultKeywords = [];
let funcs = [
    {
        caption: 'char_length',
        value: 'char_length()',
        docHTML: 'Number of characters in string',
    },
    {
        caption: 'lower',
        value: 'lower()',
        docHTML: 'Convert string to lower case',
    },
    {
        caption: 'position',
        value: 'position(substring in string)',
        docHTML: 'Location of specified substring',
    },
    {
        caption: 'position',
        value: 'substring(string from int for int])',
        docHTML: 'Extract substring',
    },
    {
        caption: 'upper',
        value: 'upper(string)',
        docHTML: 'Convert string to upper case',
    },
    {
        caption: 'concat',
        value: 'concat(string1,string2)',
        docHTML: 'Concatenate all arguments. NULL arguments are ignored.',
    },
    {
        caption: 'initcap',
        value: 'initcap(string)',
        docHTML:
            'Convert the first letter of each word to upper case and the rest to lower case.',
    },
    {
        caption: 'length',
        value: 'length(string)',
        docHTML: 'Number of characters in string',
    },
    {
        caption: 'left',
        value: 'left(str text, n int)',
        docHTML:
            '	Return first n characters in the string. When n is negative, return all but last |n| characters.',
    },
    {
        caption: 'right',
        value: 'right(str text, n int)',
        docHTML:
            'Return last n characters in the string. When n is negative, return all but first |n| characters.',
    },
];
funcs = funcs.map((el) => {
    el.meta = 'function';
    return el;
});

let keywords = [
    'ADD',
    'ADD CONSTRAINT',
    'ALTER',
    'ALTER COLUMN',
    'ALTER TABLE',
    'ALL',
    'AND',
    'ANY',
    'AS',
    'ASC',
    'BACKUP DATABASE',
    'BETWEEN',
    'CASE',
    'CHECK',
    'COLUMN',
    'CONSTRAINT',
    'CREATE',
    'CREATE DATABASE',
    'CREATE INDEX',
    'CREATE OR REPLACE VIEW',
    'CREATE TABLE',
    'CREATE PROCEDURE',
    'CREATE UNIQUE INDEX',
    'CREATE VIEW',
    'DATABASE',
    'DEFAULT',
    'DELETE',
    'DESC',
    'DISTINCT',
    'DROP',
    'DROP COLUMN',
    'DROP CONSTRAINT',
    'DROP DATABASE',
    'DROP DEFAULT',
    'DROP INDEX',
    'DROP TABLE',
    'DROP VIEW',
    'EXEC',
    'EXISTS',
    'FOREIGN KEY',
    'FROM',
    'FULL OUTER JOIN',
    'GROUP BY',
    'HAVING',
    'IN',
    'INDEX',
    'INNER JOIN',
    'INSERT INTO',
    'INSERT INTO SELECT',
    'IS NULL',
    'IS NOT NULL',
    'JOIN',
    'LEFT JOIN',
    'LIKE',
    'LIMIT',
    'NOT',
    'NOT NULL',
    'OR',
    'ORDER BY',
    'OUTER JOIN',
    'PRIMARY KEY',
    'PROCEDURE',
    'RIGHT JOIN',
    'ROWNUM',
    'SELECT',
    'SELECT DISTINCT',
    'SELECT INTO',
    'SELECT TOP',
    'SET',
    'TABLE',
    'TOP',
    'TRUNCATE TABLE',
    'UNION',
    'UNION ALL',
    'UNIQUE',
    'UPDATE',
    'VALUES',
    'VIEW',
    'WHERE',
];
keywords = keywords.reduce((arr, el) => {
    arr.push({
        caption: el,
        value: el,
        docHTML: '',
        meta: 'keyword',
    });
    return arr;
}, []);

defaultKeywords = funcs.concat(keywords);
export default defaultKeywords;
