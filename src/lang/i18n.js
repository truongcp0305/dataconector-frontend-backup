import Vue from 'vue';
import VueI18n from 'vue-i18n';
import vnMessage from './vn.json';
import enMessage from './en.json';
import { util } from './../plugins/util.js';


Vue.use(VueI18n);


const messages = {
    vn: vnMessage,
    en: enMessage,
};

let locale = util.getSavedLocale();
const i18n = new VueI18n({
    locale: locale, // set locale
    messages,
    fallbackLocale: 'en',
});

export default i18n;
