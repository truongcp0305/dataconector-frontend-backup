import { permissionApi } from '../../api/permissionPack';

const getAllPermission = async (context, data) => {
    let res = await permissionApi.getAllPermission();
    context.commit('setAllPermissionPack', res.data.listObject);
};

const getAllActionPack = async (context, data) => {
    let res = await permissionApi.getAllActionPack();
    context.commit('setAllActionPack', res.data.listObject);
};

export { getAllPermission, getAllActionPack };
