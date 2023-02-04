<template>
    <textarea :id="'document-preiview-editor-' + keyInstance"> </textarea>
</template>

<script>
import Editor from '@tinymce/tinymce-vue';
import tinymce from 'tinymce/tinymce';
import { getInsertionCSS } from './../../../components/document/documentUtil.js';
export default {
    name: 'app',
    components: {
        editor: Editor,
    },
    props: {
        content: {
            type: String,
            default: '',
        },
    },
    mounted() {
        let self = this;
        tinymce.init({
            theme: 'silver',
            skin: 'oxide',
            selector: '#document-preiview-editor-' + self.keyInstance,
            forced_root_block: 'div',
            toolbar_items_size: 'small',
            menubar: false,
            branding: false,
            draggable_modal: true,
            toolbar_mode: 'sliding',
            plugins: [
                'advlist autolink lists link image table print preview',
                ' fullscreen',
                'table paste hr',
            ],
            contextmenu: 'inserttable table | settingtable | dragTable',
            toolbar:
                'undo redo | fontselect fontsizeselect formatselect pageSize',
            valid_elements: '*[*]',
            content_css: [
                'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
            ],
            init_instance_callback: function (editor) {
                self.editorCore = editor;
                self.initEditor();
            },
        });
    },
    methods: {
        setContent(vl) {
            this.editorCore.setContent(vl);
        },
        initEditor() {
            var style = $('<style data-reserved-styletag></style>').html(
                getInsertionCSS(),
            );
            var clientFrameWindow = $(
                '#document-preiview-editor-' + this.keyInstance + '_ifr',
            ).get(0).contentWindow;
            $(clientFrameWindow.document.head).append(style);
        },
    },
    data() {
        return {
            keyInstance: Date.now(),
            editorCore: null,
        };
    },
};
</script>
