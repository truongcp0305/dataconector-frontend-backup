const handleAddExportProcess = (state, params) => {
    let uuid = params.uuid;
    let key = params.key;
    Vue.set(state.listFileExport, uuid, {
        uuid: uuid,
        fileName: params.fileName,
        progress: 0,
        message: '',
        key: key,
        isError: false,
    });
};
const handleUpdateProgress = (state, params) => {
    let uuid = params.uuid;
    let progress = params.progress;
    let message = params.message;
    Vue.set(state.listFileExport[uuid], 'progress', progress);
    Vue.set(state.listFileExport[uuid], 'message', message);
};
const handleUpdateStatusError = (state, params) => {
    let uuid = params.uuid;
    let isError = params.isError;
    Vue.set(state.listFileExport[uuid], 'isError', isError);
};
const handleDeleteFileExport = (state, uuid) => {
    Vue.delete(state.listFileExport, uuid);
};
export {
    handleAddExportProcess,
    handleUpdateProgress,
    handleDeleteFileExport,
    handleUpdateStatusError,
};
