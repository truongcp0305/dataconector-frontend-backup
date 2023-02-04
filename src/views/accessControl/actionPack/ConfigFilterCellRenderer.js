import { SYMPER_APP } from '@/main.js';
export default class ConfigFilter {
    init(params) {
        if (!params.node.rowPinned) {
            this.eGui = document.createElement('div');
            let innerHTML =
                '<button style="height:24px; width:24px; margin-bottom:1px" type="button" class="v-btn add-filter-config theme--light">' +
                '<i aria-hidden="true" style="font-size:15px" class="v-icon notranslate mdi mdi-circle-edit-outline theme--light"></i>' +
                '</button>';
            if (!params.node.data.configFilter) {
                this.eGui.innerHTML = innerHTML;
                this.eGui
                    .querySelector('.add-filter-config')
                    .addEventListener('click', function (e) {
                        SYMPER_APP.$evtBus.$emit(
                            'click-add-filter-config-action-pack',
                            {
                                e: e,
                                objectIdentifier: params.node.data['object'],
                                params: params,
                                isTable: params.isTable,
                            },
                        );
                    });
            } else {
                let configFilter = params.node.data.configFilter;
                let filter = '';
                if (configFilter.length > 0) {
                    configFilter.map((fil) => {
                        let actions = '';
                        if (fil.actions.length > 0) {
                            fil.actions.map(
                                (act) =>
                                    (actions += `<span class="border-lightgrey bg-white" style="padding:1px; border-radius:4px; margin-right:3px">${act.headerName}</span>`),
                            );
                        }
                        if (fil.conditions.length > 0) {
                            fil.conditions.map((con) => {
                                filter = this.treeItemToJS(con);
                                innerHTML += `<div class="pa-1" 
                                    style=" margin-bottom:3px; border-radius:5px; background:#f2f2f2" >
                                    <div>${filter}</div>
                                    <div >${actions}</div>
                                    </div>`;
                            });
                            this.eGui.innerHTML =
                                "<div class='detail-filter-config '>" +
                                innerHTML +
                                '</div>';
                        }
                    });
                } else {
                    this.eGui.innerHTML = innerHTML;
                    this.eGui
                        .querySelector('.add-filter-config')
                        .addEventListener('click', function (e) {
                            SYMPER_APP.$evtBus.$emit(
                                'click-add-filter-config-action-pack',
                                {
                                    e: e,
                                    objectIdentifier:
                                        params.node.data['object'],
                                    params: params,
                                    isTable: params.isTable,
                                },
                            );
                        });
                }
                if (this.eGui.querySelector('.detail-filter-config')) {
                    this.eGui
                        .querySelector('.detail-filter-config')
                        .addEventListener('click', function (e) {
                            SYMPER_APP.$evtBus.$emit('detail-filter-config', {
                                e: e,
                                configFilter: configFilter,
                                objectIdentifier: params.node.data['object'],
                                params: params,
                                isTable: params.isTable,
                            });
                        });
                }
            }
        }
    }
    getGui() {
        return this.eGui;
    }
    treeItemToJS(node) {
        if (!node.condition) {
            let field = node.column ? node.column.name : '';
            let conditionName = `${field}`;
            return ` ${conditionName} `;
        } else if (node.condition) {
            let arrCond = [];
            for (let childNode of node.children) {
                let itemCond = this.treeItemToJS(childNode);
                arrCond.push(itemCond);
            }
            let opr = node.name == 'OR' ? 'or' : 'and';
            opr = `<span class="color-orange">${opr}</span>`;
            let cond = arrCond.join(opr);
            return ` (${cond}) `;
        }
    }
}
