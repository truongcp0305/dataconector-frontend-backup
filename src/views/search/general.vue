<template>
    <div style="width: 100%; height: 100%">
        <v-card class="d-flex justify-start" height="100%">
            <GeneralView />
        </v-card>
    </div>
</template>

<script>
import GeneralView from '../../../src/components/search/GeneralView.vue';
export default {
    components: {
        GeneralView,
    },
};
</script>
