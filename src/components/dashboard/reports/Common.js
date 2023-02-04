import Highcharts from 'highcharts';

/**
 * Cấu hình mặc định cho các chart trong dashboard với cấu trúc của highchart
 */
export const staticChartOptions = {
    lang: {
        numericSymbols: ['K', 'M', 'B', 'T', 'P', 'E'],
        thousandsSep: ',',
    },
    // colors: ['#01B8AA','#374649','#FD625E','#F2C80F','#5F6B6D','#8AD4EB','#FE9666','#A66999 #73B761','#4A588A','#ECC846','#CD4C46','#71AFE2','#8D6FD1','#EE9E64','#95DABB #074650','#009292','#FE6DB6','#FEB5DA','#480091','#B66DFF','#B5DAFE','#6DB6FF'],
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

export default {
    /**
     * Chuyển các cấu hình thành options tương ứng với các loại chart: line, column, bar, combo
     * @param {Array} data mảng dữ liệu của chart
     * @param {Object} columns Cấu hình cột của chart
     * @param {Object} style style của chart
     * @param {number} ratio tỷ lệ thu phóng của dashboard
     */
    linesAndColumns(
        data,
        columns,
        originStyle,
        chartType,
        stacking = undefined,
        ratio,
    ) {
        data = makeValuesToNumber(data, columns);
        columns = filterUnuseColumnsForGroup1(columns);
        let style = makeStyleMap(originStyle);
        let series = this.getSeriesOptions(data, columns, chartType, stacking);
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
            tooltip: {
                formatter: function () {
                    let decimal =
                        style.dataLabel.children.tooltipDecimalNumber.value;
                    let vl = Highcharts.numberFormat(this.y, decimal);
                    setFocusingPoint(originStyle.cellId, this.point.index);
                    return `<b>${this.x}</b><br>
                            <b>${this.series.name} : </b> ${vl}`;
                },
            },
        };
        rsl.xAxis.categories = series.xAxisCategory;
        let commonAttr = getCommonCellStyleAttr(style, ratio);
        rsl.chart = {
            backgroundColor: commonAttr.general.backgroundColor,
        };
        return Object.assign(commonAttr, rsl);
    },

    /**
     *  Lấy ra cấu hình của các series trong chart
     * @param {Array} data mảng dữ liệu của chart
     * @param {Object} columns cấu hình các cột của chart
     * @param {Number} ratio tỷ lệ thu phóng của dashboard
     */
    getSeriesOptions(data, columns, chartType, stacking) {
        let rsl = {
            xAxisCategory: [''],
            series: [],
        };
        let xAxisCol = false;
        let yAxisCol = columns.yAxis1.selectedColums[0];
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
            // có legend => chỉ xét một cột của một yaxis
            if (legendCols.length > 0) {
                let pivotData = getPivotArray(
                    data,
                    yAxisCol.as,
                    legendCols[0].as,
                    xAxisCol,
                );
                rsl.xAxisCategory = pivotData[0].slice(1);

                for (let i = 1; i < pivotData.length; i++) {
                    let type = yAxisCol.seryType
                        ? yAxisCol.seryType
                        : chartType;
                    rsl.series.push({
                        yAxis: 0,
                        zIndex: /line/i.test(type) ? 2 : 1,
                        stacking: stacking,
                        name: pivotData[i][0],
                        type: type,
                        data: pivotData[i].slice(1),
                    });
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
                            data: [data[0][yAxisCol.as]],
                        },
                    ];
                }
            }
        }
        return rsl;
    },
    applySeriesStyle(series, styles, ratio) {
        let colors = getColorsFromStyle(styles);
        for (let i in series) {
            series[i].color = colors[i];
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
                let alignValue = props.alignment.value;
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
                align: mapAlignment[st.alignment.value],
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
            style: getStyleItemsInConfig(st, '', ratio),
            formatter: function (options) {
                return getValueDecimal(this.y, 2, yAxis.unit.value, true);
            },
        };
        options.style.fontWeight = 300;
        return options;
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
            style: getStyleItemsInConfig(st, '', ratio),
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
};
/**
 * Chuyển đổi dạng
 * @param {Array} dataArray Data cần pivot dạng [{key1:value1}, {key2:value2}]
 * @param {*} rowKey key trong row để lấy dữ liệu cho row
 * @param {*} colKey key của row để lấy dữ liệu cho column
 * @param {*} dataIndex key của row để lấy dữ liệu đê tính giá trị
 */
function getPivotArray(dataArray, dataIndex, rowKey, colKey) {
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
    newCols.sort();
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
}
/**
 * Loại bỏ các cột không phù hợp với ràng buộc để tạo thành biểu đổ cho Group 1: là nhóm các chart line, column, bar, combo
 * @param {Object} columns cấu hình các cột cho việc lấy dữ liệu
 */
function filterUnuseColumnsForGroup1(columns) {
    let correctColumnConfigs = {
        legend: {
            selectedColums: [],
        },
        xAxis: {},
        yAxis1: {},
    };
    // Nếu có legend
    if (columns.legend.selectedColums.length > 0) {
        correctColumnConfigs.legend.selectedColums = [
            columns.legend.selectedColums[0],
        ]; // chỉ lấy cột đầu tiên của legend
        // Chỉ lấy cột đầu tiên của yAxis
        correctColumnConfigs.yAxis1.selectedColums =
            columns.yAxis1.selectedColums.length > 0
                ? [columns.yAxis1.selectedColums[0]]
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
}

/**
 * Chuyển từ dạng mảng các style thành dạng key value để dễ truy cập
 * @param {Array} style mảng các style
 */
function makeStyleMap(style) {
    let styleMap = {};
    for (let item of style) {
        styleMap[item.name] = item;
    }
    return styleMap;
}
/**
 * Chuyển giá trị của các row có chứa key bắt buộc là number thành number
 * @param {Array} data mảng dữ liệu của chart
 * @param {Objecgt} columns  Cấu hình các cột của chart
 */
function makeValuesToNumber(data, columns, keyword = 'yAxis') {
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
}

/**
 * Dịch các thông tin chung của tất cả các cell thành dạng css
 * @param {Object} commonAttr Object chứa thông tin về các thuộc tính chung của cell,
 * trùng với các thông tin ở hàm  getCommonAttr() trong file getAtyleAttesFuncs
 */
function getCommonCellStyleAttr(commonAttr, ratio) {
    let rsl = {
        general: getStyleItemsInConfig(
            commonAttr.general.children,
            'px',
            ratio,
        ),
        symperTitle: {
            text: commonAttr.title.children.titleText.value,
            style: getStyleItemsInConfig(
                commonAttr.title.children,
                'px',
                ratio,
            ),
        },
    };
    rsl.symperTitle.style.lineHeight = commonAttr.textSize.value + 5 + 'px';
    return rsl;
}

function getStyleItemsInConfig(st, sizeUnit = '', ratio) {
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
}
function getColorsFromStyle(style) {
    return style.general.children.colorPalette.value;
}
function setFocusingPoint(cellId, rowIndex) {
    // let focusingPoint = window.SDashboardEditor.dashboardConfigs.info.focusingDataPoint;
    // focusingPoint.cellId = cellId;
    // focusingPoint.dataRowIndex = rowIndex;
}
function getValueDecimal(num, decimalNum, mode, needUnit = false) {
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
}
