<template>
    <div v-if="loading">
        <v-skeleton-loader
            class="mx-auto"
            max-width="auto"
            v-for="(item, index) in options"
            :key="index"
            :type="item.type"
            v-bind="item.props"
        ></v-skeleton-loader>
    </div>
</template>
<script>
export default {
    props: {
        options: {
            type: Array,
            default() {
                return [
                    {
                        type: 'article, actions,table-heading, list-item-two-line',
                        prop: {},
                    },
                    { type: 'article, actions', prop: {} },
                    {
                        type: 'table-heading, list-item-two-line, table-tfoot',
                        prop: {},
                    },
                    {
                        type: 'article, actions,table-heading, list-item-two-line',
                        prop: {},
                    },
                ];
            },
        },
    },
    data() {
        return {
            loading: true,
        };
    },
    methods: {
        show() {
            this.loading = true;
        },
        hide() {
            this.loading = false;
        },
    },
};
</script>
