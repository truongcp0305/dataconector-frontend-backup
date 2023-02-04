import { syqlFunctionApi } from '@/api/SyqlFunction';
const getFunctionDetail = async (context, data) => {
    context.commit('setCurrentFunctionId', data);
    let res = await syqlFunctionApi.viewFunction(data);
    if (res.status == 200) {
        context.commit('setDetailFunction', res.data);
    }
};

export { getFunctionDetail };
