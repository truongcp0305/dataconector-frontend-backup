const changeCollapseSidebar = (state, newValue) => {
    state.collapseSideBar = newValue;
};
const decreaseUnreadNotification = (state, delta = 1) => {
    state.unreadNotification -= delta;
};
const increaseUnreadNotification = (state, delta = 1) => {
    state.unreadNotification += delta;
};

export {
    changeCollapseSidebar,
    increaseUnreadNotification,
    decreaseUnreadNotification,
};
