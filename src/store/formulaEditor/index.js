import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import defaultState from './defaultState';

const inBrowser = typeof window !== 'undefined';
const state =
    inBrowser && window.__INITIAL_STATE__
        ? window.__INITIAL_STATE__.category
        : defaultState;

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters,
};
