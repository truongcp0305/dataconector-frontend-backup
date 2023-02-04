<template>
    <v-list-item dense two-line class="mt-2" style="background-color: #f8f8f8">
        <v-list-item-content>
            <v-list-item-title class="mb-2">
                <span
                    class="ms-2 button"
                    style="color: #636363; font-weight: 400"
                    >PostgresQL</span
                >
            </v-list-item-title>
            <v-list-item-title>
                <span class="ms-2 body-2 black--text">{{ item.sql }}</span>
            </v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                        small
                        class="me-3"
                        color="#636363"
                        @click.stop="$copyTextToClipboard(item.sql)"
                    >
                        mdi-content-copy
                    </v-icon>
                </template>
                <span>{{ $t('common.copy') }}</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                        class="me-3"
                        color="#636363"
                        @click="edit(item)"
                    >
                        mdi-pencil-outline
                    </v-icon>
                </template>
                <span>{{ $t('common.edit') }}</span>
            </v-tooltip>
            <v-tooltip bottom v-if="!isRunning">
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        dense
                        color="#636363"
                        v-bind="attrs"
                        v-on="on"
                        @click="run()"
                    >
                        mdi-play-outline
                    </v-icon>
                </template>
                <span>{{ $t('sqlQueryIDE.run') }}</span>
            </v-tooltip>
            <v-progress-circular
                indeterminate
                color="#FF8003"
                :size="13"
                width="2"
                class="mt-1"
                v-if="isRunning"
            >
            </v-progress-circular>
        </v-list-item-icon>
    </v-list-item>
</template>

<script>
export default {
    data() {
        return {
            isRunning: false,
        };
    },
    props: {
        item: { type: Object, default: null },
    },
    methods: {
        edit(x) {
            this.$evtBus.$emit('script-editor-ide-choose-history-query', x);
        },
        run() {
            this.isRunning = true;
            this.$emit('run', this.item);

            setTimeout(() => {
                this.isRunning = false;
            }, 800);
        },
    },
};
</script>

<style scoped>
.list-history {
    height: 315px;
}
button:hover {
    background: none !important;
}
button:focus {
    background: none !important;
}
.v-list-item__content {
    padding-top: 16px;
}
</style>
