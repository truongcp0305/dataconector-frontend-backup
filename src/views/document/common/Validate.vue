<template>
    <v-card class="card-validate" v-show="isShow" :style="positionBox">
        <v-card-title>
            <v-icon class="icon">mdi-information-outline</v-icon>

            {{ errTitle }}</v-card-title
        >
        <v-card-text class="validate-message">
            <div>
                <div v-for="(validate, key) in messageData" :key="key">
                    <div>
                        <div style="font-weight: 500">{{ key }}:</div>
                        <div v-for="(item, index) in validate" :key="index">
                            <span v-if="item.isValid">
                                {{ item.msg }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </v-card-text>
        <v-card-actions v-if="isShowAction" style="flex-flow: row-reverse">
            <v-btn @click="handleIgnoreClick" text>{{
                $t('common.ignore')
            }}</v-btn>
            <v-btn @click="handleCheckClick" text>{{
                $t('common.check')
            }}</v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
export default {
    props: {
        keyInstance: {
            type: Number,
            default: 0
        },
        title: {
            type: String,
            default: () => {
                return SYMPER_APP.$t('v2.doc.invalidData');
            }
        },

        isShowAction: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        title(after) {
            this.errTitle = title;
        }
    },
    data() {
        return {
            isShow: null,
            positionBox: null,
            errTitle: this.title,
            messageData: null
        };
    },
    created() {},
    beforeMount() {
        this.isShow = false;
        this.positionBox = { top: 0, left: 0 };
    },
    methods: {
        handleCheckClick() {
            this.isShow = false;
            this.$emit('after-click-confirm');
        },
        handleIgnoreClick() {
            this.isShow = false;
            this.$emit('after-click-ignore');
        },
        show(e, data) {
            this.isShow = true;
            this.calPosition(e);
            this.messageData = data;
        },
        hide() {
            this.isShow = false;
        },
        calPosition(e) {
            if (e == false) {
                // trường hợp gọi từ panel save document
                this.positionBox = {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    position: 'fixed',
                    width: '400px'
                };
            } else {
                if ($(e.target).closest('.ag-cell').length > 0) {
                    let autoEL = $(this.$el).detach();
                    $(e.target).closest('.wrap-table').append(autoEL);
                    let edtos = $(e.target).closest('.ag-cell').offset();
                    let tbcos = $(e.target)
                        .closest('.wrap-table')
                        .find('[s-control-type="table"]')
                        .offset();
                    this.positionBox = {
                        top:
                            edtos.top - tbcos.top + $(e.target).height() + 'px',
                        left: edtos.left - tbcos.left + 'px'
                    };
                }
                //nêu là ngoài bảng
                else {
                    let autoEL = $(this.$el).detach();
                    $(e.target).parent().append(autoEL);
                    this.positionBox = { top: '20px', left: '0px' };
                }
            }
        }
    }
};
</script>

<style scoped>
.card-validate {
    position: absolute;
    z-index: 99999;
    max-width: unset !important;
    width: max-content;
}
.card-validate >>> .v-card__title {
    padding: 6px;
    font-size: 15px !important;
}
.card-validate >>> .v-card__text {
    font-size: 13px !important;
    padding: 4px 8px 8px 8px !important;
}
.card-validate >>> .mdi-information-outline {
    color: red !important;
}
.icon {
    float: left;
    margin-right: 10px;
}
.validate-message {
    display: flex;
    align-items: center;
    border-top: var(--symper-border);
}
</style>
