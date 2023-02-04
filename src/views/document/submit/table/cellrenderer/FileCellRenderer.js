import { SYMPER_APP } from '@/main.js';
import { getFilesDataTransferItems, fileTypes } from './../../uploadControl';

export default class FileCellRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.classList.add('upload-table');
        if (!params.node.rowPinned) {
            let control = params.control;
            const self = this;
            try {
                let value = null;
                if (control.type == 'image' && params.value) {
                    value = [{ serverPath: params.value, type: 'jpg' }];
                } else {
                    value = params.value ? JSON.parse(params.value) : null;
                }
                let div = '';
                let divAddFile = '';
                if (params.viewType != 'detail' && control.type != 'image') {
                    divAddFile = `
                    <div class="file-add upload-table-file-add px-1 mr-1" title="${SYMPER_APP.$t('v2.doc.addFile')}" >
                        <i class='mdi mdi-upload'></i>
                    </div>`;
                }
                if (value && value.length > 0) {
                    // trường hợp có nhiều file
                    let listImage = [];
                    let typeImage = ['jpg', 'png', 'gif', 'svg', 'jpeg'];
                    value.map((image) => {
                        if (typeImage.includes(image.type)) {
                            listImage.push(
                                '<img class="mr-1" style="object-fit: cover" src="' +
                                    image.serverPath +
                                    '" width="20" height="25">',
                            );
                        } else {
                            if (!fileTypes[image.type]) image.type = 'txt';
                            listImage.push(
                                '<div style="width:20px;float:left; border:1px solid lightgrey" class=" mx-1 pb-1"><i class="fs-30 mdi ' +
                                    fileTypes[image.type] +
                                    '"></i></div>',
                            );
                        }
                    });
                    div =
                        `
                    <div class="list-image upload-table-list-image" title="${SYMPER_APP.$t('v2.doc.addListFile')}
                    ">
                        ` +
                        listImage.join('') +
                        `
                    </div>`;
                    this.eGui.innerHTML = divAddFile + div;
                    this.eGui
                        .querySelector('.list-image')
                        .addEventListener('click', function (e) {
                            if (params.viewType != 'detail') {
                                if (params.tableEditable) {
                                    SYMPER_APP.$evtBus.$emit(
                                        'document-submit-add-list-file',
                                        {
                                            control: control,
                                            imgIdx: 0,
                                            row: params.value,
                                            inTable: true,
                                            focusCell:
                                                params.api.getFocusedCell(),
                                        },
                                    );
                                }
                            } else {
                                SYMPER_APP.$evtBus.$emit(
                                    'document-item-control-file-click',
                                    {
                                        control: control,
                                        imgIdx: 0,
                                        row: params.value,
                                        inTable: true,
                                    },
                                );
                            }
                        });
                } else {
                    // trường hợp không có file
                    this.eGui.innerHTML = divAddFile;
                }
                if (params.tableEditable) {
                    if (this.eGui.querySelector('.file-add')) {
                        this.eGui
                            .querySelector('.file-add')
                            .addEventListener('click', function (e) {
                                SYMPER_APP.$evtBus.$emit(
                                    'document-submit-image-click',
                                    {
                                        control: control,
                                        focusCell: params.api.getFocusedCell(),
                                        inTable: true,
                                    },
                                );
                            });
                    }
                    this.eGui.addEventListener('dragover', function (e) {
                        e.preventDefault();
                    });
                    this.eGui.addEventListener('drop', function (event) {
                        let items = event.dataTransfer.items;
                        event.preventDefault();
                        self.getFilesDataTransferItems(items).then((files) => {
                            control.focusCell = params.api.getFocusedCell();
                            SYMPER_APP.$evtBus.$emit(
                                'document-submit-drag-and-drop',
                                { fileInfo: files, control: control },
                            );
                        });
                    });
                }
            } catch (error) {
                console.warn(error);
            }
        }
    }
    getGui() {
        return this.eGui;
    }
    getFilesDataTransferItems(dataTransferItems) {
        return getFilesDataTransferItems(dataTransferItems);
    }
    destroy() {
        if (this.eGui && this.eGui.querySelector('.file-add')) {
            this.eGui
                .querySelector('.file-add')
                .removeEventListener('click', event);
        }
        if (this.eGui && this.eGui.querySelector('.list-image')) {
            this.eGui
                .querySelector('.list-image')
                .removeEventListener('click', event);
        }
    }
}
