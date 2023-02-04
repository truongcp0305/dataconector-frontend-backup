const defaultState = {
    editor: {
        // lưu các cấu hình của orgchart editor, có dạng instanceKey(timestamp unix) -> cấu hình của từng instance
        /**
         * allNodes: {
         *      idNode: {
         *          id: '',
         *          name: '',
         *          ...
         *      }
         * },
         *
         * selectingNode: {
         *      id: '',
         *      name: '',
         *      ...
         * },
         *
         * homeConfig: {
         * }
         */
    },
    allNodeStyle: [],
    instanceKey: '',
    currentChildrenNodeId: '',
    firstChildNodeId: '',
    currentFatherNode: {},
    allUserInOrgChart: {},
    userInActiveNode: {},
    orgChartData: {},
    listChildInCurrentNode: [],
    userInNode: {},
    listChildrenOfNode: {},
    viewOnlySub: false,
    getStructFlag: false,
    allOrgchartStruct: [],
    listVizParentId: [],
};

export default defaultState;
