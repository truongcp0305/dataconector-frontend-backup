const getProcessTrackingById = (state) => (id) => {
    if (state.currentTrackingProcess) {
        state.currentTrackingProcess.forEach(function (e) {
            if (e.act_id_ == id) {
                return e;
            }
        });
    } else {
        return false;
    }
};

export { getProcessTrackingById };
