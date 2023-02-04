<template>
    <div>
        <textarea :id="'editor-' + instance"> </textarea>
    </div>
</template>
<script>
import tinymce from 'tinymce/tinymce';

import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/table';
import 'tinymce/plugins/print';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/hr';
export default {
    data() {
        return {
            instance: Date.now(),
            editorCore: null,
        };
    },
    methods: {
        getData() {
            return this.editorCore.getContent();
        },
        setData(content) {
            return this.editorCore.setContent(content);
        },
    },
    mounted() {
        let self = this;
        tinymce.init({
            theme: 'silver',
            skin: 'oxide',
            selector: '#editor-' + this.instance,
            forced_root_block: 'div',
            toolbar_items_size: 'small',
            menubar: false,
            branding: false,
            draggable_modal: true,
            toolbar_mode: 'sliding',
            toolbar:
                'undo redo | fontselect fontsizeselect formatselect | bold italic forecolor backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist indent hr | table',
            fontsize_formats: '8px 10px 11px 12px 13px 14px 15px 16px',
            font_formats:
                'Roboto=Roboto,sans-serif; Andale Mono=andale mono,times;' +
                'Arial=arial,helvetica,sans-serif;' +
                'Arial Black=arial black,avant garde;' +
                'Book Antiqua=book antiqua,palatino;' +
                'Comic Sans MS=comic sans ms,sans-serif;' +
                'Courier New=courier new,courier;' +
                'Georgia=georgia,palatino;' +
                'Helvetica=helvetica;' +
                'Impact=impact,chicago;' +
                'Symbol=symbol;' +
                'Tahoma=tahoma,arial,helvetica,sans-serif;' +
                'Terminal=terminal,monaco;' +
                'Times New Roman=times new roman,times,serif;' +
                'Trebuchet MS=trebuchet ms,geneva;' +
                'Verdana=verdana,geneva;' +
                'Webdings=webdings;' +
                'Wingdings=wingdings,zapf dingbats',
            valid_elements: '*[*]',
            content_css: [
                'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
            ],
            init_instance_callback: function (editor) {
                self.editorCore = editor;
            },
        });
    },
};
</script>
<style>
.tox-statusbar__path-item {
    display: none !important;
}
</style>
