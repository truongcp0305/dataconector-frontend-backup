<template>
    <v-list dense class="sym-document-list-action">
        <v-list-item
            v-for="(item, i) in items"
            :key="i"
            @click="action(item.action)"
        >
            <v-btn
                v-if="item.action == 'save-document'"
                :loading="isLoadingSaveDoc"
                :disabled="isLoadingSaveDoc"
                color="success"
                class="save-doc-btn"
            >
                <v-icon right dark class="mr-2"> mdi-content-save </v-icon>
                {{ item.text }}
                <template v-slot:loader>
                    <span class="custom-loader">
                        <v-icon light>mdi-cached</v-icon>
                    </span>
                </template>
            </v-btn>

            <div v-else-if="item.isBaInfo" style="font-weight: 500">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <div v-on="on">
                            <v-icon
                                small
                                style="
                                    font-size: 18px;
                                    background: #e6e6e6;
                                    border-radius: 50%;
                                    padding: 2px;
                                "
                                >mdi-incognito</v-icon
                            >
                            {{ item.text }}
                        </div>
                    </template>
                    <span>BA {{ item.text }} {{$t('v2.doc.editThisDoc')}}</span>
                </v-tooltip>
            </div>
            <v-list-item-title v-else>
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-icon v-on="on" small>{{ item.icon }}</v-icon>
                    </template>
                    <span>{{ item.text }}</span>
                </v-tooltip>
                <!-- <span class="title-save-doc" v-if="item.action == 'save-document'">{{item.text}}</span> -->
            </v-list-item-title>
        </v-list-item>
    </v-list>
</template>
<script>
export default {
    created() {
        if (this.$getRouteName() == 'editDocument') {
            let checkControlItem = {
                text: this.$t('v2.doc.checkControl'),
                icon: 'mdi-puzzle-check',
                action: 'check-control',
            };
            this.items.splice(5, 0, checkControlItem);
        }
    },
    data() {
        const self = this;
        return {
            items: [
                {
                    text: self.$t('v2.doc.cache'),
                    icon: 'mdi-wallet',
                    action: 'save-to-local-storage',
                },
                {
                    text: self.$t('v2.doc.fromCache'),
                    icon: 'mdi-cached',
                    action: 'get-from-local-storage',
                },
                {
                    text: self.$t('v2.doc.clearCache'),
                    icon: 'mdi-delete-circle',
                    action: 'delete-cache',
                },
                {
                    text: self.$t('v2.doc.cloneControl'),
                    icon: 'mdi-content-copy',
                    action: 'clone-control',
                },
                {
                    text: self.$t('v2.doc.deleleControl'),
                    icon: 'mdi-delete-forever',
                    action: 'delete-control',
                },
                {
                    text: self.$t('v2.doc.switchControlType'),
                    icon: 'mdi-swap-horizontal',
                    action: 'swap-type-control',
                },
                {
                    text: self.$t('v2.doc.saveControlTemplate'),
                    icon: 'mdi-content-save-move',
                    action: 'control-template',
                },

                {
                    text: self.$t('v2.doc.combiningControl'),
                    icon: 'mdi-cog',
                    action: 'list-control-option',
                },
                {
                    text: self.$t('v2.doc.inputPreview'),
                    icon: 'mdi-eye-settings-outline',
                    action: 'preview-submit',
                },
                {
                    text: self.$t('v2.doc.quickSave'),
                    icon: 'mdi-lightning-bolt',
                    action: 'quick-save-document',
                },
                {
                    text: self.$t('document.items.action.mobileConfig'),
                    icon: 'mdi-cellphone-cog',
                    action: 'open-mobile-config',
                },
                {
                    text: self.$t('v2.doc.save'),
                    icon: 'mdi-content-save',
                    action: 'save-document',
                },
            ],
            isLoadingSaveDoc: false,
        };
    },
    methods: {
        action(type) {
            if (
                (type == 'save-document' || type == 'quick-save-document') &&
                this.isLoadingSaveDoc == false
            ) {
                this.$emit('document-action-' + type);
            } else if (type != 'save-document') {
                this.$emit('document-action-' + type);
            }
        },
        hideSaveBtn(baInfo) {
            this.items.pop();
            this.items.push({ isBaInfo: true, text: baInfo });
        },
        hideLoading() {
            this.isLoadingSaveDoc = false;
        },
        showLoading() {
            this.isLoadingSaveDoc = true;
        },
    },
};
</script>
<style scoped>
.sym-document-list-action .v-list-item {
    cursor: pointer;
    padding: 0 8px;
}
.sym-document-list-action .v-list-item:hover {
    background: #fafafa;
}
/* action */
.sym-document-list-action {
    padding: 0;
    height: 30px;
    display: flex;
}

.sym-document-list-action .v-list-item {
    min-height: unset;
    flex: unset;
    margin: 3px;
    padding: 0 8px;
    border-radius: 4px;
}
.sym-document-list-action .v-list-item:last-child {
    margin-left: auto;
    margin-right: 8px;
}
.sym-document-list-action .v-list-item .v-list-item__icon {
    margin: 3px 0px 3px 0px !important;
}
.sym-document-list-action .v-list-item .v-list-item__title {
    font-size: 11px;
}
.sym-action__icon {
    height: 16px !important;
}
.title-save-doc {
    margin-left: 6px;
    display: inline-block;
    vertical-align: text-top;
}
.custom-loader {
    animation: loader 1s infinite;
    display: flex;
}
@-moz-keyframes loader {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}
@-webkit-keyframes loader {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}
@-o-keyframes loader {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}
@keyframes loader {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(360deg);
    }
}
.save-doc-btn {
    height: 30px !important;
    padding: 0 8px !important;
    font-size: 13px;
}
.sym-document-list-action >>> .v-list-item:last-child:hover::before {
    background: transparent !important;
}
</style>
