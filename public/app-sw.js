importScripts('indexed-db-sw.js');
var SYM_CACHE_NAME = 'SYMPER-CACHE';
var SYM_IDB_NAME = 'SYMPER-IDB-STORE';
const STORE_REQUEST_NAME = 'requestes';
const EXPIRE_REQUEST_LOG_TIME = 1 * 24 * 60 * 60 * 1000;
var symRequestStore = new IndexedDB(SYM_IDB_NAME);
var isChecked = false;
self.addEventListener('install', function (evt) {
    evt.waitUntil(
        precache().then(function () {
            return self.skipWaiting();
        }),
    );
});

self.addEventListener('activate', function (evt) {
    evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
    // if(event.request.url.includes('sql.js.org/dist/sql-wasm.wasm')){
    //     let request = new Request(self.location.origin + '/vendor/sqljs/sql-wasm.wasm', {
    //         method: 'GET',
    //         headers: event.request.headers
    //     });
    //     event.respondWith(
    //         fetch(request.clone())
    //     )
    // }else{
    event.respondWith(fetch(event.request));
    // }
    // let cacheStrategy = event.request.headers.get('Symper-Cache-Strategy');
    // event.request.symperTime = Date.now();
    // if (event.request.method == 'GET') {
    //     // if (cacheStrategy == 'cache-first') {
    //     //     handleCacheFirstStrategy(event);
    //     // } else if (!event.request.url.includes('http://')) {
    //         handleNetworkFirstStrategy(event);
    //     // }
    // } else {
    //     handleChangeDataRequest(event);
    // }
});

async function validateStaleRequestLog() {
    isChecked = true;
    let metaData = await symRequestStore.read('request-meta');
    if (metaData) {
        let now = Date.now();
        if (
            metaData.prevTime &&
            now - metaData.prevTime > EXPIRE_REQUEST_LOG_TIME
        ) {
            await symRequestStore.clearAll();
            metaData = {
                prevTime: Date.now(),
            };
            symRequestStore.save(metaData, 'request-meta');
        }
    } else {
        metaData = {
            prevTime: Date.now(),
        };
        symRequestStore.save(metaData, 'request-meta');
    }
}

async function logRequest(req, res) {
    if (!symRequestStore.db) {
        symRequestStore.open(STORE_REQUEST_NAME);
        return;
    }

    if (!isChecked) {
        await validateStaleRequestLog();
    }
    try {
        let start = Date.now();
        let requestTime = res.symperTime - req.symperTime;
        req = req.clone();
        res = res.clone();
        let url = req.url;
        if (url.includes('.symper.vn') && /.*[^css|^js|]$/gi.test(url)) {
            let now = new Date().toLocaleString();
            let reqData = {};
            let resData = {};
            try {
                resData = await res.clone().json();
            } catch (error) {
                resData = await res.text();
            }

            if (req.method != 'GET' && req.method != 'DELETE') {
                try {
                    reqData = await req.clone().json();
                } catch (error) {
                    reqData = await req.text();
                }
            }

            await symRequestStore.put(
                {
                    at: now,
                    requestTime: requestTime,
                    req: {
                        method: req.method,
                        data: reqData,
                    },
                    res: {
                        data: resData,
                        status: res.status,
                        statusText: res.statusText,
                    },
                    storeTime: Date.now() - start,
                },
                Date.now() + '-' + url,
            );
        }
    } catch (error) {
        console.warn('[SYMPER WARNING]: Can save log request', error, req, res);
    }
}

function handleChangeDataRequest(event) {
    event.respondWith(
        fetch(event.request.clone())
            .then((response) => {
                response.symperTime = Date.now();
                logRequest(event.request, response);
                return response;
            })
            .catch(function (e) {
                event.request
                    .clone()
                    .text()
                    .then(function (body) {
                        // let now = Date.now();
                        // symRequestStore.add({
                        //     create_time: now,
                        //     due_time: now + EXPIRE_TIME,
                        //     payload: body,
                        //     url: event.request.url,
                        //     name: event.request.headers.get('Symper-Request-Name'),
                        //     method: event.request.method
                        // });
                        return new Response(
                            '{"status":0,"message":"Không thể cập nhật dữ liệu do kết nối mạng bị mất!"}',
                            {
                                headers: { 'Content-Type': 'application/json' },
                            },
                        );
                    });
            }),
    );
}

function handleCacheFirstStrategy(event) {
    // console.log('cần lấy data từ cache');
    event.respondWith(
        caches
            .match(event.request)
            .then((resp) => {
                if (!resp) {
                    // console.log('trong cache không có dữ liệu, cần lấy từ server');
                }
                return (
                    resp ||
                    fetch(event.request).then((response) => {
                        let responseClone = response.clone();
                        // console.log('đã lấy được data từ server, cần đẩy data vào cache');
                        caches.open(SYM_CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                        return response;
                    })
                );
            })
            .catch(() => {
                return new Response(
                    '{"status":0,"message":"Không thể lấy dữ liệu do kết nối mạng bị mất!"}',
                    {
                        headers: { 'Content-Type': 'application/json' },
                    },
                );
            }),
    );
}

function handleNetworkFirstStrategy(event) {
    // console.log('cần lấy data từ server');
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // let responseClone = response.clone();
                // caches.open(SYM_CACHE_NAME).then((cache) => {
                //     cache.put(event.request, responseClone);
                // });
                // console.log('đã lấy được data từ server');
                response.symperTime = Date.now();
                logRequest(event.request, response);
                return response;
            })
            .catch(function (e) {
                console.warn('Không có kết nối mạng, cần lấy từ cache', e);
                return caches.open(SYM_CACHE_NAME).then(function (cache) {
                    return cache.match(event.request).then((resp) => {
                        return (
                            resp ||
                            new Response(
                                '{"status":0,"message":"Không thể lấy dữ liệu do kết nối mạng bị mất!"}',
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                },
                            )
                        );
                    });
                });
            }),
    );
}

async function fetchFromCache(request) {
    return await caches
        .open(SYM_CACHE_NAME)
        .then(async function (cache) {
            return await cache
                .match(request)
                .then(function (matching) {
                    return matching;
                })
                .catch((err) => {
                    console.warn('Cannot query cache!', err);
                    return false;
                });
        })
        .catch((err) => {
            console.warn('Cannot open cache storage!', err);
            return false;
        });
}

function precache() {
    return caches.open(SYM_CACHE_NAME).then(function (cache) {
        // return cache.addAll([
        //     './controlled.html'
        // ]);
    });
}

async function getRequestPayload(request) {
    let serialized = {};
    // Only if method is not `GET` or `HEAD` is the request allowed to have body.
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        return await request
            .clone()
            .json()
            .then(function (body) {
                serialized.body = body;
                return Promise.resolve(serialized);
            });
    }
    return {};
}
