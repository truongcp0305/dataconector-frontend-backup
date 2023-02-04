/**
 * Các hàm phục vụ cho việc xác thực, lưu trữ dữ liệu đăng nhập cho người dùng
 */
import { cookie } from './cookie.js';
import { authUtil } from './auth.js';
if (self.importScripts) {
    self.importScripts('./../env.js');
}

export const store = {
    getComponentSize(comp) {
        if (!comp) {
            return {
                h: 0,
                w: 0,
            };
        }

        let dom = false;
        if (comp._isVue) {
            dom = comp.$el;
        } else if (comp.localName) {
            dom = comp;
        }

        if (dom && dom.getBoundingClientRect) {
            // let rect = dom.getBoundingClientRect();
            // return {
            //     h: rect.height,
            //     w: rect.width,
            // }
            return {
                h: $(dom).innerHeight(),
                w: $(dom).innerWidth(),
            };
        } else {
            return {
                h: 0,
                w: 0,
            };
        }
    },

    /**
     * Tìm vue instance gần nhất với dom được truyền vào
     * @param {DOM} dom  điểm xuất phát của dom để tìm
     * @param {String} name tên của vue instance cần tìm
     */
    getClosestVueInstanceFromDom(dom, name = false) {
        let vm;
        while (dom) {
            if (dom.__vue__) {
                vm = dom.__vue__;
                if (name) {
                    if (vm.$options.name === name) {
                        return vm;
                    } else {
                        dom = dom.parentNode;
                    }
                } else {
                    return vm;
                }
            } else {
                dom = dom.parentNode;
            }
        }

        return false;
    },

    getSavedLocale() {
        let savedLocale = cookie.get('user-locale');
        return savedLocale ? savedLocale : 'vn';
    },

    setSavedLocale(locale) {
        cookie.set('user-locale', locale);
    },
    /**
     * Biến mội chuỗi thành  một đối tượng File để có thể gửi đi trong request
     * @param {String} content Nội dung cần tạo thành file
     * @param {String} fileName Tên file cần tạo
     */
    makeStringAsFile(contents, fileName = 'file.txt') {
        var blob = new Blob([contents], { type: 'text/plain' });
        var file = new File([blob], fileName, { type: 'text/plain' });
        return file;
    },

    setEncoded(link, name, data) {
        var encodedData = encodeURIComponent(data);
        if (data) {
            link.attr({
                href:
                    'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
                download: name,
            });
            setTimeout(() => {
                link[0].click();
            }, 200);
        }
    },
    isPromise(value) {
        return value && value.then && typeof value.then === 'function';
    },
    addEnvToUrl(url) {
        url = url.trim();
        if (url.indexOf('https://') === 0) {
            if (SYMPER_ENV.environment != '') {
                url = url.replace(
                    'https://',
                    `https://${SYMPER_ENV.environment}-`,
                );
            }
        } else {
            console.error('url must start with https://');
        }
        return url;
    },
    copyTextToClipboard(text) {
        let textArea = document.createElement('textarea');
        textArea.classList = 'hidden-textarea-for-copy';
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    },
    getExcelFile(
        configs,
        url,
        filename = 'data',
        done,
        formData = false,
        uuid,
    ) {
        var progressElem = $('#' + uuid);
        let token = 'Bearer ' + authUtil.getToken();
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: url,
                data: formData
                    ? configs
                    : typeof configs == 'string'
                    ? configs
                    : JSON.stringify(configs),
                xhrFields: {
                    responseType: 'blob', // to avoid binary data being mangled on charset conversion
                },
                contentType: formData
                    ? 'application/x-www-form-urlencoded'
                    : 'application/json; charset=utf-8',
                headers: {
                    Authorization: token,
                },
                async: true,
                success: function (blob, status, xhr) {
                    // check for a filename
                    var disposition = xhr.getResponseHeader(
                        'Content-Disposition',
                    );
                    filename = String(filename).replace(/\./g, '_');
                    if (
                        disposition &&
                        disposition.indexOf('attachment') !== -1
                    ) {
                        var filenameRegex =
                            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        var matches = filenameRegex.exec(disposition);
                        if (matches != null && matches[1])
                            filename = matches[1].replace(/['"]/g, '');
                    }
                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        var URL = window.URL || window.webkitURL;
                        var downloadUrl = URL.createObjectURL(blob);

                        if (filename) {
                            // use HTML5 a[download] attribute to specify filename
                            var a = document.createElement('a');
                            // safari doesn't support this yet
                            if (typeof a.download === 'undefined') {
                                window.location.href = downloadUrl;
                            } else {
                                a.href = downloadUrl;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                            }
                        } else {
                            window.location.href = downloadUrl;
                        }

                        setTimeout(function () {
                            URL.revokeObjectURL(downloadUrl);
                            resolve({});
                            if (typeof done == 'function') {
                                done();
                            }
                        }, 100); // cleanup
                    }
                },
                xhr: function () {
                    var xhr = new window.XMLHttpRequest();
                    //Download progress
                    xhr.addEventListener(
                        'progress',
                        function (evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                progressElem.html(
                                    Math.round(percentComplete * 100) + '%',
                                );
                            }
                        },
                        false,
                    );
                    return xhr;
                },
            });
        });
    },
    customStringRichText(rtf) {
        let content = '';
        rtf = rtf.replace(/\\par[d]?/g, '');
        rtf = rtf.replace(
            /\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g,
            '',
        );
        content = rtf.replace(/\\'[0-9a-zA-Z]{2}/g, '').trim();
        return content;
    },
    getAllCssStyle() {
        var css = [];
        for (var sheeti = 0; sheeti < document.styleSheets.length; sheeti++) {
            var sheet = document.styleSheets[sheeti];
            var rules = 'cssRules' in sheet ? sheet.cssRules : sheet.rules;
            for (var rulei = 0; rulei < rules.length; rulei++) {
                var rule = rules[rulei];
                if ('cssText' in rule) css.push(rule.cssText);
                else
                    css.push(
                        rule.selectorText +
                            ' {\n' +
                            rule.style.cssText +
                            '\n}\n',
                    );
            }
        }
        return css.join('\n');
    },
    printDOM(prtHtml) {
        // Get all stylesheets HTML
        let stylesHtml = '';
        for (const node of [
            ...document.querySelectorAll('link[rel="stylesheet"], style'),
        ]) {
            stylesHtml += node.outerHTML;
        }
        // Open the print window
        const WinPrint = window.open(
            '',
            '',
            'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0',
        );
        if (WinPrint) {
            setTimeout(
                (self) => {
                    WinPrint.document.write(`<!DOCTYPE html>
            <html>
                <head>
                    <style type="text/css">
                        ${stylesHtml}
                    </style>
                </head>
                <body>
                    ${prtHtml}
                </body>
                </html>`);
                    WinPrint.document.close();
                    WinPrint.focus();
                },
                200,
                this,
            );
            setTimeout(() => {
                WinPrint.print();
            }, 500);
        }
    },
    arrayCalulator(array, method) {
        let value = 0;
        if (method == 'max') {
            value = Math.max.apply(null, array);
        } else if (method == 'min') {
            value = Math.min.apply(null, array);
        } else if (method == 'sum') {
            value = array.reduce(function (a, b) {
                return a + b;
            }, 0);
        } else if (method == 'count_dist') {
            let unique = [...new Set(array)];
            value = unique.length;
        } else if (method == 'count') {
            value = array.length;
        } else if (method == 'avg') {
            let sum = array.reduce(function (a, b) {
                return a + b;
            }, 0);
            value = sum / array.length;
        }
        return value;
    },
    insertToArrByIndex(arr, index, el) {
        arr.splice(index, 0, el);
        return arr;
    },
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    arrayToMapObject(arr, key = 'id') {
        if (!arr) {
            return {};
        }
        return arr.reduce(function (map, obj) {
            if (obj.childrens) {
                obj.childrens = store.arrayToMapObject(obj.childrens);
            }
            map[obj[key]] = obj;
            return map;
        }, {});
    },
};
