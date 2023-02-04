<template>
    <textarea :id="'document-preview-editor-' + instance"> </textarea>
</template>
<script>
import Editor from '@tinymce/tinymce-vue';
import { getInsertionCSS } from '@/components/document/documentUtil.js';
export default {
    name: 'preview',
    props: {
        content: {
            type: String,
        },
        objectId: {},
        instance: {
            type: Number,
            default: Date.now(),
        },
    },
    components: {
        editor: Editor,
    },
    watch: {
        content(newVl) {
            if (this.editorCore) {
                this.editorCore.setContent(newVl);
            }
        },
    },
    mounted() {
        let self = this;
        tinymce.init({
            height: '100%',
            width: '100%',
            selector: '#document-preview-editor-' + self.instance,
            forced_root_block: 'div',
            menubar: false,
            branding: false,
            plugins: [
                'advlist autolink lists link image table print preview',
                ' fullscreen',
                'table paste hr',
            ],
            contextmenu: false,
            toolbar: false,
            valid_elements: '*[*]',
            content_css: [
                'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
            ],
            init_instance_callback: function (editor) {
                var style = $('<style data-reserved-styletag></style>').html(
                    getInsertionCSS(),
                );
                var clientFrameWindow = $(
                    '#document-preview-editor-' + self.instance + '_ifr',
                ).get(0).contentWindow;
                $(clientFrameWindow.document.head).append(style);
                editor.setContent(self.content);
                self.editorCore = editor;
            },
        });
    },
    data() {
        return {
            editorCore: null,
        };
    },
};
</script>
