<template>
    <v-dialog
        v-model="showDialogDelete"
        persistent
        max-width="400"
        content-class="overflow-hidden"
        style="z-index: 1001"
    >
        <v-card>
            <v-card-title class="headline fs-16">{{
                $t('v2.dashboard.deleteLink')
            }}</v-card-title>
            <v-card-text class="fs-13">
                <div class="d-flex flex-column align-center mt-1">
                    <div>
                        {{ linkInfor.source }}
                    </div>
                    <v-icon> mdi-arrow-down </v-icon>
                    <div>
                        {{ linkInfor.target }}
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="cancelDelete">{{
                    $t('v2.dashboard.cancel')
                }}</v-btn>
                <v-btn color="green darken-1" text @click="confirmDelete">{{
                    $t('v2.dashboard.delete')
                }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data() {
        return {
            showDialogDelete: false,
            linkInfor: {}
        };
    },
    methods: {
        cancelDelete() {
            this.showDialogDelete = false;
        },
        show(linkInfor) {
            this.showDialogDelete = true;
            this.linkInfor = linkInfor;
        },
        confirmDelete() {
            this.showDialogDelete = false;
            this.$emit('confirm-delete');
        }
    }
};
</script>

<style></style>
