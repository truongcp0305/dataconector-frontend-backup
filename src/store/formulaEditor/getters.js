const messages = (state) => state.messages;

const listUserInChildrenNode = (state) => (orgchartId) => {
    let listUser = [];
    let id = parseInt(orgchartId);
    state.listChildrenOfNode[id].forEach(function (e) {
        let users = JSON.parse(e.users);
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

export {};
