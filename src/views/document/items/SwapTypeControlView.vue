<template>
    <div v-show="isShow" class="form-swap-type-control">
        <div class="form-swap__header">
            <span>{{ $t('document.editor.dialog.swapType.heading') }}</span>
        </div>
        <div class="form-swap__body">
            <p class="text-content">
                <span class="mdi mdi-alert-outline"></span>
                <span>{{ $t('document.editor.dialog.swapType.note') }}</span>
            </p>
            <p class="text-content">
                <span
                    >{{
                        $t('document.editor.dialog.swapType.nameControl')
                    }}:</span
                >
                <span class="control-name">{{ dataControl.name }}</span>
            </p>
            <div class="text-content">
                <span>{{
                    $t('document.editor.dialog.swapType.changeFrom')
                }}</span>
                <div style="display: inline-block; margin: 0 12px">
                    <img
                        style="
                            height: 14px;
                            margin-right: 8px;
                            margin-bottom: -3px;
                        "
                        :src="dataControl.icon"
                        alt=""
                    />
                    <span style="font-weight: 500">{{ dataControl.type }}</span>
                </div>
                <span>{{
                    $t('document.editor.dialog.swapType.changeTo')
                }}</span>
                <v-select
                    class="control-select"
                    return-object
                    :items="allControl"
                    v-model="selectedItem"
                    :menu-props="{ maxHeight: '300' }"
                    dense
                    solo
                    hide-details
                >
                    <template v-slot:selection="{ item }">
                        <img
                            style="height: 14px; margin-right: 8px"
                            :src="item.prop.icon"
                            alt=""
                        />
                        <span style="font-weight: 500">{{
                            item.prop.title
                        }}</span>
                    </template>
                    <template v-slot:item="{ item, index }">
                        <div :key="index">
                            <img
                                style="
                                    height: 14px;
                                    width: 14px;
                                    margin-right: 8px;
                                    margin-bottom: -2px;
                                "
                                :src="item.prop.icon"
                                alt=""
                            />
                            <span style="font-size: 13px">{{
                                item.prop.title
                            }}</span>
                        </div>
                    </template>
                </v-select>
            </div>
        </div>
        <div class="form-swap__footer">
            <button @click="hide">{{ $t('common.cancel') }}</button>
            <button @click="confirmChange">{{ $t('common.confirm') }}</button>
        </div>
    </div>
</template>

<script>
import { getAllControlForTableSetting } from './../../../components/document/controlPropsFactory.js';
export default {
    props: {
        instance: {
            type: Number,
            default: Date.now(),
        },
        dataControl: {
            type: Object,
            default: function () {
                return {};
            },
        },
    },
    data() {
        return {
            isShow: false,
            selectedItem: '',
        };
    },
    methods: {
        show() {
            this.isShow = true;
        },
        hide() {
            this.isShow = false;
        },
        confirmChange() {
            this.hide();
            this.$emit('after-change-type-control', this.selectedItem.type);
        },
    },
    computed: {
        allControl() {
            let listControl = getAllControlForTableSetting([
                'label',
                'documentInstanceIdentifier',
                'image',
                'qrCode',
                'textInput',
                'number',
                'date',
                'dateTime',
                'time',
                'month',
                'phone',
                'select',
                'documentSelect',
                'color',
                'hidden',
                'email',
                'user',
                'currency',
                'percent',
            ]);
            return listControl;
        },
        editorStore() {
            return this.$store.state.document.editor[this.instance];
        },
    },
    mounted() {
        this.selectedItem = this.allControl[0];
    },
};
</script>

<style scoped>
.form-swap-type-control {
    position: fixed;
    background: white;
    z-index: 99999;
    box-shadow: 0px 3px 6px #00000029;
    border: 1px solid #00000033;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 12px;
}
.form-swap__body {
    font-size: 13px;
}
.form-swap__body .text-content {
    margin-bottom: 14px !important;
}
.form-swap__header {
    margin-bottom: 10px;
}
.form-swap__header span {
    font-size: 15px;
    font-weight: 500;
}
.form-swap__footer {
    text-align: right;
    font-size: 13px;
}
.form-swap__footer button:focus {
    outline: none;
}
.form-swap__footer button:first-child {
    margin-right: 12px;
}
.form-swap__footer button:hover {
    background: rgb(0 0 0 / 0.1);
}
.form-swap__footer button {
    background: rgb(0 0 0 / 0.05);
    padding: 6px 12px;
    border-radius: 4px;
    transition: all ease-in-out 250ms;
}
.control-select {
    width: 140px;
    display: inline-block;
    margin-left: 12px;
}
.control-select ::v-deep .v-input__slot {
    box-shadow: none !important;
    background: rgb(0 0 0 / 0.05) !important;
    min-height: 34px;
    font-size: 13px;
    color: rgb(0 0 0 / 0.6);
}
.control-select ::v-deep .v-input__slot .mdi {
    color: rgb(0 0 0 / 0.6);
}
.mdi-alert-outline {
    font-size: 13px;
    color: red;
    margin-right: 8px;
}
.control-name {
    font-weight: 500;
    margin-left: 12px;
}
</style>
