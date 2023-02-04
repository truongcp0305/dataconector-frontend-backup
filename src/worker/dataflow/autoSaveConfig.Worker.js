import { registerPromiseWorker } from '@/worker/registerPromiseWorker.js';
import IndexedDB from '@/plugins/utilModules/indexedDB.js';
const STORE = new IndexedDB('object_config_cache');

var handler = {
    async logChangeConfig(data) {
        if (!STORE.db) {
            await STORE.open('dataflow');
        }
        const KEY = 'logDataflowChangeConfig';
        const MAX_LENGTH = 5000;
        let logDataflowChangeConfig = await STORE.read(KEY);
        if (!logDataflowChangeConfig) {
            logDataflowChangeConfig = [];
        }
        logDataflowChangeConfig.unshift({
            time: (new Date()).toLocaleString('en-ZA'),
            ...data
        });
        if (logDataflowChangeConfig.length > MAX_LENGTH) {
            logDataflowChangeConfig.splice(MAX_LENGTH, logDataflowChangeConfig.length);
        }
        await STORE.save(logDataflowChangeConfig, KEY);
    },
    async saveConfig(data) {
        data.data.nodeConfig.home.autoSaveConfig = {
            active: false,
            restoring: false,
            saving: false,
        };
        if (!STORE.db) {
            await STORE.open('dataflow');
        }
        await STORE.save(data.data, data.key);
    },
    async getConfig(key) {
        if (!STORE.db) {
            await STORE.open('dataflow');
        }
        let data = await STORE.read(key);
        if (!data) {
            return null;
        }
        data.graphDisplay = {
            nodes: data.nodeDisplay,
            links: data.links,
        };
        for (const id in data.nodeConfig) {
            data.nodeConfig[id].prevNodes &&
                (data.nodeConfig[id].prevNodes = data.nodeConfig[
                    id
                ].prevNodes.reduce((map, el) => {
                    map[el] = map;
                    return map;
                }, {}));

            data.nodeConfig[id].nextNodes &&
                (data.nodeConfig[id].nextNodes = data.nodeConfig[
                    id
                ].nextNodes.reduce((map, el) => {
                    map[el] = map;
                    return map;
                }, {}));
        }
        delete data.links;
        delete data.nodeDisplay;
        return data;
    },
};
registerPromiseWorker(self, handler);
