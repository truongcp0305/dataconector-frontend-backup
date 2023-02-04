import Api from './../../api/api.js';
import { appConfigs } from './../../configs.js'; // trong trường hợp này ta cần sử dụng domain của từng module nghiệp vụ được định nghĩa trong file config
import ApprovalButtonRender from './ApprovalButtomRenderer.js';
import attrToXMLMethods from './elementDefinitions/attrToXMLMethods';

export const userAssignmentToXMLValue = function (
    config,
    returnString = false
) {
    let formula = config.formula
        ? config.formula.replace(/\n|\t|\r\n/g, ' ')
        : '';
    let rsl = {
        formula: formula,
        users: [
            /**
             * Danh sách các user được chọn, có dạng:
             * {
             *      userId: 100,
             *      roleIdentify: 20:abc-xyz
             * }
             */
        ],
        roles: [
            /**
             * danh sách các role trong orgchart, mỗi item có dạng:['orgchart:20:abc-xyz']
             */
        ]
    };
    for (let item of config.orgChart) {
        if (item.type == 'user') {
            rsl.users.push({
                userId: item.id.replace('user:', '')
            });
        } else if (item.type == 'department') {
            rsl.roles.push('orgchart:' + item.id);
        }
    }

    if (rsl.formula != '' || rsl.roles.length > 0) {
        if (returnString) {
            // return string
            return rsl.formula;
        } else {
            return JSON.stringify(rsl);
        }
    } else {
        rsl = rsl.users.reduce((arr, el) => {
            if (el && el.userId) {
                arr.push(el.userId);
            }
            return arr;
        }, []);
        return rsl.join(',');
    }
};

/**
 * các biến
 */
const commonEleAttrs = [
    {
        name: 'id',
        isAttr: true,
        type: 'String'
    },
    {
        name: 'name',
        isAttr: true,
        type: 'String'
    }
];
const apiCaller = new Api('');
/**
 * Danh sách tất cả các thuộc tính có thể có của process
 * trong các item, có thuộc tính "dg" là viết tắt của "display group" tức:
 *      thuộc tính này thuộc về nhóm hiển thị nào ở thanh panel cấu hình bên phải
 *
 * Trong mỗi thuộc tính sẽ có hai phuowng thức là
 *      1. lấy giá trị để gửi về server: getValue(value) // value là giá trị cấu hình của thuộc tính đó
 *      2. khởi tạo lại giá trị từ server vào cấu trúc tương ứng của thuộc tính đó: restoreData(value) // value là giá trị lấy được từ server của thuộc tính đó
 * Mặc định nếu ko có hai phương thức trên thì giá trị lưu ở server sẽ giống với giá trị được dùng trên client
 */
let allAttrs = {
    process_id: {
        title: SYMPER_APP.$t('v2.workflow.processIdentifier'),
        type: 'text',
        value: 'process',
        info: 'BPMN.PROPERTYPACKAGES.PROCESS_IDPACKAGE.PROCESS_ID.DESCRIPTION',
        dg: 'general',
        hidden: true
        // toXML: {
        //     "symper_position": "attr",
        //     "name": "id",
        //     "isAttr": true,
        //     "type": "String"
        // }
    },
    overrideid: {
        title: SYMPER_APP.$t('v2.workflow.id'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.OVERRIDEIDPACKAGE.OVERRIDEID.DESCRIPTION',
        dg: 'general'
        // toXML: {
        //     "symper_position": "attr",
        //     "name": "id",
        //     "isAttr": true,
        //     "type": "String"
        // }
    },
    name: {
        title: SYMPER_APP.$t('v2.workflow.name'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.NAMEPACKAGE.NAME.DESCRIPTION',
        dg: 'general',
        // toXML: {
        //     "symper_position": "attr",
        //     "name": "name",
        //     "isAttr": true,
        //     "type": "String"
        // }
        validate() {
            let vl = this.value;
            if (vl == null || vl == '') {
                let item = {
                    isValid: false,
                    message: SYMPER_APP.$t('v2.workflow.pleaseEnterName')
                };
                Vue.set(this, 'validateStatus', item);
            } else {
                let item = {
                    isValid: true,
                    message: 'success'
                };
                Vue.set(this, 'validateStatus', item);
            }
        }
    },
    documentation: {
        title: SYMPER_APP.$t('v2.workflow.documentation'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.DOCUMENTATIONPACKAGE.DOCUMENTATION.DESCRIPTION',
        dg: 'general',
        toXML: {
            symper_position: 'el',
            name: 'documentation',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        },
        pushToXML: attrToXMLMethods.documentationMethod,
        hidden: true
    },
    description: {
        title: SYMPER_APP.$t('v2.workflow.descriptionTitle'),
        type: 'text',
        value: '',
        info: '',
        dg: 'general',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    categorydefinition: {
        title: SYMPER_APP.$t('v2.workflow.categoryTitle'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.CATEGORYPACKAGE.CATEGORYDEFINITION.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'category',
            isAttr: true,
            type: 'String'
        }
    },
    process_author: {
        title: SYMPER_APP.$t('v2.workflow.processAuthorTitle'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.PROCESS_AUTHORPACKAGE.PROCESS_AUTHOR.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'author',
            isAttr: true,
            type: 'String'
        }
    },
    process_version: {
        title: SYMPER_APP.$t('v2.workflow.processVersionTitle'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.PROCESS_VERSIONPACKAGE.PROCESS_VERSION.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'processVersion',
            isAttr: true,
            type: 'String'
        }
    },
    process_historylevel: {
        title: SYMPER_APP.$t('v2.workflow.processHistoryLevelTitle'),
        type: 'select',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.PROCESS_HISTORYLEVELPACKAGE.PROCESS_HISTORYLEVEL.DESCRIPTION',
        dg: 'detail',
        options: [
            {
                text: '',
                value: ''
            },
            {
                text: SYMPER_APP.$t('v2.workflow.none'),
                value: 'none'
            },
            {
                text: SYMPER_APP.$t('v2.workflow.audit'),
                value: 'audit'
            },
            {
                text: SYMPER_APP.$t('v2.workflow.activity'),
                value: 'activity'
            },
            {
                text: SYMPER_APP.$t('v2.workflow.full'),
                value: 'full'
            }
        ],
        toXML: {
            symper_position: 'el',
            symper_need_ext_wrap: true,
            name: 'documentation',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        }
    },
    isexecutable: {
        title: SYMPER_APP.$t('v2.workflow.isExecutableTitle'),
        type: 'checkbox',
        value: true,
        info: 'BPMN.PROPERTYPACKAGES.ISEXECUTABLEPACKAGE.ISEXECUTABLE.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'isExecutable',
            isAttr: true,
            type: 'String'
        }
    },
    process_potentialstarteruser: {
        title: SYMPER_APP.$t('v2.workflow.potentialStarterUserTitle'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.PROCESS_POTENTIALSTARTERUSERPACKAGE.PROCESS_POTENTIALSTARTERUSER.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'candidateStarterUsers',
            isAttr: true,
            type: 'String'
        }
    },
    process_potentialstartergroup: {
        title: SYMPER_APP.$t('v2.workflow.potentialStarterGroupTitle'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.PROCESS_POTENTIALSTARTERGROUPPACKAGE.PROCESS_POTENTIALSTARTERGROUP.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'candidateStarterGroups',
            isAttr: true,
            type: 'String'
        }
    },
    process_namespace: {
        title: SYMPER_APP.$t('v2.workflow.targetNamespaceTitle'),
        type: 'text',
        value: 'https://symper.vn',
        info: 'BPMN.PROPERTYPACKAGES.PROCESS_NAMESPACEPACKAGE.PROCESS_NAMESPACE.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'targetNamespace',
            isAttr: true,
            type: 'String'
        }
    },
    iseagerexecutionfetch: {
        title: SYMPER_APP.$t('v2.workflow.eagerExecutionFetching'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.PROCESS_ISEAGEREXECUTIONFETCHPACKAGE.ISEAGEREXECUTIONFETCH.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'isEagerExecutionFetching',
            isAttr: true,
            type: 'String'
        }
    },
    asynchronousdefinition: {
        title: SYMPER_APP.$t('v2.workflow.asynchronousTitle'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.ASYNCHRONOUSDEFINITIONPACKAGE.ASYNCHRONOUSDEFINITION.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'async',
            isAttr: true,
            type: 'String'
        }
    },
    dataproperties: {
        title: SYMPER_APP.$t('v2.workflow.dataObjects'),
        type: 'table',
        value: [{}],
        info: 'BPMN.PROPERTYPACKAGES.DATAPROPERTIESPACKAGE.DATAPROPERTIES.DESCRIPTION',
        dg: 'detail',
        columns: [
            {
                title: SYMPER_APP.$t('v2.workflow.id'),
                name: 'id',
                type: 'text'
            },
            {
                title: SYMPER_APP.$t('v2.workflow.name'),
                name: 'name',
                type: 'text'
            },
            {
                title: SYMPER_APP.$t('v2.workflow.type'),
                name: 'type',
                type: 'autocomplete',
                source: ['string', 'boolean', 'datetime', 'int', 'long']
            },
            {
                title: SYMPER_APP.$t('v2.workflow.defaultValue'),
                name: 'defaultValue',
                type: 'text'
            }
        ],
        getValue(value) {
            return Array.isArray(value) ? value : [];
        },
        restoreData(value) {
            return value == '' ? [{}] : value;
        },
        needReformatValue: true,
        toXML: {
            symper_position: 'el',
            name: 'dataObject',
            superClass: ['Element'],
            properties: [
                {
                    name: 'id',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'name',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'itemSubjectRef',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'extensionElements',
                    type: 'ExtensionElements'
                }
            ],
            extraElements: [
                {
                    name: 'ExtensionElements',
                    properties: [
                        {
                            name: 'value',
                            type: 'Value'
                        }
                    ]
                },
                {
                    name: 'Value',
                    properties: [
                        {
                            name: 'text',
                            isBody: true,
                            type: 'String'
                        }
                    ]
                }
            ]
        },
        pushToXML: attrToXMLMethods.notPushToXML // đã xử lý ở customExtToModel nên ko cần push vào xml nữa
    },
    exclusivedefinition: {
        title: SYMPER_APP.$t('v2.workflow.exclusive'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.EXCLUSIVEDEFINITIONPACKAGE.EXCLUSIVEDEFINITION.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'exclusive',
            isAttr: true,
            type: 'String'
        }
    },
    executionlisteners: {
        title: SYMPER_APP.$t('v2.workflow.executionListenersTitle'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EXECUTIONLISTENERSPACKAGE.EXECUTIONLISTENERS.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    tasklisteners: {
        title: SYMPER_APP.$t('v2.workflow.taskListenersTitle'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.TASKLISTENERSPACKAGE.TASKLISTENERS.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    eventlisteners: {
        title: SYMPER_APP.$t('v2.workflow.eventListenersTitle'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTLISTENERSPACKAGE.EVENTLISTENERS.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    usertaskassignment: {
        title: SYMPER_APP.$t('v2.workflow.assignment'),
        type: 'table',
        value: [{}],
        info: 'BPMN.PROPERTYPACKAGES.USERTASKASSIGNMENTPACKAGE.USERTASKASSIGNMENT.DESCRIPTION',
        dg: 'detail',
        columns: [],
        hidden: true,
        toXML: {
            symper_position: 'attr',
            name: 'assignee',
            isAttr: true,
            type: 'String'
        },
        pushToXML: attrToXMLMethods.notPushToXML
    },
    formproperties: {
        title: SYMPER_APP.$t('v2.workflow.formProperties'),
        type: 'table',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.FORMPROPERTIESPACKAGE.FORMPROPERTIES.DESCRIPTION',
        dg: 'detail',
        columns: [],
        hidden: true,
        restoreData(value) {
            return value == '' ? [] : value;
        },
        toXML: {
            symper_position: 'el',
            name: 'formProperty',
            superClass: ['Element'],
            properties: [
                {
                    name: 'id',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'name',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'type',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'expression',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'variable',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'default',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        },
        pushToXML: attrToXMLMethods.formPropertyMethod
    },
    formkeydefinition: {
        title: SYMPER_APP.$t('v2.workflow.formKey'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.FORMKEYDEFINITIONPACKAGE.FORMKEYDEFINITION.DESCRIPTION',
        dg: 'taskAction',
        hidden: true,
        toXML: {
            symper_position: 'attr',
            name: 'formKey',
            isAttr: true,
            type: 'String'
        }
    },
    formfieldvalidation: {
        title: SYMPER_APP.$t('v2.workflow.validateFormFields'),
        type: 'script',
        value: 'true',
        info: 'BPMN.PROPERTYPACKAGES.FORMFIELDVALIDATIONPACKAGE.FORMFIELDVALIDATION.DESCRIPTION',
        dg: 'formula',
        toXML: {
            symper_position: 'attr',
            name: 'formFieldValidation',
            isAttr: true,
            type: 'String'
        }
    },
    duedatedefinition: {
        title: SYMPER_APP.$t('v2.workflow.dueDate'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.DUEDATEDEFINITIONPACKAGE.DUEDATEDEFINITION.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'dueDate',
            isAttr: true,
            type: 'String'
        }
    },

    prioritydefinition: {
        title: SYMPER_APP.$t('v2.workflow.priority'),
        type: 'select',
        value: '1',
        info: 'BPMN.PROPERTYPACKAGES.PRIORITYDEFINITIONPACKAGE.PRIORITYDEFINITION.DESCRIPTION',
        dg: 'detail',
        options: [
            {
                text: 'Low',
                value: '1'
            },
            {
                text: 'Medium',
                value: '2'
            },
            {
                text: 'Low',
                value: '3'
            }
        ],
        toXML: {
            symper_position: 'attr',
            name: 'priority',
            isAttr: true,
            type: 'String'
        }
    },
    servicetaskclass: {
        title: SYMPER_APP.$t('v2.workflow.class'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKCLASSPACKAGE.SERVICETASKCLASS.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    servicetaskexpression: {
        title: SYMPER_APP.$t('v2.workflow.expression'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKEXPRESSIONPACKAGE.SERVICETASKEXPRESSION.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    servicetaskdelegateexpression: {
        title: SYMPER_APP.$t('v2.workflow.delegateExpression'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKDELEGATEEXPRESSIONPACKAGE.SERVICETASKDELEGATEEXPRESSION.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    servicetaskfailedjobretrytimecycle: {
        title: SYMPER_APP.$t('v2.workflow.failedJobRetryTimeCycle'),
        type: 'numeric',
        value: 1,
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKFAILEDJOBRETRYTIMECYCLEPACKAGE.SERVICETASKFAILEDJOBRETRYTIMECYCLE.DESCRIPTION',
        dg: 'detail'
    },
    servicetaskfields: {
        title: SYMPER_APP.$t('v2.workflow.classFields'),
        type: 'table',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKFIELDSPACKAGE.SERVICETASKFIELDS.DESCRIPTION',
        dg: 'detail',
        columns: [],
        hidden: true
    },
    servicetaskexceptions: {
        title: SYMPER_APP.$t('v2.workflow.exceptions'),
        type: 'table',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKEXCEPTIONSPACKAGE.SERVICETASKEXCEPTIONS.DESCRIPTION',
        dg: 'detail',
        columns: [],
        hidden: true
    },
    servicetaskresultvariable: {
        title: SYMPER_APP.$t('v2.workflow.resultVariableName'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKRESULTVARIABLEPACKAGE.SERVICETASKRESULTVARIABLE.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    servicetaskUseLocalScopeForResultVariable: {
        title: SYMPER_APP.$t('v2.workflow.useLocalScopeForResultVariable'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKRESULTVARIABLEPACKAGE.SERVICETASKUSELOCALSCOPEFORRESULTVARIABLE.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    servicetasktriggerable: {
        title: SYMPER_APP.$t('v2.workflow.setServiceTaskToBeTriggerable'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKTRIGGERABLEPACKAGE.SERVICETASKTRIGGERABLE.DESCRIPTION',
        dg: 'detail'
    },
    servicetaskstoreresultvariabletransient: {
        title: SYMPER_APP.$t('v2.workflow.storeResultVariableTransiently'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.SERVICETASKSTORERESULTVARIABLETRANSIENTPACKAGE.SERVICETASKSTORERESULTVARIABLETRANSIENT.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    scriptformat: {
        title: SYMPER_APP.$t('v2.workflow.scriptFormat'),
        type: 'text',
        value: 'SYMPER_SCRIPT',
        info: 'BPMN.PROPERTYPACKAGES.SCRIPTFORMATPACKAGE.SCRIPTFORMAT.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    scripttext: {
        title: SYMPER_APP.$t('v2.workflow.script'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SCRIPTTEXTPACKAGE.SCRIPTTEXT.DESCRIPTION',
        dg: 'formula',
        // toXML: {
        //     "symper_position": "el",
        //     "name": "symperScriptTagPlacehoder",
        //     "superClass": ["Element"],
        //     "properties": [{
        //         "name": "text",
        //         "isBody": true,
        //         "type": "String"
        //     }]
        // },
        // pushToXML: attrToXMLMethods.scriptTextForScriptNodeMethod,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    scriptautostorevariables: {
        title: SYMPER_APP.$t('v2.workflow.autoStoreVariables'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.SCRIPTAUTOSTOREVARIABLESPACKAGE.SCRIPTAUTOSTOREVARIABLES.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    shellcommand: {
        title: SYMPER_APP.$t('v2.workflow.command'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLCOMMANDPACKAGE.SHELLCOMMAND.DESCRIPTION',
        dg: 'detail'
    },
    shellarg1: {
        title: SYMPER_APP.$t('v2.workflow.argument1'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLARG1PACKAGE.SHELLARG1.DESCRIPTION',
        dg: 'detail'
    },
    shellarg2: {
        title: SYMPER_APP.$t('v2.workflow.argument2'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLARG2PACKAGE.SHELLARG2.DESCRIPTION',
        dg: 'detail'
    },
    shellarg3: {
        title: SYMPER_APP.$t('v2.workflow.argument3'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLARG3PACKAGE.SHELLARG3.DESCRIPTION',
        dg: 'detail'
    },
    shellarg4: {
        title: SYMPER_APP.$t('v2.workflow.argument4'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLARG4PACKAGE.SHELLARG4.DESCRIPTION',
        dg: 'detail'
    },
    shellarg5: {
        title: SYMPER_APP.$t('v2.workflow.argument5'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLARG5PACKAGE.SHELLARG5.DESCRIPTION',
        dg: 'detail'
    },
    shellwait: {
        title: SYMPER_APP.$t('v2.workflow.wait'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLWAITPACKAGE.SHELLWAIT.DESCRIPTION',
        dg: 'detail'
    },
    shelloutputvariable: {
        title: SYMPER_APP.$t('v2.workflow.outputVariable'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLOUTPUTVARIABLEPACKAGE.SHELLOUTPUTVARIABLE.DESCRIPTION',
        dg: 'detail'
    },
    shellerrorcodevariable: {
        title: SYMPER_APP.$t('v2.workflow.errorCodeVariable'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLERRORCODEVARIABLEPACKAGE.SHELLERRORCODEVARIABLE.DESCRIPTION',
        dg: 'detail'
    },
    shellredirecterror: {
        title: SYMPER_APP.$t('v2.workflow.redirectError'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLREDIRECTERRORPACKAGE.SHELLREDIRECTERROR.DESCRIPTION',
        dg: 'detail'
    },
    shellcleanenv: {
        title: SYMPER_APP.$t('v2.workflow.cleanEnv'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLCLEANENVPACKAGE.SHELLCLEANENV.DESCRIPTION',
        dg: 'detail'
    },
    shelldirectory: {
        title: SYMPER_APP.$t('v2.workflow.directory'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SHELLDIRECTORYPACKAGE.SHELLDIRECTORY.DESCRIPTION',
        dg: 'detail'
    },
    ruletask_rules: {
        title: SYMPER_APP.$t('v2.workflow.rules'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.RULETASK_RULESPACKAGE.RULETASK_RULES.DESCRIPTION',
        dg: 'detail'
    },
    ruletask_variables_input: {
        title: SYMPER_APP.$t('v2.workflow.inputVariables'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.RULETASK_VARIABLES_INPUTPACKAGE.RULETASK_VARIABLES_INPUT.DESCRIPTION',
        dg: 'detail'
    },
    ruletask_exclude: {
        title: SYMPER_APP.$t('v2.workflow.exclude'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.RULETASK_EXCLUDEPACKAGE.RULETASK_EXCLUDE.DESCRIPTION',
        dg: 'detail'
    },
    ruletask_result: {
        title: SYMPER_APP.$t('v2.workflow.resultVariable'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.RULETASK_RESULTPACKAGE.RULETASK_RESULT.DESCRIPTION',
        dg: 'detail'
    },
    mailtaskheaders: {
        title: SYMPER_APP.$t('v2.workflow.headers'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MAILTASKHEADERSPACKAGE.MAILTASKHEADERS.DESCRIPTION',
        dg: 'detail'
    },
    mailtaskto: {
        title: SYMPER_APP.$t('v2.workflow.to'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MAILTASKTOPACKAGE.MAILTASKTO.DESCRIPTION',
        dg: 'detail'
    },
    mailtaskfrom: {
        title: SYMPER_APP.$t('v2.workflow.from'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MAILTASKFROMPACKAGE.MAILTASKFROM.DESCRIPTION',
        dg: 'detail'
    },
    mailtasksubject: {
        title: SYMPER_APP.$t('v2.workflow.subject'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MAILTASKSUBJECTPACKAGE.MAILTASKSUBJECT.DESCRIPTION',
        dg: 'detail'
    },
    mailtaskcc: {
        title: SYMPER_APP.$t('v2.workflow.cc'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MAILTASKCCPACKAGE.MAILTASKCC.DESCRIPTION',
        dg: 'detail'
    },
    mailtaskbcc: {
        title: SYMPER_APP.$t('v2.workflow.bcc'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MAILTASKBCCPACKAGE.MAILTASKBCC.DESCRIPTION',
        dg: 'detail'
    },
    mailtasktext: {
        title: SYMPER_APP.$t('v2.workflow.text'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MAILTASKTEXTPACKAGE.MAILTASKTEXT.DESCRIPTION',
        dg: 'detail'
    },
    mailtaskhtml: {
        title: SYMPER_APP.$t('v2.workflow.html'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MAILTASKHTMLPACKAGE.MAILTASKHTML.DESCRIPTION',
        dg: 'detail'
    },
    mailtaskcharset: {
        title: SYMPER_APP.$t('v2.workflow.charset'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MAILTASKCHARSETPACKAGE.MAILTASKCHARSET.DESCRIPTION',
        dg: 'detail'
    },
    httptaskrequesturl: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.requestUR'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKREQUESTURLPACKAGE.HTTPTASKREQUESTURL.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptaskrequestheaders: {
        hidden: true,

        title: SYMPER_APP.$t('v2.workflow.requestHeaders'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKREQUESTHEADERSPACKAGE.HTTPTASKREQUESTHEADERS.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptaskrequestbody: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.requestBody'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKREQUESTBODYPACKAGE.HTTPTASKREQUESTBODYPACKAGE.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptaskrequestbodyencoding: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.requestBodyEncoding'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKREQUESTBODYENCODINGPACKAGE.HTTPTASKREQUESTBODYENCODING.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptaskrequesttimeout: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.requestTimeout'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKREQUESTTIMEOUTPACKAGE.HTTPTASKREQUESTTIMEOUT.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptaskdisallowredirects: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.disallowRedirects'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKDISALLOWREDIRECTSPACKAGE.HTTPTASKDISALLOWREDIRECTS.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptaskfailstatuscodes: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.failStatusCodes'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKFAILSTATUSCODESPACKAGE.HTTPTASKFAILSTATUSCODES.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptaskhandlestatuscodes: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.handleStatusCodes'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKHANDLESTATUSCODESPACKAGE.HTTPTASKHANDLESTATUSCODES.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptaskignoreexception: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.ignoreException'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKIGNOREEXCEPTIONPACKAGE.HTTPTASKIGNOREEXCEPTION.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptasksaveresponseparameterstransient: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.saveResponseAsATransientVariable'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKSAVERESPONSEPARAMETERSTRANSIENTPACKAGE.HTTPTASKSAVERESPONSEPARAMETERSTRANSIENT.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptasksaveresponseasjson: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.saveResponseAsJSON'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKSAVERESPONSEASJSONPACKAGE.HTTPTASKSAVERESPONSEASJSON.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    skipexpression: {
        title: SYMPER_APP.$t('v2.workflow.skipExpression'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SKIPEXPRESSIONPACKAGE.SKIPEXPRESSION.DESCRIPTION',
        dg: 'formula',
        toXML: {
            symper_position: 'attr',
            name: 'skipExpression',
            isAttr: true,
            type: 'String'
        }
    },
    httptaskresponsevariablename: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.responseVariableName'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKRESPONSEVARIABLENAMEPACKAGE.HTTPTASKRESPONSEVARIABLENAME.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptasksaverequestvariables: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.saveRequestVariables'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKSAVEREQUESTVARIABLESPACKAGE.HTTPTASKSAVEREQUESTVARIABLES.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptasksaveresponseparameters: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.saveResponseStatusHeaders'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKSAVERESPONSEPARAMETERSPACKAGE.HTTPTASKSAVERESPONSEPARAMETERS.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    httptaskresultvariableprefix: {
        hidden: true,
        title: SYMPER_APP.$t('v2.workflow.resultVariablePrefix'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.HTTPTASKRESULTVARIABLEPREFIXPACKAGE.HTTPTASKRESULTVARIABLEPREFIX.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    callactivitycalledelement: {
        title: SYMPER_APP.$t('v2.workflow.calledElement'),
        type: 'autocomplete',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYCALLEDELEMENTPACKAGE.CALLACTIVITYCALLEDELEMENT.DESCRIPTION',
        dg: 'detail',
        options: [],
        textKey: 'modelName',
        valueKey: 'definitionKey',
        showId: false,
        toXMLExtend: {
            // không định nghĩa lại do thư viện đã định nghĩa sẵn, dùng cho trường hợp tên trong xml khác với tên đẩy về json
            name: 'calledElement'
        }
    },
    callactivitycalledelementtype: {
        title: SYMPER_APP.$t('v2.workflow.calledElementType'),
        type: 'text',
        value: 'key',
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYCALLEDELEMENTTYPEPACKAGE.CALLACTIVITYCALLEDELEMENTTYPE.DESCRIPTION',
        dg: 'detail',
        options: [],
        hidden: true,
        toXML: {
            symper_position: 'attr',
            name: 'calledElementType',
            isAttr: true,
            type: 'String'
        }
    },
    callactivityinparameters: {
        title: SYMPER_APP.$t('v2.workflow.inParameters'),
        type: 'table',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYINPARAMETERSPACKAGE.CALLACTIVITYINPARAMETERS.DESCRIPTION',
        dg: 'detail',
        // hidden: true
        toXML: {
            symper_position: 'el',
            name: 'symper_symper_in_tag',
            superClass: ['Element'],
            properties: [
                {
                    name: 'source',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'target',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'sourceExpression',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'targetExpression',
                    isAttr: true,
                    type: 'String'
                }
            ]
        },
        pushToXML: attrToXMLMethods.acllActivityIOParamsMethod,
        columns: [
            {
                title: SYMPER_APP.$t('v2.workflow.source'),
                name: 'source',
                type: 'text'
            },
            {
                title: SYMPER_APP.$t('v2.workflow.sourceExpression'),
                name: 'sourceExpression',
                type: 'text'
            },
            {
                title: SYMPER_APP.$t('v2.workflow.target'),
                name: 'target',
                type: 'autocomplete',
                source: ['string', 'boolean', 'datetime', 'int', 'long']
            },
            {
                title: SYMPER_APP.$t('v2.workflow.targetExpression'),
                name: 'targetExpression',
                type: 'text'
            }
        ],
        value: [{}],
        getValue(value) {
            return Array.isArray(value) ? value : [];
        },
        restoreData(value) {
            return value == '' ? [{}] : value;
        }
    },
    callactivityoutparameters: {
        title: SYMPER_APP.$t('v2.workflow.outParameters'),
        type: 'table',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYOUTPARAMETERSPACKAGE.CALLACTIVITYOUTPARAMETERS.DESCRIPTION',
        dg: 'detail',
        // hidden: true
        toXML: {
            symper_position: 'el',
            name: 'symper_symper_out_tag',
            superClass: ['Element'],
            properties: [
                {
                    name: 'source',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'target',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'sourceExpression',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'targetExpression',
                    isAttr: true,
                    type: 'String'
                }
            ]
        },
        pushToXML: attrToXMLMethods.acllActivityIOParamsMethod,
        columns: [
            {
                title: SYMPER_APP.$t('v2.workflow.source'),
                name: 'source',
                type: 'text'
            },
            {
                title: SYMPER_APP.$t('v2.workflow.sourceExpression'),
                name: 'sourceExpression',
                type: 'text'
            },
            {
                title: SYMPER_APP.$t('v2.workflow.target'),
                name: 'target',
                type: 'autocomplete',
                source: ['string', 'boolean', 'datetime', 'int', 'long']
            },
            {
                title: SYMPER_APP.$t('v2.workflow.targetExpression'),
                name: 'targetExpression',
                type: 'text'
            }
        ],
        value: [{}],
        getValue(value) {
            return Array.isArray(value) ? value : [];
        },
        restoreData(value) {
            return value == '' ? [{}] : value;
        }
    },
    callactivityinheritvariables: {
        title: SYMPER_APP.$t('v2.workflow.inheritVariablesInSubProcess'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYINHERITVARIABLESPACKAGE.CALLACTIVITYINHERITVARIABLES.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'inheritVariables',
            isAttr: true,
            type: 'String'
        }
    },
    callactivitysamedeployment: {
        title: SYMPER_APP.$t(
            'v2.workflow.starttheReferencedProcessFromTheSameDeployment'
        ),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYSAMEDEPLOYMENTPACKAGE.CALLACTIVITYSAMEDEPLOYMENT.DESCRIPTION',
        dg: 'detail',
        hidden: true,
        toXML: {
            symper_position: 'attr',
            name: 'sameDeployment',
            isAttr: true,
            type: 'String'
        }
    },
    callactivityfallbacktodefaulttenant: {
        title: SYMPER_APP.$t('v2.workflow.fallbackToDefaultTenant'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYFALLBACKTODEFAULTTENANTPACKAGE.CALLACTIVITYFALLBACKTODEFAULTTENANT.DESCRIPTION',
        dg: 'detail',
        hidden: true,
        toXML: {
            symper_position: 'attr',
            name: 'fallbackToDefaultTenant',
            isAttr: true,
            type: 'String'
        }
    },
    callactivityidvariablename: {
        title: SYMPER_APP.$t('v2.workflow.idVariable'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYIDVARIABLENAMEPACKAGE.CALLACTIVITYIDVARIABLENAME.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'idVariableName',
            isAttr: true,
            type: 'String'
        }
    },
    callactivityprocessinstancename: {
        title: SYMPER_APP.$t('v2.workflow.processInstanceName'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYPROCESSINSTANCENAMEPACKAGE.CALLACTIVITYPROCESSINSTANCENAME.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'processInstanceName',
            isAttr: true,
            type: 'String'
        }
    },
    callactivityinheritbusinesskey: {
        title: SYMPER_APP.$t('v2.workflow.inheritBusinessKey'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYINHERITBUSINESSKEYPACKAGE.CALLACTIVITYINHERITBUSINESSKEY.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'inheritBusinessKey',
            isAttr: true,
            type: 'String'
        }
    },
    callactivityuselocalscopeforoutparameters: {
        title: SYMPER_APP.$t('v2.workflow.useLocalScopeForOutParameters'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYUSELOCALSCOPEFOROUTPARAMETERSPACKAGE.CALLACTIVITYUSELOCALSCOPEFOROUTPARAMETERS.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'useLocalScopeForOutParameters',
            isAttr: true,
            type: 'String'
        }
    },
    callactivitybusinesskey: {
        title: SYMPER_APP.$t('v2.workflow.businessKeyExpression'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYBUSINESSKEYPACKAGE.CALLACTIVITYBUSINESSKEY.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'businessKey',
            isAttr: true,
            type: 'String'
        }
    },
    callactivitycompleteasync: {
        title: SYMPER_APP.$t('v2.workflow.completeAsynchronously'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.CALLACTIVITYCOMPLETEASYNCPACKAGE.CALLACTIVITYCOMPLETEASYNC.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'completeAsync',
            isAttr: true,
            type: 'String'
        }
    },
    cameltaskcamelcontext: {
        title: SYMPER_APP.$t('v2.workflow.camelContext'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.CAMELTASKCAMELCONTEXTPACKAGE.CAMELTASKCAMELCONTEXT.DESCRIPTION',
        dg: 'detail'
    },
    muletaskendpointurl: {
        title: SYMPER_APP.$t('v2.workflow.endpointUrl'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MULETASKENDPOINTURLPACKAGE.MULETASKENDPOINTURL.DESCRIPTION',
        dg: 'detail'
    },
    muletasklanguage: {
        title: SYMPER_APP.$t('v2.workflow.language'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MULETASKLANGUAGEPACKAGE.MULETASKLANGUAGE.DESCRIPTION',
        dg: 'detail'
    },
    muletaskpayloadexpression: {
        title: SYMPER_APP.$t('v2.workflow.payloadExpression'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MULETASKPAYLOADEXPRESSIONPACKAGE.MULETASKPAYLOADEXPRESSION.DESCRIPTION',
        dg: 'detail'
    },
    muletaskresultvariable: {
        title: SYMPER_APP.$t('v2.workflow.resultVariable'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MULETASKRESULTVARIABLEPACKAGE.MULETASKRESULTVARIABLE.DESCRIPTION',
        dg: 'detail'
    },
    conditionsequenceflow: {
        title: SYMPER_APP.$t('v2.workflow.flowCondition'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.CONDITIONSEQUENCEFLOWPACKAGE.CONDITIONSEQUENCEFLOWPACKAGE.DESCRIPTION',
        dg: 'formula',
        toXML: {
            symper_position: 'el',
            name: 'conditionExpression',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        },
        pushToXML: attrToXMLMethods.conditionExpressionMethod
    },
    defaultflow: {
        title: SYMPER_APP.$t('v2.workflow.flowCondition'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.DEFAULTFLOWPACKAGE.DEFAULTFLOW.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    conditionalflow: {
        title: SYMPER_APP.$t('v2.workflow.defaultFlow'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.CONDITIONALFLOWPACKAGE.CONDITIONALFLOW.DESCRIPTION',
        dg: 'detail'
    },
    timercycledefinition: {
        title: SYMPER_APP.$t('v2.workflow.timeCycle'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.TIMERCYCLEDEFINITIONPACKAGE.TIMERCYCLEDEFINITION.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    timerdatedefinition: {
        title: SYMPER_APP.$t('v2.workflow.timeDateInISO8601'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.TIMERDATEDEFINITIONPACKAGE.TIMERDATEDEFINITION.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    timerdurationdefinition: {
        title: SYMPER_APP.$t('v2.workflow.timeDuration'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.TIMERDURATIONDEFINITIONPACKAGE.TIMERDURATIONDEFINITION.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    timerenddatedefinition: {
        title: SYMPER_APP.$t('v2.workflow.timeEndDateInISO8601'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.TIMERENDDATEDEFINITIONPACKAGE.TIMERENDDATEDEFINITION.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'endDate',
            isAttr: true,
            type: 'String'
        },
        pushToXML: attrToXMLMethods.notPushToXML
    },
    messageref: {
        title: SYMPER_APP.$t('v2.workflow.messageReference'),
        type: 'autocomplete',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MESSAGEREFPACKAGE.MESSAGEREF.DESCRIPTION',
        dg: 'detail',
        options: [],
        textKey: 'name',
        valueKey: 'id',
        showId: false,
        pushToXML: attrToXMLMethods.messageRefMethod
    },
    signalexpression: {
        title: SYMPER_APP.$t('v2.workflow.signalExpression'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.SIGNALREFPACKAGE.SIGNALREF.EXPRESSION',
        dg: 'detail',
        options: [],
        textKey: 'name',
        valueKey: 'id',
        showId: false,
        pushToXML: attrToXMLMethods.signalExpressionMethod
    },
    errorref: {
        title: SYMPER_APP.$t('v2.workflow.errorReference'),
        type: 'autocomplete',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.ERRORREFPACKAGE.ERRORREF.DESCRIPTION',
        dg: 'detail'
    },
    eventkey: {
        title: SYMPER_APP.$t('v2.workflow.eventKey'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.EVENTKEY.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    eventname: {
        title: SYMPER_APP.$t('v2.workflow.eventName'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.EVENTNAME.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    eventinparameters: {
        title: SYMPER_APP.$t('v2.workflow.mappingToEventPayload'),
        type: 'table',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.EVENTINPARAMETERS.DESCRIPTION',
        dg: 'detail',
        columns: []
    },
    eventoutparameters: {
        title: SYMPER_APP.$t('v2.workflow.mappingFromEventPayload'),
        type: 'table',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.EVENTOUTPARAMETERS.DESCRIPTION',
        dg: 'detail',
        columns: []
    },
    eventcorrelationparameters: {
        title: SYMPER_APP.$t('v2.workflow.correlationParameters'),
        type: 'table',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.EVENTCORRELATIONPARAMETERS.DESCRIPTION',
        dg: 'detail',
        columns: [],
        hidden: true
    },
    channelkey: {
        title: SYMPER_APP.$t('v2.workflow.channelKey'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.CHANNELKEY.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    channelname: {
        title: SYMPER_APP.$t('v2.workflow.channelName'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.CHANNELNAME.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    channeltype: {
        title: SYMPER_APP.$t('v2.workflow.channelType'),
        type: 'autocomplete',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.CHANNELTYPE.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    channeldestination: {
        title: SYMPER_APP.$t('v2.workflow.channelDestination'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.CHANNELDESTINATION.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    triggereventkey: {
        title: SYMPER_APP.$t('v2.workflow.triggerEventKey'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.TRIGGEREVENTKEY.DESCRIPTION',
        dg: 'detail'
    },
    triggereventname: {
        title: SYMPER_APP.$t('v2.workflow.triggerEventName'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.TRIGGEREVENTNAME.DESCRIPTION',
        dg: 'detail'
    },
    triggerchannelkey: {
        title: SYMPER_APP.$t('v2.workflow.triggerChannelKey'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.TRIGGERHANNELKEY.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    triggerchannelname: {
        title: SYMPER_APP.$t('v2.workflow.triggerChannelName'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.TRIGGERCHANNELNAME.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    triggerchanneltype: {
        title: SYMPER_APP.$t('v2.workflow.triggerChannelType'),
        type: 'autocomplete',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.TRIGGERCHANNELTYPE.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    triggerchanneldestination: {
        title: SYMPER_APP.$t('v2.workflow.triggerChannelDestination'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.TRIGGERCHANNELDESTINATION.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    keydetectionfixedvalue: {
        title: SYMPER_APP.$t('v2.workflow.eventKeyFixedValue'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.KEYDETECTIONFIXEDVALUE.DESCRIPTION',
        dg: 'detail'
    },
    keydetectionjsonfield: {
        title: SYMPER_APP.$t('v2.workflow.eventKeyJsonField'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.KEYDETECTIONJSONFIELD.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    keydetectionjsonpointer: {
        title: SYMPER_APP.$t('v2.workflow.eventKeyJsonPointer'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EVENTREGISTRYPACKAGE.KEYDETECTIONJSONPOINTER.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    topic: {
        title: SYMPER_APP.$t('v2.workflow.jobTopic'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.EXTERNALWORKERJOBPACKAGE.TOPIC.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    escalationref: {
        title: SYMPER_APP.$t('v2.workflow.escalationReference'),
        type: 'autocomplete',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.ESCALATIONREFPACKAGE.ESCALATIONREF.DESCRIPTION',
        dg: 'detail'
    },
    cancelactivity: {
        title: SYMPER_APP.$t('v2.workflow.cancelActivity'),
        type: 'checkbox',
        value: true,
        info: 'BPMN.PROPERTYPACKAGES.CANCELACTIVITYPACKAGE.CANCELACTIVITY.DESCRIPTION',
        dg: 'detail'
    },
    conditionaleventcondition: {
        title: SYMPER_APP.$t('v2.workflow.conditionExpression'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.CONDITIONALEVENTPACKAGE.CONDITION.DESCRIPTION',
        dg: 'detail',
        pushToXML: attrToXMLMethods.pushConditionTagToXML
    },
    initiator: {
        title: SYMPER_APP.$t('v2.workflow.initiator'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.INITIATORPACKAGE.INITIATOR.DESCRIPTION',
        dg: 'detail'
    },
    text: {
        title: SYMPER_APP.$t('v2.workflow.text'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.TEXTPACKAGE.TEXT.DESCRIPTION',
        dg: 'detail'
    },
    multiinstance_type: {
        title: SYMPER_APP.$t('v2.workflow.multiInstanceType'),
        type: 'text',
        value: 'None',
        info: 'BPMN.PROPERTYPACKAGES.MULTIINSTANCE_TYPEPACKAGE.MULTIINSTANCE_TYPE.DESCRIPTION',
        dg: 'multiInstance',
        hidden: true,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    multiinstance_cardinality: {
        title: SYMPER_APP.$t('v2.workflow.cardinality'),
        type: 'script',
        value: '1',
        info: 'BPMN.PROPERTYPACKAGES.MULTIINSTANCE_CARDINALITYPACKAGE.MULTIINSTANCE_CARDINALITY.DESCRIPTION',
        dg: 'multiInstance',
        toXML: {
            symper_position: 'el',
            name: 'loopCardinality',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        },
        validate() {
            let vl = this.value;
            if (Number(vl) <= 0) {
                let item = {
                    isValid: false,
                    message: SYMPER_APP.$t(
                        'v2.workflow.pleaseEnterANumberGreaterThan0'
                    )
                };
                Vue.set(this, 'validateStatus', item);
            } else {
                let item = {
                    isValid: true,
                    message: 'success'
                };
                Vue.set(this, 'validateStatus', item);
            }
        },
        pushToXML: attrToXMLMethods.subLoopCharMethod
    },
    multiinstance_collection: {
        title: SYMPER_APP.$t('v2.workflow.collection'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MULTIINSTANCE_COLLECTIONPACKAGE.MULTIINSTANCE_COLLECTION.DESCRIPTION',
        dg: 'multiInstance',
        hidden: true,
        toXML: {
            symper_position: 'attr',
            name: 'collection',
            isAttr: true,
            type: 'String'
        },
        pushToXML: attrToXMLMethods.collectionMethod
    },
    multiinstance_variable: {
        title: SYMPER_APP.$t('v2.workflow.elementVariable'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MULTIINSTANCE_VARIABLEPACKAGE.MULTIINSTANCE_VARIABLE.DESCRIPTION',
        dg: 'multiInstance',
        hidden: true
    },
    multiinstance_condition: {
        title: SYMPER_APP.$t('v2.workflow.completionCondition'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.MULTIINSTANCE_CONDITIONPACKAGE.MULTIINSTANCE_CONDITION.DESCRIPTION',
        dg: 'multiInstance',
        toXML: {
            symper_position: 'el',
            name: 'completionCondition',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        },
        pushToXML: attrToXMLMethods.subLoopCharMethod
    },
    isforcompensation: {
        title: SYMPER_APP.$t('v2.workflow.isForCompensation'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.ISFORCOMPENSATIONPACKAGE.ISFORCOMPENSATION.DESCRIPTION',
        dg: 'detail'
    },
    sequencefloworder: {
        title: SYMPER_APP.$t('v2.workflow.flowOrder'),
        type: 'ordering',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.SEQUENCEFLOWORDERPACKAGE.SEQUENCEFLOWORDER.DESCRIPTION',
        dg: 'detail',
        getValue(value) {
            return value.reduce((ids, el) => {
                ids.push(el.idFlow);
                return ids;
            }, []);
        },
        restoreData(value) {
            return value.reduce((arr, el) => {
                arr.push({
                    idFlow: el,
                    text: ''
                });
                return arr;
            }, []);
        }
    },
    messagedefinitions: {
        title: SYMPER_APP.$t('v2.workflow.messageDefinitions'),
        type: 'table',
        value: [
            {
                //     id: 'msg01',
                //     name: 'msg name'
            }
        ],
        columns: [
            {
                title: 'Id',
                name: 'id',
                type: 'text'
            },
            {
                title: 'Name',
                name: 'name',
                type: 'text'
            }
        ],
        info: 'BPMN.PROPERTYPACKAGES.MESSAGEDEFINITIONSPACKAGE.MESSAGEDEFINITIONS.DESCRIPTION',
        dg: 'detail',
        needReformatValue: true,
        getValue(value) {
            let rsl = [];
            if (Array.isArray(value)) {
                for (let item of value) {
                    if (!item.symper_symper_scope_tag) {
                        item.symper_symper_scope_tag = 'global';
                    }

                    let newItem = {
                        id: item.id,
                        name: item.name
                    };

                    if (newItem.id && newItem.id.trim()) {
                        rsl.push(newItem);
                    }
                }
            }
            return rsl;
        },
        getValueForXML(value) {
            let rsl = [];
            if (Array.isArray(value)) {
                for (let item of value) {
                    if (item.id && item.id.trim()) {
                        rsl.push({
                            id: item.id,
                            name: item.name
                        });
                    }
                }
            }
            return rsl;
        },
        restoreData(value) {
            let rsl = [];
            if (Array.isArray(value)) {
                for (let item of value) {
                    let newItem = {
                        id: item.id,
                        name: item.name
                    };

                    if (newItem.id && newItem.id.trim()) {
                        rsl.push(newItem);
                    }
                }
            }

            if (rsl.length == 0) {
                rsl.push({});
            }
            return rsl;
        },
        toXML: {
            symper_position: 'el',
            name: 'Message',
            superClass: ['Element'],
            properties: [
                {
                    name: 'id',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'name',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'scope',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        },
        pushToXML: attrToXMLMethods.pushNewEqualEls
    },
    escalationdefinitions: {
        title: SYMPER_APP.$t('v2.workflow.escalationDefinitions'),
        type: 'table',
        value: [
            {
                //     id: 'esca01',
                //     name: 'esca01 name'
            }
        ],
        columns: [
            {
                title: 'Id',
                name: 'id',
                type: 'text'
            },
            {
                title: 'Name',
                name: 'name',
                type: 'text'
            }
        ],
        info: 'BPMN.PROPERTYPACKAGES.ESCALATIONDEFINITIONSPACKAGE.ESCALATIONDEFINITIONS.DESCRIPTION',
        dg: 'detail',
        getValue(value) {
            return Array.isArray(value) ? value : [];
        },
        restoreData(value) {
            return value == '' ? [] : value;
        },
        toXML: {
            symper_position: 'el',
            name: 'Escalation',
            superClass: ['Element'],
            properties: [
                {
                    name: 'id',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'name',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'scope',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        },
        needReformatValue: true,
        pushToXML: attrToXMLMethods.pushNewEqualEls
    },
    istransaction: {
        title: SYMPER_APP.$t('v2.workflow.isATransactionSubProcess'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.ISTRANSACTIONPACKAGE.ISTRANSACTION.DESCRIPTION',
        dg: 'detail'
    },
    formreference: {
        title: SYMPER_APP.$t('v2.workflow.formReference'),
        type: 'autocomplete',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.FORMREFERENCEPACKAGE.FORMREFERENCE.DESCRIPTION',
        dg: 'taskAction',
        onSearch: async function (val) {
            // val là giá trị đang nhập trên ô input, lúc này this sẽ trỏ đến autocomplete instance
            if (!val) {
                return;
            }
            let docs = await apiCaller.get(
                appConfigs.apiDomain.sdocumentManagement +
                    'documents?search=' +
                    val
            );
            this.myItems = docs.data.listObject;
        },
        options: [{ id: '    ', name: '', title: '' }],
        toXML: {
            symper_position: 'attr',
            name: 'formreference',
            isAttr: true,
            type: 'String'
        },
        pushToXML: attrToXMLMethods.notPushToXML
    },
    terminateAll: {
        title: SYMPER_APP.$t('v2.workflow.terminateAll'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.TERMINATEALLPACKAGE.TERMINATEALL.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'symper_symper_terminateAll_tag',
            isAttr: true,
            type: 'String'
        }
    },
    decisiontaskdecisiontablereference: {
        title: SYMPER_APP.$t('v2.workflow.decisionTableReference'),
        type: 'table',
        value: [],
        info: 'BPMN.PROPERTYPACKAGES.DECISIONTASKDECISIONTABLEREFERENCEPACKAGE.DECISIONTASKDECISIONTABLEREFERENCE.DESCRIPTION',
        dg: 'detail',
        columns: []
    },
    decisiontaskthrowerroronnohits: {
        title: SYMPER_APP.$t('v2.workflow.throwErrorIfNoRulesWereHit'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.DECISIONTASKTHROWERRORONNOHITSPACKAGE.DECISIONTASKTHROWERRORONNOHITS.DESCRIPTION',
        dg: 'detail'
    },
    decisiontaskfallbacktodefaulttenant: {
        title: SYMPER_APP.$t('v2.workflow.fallbackToDefaultTenant'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.DECISIONTASKFALLBACKTODEFAULTTENANTPACKAGE.DECISIONTASKFALLBACKTODEFAULTTENANT.DESCRIPTION',
        dg: 'detail'
    },
    isInterrupting: {
        title: SYMPER_APP.$t('v2.workflow.interrupting'),
        type: 'checkbox',
        value: true,
        info: 'BPMN.PROPERTYPACKAGES.INTERRUPTINGPACKAGE.INTERRUPTING.DESCRIPTION',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'isInterrupting',
            isAttr: true,
            type: 'String',
            defined: true
        }
    },
    completioncondition: {
        title: SYMPER_APP.$t('v2.workflow.completionCondition'),
        type: 'script',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.COMPLETIONCONDITIONPACKAGE.COMPLETIONCONDITION.DESCRIPTION',
        dg: 'formula',
        toXML: {
            symper_position: 'attr',
            name: 'terminateAll',
            isAttr: true,
            type: 'String'
        }
    },
    ordering: {
        title: SYMPER_APP.$t('v2.workflow.ordering'),
        type: 'text',
        value: 'Parallel',
        info: 'BPMN.PROPERTYPACKAGES.ORDERINGPACKAGE.ORDERING.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    cancelremaininginstances: {
        title: SYMPER_APP.$t('v2.workflow.cancelRemainingInstances'),
        type: 'checkbox',
        value: true,
        info: 'BPMN.PROPERTYPACKAGES.CANCELREMAININGINSTANCESPACKAGE.CANCELREMAININGINSTANCES.DESCRIPTION',
        dg: 'detail'
    },
    showcaption: {
        title: SYMPER_APP.$t('v2.workflow.cancelRemainingInstances'),
        type: 'checkbox',
        value: false,
        info: 'BPMN.PROPERTYPACKAGES.CANCELREMAININGINSTANCESPACKAGE.CANCELREMAININGINSTANCES.DESCRIPTION',
        dg: 'detail',
        hidden: true
    },
    taskAction: {
        // loại task: submit hoặc approval
        title: SYMPER_APP.$t('v2.workflow.taskAction'),
        type: 'select',
        value: 'submit',
        info: '',
        options: [
            {
                text: SYMPER_APP.$t('v2.workflow.submit'),
                value: 'submit'
            },
            {
                text: SYMPER_APP.$t('v2.workflow.approval'),
                value: 'approval'
            },
            {
                text: SYMPER_APP.$t('v2.workflow.updateDocument'),
                value: 'update'
            },
            {
                text: SYMPER_APP.$t('v2.workflow.updateAction'),
                value: 'undefined'
            }
        ],
        dg: 'taskAction',
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    approvalActions: {
        // BA tự cấu hình các hành động cho việc duyệt
        title: SYMPER_APP.$t('v2.workflow.outcomes'),
        type: 'table',
        value: [
            {
                text: SYMPER_APP.$t('v2.workflow.approval'),
                value: 'approval',
                color: 'green'
            },
            {
                text: SYMPER_APP.$t('v2.workflow.disapproval'),
                value: 'disapproval',
                color: 'red'
            }
        ],
        info: '',
        columns: [
            {
                title: SYMPER_APP.$t('v2.workflow.text'),
                name: 'text',
                type: 'text',
                cellRenderer: ApprovalButtonRender
            },
            {
                title: SYMPER_APP.$t('v2.workflow.value'),
                name: 'value',
                type: 'text'
            },
            {
                title: SYMPER_APP.$t('v2.workflow.color'),
                name: 'color',
                type: 'autocomplete',
                source: [
                    'yellow',
                    'red',
                    'orange',
                    'green',
                    'blue',
                    'grey',
                    'black',
                    'white'
                ]
            }
        ],
        dg: 'taskAction',
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    assignee: {
        title: SYMPER_APP.$t('v2.workflow.assignee'),
        type: 'userAssignment', // trong user assignment có hai tab: select qua orgchart và viết script
        value: {
            orgChart: [],
            formula: '',
            orgchartSelectorValue: [] // dạng value của orgchartselector để hiển thị lên
        },
        getValueForXML(value) {
            return userAssignmentToXMLValue(value);
        },
        activeTab: 'orgchart', // tab nào sẽ mở: orgchart hoặc script
        dg: 'assignment',
        toXML: {
            symper_position: 'attr',
            name: 'symper_prefix_chars_assignee',
            isAttr: true,
            type: 'String'
        }
    },
    taskOwner: {
        title: SYMPER_APP.$t('v2.workflow.taskOwner'),
        type: 'userAssignment', // trong user assignment có hai tab: select qua orgchart và viết script
        value: {
            orgChart: [],
            formula: '',
            orgchartSelectorValue: [] // dạng value của orgchartselector để hiển thị lên
        },
        activeTab: 'orgchart', // tab nào sẽ mở: orgchart hoặc script
        dg: 'assignment',
        // toXML: {
        //     "symper_position": "attr",
        //     "name": "candidateUsers",
        //     "isAttr": true,
        //     "type": "String"
        // },
        pushToXML: attrToXMLMethods.notPushToXML
    },
    candidateUsers: {
        title: SYMPER_APP.$t('v2.workflow.candidateUsers'),
        type: 'userAssignment',
        value: {
            orgChart: [],
            formula: ''
        },
        activeTab: 'orgchart', // tab nào sẽ mở: orgchart hoặc script
        dg: 'assignment',
        getValueForXML(value) {
            return userAssignmentToXMLValue(value);
        },
        toXML: {
            symper_position: 'attr',
            name: 'symper_prefix_chars_candidateUsers',
            isAttr: true,
            type: 'String'
        }
    },

    notificationTitle: {
        title: SYMPER_APP.$t('v2.workflow.notificationAndTaskTitle'),
        type: 'script',
        value: '',
        info: '',
        dg: 'formula',
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    taskExtraInfoLabel: {
        title: SYMPER_APP.$t('v2.workflow.extraInfoLabelForTask'),
        type: 'script',
        value: '',
        info: '',
        dg: 'formula',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    taskExtraInfoValue: {
        title: SYMPER_APP.$t('v2.workflow.extraInfoValueForTask'),
        type: 'script',
        value: '',
        info: '',
        dg: 'formula',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    notificationContent: {
        title: SYMPER_APP.$t('v2.workflow.notificationAndTaskContent'),
        type: 'script',
        value: '',
        info: '',
        dg: 'formula',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    extraInfoLabel: {
        title: SYMPER_APP.$t('v2.workflow.extraInfoLabel'),
        type: 'script',
        value: '',
        info: '',
        dg: 'formula',
        pushToXML: attrToXMLMethods.notPushToXML
    },

    extraInfoValue: {
        title: SYMPER_APP.$t('v2.workflow.extraInfoValue'),
        type: 'script',
        value: '',
        info: '',
        dg: 'formula',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    autoUpdateTaskInfo: {
        title: SYMPER_APP.$t(
            'v2.workflow.autoUpdateTaskTitleTaskContentExtraInfoLabelExtraInfoValue'
        ),
        type: 'checkbox',
        value: false,
        info: '',
        dg: 'formula'
    },

    approvalForElement: {
        title: SYMPER_APP.$t('v2.workflow.approvalForElement'),
        type: 'autocomplete',
        value: '',
        info: '',
        options: [],
        dg: 'taskAction',
        showId: false,
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    approvalDocObjValue: {
        title: SYMPER_APP.$t(
            'v2.workflow.sriptForSelectDocumentObjectForApproval'
        ),
        type: 'script',
        value: '',
        info: '',
        options: [],
        dg: 'taskAction',
        showId: false,
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    approvalEditableControls: {
        title: SYMPER_APP.$t('v2.workflow.editableControlsOnApproval'),
        type: 'autocomplete',
        value: '',
        info: '',
        options: [],
        dg: 'taskAction',
        multipleSelection: true,
        showId: false,
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    updateForElement: {
        title: SYMPER_APP.$t('v2.workflow.updateForElement'),
        type: 'autocomplete',
        value: '',
        info: '',
        options: [],
        dg: 'taskAction',
        showId: false,
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    controlsForBizKey: {
        title: SYMPER_APP.$t('v2.workflow.selectControlForBusinessKey'),
        type: 'autocomplete',
        value: '',
        info: '',
        options: [],
        dg: 'detail',
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML,
        toXML: {
            symper_position: 'el',
            name: 'BusinessKeyControl',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        }
    },
    documentObjectIdForUpdate: {
        title: SYMPER_APP.$t('v2.workflow.scriptForSelectDocumentObjectId'),
        type: 'script',
        value: '',
        info: '',
        dg: 'taskAction',
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML,
        toXML: {
            symper_position: 'el',
            name: 'documentObjectIdForUpdate',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        }
    },
    instanceDisplayText: {
        title: SYMPER_APP.$t('v2.workflow.displayTextForProcessInstance'),
        type: 'script',
        value: '',
        info: '',
        dg: 'detail',
        isSymperProp: true,
        pushToXML: attrToXMLMethods.notPushToXML,
        toXML: {
            symper_position: 'el',
            name: 'InstanceDisplayText',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        }
    },
    valueTag: {
        title: '',
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.DOCUMENTATIONPACKAGE.DOCUMENTATION.DESCRIPTION',
        dg: 'general',
        hidden: true,
        toXML: {
            symper_position: 'el',
            name: 'symper_symper_value_tag',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        },
        pushToXML: attrToXMLMethods.documentationMethod
    },
    text: {
        title: SYMPER_APP.$t('v2.workflow.text'),
        type: 'text',
        value: '',
        info: 'BPMN.PROPERTYPACKAGES.DOCUMENTATIONPACKAGE.DOCUMENTATION.DESCRIPTION',
        dg: 'general',
        pushToXML: attrToXMLMethods.notPushToXML
    },

    serviceTaskType: {
        title: SYMPER_APP.$t('v2.workflow.serviceTaskType'),
        type: 'select',
        value: 'script',
        info: '',
        dg: 'detail',
        options: [
            {
                text: SYMPER_APP.$t('v2.workflow.script'),
                value: 'script'
            },
            {
                text: SYMPER_APP.$t('v2.workflow.notification'),
                value: 'notification'
            },
            {
                text: SYMPER_APP.$t('v2.workflow.setVariables'),
                value: 'setVariables'
            }
        ],
        pushToXML: attrToXMLMethods.notPushToXML
    },
    serviceTaskTypeHTTP: {
        title: '',
        hidden: true,
        type: 'text',
        value: 'http',
        info: '',
        dg: 'detail',
        toXML: {
            symper_position: 'attr',
            name: 'type',
            isAttr: true,
            type: 'String'
        }
    },
    serviceTaskScriptValue: {
        title: SYMPER_APP.$t('v2.workflow.scriptForServiceTask'),
        type: 'script',
        value: '',
        info: '',
        dg: 'detail',
        hidden: false,
        pushToXML: attrToXMLMethods.notPushToXML
    },

    // serviceTaskHTTPType: {
    //     "title": "",
    //     "type": "text",
    //     "value": "",
    //     "info": "",
    //     "dg": "detail",
    // },
    serviceTaskField: {
        title: '',
        hidden: true,
        type: '',
        value: '',
        info: '',
        dg: 'detail',
        toXML: {
            symper_position: 'el',
            name: 'symper_symper_field_tag',
            superClass: ['Element'],
            properties: [
                {
                    name: 'name',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ],
            extraElements: [
                {
                    name: 'String',
                    properties: [
                        {
                            name: 'text',
                            isBody: true,
                            type: 'String'
                        }
                    ]
                }
            ]
        }
    },
    serviceTaskString: {
        title: '',
        hidden: true,
        type: '',
        value: '',
        info: '',
        dg: 'detail',
        toXML: {
            symper_position: 'el',
            name: 'string',
            superClass: ['Element'],
            properties: [
                {
                    name: 'text',
                    isBody: true,
                    type: 'String'
                }
            ]
        }
    },

    serviceNotificationReceiver: {
        title: SYMPER_APP.$t('v2.workflow.receiver'),
        type: 'userAssignment', // trong user assignment có hai tab: select qua orgchart và viết script
        value: {
            orgChart: [],
            formula: '',
            orgchartSelectorValue: [] // dạng value của orgchartselector để hiển thị lên
        },
        // getValueForXML(value) {
        //     return userAssignmentToXMLValue(value);
        // },
        activeTab: 'orgchart', // tab nào sẽ mở: orgchart hoặc script
        dg: 'detail',
        hidden: false,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    serviceNotificationTitle: {
        title: SYMPER_APP.$t('v2.workflow.title'),
        type: 'script',
        value: '',
        info: '',
        dg: 'detail',
        hidden: false,
        validate() {
            let vl = this.value;
            if (vl == null || vl == '') {
                let item = {
                    isValid: false,
                    message: SYMPER_APP.$t('v2.workflow.pleaseEnterTitle')
                };
                Vue.set(this, 'validateStatus', item);
            } else {
                let item = {
                    isValid: true,
                    message: 'success'
                };
                Vue.set(this, 'validateStatus', item);
            }
        },
        pushToXML: attrToXMLMethods.notPushToXML
    },
    serviceNotificationDescription: {
        title: SYMPER_APP.$t('v2.workflow.description'),
        type: 'script',
        value: '',
        info: '',
        dg: 'detail',
        hidden: false,
        validate() {
            let vl = this.value;
            if (vl == null || vl == '') {
                let item = {
                    isValid: false,
                    message: SYMPER_APP.$t('v2.workflow.pleaseEnterDescription')
                };
                Vue.set(this, 'validateStatus', item);
            } else {
                let item = {
                    isValid: true,
                    message: 'success'
                };
                Vue.set(this, 'validateStatus', item);
            }
        },
        pushToXML: attrToXMLMethods.notPushToXML
    },
    serviceNotificationActionForElement: {
        //action chon node trong workflow
        title: SYMPER_APP.$t('v2.workflow.actionChoseNode'),
        type: 'autocomplete',
        value: '',
        info: '',
        options: [],
        dg: 'detail',
        showId: false,
        isSymperProp: true,
        hidden: false,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    selectDefaultControlDocument: {
        // cấu hình form định nghĩa sẵn dữ liệu cho control của document
        title: SYMPER_APP.$t('v2.workflow.valueDefault'),
        type: 'defaultControlDocument',
        value: [],
        info: '',
        docId: 0,
        options: [],
        dg: 'taskAction',
        isSymperProp: true,
        hidden: false,
        pushToXML: attrToXMLMethods.notPushToXML
    },
    prefixForSignalParameters: {
        title: SYMPER_APP.$t('v2.workflow.signalParameterPrefix'),
        type: 'text',
        value: 'signal',
        info: '',
        dg: 'detail',
        pushToXML: attrToXMLMethods.notPushToXML
    },
    serviceTaskVariables: {
        title: SYMPER_APP.$t('v2.workflow.setVariables'),
        type: 'table',
        value: [{}],
        info: 'BPMN.PROPERTYPACKAGES.SERVICEVARIABLESDATAPACKAGE.SERVICEVARIABLESDATA.DESCRIPTION',
        dg: 'detail',
        hidden: false,
        columns: [
            {
                title: SYMPER_APP.$t('v2.workflow.name'),
                name: 'name',
                type: 'text'
            },
            {
                title: SYMPER_APP.$t('v2.workflow.value'),
                name: 'value',
                type: 'text'
            }
        ],
        getValue(value) {
            return Array.isArray(value) ? value : [];
        },
        restoreData(value) {
            return value == '' ? [{}] : value;
        },
        needReformatValue: true,
        toXML: {
            symper_position: 'el',
            name: 'dataVariables',
            superClass: ['Element'],
            properties: [
                {
                    name: 'id',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'name',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'itemSubjectRef',
                    isAttr: true,
                    type: 'String'
                },
                {
                    name: 'extensionElements',
                    type: 'ExtensionElements'
                }
            ],
            extraElements: [
                {
                    name: 'ExtensionElements',
                    properties: [
                        {
                            name: 'value',
                            type: 'Value'
                        }
                    ]
                },
                {
                    name: 'Value',
                    properties: [
                        {
                            name: 'text',
                            isBody: true,
                            type: 'String'
                        }
                    ]
                }
            ]
        },
        pushToXML: attrToXMLMethods.notPushToXML
    }
};

for (let name in allAttrs) {
    let attr = allAttrs[name];
    if (typeof attr.pushToXML != 'function') {
        attr.pushToXML = attrToXMLMethods.setValueAsAttr;
    }

    if (typeof attr.getValue != 'function') {
        attr.getValue = function (value, shorten = true) {
            if (typeof value == 'string') {
                if (shorten) {
                    value = value.replace(/\n|\r\n/g, ' ').replace(/\s+/g, ' ');
                }
            }
            return value;
        };
    }
    if (!attr.toXML) {
        attr.toXML = {
            symper_position: 'attr',
            name: name,
            isAttr: true,
            type: 'String'
        };
    }
}

export const allNodesAttrs = allAttrs;
