import { TranslatorHelper } from '../configPool/translatorHelper';
import ReportBase from './ReportBase';
export default class Spreadsheet extends ReportBase {
    constructor(symperId) {
        let styleKeys = {
            general: {
                title: 'v2.dashboard.general',
                items: [
                    'bgColor',
                    'borderColor',
                    'borderWidth',
                    'colorPalette',
                    'fontFamily',
                ],
            },
            title: {
                title: 'v2.dashboard.titleConfig',
                items: [
                    'alignment',
                    'bgColor',
                    'fontColor',
                    'show',
                    'textSize',
                    'titleText',
                ],
            },
        };
        super('spreadsheet', symperId, ['value'], styleKeys);
        this.changeConfigItems();
        this.setDefaultConnectConfig();
    }

    setDefaultConnectConfig() {
        this.rawConfigs.connectConfig = {
            file: {
                default: '',
                title: 'v2.dashboard.file',
                type: 'file',
                props: {
                    uploadDisplayName: '',
                },
                value: {
                    upload: {
                        url: '',
                        method: 'POST',
                        key: 'file',
                    },
                    info: {
                        id: '',
                        name: '',
                        size: 0,
                        displayName: '',
                    },
                    download: {
                        url: '',
                    },
                },
            },
            sheet: {
                default: '',
                title: 'v2.dashboard.sheet',
                type: 'text',
                value: '',
            },
            range: {
                default: '',
                title: 'v2.dashboard.range',
                type: 'text',
                value: '',
            },
            mapping: {
                default: [],
                title: 'v2.dashboard.mapping',
                type: 'table',
                value: [],
                columns: [
                    {
                        headerName: 'v2.dashboard.datasetColumn',
                        field: 'datasetColumn',
                        type: 'text',
                        width: 90,
                        editable: false,
                    },
                    {
                        headerName: 'v2.dashboard.spreadsheetColumn',
                        field: 'spreadsheetColumn',
                        type: 'text',
                        width: 90,
                    },
                ],
            },
        };
    }

    changeConfigItems() {
        this.configItems.push(
            {
                name: 'connectConfig',
                tag: 'connect-spreadsheet-config',
                text: 'bi.dashboard.connect-spreadsheet',
                icon: 'mdi-upload-network-outline',
            }
        );
    }

    async translate(rawConfig, data, extraData, changes = {}, oldOutput = {}) {
        let rsl = TranslatorHelper.getCommonCellStyleAttr(
            rawConfig.style,
            1,
        );
        rsl.shareLink = data.data.shareLink
            ? data.data.shareLink
            : 'https://ywb69zeduvn-my.sharepoint.com/:x:/g/personal/admin_symper_vn/EXNN68rx27FCrwXCGcEsiw8BUJJh80hLT_IIKhInOPJXOw?e=a647uv';
        rsl.shareLink += '?action=embedview';
        rsl.renderKey = Date.now();
        rsl.responseData = data.data
        return rsl;
    }

    getConfigToSave() {
        let cf = this.getConfigToSaveDefault();
        cf.extra.connectConfig = {};
        for (const key in this.rawConfigs.connectConfig) {
            cf.extra.connectConfig[key] =
                this.rawConfigs.connectConfig[key].value;
        }
        return cf;
    }

    restoreConfigFromSavedData(cell, customUIData) {
        this.restoreByDefault(cell, customUIData);
        let extraConfig = {};
        try {
            extraConfig = typeof cell.extra == 'string' ? JSON.parse(cell.extra) : (typeof cell.extra == 'object' ? cell.extra : {});
        } catch (error) {

        }
        if (extraConfig.connectConfig) {
            for (const key in extraConfig.connectConfig) {
                this.rawConfigs.connectConfig[key].value =
                    extraConfig.connectConfig[key];
            }
            this.rawConfigs.connectConfig.file.props.uploadDisplayName =
                extraConfig.connectConfig.file.info.displayName;
        }
    }
}
