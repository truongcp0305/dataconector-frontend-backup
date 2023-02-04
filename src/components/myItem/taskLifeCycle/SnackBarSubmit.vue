<template>
    <v-snackbar
        v-model="showSnackbar"
        :timeout="5000"
        :value="true"
        outlined
        right
        top
        multi-line
    >
        <div class="snackbar-submit d-flex flex-column fs-13">
            <span style="color: green" class="fs-15 mb-2">{{
                $t('myItem.taskLifeCycle.snackbar.title')
            }}</span>
            <div class="d-flex" style="height: 40px">
                <div style="width: 200px">
                    {{ $t('myItem.taskLifeCycle.snackbar.description') }}
                </div>
                <ListActionMenu
                    :snackbarMode="true"
                    :showResolveAction="showResolveAction"
                    :userType="userType"
                    :taskType="taskType"
                    @action-clicked="handlerActionClick"
                />
            </div>
            <div class="d-flex">
                <div style="width: 200px">
                    {{ $t('myItem.taskLifeCycle.snackbar.action') }}
                </div>
                <div>
                    <v-btn tile small icon @click="handlerEditClick">
                        <v-icon small> mdi-pencil-circle-outline </v-icon>
                    </v-btn>
                </div>
            </div>
        </div>
    </v-snackbar>
</template>

<script>
import ListActionMenu from './ListActionMenu';
export default {
    props: {
        userType: {
            type: String,
            default: '',
        },
        taskType: {
            type: String,
            default: '',
        },
        showResolveAction: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showSnackbar: false,
        };
    },
    components: {
        ListActionMenu,
    },
    methods: {
        clickShowSnackbar() {
            this.showSnackbar = true;
        },
        handlerEditClick() {
            this.showSnackbar = false;
            this.$emit('edit-clicked');
        },
        handlerActionClick(action) {
            this.showSnackbar = false;
            this.$emit('action-clicked', action);
        },
    },
};
</script>

<style scoped></style>
