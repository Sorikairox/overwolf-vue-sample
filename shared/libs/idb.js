const DB_NAME = 'game';
const DB_VERSION = 5;
let DB;

export default {
    async getDb() {
        return new Promise((resolve, reject) => {

            if (DB) {
                return resolve(DB);
            }
            console.log('OPENING DB', DB);
            let request = window.indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = e => {
                console.log('Error opening db', e);
                reject('Error');
            };

            request.onsuccess = e => {
                DB = e.target.result;
                console.log('-----------------------------------------------------------------------------------------------------');
                console.log('IT OPENS ITSELF');
                console.log('======================================================================================================');
                DB.onclose = () => {
                    DB = undefined;
                    this.getDb();
                    console.log('-----------------------------------------------------------------------------------------------------');
                    console.log('IT CLOSES FOR NO FUCKING REASON');
                    console.log('======================================================================================================');
                };
                resolve(DB);
            };

            request.onupgradeneeded = e => {
                console.log('onupgradeneeded');
                let db = e.target.result;
                db.createObjectStore("highlights", { keyPath: 'id', autoIncrement: true });
                db.createObjectStore("session", { keyPath: 'sessionId' });
                db.createObjectStore("match", { keyPath: 'id' });
                db.createObjectStore("metrics", { keyPath: 'matchId' });
            };
        });
    },
    async delete(table, obj) {

        let db = await this.getDb();

        return new Promise(resolve => {

            let trans = db.transaction([table], 'readwrite');
            trans.oncomplete = () => {
                resolve();
            };

            let store = trans.objectStore(table);
            store.delete(obj.id);
        });
    },
    async get(table) {

        let db = await this.getDb();

        return new Promise(resolve => {

            let trans = db.transaction([table], 'readonly');
            trans.oncomplete = () => {
                resolve(objList);
            };

            let store = trans.objectStore(table);
            let objList = [];

            store.openCursor().onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    objList.push(cursor.value)
                    cursor.continue();
                }
            };

        });
    },
    async getBy(table, filter) {
        let db = await this.getDb();

        return new Promise(resolve => {

            let trans = db.transaction([table], 'readonly');
            trans.oncomplete = () => {
                resolve(objList);
            };

            let store = trans.objectStore(table);
            let objList = [];

            store.openCursor().onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    for (const field in filter) {
                        if (cursor.value[field] === filter[field]) {
                            objList.push(cursor.value)
                        }
                    }
                    cursor.continue();
                }
            };

        });
    }
    ,
    async save(table, obj) {

        let db = await this.getDb();

        obj.createdAt = new Date().toISOString();
        return new Promise(resolve => {

            let trans = db.transaction([table], 'readwrite');
            trans.oncomplete = () => {
                console.log('we saved in ', table, 'the obj', obj);
                resolve();
            };
            trans.onerror = (e) => {
                console.log('error while saving', e);
                resolve();
            }

            trans.onabort = (e) => {
                console.log('aborted while saving', e);
                resolve();
            }

            let store = trans.objectStore(table);
            store.put(obj);

        });

    }

}
