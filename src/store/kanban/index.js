import * as mutations from './mutations';
import defaultState from './defaultState';

export default {
    namespaced: true,
    state: defaultState,
    mutations,
};
