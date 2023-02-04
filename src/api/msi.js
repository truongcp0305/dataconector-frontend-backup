import Api from './api';
import { appConfigs } from './../configs.js';
let msiService = new Api(appConfigs.apiDomain.msi);

export const MSIService = {
    uploadFile(formData, options = {}) {
        return msiService.post('upload-file', formData, {}, options);
    },
};
