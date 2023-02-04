const defaultState = {
    /**
     * chứa tất cả các object  của các object type: workflow, document,
     * định dạng:
     * {
     *      workflow:
     *          [
     *              {
     *                  id: '',
     *                  name: '',
     *                  title: ''
     *              },....
     *          ]
     *  }
     *
     */
    allResource: {},
    // tất cả các action của các loại object khác nhau, dưới dạng:
    /**
     *  "data": {
        "document_definition": [
            "create",
            "edit",
            "submit",
            "drop",
            "restore",
            "list",
            "list_trash",
            "list_instance"
        ]...}
     */
    allActionByObjectType: {},
    flagToGetAllActionByObjectType: true,
};

export default defaultState;
