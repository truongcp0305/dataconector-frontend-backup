<template>
    <v-card>
        <v-card-title class="headline pb-0" primary-title
            >{{$t('v2.app.syncDataWithServer')}}</v-card-title
        >
        <v-card-text>
            <v-list subheader two-line dense flat>
                <v-list-item-group v-model="settings" multiple>
                    <v-list-item
                        @click="handleSelectItem(key)"
                        v-for="(item, key) in needResolve"
                        :key="key"
                        style="min-height: 40px"
                    >
                        <template v-slot:default="{ active, toggle }">
                            <v-list-item-action class="mr-4">
                                <v-checkbox
                                    v-show="!resolving[key] && !resolved[key]"
                                    v-model="item.selected"
                                    color="primary"
                                    @click="toggle"
                                ></v-checkbox>
                                <v-progress-circular
                                    v-show="resolving[key] && !resolved[key]"
                                    :indeterminate="resolving[key]"
                                    :value="0"
                                    size="20"
                                    class="ml-2"
                                ></v-progress-circular>
                                <v-icon v-show="resolved[key]" color="green"
                                    >mdi-check-bold</v-icon
                                >
                            </v-list-item-action>

                            <v-list-item-content>
                                <v-list-item-title>{{
                                    item.name
                                }}</v-list-item-title>
                                <v-list-item-subtitle>{{
                                    item.create_time
                                }}</v-list-item-subtitle>
                            </v-list-item-content>
                        </template>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="removeBacklogRequest()" text
                >{{$t('v2.app.removeFromList')}}</v-btn
            >
            <v-btn color="primary" @click="syncBacklogRequest()">{{$t('v2.app.sync')}}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
export default {
    data() {
        return {
            settings: [],
        };
    },
    methods: {
        syncBacklogRequest() {
            this.$emit('sync-backlog-request');
        },
        removeBacklogRequest() {
            this.$emit('remove-backlog-request');
        },
        closeDialog() {
            this.$emit('close-dialog');
        },
        handleSelectItem(key) {
            this.$emit('change-select-item', key);
        },
    },
    props: {
        resolved: {
            default() {
                return {};
            },
        },
        needResolve: {
            default() {
                return {};
            },
        },
        resolving: {
            default() {
                return {};
            },
        },
    },
};
</script>

<style></style>
