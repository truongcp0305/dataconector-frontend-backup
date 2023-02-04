<template>
    <div
        class="symper-tracking-workflow-definition w-100 h-100"
        :style="{
            position: 'relative',
            overflow: 'hidden'
        }"
    >
        <Preloader style="z-index: 0" v-show="loadingData" />
        <div
            :class="{
                'symper-bpm-canvas-heat-map d-block': true,
                hidden: useHeatMap && hideHeatMap,
                'position-absolute': !hideHeatMap
            }"
            ref="heatmapCanvasWrapper"
        ></div>
        <symper-bpmn
            ref="symperBpmn"
            :height="height"
            :width="width"
            :readOnly="true"
            :customModules="customRender"
        ></symper-bpmn>
    </div>
</template>

<script>
import SymperBpmn from '@/components/common/SymperBpmn.vue';
import CustomRenderProcessCount from '@/components/process/CustomRenderProcessCount';
import BPMNEngine from '../../api/BPMNEngine';
import { cleanXMLBeforeRenderInEditor } from '@/components/process/processAction.js';
import h337 from 'heatmap.js';
import { adminApi } from '@/api/Admin.js';
import Preloader from '@/components/common/Preloader';
export default {
    data() {
        return {
            loadingData: true,
            diagramHeight: 200,
            customRender: [
                {
                    __init__: ['customRenderer'],
                    customRenderer: ['type', CustomRenderProcessCount]
                }
            ],
            heatmap: null,
            heatmapElement: null,
            hideHeatMap: true,
            pointRadius: 20,
            countInstancePerNode: null
        };
    },
    watch: {
        procesDefId() {
            this.reRender();
        },
        loadingData: {
            handler: function (vl) {
                this.$emit('hide-loading');
            }
        }
    },
    computed: {},
    created() {
        this.render();
    },
    methods: {
        clearHeatmap() {
            if (this.heatmap) {
                this.heatmap.removeData();
            }
        },
        reRender() {
            this.clearHeatmap();
            $(this.$refs.heatmapCanvasWrapper).html('');
            this.countInstancePerNode = null;
            this.hideHeatMap = true;
            this.render();
        },
        translateCoordinates(xml) {
            xml = xml.replace(/\n|\r\n/g, ' ');
            let displaySection = xml.match(
                /<bpmndi:BPMNDiagram(.*?)<\/bpmndi:BPMNDiagram>/g
            )[0];
            let oldDisplaySection = displaySection;

            let minX = 0;
            let minY = 0;
            let x, y;
            let map = {
                x: {},
                y: {}
            };

            let xCoords = displaySection.match(/ x="([0-9\-]+)"/g);
            for (let coord of xCoords) {
                if (!map.x.hasOwnProperty(coord)) {
                    x = Number(coord.slice(4, coord.length - 1));
                    minX = Math.min(x, minX);
                    map.x[coord] = x;
                }
            }

            let yCoords = displaySection.match(/ y="([0-9\-]+)"/g);
            for (let coord of yCoords) {
                if (!map.y.hasOwnProperty(coord)) {
                    y = Number(coord.slice(4, coord.length - 1));
                    minY = Math.min(y, minY);
                    map.y[coord] = y;
                }
            }

            if (minX < 0) {
                minX -= this.pointRadius;
                for (let coord in map.x) {
                    let newX = map.x[coord] - minX;
                    newX = ` x="${newX}s_s_s_s"`;
                    displaySection = displaySection.replace(
                        new RegExp(coord, 'g'),
                        newX
                    );
                }
            }

            if (minY < 0) {
                for (let coord in map.y) {
                    let newY = map.y[coord] - minY;
                    newY = ` y="${newY}s_s_s_s"`;
                    displaySection = displaySection.replace(
                        new RegExp(coord, 'g'),
                        newY
                    );
                }
            }

            let newDisplaySection = displaySection.replace(
                new RegExp('s_s_s_s', 'g'),
                ''
            );
            let newXml = xml.replace(oldDisplaySection, newDisplaySection);
            return newXml;
        },
        async render() {
            this.loadingData = true;
            this.hideHeatMap = true;
            let xml = await BPMNEngine.getXMLFromProcessDefId(this.procesDefId);
            xml = this.translateCoordinates(xml);
            await this.$refs.symperBpmn.renderFromXML(xml);
            let model = this.procesDefId.split(':')[0];
            let countNodeInstance = await adminApi.trackingProcess(model);
            this.$refs.symperBpmn.focus();
            this.countInstancePerNode = countNodeInstance.data;

            let symBpmn = this.$refs.symperBpmn;
            let mapNodeToInstanceCount = {};
            let maxValue = 0;
            for (let el of this.countInstancePerNode) {
                symBpmn.updateElementProperties(el.act_id_, {
                    countEnd: el.count_end,
                    countRunning: el.count_running
                });
                let total = Number(el.count_end) + Number(el.count_running);
                mapNodeToInstanceCount[el.act_id_] = total;
                maxValue = total > maxValue ? total : maxValue;
            }
            this.maxValue = maxValue;
            this.mapNodeToInstanceCount = mapNodeToInstanceCount;
            let self = this;
            setTimeout(
                (self) => {
                    self.drawHeatMap();
                    self.hideHeatMap = false;

                    self.watchViewportChange();
                    self.rePositionHeatmap($(self.$el).find('.viewport')[0]);
                    this.loadingData = false;
                },
                100,
                this
            );
        },
        drawHeatMap() {
            this.initHeatmap();
            let bpmnElements = this.$refs.symperBpmn.getAllNodes(false);
            let statsElemente = this.mapNodeToInstanceCount;
            let allMarkPoints = [];
            let mapElements = bpmnElements.reduce((map, el) => {
                map[el.id] = el;
                if (el.type == 'bpmn:SequenceFlow') {
                    allMarkPoints = allMarkPoints.concat(el.waypoints);
                } else {
                    allMarkPoints.push(el);
                }
                return map;
            }, {});
            let points = [];
            let r = this.pointRadius;
            for (let idEl in statsElemente) {
                let weight = statsElemente[idEl];
                if (mapElements[idEl]) {
                    let el = mapElements[idEl];
                    let dots = [];
                    if (el.type == 'bpmn:SequenceFlow') {
                        dots = this.getDotsOnPath(el.waypoints, r / 2, weight);
                    } else {
                        dots = this.getDotsInRect(
                            el.businessObject.di.bounds,
                            r / 2,
                            weight
                        );
                    }
                    points = points.concat(dots);
                }
                // else if(el.type.includes('Task')){
                //     dots = this.getDotsInRect(el.businessObject.di.bounds, r/2, weight);
                // }else if(el.type.includes('Gateway')){
                //     dots = this.getDotsInRect(el.businessObject.di.bounds, r/2, weight);
                // }else if(el.type.includes('Event')){
                //     dots = this.getDotsInRect(el.businessObject.di.bounds, r/2, weight);
                // }else if(el.type.includes('Event')){
                //     dots = this.getDotsInRect(el.businessObject.di.bounds, r/2, weight);
                // }
            }

            this.heatmap.setData({
                max: this.maxValue * 2.5,
                data: points
            });
        },
        rePositionHeatmap(viewportDOM) {
            let transformValue = $(viewportDOM)
                .attr('transform')
                .replace(/\s+/g, ',');
            this.$refs.heatmapCanvasWrapper.style.transform = transformValue;
        },
        watchViewportChange() {
            let self = this;
            let observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutationRecord) {
                    self.rePositionHeatmap(mutationRecord.target);
                });
            });

            let target = $(this.$el).find('.viewport')[0];
            observer.observe(target, {
                attributes: true,
                attributeFilter: ['transform']
            });
        },
        addHeatMapDataPoint: function (coord, wertung, arr) {
            let data = {
                x: coord.x,
                y: coord.y,
                value: wertung
            };
            arr.push(data);
            return arr;
        },
        initHeatmap() {
            let viewport = $(this.$el).find('g.viewport')[0];
            let viewportSize = viewport.getBoundingClientRect();

            let diagramHeight = viewportSize.height * 5;
            let diagramWidth = viewportSize.width * 5;
            this.heatmapElement = $(this.$refs.heatmapCanvasWrapper)
                .width(diagramWidth)
                .height(diagramHeight);
            var config = {
                radius: this.pointRadius,
                visible: true,
                container: this.$refs.heatmapCanvasWrapper
            };
            this.heatmap = h337.create(config);
        },
        getCoordinates: function (elem) {
            return {
                x: elem.bounds.x / 1 + elem.bounds.width / 2,
                y: elem.bounds.y / 1 + elem.bounds.height / 2
            };
        },
        getDotsInRect(bounds, distance, weight) {
            let dots = [];
            let r = 0;
            let ySegmentCount = Math.floor(bounds.height / distance);
            for (let i = 1; i < ySegmentCount; i++) {
                let startPoint = {
                    x: bounds.x,
                    y: bounds.y + i * distance + r / 2
                };

                let endPoint = {
                    x: bounds.x + bounds.width,
                    y: bounds.y + i * distance + r / 2
                };

                dots = dots.concat(
                    this.getDotsBetweenTwoPoints(
                        startPoint,
                        endPoint,
                        distance,
                        weight
                    )
                );
            }
            let dotsForUpperBound = this.getDotsBetweenTwoPoints(
                {
                    x: bounds.x,
                    y: bounds.y
                },
                {
                    x: bounds.x + bounds.width,
                    y: bounds.y
                },
                distance,
                weight / 2
            );

            let dotsForBottomBound = this.getDotsBetweenTwoPoints(
                {
                    x: bounds.x,
                    y: bounds.y + bounds.height
                },
                {
                    x: bounds.x + bounds.width,
                    y: bounds.y + bounds.height
                },
                distance,
                weight / 2
            );
            dots = dots.concat(dotsForUpperBound, dotsForBottomBound);
            return dots;
        },
        getDotsOnPath(wayPoints, distance, weight) {
            let dots = [];
            for (let i = 1; i < wayPoints.length; i++) {
                let startPoint = wayPoints[i - 1];
                let endPoint = wayPoints[i];
                dots = dots.concat(
                    this.getDotsBetweenTwoPoints(
                        startPoint,
                        endPoint,
                        distance / 2,
                        weight,
                        false
                    )
                );
            }
            // dots = dots.concat(dots);
            return dots;
        },
        /**
         * Lấy ra các điểm nằm trên đường thẳng nối hai điểm startPoint, endPoint
         * sao cho mỗi điểm nằm cách nhau một khoảng bằng distance
         *
         */
        getDotsBetweenTwoPoints(
            startPoint,
            endPoint,
            distance,
            weight,
            includeTwoPoint = true
        ) {
            let xLength = Math.abs(startPoint.x - endPoint.x);
            let yLength = Math.abs(startPoint.y - endPoint.y);

            let lineSegmentLength = Math.sqrt(xLength ** 2 + yLength ** 2);
            let dotCount = Math.floor(lineSegmentLength / distance);
            let dots = [];
            let { a, b } = this.getCoefficient(startPoint, endPoint);

            if (a === undefined) {
                let stepY = yLength / dotCount;
                let startY = Math.min(startPoint.y, endPoint.y);
                dotCount = includeTwoPoint ? dotCount : dotCount - 1;

                let startI = includeTwoPoint ? 0 : 1;
                for (let i = startI; i <= dotCount; i++) {
                    dots.push({
                        x: startPoint.x,
                        y: startY + i * stepY,
                        value: weight
                    });
                }
            } else {
                let stepX = xLength / dotCount;
                let startX = Math.min(startPoint.x, endPoint.x);
                dotCount = includeTwoPoint ? dotCount : dotCount - 1;

                let startI = includeTwoPoint ? 0 : 1;
                for (let i = startI; i <= dotCount; i++) {
                    let x = startX + i * stepX;
                    dots.push({
                        x: x,
                        y: a * x + b,
                        value: weight
                    });
                }
            }

            return dots;
        },
        /**
         * Lấy hệ số a, b khi biết hai điểm tạo nên đường thằng
         */
        getCoefficient(p1, p2) {
            if (p2.x == p1.x) {
                return {
                    b: 0,
                    a: undefined
                };
            } else {
                let a = (p2.y - p1.y) / (p2.x - p1.x);
                let b = p1.y - a * p1.x;
                return { a, b };
            }
        }
    },
    props: {
        procesDefId: {
            type: String,
            default: ''
        },
        useHeatMap: {
            type: Boolean,
            default: false
        },
        showNodeCount: {
            type: Boolean,
            default: false
        },
        height: {
            type: Number,
            default: 600
        },
        width: {
            type: Number,
            default: 600
        }
    },
    components: {
        SymperBpmn,
        Preloader
    }
};
</script>

<style>
.symper-bpm-canvas-heat-map,
.symper-bpm-canvas-heat-map canvas {
    transform-origin: 0px 0px !important;
}
</style>
<style scoped>
.symper-tracking-workflow-definition >>> .djs-hit {
    pointer-events: none !important;
}
</style>
