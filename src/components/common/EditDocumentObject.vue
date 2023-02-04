<template>
    <v-dialog
        :content-class="'dialog-edit-doc h-100'"
        v-model="showDialog"
        width="80%"
    >
        <div
            class="w-100 py-2 px-4 bg-white justify-space-between d-flex border-bottom-1"
        >
            <span class="float-left title">
                {{ $t('common.update') }} {{ $t('common.documents') }}
            </span>
            <div class="float-right">
                <v-btn
                    depressed
                    color="primary"
                    small
                    :loading="btnLoading"
                    @click="submitDocumentObject"
                    class="mr-2"
                >
                    {{ $t('tasks.header.submit') }}
                </v-btn>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn @click="hide" icon tile v-on="on" text small>
                            <v-icon small>mdi-close</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('common.close') }}</span>
                </v-tooltip>
            </div>
        </div>
        <div style="height: calc(100% - 50px)">
            <DocumentSubmit
                class="bg-white"
                v-if="showDocumentSubmit"
                :showSnackbarSuccess="false"
                ref="panelUpdateSubmitedDocument"
                :key="docucmentSubmitKey"
                :showSubmitButton="false"
                :action="'update'"
                :documentObjectId="parseInt(documentObjectId)"
                @submit-document-error="onSubmitError"
                @submit-document-success="onDocumentUpdateSuccess"
            />
        </div>
    </v-dialog>
</template>

<script>
import DocumentSubmit from '@/views/document/submit/Submit.vue';
export default {
    components: {
        DocumentSubmit,
    },
    data() {
        return {
            showDialog: false,
            btnLoading: false,
            showDocumentSubmit: true,
            docucmentSubmitKey: null,
        };
    },
    watch: {
        documentObjectId() {
            this.docucmentSubmitKey = Date.now();
        },
    },
    props: {
        documentObjectId: {
            type: String,
            default: '',
        },
    },
    methods: {
        show() {
            this.showDialog = true;
            this.showDocumentSubmit = false;
            setTimeout(
                (self) => {
                    self.showDocumentSubmit = true;
                },
                10,
                this,
            );
        },
        hide() {
            this.showDialog = false;
            this.$emit('cancel');
        },
        onSubmitError() {
            this.btnLoading = false;
            this.hide();
            this.$snotifiError(this.$t('v2.doc.error'), this.$t('v2.doc.errorSubmit'));
        },
        onDocumentUpdateSuccess() {
            this.btnLoading = false;
            this.hide();
            this.$emit('submit-success');
        },
        submitDocumentObject() {
            this.btnLoading = true;
            this.$refs.panelUpdateSubmitedDocument.handlerSubmitDocumentClick();
        },
    },
};
</script>

<style></style>
