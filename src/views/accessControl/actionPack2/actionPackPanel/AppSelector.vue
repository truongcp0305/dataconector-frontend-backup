<template>
    <div class="d-flex list-item-selector align-center w-100">
        <span class="fs-13 fw-500 ml-1" style="width: 100px"> {{ name }}:</span>
        <v-btn
            tile
            depressed
            x-small
            class="ml-1 mr-2 add-app"
            v-if="!selectingApp && showBtn"
            @click="selectApplication"
        >
            <v-icon x-small> mdi-plus-thick </v-icon>
        </v-btn>
        <v-autocomplete
            ref="selectApp"
            max-width="100"
            style="max-width: 200px"
            class="autocomplete ml-1"
            v-model="app"
            :items="listItem"
            dense
            chips
            v-if="selectingApp"
            item-text="name"
            return-object
            small-chips
            multiple
            @change="handleChange"
        >
            <template v-slot:item="data">
                <span class="fs-13">
                    {{ data.item.name }}
                </span>
            </template>
        </v-autocomplete>
        <v-sheet style="max-width: calc(100% - 209px)">
            <v-chip-group mandatory show-arrows class="select-items">
                <v-chip
                    v-for="value in listAppSelected"
                    :key="value.id"
                    small
                    label
                    :class="{
                        'orange--text text--accent-4 v-chip--active':
                            appSelected == value.id
                    }"
                    class="fs-13"
                    @click="handleAppClick(value)"
                >
                    {{ value.name }}
                    <v-icon
                        :size="13"
                        class="ml-2 btn-delete"
                        @click.stop="confirmDeleteApp(value)"
                        >mdi-close</v-icon
                    >
                </v-chip>
            </v-chip-group>
        </v-sheet>
        <SymperDialogConfirm
            @confirm="deleteApp"
            @cancel="cancelDeleteApp"
            :showDialog="showDialogConfirm"
            :title="
                typeSelect == 'app'
                    ? $t('v2.acessControl.titleConfirmDeleteApp')
                    : $t('v2.acessControl.titleConfirmDeleteKanban')
            "
        />
    </div>
</template>

<script>
import SymperDialogConfirm from '@/components/common/SymperDialogConfirm';
export default {
    props: {
        name: {
            type: String,
            default: ''
        },
        showBtn: {
            type: Boolean,
            default: true
        },
        appSelected: {
            type: String,
            default: ''
        },
        typeSelect: {
            type: String
        },
        listItem: {
            type: Array,
            default() {
                return [];
            }
        },
        listAppSelected: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    created() {
        this.$evtBus.$on('hide-btn-add-app', () => {
            this.selectingApp = false;
        });
    },
    components: { SymperDialogConfirm },
    data() {
        return {
            selectingApp: false,
            app: null,
            isShowApp: false,
            showDialogConfirm: false,
            appDelete: null
        };
    },
    methods: {
        selectApplication() {
            this.selectingApp = true;
        },
        cancelSelect() {
            this.selectingApp = false;
        },
        handleAppClick(app) {
            this.$emit('item-selected', app.id);
        },
        handleChange() {
            let input = $('.v-autocomplete').find('input')[2];
            this.$emit('list-item-selected', this.app[0]);
            this.app = [];
            setTimeout(() => {
                input.click();
            }, 0);
        },
        confirmDeleteApp(app) {
            this.showDialogConfirm = true;
            this.appDelete = app;
        },
        cancelDeleteApp() {
            this.showDialogConfirm = false;
            this.appDelete = null;
        },
        deleteApp() {
            this.$emit('delete-item', this.appDelete);
            this.showDialogConfirm = false;
            this.$emit('change-selected-item', this.appDelete);
        }
    }
};
</script>

<style scoped>
.list-item-selector >>> .v-chip--select {
    display: none !important;
}
.list-item-selector >>> .btn-delete {
    padding: 2px;
}
.list-item-selector >>> .btn-delete:hover {
    background-color: #d3c9c97d;
    border-radius: 50%;
}
</style>
