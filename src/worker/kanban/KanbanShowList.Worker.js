import { kanbanApi } from '@/api/kanban.js';

onmessage = function (event) {
    let data = event.data;
    let action = data.action;
    if (handler[action]) {
        handler[action](data.data);
    } else {
        console.error(` action ${action} not found `);
    }
};

var handler = {
    async deleteRows(data) {
        let arr = [];

        data.rows.forEach(function (e) {
            arr.push(e.id);
        });
        let res = await kanbanApi.deleteKanban(arr);
        self.postMessage({
            action: 'handleDeleteRows',
            data: res.status,
        });
    },
};
