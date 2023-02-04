<template>
    <!--Symper Vue componet cho việc sử dụng thư viện bpmn.io -->
    <div
        :class="{
            'read-only-modeler': readOnly,
            'containers h-100 w-100': true,
            'hide-process-palette': readOnly
        }"
        ref="content"
    >
        <div
            :class="{
                'read-only-background': !readOnly,
                'symper-bpm-canvas': true,
                'symper-bpm-canvas-heat-map': heatMapMode == true
            }"
            :style="{ height: height > 0 ? height + 'px' : '100%!important' }"
            ref="canvas"
        ></div>
        <a ref="downloadLinkXML" href></a>
        <a ref="downloadLinkSVG" href></a>
    </div>
</template>

<script>
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import { util } from '../../plugins/util';
import customContextPadProvider from '../../components/process/customContextPadForReadOnlyModeler';

export default {
    name: 'symper-bpmn',
    props: {
        instanceKey: {
            default: ''
        },
        height: {
            default: 0
        },
        heatMapMode: {
            type: Boolean,
            default: false
        },
        diagramXML: {
            type: String,
            default:
                '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1ruudo1" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="6.4.2"> <bpmn:process id="Process_1vqep31" isExecutable="false"> <bpmn:startEvent id="StartEvent_00pu0uj" /> </bpmn:process> <bpmndi:BPMNDiagram id="BPMNDiagram_1"> <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1vqep31"> <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_00pu0uj"> <dc:Bounds x="156" y="81" width="36" height="36" /> </bpmndi:BPMNShape> </bpmndi:BPMNPlane> </bpmndi:BPMNDiagram></bpmn:definitions>'
        },
        customModules: {
            type: Array,
            default() {
                return [];
            }
        },
        customExtension: {
            type: Array,
            default() {
                return [];
            }
        },
        readOnly: {
            type: Boolean,
            default() {
                return false;
            }
        }
    },
    data: function () {
        return {
            moddle: null,
            bpmnModeler: null,
            modeling: null,
            canvasScale: 1,
            debounceNodeChanged: {} // debounce cho việc thay đổi trạng thái của các node, dạng {id node : setimeout func }
        };
    },
    mounted: function () {
        this.initBpmn();
    },
    beforeDestroy: function () {
        this.bpmnModeler.destroy();
    },
    watch: {
        $route(to, from) {
            this.bpmnModeler.get('keyboard').unbind();
            this.bpmnModeler.destroy();
        },
        diagramXML: function (val) {
            let self = this;
            if (this.delayLoadView) {
                clearTimeout(this.delayLoadView);
            }
            this.delayLoadView = setTimeout(() => {
                val = val.replace(/\n/g, '');
                self.bpmnModeler.importXML(val, function (err) {
                    if (err) {
                        console.error(err, 'errror on import XML');
                    } else {
                        self.$emit('after-render-diagram-from-xml', {});
                    }
                    self.$emit('after-render-diagram-from-xml', {});
                });
            }, 200);
        }
    },
    methods: {
        changeTaskNodeToUserTaskNode(id) {
            var element = this.bpmnModeler.get('elementRegistry').get(id);
            let name = element.businessObject.name;
            var newElementData = {
                type: 'bpmn:UserTask'
            };

            var replace = this.bpmnModeler.get('bpmnReplace');
            var newElement = replace.replaceElement(element, newElementData);
            this.updateElementProperties(element.businessObject.id, {
                name: name
            });
        },
        renderFromXML(xml) {
            let self = this;
            return new Promise((resolve, reject) => {
                self.bpmnModeler.importXML(xml, function (err) {
                    if (err) {
                        self.$snotifyError(
                            err,
                            self.$t('v2.general.canNotRenderDiagramFromXML')
                        );
                        reject(err);
                    } else {
                        resolve({});
                    }
                });
            });
        },

        changeElementColor(ele, data, isCurrentNode = false) {
            if (typeof ele == 'string') {
                // Nếu truyền vào id
                ele = this.bpmnModeler.get('elementRegistry').get(ele);
            }
            this.modeling.setColor(ele, data);
        },

        getAllNodes(bizObj = true) {
            let allNododes = this.bpmnModeler
                .get('elementRegistry')
                .filter(function (element) {
                    return true;
                });
            if (bizObj) {
                return allNododes.reduce((nodes, ele) => {
                    nodes.push(ele.businessObject);
                    return nodes;
                }, []);
            } else {
                return allNododes;
            }
        },
        /**
         * Lắng nghe và xử lý các sự kiện trong modeller
         */
        listenModellerEvts() {
            let self = this;
            const contextPad = this.bpmnModeler.get('contextPad');
            this.bpmnModeler.on('element.click', (evt) => {
                if (evt.element.type == 'bpmn:CallActivity') {
                }
                this.$emit('node-clicked', getBusinessObject(evt.element), evt);
            });
            if (this.readOnly) {
                this.bpmnModeler.on('element.hover', function (event) {
                    if (event.element.type != 'bpmn:Process') {
                        contextPad.open(event.element, true);
                        if (event.element.type == 'bpmn:CallActivity') {
                            $('.djs-element').removeClass('force-hover');
                            $(`[data-element-id=${event.element.id}]`).addClass(
                                'force-hover'
                            );
                            self.$emit(
                                'handle-call-activity-selected',
                                getBusinessObject(event.element),
                                event
                            );
                        } else {
                            $('.djs-element').removeClass('force-hover');
                            $('.hover').removeClass('hover');
                        }
                    } else {
                        $('.djs-element').removeClass('force-hover');
                        contextPad.close();
                    }
                });
            }

            this.bpmnModeler.on('canvas.viewbox.changing', (evt) => {
                if (self.debounceViewportChange) {
                    clearTimeout(self.debounceViewportChange);
                }

                self.debounceViewportChange = setTimeout(() => {
                    self.$emit('viewport-change');
                }, 100);
            });

            this.bpmnModeler.on('element.changed', (evt) => {
                let nodeId = evt.element.id;
                let bizObj = getBusinessObject(evt.element);
                if ($(`g[data-element-id=${nodeId}]`).length == 0) {
                    self.$emit('node-removed', bizObj);
                } else {
                    /**
                     * Do thư viện bpmn-js không cung cấp rõ ràng các sự kiện nên phải dồn hết vào một sự kiện là "node-changed"
                     * sự kiện này có thể là một trong các sự kiện: thêm node mới, thay đổi loại node, thay đổi marker của node
                     */
                    if (self.debounceNodeChanged[bizObj.id]) {
                        clearTimeout(self.debounceNodeChanged[bizObj.id]);
                    }

                    self.debounceNodeChanged[bizObj.id] = setTimeout(
                        (bizObj) => {
                            self.$emit('node-changed', bizObj);
                        },
                        50,
                        bizObj
                    );
                }
            });
        },
        undo() {
            this.bpmnModeler.get('commandStack').undo();
        },
        redo() {
            this.bpmnModeler.get('commandStack').redo();
        },
        zoomIn() {
            this.canvasScale -= 0.1;
            this.bpmnModeler.get('canvas').zoom(this.canvasScale);
        },
        zoomOut() {
            this.canvasScale += 0.1;
            this.bpmnModeler.get('canvas').zoom(this.canvasScale);
        },
        focus() {
            this.bpmnModeler.get('canvas').zoom('fit-viewport');
        },
        initBpmn() {
            this.container = this.$refs.content;
            const canvas = this.$refs.canvas;

            let moddleExtensions = {};
            for (let ext of this.customExtension) {
                moddleExtensions[ext.name] = ext.data;
            }
            let additionalModules = this.getCustomModules();
            if (this.readOnly) {
                additionalModules.map((config) => {
                    if (config.customContextPad) {
                        config.customContextPad = [
                            'type',
                            customContextPadProvider
                        ];
                    }
                });
                additionalModules.push({
                    dragging: [
                        'value',
                        {
                            init: function () {}
                        }
                    ]
                });
            }
            this.bpmnModeler = new BpmnModeler({
                instanceKey: this.instanceKey,
                container: canvas,
                keyboard: { bindTo: this.readOnly ? null : document },
                moddleExtensions: moddleExtensions,
                additionalModules: additionalModules
            });
            this.bpmnModeler.importXML(this.diagramXML, function (err) {
                if (err) {
                    console.error(err);
                }
            });
            this.moddle = this.bpmnModeler.get('moddle');
            this.modeling = this.bpmnModeler.get('modeling');
            this.listenModellerEvts();
        },
        getCustomModules() {
            return this.customModules;
        },
        saveSVG(done) {
            if (!done) {
                let self = this;
                let downloadLink = $(this.$refs.downloadLinkSVG);
                done = function (err, xml) {
                    util.setEncoded(
                        downloadLink,
                        'diagram.svg',
                        err ? null : xml
                    );
                };
            }

            this.bpmnModeler.saveSVG(done);
        },
        saveXML(done) {
            if (!done) {
                let self = this;
                let downloadLink = $(this.$refs.downloadLinkXML);
                done = function (err, xml) {
                    util.setEncoded(
                        downloadLink,
                        'diagram.bpmn',
                        err ? null : xml
                    );
                };
            }

            this.bpmnModeler.saveXML({ format: true }, function (err, xml) {
                done(err, xml);
            });
        },
        getXML(format = true) {
            let self = this;
            let result = '';
            self.bpmnModeler.saveXML({ format: format }, function (err, xml) {
                result = xml;
                if (err) {
                    self.$snotifyError(err, self.$t('v2.general.canNotGetXML'));
                }
            });
            return result;
        },
        /**
         * Update thuộc tính của một element trong bpmn
         * @param {String} eleId Id của element cần update
         * @param {Object} attrs Các thuộc tính cần update, dạng key-value
         */
        updateElementProperties(eleId, props) {
            let ele = this.bpmnModeler.get('elementRegistry').get(eleId);
            if (ele) {
                this.modeling.updateProperties(ele, props);
            }
        },
        // Lấy data theo id của diagram
        getElData(id) {
            return this.bpmnModeler.get('elementRegistry').get(id);
        }
    }
};
</script>

<style>
.read-only-background .bjs-container {
    background-color: #ffffff;
}
.djs-popup-header {
    background: #fefefe;
    padding: 0 1px;
    border-bottom: 0.5px solid #d9d9d9;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
}
.djs-popup-header .entry::before {
    color: #0092e4 !important;
}
.bjs-powered-by {
    display: none !important;
}
.symper-bpm-canvas-heat-map {
    position: relative;
    pointer-events: none;
}
.custom-button-context-pad {
    width: auto !important;
    /* line-height: 1; */
}
.custom-button-context-pad button {
    background: #c2c2c2;
    font-size: 15px;
    padding: 5px 10px;
    border-radius: 5px;
    border: solid 2px black;
}
.custom-button-context-pad button:hover {
    background-color: #9d9d9d;
}
marker[id*='sequenceflow-end-white-black'] path {
    fill: #9f9f9f !important;
    stroke: #9f9f9f !important;
}
.symper-text-inner-task {
    font-size: 12px;
}
.djs-context-pad .entry {
    box-shadow: none;
}

/*custom context pad */
.djs-context-pad .entry:hover {
    background: white;
    color: #ef7600;
}

.bpmn-icon-screw-wrench::before {
    content: '';
}
.bpmn-icon-screw-wrench {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.9)' %3E%3Cpath d='M2.07309 11.7338L2.07304 11.7339C1.9197 11.8878 1.68141 11.8899 1.52063 11.7331C1.52042 11.7329 1.52022 11.7327 1.52002 11.7325L0.265919 10.4739C0.11136 10.3187 0.11136 10.0683 0.265919 9.91314L5.23859 4.92231L5.30653 4.85411L5.27284 4.76394C4.81753 3.54535 5.07445 2.12323 6.04644 1.14769L6.04667 1.14745C7.20076 -0.0159061 8.98728 -0.160108 10.3041 0.706843L8.35 2.67835L8.24618 2.7831L8.34916 2.88868L9.10788 3.66661L9.21399 3.7754L9.32139 3.66789L11.2955 1.69173C12.1591 3.01837 12.0151 4.80701 10.8557 5.9706L10.8554 5.97088C9.86275 6.97244 8.42074 7.21432 7.19662 6.72604L7.10472 6.68938L7.03485 6.75943L2.07309 11.7338ZM1.20514 10.0904L1.09965 10.1962L1.20514 10.3021L1.69094 10.7897L1.79726 10.8964L1.90352 10.7896L6.9701 5.69916C7.28275 5.92068 7.62877 6.06809 7.99945 6.13109C8.80434 6.27613 9.66759 6.03772 10.2931 5.40989L10.2937 5.40932C10.8372 4.85807 11.0916 4.14341 11.0627 3.41352L11.0492 3.07162L10.8069 3.31323L9.21561 4.90009L7.11262 2.78943L8.6938 1.20247L8.92967 0.96574L8.59603 0.946837C7.87815 0.906164 7.14794 1.16189 6.60332 1.71412C6.00031 2.3195 5.76366 3.15087 5.87904 3.93927C5.93136 4.31167 6.06389 4.67004 6.28032 4.99664L1.20514 10.0904Z' fill='rgba(0, 0, 0, 0.87)' stroke='white' stroke-width='0.4'/%3E%3C/g%3E%3C/svg%3E ");
    background-repeat: no-repeat !important;
}
.bpmn-icon-screw-wrench:hover {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.9)' %3E%3Cpath d='M2.07309 11.7338L2.07304 11.7339C1.9197 11.8878 1.68141 11.8899 1.52063 11.7331C1.52042 11.7329 1.52022 11.7327 1.52002 11.7325L0.265919 10.4739C0.11136 10.3187 0.11136 10.0683 0.265919 9.91314L5.23859 4.92231L5.30653 4.85411L5.27284 4.76394C4.81753 3.54535 5.07445 2.12323 6.04644 1.14769L6.04667 1.14745C7.20076 -0.0159061 8.98728 -0.160108 10.3041 0.706843L8.35 2.67835L8.24618 2.7831L8.34916 2.88868L9.10788 3.66661L9.21399 3.7754L9.32139 3.66789L11.2955 1.69173C12.1591 3.01837 12.0151 4.80701 10.8557 5.9706L10.8554 5.97088C9.86275 6.97244 8.42074 7.21432 7.19662 6.72604L7.10472 6.68938L7.03485 6.75943L2.07309 11.7338ZM1.20514 10.0904L1.09965 10.1962L1.20514 10.3021L1.69094 10.7897L1.79726 10.8964L1.90352 10.7896L6.9701 5.69916C7.28275 5.92068 7.62877 6.06809 7.99945 6.13109C8.80434 6.27613 9.66759 6.03772 10.2931 5.40989L10.2937 5.40932C10.8372 4.85807 11.0916 4.14341 11.0627 3.41352L11.0492 3.07162L10.8069 3.31323L9.21561 4.90009L7.11262 2.78943L8.6938 1.20247L8.92967 0.96574L8.59603 0.946837C7.87815 0.906164 7.14794 1.16189 6.60332 1.71412C6.00031 2.3195 5.76366 3.15087 5.87904 3.93927C5.93136 4.31167 6.06389 4.67004 6.28032 4.99664L1.20514 10.0904Z' fill='%23ef7600' stroke='white' stroke-width='0.4'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

.bpmn-icon-trash::before {
    content: '';
}
.bpmn-icon-trash {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cpath d='M6.89167 2.16667V2.31667H7.04167H9.20833C9.31221 2.31667 9.41183 2.35793 9.48528 2.43138C9.55874 2.50483 9.6 2.60446 9.6 2.70833C9.6 2.81221 9.55874 2.91183 9.48528 2.98528C9.41183 3.05873 9.31221 3.1 9.20833 3.1H8.66667H8.51667V3.25V9.20833C8.51667 9.59953 8.36127 9.9747 8.08465 10.2513C7.80803 10.5279 7.43286 10.6833 7.04167 10.6833H2.70833C2.31714 10.6833 1.94197 10.5279 1.66535 10.2513C1.38873 9.9747 1.23333 9.59953 1.23333 9.20833V3.25V3.1H1.08333H0.541667C0.43779 3.1 0.338168 3.05873 0.264716 2.98528C0.191265 2.91183 0.15 2.81221 0.15 2.70833C0.15 2.60446 0.191265 2.50483 0.264716 2.43138C0.338168 2.35793 0.43779 2.31667 0.541667 2.31667H2.70833H2.85833V2.16667V1.625C2.85833 1.23381 3.01373 0.858634 3.29035 0.582018C3.56697 0.305401 3.94214 0.15 4.33333 0.15H5.41667C5.80786 0.15 6.18303 0.305401 6.45965 0.582018C6.73627 0.858634 6.89167 1.23381 6.89167 1.625V2.16667ZM5.95833 2.31667H6.10833V2.16667V1.625C6.10833 1.44156 6.03546 1.26563 5.90575 1.13592C5.77604 1.00621 5.60011 0.933333 5.41667 0.933333H4.33333C4.14989 0.933333 3.97396 1.00621 3.84425 1.13592C3.71454 1.26563 3.64167 1.44156 3.64167 1.625V2.16667V2.31667H3.79167H5.95833ZM2.16667 3.1H2.01667V3.25V9.20833C2.01667 9.39177 2.08954 9.5677 2.21925 9.69742C2.34896 9.82713 2.52489 9.9 2.70833 9.9H7.04167C7.22511 9.9 7.40104 9.82713 7.53075 9.69742C7.66046 9.5677 7.73333 9.39177 7.73333 9.20833V3.25V3.1H7.58333H2.16667Z' fill='rgba(0, 0, 0, 0.87)' stroke='white' stroke-width='0.3'/%3E%3C/g%3E%3C/svg%3E ");
}
.bpmn-icon-trash:hover {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 10 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cpath d='M6.89167 2.16667V2.31667H7.04167H9.20833C9.31221 2.31667 9.41183 2.35793 9.48528 2.43138C9.55874 2.50483 9.6 2.60446 9.6 2.70833C9.6 2.81221 9.55874 2.91183 9.48528 2.98528C9.41183 3.05873 9.31221 3.1 9.20833 3.1H8.66667H8.51667V3.25V9.20833C8.51667 9.59953 8.36127 9.9747 8.08465 10.2513C7.80803 10.5279 7.43286 10.6833 7.04167 10.6833H2.70833C2.31714 10.6833 1.94197 10.5279 1.66535 10.2513C1.38873 9.9747 1.23333 9.59953 1.23333 9.20833V3.25V3.1H1.08333H0.541667C0.43779 3.1 0.338168 3.05873 0.264716 2.98528C0.191265 2.91183 0.15 2.81221 0.15 2.70833C0.15 2.60446 0.191265 2.50483 0.264716 2.43138C0.338168 2.35793 0.43779 2.31667 0.541667 2.31667H2.70833H2.85833V2.16667V1.625C2.85833 1.23381 3.01373 0.858634 3.29035 0.582018C3.56697 0.305401 3.94214 0.15 4.33333 0.15H5.41667C5.80786 0.15 6.18303 0.305401 6.45965 0.582018C6.73627 0.858634 6.89167 1.23381 6.89167 1.625V2.16667ZM5.95833 2.31667H6.10833V2.16667V1.625C6.10833 1.44156 6.03546 1.26563 5.90575 1.13592C5.77604 1.00621 5.60011 0.933333 5.41667 0.933333H4.33333C4.14989 0.933333 3.97396 1.00621 3.84425 1.13592C3.71454 1.26563 3.64167 1.44156 3.64167 1.625V2.16667V2.31667H3.79167H5.95833ZM2.16667 3.1H2.01667V3.25V9.20833C2.01667 9.39177 2.08954 9.5677 2.21925 9.69742C2.34896 9.82713 2.52489 9.9 2.70833 9.9H7.04167C7.22511 9.9 7.40104 9.82713 7.53075 9.69742C7.66046 9.5677 7.73333 9.39177 7.73333 9.20833V3.25V3.1H7.58333H2.16667Z' fill='%23ef7600' stroke='white' stroke-width='0.3'/%3E%3C/g%3E%3C/svg%3E ") !important;
}

.bpmn-icon-manual::before {
    content: '' !important;
}
.bpmn-icon-manual {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5, 3)'%3E%3Cpath d='M10.8999 3.03333V3.16935L11.0298 3.12878C11.1194 3.10078 11.2171 3.1 11.3333 3.1C12.198 3.1 12.8999 3.8019 12.8999 4.66667V10.6667C12.8999 13.5581 10.558 15.9 7.66661 15.9C5.42102 15.9 3.41103 14.5317 2.57948 12.4496L0.873087 8.16362C0.873048 8.16352 0.873009 8.16341 0.872969 8.16331C0.715757 7.7606 0.731544 7.30288 0.963147 6.95547L0.963319 6.95521C1.26602 6.49808 1.80164 6.30116 2.30676 6.42977L2.82499 6.58258L2.82498 6.58263L2.82803 6.58343C3.11901 6.65934 3.38455 6.80482 3.59923 7.00056L3.76661 7.15317V6.92667V3C3.76661 2.13523 4.4685 1.43333 5.33327 1.43333C5.46325 1.43333 5.56559 1.43431 5.65999 1.46763L5.77092 1.50678L5.7917 1.391C5.92335 0.657526 6.56282 0.1 7.33327 0.1C7.99701 0.1 8.56142 0.513156 8.79369 1.09697L8.82712 1.181L8.91408 1.15615C9.04431 1.11894 9.18832 1.1 9.33327 1.1C10.198 1.1 10.8999 1.8019 10.8999 2.66667V3.03333ZM3.63361 12.0368L3.63371 12.037C4.28888 13.6818 5.88572 14.7667 7.66661 14.7667C9.9285 14.7667 11.7666 12.9286 11.7666 10.6667V4.66667C11.7666 4.42477 11.5752 4.23333 11.3333 4.23333C11.0914 4.23333 10.8999 4.42477 10.8999 4.66667V7.9H9.76661V2.66667C9.76661 2.42477 9.57517 2.23333 9.33327 2.23333C9.09138 2.23333 8.89994 2.42477 8.89994 2.66667V7.9H7.76661V1.66667C7.76661 1.42477 7.57517 1.23333 7.33327 1.23333C7.09138 1.23333 6.89994 1.42477 6.89994 1.66667V7.9H5.76661V3C5.76661 2.75811 5.57517 2.56667 5.33327 2.56667C5.09138 2.56667 4.89994 2.75811 4.89994 3V9.9H3.73431L3.09386 8.29886C2.98282 7.96876 2.72403 7.71825 2.35848 7.62988L2.0269 7.53704L1.83284 7.4827L1.90695 7.6701L3.63361 12.0368Z' fill='%236D6D6D' stroke='white' stroke-width='0.2'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
    /* content: ''; */
}

.bpmn-icon-business-rule::before {
    content: '' !important;
}
.bpmn-icon-business-rule {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(3.5, 2) scale(0.6)'%3E%3Cpath d='M10.2334 2.99998V3.09998H10.3334H13C13.1503 3.09998 13.2945 3.15968 13.4007 3.26595C13.507 3.37222 13.5667 3.51636 13.5667 3.66665L13.5667 6.33278C13.5667 6.33283 13.5667 6.33289 13.5667 6.33295C13.5653 6.5985 13.5082 6.86079 13.3991 7.10292C13.29 7.34509 13.1314 7.56171 12.9334 7.73878L12.9 7.76859V7.81331V11.6666C12.9 12.1706 12.6999 12.6538 12.3435 13.0101C11.9872 13.3665 11.504 13.5666 11 13.5666H3.00004C2.49613 13.5666 2.01286 13.3665 1.65654 13.0101C1.30022 12.6538 1.10004 12.1706 1.10004 11.6666V7.81331V7.76859L1.06671 7.73878C0.868728 7.56171 0.710075 7.34509 0.600986 7.10292C0.491934 6.86082 0.434837 6.59856 0.433374 6.33304V3.66665C0.433374 3.51636 0.493076 3.37222 0.599347 3.26595C0.705617 3.15968 0.849751 3.09998 1.00004 3.09998H3.66671H3.76671V2.99998V2.33331C3.76671 1.8294 3.96689 1.34613 4.3232 0.98981C4.67952 0.633491 5.1628 0.433313 5.66671 0.433313H8.33337C8.83729 0.433313 9.32056 0.633491 9.67688 0.98981C10.0332 1.34613 10.2334 1.8294 10.2334 2.33331V2.99998ZM9.00004 3.09998H9.10004V2.99998V2.33331C9.10004 2.12998 9.01927 1.93498 8.87549 1.7912C8.73171 1.64742 8.53671 1.56665 8.33337 1.56665H5.66671C5.46337 1.56665 5.26837 1.64742 5.12459 1.7912C4.98081 1.93498 4.90004 2.12998 4.90004 2.33331V2.99998V3.09998H5.00004H9.00004ZM2.33337 8.23331H2.23337V8.33331V11.6666C2.23337 11.87 2.31415 12.065 2.45793 12.2088C2.6017 12.3525 2.79671 12.4333 3.00004 12.4333H11C11.2034 12.4333 11.3984 12.3525 11.5422 12.2088C11.6859 12.065 11.7667 11.87 11.7667 11.6666V8.33331V8.23331H11.6667H10.3334H10.2334V8.33331V8.99998C10.2334 9.15027 10.1737 9.2944 10.0674 9.40067C9.96113 9.50694 9.817 9.56665 9.66671 9.56665C9.51642 9.56665 9.37228 9.50694 9.26601 9.40067C9.15974 9.2944 9.10004 9.15027 9.10004 8.99998V8.33331V8.23331H9.00004H5.00004H4.90004V8.33331V8.99998C4.90004 9.15027 4.84034 9.2944 4.73407 9.40067C4.6278 9.50694 4.48366 9.56665 4.33337 9.56665C4.18308 9.56665 4.03895 9.50694 3.93268 9.40067C3.82641 9.2944 3.76671 9.15027 3.76671 8.99998V8.33331V8.23331H3.66671H2.33337ZM10.2334 6.99998V7.09998H10.3334H11.6667C11.87 7.09998 12.065 7.01921 12.2088 6.87543C12.3526 6.73165 12.4334 6.53664 12.4334 6.33331V4.33331V4.23331H12.3334H1.66671H1.56671V4.33331V6.33331C1.56671 6.53665 1.64748 6.73165 1.79126 6.87543C1.93504 7.01921 2.13004 7.09998 2.33337 7.09998H3.66671H3.76671V6.99998V6.33331C3.76671 6.18302 3.82641 6.03889 3.93268 5.93262C4.03895 5.82635 4.18308 5.76665 4.33337 5.76665C4.48366 5.76665 4.6278 5.82635 4.73407 5.93262C4.84034 6.03889 4.90004 6.18302 4.90004 6.33331V6.99998V7.09998H5.00004H9.00004H9.10004V6.99998V6.33331C9.10004 6.18302 9.15974 6.03889 9.26601 5.93262C9.37228 5.82635 9.51642 5.76665 9.66671 5.76665C9.817 5.76665 9.96113 5.82635 10.0674 5.93262C10.1737 6.03889 10.2334 6.18302 10.2334 6.33331V6.99998Z' fill='%236D6D6D' stroke='white' stroke-width='0.2'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
    z-index: 500;
}

.bpmn-icon-user::before {
    content: '' !important;
}
.bpmn-icon-user {
    background-image: url("data:image/svg+xml,%3Csvg  viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(3.5, 2.0) scale(0.5)'%3E%3Cpath d='M4.54526 7.51973L4.62561 7.48754L4.55758 7.43402C3.91216 6.92622 3.44105 6.22988 3.20982 5.44186C2.97858 4.65385 2.9987 3.81336 3.26739 3.03732C3.53607 2.26128 4.03996 1.58828 4.70895 1.11195C5.37794 0.635621 6.17876 0.379651 7 0.379651C7.82124 0.379651 8.62206 0.635621 9.29104 1.11195C9.96003 1.58828 10.4639 2.26128 10.7326 3.03732C11.0013 3.81336 11.0214 4.65385 10.7902 5.44186C10.5589 6.22988 10.0878 6.92622 9.44242 7.43402L9.47333 7.47332L9.45489 7.51979C10.5711 7.96276 11.5456 8.70114 12.2741 9.65578C13.0026 10.6104 13.4576 11.7452 13.5903 12.9386C13.6076 13.1004 13.5603 13.2625 13.4587 13.3896C13.3576 13.5159 13.211 13.5974 13.0504 13.6166L12.98 13.6166L12.9797 13.6166C12.8272 13.6176 12.6799 13.562 12.566 13.4606C12.4521 13.3593 12.3798 13.2193 12.363 13.0678L12.363 13.0677C12.2153 11.7523 11.588 10.5374 10.6012 9.65523C9.61432 8.77303 8.33703 8.28533 7.01333 8.28533C5.68964 8.28533 4.41234 8.77303 3.42549 9.65523C2.43863 10.5374 1.81141 11.7523 1.66364 13.0677L1.66363 13.0678C1.64563 13.2315 1.56337 13.3813 1.43494 13.4842C1.30651 13.5872 1.14243 13.6349 0.978798 13.6169C0.815168 13.5989 0.665391 13.5167 0.562415 13.3883C0.511426 13.3247 0.473462 13.2516 0.450691 13.1734C0.427923 13.0951 0.420788 13.0132 0.429693 12.9322C0.561737 11.742 1.01427 10.61 1.73906 9.65686C2.46385 8.70368 3.43371 7.96506 4.54526 7.51973ZM5.4907 6.59214C5.93745 6.89065 6.46269 7.04998 7 7.04998C7.7205 7.04998 8.4115 6.76376 8.92097 6.25429C9.43045 5.74481 9.71667 5.05382 9.71667 4.33331C9.71667 3.79601 9.55733 3.27077 9.25882 2.82402C8.96031 2.37726 8.53603 2.02906 8.03962 1.82344C7.54322 1.61782 6.99698 1.56403 6.47 1.66885C5.94302 1.77367 5.45896 2.03241 5.07902 2.41234C4.69909 2.79227 4.44035 3.27634 4.33553 3.80332C4.23071 4.3303 4.28451 4.87653 4.49012 5.37294C4.69574 5.86934 5.04395 6.29363 5.4907 6.59214Z' fill='%236D6D6D' stroke='white' stroke-width='0.1'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

.bpmn-icon-service::before {
    content: '' !important;
}
.bpmn-icon-service {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 -1 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(3, 1) scale(0.5)'%3E%3Cmask id='path-1-inside-1_365_61' fill='white'%3E%3Cpath d='M12.2666 7.43997C12.1598 7.31831 12.1008 7.16191 12.1008 6.99997C12.1008 6.83803 12.1598 6.68163 12.2666 6.55997L13.12 5.59997C13.214 5.49508 13.2724 5.36311 13.2868 5.22298C13.3011 5.08284 13.2708 4.94176 13.2 4.81997L11.8666 2.5133C11.7966 2.39165 11.6899 2.29522 11.5618 2.23776C11.4337 2.1803 11.2908 2.16474 11.1533 2.1933L9.89997 2.44664C9.74049 2.47959 9.57447 2.45303 9.43323 2.37197C9.29199 2.29091 9.1853 2.16096 9.1333 2.00664L8.72664 0.786637C8.68191 0.654223 8.59671 0.539214 8.48306 0.457865C8.36941 0.376517 8.23307 0.332943 8.0933 0.333304H5.42664C5.28126 0.325716 5.13739 0.365922 5.01701 0.44778C4.89663 0.529639 4.80636 0.64865 4.75997 0.786637L4.38664 2.00664C4.33464 2.16096 4.22795 2.29091 4.08671 2.37197C3.94547 2.45303 3.77945 2.47959 3.61997 2.44664L2.3333 2.1933C2.20301 2.17489 2.07017 2.19545 1.95154 2.2524C1.8329 2.30934 1.73377 2.40012 1.66664 2.5133L0.333305 4.81997C0.260745 4.9404 0.22812 5.08069 0.240093 5.22079C0.252067 5.36088 0.308026 5.4936 0.399971 5.59997L1.24664 6.55997C1.35352 6.68163 1.41246 6.83803 1.41246 6.99997C1.41246 7.16191 1.35352 7.31831 1.24664 7.43997L0.399971 8.39997C0.308026 8.50634 0.252067 8.63906 0.240093 8.77916C0.22812 8.91925 0.260745 9.05954 0.333305 9.17997L1.66664 11.4866C1.7367 11.6083 1.84338 11.7047 1.97147 11.7622C2.09956 11.8196 2.24252 11.8352 2.37997 11.8066L3.6333 11.5533C3.79278 11.5204 3.95881 11.5469 4.10005 11.628C4.24129 11.709 4.34797 11.839 4.39997 11.9933L4.80664 13.2133C4.85302 13.3513 4.9433 13.4703 5.06368 13.5522C5.18406 13.634 5.32793 13.6742 5.4733 13.6666H8.13997C8.27973 13.667 8.41607 13.6234 8.52972 13.5421C8.64337 13.4607 8.72858 13.3457 8.7733 13.2133L9.17997 11.9933C9.23197 11.839 9.33866 11.709 9.4799 11.628C9.62113 11.5469 9.78716 11.5204 9.94664 11.5533L11.2 11.8066C11.3374 11.8352 11.4804 11.8196 11.6085 11.7622C11.7366 11.7047 11.8432 11.6083 11.9133 11.4866L13.2466 9.17997C13.3174 9.05818 13.3478 8.9171 13.3334 8.77697C13.3191 8.63684 13.2607 8.50486 13.1666 8.39997L12.2666 7.43997ZM11.2733 8.3333L11.8066 8.9333L10.9533 10.4133L10.1666 10.2533C9.68649 10.1552 9.18702 10.2367 8.76303 10.4825C8.33905 10.7283 8.02007 11.1212 7.86664 11.5866L7.6133 12.3333H5.90664L5.66664 11.5733C5.51321 11.1079 5.19423 10.715 4.77024 10.4692C4.34626 10.2234 3.84679 10.1418 3.36664 10.24L2.57997 10.4L1.7133 8.92664L2.24664 8.32664C2.57461 7.95996 2.75593 7.48526 2.75593 6.9933C2.75593 6.50135 2.57461 6.02665 2.24664 5.65997L1.7133 5.05997L2.56664 3.5933L3.3533 3.7533C3.83345 3.85145 4.33292 3.76989 4.75691 3.5241C5.18089 3.27832 5.49987 2.88541 5.6533 2.41997L5.90664 1.66664H7.6133L7.86664 2.42664C8.02007 2.89208 8.33905 3.28498 8.76303 3.53077C9.18702 3.77656 9.68649 3.85812 10.1666 3.75997L10.9533 3.59997L11.8066 5.07997L11.2733 5.67997C10.949 6.04581 10.77 6.51776 10.77 7.00664C10.77 7.49552 10.949 7.96746 11.2733 8.3333ZM6.75997 4.3333C6.23255 4.3333 5.71698 4.4897 5.27845 4.78272C4.83992 5.07574 4.49813 5.49221 4.29629 5.97948C4.09446 6.46675 4.04165 7.00293 4.14454 7.52021C4.24744 8.03749 4.50141 8.51265 4.87435 8.88559C5.24729 9.25853 5.72245 9.5125 6.23973 9.6154C6.75701 9.71829 7.29319 9.66548 7.78046 9.46365C8.26773 9.26182 8.68421 8.92002 8.97722 8.48149C9.27024 8.04296 9.42664 7.52739 9.42664 6.99997C9.42664 6.29273 9.14569 5.61445 8.64559 5.11435C8.14549 4.61426 7.46722 4.3333 6.75997 4.3333ZM6.75997 8.3333C6.49626 8.3333 6.23848 8.25511 6.01921 8.1086C5.79994 7.96209 5.62905 7.75385 5.52813 7.51022C5.42722 7.26658 5.40081 6.99849 5.45226 6.73985C5.5037 6.48121 5.63069 6.24363 5.81716 6.05716C6.00363 5.87069 6.24121 5.7437 6.49985 5.69226C6.75849 5.64081 7.02658 5.66721 7.27022 5.76813C7.51385 5.86905 7.72209 6.03995 7.8686 6.25921C8.01511 6.47848 8.0933 6.73626 8.0933 6.99997C8.0933 7.35359 7.95283 7.69273 7.70278 7.94278C7.45273 8.19283 7.11359 8.3333 6.75997 8.3333Z'/%3E%3C/mask%3E%3Cpath d='M12.2666 7.43997C12.1598 7.31831 12.1008 7.16191 12.1008 6.99997C12.1008 6.83803 12.1598 6.68163 12.2666 6.55997L13.12 5.59997C13.214 5.49508 13.2724 5.36311 13.2868 5.22298C13.3011 5.08284 13.2708 4.94176 13.2 4.81997L11.8666 2.5133C11.7966 2.39165 11.6899 2.29522 11.5618 2.23776C11.4337 2.1803 11.2908 2.16474 11.1533 2.1933L9.89997 2.44664C9.74049 2.47959 9.57447 2.45303 9.43323 2.37197C9.29199 2.29091 9.1853 2.16096 9.1333 2.00664L8.72664 0.786637C8.68191 0.654223 8.59671 0.539214 8.48306 0.457865C8.36941 0.376517 8.23307 0.332943 8.0933 0.333304H5.42664C5.28126 0.325716 5.13739 0.365922 5.01701 0.44778C4.89663 0.529639 4.80636 0.64865 4.75997 0.786637L4.38664 2.00664C4.33464 2.16096 4.22795 2.29091 4.08671 2.37197C3.94547 2.45303 3.77945 2.47959 3.61997 2.44664L2.3333 2.1933C2.20301 2.17489 2.07017 2.19545 1.95154 2.2524C1.8329 2.30934 1.73377 2.40012 1.66664 2.5133L0.333305 4.81997C0.260745 4.9404 0.22812 5.08069 0.240093 5.22079C0.252067 5.36088 0.308026 5.4936 0.399971 5.59997L1.24664 6.55997C1.35352 6.68163 1.41246 6.83803 1.41246 6.99997C1.41246 7.16191 1.35352 7.31831 1.24664 7.43997L0.399971 8.39997C0.308026 8.50634 0.252067 8.63906 0.240093 8.77916C0.22812 8.91925 0.260745 9.05954 0.333305 9.17997L1.66664 11.4866C1.7367 11.6083 1.84338 11.7047 1.97147 11.7622C2.09956 11.8196 2.24252 11.8352 2.37997 11.8066L3.6333 11.5533C3.79278 11.5204 3.95881 11.5469 4.10005 11.628C4.24129 11.709 4.34797 11.839 4.39997 11.9933L4.80664 13.2133C4.85302 13.3513 4.9433 13.4703 5.06368 13.5522C5.18406 13.634 5.32793 13.6742 5.4733 13.6666H8.13997C8.27973 13.667 8.41607 13.6234 8.52972 13.5421C8.64337 13.4607 8.72858 13.3457 8.7733 13.2133L9.17997 11.9933C9.23197 11.839 9.33866 11.709 9.4799 11.628C9.62113 11.5469 9.78716 11.5204 9.94664 11.5533L11.2 11.8066C11.3374 11.8352 11.4804 11.8196 11.6085 11.7622C11.7366 11.7047 11.8432 11.6083 11.9133 11.4866L13.2466 9.17997C13.3174 9.05818 13.3478 8.9171 13.3334 8.77697C13.3191 8.63684 13.2607 8.50486 13.1666 8.39997L12.2666 7.43997ZM11.2733 8.3333L11.8066 8.9333L10.9533 10.4133L10.1666 10.2533C9.68649 10.1552 9.18702 10.2367 8.76303 10.4825C8.33905 10.7283 8.02007 11.1212 7.86664 11.5866L7.6133 12.3333H5.90664L5.66664 11.5733C5.51321 11.1079 5.19423 10.715 4.77024 10.4692C4.34626 10.2234 3.84679 10.1418 3.36664 10.24L2.57997 10.4L1.7133 8.92664L2.24664 8.32664C2.57461 7.95996 2.75593 7.48526 2.75593 6.9933C2.75593 6.50135 2.57461 6.02665 2.24664 5.65997L1.7133 5.05997L2.56664 3.5933L3.3533 3.7533C3.83345 3.85145 4.33292 3.76989 4.75691 3.5241C5.18089 3.27832 5.49987 2.88541 5.6533 2.41997L5.90664 1.66664H7.6133L7.86664 2.42664C8.02007 2.89208 8.33905 3.28498 8.76303 3.53077C9.18702 3.77656 9.68649 3.85812 10.1666 3.75997L10.9533 3.59997L11.8066 5.07997L11.2733 5.67997C10.949 6.04581 10.77 6.51776 10.77 7.00664C10.77 7.49552 10.949 7.96746 11.2733 8.3333ZM6.75997 4.3333C6.23255 4.3333 5.71698 4.4897 5.27845 4.78272C4.83992 5.07574 4.49813 5.49221 4.29629 5.97948C4.09446 6.46675 4.04165 7.00293 4.14454 7.52021C4.24744 8.03749 4.50141 8.51265 4.87435 8.88559C5.24729 9.25853 5.72245 9.5125 6.23973 9.6154C6.75701 9.71829 7.29319 9.66548 7.78046 9.46365C8.26773 9.26182 8.68421 8.92002 8.97722 8.48149C9.27024 8.04296 9.42664 7.52739 9.42664 6.99997C9.42664 6.29273 9.14569 5.61445 8.64559 5.11435C8.14549 4.61426 7.46722 4.3333 6.75997 4.3333ZM6.75997 8.3333C6.49626 8.3333 6.23848 8.25511 6.01921 8.1086C5.79994 7.96209 5.62905 7.75385 5.52813 7.51022C5.42722 7.26658 5.40081 6.99849 5.45226 6.73985C5.5037 6.48121 5.63069 6.24363 5.81716 6.05716C6.00363 5.87069 6.24121 5.7437 6.49985 5.69226C6.75849 5.64081 7.02658 5.66721 7.27022 5.76813C7.51385 5.86905 7.72209 6.03995 7.8686 6.25921C8.01511 6.47848 8.0933 6.73626 8.0933 6.99997C8.0933 7.35359 7.95283 7.69273 7.70278 7.94278C7.45273 8.19283 7.11359 8.3333 6.75997 8.3333Z' fill='%236D6D6D' stroke='white' stroke-width='0.4' mask='url(%23path-1-inside-1_365_61)'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

.bpmn-icon-script::before {
    content: '' !important;
}
.bpmn-icon-script {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(3, 2) scale(0.5)'%3E%3Cpath d='M9.76671 1.66665V1.56665H9.66671H4.33337C4.13004 1.56665 3.93504 1.64742 3.79126 1.7912C3.64748 1.93498 3.56671 2.12998 3.56671 2.33331V9.56665H2.43337V2.33331C2.43337 1.8294 2.63355 1.34613 2.98987 0.98981C3.34619 0.633491 3.82946 0.433313 4.33337 0.433313H11.6667C12.1706 0.433313 12.6539 0.633491 13.0102 0.98981C13.3665 1.34613 13.5667 1.8294 13.5667 2.33331V2.89998H12.4334V2.33331C12.4334 2.12998 12.3526 1.93498 12.2088 1.7912C12.065 1.64742 11.87 1.56665 11.6667 1.56665C11.4634 1.56665 11.2684 1.64742 11.1246 1.7912C10.9808 1.93498 10.9 2.12998 10.9 2.33331V4.99998V11.6666C10.9 12.1706 10.6999 12.6538 10.3435 13.0101C9.98722 13.3665 9.50395 13.5666 9.00004 13.5666H2.33337C1.82946 13.5666 1.34619 13.3665 0.989871 13.0101C0.633552 12.6538 0.433374 12.1706 0.433374 11.6666V11.1H7.5702C7.59421 11.4436 7.74139 11.7684 7.98652 12.0135C8.25532 12.2823 8.6199 12.4333 9.00004 12.4333C9.20337 12.4333 9.39838 12.3525 9.54216 12.2088C9.68593 12.065 9.76671 11.87 9.76671 11.6666V1.66665ZM5.10004 3.09998H8.23337V4.23331H5.10004V3.09998ZM5.10004 5.76665H8.23337V6.89998H5.10004V5.76665ZM5.10004 8.43331H8.23337V9.56665H5.10004V8.43331Z' fill='%236D6D6D' stroke='white' stroke-width='0.2'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

/* các khối end-event trong popUp*/
.bpmn-icon-end-event-error::before {
    content: '' !important;
}
.bpmn-icon-end-event-error {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5, 6)'%3E%3Ccircle cx='8' cy='8' r='7' fill='white' stroke='%236D6D6D' stroke-width='2'/%3E%3Cpath d='M12.855 5.645C12.8085 5.59814 12.7532 5.56094 12.6923 5.53555C12.6313 5.51017 12.566 5.4971 12.5 5.4971C12.434 5.4971 12.3686 5.51017 12.3077 5.53555C12.2468 5.56094 12.1915 5.59814 12.145 5.645L8.99997 8.795L6.85497 6.645C6.80849 6.59814 6.75319 6.56094 6.69226 6.53555C6.63133 6.51017 6.56598 6.4971 6.49997 6.4971C6.43396 6.4971 6.36861 6.51017 6.30768 6.53555C6.24675 6.56094 6.19145 6.59814 6.14497 6.645L3.14497 9.645C3.09811 9.69148 3.06091 9.74678 3.03552 9.80771C3.01014 9.86864 2.99707 9.93399 2.99707 10C2.99707 10.066 3.01014 10.1314 3.03552 10.1923C3.06091 10.2532 3.09811 10.3085 3.14497 10.355C3.19145 10.4019 3.24675 10.4391 3.30768 10.4644C3.36861 10.4898 3.43396 10.5029 3.49997 10.5029C3.56598 10.5029 3.63133 10.4898 3.69226 10.4644C3.75319 10.4391 3.80849 10.4019 3.85497 10.355L6.49997 7.705L8.64497 9.855C8.69145 9.90186 8.74675 9.93906 8.80768 9.96445C8.86861 9.98983 8.93396 10.0029 8.99997 10.0029C9.06598 10.0029 9.13133 9.98983 9.19226 9.96445C9.25319 9.93906 9.30849 9.90186 9.35497 9.855L12.855 6.355C12.9018 6.30852 12.939 6.25322 12.9644 6.19229C12.9898 6.13136 13.0029 6.06601 13.0029 6C13.0029 5.93399 12.9898 5.86864 12.9644 5.80771C12.939 5.74678 12.9018 5.69148 12.855 5.645Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.bpmn-icon-end-event-escalation::before {
    content: '' !important;
}
.bpmn-icon-end-event-escalation {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(2.4, 2.5) scale(0.45)'%3E%3Ccircle cx='8' cy='8' r='7' fill='white' stroke='%236D6D6D' stroke-width='2'/%3E%3Cpath d='M11.8742 9.26432L9.07262 3.66111C8.97263 3.46235 8.81939 3.29529 8.62999 3.17855C8.44059 3.06182 8.22248 3 8 3C7.77752 3 7.55941 3.06182 7.37001 3.17855C7.18061 3.29529 7.02737 3.46235 6.92739 3.66111L4.12578 9.26432C4.01572 9.48545 3.97654 9.73514 4.01358 9.97935C4.05061 10.2236 4.16207 10.4504 4.33274 10.629C4.50342 10.8075 4.72501 10.9291 4.96731 10.9771C5.2096 11.0251 5.46081 10.9972 5.68667 10.8973L7.83591 9.9367C7.88787 9.91491 7.94365 9.90368 8 9.90368C8.05635 9.90368 8.11213 9.91491 8.16409 9.9367L10.3133 10.8973C10.5392 10.9972 10.7904 11.0251 11.0327 10.9771C11.275 10.9291 11.4966 10.8075 11.6673 10.629C11.8379 10.4504 11.9494 10.2236 11.9864 9.97935C12.0235 9.73514 11.9843 9.48545 11.8742 9.26432ZM11.0738 10.0648C11.0166 10.1243 10.9425 10.1646 10.8616 10.1804C10.7806 10.1962 10.6968 10.1865 10.6215 10.1528L8.47227 9.19628C8.31858 9.12786 8.15222 9.09251 7.98399 9.09251C7.81576 9.09251 7.6494 9.12786 7.49571 9.19628L5.36249 10.1648C5.28763 10.1974 5.20462 10.2062 5.12458 10.1902C5.04454 10.1742 4.97131 10.1342 4.91469 10.0754C4.85808 10.0166 4.82079 9.94189 4.80783 9.8613C4.79487 9.78072 4.80686 9.6981 4.84219 9.62452L7.6438 4.02131C7.67738 3.95575 7.72841 3.90074 7.79126 3.86232C7.85411 3.8239 7.92634 3.80357 8 3.80357C8.07366 3.80357 8.14589 3.8239 8.20874 3.86232C8.27159 3.90074 8.32262 3.95575 8.3562 4.02131L11.1578 9.62452C11.194 9.69783 11.2069 9.78047 11.1948 9.86133C11.1826 9.94218 11.146 10.0174 11.0898 10.0768L11.0738 10.0648Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.bpmn-icon-end-event-compensation::before {
    content: '' !important;
}
.bpmn-icon-end-event-compensation {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='translate(2.4, 2.5) scale(0.45)'%3E%3Ccircle cx='8' cy='8' r='7' fill='white' stroke='%236D6D6D' stroke-width='2'/%3E%3Cpath d='M7.63996 5.52667C7.57798 5.46418 7.50425 5.41458 7.42301 5.38074C7.34177 5.34689 7.25463 5.32947 7.16663 5.32947C7.07862 5.32947 6.99148 5.34689 6.91024 5.38074C6.829 5.41458 6.75527 5.46418 6.69329 5.52667L4.69329 7.52667C4.63081 7.58864 4.58121 7.66238 4.54737 7.74362C4.51352 7.82486 4.49609 7.91199 4.49609 8C4.49609 8.08801 4.51352 8.17515 4.54737 8.25638C4.58121 8.33762 4.63081 8.41136 4.69329 8.47333L6.69329 10.4733C6.75527 10.5358 6.829 10.5854 6.91024 10.6193C6.99148 10.6531 7.07862 10.6705 7.16663 10.6705C7.25463 10.6705 7.34177 10.6531 7.42301 10.6193C7.50425 10.5854 7.57798 10.5358 7.63996 10.4733C7.70245 10.4114 7.75204 10.3376 7.78589 10.2564C7.81973 10.1751 7.83716 10.088 7.83716 10C7.83716 9.91199 7.81973 9.82486 7.78589 9.74362C7.75204 9.66238 7.70245 9.58864 7.63996 9.52667L6.10663 8L7.63996 6.47333C7.70245 6.41136 7.75204 6.33762 7.78589 6.25638C7.81973 6.17515 7.83716 6.08801 7.83716 6C7.83716 5.91199 7.81973 5.82485 7.78589 5.74362C7.75204 5.66238 7.70245 5.58864 7.63996 5.52667V5.52667ZM9.77329 8L11.3333 6.47333C11.4588 6.3478 11.5294 6.17753 11.5294 6C11.5294 5.82247 11.4588 5.6522 11.3333 5.52667C11.2078 5.40113 11.0375 5.33061 10.86 5.33061C10.6824 5.33061 10.5122 5.40113 10.3866 5.52667L8.38663 7.52667C8.32414 7.58864 8.27454 7.66238 8.2407 7.74362C8.20685 7.82486 8.18943 7.91199 8.18943 8C8.18943 8.08801 8.20685 8.17515 8.2407 8.25638C8.27454 8.33762 8.32414 8.41136 8.38663 8.47333L10.3866 10.4733C10.4486 10.5358 10.5223 10.5854 10.6036 10.6193C10.6848 10.6531 10.772 10.6705 10.86 10.6705C10.948 10.6705 11.0351 10.6531 11.1163 10.6193C11.1976 10.5854 11.2713 10.5358 11.3333 10.4733C11.3958 10.4114 11.4454 10.3376 11.4792 10.2564C11.5131 10.1751 11.5305 10.088 11.5305 10C11.5305 9.91199 11.5131 9.82486 11.4792 9.74362C11.4454 9.66238 11.3958 9.58864 11.3333 9.52667L9.77329 8Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

.bpmn-icon-end-event-signal::before {
    content: '' !important;
}
.bpmn-icon-end-event-signal {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Ccircle cx='8' cy='8' r='7' fill='white' stroke='%236D6D6D' stroke-width='2'/%3E%3Cpath d='M12.1126 10.0375L8.36261 3.54582C8.32627 3.4817 8.27357 3.42836 8.20989 3.39125C8.1462 3.35415 8.07382 3.33459 8.00011 3.33459C7.9264 3.33459 7.85402 3.35415 7.79033 3.39125C7.72665 3.42836 7.67395 3.4817 7.63761 3.54582L3.88761 10.0375C3.85104 10.1008 3.83179 10.1727 3.83179 10.2458C3.83179 10.319 3.85104 10.3908 3.88761 10.4542C3.92432 10.5177 3.97718 10.5705 4.04084 10.6071C4.10449 10.6437 4.17669 10.6628 4.25011 10.6625H11.7501C11.8235 10.6628 11.8957 10.6437 11.9594 10.6071C12.023 10.5705 12.0759 10.5177 12.1126 10.4542C12.1492 10.3908 12.1684 10.319 12.1684 10.2458C12.1684 10.1727 12.1492 10.1008 12.1126 10.0375ZM4.97094 9.82916L8.00011 4.58749L11.0293 9.82916H4.97094Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
/* các khối task trong popUp */
.bpmn-icon-send::before {
    content: '' !important;
}
.bpmn-icon-send {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5, 6)'%3E%3Cpath d='M12.3334 3.33335L7.00004 6.66669L1.66671 3.33335V2.00002L7.00004 5.33335L12.3334 2.00002M12.3334 0.666687H1.66671C0.926707 0.666687 0.333374 1.26002 0.333374 2.00002V10C0.333374 10.3536 0.47385 10.6928 0.723898 10.9428C0.973947 11.1929 1.31309 11.3334 1.66671 11.3334H12.3334C12.687 11.3334 13.0261 11.1929 13.2762 10.9428C13.5262 10.6928 13.6667 10.3536 13.6667 10V2.00002C13.6667 1.26002 13.0667 0.666687 12.3334 0.666687Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.bpmn-icon-receive::before {
    content: '' !important;
}
.bpmn-icon-receive {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(4.5, 5)'%3E%3Cpath d='M13.3864 4.08482L13.6821 3.90002H13.3334H2.66671H2.31803L2.61371 4.08482L7.94704 7.41815L8.00004 7.45128L8.05304 7.41815L13.3864 4.08482ZM13.3334 12.1H13.4334V12V5.33335V5.15293L13.2804 5.24855L8.00004 8.54876L2.71971 5.24855L2.56671 5.15293V5.33335V12V12.1H2.66671H13.3334ZM13.3334 2.76669C14.0115 2.76669 14.5667 3.32192 14.5667 4.00002V12C14.5667 12.6781 14.0115 13.2334 13.3334 13.2334H2.66671C1.9886 13.2334 1.43337 12.6781 1.43337 12V4.00002C1.43337 3.32192 1.9886 2.76669 2.66671 2.76669H13.3334Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

.djs-popup .entry:hover {
    background-color: #f2f2f2 !important;
}
.djs-popup .entry {
    margin: 2px 5px !important;
    border-radius: 5px;
}
.djs-popup {
    padding: 4px 0 !important;
    background: none;
    border: solid 0.2px #d9d9d9 !important;
    border-radius: 4px !important;
    background-color: white;
}
.djs-popup-body {
    background-color: #fefefe;
    border-radius: 4px;
}
.djs-palette {
    background-color: #ffffff;
    border-radius: 8px;
}

/* custom palete */
.bpmn-icon-hand-tool::before {
    content: '' !important;
}
.bpmn-icon-hand-tool {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.4) translate(10, 8)'%3E%3Cpath d='M10.8999 3.03333V3.16935L11.0298 3.12878C11.1194 3.10078 11.2171 3.1 11.3333 3.1C12.198 3.1 12.8999 3.8019 12.8999 4.66667V10.6667C12.8999 13.5581 10.558 15.9 7.66661 15.9C5.42102 15.9 3.41103 14.5317 2.57948 12.4496L0.873087 8.16362C0.873048 8.16352 0.873009 8.16341 0.872969 8.16331C0.715757 7.7606 0.731544 7.30288 0.963147 6.95547L0.963319 6.95521C1.26602 6.49808 1.80164 6.30116 2.30676 6.42977L2.82499 6.58258L2.82498 6.58263L2.82803 6.58343C3.11901 6.65934 3.38455 6.80482 3.59923 7.00056L3.76661 7.15317V6.92667V3C3.76661 2.13523 4.4685 1.43333 5.33327 1.43333C5.46325 1.43333 5.56559 1.43431 5.65999 1.46763L5.77092 1.50678L5.7917 1.391C5.92335 0.657526 6.56282 0.1 7.33327 0.1C7.99701 0.1 8.56142 0.513156 8.79369 1.09697L8.82712 1.181L8.91408 1.15615C9.04431 1.11894 9.18832 1.1 9.33327 1.1C10.198 1.1 10.8999 1.8019 10.8999 2.66667V3.03333ZM3.63361 12.0368L3.63371 12.037C4.28888 13.6818 5.88572 14.7667 7.66661 14.7667C9.9285 14.7667 11.7666 12.9286 11.7666 10.6667V4.66667C11.7666 4.42477 11.5752 4.23333 11.3333 4.23333C11.0914 4.23333 10.8999 4.42477 10.8999 4.66667V7.9H9.76661V2.66667C9.76661 2.42477 9.57517 2.23333 9.33327 2.23333C9.09138 2.23333 8.89994 2.42477 8.89994 2.66667V7.9H7.76661V1.66667C7.76661 1.42477 7.57517 1.23333 7.33327 1.23333C7.09138 1.23333 6.89994 1.42477 6.89994 1.66667V7.9H5.76661V3C5.76661 2.75811 5.57517 2.56667 5.33327 2.56667C5.09138 2.56667 4.89994 2.75811 4.89994 3V9.9H3.73431L3.09386 8.29886C2.98282 7.96876 2.72403 7.71825 2.35848 7.62988L2.0269 7.53704L1.83284 7.4827L1.90695 7.6701L3.63361 12.0368Z' fill='%236D6D6D' stroke='white' stroke-width='0.2'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.bpmn-icon-hand-tool:hover {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.4) translate(10, 8)'%3E%3Cpath d='M10.8999 3.03333V3.16935L11.0298 3.12878C11.1194 3.10078 11.2171 3.1 11.3333 3.1C12.198 3.1 12.8999 3.8019 12.8999 4.66667V10.6667C12.8999 13.5581 10.558 15.9 7.66661 15.9C5.42102 15.9 3.41103 14.5317 2.57948 12.4496L0.873087 8.16362C0.873048 8.16352 0.873009 8.16341 0.872969 8.16331C0.715757 7.7606 0.731544 7.30288 0.963147 6.95547L0.963319 6.95521C1.26602 6.49808 1.80164 6.30116 2.30676 6.42977L2.82499 6.58258L2.82498 6.58263L2.82803 6.58343C3.11901 6.65934 3.38455 6.80482 3.59923 7.00056L3.76661 7.15317V6.92667V3C3.76661 2.13523 4.4685 1.43333 5.33327 1.43333C5.46325 1.43333 5.56559 1.43431 5.65999 1.46763L5.77092 1.50678L5.7917 1.391C5.92335 0.657526 6.56282 0.1 7.33327 0.1C7.99701 0.1 8.56142 0.513156 8.79369 1.09697L8.82712 1.181L8.91408 1.15615C9.04431 1.11894 9.18832 1.1 9.33327 1.1C10.198 1.1 10.8999 1.8019 10.8999 2.66667V3.03333ZM3.63361 12.0368L3.63371 12.037C4.28888 13.6818 5.88572 14.7667 7.66661 14.7667C9.9285 14.7667 11.7666 12.9286 11.7666 10.6667V4.66667C11.7666 4.42477 11.5752 4.23333 11.3333 4.23333C11.0914 4.23333 10.8999 4.42477 10.8999 4.66667V7.9H9.76661V2.66667C9.76661 2.42477 9.57517 2.23333 9.33327 2.23333C9.09138 2.23333 8.89994 2.42477 8.89994 2.66667V7.9H7.76661V1.66667C7.76661 1.42477 7.57517 1.23333 7.33327 1.23333C7.09138 1.23333 6.89994 1.42477 6.89994 1.66667V7.9H5.76661V3C5.76661 2.75811 5.57517 2.56667 5.33327 2.56667C5.09138 2.56667 4.89994 2.75811 4.89994 3V9.9H3.73431L3.09386 8.29886C2.98282 7.96876 2.72403 7.71825 2.35848 7.62988L2.0269 7.53704L1.83284 7.4827L1.90695 7.6701L3.63361 12.0368Z' fill='%23FF7400' stroke='white' stroke-width='0.2'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

.bpmn-icon-lasso-tool::before {
    content: '' !important;
}
.bpmn-icon-lasso-tool {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 13 13' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.4) translate(4, 7)'%3E%3Cpath d='M4.75 5V7.75H3.25V5C3.25 4.02888 4.03726 3.25 5 3.25H7.75V4.75H5H4.75V5ZM21 4.75H18.25V3.25H21C21.4641 3.25 21.9092 3.43437 22.2374 3.76256C22.5656 4.09075 22.75 4.53587 22.75 5V7.75H21.25V5V4.75H21ZM21 21.25H21.25V21V18.25H22.75V21C22.75 21.9711 21.9627 22.75 21 22.75H18.25V21.25H21ZM5 21.25H7.75V22.75H5C4.53587 22.75 4.09075 22.5656 3.76256 22.2374C3.43437 21.9092 3.25 21.4641 3.25 21V18.25H4.75V21V21.25H5ZM11.25 3.25H14.75V4.75H11.25V3.25ZM11.25 21.25H14.75V22.75H11.25V21.25ZM21.25 11.25H22.75V14.75H21.25V11.25ZM3.25 11.25H4.75V14.75H3.25V11.25Z' fill='%236D6D6D' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M7.5 3.5H4.5V0.5C4.5 0.367392 4.44732 0.240215 4.35355 0.146447C4.25979 0.0526785 4.13261 0 4 0C3.86739 0 3.74021 0.0526785 3.64645 0.146447C3.55268 0.240215 3.5 0.367392 3.5 0.5V3.5H0.5C0.367392 3.5 0.240215 3.55268 0.146447 3.64645C0.0526785 3.74021 0 3.86739 0 4C0 4.13261 0.0526785 4.25979 0.146447 4.35355C0.240215 4.44732 0.367392 4.5 0.5 4.5H3.5V7.5C3.5 7.63261 3.55268 7.75979 3.64645 7.85355C3.74021 7.94732 3.86739 8 4 8C4.13261 8 4.25979 7.94732 4.35355 7.85355C4.44732 7.75979 4.5 7.63261 4.5 7.5V4.5H7.5C7.63261 4.5 7.75979 4.44732 7.85355 4.35355C7.94732 4.25979 8 4.13261 8 4C8 3.86739 7.94732 3.74021 7.85355 3.64645C7.75979 3.55268 7.63261 3.5 7.5 3.5Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.bpmn-icon-lasso-tool:hover {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 13 13' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.4) translate(4, 7)'%3E%3Cpath d='M4.75 5V7.75H3.25V5C3.25 4.02888 4.03726 3.25 5 3.25H7.75V4.75H5H4.75V5ZM21 4.75H18.25V3.25H21C21.4641 3.25 21.9092 3.43437 22.2374 3.76256C22.5656 4.09075 22.75 4.53587 22.75 5V7.75H21.25V5V4.75H21ZM21 21.25H21.25V21V18.25H22.75V21C22.75 21.9711 21.9627 22.75 21 22.75H18.25V21.25H21ZM5 21.25H7.75V22.75H5C4.53587 22.75 4.09075 22.5656 3.76256 22.2374C3.43437 21.9092 3.25 21.4641 3.25 21V18.25H4.75V21V21.25H5ZM11.25 3.25H14.75V4.75H11.25V3.25ZM11.25 21.25H14.75V22.75H11.25V21.25ZM21.25 11.25H22.75V14.75H21.25V11.25ZM3.25 11.25H4.75V14.75H3.25V11.25Z' fill='%23FF7400' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M7.5 3.5H4.5V0.5C4.5 0.367392 4.44732 0.240215 4.35355 0.146447C4.25979 0.0526785 4.13261 0 4 0C3.86739 0 3.74021 0.0526785 3.64645 0.146447C3.55268 0.240215 3.5 0.367392 3.5 0.5V3.5H0.5C0.367392 3.5 0.240215 3.55268 0.146447 3.64645C0.0526785 3.74021 0 3.86739 0 4C0 4.13261 0.0526785 4.25979 0.146447 4.35355C0.240215 4.44732 0.367392 4.5 0.5 4.5H3.5V7.5C3.5 7.63261 3.55268 7.75979 3.64645 7.85355C3.74021 7.94732 3.86739 8 4 8C4.13261 8 4.25979 7.94732 4.35355 7.85355C4.44732 7.75979 4.5 7.63261 4.5 7.5V4.5H7.5C7.63261 4.5 7.75979 4.44732 7.85355 4.35355C7.94732 4.25979 8 4.13261 8 4C8 3.86739 7.94732 3.74021 7.85355 3.64645C7.75979 3.55268 7.63261 3.5 7.5 3.5Z' fill='%23FF7400'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

.bpmn-icon-space-tool::before {
    content: '' !important;
}
.bpmn-icon-space-tool {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.35) translate(4, 13)'%3E%3Cpath d='M8.91665 4.41668H2.15581L3.49748 3.08084C3.55187 3.02645 3.59501 2.96189 3.62445 2.89082C3.65388 2.81976 3.66903 2.74359 3.66903 2.66668C3.66903 2.58976 3.65388 2.51359 3.62445 2.44253C3.59501 2.37147 3.55187 2.3069 3.49748 2.25251C3.44309 2.19812 3.37852 2.15498 3.30746 2.12554C3.2364 2.09611 3.16023 2.08096 3.08331 2.08096C3.0064 2.08096 2.93023 2.09611 2.85917 2.12554C2.78811 2.15498 2.72354 2.19812 2.66915 2.25251L0.335814 4.58584C0.282707 4.64132 0.241077 4.70674 0.213314 4.77834C0.15497 4.92036 0.15497 5.07966 0.213314 5.22168C0.241077 5.29328 0.282707 5.3587 0.335814 5.41418L2.66915 7.74751C2.72338 7.80218 2.78789 7.84558 2.85898 7.8752C2.93006 7.90481 3.00631 7.92006 3.08331 7.92006C3.16032 7.92006 3.23657 7.90481 3.30765 7.8752C3.37873 7.84558 3.44325 7.80218 3.49748 7.74751C3.55216 7.69328 3.59555 7.62876 3.62517 7.55768C3.65478 7.4866 3.67003 7.41035 3.67003 7.33334C3.67003 7.25634 3.65478 7.18009 3.62517 7.10901C3.59555 7.03792 3.55216 6.9734 3.49748 6.91918L2.15581 5.58334H8.91665C9.07136 5.58334 9.21973 5.52188 9.32913 5.41249C9.43852 5.30309 9.49998 5.15472 9.49998 5.00001C9.49998 4.8453 9.43852 4.69693 9.32913 4.58753C9.21973 4.47814 9.07136 4.41668 8.91665 4.41668ZM11.25 0.333344C11.0953 0.333344 10.9469 0.394802 10.8375 0.504198C10.7281 0.613594 10.6666 0.761967 10.6666 0.916677V9.08334C10.6666 9.23805 10.7281 9.38643 10.8375 9.49582C10.9469 9.60522 11.0953 9.66668 11.25 9.66668C11.4047 9.66668 11.5531 9.60522 11.6625 9.49582C11.7719 9.38643 11.8333 9.23805 11.8333 9.08334V0.916677C11.8333 0.761967 11.7719 0.613594 11.6625 0.504198C11.5531 0.394802 11.4047 0.333344 11.25 0.333344Z' fill='%236D6D6D'/%3E%3Cpath d='M17.0834 5.58335L23.8442 5.58335L22.5025 6.91919C22.4481 6.97358 22.405 7.03815 22.3756 7.10921C22.3461 7.18027 22.331 7.25644 22.331 7.33335C22.331 7.41027 22.3461 7.48644 22.3756 7.5575C22.405 7.62856 22.4481 7.69313 22.5025 7.74752C22.5569 7.80191 22.6215 7.84505 22.6925 7.87449C22.7636 7.90392 22.8398 7.91907 22.9167 7.91907C22.9936 7.91907 23.0698 7.90392 23.1408 7.87449C23.2119 7.84505 23.2765 7.80191 23.3309 7.74752L25.6642 5.41419C25.7173 5.35871 25.7589 5.29329 25.7867 5.22169C25.845 5.07967 25.845 4.92037 25.7867 4.77835C25.7589 4.70675 25.7173 4.64133 25.6642 4.58585L23.3309 2.25252C23.2766 2.19785 23.2121 2.15445 23.141 2.12483C23.0699 2.09522 22.9937 2.07997 22.9167 2.07997C22.8397 2.07997 22.7634 2.09522 22.6923 2.12483C22.6213 2.15445 22.5567 2.19785 22.5025 2.25252C22.4478 2.30675 22.4044 2.37127 22.3748 2.44235C22.3452 2.51344 22.33 2.58968 22.33 2.66669C22.33 2.74369 22.3452 2.81994 22.3748 2.89102C22.4044 2.96211 22.4478 3.02663 22.5025 3.08085L23.8442 4.41669L17.0834 4.41669C16.9286 4.41669 16.7803 4.47815 16.6709 4.58754C16.5615 4.69694 16.5 4.84531 16.5 5.00002C16.5 5.15473 16.5615 5.3031 16.6709 5.4125C16.7803 5.5219 16.9286 5.58335 17.0834 5.58335ZM14.75 9.66669C14.9047 9.66669 15.0531 9.60523 15.1625 9.49583C15.2719 9.38644 15.3334 9.23806 15.3334 9.08335L15.3334 0.916687C15.3334 0.761977 15.2719 0.613604 15.1625 0.504208C15.0531 0.394812 14.9047 0.333354 14.75 0.333354C14.5953 0.333354 14.4469 0.394812 14.3375 0.504208C14.2281 0.613604 14.1667 0.761977 14.1667 0.916687L14.1667 9.08335C14.1667 9.23806 14.2281 9.38644 14.3375 9.49583C14.4469 9.60523 14.5953 9.66669 14.75 9.66669Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ");
    background-repeat: no-repeat !important;
}
.bpmn-icon-space-tool:hover {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.35) translate(4, 13)'%3E%3Cpath d='M8.91665 4.41668H2.15581L3.49748 3.08084C3.55187 3.02645 3.59501 2.96189 3.62445 2.89082C3.65388 2.81976 3.66903 2.74359 3.66903 2.66668C3.66903 2.58976 3.65388 2.51359 3.62445 2.44253C3.59501 2.37147 3.55187 2.3069 3.49748 2.25251C3.44309 2.19812 3.37852 2.15498 3.30746 2.12554C3.2364 2.09611 3.16023 2.08096 3.08331 2.08096C3.0064 2.08096 2.93023 2.09611 2.85917 2.12554C2.78811 2.15498 2.72354 2.19812 2.66915 2.25251L0.335814 4.58584C0.282707 4.64132 0.241077 4.70674 0.213314 4.77834C0.15497 4.92036 0.15497 5.07966 0.213314 5.22168C0.241077 5.29328 0.282707 5.3587 0.335814 5.41418L2.66915 7.74751C2.72338 7.80218 2.78789 7.84558 2.85898 7.8752C2.93006 7.90481 3.00631 7.92006 3.08331 7.92006C3.16032 7.92006 3.23657 7.90481 3.30765 7.8752C3.37873 7.84558 3.44325 7.80218 3.49748 7.74751C3.55216 7.69328 3.59555 7.62876 3.62517 7.55768C3.65478 7.4866 3.67003 7.41035 3.67003 7.33334C3.67003 7.25634 3.65478 7.18009 3.62517 7.10901C3.59555 7.03792 3.55216 6.9734 3.49748 6.91918L2.15581 5.58334H8.91665C9.07136 5.58334 9.21973 5.52188 9.32913 5.41249C9.43852 5.30309 9.49998 5.15472 9.49998 5.00001C9.49998 4.8453 9.43852 4.69693 9.32913 4.58753C9.21973 4.47814 9.07136 4.41668 8.91665 4.41668ZM11.25 0.333344C11.0953 0.333344 10.9469 0.394802 10.8375 0.504198C10.7281 0.613594 10.6666 0.761967 10.6666 0.916677V9.08334C10.6666 9.23805 10.7281 9.38643 10.8375 9.49582C10.9469 9.60522 11.0953 9.66668 11.25 9.66668C11.4047 9.66668 11.5531 9.60522 11.6625 9.49582C11.7719 9.38643 11.8333 9.23805 11.8333 9.08334V0.916677C11.8333 0.761967 11.7719 0.613594 11.6625 0.504198C11.5531 0.394802 11.4047 0.333344 11.25 0.333344Z' fill='%23FF7400'/%3E%3Cpath d='M17.0834 5.58335L23.8442 5.58335L22.5025 6.91919C22.4481 6.97358 22.405 7.03815 22.3756 7.10921C22.3461 7.18027 22.331 7.25644 22.331 7.33335C22.331 7.41027 22.3461 7.48644 22.3756 7.5575C22.405 7.62856 22.4481 7.69313 22.5025 7.74752C22.5569 7.80191 22.6215 7.84505 22.6925 7.87449C22.7636 7.90392 22.8398 7.91907 22.9167 7.91907C22.9936 7.91907 23.0698 7.90392 23.1408 7.87449C23.2119 7.84505 23.2765 7.80191 23.3309 7.74752L25.6642 5.41419C25.7173 5.35871 25.7589 5.29329 25.7867 5.22169C25.845 5.07967 25.845 4.92037 25.7867 4.77835C25.7589 4.70675 25.7173 4.64133 25.6642 4.58585L23.3309 2.25252C23.2766 2.19785 23.2121 2.15445 23.141 2.12483C23.0699 2.09522 22.9937 2.07997 22.9167 2.07997C22.8397 2.07997 22.7634 2.09522 22.6923 2.12483C22.6213 2.15445 22.5567 2.19785 22.5025 2.25252C22.4478 2.30675 22.4044 2.37127 22.3748 2.44235C22.3452 2.51344 22.33 2.58968 22.33 2.66669C22.33 2.74369 22.3452 2.81994 22.3748 2.89102C22.4044 2.96211 22.4478 3.02663 22.5025 3.08085L23.8442 4.41669L17.0834 4.41669C16.9286 4.41669 16.7803 4.47815 16.6709 4.58754C16.5615 4.69694 16.5 4.84531 16.5 5.00002C16.5 5.15473 16.5615 5.3031 16.6709 5.4125C16.7803 5.5219 16.9286 5.58335 17.0834 5.58335ZM14.75 9.66669C14.9047 9.66669 15.0531 9.60523 15.1625 9.49583C15.2719 9.38644 15.3334 9.23806 15.3334 9.08335L15.3334 0.916687C15.3334 0.761977 15.2719 0.613604 15.1625 0.504208C15.0531 0.394812 14.9047 0.333354 14.75 0.333354C14.5953 0.333354 14.4469 0.394812 14.3375 0.504208C14.2281 0.613604 14.1667 0.761977 14.1667 0.916687L14.1667 9.08335C14.1667 9.23806 14.2281 9.38644 14.3375 9.49583C14.4469 9.60523 14.5953 9.66669 14.75 9.66669Z' fill='%23FF7400'/%3E%3C/g%3E%3C/svg%3E ");
    background-repeat: no-repeat !important;
}

.bpmn-icon-participant::before {
    content: '' !important;
}
.bpmn-icon-participant {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.3) translate(8, 10)'%3E%3Cpath d='M6.66663 19.9667H6.96663V19.6667V2.33335V2.03335H6.66663H2.33329H2.03329V2.33335V19.6667V19.9667H2.33329H6.66663ZM19.6666 19.9667H19.9666V19.6667V2.33335V2.03335H19.6666H8.83329H8.53329V2.33335V19.6667V19.9667H8.83329H19.6666ZM1.24996 0.466687H20.75C20.9577 0.466687 21.157 0.549217 21.3039 0.696119C21.4508 0.843023 21.5333 1.04227 21.5333 1.25002V20.75C21.5333 20.9578 21.4508 21.157 21.3039 21.3039C21.157 21.4508 20.9577 21.5334 20.75 21.5334H1.24996C1.04221 21.5334 0.842962 21.4508 0.696059 21.3039C0.549156 21.157 0.466626 20.9578 0.466626 20.75V1.25002C0.466626 1.04227 0.549155 0.843023 0.696059 0.69612C0.842962 0.549217 1.04221 0.466687 1.24996 0.466687Z' fill='%236D6D6D' stroke='white' stroke-width='0.6'/%3E%3C/g%3E%3C/svg%3E ");
    background-repeat: no-repeat !important;
}
.bpmn-icon-participant:hover {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.3) translate(8, 10)'%3E%3Cpath d='M6.66663 19.9667H6.96663V19.6667V2.33335V2.03335H6.66663H2.33329H2.03329V2.33335V19.6667V19.9667H2.33329H6.66663ZM19.6666 19.9667H19.9666V19.6667V2.33335V2.03335H19.6666H8.83329H8.53329V2.33335V19.6667V19.9667H8.83329H19.6666ZM1.24996 0.466687H20.75C20.9577 0.466687 21.157 0.549217 21.3039 0.696119C21.4508 0.843023 21.5333 1.04227 21.5333 1.25002V20.75C21.5333 20.9578 21.4508 21.157 21.3039 21.3039C21.157 21.4508 20.9577 21.5334 20.75 21.5334H1.24996C1.04221 21.5334 0.842962 21.4508 0.696059 21.3039C0.549156 21.157 0.466626 20.9578 0.466626 20.75V1.25002C0.466626 1.04227 0.549155 0.843023 0.696059 0.69612C0.842962 0.549217 1.04221 0.466687 1.24996 0.466687Z' fill='%23FF7400' stroke='white' stroke-width='0.6'/%3E%3C/g%3E%3C/svg%3E ");
    background-repeat: no-repeat !important;
}

.bpmn-icon-data-store::before {
    content: '' !important;
}
.bpmn-icon-data-store {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.32) translate(8, 7)'%3E%3Cpath d='M2.62884 13.7699L2.20004 13.566V14.0408V17.5833C2.20004 17.7591 2.26966 17.9231 2.36532 18.065C2.46205 18.2084 2.59732 18.3473 2.75983 18.4792C3.08498 18.7433 3.5489 19.0038 4.12801 19.2339C5.28885 19.6952 6.95206 20.05 9.00004 20.05C11.048 20.05 12.7112 19.6952 13.8721 19.2339C14.4512 19.0038 14.9151 18.7433 15.2403 18.4792C15.4028 18.3473 15.538 18.2084 15.6348 18.065C15.7304 17.9231 15.8 17.7591 15.8 17.5833V14.0408V13.566L15.3712 13.7699C13.3858 14.7137 11.2056 15.1752 9.00802 15.1168L9.00004 15.1166L8.99207 15.1168C6.79452 15.1752 4.61424 14.7137 2.62884 13.7699ZM2.62884 7.26989L2.20004 7.06604V7.54083V11.0833C2.20004 11.2591 2.26966 11.4231 2.36532 11.565C2.46205 11.7084 2.59732 11.8473 2.75983 11.9792C3.08498 12.2433 3.5489 12.5038 4.12801 12.7339C5.28885 13.1952 6.95206 13.55 9.00004 13.55C11.048 13.55 12.7112 13.1952 13.8721 12.7339C14.4512 12.5038 14.9151 12.2433 15.2403 11.9792C15.4028 11.8473 15.538 11.7084 15.6348 11.565C15.7304 11.4231 15.8 11.2591 15.8 11.0833V7.54083V7.06604L15.3712 7.26989C13.3858 8.21372 11.2056 8.67521 9.00802 8.61677L9.00004 8.61656L8.99207 8.61677C6.79452 8.67521 4.61424 8.21372 2.62884 7.26989ZM4.23151 16.3903C4.36033 16.3043 4.51178 16.2583 4.66671 16.2583C4.87446 16.2583 5.0737 16.3409 5.22061 16.4878C5.36751 16.6347 5.45004 16.8339 5.45004 17.0417C5.45004 17.1966 5.4041 17.348 5.31803 17.4769C5.23195 17.6057 5.10961 17.7061 4.96648 17.7654C4.82334 17.8247 4.66584 17.8402 4.51389 17.8099C4.36193 17.7797 4.22236 17.7051 4.11281 17.5956C4.00326 17.486 3.92865 17.3464 3.89843 17.1945C3.8682 17.0425 3.88371 16.885 3.943 16.7419C4.00229 16.5988 4.10269 16.4764 4.23151 16.3903ZM0.633374 4.58333C0.633374 3.33838 1.57702 2.33234 3.16425 1.62206C4.73981 0.916996 6.86178 0.55 9.00004 0.55C11.1383 0.55 13.2603 0.916996 14.8358 1.62206C16.4231 2.33234 17.3667 3.33838 17.3667 4.58333V17.5833C17.3667 18.8283 16.4231 19.8343 14.8358 20.5446C13.2603 21.2497 11.1383 21.6167 9.00004 21.6167C6.86178 21.6167 4.73981 21.2497 3.16425 20.5446C1.57702 19.8343 0.633374 18.8283 0.633374 17.5833V4.58333ZM2.20004 4.58333C2.20004 4.75911 2.26966 4.92315 2.36532 5.065C2.46205 5.20844 2.59732 5.34728 2.75983 5.47925C3.08498 5.7433 3.5489 6.00379 4.12801 6.2339C5.28885 6.69515 6.95206 7.05 9.00004 7.05C11.048 7.05 12.7112 6.69515 13.8721 6.2339C14.4512 6.00379 14.9151 5.7433 15.2403 5.47925C15.4028 5.34728 15.538 5.20844 15.6348 5.065C15.7304 4.92315 15.8 4.75911 15.8 4.58333C15.8 4.40755 15.7304 4.24352 15.6348 4.10167C15.538 3.95823 15.4028 3.81939 15.2403 3.68742C14.9151 3.42337 14.4512 3.16287 13.8721 2.93276C12.7112 2.47151 11.048 2.11667 9.00004 2.11667C6.95206 2.11667 5.28885 2.47151 4.12801 2.93276C3.5489 3.16287 3.08498 3.42337 2.75983 3.68742C2.59732 3.81939 2.46205 3.95823 2.36532 4.10167C2.26966 4.24352 2.20004 4.40755 2.20004 4.58333ZM4.23151 9.89035C4.36033 9.80427 4.51178 9.75833 4.66671 9.75833C4.87446 9.75833 5.0737 9.84086 5.22061 9.98777C5.36751 10.1347 5.45004 10.3339 5.45004 10.5417C5.45004 10.6966 5.4041 10.848 5.31803 10.9769C5.23195 11.1057 5.10961 11.2061 4.96648 11.2654C4.82334 11.3247 4.66584 11.3402 4.51389 11.3099C4.36194 11.2797 4.22236 11.2051 4.11281 11.0956C4.00326 10.986 3.92865 10.8464 3.89843 10.6945C3.8682 10.5425 3.88371 10.385 3.943 10.2419C4.00229 10.0988 4.10269 9.97642 4.23151 9.89035Z' fill='%236D6D6D' stroke='white' stroke-width='0.6'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.bpmn-icon-data-store:hover {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.32) translate(8, 7)'%3E%3Cpath d='M2.62884 13.7699L2.20004 13.566V14.0408V17.5833C2.20004 17.7591 2.26966 17.9231 2.36532 18.065C2.46205 18.2084 2.59732 18.3473 2.75983 18.4792C3.08498 18.7433 3.5489 19.0038 4.12801 19.2339C5.28885 19.6952 6.95206 20.05 9.00004 20.05C11.048 20.05 12.7112 19.6952 13.8721 19.2339C14.4512 19.0038 14.9151 18.7433 15.2403 18.4792C15.4028 18.3473 15.538 18.2084 15.6348 18.065C15.7304 17.9231 15.8 17.7591 15.8 17.5833V14.0408V13.566L15.3712 13.7699C13.3858 14.7137 11.2056 15.1752 9.00802 15.1168L9.00004 15.1166L8.99207 15.1168C6.79452 15.1752 4.61424 14.7137 2.62884 13.7699ZM2.62884 7.26989L2.20004 7.06604V7.54083V11.0833C2.20004 11.2591 2.26966 11.4231 2.36532 11.565C2.46205 11.7084 2.59732 11.8473 2.75983 11.9792C3.08498 12.2433 3.5489 12.5038 4.12801 12.7339C5.28885 13.1952 6.95206 13.55 9.00004 13.55C11.048 13.55 12.7112 13.1952 13.8721 12.7339C14.4512 12.5038 14.9151 12.2433 15.2403 11.9792C15.4028 11.8473 15.538 11.7084 15.6348 11.565C15.7304 11.4231 15.8 11.2591 15.8 11.0833V7.54083V7.06604L15.3712 7.26989C13.3858 8.21372 11.2056 8.67521 9.00802 8.61677L9.00004 8.61656L8.99207 8.61677C6.79452 8.67521 4.61424 8.21372 2.62884 7.26989ZM4.23151 16.3903C4.36033 16.3043 4.51178 16.2583 4.66671 16.2583C4.87446 16.2583 5.0737 16.3409 5.22061 16.4878C5.36751 16.6347 5.45004 16.8339 5.45004 17.0417C5.45004 17.1966 5.4041 17.348 5.31803 17.4769C5.23195 17.6057 5.10961 17.7061 4.96648 17.7654C4.82334 17.8247 4.66584 17.8402 4.51389 17.8099C4.36193 17.7797 4.22236 17.7051 4.11281 17.5956C4.00326 17.486 3.92865 17.3464 3.89843 17.1945C3.8682 17.0425 3.88371 16.885 3.943 16.7419C4.00229 16.5988 4.10269 16.4764 4.23151 16.3903ZM0.633374 4.58333C0.633374 3.33838 1.57702 2.33234 3.16425 1.62206C4.73981 0.916996 6.86178 0.55 9.00004 0.55C11.1383 0.55 13.2603 0.916996 14.8358 1.62206C16.4231 2.33234 17.3667 3.33838 17.3667 4.58333V17.5833C17.3667 18.8283 16.4231 19.8343 14.8358 20.5446C13.2603 21.2497 11.1383 21.6167 9.00004 21.6167C6.86178 21.6167 4.73981 21.2497 3.16425 20.5446C1.57702 19.8343 0.633374 18.8283 0.633374 17.5833V4.58333ZM2.20004 4.58333C2.20004 4.75911 2.26966 4.92315 2.36532 5.065C2.46205 5.20844 2.59732 5.34728 2.75983 5.47925C3.08498 5.7433 3.5489 6.00379 4.12801 6.2339C5.28885 6.69515 6.95206 7.05 9.00004 7.05C11.048 7.05 12.7112 6.69515 13.8721 6.2339C14.4512 6.00379 14.9151 5.7433 15.2403 5.47925C15.4028 5.34728 15.538 5.20844 15.6348 5.065C15.7304 4.92315 15.8 4.75911 15.8 4.58333C15.8 4.40755 15.7304 4.24352 15.6348 4.10167C15.538 3.95823 15.4028 3.81939 15.2403 3.68742C14.9151 3.42337 14.4512 3.16287 13.8721 2.93276C12.7112 2.47151 11.048 2.11667 9.00004 2.11667C6.95206 2.11667 5.28885 2.47151 4.12801 2.93276C3.5489 3.16287 3.08498 3.42337 2.75983 3.68742C2.59732 3.81939 2.46205 3.95823 2.36532 4.10167C2.26966 4.24352 2.20004 4.40755 2.20004 4.58333ZM4.23151 9.89035C4.36033 9.80427 4.51178 9.75833 4.66671 9.75833C4.87446 9.75833 5.0737 9.84086 5.22061 9.98777C5.36751 10.1347 5.45004 10.3339 5.45004 10.5417C5.45004 10.6966 5.4041 10.848 5.31803 10.9769C5.23195 11.1057 5.10961 11.2061 4.96648 11.2654C4.82334 11.3247 4.66584 11.3402 4.51389 11.3099C4.36194 11.2797 4.22236 11.2051 4.11281 11.0956C4.00326 10.986 3.92865 10.8464 3.89843 10.6945C3.8682 10.5425 3.88371 10.385 3.943 10.2419C4.00229 10.0988 4.10269 9.97642 4.23151 9.89035Z' fill='%23FF7400' stroke='white' stroke-width='0.6'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

.bpmn-icon-data-object::before {
    content: '' !important;
}
.bpmn-icon-data-object {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.35) translate(10, 5)'%3E%3Cpath d='M17.3017 7.39252V7.44162L17.3174 7.48815C17.3408 7.55798 17.3574 7.62994 17.3667 7.70299V7.70319V7.70349V7.7038V7.7041V7.7044V7.7047V7.705V7.7053V7.70559V7.70589V7.70618V7.70647V7.70677V7.70706V7.70734V7.70763V7.70792V7.7082V7.70848V7.70877V7.70905V7.70933V7.7096V7.70988V7.71016V7.71043V7.7107V7.71098V7.71125V7.71152V7.71178V7.71205V7.71232V7.71258V7.71284V7.7131V7.71337V7.71362V7.71388V7.71414V7.7144V7.71465V7.7149V7.71516V7.71541V7.71566V7.7159V7.71615V7.7164V7.71664V7.71689V7.71713V7.71737V7.71761V7.71785V7.71809V7.71832V7.71856V7.71879V7.71903V7.71926V7.71949V7.71972V7.71995V7.72017V7.7204V7.72062V7.72085V7.72107V7.72129V7.72151V7.72173V7.72195V7.72217V7.72238V7.7226V7.72281V7.72302V7.72324V7.72345V7.72366V7.72386V7.72407V7.72428V7.72448V7.72468V7.72489V7.72509V7.72529V7.72549V7.72569V7.72588V7.72608V7.72628V7.72647V7.72666V7.72686V7.72705V7.72724V7.72742V7.72761V7.7278V7.72798V7.72817V7.72835V7.72854V7.72872V7.7289V7.72908V7.72926V7.72943V7.72961V7.72978V7.72996V7.73013V7.73031V7.73048V7.73065V7.73082V7.73099V7.73115V7.73132V7.73148V7.73165V7.73181V7.73198V7.73214V7.7323V7.73246V7.73262V7.73277V7.73293V7.73309V7.73324V7.7334V7.73355V7.7337V7.73385V7.734V7.73415V7.7343V7.73445V7.73459V7.73474V7.73488V7.73503V7.73517V7.73531V7.73545V7.73559V7.73573V7.73587V7.73601V7.73614V7.73628V7.73641V7.73655V7.73668V7.73681V7.73694V7.73707V7.7372V7.73733V7.73746V7.73759V7.73771V7.73784V7.73796V7.73809V7.73821V7.73833V7.73845V7.73857V7.73869V7.73881V7.73893V7.73904V7.73916V7.73927V7.73939V7.7395V7.73961V7.73973V7.73984V7.73995V7.74006V7.74017V7.74027V7.74038V7.74049V7.74059V7.7407V7.7408V7.7409V7.74101V7.74111V7.74121V7.74131V7.74141V7.74151V7.74161V7.7417V7.7418V7.74189V7.74199V7.74208V7.74218V7.74227V7.74236V7.74245V7.74254V7.74263V7.74272V7.74281V7.7429V7.74298V7.74307V7.74316V7.74324V7.74333V7.74341V7.74349V7.74357V7.74365V7.74373V7.74381V7.74389V7.74397V7.74405V7.74413V7.7442V7.74428V7.74436V7.74443V7.7445V7.74458V7.74465V7.74472V7.74479V7.74486V7.74493V7.745V7.74507V7.74514V7.74521V7.74527V7.74534V7.74541V7.74547V7.74553V7.7456V7.74566V7.74572V7.74579V7.74585V7.74591V7.74597V7.74603V7.74609V7.74615V7.7462V7.74626V7.74632V7.74637V7.74643V7.74648V7.74654V7.74659V7.74665V7.7467V7.74675V7.7468V7.74685V7.7469V7.74695V7.747V7.74705V7.7471V7.74715V7.7472V7.74724V7.74729V7.74733V7.74738V7.74742V7.74747V7.74751V7.74756V7.7476V7.74764V7.74768V7.74772V7.74776V7.7478V7.74784V7.74788V7.74792V7.74796V7.748V7.74804V7.74807V7.74811V7.74815V7.74818V7.74822V7.74825V7.74829V7.74832V7.74835V7.74839V7.74842V7.74845V7.74848V7.74851V7.74854V7.74857V7.7486V7.74863V7.74866V7.74869V7.74872V7.74875V7.74877V7.7488V7.74883V7.74885V7.74888V7.74891V7.74893V7.74896V7.74898V7.749V7.74903V7.74905V7.74907V7.7491V7.74912V7.74914V7.74916V7.74918V7.7492V7.74922V7.74924V7.74926V7.74928V7.7493V7.74932V7.74934V7.74936V7.74938V7.74939V7.74941V7.74943V7.74944V7.74946V7.74948V7.74949V7.74951V7.74952V7.74954V7.74956V7.74959V7.74962V7.74964V7.74967V7.74969V7.74971V7.74973V7.74975V7.74977V7.74979V7.74981V7.74982V7.74984V7.74985V7.74987V7.74989V7.74991V7.74993V7.74994V7.74996V7.74998V7.74999V7.75002V18.5834C17.3667 19.3657 17.0559 20.1161 16.5027 20.6693C15.9494 21.2225 15.1991 21.5334 14.4167 21.5334H3.58337C2.80099 21.5334 2.05064 21.2225 1.49741 20.6693C0.944177 20.1161 0.633374 19.3657 0.633374 18.5834V3.41669C0.633374 2.6343 0.944177 1.88395 1.49741 1.33072C2.05064 0.77749 2.80099 0.466687 3.58337 0.466687H10.0983L10.3975 0.56956L10.4449 0.585854H10.495H10.5206C10.5807 0.619461 10.6367 0.660217 10.6872 0.707281L17.1803 7.20034C17.2273 7.25086 17.2681 7.30682 17.3017 7.36697V7.39252ZM11.3788 3.64872L10.8667 3.13659V3.86085V6.66669V6.96669H11.1667H13.9725H14.6968L14.1847 6.45455L11.3788 3.64872ZM2.60521 19.5615L2.81734 19.3494L2.60521 19.5615C2.86464 19.8209 3.21649 19.9667 3.58337 19.9667H14.4167C14.7836 19.9667 15.1354 19.8209 15.3949 19.5615C15.6543 19.3021 15.8 18.9502 15.8 18.5834V8.83335V8.53335H15.5H10.0834C9.87562 8.53335 9.67638 8.45082 9.52947 8.30392C9.38257 8.15702 9.30004 7.95777 9.30004 7.75002V2.33335V2.03335H9.00004H3.58337C3.21649 2.03335 2.86463 2.1791 2.60521 2.43852C2.34578 2.69795 2.20004 3.0498 2.20004 3.41669V18.5834C2.20004 18.9502 2.34578 19.3021 2.60521 19.5615Z' fill='%236D6D6D' stroke='white' stroke-width='0.6'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.bpmn-icon-data-object:hover {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.35) translate(10, 5)'%3E%3Cpath d='M17.3017 7.39252V7.44162L17.3174 7.48815C17.3408 7.55798 17.3574 7.62994 17.3667 7.70299V7.70319V7.70349V7.7038V7.7041V7.7044V7.7047V7.705V7.7053V7.70559V7.70589V7.70618V7.70647V7.70677V7.70706V7.70734V7.70763V7.70792V7.7082V7.70848V7.70877V7.70905V7.70933V7.7096V7.70988V7.71016V7.71043V7.7107V7.71098V7.71125V7.71152V7.71178V7.71205V7.71232V7.71258V7.71284V7.7131V7.71337V7.71362V7.71388V7.71414V7.7144V7.71465V7.7149V7.71516V7.71541V7.71566V7.7159V7.71615V7.7164V7.71664V7.71689V7.71713V7.71737V7.71761V7.71785V7.71809V7.71832V7.71856V7.71879V7.71903V7.71926V7.71949V7.71972V7.71995V7.72017V7.7204V7.72062V7.72085V7.72107V7.72129V7.72151V7.72173V7.72195V7.72217V7.72238V7.7226V7.72281V7.72302V7.72324V7.72345V7.72366V7.72386V7.72407V7.72428V7.72448V7.72468V7.72489V7.72509V7.72529V7.72549V7.72569V7.72588V7.72608V7.72628V7.72647V7.72666V7.72686V7.72705V7.72724V7.72742V7.72761V7.7278V7.72798V7.72817V7.72835V7.72854V7.72872V7.7289V7.72908V7.72926V7.72943V7.72961V7.72978V7.72996V7.73013V7.73031V7.73048V7.73065V7.73082V7.73099V7.73115V7.73132V7.73148V7.73165V7.73181V7.73198V7.73214V7.7323V7.73246V7.73262V7.73277V7.73293V7.73309V7.73324V7.7334V7.73355V7.7337V7.73385V7.734V7.73415V7.7343V7.73445V7.73459V7.73474V7.73488V7.73503V7.73517V7.73531V7.73545V7.73559V7.73573V7.73587V7.73601V7.73614V7.73628V7.73641V7.73655V7.73668V7.73681V7.73694V7.73707V7.7372V7.73733V7.73746V7.73759V7.73771V7.73784V7.73796V7.73809V7.73821V7.73833V7.73845V7.73857V7.73869V7.73881V7.73893V7.73904V7.73916V7.73927V7.73939V7.7395V7.73961V7.73973V7.73984V7.73995V7.74006V7.74017V7.74027V7.74038V7.74049V7.74059V7.7407V7.7408V7.7409V7.74101V7.74111V7.74121V7.74131V7.74141V7.74151V7.74161V7.7417V7.7418V7.74189V7.74199V7.74208V7.74218V7.74227V7.74236V7.74245V7.74254V7.74263V7.74272V7.74281V7.7429V7.74298V7.74307V7.74316V7.74324V7.74333V7.74341V7.74349V7.74357V7.74365V7.74373V7.74381V7.74389V7.74397V7.74405V7.74413V7.7442V7.74428V7.74436V7.74443V7.7445V7.74458V7.74465V7.74472V7.74479V7.74486V7.74493V7.745V7.74507V7.74514V7.74521V7.74527V7.74534V7.74541V7.74547V7.74553V7.7456V7.74566V7.74572V7.74579V7.74585V7.74591V7.74597V7.74603V7.74609V7.74615V7.7462V7.74626V7.74632V7.74637V7.74643V7.74648V7.74654V7.74659V7.74665V7.7467V7.74675V7.7468V7.74685V7.7469V7.74695V7.747V7.74705V7.7471V7.74715V7.7472V7.74724V7.74729V7.74733V7.74738V7.74742V7.74747V7.74751V7.74756V7.7476V7.74764V7.74768V7.74772V7.74776V7.7478V7.74784V7.74788V7.74792V7.74796V7.748V7.74804V7.74807V7.74811V7.74815V7.74818V7.74822V7.74825V7.74829V7.74832V7.74835V7.74839V7.74842V7.74845V7.74848V7.74851V7.74854V7.74857V7.7486V7.74863V7.74866V7.74869V7.74872V7.74875V7.74877V7.7488V7.74883V7.74885V7.74888V7.74891V7.74893V7.74896V7.74898V7.749V7.74903V7.74905V7.74907V7.7491V7.74912V7.74914V7.74916V7.74918V7.7492V7.74922V7.74924V7.74926V7.74928V7.7493V7.74932V7.74934V7.74936V7.74938V7.74939V7.74941V7.74943V7.74944V7.74946V7.74948V7.74949V7.74951V7.74952V7.74954V7.74956V7.74959V7.74962V7.74964V7.74967V7.74969V7.74971V7.74973V7.74975V7.74977V7.74979V7.74981V7.74982V7.74984V7.74985V7.74987V7.74989V7.74991V7.74993V7.74994V7.74996V7.74998V7.74999V7.75002V18.5834C17.3667 19.3657 17.0559 20.1161 16.5027 20.6693C15.9494 21.2225 15.1991 21.5334 14.4167 21.5334H3.58337C2.80099 21.5334 2.05064 21.2225 1.49741 20.6693C0.944177 20.1161 0.633374 19.3657 0.633374 18.5834V3.41669C0.633374 2.6343 0.944177 1.88395 1.49741 1.33072C2.05064 0.77749 2.80099 0.466687 3.58337 0.466687H10.0983L10.3975 0.56956L10.4449 0.585854H10.495H10.5206C10.5807 0.619461 10.6367 0.660217 10.6872 0.707281L17.1803 7.20034C17.2273 7.25086 17.2681 7.30682 17.3017 7.36697V7.39252ZM11.3788 3.64872L10.8667 3.13659V3.86085V6.66669V6.96669H11.1667H13.9725H14.6968L14.1847 6.45455L11.3788 3.64872ZM2.60521 19.5615L2.81734 19.3494L2.60521 19.5615C2.86464 19.8209 3.21649 19.9667 3.58337 19.9667H14.4167C14.7836 19.9667 15.1354 19.8209 15.3949 19.5615C15.6543 19.3021 15.8 18.9502 15.8 18.5834V8.83335V8.53335H15.5H10.0834C9.87562 8.53335 9.67638 8.45082 9.52947 8.30392C9.38257 8.15702 9.30004 7.95777 9.30004 7.75002V2.33335V2.03335H9.00004H3.58337C3.21649 2.03335 2.86463 2.1791 2.60521 2.43852C2.34578 2.69795 2.20004 3.0498 2.20004 3.41669V18.5834C2.20004 18.9502 2.34578 19.3021 2.60521 19.5615Z' fill='%23FF7400' stroke='white' stroke-width='0.6'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

/* các khối start event */
.djs-popup.bpmn-icon-start-event-condition::before {
    content: '' !important;
}
.djs-popup.bpmn-icon-start-event-condition {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.45) translate(5, 5)'%3E%3Ccircle cx='8' cy='8' r='7.5' fill='white' stroke='%236D6D6D'/%3E%3Cpath d='M7.33333 6.66666H9.33333C9.42174 6.66666 9.50652 6.63154 9.56904 6.56903C9.63155 6.50651 9.66667 6.42173 9.66667 6.33332C9.66667 6.24492 9.63155 6.16013 9.56904 6.09762C9.50652 6.03511 9.42174 5.99999 9.33333 5.99999H7.33333C7.24493 5.99999 7.16014 6.03511 7.09763 6.09762C7.03512 6.16013 7 6.24492 7 6.33332C7 6.42173 7.03512 6.50651 7.09763 6.56903C7.16014 6.63154 7.24493 6.66666 7.33333 6.66666ZM6.66667 7.99999H9.33333C9.42174 7.99999 9.50652 7.96487 9.56904 7.90236C9.63155 7.83985 9.66667 7.75506 9.66667 7.66666C9.66667 7.57825 9.63155 7.49347 9.56904 7.43095C9.50652 7.36844 9.42174 7.33332 9.33333 7.33332H6.66667C6.57826 7.33332 6.49348 7.36844 6.43096 7.43095C6.36845 7.49347 6.33333 7.57825 6.33333 7.66666C6.33333 7.75506 6.36845 7.83985 6.43096 7.90236C6.49348 7.96487 6.57826 7.99999 6.66667 7.99999ZM6.66667 9.33332H9.33333C9.42174 9.33332 9.50652 9.2982 9.56904 9.23569C9.63155 9.17318 9.66667 9.0884 9.66667 8.99999C9.66667 8.91158 9.63155 8.8268 9.56904 8.76429C9.50652 8.70178 9.42174 8.66666 9.33333 8.66666H6.66667C6.57826 8.66666 6.49348 8.70178 6.43096 8.76429C6.36845 8.8268 6.33333 8.91158 6.33333 8.99999C6.33333 9.0884 6.36845 9.17318 6.43096 9.23569C6.49348 9.2982 6.57826 9.33332 6.66667 9.33332ZM10.6667 4.66666H5.33333C5.24493 4.66666 5.16014 4.70178 5.09763 4.76429C5.03512 4.8268 5 4.91158 5 4.99999V11C5 11.0619 5.01724 11.1226 5.04978 11.1752C5.08233 11.2279 5.12889 11.2704 5.18426 11.2981C5.23963 11.3258 5.30161 11.3375 5.36327 11.332C5.42492 11.3264 5.48381 11.3038 5.53333 11.2667L6.22333 10.75L6.91 11.2667C6.9677 11.3099 7.03788 11.3333 7.11 11.3333C7.18212 11.3333 7.2523 11.3099 7.31 11.2667L8 10.75L8.69 11.2667C8.7477 11.3099 8.81788 11.3333 8.89 11.3333C8.96212 11.3333 9.0323 11.3099 9.09 11.2667L9.77667 10.75L10.4667 11.2667C10.5164 11.3037 10.5756 11.3262 10.6374 11.3315C10.6992 11.3368 10.7613 11.3247 10.8167 11.2967C10.8716 11.269 10.9179 11.2266 10.9502 11.1742C10.9826 11.1218 10.9998 11.0615 11 11V4.99999C11 4.91158 10.9649 4.8268 10.9024 4.76429C10.8399 4.70178 10.7551 4.66666 10.6667 4.66666ZM10.3333 10.3333L9.97667 10.0667C9.91897 10.0234 9.84879 9.99999 9.77667 9.99999C9.70454 9.99999 9.63437 10.0234 9.57667 10.0667L8.89 10.5833L8.2 10.0667C8.1423 10.0234 8.07212 9.99999 8 9.99999C7.92788 9.99999 7.8577 10.0234 7.8 10.0667L7.11 10.5833L6.42333 10.0667C6.36563 10.0234 6.29546 9.99999 6.22333 9.99999C6.15121 9.99999 6.08103 10.0234 6.02333 10.0667L5.66667 10.3333V5.33332H10.3333V10.3333Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.djs-popup.bpmn-icon-start-event-timer::before {
    content: '' !important;
}
.djs-popup.bpmn-icon-start-event-timer {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.45) translate(5, 5)'%3E%3Ccircle cx='8' cy='8' r='7.5' fill='white' stroke='%236D6D6D'/%3E%3Cg clip-path='url(%23clip0_25_436)'%3E%3Cpath d='M7.99996 4.66666C7.34069 4.66666 6.69622 4.86215 6.14806 5.22842C5.5999 5.5947 5.17265 6.11529 4.92036 6.72438C4.66807 7.33347 4.60206 8.00369 4.73068 8.65029C4.85929 9.29689 5.17676 9.89084 5.64294 10.357C6.10911 10.8232 6.70306 11.1407 7.34966 11.2693C7.99626 11.3979 8.66649 11.3319 9.27557 11.0796C9.88466 10.8273 10.4053 10.4001 10.7715 9.85189C11.1378 9.30373 11.3333 8.65926 11.3333 7.99999C11.3333 7.56225 11.2471 7.1288 11.0796 6.72438C10.912 6.31996 10.6665 5.9525 10.357 5.64297C10.0475 5.33344 9.67999 5.08791 9.27557 4.92039C8.87115 4.75288 8.4377 4.66666 7.99996 4.66666ZM7.99996 10.6667C7.47254 10.6667 6.95697 10.5103 6.51844 10.2172C6.07991 9.92422 5.73812 9.50775 5.53628 9.02048C5.33445 8.53321 5.28164 7.99703 5.38453 7.47975C5.48743 6.96247 5.7414 6.48731 6.11434 6.11437C6.48728 5.74143 6.96244 5.48746 7.47972 5.38456C7.997 5.28167 8.53318 5.33448 9.02045 5.53631C9.50772 5.73814 9.9242 6.07994 10.2172 6.51847C10.5102 6.957 10.6666 7.47257 10.6666 7.99999C10.6666 8.70723 10.3857 9.38551 9.88558 9.88561C9.38548 10.3857 8.7072 10.6667 7.99996 10.6667ZM8.69996 7.20999L8.33329 7.42332V6.33332C8.33329 6.24492 8.29818 6.16013 8.23566 6.09762C8.17315 6.03511 8.08837 5.99999 7.99996 5.99999C7.91156 5.99999 7.82677 6.03511 7.76426 6.09762C7.70175 6.16013 7.66663 6.24492 7.66663 6.33332V7.99999C7.66663 7.99999 7.66663 7.99999 7.66663 8.01999C7.66506 8.04218 7.66506 8.06446 7.66663 8.08666C7.67179 8.10713 7.67847 8.12718 7.68663 8.14666C7.68663 8.14666 7.68663 8.14666 7.68663 8.16666C7.70255 8.1903 7.72039 8.2126 7.73996 8.23332C7.76689 8.26002 7.79854 8.2815 7.83329 8.29666H7.85996C7.90338 8.31898 7.95117 8.3315 7.99996 8.33332C8.03881 8.33221 8.07717 8.32432 8.11329 8.30999H8.14329H8.16663L9.03329 7.80999C9.11021 7.76579 9.16641 7.69284 9.18954 7.6072C9.21267 7.52156 9.20083 7.43024 9.15663 7.35332C9.11242 7.27641 9.03948 7.22021 8.95384 7.19708C8.8682 7.17395 8.77687 7.18579 8.69996 7.22999V7.20999Z' fill='%236D6D6D'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_25_436'%3E%3Crect width='8' height='8' fill='white' transform='translate(4 4)'/%3E%3C/clipPath%3E%3C/defs%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.djs-popup.bpmn-icon-start-event-signal::before {
    content: '' !important;
}
.djs-popup.bpmn-icon-start-event-signal {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.45) translate(5, 5)'%3E%3Ccircle cx='8' cy='8' r='7.5' fill='white' stroke='%236D6D6D'/%3E%3Cg clip-path='url(%23clip0_25_414)'%3E%3Cpath d='M11.5567 9.82334L8.87336 5.15668C8.78663 5.00118 8.65996 4.87166 8.50643 4.7815C8.3529 4.69134 8.17808 4.6438 8.00003 4.6438C7.82198 4.6438 7.64716 4.69134 7.49363 4.7815C7.3401 4.87166 7.21343 5.00118 7.1267 5.15668L4.46003 9.82334C4.3703 9.97468 4.32208 10.147 4.32024 10.3229C4.31841 10.4989 4.36303 10.6722 4.44959 10.8254C4.53615 10.9785 4.6616 11.1062 4.81326 11.1954C4.96492 11.2845 5.13742 11.3321 5.31336 11.3333H10.6867C10.864 11.3351 11.0387 11.2896 11.1927 11.2016C11.3467 11.1137 11.4745 10.9863 11.563 10.8326C11.6516 10.6789 11.6976 10.5045 11.6965 10.3271C11.6954 10.1498 11.6472 9.9759 11.5567 9.82334ZM10.98 10.49C10.9508 10.542 10.9082 10.5852 10.8566 10.6151C10.805 10.645 10.7463 10.6605 10.6867 10.66H5.31336C5.25373 10.6605 5.19506 10.645 5.14347 10.6151C5.09188 10.5852 5.04925 10.542 5.02003 10.49C4.99077 10.4393 4.97537 10.3819 4.97537 10.3233C4.97537 10.2648 4.99077 10.2073 5.02003 10.1567L7.6867 5.49001C7.71467 5.43541 7.75717 5.38959 7.80951 5.35759C7.86186 5.32559 7.92201 5.30866 7.98336 5.30866C8.04471 5.30866 8.10487 5.32559 8.15721 5.35759C8.20956 5.38959 8.25206 5.43541 8.28003 5.49001L10.9634 10.1567C10.9964 10.2066 11.0154 10.2646 11.0184 10.3244C11.0213 10.3842 11.0081 10.4437 10.98 10.4967V10.49Z' fill='%236D6D6D'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_25_414'%3E%3Crect width='8' height='8' fill='white' transform='translate(4 4)'/%3E%3C/clipPath%3E%3C/defs%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.djs-popup.bpmn-icon-end-event-none::before {
    content: '' !important;
}
.djs-popup.bpmn-icon-end-event-none {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.45) translate(5, 5)'%3E%3Ccircle cx='8' cy='8' r='7' fill='white' stroke='%236D6D6D' stroke-width='2'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.djs-popup.bpmn-icon-intermediate-event-none::before {
    content: '' !important;
}
.djs-popup.bpmn-icon-intermediate-event-none {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.45) translate(5  5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236D6D6D' stroke-width='0.5'/%3E%3Ccircle cx='7.99998' cy='8.00001' r='6.15' stroke='%236D6D6D' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

/* các khối gateway */
.djs-popup .bpmn-icon-gateway-parallel::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-gateway-parallel {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 13' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5  5)'%3E%3Crect x='0.707107' y='8.99998' width='11' height='11' rx='0.5' transform='rotate(-45 0.707107 8.99998)' fill='white' stroke='%236D6D6D'/%3E%3Cpath d='M12 8.49998H9V5.49998C9 5.36738 8.94732 5.2402 8.85355 5.14643C8.75979 5.05266 8.63261 4.99998 8.5 4.99998C8.36739 4.99998 8.24021 5.05266 8.14645 5.14643C8.05268 5.2402 8 5.36738 8 5.49998V8.49998H5C4.86739 8.49998 4.74021 8.55266 4.64645 8.64643C4.55268 8.7402 4.5 8.86738 4.5 8.99998C4.5 9.13259 4.55268 9.25977 4.64645 9.35354C4.74021 9.44731 4.86739 9.49998 5 9.49998H8V12.5C8 12.6326 8.05268 12.7598 8.14645 12.8535C8.24021 12.9473 8.36739 13 8.5 13C8.63261 13 8.75979 12.9473 8.85355 12.8535C8.94732 12.7598 9 12.6326 9 12.5V9.49998H12C12.1326 9.49998 12.2598 9.44731 12.3536 9.35354C12.4473 9.25977 12.5 9.13259 12.5 8.99998C12.5 8.86738 12.4473 8.7402 12.3536 8.64643C12.2598 8.55266 12.1326 8.49998 12 8.49998Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-gateway-or::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-gateway-or {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 13' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Crect x='0.707107' y='8.48528' width='11' height='11' rx='0.5' transform='rotate(-45 0.707107 8.48528)' fill='white' stroke='%236d6d6d'/%3E%3Ccircle cx='8.5' cy='8.5' r='3.25' stroke='%236d6d6d' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-gateway-complex::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-gateway-complex {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Crect x='0.707107' y='8.48528' width='11' height='11' rx='0.5' transform='rotate(-45 0.707107 8.48528)' fill='white' stroke='%236d6d6d'/%3E%3Cpath d='M7.93333 8.87718C7.89128 8.85926 7.84612 8.84975 7.80041 8.8492H6.40122C6.30844 8.8492 6.21947 8.88605 6.15387 8.95165C6.08827 9.01725 6.05142 9.10623 6.05142 9.199C6.05142 9.29177 6.08827 9.38074 6.15387 9.44634C6.21947 9.51194 6.30844 9.54879 6.40122 9.54879H6.95739L5.10347 11.3992C5.07068 11.4317 5.04466 11.4704 5.0269 11.5131C5.00914 11.5557 5 11.6014 5 11.6476C5 11.6938 5.00914 11.7395 5.0269 11.7821C5.04466 11.8247 5.07068 11.8634 5.10347 11.8959C5.13599 11.9287 5.17468 11.9547 5.2173 11.9725C5.25993 11.9903 5.30565 11.9994 5.35183 11.9994C5.398 11.9994 5.44372 11.9903 5.48635 11.9725C5.52898 11.9547 5.56766 11.9287 5.60018 11.8959L7.45061 10.042V10.5982C7.45061 10.691 7.48746 10.7799 7.55306 10.8455C7.61866 10.9111 7.70763 10.948 7.80041 10.948C7.89318 10.948 7.98215 10.9111 8.04775 10.8455C8.11335 10.7799 8.1502 10.691 8.1502 10.5982V9.199C8.14965 9.15329 8.14014 9.10813 8.12222 9.06607C8.08672 8.9806 8.0188 8.91268 7.93333 8.87718ZM7.80041 6.05082C7.70763 6.05082 7.61866 6.08768 7.55306 6.15328C7.48746 6.21888 7.45061 6.30785 7.45061 6.40062V6.9568L5.60018 5.10287C5.56757 5.07026 5.52885 5.04439 5.48623 5.02674C5.44362 5.00908 5.39795 5 5.35183 5C5.3057 5 5.26003 5.00908 5.21742 5.02674C5.1748 5.04439 5.13608 5.07026 5.10347 5.10287C5.0376 5.16874 5.0006 5.25808 5.0006 5.35123C5.0006 5.44438 5.0376 5.53372 5.10347 5.59958L6.95739 7.45001H6.40122C6.30844 7.45001 6.21947 7.48687 6.15387 7.55246C6.08827 7.61806 6.05142 7.70704 6.05142 7.79981C6.05142 7.89258 6.08827 7.98155 6.15387 8.04715C6.21947 8.11275 6.30844 8.14961 6.40122 8.14961H7.80041C7.84612 8.14905 7.89128 8.13955 7.93333 8.12162C8.0188 8.08613 8.08672 8.0182 8.12222 7.93273C8.14014 7.89068 8.14965 7.84552 8.1502 7.79981V6.40062C8.1502 6.30785 8.11335 6.21888 8.04775 6.15328C7.98215 6.08768 7.89318 6.05082 7.80041 6.05082ZM9.06667 8.12162C9.10873 8.13955 9.15388 8.14905 9.19959 8.14961H10.5988C10.6916 8.14961 10.7805 8.11275 10.8461 8.04715C10.9117 7.98155 10.9486 7.89258 10.9486 7.79981C10.9486 7.70704 10.9117 7.61806 10.8461 7.55246C10.7805 7.48687 10.6916 7.45001 10.5988 7.45001H10.0426L11.8965 5.59958C11.9624 5.53372 11.9994 5.44438 11.9994 5.35123C11.9994 5.25808 11.9624 5.16874 11.8965 5.10287C11.8307 5.037 11.7413 5 11.6482 5C11.555 5 11.4657 5.037 11.3998 5.10287L9.54939 6.9568V6.40062C9.54939 6.30785 9.51254 6.21888 9.44694 6.15328C9.38134 6.08768 9.29237 6.05082 9.19959 6.05082C9.10682 6.05082 9.01785 6.08768 8.95225 6.15328C8.88665 6.21888 8.8498 6.30785 8.8498 6.40062V7.79981C8.85035 7.84552 8.85986 7.89068 8.87778 7.93273C8.91328 8.0182 8.9812 8.08613 9.06667 8.12162ZM10.0426 9.54879H10.5988C10.6916 9.54879 10.7805 9.51194 10.8461 9.44634C10.9117 9.38074 10.9486 9.29177 10.9486 9.199C10.9486 9.10623 10.9117 9.01725 10.8461 8.95165C10.7805 8.88605 10.6916 8.8492 10.5988 8.8492H9.19959C9.15388 8.84975 9.10873 8.85926 9.06667 8.87718C8.9812 8.91268 8.91328 8.9806 8.87778 9.06607C8.85986 9.10813 8.85035 9.15329 8.8498 9.199V10.5982C8.8498 10.691 8.88665 10.7799 8.95225 10.8455C9.01785 10.9111 9.10682 10.948 9.19959 10.948C9.29237 10.948 9.38134 10.9111 9.44694 10.8455C9.51254 10.7799 9.54939 10.691 9.54939 10.5982V10.042L11.3998 11.8959C11.4323 11.9287 11.471 11.9547 11.5137 11.9725C11.5563 11.9903 11.602 11.9994 11.6482 11.9994C11.6944 11.9994 11.7401 11.9903 11.7827 11.9725C11.8253 11.9547 11.864 11.9287 11.8965 11.8959C11.9293 11.8634 11.9553 11.8247 11.9731 11.7821C11.9909 11.7395 12 11.6938 12 11.6476C12 11.6014 11.9909 11.5557 11.9731 11.5131C11.9553 11.4704 11.9293 11.4317 11.8965 11.3992L10.0426 9.54879Z' fill='%236d6d6d'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-gateway-eventbased::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-gateway-eventbased {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Crect x='0.707107' y='8.48529' width='11' height='11' rx='0.5' transform='rotate(-45 0.707107 8.48529)' fill='white' stroke='%236d6d6d'/%3E%3Cpath d='M11.8424 7.46437L8.6989 5.0705C8.63908 5.02469 8.56691 5 8.49282 5C8.41873 5 8.34657 5.02469 8.28675 5.0705L5.14324 7.46437C5.08363 7.51001 5.03935 7.57427 5.01676 7.64793C4.99416 7.72158 4.99442 7.80084 5.0175 7.87433L6.21902 11.747C6.2427 11.8234 6.28973 11.8896 6.35286 11.9352C6.41599 11.9809 6.49169 12.0035 6.5683 11.9996H10.4348C10.5114 12.0035 10.5871 11.9809 10.6502 11.9352C10.7134 11.8896 10.7604 11.8234 10.7841 11.747L11.9856 7.87433C12.0069 7.79895 12.0045 7.71837 11.9787 7.64453C11.9529 7.5707 11.9051 7.50753 11.8424 7.46437ZM10.1833 11.2675H6.80231L5.75447 7.89996L8.49282 5.82087L11.2242 7.89996L10.1833 11.2675Z' fill='%236d6d6d'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}

/* các khối event */
.djs-popup .bpmn-icon-intermediate-event-catch-timer::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-catch-timer {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cg clip-path='url(%23clip0_26_600)'%3E%3Cpath d='M8.00008 4.66669C7.34081 4.66669 6.69635 4.86218 6.14818 5.22845C5.60002 5.59473 5.17278 6.11532 4.92048 6.72441C4.66819 7.3335 4.60218 8.00372 4.7308 8.65032C4.85942 9.29692 5.17689 9.89087 5.64306 10.357C6.10924 10.8232 6.70318 11.1407 7.34978 11.2693C7.99639 11.3979 8.66661 11.3319 9.27569 11.0796C9.88478 10.8273 10.4054 10.4001 10.7716 9.85192C11.1379 9.30376 11.3334 8.65929 11.3334 8.00002C11.3334 7.56228 11.2472 7.12883 11.0797 6.72441C10.9122 6.31999 10.6666 5.95253 10.3571 5.643C10.0476 5.33347 9.68011 5.08794 9.27569 4.92042C8.87128 4.75291 8.43782 4.66669 8.00008 4.66669ZM8.00008 10.6667C7.47267 10.6667 6.95709 10.5103 6.51856 10.2173C6.08003 9.92425 5.73824 9.50778 5.5364 9.02051C5.33457 8.53324 5.28176 7.99706 5.38466 7.47978C5.48755 6.9625 5.74152 6.48734 6.11446 6.1144C6.4874 5.74146 6.96256 5.48749 7.47984 5.38459C7.99712 5.2817 8.5333 5.33451 9.02057 5.53634C9.50784 5.73818 9.92432 6.07997 10.2173 6.5185C10.5104 6.95703 10.6667 7.4726 10.6667 8.00002C10.6667 8.70726 10.3858 9.38554 9.8857 9.88564C9.3856 10.3857 8.70733 10.6667 8.00008 10.6667ZM8.70008 7.21002L8.33342 7.42335V6.33335C8.33342 6.24495 8.2983 6.16016 8.23579 6.09765C8.17327 6.03514 8.08849 6.00002 8.00008 6.00002C7.91168 6.00002 7.82689 6.03514 7.76438 6.09765C7.70187 6.16016 7.66675 6.24495 7.66675 6.33335V8.00002C7.66675 8.00002 7.66675 8.00002 7.66675 8.02002C7.66518 8.04221 7.66518 8.06449 7.66675 8.08669C7.67191 8.10716 7.6786 8.12721 7.68675 8.14669C7.68675 8.14669 7.68675 8.14669 7.68675 8.16669C7.70267 8.19033 7.72051 8.21263 7.74008 8.23335C7.76701 8.26005 7.79866 8.28153 7.83342 8.29669H7.86008C7.9035 8.31901 7.95129 8.33153 8.00008 8.33335C8.03893 8.33224 8.07729 8.32435 8.11342 8.31002H8.14342H8.16675L9.03342 7.81002C9.11033 7.76582 9.16653 7.69287 9.18966 7.60723C9.21279 7.52159 9.20095 7.43027 9.15675 7.35335C9.11255 7.27644 9.0396 7.22024 8.95396 7.19711C8.86832 7.17398 8.777 7.18582 8.70008 7.23002V7.21002Z' fill='%236d6d6d'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_26_600'%3E%3Crect width='8' height='8' fill='white' transform='translate(4 4)'/%3E%3C/clipPath%3E%3C/defs%3E%3C/g%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}

.djs-popup .bpmn-icon-intermediate-event-catch-link::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-catch-link {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5, 5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cpath transform='scale(0.9) translate(3, 3.5)' d='M10.8568 5.41896C10.8711 5.39908 10.8838 5.3782 10.8949 5.35648L10.9372 5.27318L10.9626 5.18988C10.9722 5.16708 10.9793 5.14335 10.9838 5.11908C11.0054 5.01184 11.0054 4.90145 10.9838 4.79422C10.9793 4.76995 10.9722 4.74621 10.9626 4.72341L10.9372 4.64011L10.8949 4.55681C10.8838 4.5351 10.8711 4.51422 10.8568 4.49434C10.8266 4.44756 10.7911 4.40426 10.751 4.36523L6.52002 0.200297C6.35814 0.0638323 6.14991 -0.00747636 5.93694 0.000621226C5.72397 0.00871881 5.52195 0.0956263 5.37124 0.243977C5.22054 0.392327 5.13225 0.591193 5.12402 0.800836C5.1158 1.01048 5.18824 1.21546 5.32687 1.37481L8.11089 4.12366H0.846206C0.621778 4.12366 0.406543 4.21142 0.247848 4.36764C0.0891537 4.52385 0 4.73573 0 4.95665C0 5.17757 0.0891537 5.38944 0.247848 5.54566C0.406543 5.70187 0.621778 5.78963 0.846206 5.78963H8.11089L5.32687 8.53432C5.23829 8.609 5.16634 8.70089 5.11555 8.80424C5.06476 8.90758 5.03621 9.02014 5.03171 9.13486C5.02721 9.24958 5.04685 9.36398 5.08939 9.47087C5.13193 9.57776 5.19646 9.67484 5.27893 9.75602C5.3614 9.8372 5.46002 9.90072 5.56861 9.9426C5.6772 9.98448 5.79341 10.0038 5.90995 9.99938C6.02649 9.99495 6.14084 9.96685 6.24582 9.91685C6.35081 9.86685 6.44416 9.79603 6.52002 9.70883L10.751 5.5439C10.7908 5.50618 10.8263 5.46428 10.8568 5.41896Z' fill='%236d6d6d'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-link::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-link {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5  5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cg transform='scale(0.9) translate(-0.3, 1.2)'%3E%3Cpath transform='translate(2.5  3)' d='M8.88286 4.33516C8.8945 4.31926 8.90492 4.30256 8.91401 4.28518L8.94863 4.21855L8.9694 4.15191C8.97723 4.13367 8.98303 4.11468 8.98671 4.09526C9.00443 4.00947 9.00443 3.92116 8.98671 3.83537C8.98303 3.81596 8.97723 3.79697 8.9694 3.77873L8.94863 3.71209L8.91401 3.64545C8.90492 3.62808 8.8945 3.61137 8.88286 3.59547C8.85809 3.55805 8.82906 3.52341 8.79631 3.49218L5.33456 0.160238C5.20211 0.0510658 5.03174 -0.00598109 4.85749 0.000496981C4.68325 0.00697505 4.51796 0.076501 4.39465 0.195181C4.27135 0.313861 4.19911 0.472955 4.19238 0.640669C4.18565 0.808383 4.24492 0.972365 4.35835 1.09985L6.63618 3.29893H0.692351C0.508728 3.29893 0.332626 3.36914 0.202785 3.49411C0.0729439 3.61908 0 3.78858 0 3.96532C0 4.14206 0.0729439 4.31155 0.202785 4.43653C0.332626 4.5615 0.508728 4.63171 0.692351 4.63171H6.63618L4.35835 6.82746C4.28587 6.8872 4.22701 6.96071 4.18545 7.04339C4.14389 7.12606 4.12054 7.21612 4.11686 7.30789C4.11317 7.39966 4.12924 7.49118 4.16405 7.5767C4.19885 7.66221 4.25165 7.73988 4.31912 7.80482C4.3866 7.86976 4.46729 7.92058 4.55614 7.95408C4.64498 7.98758 4.74006 8.00305 4.83541 7.9995C4.93076 7.99596 5.02432 7.97348 5.11022 7.93348C5.19611 7.89348 5.27249 7.83683 5.33456 7.76707L8.79631 4.43512C8.82886 4.40494 8.85788 4.37142 8.88286 4.33516V4.33516Z' fill='%236d6d6d'/%3E%3Cpath transform='translate(2.5  3)' d='M11.8106 3.46052L9.0955 0.225675C9.03598 0.154166 8.96515 0.0974081 8.88712 0.0586748C8.80909 0.0199416 8.72539 0 8.64086 0C8.55632 0 8.47263 0.0199416 8.39459 0.0586748C8.31656 0.0974081 8.24574 0.154166 8.18621 0.225675C8.06694 0.36862 8 0.561988 8 0.763544C8 0.965101 8.06694 1.15847 8.18621 1.30141L10.453 4.00221L8.18621 6.703C8.06694 6.84594 8 7.03931 8 7.24087C8 7.44242 8.06694 7.63579 8.18621 7.77874C8.24604 7.84945 8.317 7.90539 8.39502 7.94336C8.47304 7.98132 8.55658 8.00057 8.64086 7.99999C8.72513 8.00057 8.80867 7.98132 8.88669 7.94336C8.96471 7.90539 9.03567 7.84945 9.0955 7.77874L11.8106 4.54389C11.8706 4.47296 11.9182 4.38858 11.9508 4.29561C11.9833 4.20264 12 4.10292 12 4.00221C12 3.90149 11.9833 3.80177 11.9508 3.7088C11.9182 3.61583 11.8706 3.53145 11.8106 3.46052Z' fill='%236d6d6d'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-intermediate-event-catch-condition::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-catch-condition {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cpath d='M7.33333 6.66669H9.33333C9.42174 6.66669 9.50652 6.63157 9.56904 6.56906C9.63155 6.50654 9.66667 6.42176 9.66667 6.33335C9.66667 6.24495 9.63155 6.16016 9.56904 6.09765C9.50652 6.03514 9.42174 6.00002 9.33333 6.00002H7.33333C7.24493 6.00002 7.16014 6.03514 7.09763 6.09765C7.03512 6.16016 7 6.24495 7 6.33335C7 6.42176 7.03512 6.50654 7.09763 6.56906C7.16014 6.63157 7.24493 6.66669 7.33333 6.66669ZM6.66667 8.00002H9.33333C9.42174 8.00002 9.50652 7.9649 9.56904 7.90239C9.63155 7.83988 9.66667 7.75509 9.66667 7.66669C9.66667 7.57828 9.63155 7.4935 9.56904 7.43099C9.50652 7.36847 9.42174 7.33335 9.33333 7.33335H6.66667C6.57826 7.33335 6.49348 7.36847 6.43096 7.43099C6.36845 7.4935 6.33333 7.57828 6.33333 7.66669C6.33333 7.75509 6.36845 7.83988 6.43096 7.90239C6.49348 7.9649 6.57826 8.00002 6.66667 8.00002ZM6.66667 9.33335H9.33333C9.42174 9.33335 9.50652 9.29824 9.56904 9.23572C9.63155 9.17321 9.66667 9.08843 9.66667 9.00002C9.66667 8.91162 9.63155 8.82683 9.56904 8.76432C9.50652 8.70181 9.42174 8.66669 9.33333 8.66669H6.66667C6.57826 8.66669 6.49348 8.70181 6.43096 8.76432C6.36845 8.82683 6.33333 8.91162 6.33333 9.00002C6.33333 9.08843 6.36845 9.17321 6.43096 9.23572C6.49348 9.29824 6.57826 9.33335 6.66667 9.33335ZM10.6667 4.66669H5.33333C5.24493 4.66669 5.16014 4.70181 5.09763 4.76432C5.03512 4.82683 5 4.91161 5 5.00002V11C5 11.0619 5.01724 11.1226 5.04978 11.1753C5.08233 11.2279 5.12889 11.2705 5.18426 11.2982C5.23963 11.3258 5.30161 11.3376 5.36327 11.332C5.42492 11.3264 5.48381 11.3038 5.53333 11.2667L6.22333 10.75L6.91 11.2667C6.9677 11.31 7.03788 11.3334 7.11 11.3334C7.18212 11.3334 7.2523 11.31 7.31 11.2667L8 10.75L8.69 11.2667C8.7477 11.31 8.81788 11.3334 8.89 11.3334C8.96212 11.3334 9.0323 11.31 9.09 11.2667L9.77667 10.75L10.4667 11.2667C10.5164 11.3038 10.5756 11.3262 10.6374 11.3315C10.6992 11.3368 10.7613 11.3248 10.8167 11.2967C10.8716 11.269 10.9179 11.2266 10.9502 11.1742C10.9826 11.1219 10.9998 11.0616 11 11V5.00002C11 4.91161 10.9649 4.82683 10.9024 4.76432C10.8399 4.70181 10.7551 4.66669 10.6667 4.66669ZM10.3333 10.3334L9.97667 10.0667C9.91897 10.0234 9.84879 10 9.77667 10C9.70454 10 9.63437 10.0234 9.57667 10.0667L8.89 10.5834L8.2 10.0667C8.1423 10.0234 8.07212 10 8 10C7.92788 10 7.8577 10.0234 7.8 10.0667L7.11 10.5834L6.42333 10.0667C6.36563 10.0234 6.29546 10 6.22333 10C6.15121 10 6.08103 10.0234 6.02333 10.0667L5.66667 10.3334V5.33335H10.3333V10.3334Z' fill='%236d6d6d'/%3E%3C/g%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-intermediate-event-catch-signal::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-catch-signal {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cg clip-path='url(%23clip0_28_733)'%3E%3Cpath d='M11.5566 9.82334L8.87324 5.15668C8.78651 5.00118 8.65984 4.87166 8.50631 4.7815C8.35277 4.69134 8.17796 4.6438 7.99991 4.6438C7.82186 4.6438 7.64704 4.69134 7.49351 4.7815C7.33998 4.87166 7.21331 5.00118 7.12657 5.15668L4.45991 9.82334C4.37017 9.97468 4.32196 10.147 4.32012 10.3229C4.31829 10.4989 4.36291 10.6722 4.44947 10.8254C4.53603 10.9785 4.66148 11.1062 4.81314 11.1954C4.9648 11.2845 5.1373 11.3321 5.31324 11.3333H10.6866C10.8639 11.3351 11.0385 11.2896 11.1925 11.2016C11.3465 11.1137 11.4744 10.9863 11.5629 10.8326C11.6514 10.6789 11.6975 10.5045 11.6964 10.3271C11.6953 10.1498 11.647 9.9759 11.5566 9.82334ZM10.9799 10.49C10.9507 10.542 10.9081 10.5852 10.8565 10.6151C10.8049 10.645 10.7462 10.6605 10.6866 10.66H5.31324C5.25361 10.6605 5.19494 10.645 5.14335 10.6151C5.09175 10.5852 5.04913 10.542 5.01991 10.49C4.99065 10.4393 4.97525 10.3819 4.97525 10.3233C4.97525 10.2648 4.99065 10.2073 5.01991 10.1567L7.68657 5.49001C7.71455 5.43541 7.75705 5.38959 7.80939 5.35759C7.86173 5.32559 7.92189 5.30866 7.98324 5.30866C8.04459 5.30866 8.10475 5.32559 8.15709 5.35759C8.20944 5.38959 8.25193 5.43541 8.27991 5.49001L10.9632 10.1567C10.9963 10.2066 11.0153 10.2646 11.0182 10.3244C11.0212 10.3842 11.0079 10.4437 10.9799 10.4967V10.49Z' fill='%236d6d6d'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_28_733'%3E%3Crect width='8' height='8' fill='white' transform='translate(4 4)'/%3E%3C/clipPath%3E%3C/defs%3E%3C/g%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-intermediate-event-catch-message::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-catch-message {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Ccircle cx='8' cy='8' r='7.5' fill='white' stroke='%236d6d6d'/%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cpath d='M10.3334 5.33331H5.66675C5.40153 5.33331 5.14718 5.43867 4.95964 5.62621C4.7721 5.81374 4.66675 6.0681 4.66675 6.33331V9.66665C4.66675 9.93186 4.7721 10.1862 4.95964 10.3738C5.14718 10.5613 5.40153 10.6666 5.66675 10.6666H10.3334C10.5986 10.6666 10.853 10.5613 11.0405 10.3738C11.2281 10.1862 11.3334 9.93186 11.3334 9.66665V6.33331C11.3334 6.0681 11.2281 5.81374 11.0405 5.62621C10.853 5.43867 10.5986 5.33331 10.3334 5.33331ZM5.66675 5.99998H10.3334C10.4218 5.99998 10.5066 6.0351 10.5691 6.09761C10.6316 6.16012 10.6667 6.24491 10.6667 6.33331L8.00008 7.95998L5.33341 6.33331C5.33341 6.24491 5.36853 6.16012 5.43105 6.09761C5.49356 6.0351 5.57834 5.99998 5.66675 5.99998ZM10.6667 9.66665C10.6667 9.75505 10.6316 9.83984 10.5691 9.90235C10.5066 9.96486 10.4218 9.99998 10.3334 9.99998H5.66675C5.57834 9.99998 5.49356 9.96486 5.43105 9.90235C5.36853 9.83984 5.33341 9.75505 5.33341 9.66665V7.09331L7.82675 8.61665C7.87742 8.6459 7.9349 8.6613 7.99342 8.6613C8.05193 8.6613 8.10941 8.6459 8.16008 8.61665L10.6667 7.09331V9.66665Z' fill='%236d6d6d'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-message::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-message {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cpath d='M11.3334 6.33335L8.00004 8.41669L4.66671 6.33335V5.50002L8.00004 7.58335L11.3334 5.50002M11.3334 4.66669H4.66671C4.20421 4.66669 3.83337 5.03752 3.83337 5.50002V10.5C3.83337 10.721 3.92117 10.933 4.07745 11.0893C4.23373 11.2456 4.44569 11.3334 4.66671 11.3334H11.3334C11.5544 11.3334 11.7663 11.2456 11.9226 11.0893C12.0789 10.933 12.1667 10.721 12.1667 10.5V5.50002C12.1667 5.03752 11.7917 4.66669 11.3334 4.66669Z' fill='%236D6D6D'/%3E%3C/g%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-escalation::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-escalation {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cpath d='M11.8742 10.2643L9.07262 4.66111C8.97263 4.46235 8.81939 4.29529 8.62999 4.17855C8.44059 4.06182 8.22248 4 8 4C7.77752 4 7.55941 4.06182 7.37001 4.17855C7.18061 4.29529 7.02737 4.46235 6.92739 4.66111L4.12578 10.2643C4.01572 10.4854 3.97654 10.7351 4.01358 10.9794C4.05061 11.2236 4.16207 11.4504 4.33274 11.629C4.50342 11.8075 4.72501 11.9291 4.96731 11.9771C5.2096 12.0251 5.46081 11.9972 5.68667 11.8973L7.83591 10.9367C7.88787 10.9149 7.94365 10.9037 8 10.9037C8.05635 10.9037 8.11213 10.9149 8.16409 10.9367L10.3133 11.8973C10.5392 11.9972 10.7904 12.0251 11.0327 11.9771C11.275 11.9291 11.4966 11.8075 11.6673 11.629C11.8379 11.4504 11.9494 11.2236 11.9864 10.9794C12.0235 10.7351 11.9843 10.4854 11.8742 10.2643ZM11.0738 11.0648C11.0166 11.1243 10.9425 11.1646 10.8616 11.1804C10.7806 11.1962 10.6968 11.1865 10.6215 11.1528L8.47227 10.1963C8.31858 10.1279 8.15222 10.0925 7.98399 10.0925C7.81576 10.0925 7.6494 10.1279 7.49571 10.1963L5.36249 11.1648C5.28763 11.1974 5.20462 11.2062 5.12458 11.1902C5.04454 11.1742 4.97131 11.1342 4.91469 11.0754C4.85808 11.0166 4.82079 10.9419 4.80783 10.8613C4.79487 10.7807 4.80686 10.6981 4.84219 10.6245L7.6438 5.02131C7.67738 4.95575 7.72841 4.90074 7.79126 4.86232C7.85411 4.8239 7.92634 4.80357 8 4.80357C8.07366 4.80357 8.14589 4.8239 8.20874 4.86232C8.27159 4.90074 8.32262 4.95575 8.3562 5.02131L11.1578 10.6245C11.194 10.6978 11.2069 10.7805 11.1948 10.8613C11.1826 10.9422 11.146 11.0174 11.0898 11.0768L11.0738 11.0648Z' fill='%236d6d6d'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-signal::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-signal {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cpath d='M11.5999 11H4.40007C4.32985 11 4.26086 10.9816 4.20004 10.9466C4.13923 10.9116 4.08872 10.8613 4.05361 10.8006C4.01849 10.74 4 10.6712 4 10.6012C4 10.5312 4.01848 10.4624 4.05359 10.4018L7.65352 4.18519C7.69149 4.12824 7.74299 4.08153 7.80344 4.04922C7.86389 4.01691 7.93141 4 8 4C8.06859 4 8.13611 4.01691 8.19656 4.04922C8.25701 4.08153 8.30851 4.12824 8.34648 4.18519L11.9464 10.4018C11.9815 10.4624 12 10.5312 12 10.6012C12 10.6712 11.9815 10.74 11.9464 10.8006C11.9113 10.8613 11.8608 10.9116 11.8 10.9466C11.7391 10.9816 11.6702 11 11.5999 11Z' fill='%236d6d6d'/%3E%3C/g%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-compensation::before {
    content: '' !important;
}
.djs-popup .bpmn-icon-intermediate-event-throw-compensation {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.5) translate(5 5)'%3E%3Ccircle cx='8' cy='8' r='7.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Ccircle cx='8' cy='8' r='6.75' fill='white' stroke='%236d6d6d' stroke-width='0.5'/%3E%3Cpath d='M9.80285 9.8125C10.0689 10.0625 10.4679 10.0625 10.734 9.8125C11 9.5625 11 9.1875 10.734 8.9375L9.27078 7.5L10.8005 6.0625C10.9335 5.9375 11 5.8125 11 5.625C11 5.25 10.734 5 10.3349 5C10.1354 5 10.0024 5.0625 9.86936 5.1875L7.87411 7.0625C7.60808 7.3125 7.60808 7.6875 7.87411 7.9375L9.80285 9.8125ZM4.14964 7.9375L6.14489 9.8125C6.41093 10.0625 6.80998 10.0625 7.07601 9.8125C7.34204 9.5625 7.34204 9.1875 7.07601 8.9375L5.54632 7.5L7.07601 6.0625C7.20903 5.9375 7.27553 5.8125 7.27553 5.625C7.27553 5.25 7.0095 5 6.61045 5C6.41093 5 6.27791 5.0625 6.14489 5.1875L4.14964 7.0625C3.95012 7.3125 3.95012 7.6875 4.14964 7.9375Z' fill='%236d6d6d'/%3E%3C/g%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}
/* .bpmn-icon-start-event-condition:hover {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='scale(0.35) translate(10, 5)'%3E%3Cpath d='M17.3017 7.39252V7.44162L17.3174 7.48815C17.3408 7.55798 17.3574 7.62994 17.3667 7.70299V7.70319V7.70349V7.7038V7.7041V7.7044V7.7047V7.705V7.7053V7.70559V7.70589V7.70618V7.70647V7.70677V7.70706V7.70734V7.70763V7.70792V7.7082V7.70848V7.70877V7.70905V7.70933V7.7096V7.70988V7.71016V7.71043V7.7107V7.71098V7.71125V7.71152V7.71178V7.71205V7.71232V7.71258V7.71284V7.7131V7.71337V7.71362V7.71388V7.71414V7.7144V7.71465V7.7149V7.71516V7.71541V7.71566V7.7159V7.71615V7.7164V7.71664V7.71689V7.71713V7.71737V7.71761V7.71785V7.71809V7.71832V7.71856V7.71879V7.71903V7.71926V7.71949V7.71972V7.71995V7.72017V7.7204V7.72062V7.72085V7.72107V7.72129V7.72151V7.72173V7.72195V7.72217V7.72238V7.7226V7.72281V7.72302V7.72324V7.72345V7.72366V7.72386V7.72407V7.72428V7.72448V7.72468V7.72489V7.72509V7.72529V7.72549V7.72569V7.72588V7.72608V7.72628V7.72647V7.72666V7.72686V7.72705V7.72724V7.72742V7.72761V7.7278V7.72798V7.72817V7.72835V7.72854V7.72872V7.7289V7.72908V7.72926V7.72943V7.72961V7.72978V7.72996V7.73013V7.73031V7.73048V7.73065V7.73082V7.73099V7.73115V7.73132V7.73148V7.73165V7.73181V7.73198V7.73214V7.7323V7.73246V7.73262V7.73277V7.73293V7.73309V7.73324V7.7334V7.73355V7.7337V7.73385V7.734V7.73415V7.7343V7.73445V7.73459V7.73474V7.73488V7.73503V7.73517V7.73531V7.73545V7.73559V7.73573V7.73587V7.73601V7.73614V7.73628V7.73641V7.73655V7.73668V7.73681V7.73694V7.73707V7.7372V7.73733V7.73746V7.73759V7.73771V7.73784V7.73796V7.73809V7.73821V7.73833V7.73845V7.73857V7.73869V7.73881V7.73893V7.73904V7.73916V7.73927V7.73939V7.7395V7.73961V7.73973V7.73984V7.73995V7.74006V7.74017V7.74027V7.74038V7.74049V7.74059V7.7407V7.7408V7.7409V7.74101V7.74111V7.74121V7.74131V7.74141V7.74151V7.74161V7.7417V7.7418V7.74189V7.74199V7.74208V7.74218V7.74227V7.74236V7.74245V7.74254V7.74263V7.74272V7.74281V7.7429V7.74298V7.74307V7.74316V7.74324V7.74333V7.74341V7.74349V7.74357V7.74365V7.74373V7.74381V7.74389V7.74397V7.74405V7.74413V7.7442V7.74428V7.74436V7.74443V7.7445V7.74458V7.74465V7.74472V7.74479V7.74486V7.74493V7.745V7.74507V7.74514V7.74521V7.74527V7.74534V7.74541V7.74547V7.74553V7.7456V7.74566V7.74572V7.74579V7.74585V7.74591V7.74597V7.74603V7.74609V7.74615V7.7462V7.74626V7.74632V7.74637V7.74643V7.74648V7.74654V7.74659V7.74665V7.7467V7.74675V7.7468V7.74685V7.7469V7.74695V7.747V7.74705V7.7471V7.74715V7.7472V7.74724V7.74729V7.74733V7.74738V7.74742V7.74747V7.74751V7.74756V7.7476V7.74764V7.74768V7.74772V7.74776V7.7478V7.74784V7.74788V7.74792V7.74796V7.748V7.74804V7.74807V7.74811V7.74815V7.74818V7.74822V7.74825V7.74829V7.74832V7.74835V7.74839V7.74842V7.74845V7.74848V7.74851V7.74854V7.74857V7.7486V7.74863V7.74866V7.74869V7.74872V7.74875V7.74877V7.7488V7.74883V7.74885V7.74888V7.74891V7.74893V7.74896V7.74898V7.749V7.74903V7.74905V7.74907V7.7491V7.74912V7.74914V7.74916V7.74918V7.7492V7.74922V7.74924V7.74926V7.74928V7.7493V7.74932V7.74934V7.74936V7.74938V7.74939V7.74941V7.74943V7.74944V7.74946V7.74948V7.74949V7.74951V7.74952V7.74954V7.74956V7.74959V7.74962V7.74964V7.74967V7.74969V7.74971V7.74973V7.74975V7.74977V7.74979V7.74981V7.74982V7.74984V7.74985V7.74987V7.74989V7.74991V7.74993V7.74994V7.74996V7.74998V7.74999V7.75002V18.5834C17.3667 19.3657 17.0559 20.1161 16.5027 20.6693C15.9494 21.2225 15.1991 21.5334 14.4167 21.5334H3.58337C2.80099 21.5334 2.05064 21.2225 1.49741 20.6693C0.944177 20.1161 0.633374 19.3657 0.633374 18.5834V3.41669C0.633374 2.6343 0.944177 1.88395 1.49741 1.33072C2.05064 0.77749 2.80099 0.466687 3.58337 0.466687H10.0983L10.3975 0.56956L10.4449 0.585854H10.495H10.5206C10.5807 0.619461 10.6367 0.660217 10.6872 0.707281L17.1803 7.20034C17.2273 7.25086 17.2681 7.30682 17.3017 7.36697V7.39252ZM11.3788 3.64872L10.8667 3.13659V3.86085V6.66669V6.96669H11.1667H13.9725H14.6968L14.1847 6.45455L11.3788 3.64872ZM2.60521 19.5615L2.81734 19.3494L2.60521 19.5615C2.86464 19.8209 3.21649 19.9667 3.58337 19.9667H14.4167C14.7836 19.9667 15.1354 19.8209 15.3949 19.5615C15.6543 19.3021 15.8 18.9502 15.8 18.5834V8.83335V8.53335H15.5H10.0834C9.87562 8.53335 9.67638 8.45082 9.52947 8.30392C9.38257 8.15702 9.30004 7.95777 9.30004 7.75002V2.33335V2.03335H9.00004H3.58337C3.21649 2.03335 2.86463 2.1791 2.60521 2.43852C2.34578 2.69795 2.20004 3.0498 2.20004 3.41669V18.5834C2.20004 18.9502 2.34578 19.3021 2.60521 19.5615Z' fill='%23FF7400' stroke='white' stroke-width='0.6'/%3E%3C/g%3E%3C/svg%3E ") !important;
    background-repeat: no-repeat !important;
} */
/* set màu icon popUp */
.djs-palette .entry {
    color: #6d6d6d;
}

.djs-popup .entry::before {
    color: #6d6d6d;
}
.custom-button-context-pad {
    width: 22px !important;
    background-image: url("data:image/svg+xml,%3Csvg width='33' height='33' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' rx='2' fill='white'/%3E%3Cpath d='M7.9999 9.875C8.59157 9.875 9.09365 9.66875 9.50615 9.25625C9.91865 8.84375 10.1249 8.34167 10.1249 7.75C10.1249 7.15833 9.91865 6.65625 9.50615 6.24375C9.09365 5.83125 8.59157 5.625 7.9999 5.625C7.40824 5.625 6.90615 5.83125 6.49365 6.24375C6.08115 6.65625 5.8749 7.15833 5.8749 7.75C5.8749 8.34167 6.08115 8.84375 6.49365 9.25625C6.90615 9.66875 7.40824 9.875 7.9999 9.875ZM7.9999 9.15C7.60824 9.15 7.27699 9.01458 7.00615 8.74375C6.73532 8.47292 6.5999 8.14167 6.5999 7.75C6.5999 7.35833 6.73532 7.02708 7.00615 6.75625C7.27699 6.48542 7.60824 6.35 7.9999 6.35C8.39157 6.35 8.72282 6.48542 8.99365 6.75625C9.26449 7.02708 9.3999 7.35833 9.3999 7.75C9.3999 8.14167 9.26449 8.47292 8.99365 8.74375C8.72282 9.01458 8.39157 9.15 7.9999 9.15ZM7.9999 11.5C6.8499 11.5 5.80199 11.1875 4.85615 10.5625C3.91032 9.9375 3.17907 9.1125 2.6624 8.0875C2.6374 8.04583 2.61865 7.99583 2.60615 7.9375C2.59365 7.87917 2.5874 7.81667 2.5874 7.75C2.5874 7.68333 2.59365 7.62083 2.60615 7.5625C2.61865 7.50417 2.6374 7.45417 2.6624 7.4125C3.17907 6.3875 3.91032 5.5625 4.85615 4.9375C5.80199 4.3125 6.8499 4 7.9999 4C9.1499 4 10.1978 4.3125 11.1437 4.9375C12.0895 5.5625 12.8207 6.3875 13.3374 7.4125C13.3624 7.45417 13.3812 7.50417 13.3937 7.5625C13.4062 7.62083 13.4124 7.68333 13.4124 7.75C13.4124 7.81667 13.4062 7.87917 13.3937 7.9375C13.3812 7.99583 13.3624 8.04583 13.3374 8.0875C12.8207 9.1125 12.0895 9.9375 11.1437 10.5625C10.1978 11.1875 9.1499 11.5 7.9999 11.5ZM7.9999 10.75C9.00824 10.75 9.93532 10.4771 10.7812 9.93125C11.627 9.38542 12.2707 8.65833 12.7124 7.75C12.2707 6.84167 11.627 6.11458 10.7812 5.56875C9.93532 5.02292 9.00824 4.75 7.9999 4.75C6.99157 4.75 6.06449 5.02292 5.21865 5.56875C4.37282 6.11458 3.7249 6.84167 3.2749 7.75C3.7249 8.65833 4.37282 9.38542 5.21865 9.93125C6.06449 10.4771 6.99157 10.75 7.9999 10.75Z' fill='%236D6D6D'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    cursor: pointer;
}
.custom-button-context-pad:hover {
    width: 22px !important;
    background-image: url("data:image/svg+xml,%3Csvg width='33' height='33' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' rx='2' fill='white'/%3E%3Cpath d='M7.9999 9.875C8.59157 9.875 9.09365 9.66875 9.50615 9.25625C9.91865 8.84375 10.1249 8.34167 10.1249 7.75C10.1249 7.15833 9.91865 6.65625 9.50615 6.24375C9.09365 5.83125 8.59157 5.625 7.9999 5.625C7.40824 5.625 6.90615 5.83125 6.49365 6.24375C6.08115 6.65625 5.8749 7.15833 5.8749 7.75C5.8749 8.34167 6.08115 8.84375 6.49365 9.25625C6.90615 9.66875 7.40824 9.875 7.9999 9.875ZM7.9999 9.15C7.60824 9.15 7.27699 9.01458 7.00615 8.74375C6.73532 8.47292 6.5999 8.14167 6.5999 7.75C6.5999 7.35833 6.73532 7.02708 7.00615 6.75625C7.27699 6.48542 7.60824 6.35 7.9999 6.35C8.39157 6.35 8.72282 6.48542 8.99365 6.75625C9.26449 7.02708 9.3999 7.35833 9.3999 7.75C9.3999 8.14167 9.26449 8.47292 8.99365 8.74375C8.72282 9.01458 8.39157 9.15 7.9999 9.15ZM7.9999 11.5C6.8499 11.5 5.80199 11.1875 4.85615 10.5625C3.91032 9.9375 3.17907 9.1125 2.6624 8.0875C2.6374 8.04583 2.61865 7.99583 2.60615 7.9375C2.59365 7.87917 2.5874 7.81667 2.5874 7.75C2.5874 7.68333 2.59365 7.62083 2.60615 7.5625C2.61865 7.50417 2.6374 7.45417 2.6624 7.4125C3.17907 6.3875 3.91032 5.5625 4.85615 4.9375C5.80199 4.3125 6.8499 4 7.9999 4C9.1499 4 10.1978 4.3125 11.1437 4.9375C12.0895 5.5625 12.8207 6.3875 13.3374 7.4125C13.3624 7.45417 13.3812 7.50417 13.3937 7.5625C13.4062 7.62083 13.4124 7.68333 13.4124 7.75C13.4124 7.81667 13.4062 7.87917 13.3937 7.9375C13.3812 7.99583 13.3624 8.04583 13.3374 8.0875C12.8207 9.1125 12.0895 9.9375 11.1437 10.5625C10.1978 11.1875 9.1499 11.5 7.9999 11.5ZM7.9999 10.75C9.00824 10.75 9.93532 10.4771 10.7812 9.93125C11.627 9.38542 12.2707 8.65833 12.7124 7.75C12.2707 6.84167 11.627 6.11458 10.7812 5.56875C9.93532 5.02292 9.00824 4.75 7.9999 4.75C6.99157 4.75 6.06449 5.02292 5.21865 5.56875C4.37282 6.11458 3.7249 6.84167 3.2749 7.75C3.7249 8.65833 4.37282 9.38542 5.21865 9.93125C6.06449 10.4771 6.99157 10.75 7.9999 10.75Z' fill='%23ef7600'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    cursor: pointer;
}
.custom-button-context-pad-for-read-only {
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 11.875C10.5917 11.875 11.0938 11.6687 11.5063 11.2562C11.9188 10.8438 12.125 10.3417 12.125 9.75C12.125 9.15833 11.9188 8.65625 11.5063 8.24375C11.0938 7.83125 10.5917 7.625 10 7.625C9.40836 7.625 8.90627 7.83125 8.49377 8.24375C8.08127 8.65625 7.87502 9.15833 7.87502 9.75C7.87502 10.3417 8.08127 10.8438 8.49377 11.2562C8.90627 11.6687 9.40836 11.875 10 11.875ZM10 11.15C9.60836 11.15 9.27711 11.0146 9.00627 10.7438C8.73544 10.4729 8.60002 10.1417 8.60002 9.75C8.60002 9.35833 8.73544 9.02708 9.00627 8.75625C9.27711 8.48542 9.60836 8.35 10 8.35C10.3917 8.35 10.7229 8.48542 10.9938 8.75625C11.2646 9.02708 11.4 9.35833 11.4 9.75C11.4 10.1417 11.2646 10.4729 10.9938 10.7438C10.7229 11.0146 10.3917 11.15 10 11.15ZM10 13.5C8.85002 13.5 7.80211 13.1875 6.85627 12.5625C5.91044 11.9375 5.17919 11.1125 4.66252 10.0875C4.63752 10.0458 4.61877 9.99583 4.60627 9.9375C4.59377 9.87917 4.58752 9.81667 4.58752 9.75C4.58752 9.68333 4.59377 9.62083 4.60627 9.5625C4.61877 9.50417 4.63752 9.45417 4.66252 9.4125C5.17919 8.3875 5.91044 7.5625 6.85627 6.9375C7.80211 6.3125 8.85002 6 10 6C11.15 6 12.1979 6.3125 13.1438 6.9375C14.0896 7.5625 14.8209 8.3875 15.3375 9.4125C15.3625 9.45417 15.3813 9.50417 15.3938 9.5625C15.4063 9.62083 15.4125 9.68333 15.4125 9.75C15.4125 9.81667 15.4063 9.87917 15.3938 9.9375C15.3813 9.99583 15.3625 10.0458 15.3375 10.0875C14.8209 11.1125 14.0896 11.9375 13.1438 12.5625C12.1979 13.1875 11.15 13.5 10 13.5ZM10 12.75C11.0084 12.75 11.9354 12.4771 12.7813 11.9313C13.6271 11.3854 14.2709 10.6583 14.7125 9.75C14.2709 8.84167 13.6271 8.11458 12.7813 7.56875C11.9354 7.02292 11.0084 6.75 10 6.75C8.99169 6.75 8.06461 7.02292 7.21877 7.56875C6.37294 8.11458 5.72502 8.84167 5.27502 9.75C5.72502 10.6583 6.37294 11.3854 7.21877 11.9313C8.06461 12.4771 8.99169 12.75 10 12.75Z' fill='%23EF7600'/%3E%3Crect x='0.25' y='0.25' width='19.5' height='19.5' rx='3.75' stroke='%23EF7600' stroke-width='0.5'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}
.custom-button-context-pad-for-read-only:hover {
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.25' y='0.25' width='19.5' height='19.5' rx='3.75' stroke='%23EF7600' fill='%23f2f2f2' stroke-width='0.5'/%3E%3Cpath d='M10 11.875C10.5917 11.875 11.0938 11.6687 11.5063 11.2562C11.9188 10.8438 12.125 10.3417 12.125 9.75C12.125 9.15833 11.9188 8.65625 11.5063 8.24375C11.0938 7.83125 10.5917 7.625 10 7.625C9.40836 7.625 8.90627 7.83125 8.49377 8.24375C8.08127 8.65625 7.87502 9.15833 7.87502 9.75C7.87502 10.3417 8.08127 10.8438 8.49377 11.2562C8.90627 11.6687 9.40836 11.875 10 11.875ZM10 11.15C9.60836 11.15 9.27711 11.0146 9.00627 10.7438C8.73544 10.4729 8.60002 10.1417 8.60002 9.75C8.60002 9.35833 8.73544 9.02708 9.00627 8.75625C9.27711 8.48542 9.60836 8.35 10 8.35C10.3917 8.35 10.7229 8.48542 10.9938 8.75625C11.2646 9.02708 11.4 9.35833 11.4 9.75C11.4 10.1417 11.2646 10.4729 10.9938 10.7438C10.7229 11.0146 10.3917 11.15 10 11.15ZM10 13.5C8.85002 13.5 7.80211 13.1875 6.85627 12.5625C5.91044 11.9375 5.17919 11.1125 4.66252 10.0875C4.63752 10.0458 4.61877 9.99583 4.60627 9.9375C4.59377 9.87917 4.58752 9.81667 4.58752 9.75C4.58752 9.68333 4.59377 9.62083 4.60627 9.5625C4.61877 9.50417 4.63752 9.45417 4.66252 9.4125C5.17919 8.3875 5.91044 7.5625 6.85627 6.9375C7.80211 6.3125 8.85002 6 10 6C11.15 6 12.1979 6.3125 13.1438 6.9375C14.0896 7.5625 14.8209 8.3875 15.3375 9.4125C15.3625 9.45417 15.3813 9.50417 15.3938 9.5625C15.4063 9.62083 15.4125 9.68333 15.4125 9.75C15.4125 9.81667 15.4063 9.87917 15.3938 9.9375C15.3813 9.99583 15.3625 10.0458 15.3375 10.0875C14.8209 11.1125 14.0896 11.9375 13.1438 12.5625C12.1979 13.1875 11.15 13.5 10 13.5ZM10 12.75C11.0084 12.75 11.9354 12.4771 12.7813 11.9313C13.6271 11.3854 14.2709 10.6583 14.7125 9.75C14.2709 8.84167 13.6271 8.11458 12.7813 7.56875C11.9354 7.02292 11.0084 6.75 10 6.75C8.99169 6.75 8.06461 7.02292 7.21877 7.56875C6.37294 8.11458 5.72502 8.84167 5.27502 9.75C5.72502 10.6583 6.37294 11.3854 7.21877 11.9313C8.06461 12.4771 8.99169 12.75 10 12.75Z' fill='%23EF7600'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
}
.hover > .djs-hit-all {
    width: 130px !important;
}
.djs-element.force-hover .djs-outline,
.djs-element.selected .djs-outline {
    visibility: visible;
    shape-rendering: crispEdges;
    stroke-dasharray: 3, 3;
}

.djs-element.force-hover .djs-outline {
    stroke: #ff8888;
    stroke-width: 1px;
}

.bpmn-icon-end-event-message,
.bpmn-icon-end-event-error,
.bpmn-icon-end-event-compensation,
.bpmn-icon-end-event-signal {
    display: none;
}
</style>
<style scoped>
.read-only-modeler >>> .djs-hit:active {
    pointer-events: none !important;
}
</style>
