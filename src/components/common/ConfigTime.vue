<template>
    <div>
        <v-dialog v-model="dialog" width="500">
            <template v-slot:activator="{ on }">
                <i
                    v-on="on"
                    class="mdi mdi-cog"
                    style="right: 25px; position: absolute; top: 3px"
                ></i>
            </template>
            <div>
                <RepeatConfig
                    @value="crobTab"
                    :cronTab="cronTabValue"
                    class="pt-5 pl-5 pr-5 pb-3"
                    style="
                        height: 520px !important;
                        background: white !important;
                    "
                />
            </div>
        </v-dialog>
        <div></div>
    </div>
</template>
<script>
import RepeatConfig from './../../components/common/RepeatConfig';
export default {
    props: ['cronTabValue'],
    methods: {
        crobTab(crobTab) {
            this.$emit('value', crobTab);
        },
    },
    data() {
        return {
            dialog: false,
            test: '',
        };
    },
    components: {
        RepeatConfig,
    },
    created() {},
};
</script>
