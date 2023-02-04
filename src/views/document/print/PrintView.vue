<template>
    <VuePerfectScrollbar class="wrap-print-multiple">
        <detail-view
            v-for="(value, index) in listObject"
            :key="index"
            :isPrint="true"
            :contentTableFilterPrint="contentTableFilterPrint"
            :contentHeight="'100%'"
            :formId="value.formId ? value.formId : 0"
            :docObjInfo="{
                docObjId: value.document_object_id,
                docSize: '595px',
            }"
            @after-loaded-component-detail="afterLoaded"
        />
    </VuePerfectScrollbar>
</template>

<script>
import Detail from './../detail/Detail';
import VuePerfectScrollbar from 'vue-perfect-scrollbar';
export default {
    components: {
        'detail-view': Detail,
        VuePerfectScrollbar,
    },
    data() {
        return {
            listObject: [],
            countComponentDetail: 0,
            formSize: {},
            contentTableFilterPrint: [],
        };
    },
    props: {
        allObject: {
            type: Array,
            default() {
                return [];
            },
        },
        isAlwaysPrint: {
            type: Boolean,
            default: true,
        },
    },
    created() {
        if (this.$route.params.extraData) {
            this.listObject = this.$route.params.extraData.listObject;
            this.contentTableFilterPrint = this.$route.params.extraData.content;
        }
    },
    watch: {
        allObject: {
            deep: true,
            immediate: true,
            handler(newVl) {
                this.listObject = newVl;
            },
        },
    },
    methods: {
        afterLoaded(formSize) {
            this.formSize = formSize;
            if (!this.isAlwaysPrint) {
                return;
            }
            this.countComponentDetail += 1;
            if (
                this.countComponentDetail == Object.keys(this.listObject).length
            ) {
                setTimeout(
                    (self) => {
                        self.printContent();
                    },
                    500,
                    this,
                );
            }
        },
        printContent(fromContext = false) {
            // Get HTML to print from element

            let prtHtml = $('.wrap-print-multiple').clone();
            prtHtml
                .find('.wrap-content-detail')
                .css({ height: '100%', overflow: 'hidden' });
            prtHtml = prtHtml.html();

            // Get all stylesheets HTML
            let stylesHtml = '';
            for (const node of [...document.querySelectorAll('link, style')]) {
                stylesHtml += node.outerHTML;
            }
            let contentHeight = $('.content-scroll')[0].scrollHeight;
            let cstyle =
                `<style type="text/css">
                         @media print {
                                html, body{
                                height:` +
                contentHeight +
                `px;
                                width:100%;
                          
                                }
                                .ag-root-wrapper, .ag-root-wrapper-body, .ag-root, .ag-body-viewport, .ag-center-cols-container, .ag-center-cols-viewport, .ag-center-cols-clipper, .ag-body-horizontal-scroll-viewport, .ag-virtual-list-viewport{
                                    height: 100% !important;
                                    overflow: hidden !important;
                                    display: flex !important;
                                    width: auto !important;
                                }
                                .ag-root-wrapper.ag-layout-print, .ag-root-wrapper.ag-layout-print .ag-root-wrapper-body, .ag-root-wrapper.ag-layout-print .ag-root, .ag-root-wrapper.ag-layout-print .ag-body-viewport, .ag-root-wrapper.ag-layout-print .ag-center-cols-container, .ag-root-wrapper.ag-layout-print .ag-center-cols-viewport, .ag-root-wrapper.ag-layout-print .ag-center-cols-clipper, .ag-root-wrapper.ag-layout-print .ag-body-horizontal-scroll-viewport, .ag-root-wrapper.ag-layout-print .ag-virtual-list-viewport{
                                        height: unset !important;
                                        width: auto !important;
                                        overflow: unset !important;
                                        display: block !important;

                                }
                                .ag-center-cols-viewport{
                                        border-top: 1px solid #dde2eb !important;
                                }
                                @page{
                                    margin-bottom :` +
                this.formSize['padding-bottom'] +
                `;
                                    margin-top :` +
                this.formSize['padding-top'] +
                `;
                                    margin-right :` +
                this.formSize['padding-right'] +
                `;
                                    margin-left :` +
                this.formSize['padding-left'] +
                `;
                                }
                                tr    { page-break-inside:avoid; page-break-after:always;}
                                thead { display:table-header-group }
                                tfoot { display:table-footer-group }
                                .wrap-print-multiple table{
                                    width:100% !important;
                                    height:100% !important;
                                }
                                .ps__rail-y{
                                    display:none
                                }
                                .ps__rail-x{
                                    display:none
                                }
                                .ps__thumb-y{
                                    display:none
                                }
                                .wrap-print-multiple{
                                    width:100%;
                                    height:100% !important;
                                }
                            }
                             .content-print-document{
                                padding: 0 !important;
                            }
                            
                    </style>`;
            stylesHtml += cstyle;
            // Open the print window
            const WinPrint = window.open(
                '',
                'Print',
                'width=800,height=900,toolbar=0,scrollbars=0,status=0',
            );
            WinPrint.document.write(`<!DOCTYPE html>
            <html>
            <head>
                ${stylesHtml}
            </head>
            <body>
                ${prtHtml}
            </body>
            </html>`);
            WinPrint.document.close(); // necessary for IE >= 10
            WinPrint.focus(); // necessary for IE >= 10*/
            setTimeout(() => {
                WinPrint.print();
                // WinPrint.close();
            }, 1000);
        },
    },
};
</script>
<style scoped>
.wrap-print-multiple {
    overflow: auto;
    height: calc(100%);
    width: 100%;
}
.wrap-print-multiple >>> .wrap-s-control-table table {
    width: 100% !important;
}
.wrap-print-multiple >>> .wrap-content-detail {
    overflow-y: hidden !important;
}
</style>
