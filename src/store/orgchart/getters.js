const messages = (state) => state.messages;

const listUserInChildrenNode = (state) => (orgchartId) => {
    let listUser = [];
    let id = parseInt(orgchartId);
    if (state.listChildrenOfNode[id]) {
        state.listChildrenOfNode[id].forEach(function (e) {
            let users = typeof (e.users) == 'string' ? JSON.parse(e.users) : e.users
            if (users.length > 0) {
                users.forEach(function (k) {
                    if (listUser.includes(k) == false) {
                        listUser.push(k);
                    }
                });
            }
        });
    }
    return listUser;
};
const listUserInCurrentNode = (state) => {
    let listUser = [];
    state.listChildInCurrentNode.forEach(function (e) {
        let users = typeof (e.users) == 'string' ? JSON.parse(e.users) : e.users
        if (users.length > 0) {
            users.forEach(function (k) {
                if (listUser.includes(k) == false) {
                    listUser.push(k);
                }
            });
        }
    });
    return listUser;
};
export { messages, listUserInChildrenNode, listUserInCurrentNode };
