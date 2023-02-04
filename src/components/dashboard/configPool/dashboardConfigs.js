/**
 * File phục vụ cho việc lấy các cấu hình mặc định của dashboards
 */
import { biApi } from '@/api/bi.js';
import { util } from '@/plugins/util';

export const getDefaultDashboardConfig = function () {
    return {
        cellConfigsHeight: '200px',
        cellContextMenu: {}, // chứa các context menu có thể có của cell đang được foucus
        colapsedPane: {
            // lưu lại trạng thái đóng mở của các tab cấu hình bên phải
            comment: true, // tab comment
            fields: false, // tab thông tin của các trường trong dataset
            globalFilter: true, // tab chứa thông tin của global filter
            viz: false, // tab chứa cấu hình lựa chọn report type và cấu hình của từng report
        },
        currentCellConfigs: {}, // cấu hình của report hiện tại đang được chọn
        dashboardConfigs: {
            allCellConfigs: {
                // cấu hình của tất cả các report có trong một dashboard
                // 'cell-1606808582716': {cấu hình của một report, theo cấu trúc kết quả của hàm getDefaultReportConfig trong file ./defaultReportConfig.js  }
            },
            info: {
                activePageIndex: 0, // index của page đang được mở lên
                activeTabIndex: 0, // index của page đang được mở lên
                currentTabPageKey: 'tab 1', // key của tab và page đang được mở lên
                dashboardName: '', // tên dashboard
                datasets: {}, // map các dataset được lựa chọn cho dashboard này, dạng: {id dataset : true}
                drillThrough: {
                    drillThrough: {
                        'tab 1': [],
                    },
                }, // cấu hình về drill through
                focusingDataPoint: {}, // điểm đang được foucus của các report khi click chuột phải hoặc click bằng chuột trái
                hasCopiedCell: false, // dashboard này đang có cell được copy ko
                layout: {
                    'tab 1': [],
                    '': [],
                }, // chứa config về layout của các tab trong dashboard: có những cell với vị trí, kích thước ntn

                lockWorkspace: false, // có đang khóa việc kéo thả các cell ko
                relations: [], // mảng chứa các id của relation được áp dụng trong dashboard
                isMobileLayout: false,
                // cau hinh cua mobile layout o day
                mobileLayout: {
                    vertical: {
                        layout: {},
                        chart: {},
                    },
                    horizontal: {
                        layout: {},
                        chart: {},
                    },
                },
                mobileLayoutDirection: 'vertical',
                tabsAndPages: {
                    tabs: [
                        {
                            name: 'tab 1',
                            active: true,
                        },
                        {
                            name: '',
                            active: true,
                        },
                    ],
                    // pages: ['page 1']
                }, // object chứa config của các tab trong dashboard
                theme: 'symper_default_dashboard_theme', // id theme được áp dụng cho dashboard
                variables: {},
                variablesValue: {},
                addedMeasures: {},
                reportSelfFilter: {
                    open: false,
                    pinned: false,
                },
                showOnHomePage: 1,
            },
        }, // cấu hình của toàn bộ dashboard này
        datasetsInRelationsMap: {}, //
        filter: {},
        isInitDashboard: true,
        loadedCellDataCount: 0,
        loadingData: false,
        needRemoteDataCellCount: 0,
        recentColors: [],
        allDatasetColumns: {}, // danh sách tất cả các dataset được sử dụng trong dashboard
    };
};
export const getDefaultDisplayOption = function () {
    return {
        symperTitle: {},
        general: {},
        data: [],
        contentSize: {
            h: 0,
            w: 0,
        },
    };
};

export const calcTitleCellHeight = function (textHeight) {
    return Number(textHeight) + 5;
};

export const calcReportWraperSize = function (vueComp, cell) {
    let size = util.getComponentSize(vueComp);
    let titleAttr = cell.rawConfigs.style.title.children;
    if (titleAttr.show.value) {
        size.h -= calcTitleCellHeight(titleAttr.textSize.value);
    }
    return size;
};

function mapDataToDatasetAndColumn(datasets, listColumnInDataset) {
    let datasetAndColumn = {};
    for (let dts of datasets) {
        dts.title = dts.alias_name ? dts.alias_name : dts.name;
        dts.show = true;
        dts.subDatasetIds = [];
        dts.isSelected = false;
        dts.columns = listColumnInDataset.columns[dts.id];

        for (let cl of dts.columns) {
            cl.show = true;
            cl.isSelected = false;
        }
        if (listColumnInDataset.subDatasets.length > 0) {
            let subDatasets = listColumnInDataset.subDatasets.filter((item) => {
                return item.id_parent == dts.id;
            });
            if (subDatasets.length > 0) {
                for (let i = 0; i < subDatasets.length; i++) {
                    if (i == 4) {
                    }
                    subDatasets[i].show = true;
                    subDatasets[i].isSubDataset = true;
                    subDatasets[i].title = subDatasets[i].alias_name
                        ? subDatasets[i].alias_name
                        : subDatasets[i].name;
                    subDatasets[i].isSelected = false;

                    dts.subDatasetIds.push(subDatasets[i].id);
                    datasetAndColumn[subDatasets[i].id] = subDatasets[i];
                    datasetAndColumn[subDatasets[i].id].columns =
                        listColumnInDataset.columns[subDatasets[i].id];
                    if (datasetAndColumn[subDatasets[i].id].columns) {
                        for (let clSub of datasetAndColumn[subDatasets[i].id]
                            .columns) {
                            clSub.show = true;
                            clSub.isSelected = false;
                        }
                    }
                }
            }
        }
        datasetAndColumn[dts.id] = dts;
    }
    return datasetAndColumn;
}

export const getColumnDataset = async function (
    listDataset,
    listColumnInDataset,
    inClickhouseMode,
) {
    let arrIds = [];
    let str = '';
    if (listDataset.length > 0) {
        for (let i = 0; i < listDataset.length; i++) {
            let datasetId = listDataset[i].id;
            if (!listColumnInDataset.columns[datasetId]) {
                arrIds.push(datasetId);
                str += datasetId + ',';
            }
        }
    }

    if (str.length > 0) {
        // call api get list column in dataset
        str = str.substring(0, str.length - 1);
        let res = await biApi.getColumnWithDatasetIds(
            str,
            inClickhouseMode,
            inClickhouseMode,
        );
        if (res['status'] == 200 && res['data']) {
            if (res['data'].columns) {
                listColumnInDataset.columns = Object.assign(
                    listColumnInDataset.columns,
                    res['data'].columns,
                );
                listColumnInDataset.subDatasets = Object.assign(
                    listColumnInDataset.subDatasets,
                    res['data'].subDatasets,
                );
            }
        }
    }

    let datasetAndColumn = mapDataToDatasetAndColumn(
        listDataset,
        listColumnInDataset,
    );
    return {
        datasetAndColumn: datasetAndColumn,
        listColumnInDataset: listColumnInDataset,
    };
};

export const getDefaultSeriesColor = function () {
    return [
        '#525252',
        '#fff2cc',
        '#fee599',
        '#ffd965',
        '#bf9000',
        '#7f6000',
        '#d9e2f3',
        '#b4c6e7',
        '#8eaadb',
        '#2f5496',
        '#1f3864',
        '#e2efd9',
        '#c5e0b3',
        '#a8d08d',
        '#538135',
        '#375623',
        '#f2f2f2',
        '#d8d8d8',
        '#bfbfbf',
        '#7f7f7f',
        '#3f3f3f',
        '#aeabab',
        '#3a3838',
        '#d6dce4',
        '#adb9ca',
        '#8496b0',
        '#323f4f',
        '#222a35',
        '#bdd7ee',
        '#9cc3e5',
        '#2e75b5',
        '#1e4e79',
        '#fbe5d5',
        '#f7cbac',
        '#f4b183',
        '#c55a11',
        '#833c0b',
        '#ededed',
        '#dbdbdb',
        '#c9c9c9',
        '#7b7b7b',
    ];
};

function getFilterAndCrossFilterCond(v, impactedDatasets, filterId) {
    let crossFilterCond = '';
    let selectedDataset = {};
    selectedDataset[v.dataset] = {};
    selectedDataset[v.dataset][v.name] = true;
    let filter = [];

    if (impactedDatasets) {
        let impactedCrossFilter = this.getImpactedCrossFilter(
            selectedDataset,
            impactedDatasets,
        );
        if (impactedCrossFilter) {
            crossFilterCond = impactedCrossFilter.dtsConds.join(' AND ');
        }

        if (filterId) {
            let allCells = this.dashboardConfigs.allCellConfigs;
            let cellFilter = allCells[filterId];
            let datasetId =
                cellFilter.rawConfigs.setting.value.selectedColums[0].dataset;
            if (
                selectedDataset.hasOwnProperty(datasetId) ||
                impactedCrossFilter
            ) {
                filter = this.filter[filterId];
            }
        }
    }

    return { filter, crossFilterCond };
}
