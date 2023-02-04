<template>
    <div>
        <v-combobox
            v-model="selectedNodeStyle"
            :filter="filter"
            :hide-no-data="!search"
            :items="allNodeStyles"
            :search-input.sync="search"
            item-text="name"
            return-object
            dense
            class="sym-small-size"
            flat
            :label="$t('v2.orgchart.searchNodeStyleToApply')"
            solo
            outlined
            @change="changeNodeStyleTemplate"
        >
            <template v-slot:item="{ index, item }">
                <div
                    class="node-style-example"
                    :style="{
                        'border-bottom-color':
                            item.content.highlight + '!important',
                    }"
                >
                abc
                </div>
                <span class="fs-13">
                    {{ item.name }}
                </span>
                <v-spacer></v-spacer>
                <v-list-item-action @click.stop class="ma-0">
                    <v-btn
                        icon
                        @click.stop.prevent="deleteNodeStyle(index, item)"
                    >
                        <v-icon size="16">mdi-close</v-icon>
                    </v-btn>
                </v-list-item-action>
            </template>
        </v-combobox>
    </div>
</template>

<script>
import { SYMPER_APP } from '../../../main';
import { orgchartApi } from '../../../api/orgchart';
export default {
    props: {
        change: {
            type: Number,
        },
    },
    data: () => ({
        selectedNodeStyle: null,
        activator: null,
        attach: null,
        colors: ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'],
        index: -1,
        nonce: 1,
        menu: false,
        model: [
            {
                text: 'foo',
                color: 'blue',
            },
        ],
        x: 0,
        search: null,
        y: 0,
    }),

    watch: {
        change(val) {
            this.selectedNodeStyle = null;
        },
        model(val, prev) {
            if (val.length === prev.length) return;

            this.model = val.map((v) => {
                if (typeof v === 'string') {
                    v = {
                        text: v,
                        color: this.colors[this.nonce - 1],
                    };

                    this.items.push(v);

                    this.nonce++;
                }

                return v;
            });
        },
    },

    methods: {
        changeNodeStyleTemplate() {
            this.$emit('change-style-template', this.selectedNodeStyle);
        },
        filter(item, queryText, itemText) {
            if (item.header) return false;

            const hasValue = (val) => (val != null ? val : '');

            const text = hasValue(itemText);
            const query = hasValue(queryText);

            return (
                text
                    .toString()
                    .toLowerCase()
                    .indexOf(query.toString().toLowerCase()) > -1
            );
        },
        async deleteNodeStyle(index, item) {
            try {
                let res = await orgchartApi.deleteNodeStyle(item.id);
                this.$store.commit('orgchart/deleteNodeStyle', index);
                this.$snotifySuccess(this.$t('v2.orgchart.deletedNodeStyleItem'));
            } catch (error) {
                this.$snotifyError(error, this.$t('v2.orgchart.canNotDeleteSelectedItem'));
            }
        },
    },

    computed: {
        allNodeStyles() {
            return this.$store.state.orgchart.allNodeStyle;
        },
    },
};
</script>

<style>
.node-style-example {
    height: 20px;
    width: 35px;
    border: 1px solid #b9b8b8;
    border-bottom-width: 2px;
    text-align: center;
    line-height: 20px;
    font-size: 13px;
    font-weight: 500;
    margin-right: 8px;
}
</style>
