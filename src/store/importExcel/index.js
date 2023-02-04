import defaultState from './defaultState';
import * as mutations from './mutations';

export default {
    namespaced: true,
    mutations,
    state: defaultState,
};
