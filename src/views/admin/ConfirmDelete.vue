<template>
    <v-row justify="center">
        <v-dialog v-model="showDialog" persistent max-width="400">
            <v-card>
                <v-card-title class="">
                    {{ $t('v2.admin.confirmDeleteTitle') }}
                </v-card-title>
                <v-card-text>
                    <span>
                        {{ $t('v2.admin.confirmDeleteContent') }}
                    </span>
                    <v-checkbox
                        v-show="checkHasPermission('delete_related_doc')"
                        v-model="selected"
                        :label="$t('v2.admin.deleteRelatedDoc')"
                    ></v-checkbox>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" text @click="cancel">
                        {{ $t('common.cancel') }}
                    </v-btn>
                    <v-btn color="green darken-1" text @click="confirmDelete">
                        {{ $t('common.delete') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>
<script>
import { util } from '@/plugins/util.js';
export default {
    data() {
        return {
            selected: false
        };
    },
    props: {
        showDialog: {
            type: Boolean,
            default: false
        },
        idItem: {
            type: String
        }
    },
    methods: {
        confirmDelete() {
            this.$emit('confirm', this.selected);
        },
        cancel() {
            this.$emit('cancel');
        },
        checkHasPermission(action) {
            let objectTypePermission =
                this.$store.state.app.userOperations['workflow_definition'];
            let hasCreatePermission = true;
            if (!util.auth.isSupportter()) {
                hasCreatePermission =
                    objectTypePermission &&
                    objectTypePermission[this.idItem] &&
                    objectTypePermission[this.idItem][action];
            }
            return hasCreatePermission;
        }
    }
};
</script>

<style></style>
