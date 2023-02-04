/**
 */
var mapSpecialCharacter = [
    '(',
    ')',
    '[',
    ']',
    '?',
    '*',
    '^',
    '-',
    '{',
    '}',
    '$',
];

export const str = {
    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hour = d.getHours(),
            minute = d.getMinutes(),
            seconds = d.getSeconds();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return (
            [year, month, day].join('-') +
            ' ' +
            [hour, minute, seconds].join(':')
        );
    },

    nonAccentVietnamese(str, alphabetAndNumOnly = false) {
        str = str.toLowerCase().trim();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ|Đ/g, 'd');
        str = str.replace(/\s+/g, '_');

        // Some system encode vietnamese combining accent as individual utf-8 characters
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
        if (alphabetAndNumOnly) {
            str = str.replace(/\.|-/g, '_').replace(/[^0-9a-zA-Z_]/g, '');
        }
        return str;
    },

    randomString(length = 6) {
        var randomChars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(
                Math.floor(Math.random() * randomChars.length),
            );
        }
        return result;
    },

    getCamelSpaceFromPascalText(str) {
        str = str.replace(/_/g, ' ');
        str = str[0].toUpperCase() + str.slice(1);
        return str;
    },

    toSnakeCase(inputString) {
        return inputString
            .split('')
            .map((character) => {
                if (character == character.toUpperCase()) {
                    return '_' + character.toLowerCase();
                } else {
                    return character;
                }
            })
            .join('');
    },

    hashCode(str) {
        if (Array.prototype.reduce) {
            return str.split('').reduce(function (a, b) {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
        } else {
            var hash = 0,
                i,
                chr,
                len;
            if (str.length == 0) return hash;
            for (i = 0, len = str.length; i < len; i++) {
                chr = str.charCodeAt(i);
                hash = (hash << 5) - hash + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }
    },
    mapLanguageToMoment() {
        return { en: 'en', vn: 'vi' }; // biến chuyển định dạng ngôn ngữ sang thư viện moment js hiểu được
    },

    getSubString(str, start, openChar, closeChar, caseInsensitive) {
        let s = mapSpecialCharacter.includes(start) ? '\\' + start : start;
        let pattern = new RegExp(s);
        if (!caseInsensitive) {
            pattern = new RegExp(s, 'i');
        }
        let startMatch = str.match(pattern);
        let firstPos = -1;
        if (startMatch) {
            firstPos = startMatch.index;
        }

        let rsl = {
            start: -1,
            end: -1,
        };
        if (firstPos > -1) {
            rsl.start = firstPos;
            let startIndex = firstPos + start.length;
            let endIndex = firstPos;
            let countMatches = 0;
            for (let i = startIndex; i < str.length; i++) {
                if (str[i] == openChar) {
                    countMatches += 1;
                } else if (str[i] == closeChar) {
                    countMatches -= 1;
                }

                if (countMatches == 0) {
                    endIndex = i;
                    rsl.end = endIndex + 1;
                    break;
                }
            }
        }
        return rsl;
    },

    // getTargetInSubstring(rsl, str, startIndex, endIndex, start, openChar, closeChar, caseInsensitive) {
    //     let substr = str.substring(startIndex, endIndex);
    //     let firstPos = substr.indexOf(start);
    //     if (firstPos > -1) {
    //         let section = this.getSubString(substr, start, openChar, closeChar, caseInsensitive);
    //         if (section.start > -1 && section.end > -1) {
    //             rsl.push(section);
    //             section.start += startIndex;
    //             section.end += startIndex;
    //             this.getTargetInSubstring(rsl, substr, section.end - startIndex, str.length, start, openChar, closeChar);
    //         }
    //     }
    // },

    /**
     * Hàm lấy ra sub string nằm giữa cặp ký tự đóng mở
     * @param {String} str chuỗi cần tìm kiếm
     * @param {String} start chuỗi bắt đầu , có thể là tên hàm
     * @param {String} openChar ký tự mở để bắt đầu tìm chuỗi
     * @param {String} closeChar ký tự đóng để kết thúc việc tìm chuỗi
     * @param {Boolean} caseInsensitive cờ đánh dấu xem biến "start" có được tìm kiếm theo kiểu phân biệt hoa thường hay ko,
     */
    getBoundedSubstr(
        str,
        start = '',
        openChar = '(',
        closeChar = ')',
        caseInsensitive = false,
    ) {
        str = str.replace(/\n|\r\n/g, ' ');
        let o = mapSpecialCharacter.includes(openChar)
            ? '\\' + openChar
            : openChar;
        // let c = mapSpecialCharacter.includes(closeChar) ? ('\\'+closeChar) : closeChar;
        let s = mapSpecialCharacter.includes(start) ? '\\' + start : start;
        let startRegx = mapSpecialCharacter.includes(start)
            ? s + '\\s*'
            : '\\b' + s + '\\b\\s*';
        let reg = new RegExp(startRegx + o, 'g');
        let sections = str.split(reg);
        let rsl = [];

        if (sections.length > 0) {
            for (let i = 1; i < sections.length; i++) {
                let item = start + openChar + sections[i];
                let info = this.getSubString(
                    item,
                    start,
                    openChar,
                    closeChar,
                    caseInsensitive,
                );
                rsl.push(item.substring(info.start, info.end));
            }
        }
        return rsl;
    },
    /**
     * Hàm chuyển file size sang định dạng kb, mb....
     * @param {*} size
     */
    getFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
        );
    },

    /**
     *
     * @param {String} str chuỗi cần bind giá trị
     * @param {Object} varsValue map tên biến và giá trị của biến đó
     * @returns Chuỗi sau khi đã được bind giá trị bởi biến
     */
    bindVarValueToStr(str, varsValue) {
        varsValue = varsValue ? varsValue : {};
        if (Object.keys(varsValue).length) {
            let varNames = str.match(/\{([a-zA-Z0-9_]+)\}/g);
            if (varNames) {
                for (let name of varNames) {
                    let rawName = name.replace('{', '').replace('}', '');
                    if (varsValue.hasOwnProperty(rawName)) {
                        str = str.replace(name, varsValue[rawName]);
                    }
                }
            }
        }
        return str;
    },

    /**
     * Hàm loại bỏ các tag HTML trong string
     * @param {String} str chuỗi cần loại bỏ tag
     * @returns Chuỗi sau khi đã được loại bỏ các tag html
     */
    removeHTMLTags(str) {
        return str ? str.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, '') : '';
    },
    decodeHTMLEntities(str, isRemoveHTMLtags = true) {
        var txt = document.createElement('textarea');
        txt.innerHTML = str;
        if (str != '' && isRemoveHTMLtags) {
            return txt.value.replace(/(<([^>]+)>)/gi, '');
        } else {
            return txt.value;
        }
    },
    isNumeric(str) {
        if (typeof str == 'number') return true; // we only process strings!
        if (typeof str != 'string') return false; // we only process strings!
        return (
            !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str))
        ); // ...and ensure strings of whitespace fail
    },
    getTextInHTML(str) {
        let txt = document.createElement('span');
        txt.innerHTML = str;
        let rsl = $(txt).text();
        txt.remove();
        return rsl;
    },
    createUUID(){
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );        
    }
};
