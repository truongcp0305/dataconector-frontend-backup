import { util } from '@/plugins/util';
import {
    calcTitleCellHeight,
    getDefaultSeriesColor,
} from '@/components/dashboard/configPool/dashboardConfigs.js';
import dayjs from 'dayjs';
export const staticChartOptions = {
    lang: {
        numericSymbols: ['K', 'M', 'B', 'T', 'P', 'E'],
        thousandsSep: ',',
    },
    chart: {
        height: null,
        width: null,
        style: {
            fontFamily: 'roboto',
        },
    },
    title: {
        text: '',
    },
    xAxis: {
        labels: {
            autoRotation: [-45, -90],
        },
    },
};
const yAxisValueFormatter = {
    none: () => {
        return eval('this.value;');
    },
    thousands: () => {
        return eval("(this.value/1000)+'K'");
    },
    milions: () => {
        return eval("(this.value/1000000)+'M'");
    },
    bilions: () => {
        return eval("(this.value/1000000000)+'B'");
    },
    trilions: () => {
        return eval("(this.value/1000000000000)+'T'");
    },
};
function convertDateToTimestamp(date) {
    if (!date) {
        return;
    }
    var newDate = new Date(date);
    return newDate.getTime();
}
export const TranslatorHelper = {
    Charts: {
        /**
         * Chuyển đổi cấu hình cho loại pie chart
         * @param {Array} data Mảng dữ liệu của chart
         * @param {Object} columns Cấu hình các cột
         * @param {Object} style Cấu hình hiển thị
         * @param {Object} isDonut Loại chart donut false of true
         */
        pie(data, columns, style, isDonut = false, ratio, extraData) {
            let pieDetailLabelFormat = {
                category: '{point.name}',
                value: '{point.y}',
                percent: '{point.percentage:.1f} %',
                categoryPercent:
                    '<b>{point.name}</b>:<br>{point.percentage:.1f} %',
                valuePercent: '{point.y} ({point.percentage:.1f} %)',
                all: '<b>{point.name}</b>:<br>{point.y} ({point.percentage:.1f} %)',
            };
            data = TranslatorHelper.makeValuesToNumber(data, columns);
            let dataLabels = style.pieDetailLabel.children;
            let labelsStyle = TranslatorHelper.getStyleItemsInConfig(
                dataLabels,
                '',
                ratio,
            );
            labelsStyle.fontWeight = 300;
            let rsl = {
                plotOptions: {
                    pie: {
                        showInLegend: style.legend.children.show.value,
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            backgroundColor: dataLabels.bgColor.value,
                            borderColor: dataLabels.borderColor.value,
                            borderWidth: dataLabels.borderWidth.value,
                            borderRadius: 2,
                            enabled: dataLabels.show.value,
                            format: pieDetailLabelFormat[
                                dataLabels.pieLableStyle.value
                            ],
                            style: labelsStyle,
                        },
                    },
                },
                legend: TranslatorHelper.translateLegend(
                    style.legend.children,
                    ratio,
                ),
                series: TranslatorHelper.getPieSeries(
                    data,
                    columns,
                    style,
                    extraData.isDonut,
                ),
                tooltip: {},
            };
            if (isDonut) {
                rsl.series.innerSize = '50%';
            }
            let commonAttr = TranslatorHelper.getCommonCellStyleAttr(
                style,
                ratio,
            );
            rsl.chart = {
                backgroundColor: commonAttr.general.backgroundColor,
                type: 'pie',
                style: {
                    fontFamily: 'roboto',
                },
                height: extraData.size.h,
                width: extraData.size.w,
            };
            rsl.contentSize = {
                h: extraData.size.h,
                w: extraData.size.w,
            };
            rsl.lang = {
                numericSymbols: ['K', 'M', 'B', 'T', 'P', 'E'],
                thousandsSep: ',',
            }; //extraData
            rsl.xAxis = { labels: { autoRotation: [-45, -90] } }; //extraData
            return Object.assign(commonAttr, rsl);
        },
        /**
         * Chuyển đổi cấu hình cho loại treemap chart
         * @param {Array} data Mảng dữ liệu của chart
         * @param {Object} columns Cấu hình các cột
         * @param {Object} style Cấu hình hiển thị
         */
        treeMap(data, columns, style, ratio, extraData) {
            let colors = TranslatorHelper.getColorsFromStyle(style);
            let groupCol = columns.group.selectedColums[0]
                ? columns.group.selectedColums[0]
                : false;
            let detailCol = columns.detail.selectedColums[0]
                ? columns.detail.selectedColums[0]
                : false;
            let valueCol = columns.value.selectedColums[0];
            let chartData = TranslatorHelper.getTreeMapData(
                groupCol,
                detailCol,
                valueCol,
                data,
                colors,
            );
            let rsl = {
                chart: {
                    type: 'treemap',
                },
            };
            rsl.series = [
                {
                    type: 'treemap',
                    layoutAlgorithm: 'squarified',
                    alternateStartingDirection: true,
                    levels: [
                        {
                            level: 1,
                            animation: false,
                            layoutAlgorithm: 'squarified',
                            dataLabels: {
                                enabled:
                                    style.lvl1DataLabel.children.show.value,
                                align: style.lvl1DataLabel.children.alignment
                                    .value,
                                verticalAlign:
                                    style.lvl1DataLabel.children.verticalAlign
                                        .value,
                                style: TranslatorHelper.getStyleItemsInConfig(
                                    style.lvl1DataLabel.children,
                                    '',
                                    ratio,
                                ),
                            },
                        },
                        {
                            level: 2,
                            animation: false,
                            dataLabels: {
                                enabled:
                                    style.lvl2DataLabel.children.show.value,
                                align: style.lvl2DataLabel.children.alignment
                                    .value,
                                verticalAlign:
                                    style.lvl2DataLabel.children.verticalAlign
                                        .value,
                                style: TranslatorHelper.getStyleItemsInConfig(
                                    style.lvl2DataLabel.children,
                                    '',
                                    ratio,
                                ),
                            },
                        },
                    ],
                    data: chartData,
                },
            ];
            rsl.series[0].levels[0].dataLabels.style.fontWeight = 100;
            rsl.series[0].levels[1].dataLabels.style.fontWeight = 100;
            let commonAttr = TranslatorHelper.getCommonCellStyleAttr(
                style,
                ratio,
            );
            rsl = Object.assign(rsl, commonAttr);
            return rsl;
        },
        /**
         * Chuyển đổi cấu hình cho loại treemap chart
         * @param {Array} data Mảng dữ liệu của chart
         * @param {Object} columns Cấu hình các cột
         * @param {Object} style Cấu hình hiển thịs
         */
        filter(data, columns, style, ratio, extraData) {
            let selectedColum = columns.value.selectedColums[0];
            selectedColum = selectedColum ? selectedColum : {};
            let rsl = {
                selectionMode:
                    style.selectionControl.children.selectionMode.value,
                data: data,
                selectionType:
                    style.selectionControl.children.selectionType.value,
                itemStyle: TranslatorHelper.getStyleItemsInConfig(
                    style.filterItem.children,
                    'px',
                    ratio,
                ),
                size: extraData.size,
            };

            if (data.length > 0) {
                let type = selectedColum.type;
                if (
                    rsl.selectionMode == 'default' &&
                    (type == 'number' || type == 'date')
                ) {
                    let min =
                        type == 'number' ? Number(data[0].min) : data[0].min;
                    let max =
                        type == 'number' ? Number(data[0].max) : data[0].max;
                    rsl.data = {
                        min: min,
                        max: max,
                        value: [min, max],
                    };
                } else {
                    for (let i in data) {
                        rsl.data[i].symper__selected = false;
                        rsl.data[i].disabled = false;
                    }
                }
            }
            rsl = JSON.parse(JSON.stringify(rsl));
            let commonAttr = TranslatorHelper.getCommonCellStyleAttr(
                style,
                ratio,
            );
            commonAttr.symperTitle.text = commonAttr.symperTitle.text
                ? commonAttr.symperTitle.text
                : selectedColum.as;
            return Object.assign(commonAttr, rsl);
        },
        card(data, columns, style, ratio, extraData) {
            let valueCol = columns.value.selectedColums[0];
            valueCol = valueCol ? valueCol : {};
            let rsl = {
                delta: false,
                value: data[0] ? data[0][valueCol.as] : 0,
                compareValue: false,
                mode: 'number',
                revert: style.card.children.revertColor.value,
                sign: 'equal',
                deltaStyle: TranslatorHelper.getStyleItemsInConfig(
                    style.deltaInfo.children,
                    'px',
                    ratio,
                ),
                valueStyle: TranslatorHelper.getStyleItemsInConfig(
                    style.dataLabel.children,
                    'px',
                    ratio,
                ),
            };

            let upStyle = {
                color: 'green',
            };
            let downStyle = {
                color: 'red',
            };
            if (columns.compareValue.selectedColums.length > 0) {
                rsl.compareValue =
                    data[0][columns.compareValue.selectedColums[0].as];
                let mode = style.card.children.cardMode.value;
                rsl.mode = mode;
                let delta = 0;
                if (mode == 'deltaPercent') {
                    delta = Number(
                        (
                            ((rsl.compareValue - rsl.value) /
                                rsl.compareValue) *
                            100
                        ).toFixed(3),
                    );
                    rsl.sign =
                        delta >= 0
                            ? delta == 0
                                ? 'equal'
                                : 'greater'
                            : 'less';
                    delta += ' %';
                } else if (mode == 'progress') {
                    delta = Number(
                        ((rsl.value / rsl.compareValue) * 100).toFixed(3),
                    );
                } else if (mode == 'deltaNumber') {
                    delta = rsl.compareValue - rsl.value;
                    rsl.sign =
                        delta >= 0
                            ? delta == 0
                                ? 'equal'
                                : 'greater'
                            : 'less';
                    let deltaTmp = Math.abs(delta);
                    deltaTmp = TranslatorHelper.getValueDecimal(
                        deltaTmp,
                        2,
                        'auto',
                        true,
                    );
                    delta = delta > 0 ? deltaTmp : '-' + deltaTmp;
                } else if (mode == 'percent') {
                    delta = Number(
                        ((rsl.value / rsl.compareValue) * 100).toFixed(3),
                    );
                    rsl.sign = 'notSub';
                    delta += ' %';
                } else if (mode == 'number') {
                    delta = rsl.compareValue;
                    rsl.sign = 'notSub';
                    let deltaTmp = Math.abs(delta);
                    deltaTmp = TranslatorHelper.getValueDecimal(
                        deltaTmp,
                        2,
                        'auto',
                        true,
                    );
                    delta = delta > 0 ? deltaTmp : '-' + deltaTmp;
                }

                if (style.card.children.revertColor.value) {
                    let tmp = upStyle;
                    upStyle = downStyle;
                    downStyle = tmp;
                }

                if (rsl.sign == 'less') {
                    rsl.deltaStyle = Object.assign(rsl.deltaStyle, downStyle);
                } else if (rsl.sign == 'greater') {
                    rsl.deltaStyle = Object.assign(rsl.deltaStyle, upStyle);
                }
                rsl.delta = delta;
            }
            rsl.value = 0;
            if (data[0]) {
                rsl.value = TranslatorHelper.getValueDecimal(
                    data[0][valueCol.as],
                    style.dataLabel.children.valueDecimal.value,
                    style.dataLabel.children.unit.value,
                    true,
                );
            }
            let commonStyle = TranslatorHelper.getCommonCellStyleAttr(
                style,
                ratio,
            );
            let titleText = commonStyle.symperTitle.text;
            titleText = titleText ? titleText : '';
            commonStyle.symperTitle.text =
                titleText.trim() != '' ? titleText : valueCol.as;
            return Object.assign(commonStyle, rsl);
        },

        barChart(
            rawConfigs,
            data,
            displayOptions,
            extraData,
            typeChart,
            stacking,
            ratio,
        ) {
            displayOptions.symperExtraDisplay = rawConfigs.extra;
            let viewOptions = TranslatorHelper.linesAndColumns(
                data.data,
                rawConfigs,
                typeChart,
                stacking,
                ratio,
            );
            let rsl = viewOptions; // Kết quả trả về
            // translate cho chart
            let options = JSON.parse(JSON.stringify(staticChartOptions));
            options.chart.type = typeChart;

            rsl = options;
            for (let name in options) {
                if (viewOptions[name]) {
                    options[name] = Object.assign(
                        options[name],
                        viewOptions[name],
                    );
                    delete viewOptions[name];
                }
            }
            rsl = Object.assign(options, viewOptions);
            rsl.chart.height = extraData.size.h;
            rsl.chart.width = extraData.size.w;
            return rsl;
        },
        ganttChart(
            rawConfigs,
            data,
            displayOptions,
            extraData,
            typeChart,
            stacking,
            ratio,
        ) {
            let columns = rawConfigs.setting;
            let style = util.cloneDeep(rawConfigs.style);
            let commonAttr = TranslatorHelper.getCommonCellStyleAttr(
                style,
                ratio,
            );
            if (
                columns.name.selectedColums.length == 0 ||
                columns.start_date.selectedColums.length == 0
            ) {
                return commonAttr;
            }
            let viewOptions = TranslatorHelper.getDataGantt(
                data.data,
                columns,
                style,
                typeChart,
                stacking,
                ratio,
                rawConfigs,
            );
            viewOptions.chart = {
                backgroundColor: commonAttr.general.backgroundColor,
            };
            viewOptions = Object.assign(commonAttr, viewOptions); // Kết quả trả về
            // translate cho chart
            let options = JSON.parse(JSON.stringify(staticChartOptions));
            let rsl = Object.assign(options, viewOptions);
            rsl.scrollbar = {
                enabled: true,
            };
            rsl.navigator = {
                enabled: true,
                liveRedraw: true,
                series: {
                    type: 'gantt',
                    pointPlacement: 0.5,
                    pointPadding: 0.25,
                },
                yAxis: {
                    min: 0,
                    max: 3,
                    reversed: true,
                    categories: [],
                },
            };
            rsl.credits = {
                enabled: false,
            };

            rsl.chart.height = extraData.size.h - 60;
            rsl.chart.width = extraData.size.w;
            rsl.totalRowCount = Number(data.total);

            return rsl;
        },
        editor(rawConfigs, displayOptions, extraData, oldOutput, ratio) {
            displayOptions.symperExtraDisplay = rawConfigs.extra;
            let viewOptions = TranslatorHelper.editor(
                rawConfigs.style,
                displayOptions,
                extraData,
                oldOutput,
                ratio,
            );
            let rsl = viewOptions;
            return rsl;
        },
    },
    editor(style, content, extraData, oldOutput) {
        let rsl = {
            content: content,
            contentSize: {
                w: extraData.size.w,
                h: extraData.size.h,
            },
        };
        let commonAttr = this.getCommonCellStyleAttr(style, 1);
        rsl = Object.assign(rsl, commonAttr);
        return rsl;
    },
    /**
     * Chuyển các cấu hình thành options tương ứng với các loại chart gantt
     * @param {Array} data mảng dữ liệu của chart
     * @param {Object} columns Cấu hình cột của chart
     * @param {Object} style style của chart
     * @param {number} ratio tỷ lệ thu phóng của dashboard
     */
    getDataGantt(
        data,
        columns,
        originStyle,
        chartType,
        stacking = undefined,
        ratio,
    ) {
        data = this.checkAndCustomDataAsSum(data, columns);

        data = this.makeValuesToNumber(data, columns);
        columns = this.clearColumnsNotSelect(columns);
        let style = originStyle;
        let series = this.getSeriesOptionsForGantt(
            data,
            columns,
            chartType,
            stacking,
        );
        let rsl = {
            rangeSelector: {
                enabled: this.getRangeSelectorGantt(style),
            },
            series: series,
        };
        return rsl;
    },
    /**
     * Chuyển các cấu hình thành options tương ứng với các loại chart: line, column, bar, combo
     * @param {Array} data mảng dữ liệu của chart
     * @param {Object} columns Cấu hình cột của chart
     * @param {Object} style style của chart
     * @param {number} ratio tỷ lệ thu phóng của dashboard
     */
    linesAndColumns(data, rawConfigs, chartType, stacking = undefined, ratio) {
        if(chartType == 'line'){
            let lineWidth = rawConfigs.style.line.children.lineWidth.value
            rawConfigs.style.line.children.lineWidth.value = Number(lineWidth).toFixed(2)
        }
        let columns = rawConfigs.setting;
        let style = util.cloneDeep(rawConfigs.style);

        data = this.makeValuesToNumber(data, columns);
        columns = this.filterUnuseColumnsForGroup1(columns);
        let series = this.getSeriesOptions(data, columns, chartType, stacking, rawConfigs.style);

        let typeCategoryData
        if (rawConfigs.setting.xAxis.selectedColums.length > 0) {
            let origin_type = rawConfigs.setting.xAxis.selectedColums[0].origin_type
            let as = rawConfigs.setting.xAxis.selectedColums[0].as
            if (origin_type == 'date') {
                typeCategoryData = 'date'
            }
            //đoạn này để chặt chẽ hơn, do khi xaxis là text thì không vào fillgap được ex. '123','543'...
            //nếu để điều kiện fillgap là text thì đối với những xaxis chữ sẽ không fill được
            // thêm điều kiện để fillgap loại đối với xaxis không thỏa mãn ex. (số sau nhỏ hơn số trước: 1,2,3,4,9,5), nếu vậy thì không tác động logic được
            //nếu data mắc phải điều kiện bị loại bên trên thì phải do backend sửa lại, ex. "Tổng issues thống kê theo tuần" dashboard 221
            else if (origin_type == 'text') {
                if(data.length>0){
                let lastValue = Number(data[0][as])
                if (isNaN(lastValue)) {
                    typeCategoryData = false
                }else{
                    typeCategoryData = false
                }}
                else {
                    typeCategoryData = data.reduce((preValue, curValue) => {
                        if (lastValue > Number(curValue[as])) {
                            return false
                        }
                        lastValue = Number(curValue[as])
                        return preValue && !isNaN(Number(curValue[as]))
                    }, true) ? 'number' : false
                }
            }
            //áp dụng đối với xaxis là text nhưng lại là tháng, tuần ex. cell "Báo cáo tuổi bug theo tháng" dashboards 221
            else {
                typeCategoryData = false
            }
        }
        else {
            typeCategoryData = false
        }

        if (rawConfigs.style.fillgap !== undefined && rawConfigs.style.fillgap.children.fillGap.value) {
            if (typeCategoryData == 'date') {
                series = this.fillGapDate(series, rawConfigs.style.fillgap)
            }
            else if (typeCategoryData == 'number') {
                series = this.fillGapNumber(series, rawConfigs.style.fillgap)
            }
        }
        series.series = this.applySeriesStyle(series.series, style, ratio);
        let rsl = {
            yAxis: this.getYAxisOptions(style, ratio),
            xAxis: this.translateAxis(style.xAxis.children, ratio),
            plotOptions: {
                series: {
                    dataLabels: this.translateDataLabels(
                        style.dataLabel.children,
                        style.yAxis1.children,
                        ratio,
                    ),
                },
            },
            legend: this.translateLegend(style.legend.children, ratio),
            series: series.series,
        };
        rsl.xAxis.categories = series.xAxisCategory;
        let commonAttr = this.getCommonCellStyleAttr(style, ratio);
        rsl.chart = {
            backgroundColor: commonAttr.general.backgroundColor,
        };
        return Object.assign(commonAttr, rsl);
    },
    clearColumnsNotSelect(column) {
        let allColumn = util.cloneDeep(column);
        let columns = {};
        for (let name in allColumn) {
            if (allColumn[name].selectedColums.length > 0) {
                columns[name] = allColumn[name];
            }
        }
        return columns;
    },
    checkAndCustomDataAsSum(data, columns) {
        let listColumnsDisplayAsSum = [];
        if (columns.gridColumns.selectedColums.length > 0) {
            columns.gridColumns.selectedColums.forEach((e) => {
                if (e.menuOptions.customColumnDisplaySum.value) {
                    listColumnsDisplayAsSum.push(e.as);
                }
            });
        }
        if (
            listColumnsDisplayAsSum.length > 0 &&
            columns.parent.selectedColums.length > 0
        ) {
            let treeData = TranslatorHelper.listToTree(
                data,
                columns.id.selectedColums[0].as,
                columns.parent.selectedColums[0].as,
            );
            listColumnsDisplayAsSum.forEach(function (k) {
                let mappingValue = {};
                for (let i in treeData) {
                    TranslatorHelper.sumAll(
                        treeData[i],
                        k,
                        columns.id.selectedColums[0].as,
                        mappingValue,
                    );
                }
                data.forEach(function (e) {
                    e[k] = mappingValue[e[columns.id.selectedColums[0].as]];
                });
            });
        }
        return data;
    },
    sumAll(node, key, id, mappingValue) {
        if (node.children && node.children.length > 0) {
            let sum = 0;
            for (let item of node.children) {
                sum += TranslatorHelper.sumAll(item, key, id, mappingValue);
            }
            node[key] = sum;
            mappingValue[node[id]] = node[key];
            return sum;
        } else {
            mappingValue[node[id]] = Number(node[key]);
            return Number(node[key]);
        }
    },
    listToTree(list, idField, parentField) {
        let map = list.reduce((obj, el) => {
            obj[el[idField]] = el;
            el.children = [];
            return obj;
        }, {});
        let rsl = [];
        let orphans = [];
        for (let item of list) {
            let parentId = item[parentField];
            if (parentId) {
                if (map[parentId]) {
                    map[parentId].children.push(item);
                } else {
                    orphans.push(item);
                }
            } else {
                rsl.push(item);
            }
        }
        rsl = [...rsl, ...orphans];
        return rsl;
    },
    /**
     * Chuyển giá trị của các row có chứa key bắt buộc là number thành number
     * @param {Array} data mảng dữ liệu của chart
     * @param {Objecgt} columns  Cấu hình các cột của chart
     */
    makeValuesToNumber(data, columns, keyword = 'yAxis') {
        let keys = [];
        for (let name in columns) {
            if (name.includes(keyword)) {
                for (let col of columns[name].selectedColums) {
                    keys.push(col.as);
                }
            }
        }
        for (let i in data) {
            for (let k of keys) {
                data[i][k] = Number(data[i][k]);
            }
        }
        return data;
    },
    getRangeSelectorGantt(style) {
        if (
            style.general.children.rangeSelector &&
            style.general.children.rangeSelector.value == true
        ) {
            return true;
        } else {
            return false;
        }
    },
    getValueDecimal(num, decimalNum, mode, needUnit = false) {
        num = Number(num);
        decimalNum = Number(decimalNum);
        let rsl = num;
        let modeMapNum = {
            thousands: {
                v: 1000,
                s: 'K',
            },
            milions: {
                v: 1000000,
                s: 'M',
            },
            bilions: {
                v: 1000000000,
                s: 'B',
            },
            trilions: {
                v: 1000000000000,
                s: 'T',
            },
        };
        if (mode == 'none') {
            rsl = num;
        } else if (mode == 'auto') {
            for (let runMode in modeMapNum) {
                if (num > modeMapNum[runMode].v) {
                    mode = runMode;
                    rsl = num / modeMapNum[runMode].v;
                }
            }
        } else {
            rsl = num / modeMapNum[mode].v;
        }
        rsl = Number(Number(rsl).toFixed(decimalNum));
        rsl = (rsl + '').split('.');
        rsl[0] = rsl[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        rsl = rsl.length > 1 ? rsl[0] + '.' + rsl[1] : rsl[0];
        if (needUnit && mode != 'none') {
            let unit = mode == 'auto' ? '' : modeMapNum[mode].s;
            rsl = rsl + unit;
        }
        return rsl;
    },
    getStyleItemsInConfig(st, sizeUnit = '', ratio) {
        let rsl = {
            textOutline: '0px',
            display: st.show === undefined ? '' : st.show.value ? '' : 'none',
            backgroundColor: st.bgColor ? st.bgColor.value : '',
            color: st.fontColor ? st.fontColor.value : '',
            fontFamily: st.fontFamily ? st.fontFamily.value : 'roboto',
            fontSize: (st.textSize ? st.textSize.value : 13) * ratio + sizeUnit,
            textAlign: st.alignment ? st.alignment.value : '',
            borderBottomWidth: st.borderBottomWidth
                ? st.borderBottomWidth.value + sizeUnit
                : '',
            borderWidth: st.borderWidth ? st.borderWidth.value + sizeUnit : '',
        };

        if (st.borderBottomColor && st.borderBottomColor.value) {
            rsl.borderBottomColor = st.borderBottomColor.value;
        }

        if (st.borderColor && st.borderColor.value) {
            rsl.borderColor = st.borderColor.value;
        }

        return rsl;
    },
    translateLegend(st, ratio) {
        let positionMap = {
            'vertical-left': {
                layout: 'vertical',
                align: 'left',
                verticalAlign: 'top',
            },
            'horizontal-top': {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'top',
            },
            'vertical-right': {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
            },
            'horizontal-bottom': {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
            },
        };

        let rsl = {
            itemMarginBottom: 5,
            padding: 0,
            style: TranslatorHelper.getStyleItemsInConfig(st, '', ratio),
            enabled: st.show.value,
            title: {
                text: st.titleText.value,
                style: {
                    fontSize: 13 * ratio,
                    fontWeight: '400',
                },
            },
            itemStyle: {
                fontSize: st.textSize.value * ratio,
                color: st.fontColor.value,
            },
        };

        rsl = Object.assign(rsl, positionMap[st.legendPosition.value]);
        return rsl;
    },
    /**
     * Lấy ra series của pie chart
     * @param {Array} data Mảng dữ liệu
     * @param {Object} columns Cấu hình cột
     */
    getPieSeries(data, columns, styles, isDonut) {
        let colors = TranslatorHelper.getColorsFromStyle(styles);
        data = data.length == 0 ? [{}] : data;
        let yAxisCol = columns.yAxis1.selectedColums;
        let legendCols = columns.legend.selectedColums;
        let decimalNum =
            styles.pieDetailLabel.children.tooltipDecimalNumber.value;

        let rsl = {
            animation: false,
            name: '',
            colorByPoint: true,
            data: [],
        };
        let i = 0;
        if (legendCols.length > 0) {
            legendCols = legendCols[0];
            yAxisCol = yAxisCol[0];
            rsl.name = yAxisCol.as;

            for (let row of data) {
                rsl.data.push({
                    name: row[legendCols.as] + '',
                    y: !isNaN(row[yAxisCol.as])
                        ? Number(Number(row[yAxisCol.as]).toFixed(decimalNum))
                        : row[yAxisCol.as],
                    color: colors[i],
                });
                i += 1;
            }
        } else {
            for (let col of yAxisCol) {
                rsl.data.push({
                    name: col.as,
                    y: !isNaN(data[0][col.as])
                        ? Number(Number(data[0][col.as]).toFixed(decimalNum))
                        : data[0][col.as],
                    color: colors[i],
                });
                i += 1;
            }
        }
        rsl=this.groupSeries([rsl],styles,[],'percent')
        isDonut && (rsl[0].innerSize = '50%');
        return rsl;
    },
    /**
     * Dịch các thông tin chung của tất cả các cell thành dạng css
     * @param {Object} commonAttr Object chứa thông tin về các thuộc tính chung của cell,
     * trùng với các thông tin ở hàm  getCommonAttr() trong file getAtyleAttesFuncs
     */
    getCommonCellStyleAttr(commonAttr, ratio) {
        let rsl = {
            general: TranslatorHelper.getStyleItemsInConfig(
                commonAttr.general.children,
                'px',
                ratio,
            ),
            symperTitle: {
                text: commonAttr.title.children.titleText.value,
                style: TranslatorHelper.getStyleItemsInConfig(
                    commonAttr.title.children,
                    'px',
                    ratio,
                ),
            },
            title: {
                text: '',
            },
        };
        rsl.symperTitle.style.height =
            calcTitleCellHeight(commonAttr.title.children.textSize.value) +
            'px!important';
        return rsl;
    },
    getColorsFromStyle(style) {
        return style.general.children.colorPalette.value;
    },
    getTreeMapData(groupCol, detailCol, valueCol, data, colors) {
        let chartData = [];
        let i = 0;
        if (groupCol) {
            if (detailCol) {
                let level1Items = {};
                for (let item of data) {
                    level1Items[groupCol.as] = true;
                    chartData.push({
                        name: item[detailCol.as] + '',
                        parent: item[groupCol.as],
                        value: Number(item[valueCol.as]),
                    });
                    i += 1;
                }
                for (let name in level1Items) {
                    chartData.unshift({
                        name: name,
                        color: colors[i],
                        id: name,
                    });
                    i += 1;
                }
            } else {
                for (let item of data) {
                    chartData.push({
                        color: colors[i],
                        name: item[groupCol.as] + '',
                        value: Number(item[valueCol.as]),
                    });
                    i += 1;
                }
            }
        } else {
            if (detailCol) {
                for (let item of data) {
                    chartData.push({
                        color: colors[i],
                        name: item[detailCol.as] + '',
                        value: Number(item[valueCol.as]),
                    });
                    i += 1;
                }
            } else {
                chartData.push({
                    color: colors[i],
                    name: valueCol.as,
                    value: Number(data[0][valueCol.as]),
                });
            }
        }
        return chartData;
    },
    /**
     * Loại bỏ các cột không phù hợp với ràng buộc để tạo thành biểu đổ cho Group 1: là nhóm các chart line, column, bar, combo
     * @param {Object} columns cấu hình các cột cho việc lấy dữ liệu
     */
    filterUnuseColumnsForGroup1(columns) {
        let correctColumnConfigs = {
            legend: {
                selectedColums: [],
            },
            xAxis: {},
            yAxis1: {},
            yAxis2: {},
        };
        // Nếu có legend
        if (columns.legend.selectedColums.length > 0) {
            correctColumnConfigs.legend.selectedColums = [
                columns.legend.selectedColums[0],
            ]; // chỉ lấy cột đầu tiên của legend
            correctColumnConfigs.yAxis1.selectedColums =
                columns.yAxis1.selectedColums.length > 0
                    ? columns.yAxis1.selectedColums
                    : [];
            correctColumnConfigs.yAxis2.selectedColums =
                columns.yAxis2.selectedColums.length > 0
                    ? columns.yAxis2.selectedColums
                    : [];
        } else {
            for (let name in columns) {
                if (name.includes('yAxis')) {
                    correctColumnConfigs[name] = columns[name];
                }
            }
        }
        // chỉ lấy cột đầu tiên của xAxis
        correctColumnConfigs.xAxis.selectedColums =
            columns.xAxis.selectedColums.length > 0
                ? [columns.xAxis.selectedColums[0]]
                : [];
        return correctColumnConfigs;
    },
    /**
     *  Lấy ra cấu hình của các series trong chart gantt
     * @param {Array} data mảng dữ liệu của chart
     * @param {Object} columns cấu hình các cột của chart
     * @param {Number} ratio tỷ lệ thu phóng của dashboard
     */
    getSeriesOptionsForGantt(data, columns, chartType, stacking) {
        if (Object.keys(columns).length == 0) {
            return {};
        }
        let rsl = {
            data: [],
        };
        for (let i = 0; i < data.length; i++) {
            let item = {};
            for (let name in columns) {
                if (data[i][columns[name].selectedColums[0].as]) {
                    if (name == 'name') {
                        item['text'] =
                            data[i][columns[name].selectedColums[0].as];
                    } else if (name == 'gridColumns') {
                        let allColumns = columns[name].selectedColums;
                        for (let j in allColumns) {
                            item[allColumns[j].name] =
                                data[i][columns[name].selectedColums[j].as];
                        }
                    } else if (
                        name == 'gridColumns' ||
                        name == 'rightSidebarColumns'
                    ) {
                        let allColumns = columns[name].selectedColums;
                        for (let j in allColumns) {
                            item[allColumns[j].name] =
                                data[i][columns[name].selectedColums[j].as];
                        }
                    } else if (name == 'owner') {
                        item[name] = [];
                        let allColumns = columns[name].selectedColums;
                        for (let j in allColumns) {
                            item[name].push(
                                data[i][columns[name].selectedColums[j].as],
                            );
                        }
                    } else if (name == 'progress') {
                        let progress = Number(
                            data[i][columns[name].selectedColums[0].as],
                        );
                        if (progress > 1) {
                            progress = progress / 100;
                        }
                        item[name] = Math.round(progress * 100) / 100;
                    } else if (name == 'milestone') {
                        let milestone =
                            data[i][columns[name].selectedColums[0].as];
                        let value;
                        if (milestone == '1') {
                            value = true;
                        } else {
                            value = false;
                        }
                        item[name] = value;
                    } else if (name == 'tooltips') {
                        item[name] = {};
                        for (let j in columns[name].selectedColums) {
                            item[name][columns[name].selectedColums[j].as] =
                                data[i][columns[name].selectedColums[j].as];
                        }
                    } else {
                        item[name] =
                            data[i][columns[name].selectedColums[0].as];
                    }
                }
            }
            rsl.data.push(item);
        }
        if (columns.sortBy && columns.sortBy.selectedColums.length > 0) {
            let sortValue =
                columns.sortBy.selectedColums[0].menuOptions.sortAsc.value;
            rsl.data.sort((a, b) => {
                let value;
                let valueA = new Date(a.sortBy) ? new Date(a.sortBy) : a.sortBy;
                let valueB = new Date(b.sortBy) ? new Date(b.sortBy) : b.sortBy;
                if (sortValue) {
                    value = valueA > valueB ? 1 : -1;
                } else {
                    value = valueA > valueB ? -1 : 1;
                }
                return value;
            });
        }
        return rsl;
    },
    /**
     *  Lấy ra cấu hình của các series trong chart
     * @param {Array} data mảng dữ liệu của chart
     * @param {Object} columns cấu hình các cột của chart
     * @param {Number} ratio tỷ lệ thu phóng của dashboard
     */
    getSeriesOptions(data, columns, chartType, stacking,styles) {
        let rsl = {
            xAxisCategory: [''],
            series: [],
        };
        let autoSort = true;
        for (let key in columns) {
            if (Array.isArray(columns[key].selectedColums)) {
                for (let col of columns[key].selectedColums) {
                    if (col.sort != 'none') {
                        autoSort = false;
                        break;
                    }
                }
            }
        }
        let xAxisCol = false;
        // let yAxisCol = columns.yAxis1.selectedColums[0];
        let legendCols = columns.legend.selectedColums;

        // danh sách tất cả các column trong yAxis1, yAxis2, ...
        let allColsInYAxis = [];
        for (let name in columns) {
            if (name.includes('yAxis')) {
                let yAxisNum = Number(name.replace('yAxis', '')) - 1;
                for (let columnInYAxis of columns[name].selectedColums) {
                    columnInYAxis.yAxisNum = yAxisNum;
                }
                allColsInYAxis = allColsInYAxis.concat(
                    columns[name].selectedColums,
                );
            }
        }
        // có xAxis
        if (columns.xAxis.selectedColums.length > 0) {
            xAxisCol = columns.xAxis.selectedColums[0].as;
            if (legendCols.length > 0) {
                for (let column in columns) {
                    if (
                        column.includes('yAxis') &&
                        columns[column].selectedColums.length > 0
                    ) {
                        for (let i in columns[column].selectedColums) {
                            let yAxisCol = columns[column].selectedColums[i];
                            let pivotData = this.getPivotArray(
                                data,
                                yAxisCol.as,
                                legendCols[0].as,
                                xAxisCol,
                                autoSort,
                            );
                            let yAxisNum =
                                Number(column.replace('yAxis', '')) - 1;
                            let type = yAxisCol.seryType
                                ? yAxisCol.seryType
                                : chartType;
                            rsl.xAxisCategory = pivotData[0].slice(1);
                            if (
                                !yAxisCol.menuOptions.independentLegend ||
                                !yAxisCol.menuOptions.independentLegend.value
                            ) {
                                for (let i = 1; i < pivotData.length; i++) {
                                    rsl.series.push({
                                        yAxis: yAxisNum,
                                        animation: false,
                                        zIndex: /line/i.test(type) ? 2 : 1,
                                        stacking: stacking,
                                        name: pivotData[i][0],
                                        type: type,
                                        data: pivotData[i].slice(1),
                                    });
                                }
                            } else {
                                rsl.series.push({
                                    yAxis: yAxisNum,
                                    animation: false,
                                    stacking: stacking,
                                    name: yAxisCol.as,
                                    zIndex: /line/i.test(type) ? 2 : 1,
                                    type: type,
                                    data: [],
                                });
                                let mappingXaxis = {};
                                for (let i in data) {
                                    if (!mappingXaxis[data[i][xAxisCol]]) {
                                        mappingXaxis[data[i][xAxisCol]] = [];
                                    }
                                    mappingXaxis[data[i][xAxisCol]].push(
                                        data[i][yAxisCol.as],
                                    );
                                }
                                let seriesData = this.getCaculatedData(
                                    mappingXaxis,
                                    yAxisCol.agg,
                                );
                                rsl.series[rsl.series.length - 1].data =
                                    seriesData;
                            }
                        }
                    }
                }
            } else {
                rsl.xAxisCategory = [];
                // Không có legend, xét nhiều yAxis và nhiều cột trong yAxis
                for (let yAxisCol of allColsInYAxis) {
                    let type = yAxisCol.seryType
                        ? yAxisCol.seryType
                        : chartType;
                    rsl.series.push({
                        yAxis: yAxisCol.yAxisNum,
                        animation: false,
                        stacking: stacking,
                        name: yAxisCol.as,
                        zIndex: /line/i.test(type) ? 2 : 1,
                        type: type,
                        data: [],
                    });
                    for (let item of data) {
                        if (yAxisCol.yAxisNum == 0) {
                            rsl.xAxisCategory.push(
                                item[xAxisCol] === null ? '' : item[xAxisCol],
                            );
                        }
                        rsl.series[rsl.series.length - 1].data.push(
                            item[yAxisCol.as],
                        );
                    }
                }
                rsl.series = this.groupSeries(rsl.series, styles,rsl.xAxisCategory)
            }
        } else {
            // có legend
            if (legendCols.length > 0) {
                for (let item of data) {
                    let type = yAxisCol.seryType
                        ? yAxisCol.seryType
                        : chartType;
                    rsl.series.push({
                        yAxis: 0,
                        animation: false,
                        stacking: stacking,
                        name: legendCols[0].as,
                        zIndex: /line/i.test(type) ? 2 : 1,
                        type: type,
                        data: [item[yAxisCol.as]],
                    });
                }
            } else {
                for (let yAxisCol of allColsInYAxis) {
                    let type = yAxisCol.seryType
                        ? yAxisCol.seryType
                        : chartType;
                    rsl.series = [
                        {
                            yAxis: yAxisCol.yAxisNum,
                            stacking: stacking,
                            zIndex: /line/i.test(type) ? 2 : 1,
                            name: yAxisCol.as,
                            type: type,
                            animation: false,
                            data: [data[0][yAxisCol.as]],
                        },
                    ];
                }
                this.groupSeries(rsl,styles)
            }
        }
        return rsl;
    },
    getCaculatedData(mappingData, yAxisAgg) {
        let res = [];
        for (let i in mappingData) {
            let value = util.arrayCalulator(mappingData[i], yAxisAgg);
            res.push(value);
        }
        return res;
    },
    generateRandomInteger(max, listColorIndex) {
        let value = Math.floor(Math.random() * max) + 1;
        if (!listColorIndex.includes(value)) {
            listColorIndex.push(value);
        } else {
            this.generateRandomInteger(max, listColorIndex);
        }
        return value;
    },
    applySeriesStyle(series, styles, ratio) {
        let colors = getDefaultSeriesColor();
        let listColorIndex = [];
        let decimalNum = styles.dataLabel.children.tooltipDecimalNumber.value;
        if (Array.isArray(series)) {
            for (let s of series) {
                if (Array.isArray(s.data)) {
                    for (let i = 0; i < s.data.length; i++) {
                        if (!isNaN(s.data[i])) {
                            s.data[i] = Number(
                                Number(s.data[i]).toFixed(decimalNum),
                            );
                        }
                    }
                }
            }
        }
        for (let i in series) {
            let number = this.generateRandomInteger(40, listColorIndex);
            series[i].color = colors[number];
            if (/line/i.test(series[i].type) && styles.hasOwnProperty('line')) {
                let lineProp = styles.line.children;
                series[i].lineWidth = lineProp.lineWidth.value;
                (series[i].states = {
                    hover: {
                        enabled: true,
                        lineWidth: lineProp.lineWidth.value,
                    },
                }),
                    (series[i].marker = {
                        enabled: lineProp.markerEnable.value,
                        radius: lineProp.markerSize.value * ratio,
                        states: {
                            hover: {
                                enabled: true,
                                radius: lineProp.markerSize.value * ratio,
                            },
                        },
                    });
            }
        }

        return series;
    },
    getYAxisOptions(styles, ratio) {
        let yAxis = [];
        for (let name in styles) {
            if (name.includes('yAxis')) {
                let props = styles[name].children;
                let newYAxis = this.translateAxis(props, ratio);
                let alignValue = props.asisAlignment.value;
                newYAxis.opposite = alignValue == 'left' ? false : true;
                if (props.unit.value != 'auto') {
                    newYAxis.labels.formatter =
                        yAxisValueFormatter[props.unit.value];
                }
                yAxis.push(newYAxis);
            }
        }
        return yAxis;
    },
    translateAxis(st, ratio) {
        let mapAlignment = {
            left: 'low',
            right: 'high',
            center: 'middle',
        };
        return {
            gridLineColor: st.gridLineColor.value,
            gridLineDashStyle: st.gridLineType.value,
            gridLineWidth: st.gridLine.value ? st.gridLineWidth.value : 0,
            visible: st.show.value,
            labels: {
                style: {
                    fontSize: st.textSize.value * ratio,
                },
            },

            title: {
                align: mapAlignment[st.asisAlignment.value],
                enabled: st.axistitle.value,
                text: st.titleText.value,
            },
        };
    },
    translateDataLabels(st, yAxis, ratio) {
        let options = {
            align: 'center',
            borderRadius: 2,

            padding: 4 * ratio,
            enabled: st.show.value,
            borderColor: st.borderColor.value,
            borderWidth: st.borderWidth.value,
            backgroundColor: st.bgColor.value,
            style: this.getStyleItemsInConfig(st, '', ratio),
        };
        options.style.fontWeight = 300;
        return options;
    },
    getValueDecimal(num, decimalNum, mode, needUnit = false) {
        num = Number(num);
        decimalNum = Number(decimalNum);
        let rsl = num;
        let modeMapNum = {
            thousands: {
                v: 1000,
                s: 'K',
            },
            milions: {
                v: 1000000,
                s: 'M',
            },
            bilions: {
                v: 1000000000,
                s: 'B',
            },
            trilions: {
                v: 1000000000000,
                s: 'T',
            },
        };
        if (mode == 'none') {
            rsl = num;
        } else if (mode == 'auto') {
            for (let runMode in modeMapNum) {
                if (num > modeMapNum[runMode].v) {
                    mode = runMode;
                    rsl = num / modeMapNum[runMode].v;
                }
            }
        } else {
            rsl = num / modeMapNum[mode].v;
        }
        rsl = Number(Number(rsl).toFixed(decimalNum));
        rsl = (rsl + '').split('.');
        rsl[0] = rsl[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        rsl = rsl.length > 1 ? rsl[0] + '.' + rsl[1] : rsl[0];
        if (needUnit && mode != 'none') {
            let unit = mode == 'auto' ? '' : modeMapNum[mode].s;
            rsl = rsl + unit;
        }
        return rsl;
    },
    /**
     * Chuyển đổi dạng
     * @param {Array} dataArray Data cần pivot dạng [{key1:value1}, {key2:value2}]
     * @param {*} rowKey key trong row để lấy dữ liệu cho row
     * @param {*} colKey key của row để lấy dữ liệu cho column
     * @param {*} dataIndex key của row để lấy dữ liệu đê tính giá trị
     */
    getPivotArray(dataArray, dataIndex, rowKey, colKey, autoSort) {
        var result = {},
            ret = [];
        var newCols = [];
        for (var i = 0; i < dataArray.length; i++) {
            if (!result[dataArray[i][rowKey]]) {
                result[dataArray[i][rowKey]] = {};
            }
            result[dataArray[i][rowKey]][dataArray[i][colKey]] =
                dataArray[i][dataIndex];
            //To get column names
            if (newCols.indexOf(dataArray[i][colKey]) == -1) {
                newCols.push(dataArray[i][colKey]);
            }
        }
        if (autoSort) {
            newCols.sort();
        }
        var item = [];
        //Add Header Row
        item.push('Item');
        item.push.apply(item, newCols);
        ret.push(item);
        //Add content
        for (var key in result) {
            item = [];
            item.push(key);
            for (var i = 0; i < newCols.length; i++) {
                item.push(result[key][newCols[i]] || '-');
            }
            ret.push(item);
        }
        return ret;
    },
    // fillGap đối với các chart có data là date
    fillGapDate(series, configs) {
        let cloneXAxisCategory = []
        //đổi dạng yyyy-mm-dd -> date object để tiện tính toán và so sánh
        for (let i = 0; i < series.xAxisCategory.length; i++) {
            cloneXAxisCategory.push(dayjs(series.xAxisCategory[i], "yyyy-mm-dd"))
        }
        let cloneSeries = { ...series, xAxisCategory: cloneXAxisCategory }
        //stepValue >0 để xác định là có fill
        if (configs.children.stepValue.value > 0) {
            //auto fill
            //nếu autoFill thì không xét với fillValue nữa
            if (configs.children.autoFill.value) {
                for (let indexXAxis = 0; indexXAxis < cloneSeries.xAxisCategory.length - 1; indexXAxis++) {
                    let nextDay = cloneSeries.xAxisCategory[indexXAxis].add(Number(configs.children.stepValue.value), 'days')
                    if (nextDay < cloneSeries.xAxisCategory[indexXAxis + 1]) {
                        cloneSeries.xAxisCategory.splice(indexXAxis + 1, 0, nextDay)
                        cloneSeries.series.map(serie => {
                            return serie.data.splice(indexXAxis + 1, 0, serie.data[indexXAxis])
                        })

                    }
                }
                for (let s = 0; s < cloneSeries.series.length; s++) {
                    for (let i = 0; i < cloneSeries.series[s].data.length; i++) {
                        if (i == 0) {
                            if (cloneSeries.series[s].data[i] == "-") {
                                cloneSeries.series[s].data[i] = 0
                            }
                        }
                        else {
                            if (cloneSeries.series[s].data[i] == "-") {
                                cloneSeries.series[s].data[i] = cloneSeries.series[s].data[i - 1]
                            }
                        }

                    }
                }
            }
            //không autoFill, có fillValue do người dùng chọn, sẽ lấy giá trị này fill vào các vị trí
            //mặc định sẽ là null
            else {
                this.handleIfNotAutoFill(cloneSeries, 'days', configs.children.stepValue.value, configs.children.fillValue.value)
            }
        }
        cloneSeries.xAxisCategory = cloneSeries.xAxisCategory.map(xAxis => dayjs(xAxis).format("YYYY-MM-DD"))
        return cloneSeries

    },

    //xử lý khi không có autoFill, fillValue do người dùng chọn (autoFill là lấy giá trị trước đó)
    handleIfNotAutoFill(series, type, stepValue, fillValue) {
        for (let indexXAxis = 0; indexXAxis < series.xAxisCategory.length - 1; indexXAxis++) {
            let nextStep = type == 'days' ? dayjs(series.xAxisCategory[indexXAxis]).add(Number(stepValue), 'days') : Number(series.xAxisCategory[indexXAxis]) + Number(stepValue)
            if (nextStep < series.xAxisCategory[indexXAxis + 1]) {
                series.xAxisCategory.splice(indexXAxis + 1, 0, String(nextStep))
                series.series.map(serie => {
                    return serie.data.splice(indexXAxis + 1, 0, { y: fillValue == null ? '-' : Number(fillValue) })
                })
                if (indexXAxis == 1000) {
                    break
                }
            }
        }
        for (let s = 0; s < series.series.length; s++) {
            for (let i = 0; i < series.series[s].data.length; i++) {
                if (i == 0) {
                    if (series.series[s].data[i] == "-") {
                        series.series[s].data[i] = 0
                    }
                }
                else {
                    if (series.series[s].data[i] == "-") {
                        series.series[s].data[i] = { y: fillValue == null ? '-' : Number(fillValue) }
                    }
                }
            }
        }
    },
    fillGapNumber(series, configs) {
        //fillgap ==true
        let cloneSeries = { ...series }
        //stepValue >0 để xác định là có fill
        if (configs.children.stepValue.value > 0) {
            //auto fill
            //nếu autoFill thì không xét với fillValue nữa
            if (configs.children.autoFill.value) {
                for (let indexXAxis = 0; indexXAxis < cloneSeries.xAxisCategory.length - 1; indexXAxis++) {

                    let nextNumber = Number(cloneSeries.xAxisCategory[indexXAxis]) + Number(configs.children.stepValue.value)
                    if (nextNumber < Number(cloneSeries.xAxisCategory[indexXAxis + 1])) {
                        cloneSeries.xAxisCategory.splice(indexXAxis + 1, 0, String(nextNumber))
                        cloneSeries.series.map(serie => {
                            return serie.data.splice(indexXAxis + 1, 0, serie.data[indexXAxis])
                        })
                    }
                    if (indexXAxis === 1000) {
                        break
                    }
                }
                for (let s = 0; s < cloneSeries.series.length; s++) {
                    for (let i = 0; i < cloneSeries.series[s].data.length; i++) {
                        if (i == 0) {
                            if (cloneSeries.series[s].data[i] == "-") {
                                cloneSeries.series[s].data[i] = 0
                            }
                        }
                        else {
                            if (cloneSeries.series[s].data[i] == "-") {
                                cloneSeries.series[s].data[i] = cloneSeries.series[s].data[i - 1]
                            }
                        }

                    }
                }
            }
            //không autoFill, có fillValue do người dùng chọn, sẽ lấy giá trị này fill vào các vị trí
            //mặc định sẽ là null
            else {
                this.handleIfNotAutoFill(cloneSeries, 'number', configs.children.stepValue.value, configs.children.fillValue.value)
            }
        }
        return cloneSeries
    },
    groupSeries(series, style, categories=[], chartType=""){
        let cloneSeries = util.cloneDeep(series)
        let styleGroupSeries
        styleGroupSeries=Object.keys(style.groupSeries?style.groupSeries.children:[]).filter(key=>{
            return style.groupSeries.children[key].value === true
        })[0]
        if(styleGroupSeries){
            style.groupSeries.children[styleGroupSeries+'Value'].disabled=false;
            
                this.handleGroup[styleGroupSeries](cloneSeries[0].data,style.groupSeries.children[styleGroupSeries+'Value'].value, style.groupSeries.children.groupSeriesLabel.value, categories, chartType)
            // })
        }
        return cloneSeries
    },
    handleGroup:{
        lessThan(data,valueConfig,name, categories=[],chartType){
            let sum=0
            let percentData = chartType!=""
            let groupSeries={
                name:name,
                y:0,
                color: '',
                customTooltip:[]
            }
            // {point.name}: {y}
            let haveCategories = categories.length>0
            if(!haveCategories){
                data.map(a=>sum+=a.y)
            }
            else{
                data.map(a=>sum+=a)
            }
            if(!percentData){
                for(let i =0; i< data.length; i++){
                    let value = haveCategories?data[i]:data[i].y
                    if(value<valueConfig){
                        groupSeries.y+=value
                        if(!haveCategories){
                            data[i].percent= (value/sum*100).toFixed(2)
                            groupSeries.customTooltip.push(data[i])    
                        }
                        else{
                            groupSeries.customTooltip.push({name: categories[i], y:value, percent:(value/sum*100).toFixed(2)})
                        }
                        categories.splice(i,1)
                        data.splice(i,1)
                        i--
                    }
            }}else{
                for(let i =0; i< data.length; i++){
                    let value = haveCategories?data[i]:data[i].y
                    if(value/sum*100<valueConfig){
                        groupSeries.y+=value
                        if(!haveCategories){
                            data[i].percent= (value/sum*100).toFixed(2)
                            groupSeries.customTooltip.push(data[i])    
                        }
                        else{
                            groupSeries.customTooltip.push({name: categories[i], y:value, percent:(value/sum*100).toFixed(2)})
                        }
                        categories.splice(i,1)
                        data.splice(i,1)
                        i--
                    }
                }   
            }
            if(haveCategories){
                categories.push(groupSeries.name)
            }
            data.push(groupSeries)
        },
    
    countSeriesDisplay(data,valueConfig,name, categories, chartType){
        let haveCategories = categories.length>0
        let referenceData
        if(valueConfig>data.length){
            // this.$snotifyError(
            //     {},

            //     'validate value config',

            //     'Giá trị không thỏa mãn, số lượng hiển thị không thể lớn hơn tổng số lượng data'
            // );
            // return
        }
        let sum=0;
        if(haveCategories){
            data.map(a=>sum+=a)
            referenceData=util.cloneDeep(data).sort((a,b)=>{return b-a})[valueConfig>data.length?data.length-1:valueConfig]
        }
        else{
            data.map(a=>sum+=a.y)
            referenceData=util.cloneDeep(data).sort((a,b)=>{return b.y-a.y})[valueConfig>data.length?data.length-1:valueConfig].y
        }
        let count = 0
        let groupSeries={
            name:name,
            y:0,
            color: '',
            customTooltip:[]
        }
        for(let i =0; i< data.length; i++){
            let value = haveCategories?data[i]:data[i].y
            if(value<referenceData){
                groupSeries.y+=value
                if(!haveCategories){
                    data[i].percent= (value/sum*100).toFixed(2)
                    groupSeries.customTooltip.push(data[i])    
                }
                else{
                    groupSeries.customTooltip.push({name: categories[i], y:value, percent:(value/sum*100).toFixed(2)})
                }
                categories.splice(i,1)
                data.splice(i,1)
                i--
            }else{
                if(value==referenceData&& !count<valueConfig){
                    groupSeries.y+=value 
                    if(!haveCategories){
                        data[i].percent= (value/sum*100).toFixed(2)
                        groupSeries.customTooltip.push(data[i])    
                    }
                    else{
                        groupSeries.customTooltip.push({name: categories[i], y:value, percent:(value/sum*100).toFixed(2)})
                    }
                    categories.splice(i,1)
                    data.splice(i,1)
                    i--
                }
                count++
            }
            
            
        }
        if(haveCategories){
            categories.push(groupSeries.name)
        }
        data.push(groupSeries)
    },
    totalSeriesGroup(data,valueConfig,name,categories, chartType){
        let haveCategories = categories.length>0
        let sortedData
        let percentData = chartType!=""
        let sum=0;
        if(haveCategories){
            sortedData=util.cloneDeep(data).sort((a,b)=>{return a-b})
        }else{
            
            data.map(a=>sum+=a.y)
        sortedData=util.cloneDeep(data).sort((a,b)=>{return a.y-b.y})
        }
        let groupSeries={
            name:name,
            y:0,
            color: '',
            customTooltip:[]
        }
        if(!percentData){
            for(let i=0;i<sortedData.length; i++){
                let value = haveCategories?sortedData[i]:sortedData[i].y
                if(groupSeries.y<=valueConfig&&groupSeries.y+value<=valueConfig){
                    groupSeries.y+=value 
                    let idxData
                    data.some((element,idx)=>{
                        if(JSON.stringify(element)==JSON.stringify(sortedData[i])){
                            idxData=idx
                            return true
                        }
                    })
                    if(!haveCategories){
                        data[idxData].percent= (value/sum*100).toFixed(2)
                        groupSeries.customTooltip.push(data[idxData])    
                    }
                    else{
                        groupSeries.customTooltip.push({name: categories[idxData], y:value, percent:(value/sum*100).toFixed(2)})
                    }
                    categories.splice(idxData,1)
                    data.splice(idxData,1)
                }
            }
        }else{
            for(let i=0;i<sortedData.length; i++){
                let value = haveCategories?sortedData[i]:sortedData[i].y
                if(groupSeries.y/sum*100<=valueConfig&&groupSeries.y/sum*100+value/sum*100<=valueConfig){
                    groupSeries.y+=value 
                    let idxData
                    data.some((element,idx)=>{
                        if(JSON.stringify(element)==JSON.stringify(sortedData[i])){
                            idxData=idx
                            return true
                        }
                    })
                    if(!haveCategories){
                        data[idxData].percent= (value/sum*100).toFixed(2)
                        groupSeries.customTooltip.push(data[idxData])    
                    }
                    else{
                        groupSeries.customTooltip.push({name: categories[idxData], y:value, percent:(value/sum*100).toFixed(2)})
                    }
                    categories.splice(idxData,1)
                    data.splice(idxData,1)
                }
            }
        }
        if(haveCategories){
                categories.push(groupSeries.name)
            }
        data.push(groupSeries)
    }
    },
};
