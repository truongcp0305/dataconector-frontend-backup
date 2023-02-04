<template>
    <div>
        <v-row justify="center">
            <v-dialog v-model="dialog" persistent max-width="309">
                <v-card>
                    <v-card-title class="text-title">
                        {{$t('v2.doc.contentConfirmDelete')}}
                    </v-card-title>
                    <v-card-text class="text-delconfirm"
                        >{{$t('v2.kanban.confirmDeleteCard')}}
                    </v-card-text>
                    <v-card-actions class="footer">
                        <v-spacer></v-spacer>
                        <v-btn
                            class="text-btn"
                            color="#000000"
                            text
                            @click="dialog = false"
                        >
                        {{$t('v2.doc.exit')}}
                        </v-btn>
                        <v-btn
                            class="text-btn"
                            color="#ED6B5F"
                            text
                            @click="delconfirm()"
                        >
                        {{$t('v2.doc.delete')}}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import Vuetify from 'vuetify';
export default {
    data() {
        return {
            dialog: false,
        };
    },
    props: {
        idEvent: {
            type: String,
        },
    },

    methods: {
        show() {
            this.dialog = true;
        },
        hide() {
            this.dialog = false;
        },
        delconfirm() {
            this.dialog = false;
            this.$emit('delconfirm', this.idEvent);
        },
    },
};
</script>

<style scoped>
.text-delconfirm {
    font-size: 13px !important;
    padding: 0 12px 0 12px !important;
    color: rgba(0, 0, 0, 0.8) !important;
}

.text-title {
    padding: 12px 12px 0px !important;
    font-size: 15px !important;
    font-weight: 600 !important;
}
.text-btn {
    margin: 0px !important;
    height: 22px !important;
    min-width: 28px !important;
    font-size: 12px !important;
    font-weight: 400 !important;
}
.footer {
    padding-top: 0px !important;
}
</style>
