<template>
    <div
        ref="container"
        :id="wrapperId"
        :style="{
            height: cellConfigs.viewConfigs.displayOptions.contentSize.h + 'px',
            overflow: 'auto',
        }"
        class="w-100 symper-report-editor-wrapper pa-2"
    ></div>
</template>

<script>
import tinymce from 'tinymce/tinymce';

import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/table';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/print';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/autoresize';

export default {
    components: {},
    props: {
        cellConfigs: {
            default() {
                return {};
            },
        },
        instanceKey: {
            defaul: '',
        },
        action: {
            default: 'create',
        },
    },
    data() {
        return {
            editor: null,
        };
    },
    watch: {
        'cellConfigs.': {
            deep: true,
            handler(newVl) {},
        },
    },
    computed: {
        wrapperId() {
            return (
                'dashboard-editor' +
                this.instanceKey +
                '-' +
                this.cellConfigs.sharedConfigs.cellId
            );
        },
    },
    methods: {
        getData() {
            return this.cellConfigs.rawConfigs.extra.content;
        },
        changeData(content) {
            this.$set(this.cellConfigs.rawConfigs.extra, 'content', content);
        },
        async initEditor() {
            if (this.action == 'view') {
                $(this.$refs.container).html(this.getData());
                return;
            }
            let self = this;
            let edtInstance = await tinymce.init({
                selector: '#' + this.wrapperId,
                theme: 'silver',
                skin: 'oxide',
                inline: true,
                menubar: false,
                plugins: [
                    'autolink',
                    'link',
                    'lists',
                    'media',
                    'image',
                    'table',
                    'fullscreen',
                    'emoticons',
                    'paste',
                    'codesample',
                    'quickbars',
                    'quickimage',
                ],
                block_formats:
                    'Paragraph=p;Header 1=h1;Header 2=h2;Header 3=h3;Header 4=h4;Header 5=h5;Header 6=h6',
                fontsize_formats:
                    '7pt 8pt 9pt 10pt 11pt 12pt 13pt 14pt 16pt 18pt 24pt 36pt 48pt',
                paste_data_images: true,
                quickbars_insert_toolbar: false,
                toolbar:
                    'undo redo | fontsizeselect formatselect | bold italic forecolor backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist| table',
                font_formats:
                    'Lato Black=lato; Roboto=roboto;Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Oswald=oswald; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats',
                content_style:
                    '@import url(`https://fonts.googleapis.com/css2?family=Lato:wght@900&family=Roboto&display=swap`)',
                init_instance_callback: function (editor) {
                    self.editor = editor;
                    editor.setContent(self.getData());
                },
                setup: function (editor) {
                    editor.on('change', function (e) {
                        if (self.delayTimer) {
                            clearTimeout(self.delayTimer);
                        }
                        self.delayTimer = setTimeout(() => {
                            self.changeData(editor.getContent());
                        }, 300);
                    });

                    editor.on('keyup', function (e) {
                        if (self.delayTimer) {
                            clearTimeout(self.delayTimer);
                        }
                        self.delayTimer = setTimeout(() => {
                            self.changeData(editor.getContent());
                        }, 300);
                    });
                },
            });
        },
    },
    mounted() {
        setTimeout(() => {
            this.initEditor();
        }, 100);
    },
};
</script>

<style>
.symper-dashboard-cell-wrapper.resizing .symper-report-editor-wrapper {
    overflow: hidden !important;
    height: calc(100% - 30px) !important;
}
</style>
