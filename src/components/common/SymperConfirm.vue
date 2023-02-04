<template>
    <v-dialog
        v-model="showDialog"
        persistent
        :max-width="maxWidth"
        style="z-index: 1001"
    >
        <v-card>
            <v-card-title class="headline fs-16"> {{ title }} </v-card-title>
            <v-card-text class="fs-13"> {{ content }} </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="cancel">
                    {{ $t('v2.general.cancel') }}
                </v-btn>
                <v-btn color="green darken-1" text @click="confirm">{{
                    $t('v2.general.agree')
                }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        maxWidth: {
            type: Number,
            default: 290
        }
    },
    data() {
        return {
            showDialog: false,
            content: '',
            title: ''
        };
    },
    methods: {
        confirm() {
            this.showDialog = false;
            this.$emit('confirm');
        },
        cancel() {
            this.showDialog = false;
        },
        show(title, content) {
            this.title = title;
            this.content = content;
            this.showDialog = true;
        }
    }
};
</script>

<style></style>
