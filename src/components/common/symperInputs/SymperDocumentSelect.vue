<template>
    <v-autocomplete
        v-model="myValue"
        :items="docList"
        :search-input.sync="search"
        chips
        clearable
        hide-details
        flat
        small-chips
        :no-filter="true"
        height="28"
        item-text="name"
        class="sym-small-size"
        dense
        background-color="grey lighten-3"
        item-value="id"
        solo
        @change="applyChangeValue"
    >
        <template v-slot:selection="{ attr, on, item, selected }">
            <v-chip
                style="height: 22px"
                v-bind="attr"
                :input-value="selected"
                color=" white"
                class="fs-13 w-100"
                v-on="on"
            >
                <div class="d-inline-block text-ellipsis" style="width: 100%">
                    <span
                        v-text="item.id"
                        class="mr-2 font-weight-medium fs-12"
                    ></span>
                    <span
                        v-text="item.title ? item.title : item.name"
                        class="fs-12"
                    ></span>
                </div>
            </v-chip>
        </template>
        <template v-slot:item="{ item }">
            <div class="pa-2 font-weight-medium">
                <div class="d-flex fs-13">
                    <span v-text="item.id" class="mr-2"></span>
                    <span v-text="item.name"></span>
                </div>
                <div class="w-100 fs-12 text--grey">
                    <span v-text="item.title"></span>
                </div>
            </div>
        </template>
    </v-autocomplete>
</template>

<script>
export default {
    props: {
        value: {
            default: null,
        },
    },
    methods: {
        applyChangeValue(value) {},
    },
    created() {
        this.$store.dispatch('document/setListDocuments');
    },
    computed: {
        myValue: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit('input', value);
            },
        },
        docList() {
            if (this.search) {
                let searchKey = this.search;
                let docs = [];
                let allDocMap = this.$store.state.document.listAllDocument;
                let val = this.search;

                for (let key in allDocMap) {
                    let doc = allDocMap[key];
                    if (
                        String(doc.id).includes(val) ||
                        String(doc.name).includes(val) ||
                        String(doc.title).includes(val)
                    ) {
                        docs.push(doc);
                    }
                }
                return docs;
            } else {
                return Object.values(
                    this.$store.state.document.listAllDocument,
                );
            }
        },
    },
    data() {
        return {
            search: '',
        };
    },
};
</script>

<style></style>
