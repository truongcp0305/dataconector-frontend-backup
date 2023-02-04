import { util } from '@/plugins/util';
export default class NodeIO {
    constructor(
        idDataset = 0,
        columnName = '',
        type = '',
        symperDocId = 0,
        title = '',
        uid,
        from,

        prevTrackId = null,
        trackId = null,
        added = false,
    ) {
        this.uid = uid;
        this.idDataset = idDataset;
        this.columnName = columnName;
        this.type = type;
        this.symperDocId = symperDocId;
        this.title = title;
        this.from = from;

        this.trackId = trackId;
        this.prevTrackId = prevTrackId;

        this.added = added;
        if (!trackId) {
            if (!prevTrackId) {
                this.trackId = 'auto_create_' + util.str.randomString(10);
            } else {
                this.trackId = prevTrackId;
            }
        }
    }
}
