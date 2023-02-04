<template>
    <span
        ><img
            :src="require('./../../../../public/img/document' + icon)"
            height="14"
            style="margin-right: 8px"
            alt=""
        />{{ text }}</span
    >
</template>
<script>
import { util } from '../../../plugins/util';

export default {
    data() {
        return {
            icon: null,
            text: '',
        };
    },
    beforeMount() {},
    mounted() {
        this.icon = this.getIcon();
        this.text = this.getValue();
    },
    methods: {
        getIcon() {
            return this.params.data.icon;
        },
        getValue() {
            let value =
                this.params.value.length == 1
                    ? this.params.value[0]
                    : this.params.value[1];
            return value;
        },
    },
};
</script>
