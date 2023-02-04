<template>
    <div id="modalImage" class="modal kh-handson">
        <div class="modal-content">
            <div class="kh-handson-header kh-showFile">
                <h2 style="width: 95%">{{ name }}</h2>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon
                            v-on="on"
                            v-if="type != 'document_backup'"
                            class="fs-17 btn-download"
                            @click.stop="downloadFile"
                            >mdi-download</v-icon
                        >
                        <v-icon
                            v-on="on"
                            v-else
                            class="fs-17 btn-restore"
                            @click.stop="downloadFile"
                            >mdi-backup-restore</v-icon
                        >
                    </template>
                    <span v-if="type != 'document_backup'">{{
                        $t('kh.contextmenu.download')
                    }}</span>
                    <span v-else>{{ $t('kh.sidebar.restore') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon
                            v-on="on"
                            class="btn-closes-handson fs-17"
                            style="margin-left: 5px"
                            @click="invertStatusShowImage"
                            >mdi-close</v-icon
                        >
                    </template>
                    <span>{{ $t('common.close') }}</span>
                </v-tooltip>
            </div>

            <div v-if="type === 'jpg' || type === 'png' || type === 'jpeg'">
                <hr />
                <img class="image-modal" :src="serverPath" alt />
            </div>

            <div
                class="div-show-content"
                v-else-if="
                    type === 'doc' ||
                    type === 'docx' ||
                    type === 'xlsx' ||
                    type === 'txt'
                "
            >
                <iframe
                    class="show-content"
                    :src="`https://docs.google.com/gview?url=${serverPath}&embedded=true`"
                ></iframe>
            </div>
            <!-- <div class="div-show-content" v-else-if="type==='txt'">
        <iframe class="show-content" :src="serverPath"></iframe>
      </div> -->
            <div
                class="div-show-content"
                v-else-if="type === 'document_backup'"
            >
                <div class="show-content" v-html="docContent"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: String,
            default: '',
        },
        fileId: {
            type: String,
            default: -1,
        },
        name: {
            type: String,
            default: 'Image',
        },
        serverPath: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: '',
        },
        docContent: {
            type: String,
            default: '',
        },
    },
    data() {
        return {};
    },
    methods: {
        invertStatusShowImage() {
            this.$store.commit(
                'kh/changeStatusShowImage',
                !this.skh.statusShowImage,
            );
        },
        downloadFile() {
            if (this.type != 'document_backup') {
                let data = {};
                data.fileId = this.fileId;
                data.type = this.type;
                this.$emit('downloadOrBackupFile', data);
            } else if (this.type == 'document_backup') {
                let data = {};
                data.id = this.id;
                data.type = this.type;
                this.$emit('downloadOrBackupFile', data);
            }
            this.$store.commit(
                'kh/changeStatusShowImage',
                !this.skh.statusShowImage,
            );
        },
    },
    watch: {
        'skh.statusShowImage': function (newVl) {
            var modal = document.getElementById('modalImage');
            if (newVl == true) {
                modal.style.display = 'block';
            } else {
                modal.style.display = 'none';
            }
        },
    },

    computed: {
        skh() {
            return this.$store.state.kh;
        },
    },
};
</script>

<style scoped>
.kh-handson {
    background: white;
}

.modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    padding-top: 100px; /* Location of the box */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0); /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}
.kh-showFile {
    padding: 0px;
}
/* Modal Content */
.modal-content {
    height: 95%;
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    padding-top: 5px;
    border: 1px solid #888;
    width: 80%;
    overflow: scroll;
}
/* The Close Button */
.close {
    color: #aaaaaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close:hover,
.close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
}
.image-modal {
    display: block;
    margin-left: auto;
    margin-right: auto;
}
.div-show-content {
    height: 95%;
}
.show-content {
    border: none !important;
    border-top: 1px solid #aaaaaa !important ;
    width: 100%;
    height: 95%;
}
#modalImage {
    padding-top: 40px !important;
    z-index: 200 !important;
}
.btn-download {
    width: 24px !important;
    margin-top: 4px;
}
.btn-restore {
    width: 26px !important;
    height: 26px !important;
    margin-top: 5px;
    margin-right: 0px;
}
</style>
