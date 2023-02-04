<template>
    <div
        class="d-flex justify-center align-center flex-column not-found-screen"
        style="height: 100%"
    >
        <img :src="url" ref="notFoundScreen" class="notFoundScreen" />
        <span class="fs-15 mt-3 mx-3">{{
            $t('emptyDataMessage.' + emptyDataKey)
        }}</span>
    </div>
</template>
<script>
export default {
    data() {
        return {
            url: ''
        };
    },
    props: {
        emptyDataKey: {
            type: String,
            default: 'no-data'
        }
    },
    mounted() {
        let self = this;
        self.$nextTick(function () {
            setTimeout(() => {
                if (self.$refs.notFoundScreen) {
                    self.$emit('setoverlayNoRowsTemplate');
                }
            }, 0);
        });
        if (this.emptyDataKey != 'no-data') {
            this.url = require('../../../public/img/notFoundScreen/' +
                this.emptyDataKey +
                '.svg');
        } else
            this.url = require('../../../public/img/notFoundScreen/document-record-list.svg');
    }
};
</script>
