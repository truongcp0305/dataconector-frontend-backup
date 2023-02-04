<template>
    <div class="px-1" style="height: 100%">
        <!-- Search -->
        <v-row class="mx-1 pt-1">
            <v-col class="p-0">
                <v-text-field
                    solo
                    height="20"
                    dense
                    background-color="#F7F7F7"
                    flat
                    hide-details
                    :placeholder="$t('sqlQueryIDE.searchVariable')"
                    v-model="searchKey"
                    v-on:keyup.enter="searchData"
                >
                    <template v-slot:append>
                        <v-icon dense> mdi-magnify </v-icon>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <!-- Search end -->

        <!-- List variable -->
        <div class="mt-1" style="height: 97%" v-show="!isEmptyVariable">
            <VuePerfectScrollbar :style="{ height: '100%' }">
                <v-list dense nav class="p-0">
                    <v-list-item-group>
                        <template v-for="(item, index) in listVariable">
                            <v-hover v-slot:default="{ hover }">
                                <v-list-item
                                    :key="index"
                                    dense
                                    @click="chooseVariable(item)"
                                >
                                    <v-list-item-title class="py-1">
                                        <v-icon dense color="#666666"
                                            >mdi-variable</v-icon
                                        >
                                        <span class="ms-2 body-2 black--text">{{
                                            item
                                        }}</span>
                                    </v-list-item-title>
                                    <v-list-item-icon
                                        class="mb-0 mt-1"
                                        v-show="hover"
                                    >
                                        <v-dialog
                                            max-width="600"
                                            hide-overlay
                                            no-click-animation
                                        >
                                            <template
                                                v-slot:activator="{ on, attrs }"
                                            >
                                                <v-icon
                                                    dense
                                                    v-bind="attrs"
                                                    v-on="on"
                                                >
                                                    mdi-information-outline
                                                </v-icon>
                                            </template>
                                            <template v-slot:default="dialog">
                                                <v-card>
                                                    <v-toolbar
                                                        color="primary"
                                                        dark
                                                        >Opening from the
                                                        bottom</v-toolbar
                                                    >
                                                    <v-card-text>
                                                        <div
                                                            class="text-h2 pa-12"
                                                        >
                                                            Hello world!
                                                        </div>
                                                    </v-card-text>
                                                    <v-card-actions
                                                        class="justify-end"
                                                    >
                                                        <v-btn
                                                            text
                                                            @click="
                                                                dialog.value = false
                                                            "
                                                            >Close</v-btn
                                                        >
                                                    </v-card-actions>
                                                </v-card>
                                            </template>
                                        </v-dialog>
                                    </v-list-item-icon>
                                </v-list-item>
                            </v-hover>
                        </template>
                    </v-list-item-group>
                </v-list>
            </VuePerfectScrollbar>
        </div>
        <div
            class="mt-10 text-center"
            v-show="isEmptyVariable"
            style="width: 100%"
        >
            <p class="ms-2 mt-2" style="font-size: 14px">
                {{ $t('sqlQueryIDE.emptyColumn') }}
            </p>
        </div>
        <!-- List variable end -->
    </div>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

export default {
    components: {
        VuePerfectScrollbar,
    },
    data() {
        return {
            searchKey: '',
            displayBtni: false,
            listVariable: [
                'TODAY',
                'BEGIN_WEEK',
                'END_WEEK',
                'BEGIN_MONTH',
                'END_MONTH',
                'BEGIN_YEAR',
                'END_YEAR',
                'TIMESTAMP',
                'PARENT_WORKFLOW',
                'CURRENT_WORKFLOW',
                'CURRENT_USER_ID',
                'CURRENT_USER',
                'CURRENT_USER_FULLNAME',
                'CURRENT_USER_EMAIL',
                'CURRENT_USER_PHONE',
                'CURRENT_USER_PHONE_NUMBER',
            ],
            cacheListVariable: '',
            isEmptyVariable: false,
        };
    },
    mounted() {
        this.cacheListVariable = this.listVariable;
    },
    methods: {
        searchData() {
            let key = this.searchKey.trim();
            if (key == false && key != '') {
                this.isEmptyVariable = true;
                return;
            }
            this.listVariable = this.cacheListVariable;
            if (key != '') {
                this.listVariable = this.listVariable.filter((value) => {
                    return value.includes(key.toUpperCase());
                });
                this.isEmptyVariable =
                    this.listVariable.length > 0 ? false : true;
            }
        },
        chooseVariable(x) {
            let name = " '{" + x + "}'";
            this.$evtBus.$emit('choose-column', name);
        },
    },
};
</script>

<style scoped>
.v-list-item--link:before {
    background-color: grey;
}
.list-variable {
    height: 345px;
}
button:hover {
    background: none !important;
}
button:focus {
    background: none !important;
}
</style>
