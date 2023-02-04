<template>
    <div class="sym-control">
        <div
            class="control-content"
            :control-type="type"
            draggable="true"
            :control-id="dataControl.id"
            :table-id="dataControl.tableId"
        >
            <img
                class="icon-control"
                :src="
                    require('./../../../../public/img/document' +
                        dataControl.icon)
                "
                v-if="dataControl.icon"
            />
            <div @click="clickItem(type)" class="title-control fs-11">
                {{ dataControl.title }}
            </div>
        </div>
        <div class="list-child-control">
            <control
                class="child-control"
                v-for="(childControl, index) in dataControl.listFields"
                :key="index"
                :control="childControl"
                :type="childControl.type"
            >
            </control>
        </div>
    </div>
</template>
<script>
import { util } from '@/plugins/util.js';
import {
    getControlElement,
    listControlNotNameProp,
} from '../../../components/document/controlPropsFactory';

export default {
    name: 'control',
    props: {
        type: {
            type: String,
            default: '',
        },
        control: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            dataControl: {},
            currentIndex: 1,
        };
    },
    mounted() {
        if (Object.keys(this.control).length > 0) {
            this.dataControl = this.control;
            if (listControlNotNameProp.includes(this.control.type)) {
                this.dataControl.title = this.control.type;
            } else {
                this.dataControl.title =
                    this.dataControl.properties.title.value;
            }
            let controlInFactory = getControlElement(this.dataControl.type);
            this.dataControl.icon = controlInFactory.icon;
        } else {
            this.dataControl = getControlElement(this.type);
        }
    },
    methods: {
        clickItem(type) {
            this.$emit('click-item', type);
        },
    },
};
</script>
<style scoped>
.icon-control {
    height: 13px;
    width: 13px;
}
.icon-control img {
    height: 14px;
    width: 14px;
}
.control-content:hover {
    background: #fafafa;
    cursor: pointer;
}
.list-child-control {
    padding-left: 24px;
}
.control-content {
    display: flex;
    padding: 6px;
}
.title-control {
    margin-left: 8px;
}
</style>
