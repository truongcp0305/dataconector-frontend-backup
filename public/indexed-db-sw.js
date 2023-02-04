const EXPIRE_TIME = 604800; // một tuần
class IndexedDB {
    constructor(_dbName) {
        this.dbName = _dbName;
        this.dbVersionNumber = 1;
    }

    setDBVersionNumber(_dbVersionNumber) {
        this.dbVersionNumber = _dbVersionNumber;
    }

    open(
        objName,
        keyPath = false,
        objData = false,
        onsuccess = false,
        onerror = false,
        onupgradeneeded = false,
    ) {
        this.objName = objName;
        this.request = indexedDB.open(this.dbName, this.dbVersionNumber);

        if (onerror) {
            this.request.onerror = (event) => onerror();
        }

        this.request.onerror = (err) => {
            console.error('Can not open database ' + this.dbName, err);
            if (onerror) {
                onerror();
            }
        };

        this.request.onsuccess = (event) => {
            this.db = this.request.result;
            if (onsuccess) {
                onsuccess();
            }
        };

        this.request.onupgradeneeded = (event) => {
            let db = event.target.result;
            let option = keyPath
                ? { keyPath: keyPath }
                : { autoIncrement: true };
            let objectStore = db.createObjectStore(objName, option);
            if (objData != undefined) {
                for (let key in objData) {
                    objectStore.add(objData[key]);
                }
            }
            if (onupgradeneeded) {
                onupgradeneeded();
            }
        };
    }

    readAll(callback) {
        let objectStore = this.db
            .transaction(this.objName)
            .objectStore(this.objName);
        objectStore.openCursor().onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                callback(cursor);
                cursor.continue();
            } else {
                // console.log('No more entries!');
            }
        };
    }

    read(id) {
        let transaction = this.db.transaction([this.objName]);
        let objectStore = transaction.objectStore(this.objName);
        let keySearch = '' + id;

        return new Promise((resolve, reject) => {
            let request = objectStore.get(id);
            request.onerror = (event) => {
                reject(event);
            };
            request.onsuccess = (event) => {
                resolve(request.result);
            };
        });
    }

    async save(data, key) {
        let savedData = await this.read(key);
        if (savedData) {
            await this.put(data, key);
        } else {
            await this.add(data, key);
        }
    }

    add(value, key = null) {
        let transaction = this.db.transaction([this.objName], 'readwrite');
        let objectStore = transaction.objectStore(this.objName);

        return new Promise((resolve, reject) => {
            let request = {};
            if (key) {
                request = objectStore.add(value, key);
            } else {
                request = objectStore.add(value);
            }
            request.onsuccess = (event) => {
                resolve(event);
            };
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    put(objData, key = null) {
        let transaction = this.db.transaction([this.objName], 'readwrite');
        let objectStore = transaction.objectStore(this.objName);

        return new Promise((resolve, reject) => {
            let request = {};
            if (key) {
                request = objectStore.put(objData, key);
            } else {
                request = objectStore.put(objData);
            }
            request.onsuccess = (event) => {
                resolve(event);
            };
            request.onerror = (event) => {
                reject(event);
            };
        });
    }

    remove(id) {
        let transaction = this.db.transaction([this.objName], 'readwrite');
        let objectStore = transaction.objectStore(this.objName);
        let keySearch = '' + id;

        return new Promise((resolve, reject) => {
            let request = objectStore.delete(id);
            request.onerror = (event) => reject(event);
            request.onsuccess = (event) => resolve(event);
        });
    }

    clearAll() {
        let transaction = this.db.transaction([this.objName], 'readwrite');
        let objectStore = transaction.objectStore(this.objName);

        return new Promise((resolve, reject) => {
            let request = objectStore.clear();
            request.onerror = (event) => reject(event);
            request.onsuccess = (event) => resolve(event);
        });
    }
}
