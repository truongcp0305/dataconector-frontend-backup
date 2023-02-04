<template>
    <v-dialog v-model="isShowModalErr" persistent width="800" scrollable>
        <v-card height="550">
            <v-card-title class="headline">{{$t('v2.doc.notify')}}</v-card-title>
            <v-divider></v-divider>
            <v-card-text style="height: calc(100% - 112px); overflow: auto">
                <v-list-item
                    dense
                    v-for="(err, index) in listError"
                    :key="index"
                >
                    <v-list-item-content>
                        <v-list-item-title v-html="err"></v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-card-text>
            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn color="green darken-1" text right @click="hideDialog">
                    {{$t('v2.doc.close')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    props: {
        listErr: {
            type: Array,
            default: [],
        },
    },
    watch: {
        listErr(after) {
            this.listError = after;
        },
    },

    data() {
        return {
            isShowModalErr: false,
            listError: [],
            dialogType: false,
        };
    },

    methods: {
        showDialog(type = false) {
            this.isShowModalErr = true;
            this.dialogType = type;
        },
        hideDialog() {
            this.isShowModalErr = false;
            this.$emit('after-close-dialog', this.dialogType);
        },
    },
    mounted() {},
};
</script>
<style scoped></style>
