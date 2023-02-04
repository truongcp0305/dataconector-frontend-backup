import Api from './api';
import { appConfigs } from './../configs.js';

let api = new Api(appConfigs.apiDomain.kanban);

export const kanbanApi = {
    getKanbans() {
        return api.get('kanban');
    },
    getBoard(id) {
        return api.get('board/' + id);
    },
    deleteKanban(id) {
        return api.put('delete/' + id);
    },
    createKanban(data) {
        return api.post('kanban', data);
    },
    updateBoard(id, data) {
        return api.put('board/' + id, data);
    },
    checkExistNameKanban(name) {
        return api.post('kanban/checkExistKanban/' + name);
    },
    getBoardByIdDoc(idDoc) {
        return api.get('board-doc/' + idDoc);
    },
    checkExistDocKanban(idDoc) {
        return api.post('kanban/checkExistDoc/' + idDoc);
    },
};
