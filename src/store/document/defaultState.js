const defaultState = {
    editor: {
        editor_123: {
            allControl: {
                // tất cả control đã kéo vào {key:tên control, value : [properties control]}
                // s-control-243564534: {
                //     properties: {
                //         name: {
                //         },
                //         display: {
                //         },
                //         print: {
                //         }
                //     },
                //     formulas: {
                //     },
                //     type:"",
                //     listFields:{ // truowng hop table thi co cac control
                //     },
                //      id:0
                // }
            },
            currentSelectedControl: {
                // control đang được click bởi người dùng
                properties: {
                    name: {},
                    display: {},
                    print: {},
                    table: {},
                },
                formulas: {},
                type: '',
                id: '',
            },
            listControlTreeData: [],
            allControlForTableOption: [],
            listDataFlow: [],
            allControlTemplate: [],
            allControlDeleted: {},
        },
    },
    submit: {
        submit_123: {
            listInputInDocument: {},
            documentObjectId: null,
            docStatus: 'init',
            SQLLiteDB: {},
            rootControl: {},
            impactedFieldsList: {},
            impactedFieldsListWhenStart: {},
            rootChangeFieldName: null,
            currentControlActive: null, // biến chỉ ra control nào đang active
            submitFormulas: null,
            updateFormulas: null,
            listUser: null,
            localRelated: {},
            workflowVariable: {}, // các tham số của workflow khi submit doc
            currentControlEditByUser: null,
            autocompleteData: {
                // lưu lại các giá trị của autocomplete khi đã gõ
                controlName: {
                    header: [],
                    cacheData: {
                        letter: {
                            // giá trị nhập và dữ liệu tương ứng
                            data: [],
                        },
                    },
                },
            },
            orgchartTableSqlName: {}, // biến lưu lại tên các bảng sqlite được tạo ra sau khi chạy công thức orgchart
            readyLoaded: false, // biến đánh dấu công thức đã chạy xong mỗi lần thực thi hay chưa
            listControlMappingDatasets: {},
            controlFormulaInfinity: {},
            currentRowChangePivotMode: {
                tableName: '',
                key: '',
                data: {},
            },
            /**
             * lưu các control vi phạm trong submit
             * key:controlName
             * value:{ require:{
             *      isValid:false,
             *      message:'khong được bỏ trống'
             * }}
             */
            dataInputBeforeChange: {},
            mapValueToTextAutocompleteInput: {},
            tableInteractive: null,
            optionalDataBinding: {},
            documentInfo: null,
            readOnlyControls: {},
            dataInsertRow: {},
            isRunningAllFormulaManually: false,
            listRootControlRunFormulaManually: {},
            listControlRunFormulaManually: {}
        },
    },
    detail: {
        // detail_123: {
        //     allData: null,
        //     trackChange: [] // lịch sử chỉnh sửa của các control
        // }
    },
    documentProps: {
        instance: {},
    },
    listAllDocument: [], // Khadm: danh sách tất cả các document được active, phục vụ cho việc  autocomplete trong script editor
    needGetAllDoc: true, // flag đánh dấu có cần lấy tất cả các doc hay không, thằng đầu tiên muốn lấy sẽ set biến này về false để những thằng sau ko cần lấy nữa
    viewType: {
        instance: null,
    }, // chỉ định là submit, detail, hay update,
    clientSqlLite: {},
    linkControl: {},
    documentStyle: {},
    currentTitle: '',
    filterConfig:{
        hasSelfFilter: true,
                    rawConfigs: {
                        setting: {
                            column: {
                                selectedColums: []
                            }
                        },
                        style: {
                            title: {
                                children: {
                                    titleText: {
                                        value: ''
                                    }
                                }
                            }
                        }
                    },
                    sharedConfigs: {
                        cellId: 'allColumn',
                        computedSelfFilterConfig:[],
                        data: [],
                        filter: {},
                        selfFilter: {
                            cols: {},
                            applied: false,
                            opening: []
                        },
                        searchKey: ''
                    },
                    viewConfigs: {
                        displayOptions: {}
                    }
    }
};

export default defaultState;
