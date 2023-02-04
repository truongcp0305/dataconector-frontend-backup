import { orgchartApi } from '../../api/orgchart';
import { SYMPER_APP } from '../../main';
import { util } from '../../plugins/util';

const action1 = (state, data) => {
    state.data = data;
};

const getAllStyleNode = async (context) => {
    if (context.state.allNodeStyle.length == 0) {
        try {
            let res = await orgchartApi.getListNodeStyle();
            if (res.status == 200) {
                context.commit('setNodeStyle', res.data);
            } else {
                SYMPER_APP.$snotifyError(error, 'Can not get all node style!');
            }
        } catch (error) {
            SYMPER_APP.$snotifyError(error, 'Can not get all node style !');
        }
    }
};
const updateUserInNode = (context, params) => {
    let data = context.state.orgChartData[params.orgchartId];
    params.list = [];
    if ((params.nodeType == 'department')) {
        params.data = data.departments.concat(data.positions);
        context.commit('updateDpmListChildrenNode', params);
    } else {
        params.data = data.positions;
        context.commit('updatePosListChildrenNode', params);
    }
};
const getUserByVizId = (context, params) => {
    params.data = [];
    let data = context.state.orgChartData[params.orgchartId];
    if ((params.nodeType == 'department') || (params.type == 'department')) {
        params.data = data.departments.concat(data.positions);
        params.listUser = [];
        params.list = [];
        context.commit('emptyListChildInCurrentNode');
        context.commit('getUserByVizId', params);
    } else {
        params.data = data.positions;
        params.listUser = [];
        params.list = [];
        context.commit('emptyListChildInCurrentNode');
        context.commit('getPosUserByVizId', params);
    }
};

const getAllOrgchartStruct = async (context, params) => {
    if (!context.state.getStructFlag) {
        let mapOrgchartNode = {};

        context.state.getStructFlag = true;
        let res = await orgchartApi.getAllOrgchartStruct();
        let mapOrgchartStruct = {};
        let orgcharts = res.data;

        for (let org of orgcharts) {
            let orgId = org.orgchart.id;
            mapOrgchartStruct[orgId] = org.orgchart;
            for (let dpm of org.departments) {
                mapOrgchartNode['orgchart:' + orgId + ':' + dpm.vizId] = dpm;
            }

            for (let pos of org.positions) {
                mapOrgchartNode['orgchart:' + orgId + ':' + pos.vizId] = pos;
            }
        }

        for (let org of orgcharts) {
            let orgId = org.orgchart.id;
            for (let dpm of org.departments) {
                let iden = 'orgchart:' + orgId + ':' + dpm.vizId;
                if (dpm.vizParentId == '') {
                    if (!org.hasOwnProperty('children')) {
                        org.orgchart.children = [];
                    }
                    org.orgchart.children.push(dpm);
                } else {
                    let parentIden =
                        'orgchart:' + orgId + ':' + dpm.vizParentId;
                    let parent = mapOrgchartNode[parentIden];
                    if (!parent.hasOwnProperty('children')) {
                        parent.children = [];
                    }
                    parent.children.push(dpm);
                }
            }

            for (let pos of org.positions) {
                // let parentIden = 'orgchart:' + orgId + ':' + pos.vizParentId;
                let parentIden =
                    'orgchart:' + orgId + ':' + pos.departmentVizId;
                let parent = mapOrgchartNode[parentIden];

                if (parent) {
                    if (!parent.hasOwnProperty('children')) {
                        parent.children = [];
                    }
                    pos.selected = false;
                    pos.identify = 'orgchart:' + orgId + ':' + pos.vizId;
                    parent.children.push(pos);
                }
            }
        }

        let orgchartsArr = [];
        for (let org of orgcharts) {
            orgchartsArr.push(org.orgchart);
        }
        context.commit('setAllOrgchartStruct', {
            tree: orgchartsArr,
            map: mapOrgchartNode,
        });
    }
};

export {
    getAllStyleNode,
    updateUserInNode,
    getAllOrgchartStruct,
    getUserByVizId,
};
