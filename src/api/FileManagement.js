import Api from './api';
import { appConfigs } from './../configs.js';

var coreApi = new Api(appConfigs.apiDomain.fileManagement);
export const fileManagementApi = {
    getFileByList(ids) {
        return coreApi.get('getFileByList', {
            ids: ids,
        });
    },
    // Cần thay đổi đường dẫn cho hợp lý hơn ở phía backend
    uploadFileSymper(data, options) {
        return coreApi.post('uploadS', data, {}, options);
    },
    download(id) {
        window.open(
            appConfigs.apiDomain.fileManagement + 'downloadS/' + id,
            '_blank',
        );
    },
    downloadFileByName(fileName) {
        window.open(
            appConfigs.apiDomain.fileManagement + 'download-by-name?fileName='+fileName,
            '_blank',
        );
    },
    // dowload nhiều file
    downloadListFile(ids) {
        return coreApi.post('downloadFile', { ids: ids });
    },
    downloadZip() {
        window.open(
            appConfigs.apiDomain.fileManagement + 'downloadZip',
            '_blank',
        );
    },
    /**
     *
     * @param {array} ids danh sách các id của các object cần lấy tổng số file đã gắn
     */
    getFileCountPerObj(ids) {
        return coreApi.get('countAttackment?ids=' + JSON.stringify(ids));
    },
    renameFile(id, newName) {
        return coreApi.get('renameFile/' + id + '/' + newName);
    },
};
