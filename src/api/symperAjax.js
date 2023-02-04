export const symperAjax = async (options) => {
    if (options.method == 'GET') {
        if (Object.keys(options.data).length > 0) {
            let fullParams = serialize(options.data);
            options.url.includes('?')
                ? (options.url = options.url + '&' + fullParams)
                : (options.url = options.url + '?' + fullParams);
        }
    } else {
        if (!options.contentType) {
            if (!options.headers['Content-Type']) {
                options.headers['Content-Type'] =
                    'application/x-www-form-urlencoded; charset=UTF-8';
                let data = new URLSearchParams(options.data);
                options.body = data;
            } else {
                options.body = options.data;
            }
        } else {
            options.headers['Content-Type'] = options.contentType;
            options.body =
                typeof options.data == 'object'
                    ? JSON.stringify(options.data)
                    : options.data;
        }
    }
    const response = await fetch(options.url, options);
    return response.status == 204
        ? null
        : options.dataType == 'text'
        ? response.text()
        : response.json();
};

/**
 * Dev create : Dungna
 * Date create: 2020/12/29
 * Description: Hàm chuyển object thành url params
 */
export const serialize = function (obj, prefix) {
    let str = [],
        p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + '[' + p + ']' : p,
                v = obj[p];
            str.push(
                v !== null && typeof v === 'object'
                    ? serialize(v, k)
                    : encodeURIComponent(k) + '=' + encodeURIComponent(v),
            );
        }
    }
    return str.join('&');
};
