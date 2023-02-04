import Api from './api';
import { appConfigs } from './../configs.js';

var coreApi = new Api(appConfigs.apiDomain.sdocumentManagement);
var appApi = new Api(appConfigs.apiDomain.appManagement);
var formulasApi = new Api(appConfigs.apiDomain.formulasService);
var trashApi = new Api(appConfigs.apiDomain.trashService);
export const documentApi = {
    getListDocumentFilter(filter) {
        return coreApi.get('documents', filter);
    },
    getListDocument() {
        return coreApi.get('documents?pageSize=3000');
    },
    getSmallListDocument() {
        return coreApi.get('documents?pageSize=50');
    },
    // Lấy thông tin stt của control số chứng từ
    getCurrentNumberDocumentIdentifier(data) {
        return coreApi.post('documents/object-identifier', data);
    },
    getListDocumentObject(docId, filter) {
        return coreApi.post('documents/' + docId + '/objects', filter);
    },
    getListObjectByMultipleDocument(data) {
        return coreApi.post(
            'documents/objects-by-multiple-document',
            data,
            {},
            { contentType: 'application/json' },
        );
    },
    getBatchDocument(data) {
        return coreApi.post('documents/batch', data);
    },
    deleteAll(data) {
        return coreApi.delete('documents/objects', data);
    },
    saveDocument(data) {
        return coreApi.post('documents', data);
    },
    editDocument(data) {
        return coreApi.put('documents', data);
    },
    deleteDocument(ids) {
        return coreApi.delete('documents', ids);
    },
    moveToTrash(ids) {
        return coreApi.delete('documents/trash', ids);
    },

    detailDocument(id, data) {
        return coreApi.get('documents/' + id, data);
    },
    deleteDocumentObject(objectIds) {
        return coreApi.delete('documents/objects', objectIds);
    },
    deleteDocumentDraftObject(objectIds) {
        return coreApi.delete('documents/draft-objects', objectIds);
    },
    detailDocumentObject(objectId, data = {}) {
        return coreApi.get('documents/objects/' + objectId, data);
    },
    submitDocument(data) {
        return coreApi.post('documents/objects', data);
    },
    updateInfoDocumentObj(id, data) {
        return coreApi.put('documents/objects-info/' + id, data);
    },
    updateDocument(objId, data) {
        return coreApi.put('documents/objects/' + objId, data);
    },
    setEdittingDocument(data) {
        return coreApi.put('documents/editting', data);
    },
    saveMultiFormulas(data) {
        return formulasApi.post('/formulas/batch', data);
    },
    getListDocuments(data = {}) {
        return coreApi.get('documents', data);
    },
    uploadFile(data) {
        return coreApi.post('uploadFile', data);
    },

    getListApprovalHistory(objectId) {
        return coreApi.get('approval-histories/' + objectId);
    },
    checkExistDocument(name) {
        return coreApi.post('documents/check/' + name);
    },
    getBatchFieldInfoInDoc(data) {
        return coreApi.post('documents/fields/batch', data);
    },
    getFieldByDocId(name) {
        return coreApi.get('documents/' + name + '/fields');
    },
    updateFields(data) {
        return coreApi.put('fields/batch', data);
    },
    getDetailDocumentByName(data) {
        return coreApi.get('documents/by-name', data);
    },

    saveApprovalHistory(data) {
        return coreApi.post('approval-histores', data);
    },

    //draft
    submitDraftDocument(data) {
        return coreApi.post('documents/draft-objects', data);
    },
    updatePreDataForDoc(data) {
        return coreApi.post('documents/relations', data);
    },
    updatePreDataForField(data) {
        return coreApi.post('documents/fields/relations', data);
    },

    saveForm(data) {
        return coreApi.post('documents/forms', data);
    },
    searchListDocuments(filter) {
        return coreApi.get('documents', filter);
    },
    restoreDocument(data) {
        return coreApi.post('documents/trash', data);
    },
    restoreDocumentObject(data) {
        return coreApi.post('documents/objects/restore', data);
    },
    savePrintConfig(data) {
        return coreApi.post('documents/prints', data);
    },
    updatePrintConfig(data) {
        return coreApi.put('documents/prints', data);
    },
    deletePrintConfig(data) {
        return coreApi.delete('documents/prints', data);
    },
    getListPrintConfig(docId) {
        return coreApi.get('documents/' + docId + '/prints');
    },
    getPrintConfigActive(docId) {
        return coreApi.get('documents/' + docId + '/prints-active');
    },
    getDetailPrintConfig(docId, printConfigId) {
        return coreApi.get('documents/' + docId + '/prints/' + printConfigId);
    },
    updateActivePrintConfig(data) {
        return coreApi.patch('documents/prints', data);
    },
    saveControlTemplate(data) {
        return coreApi.post('control-templates', data);
    },
    editControlTemplate(id, data) {
        return coreApi.put('control-templates/' + id, data);
    },
    deleteControlTemplate(id) {
        return coreApi.delete('control-templates/' + id);
    },
    getControlTemplate() {
        return coreApi.get('control-templates');
    },
    getDetailControlTemplate(id) {
        return coreApi.get('control-templates/' + id);
    },
    deleteObjectInTrash(data) {
        return trashApi.post('items/delete-multi', data);
    },

    /**
     * index column
     */
    saveColumnIndex(data) {
        return coreApi.post('documents/indexs', data);
    },
    deleteIndex(uid, data) {
        return coreApi.delete('documents/indexs/' + uid, data);
    },
    getColumnIndex(documentId) {
        return coreApi.get('documents/' + documentId + '/indexs');
    },
    getFieldStruct(documentId) {
        return coreApi.get('documents/' + documentId + '/fields/struct');
    },
    getDocumentDefinitionByObject(data) {
        return coreApi.post('documents/definition-by-object', data);
    },
    getAppNameByDocIds(ids) {
        return appApi.get('apps-name-by-doc?ids=[' + ids + ']');
    },
    getExportExcel(docId, params) {
        return coreApi.post('documents/' + docId + '/export-excel', params);
    },
    getListObject(docId, filter) {
        return coreApi.get('documents/' + docId + '/objects', filter);
    },
    getMultiObjectByIds(data) {
        return coreApi.post('document-objects/get-by-ids', data);
        
    },
    filterDoc(filter) {
        return coreApi.get(
            'documents?filter[0][column]=name&filter[0][operation]=and&filter[0][conditions][0][name]=not_contain&filter[0][conditions][0][value]=task&search=' +
                filter +
                '&page=1&pageSize=50',
        );
    },
    getAllControl(idDoc) {
        return coreApi.get('fields/by-document/' + idDoc);
        
    },
    cloneObject(data) {
        return coreApi.post('documents/objects/clone', data);
    },
    restoreObject(docId, data) {
        return coreApi.post('documents/'+docId+'/restore-objects',data);
    },
};
