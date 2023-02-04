<template>
    <div class="d-flex w-50 p-2" style="background: rgb(230, 229, 229)">
        <span style="font-size: 13px">
            {{ $t('document.instance.showlist.select') }}
            {{ taskIdLength }} / {{ totalObject }}
            {{ $t('common.tasks').toLowerCase() }}
        </span>
        <v-spacer></v-spacer>
        <v-btn
            x-small
            depressed
            dark
            color="red"
            @click="deleteTasks()"
            class="me-2"
        >
            <v-progress-circular
                indeterminate
                color="white"
                :size="15"
                :width="2"
                v-if="isDeleting"
            ></v-progress-circular>
            <span v-else>
                {{ $t('common.delete') }}
            </span>
        </v-btn>
        <v-btn x-small depressed dark color="success" @click="cancel()">
            {{ $t('common.cancel') }}
        </v-btn>
    </div>
</template>

<script>
export default {
    props: {
        taskIdLength: { type: Number, default: 0 },
        totalObject: { type: Number, default: 0 },
        isDeleting: { type: Boolean, default: false },
    },
    data() {
        return {};
    },
    methods: {
        deleteTasks() {
            this.$emit('delete-tasks');
        },
        cancel() {
            this.$emit('cancel-delete');
        },
    },
};
</script>
