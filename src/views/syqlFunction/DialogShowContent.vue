<template>
    <v-dialog v-model="showDialog" persistent max-width="520">
        <v-card>
            <v-card-title class="headline">{{$t('v2.syql.detailFunction')}}</v-card-title>
            <v-card-text>
                <div class="ml-1">
                    {{ content }}
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green darken-1" text @click="cancel">
                    {{$t('v2.syql.close')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        content: {
            type: String,
            default: '',
        },
        showDialog: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        cancel() {
            this.$emit('cancel');
        },
    },
};
</script>

<style></style>
