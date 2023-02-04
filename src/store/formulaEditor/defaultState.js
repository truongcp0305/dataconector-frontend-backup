const defaultState = {
    completions: {
        docs: {},
        orgcharts: {},
    },
    /**
     * Các từ khóa động đã được set cho editor, phục vụ cho việc không bị trùng lặp keyword
     */
    addedCompletionItems: {},
    /**
     * Đánh dấu cho các instance của editor là đã load các từ khóa tĩnh chưa
     */
    didSetStaticCompletionItems: false,
    /**
     * Đánh dấu xem đã load cdn monaco-editor chưa
     */
    loadedMonacoStatus: 'not_load',
};

export default defaultState;
