// xử lý phần drag
export const getFilesDataTransferItems = function (dataTransferItems) {
    function traverseFileTreePromise(item, path = '', folder) {
        return new Promise((resolve) => {
            if (item.isFile) {
                item.file((file) => {
                    file.filepath = path || '' + file.name; //save full path
                    folder.push(file);
                    resolve(file);
                });
            } else if (item.isDirectory) {
                let dirReader = item.createReader();
                dirReader.readEntries((entries) => {
                    let entriesPromises = [];
                    subfolder = [];
                    folder.push({ name: item.name, subfolder: subfolder });
                    for (let entr of entries)
                        entriesPromises.push(
                            traverseFileTreePromise(
                                entr,
                                path || '' + item.name + '/',
                                subfolder,
                            ),
                        );
                    resolve(Promise.all(entriesPromises));
                });
            }
        });
    }

    let files = [];
    return new Promise((resolve, reject) => {
        let entriesPromises = [];
        for (let it of dataTransferItems)
            entriesPromises.push(
                traverseFileTreePromise(it.webkitGetAsEntry(), null, files),
            );
        Promise.all(entriesPromises).then((entries) => {
            resolve(files);
        });
    });
};
export const fileTypes = {
    xlsx: 'mdi-microsoft-excel',
    txt: 'mdi-file-document-outline',
    csv: 'mdi-file-document-outline',
    pdf: 'mdi-file-pdf-outline',
    mp3: 'mdi-radio',
    rar: 'mdi-folder-zip-outline',
    zip: 'mdi-folder-zip-outline',
    docx: 'mdi-file-word-outline',
    doc: 'mdi-file-word-outline',
    pptx: 'mdi-microsoft-powerpoint',


    mp4: 'mdi-file-video-outline',
    webm: 'mdi-file-video-outline',
    flv: 'mdi-file-video-outline',
    mov: 'mdi-file-video-outline',
    mpg: 'mdi-file-video-outline',
    m4v: 'mdi-file-video-outline',
    '3gv': 'mdi-file-video-outline',

    jpg: 'mdi-file-image',
    jpeg: 'mdi-file-image',
    png: 'mdi-file-image',
    gif: 'mdi-file-image',
    svg: 'mdi-file-image',
    webp: 'mdi-file-image',

    // 'js': 'mdi-file-code-outline',
    // 'php': 'mdi-file-code-outline',
    // 'html': 'mdi-file-code-outline',
    // 'py': 'mdi-file-code-outline',
    // 'java': 'mdi-file-code-outline',
    // 'sql': 'mdi-file-code-outline',

    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        'mdi-microsoft-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document ':
        'mdi-file-document-outline',
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 'mdi-file-word-outline',
    'application/pdf': 'mdi-file-pdf-outline',
    // 'application/x-msdownload':'mdi-file-pdf-outline',
    'video/webm': 'mdi-file-video-outline',
    'application/x-zip-compressed': 'mdi-folder-zip-outline',
    'image/jpeg': 'mdi-file-image',
    'image/png': 'mdi-file-image',

};
