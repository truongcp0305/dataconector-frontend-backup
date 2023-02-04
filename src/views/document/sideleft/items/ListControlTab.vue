<template>
    <v-treeview
        v-model="tree"
        :items="treeData"
        dense
        hoverable
        open-all
        transition
        class="sym-small-size mt-2 sym-list-control-in-doc"
        :style="{ 'font-size': '11px !important' }"
    >
        <template v-slot:label="{ item }">
            <div
                v-on:click="clickItem($event, item)"
                :class="`tree-` + item.id"
            >
                <img
                    :src="'/img/document' + item.icon"
                    height="14"
                    width="14"
                    style="
                        margin-top: 3px;
                        margin-right: 8px;
                        margin-bottom: -2px;
                    "
                />
                <label :title="item.name">{{ item.name }}</label>
            </div>
        </template>
    </v-treeview>
</template>
<script>
import { util } from '@/plugins/util.js';
import {
    getIconFromType,
    listControlNotNameProp,
} from './../../../../components/document/controlPropsFactory.js';
export default {
    computed: {
        sDocumentEditor() {
            return this.$store.state.document.editor[this.instance].allControl;
        },
    },
    watch: {
        sDocumentEditor: {
            deep: true,
            immediate: true,
            handler(after) {
                this.handleTreeData(after);
            },
        },
    },
    props: {
        instance: {
            type: Number,
            default: Date.now(),
        },
    },
    data: () => ({
        tree: [],
        treeData: {},
    }),
    methods: {
        handleTreeData(data) {
            console.log('asfsadasd', data);
            let treeData = [
                {
                    name: 'Control',
                    icon: '/icon/ic_image.png',
                    root: true,
                    children: [],
                },
            ];
            let allControl = data;
            for (let controlId in allControl) {
                let control = allControl[controlId];
                let type = control.type;
                let props = control.properties;
                let name = '';
                let title = '';
                if (listControlNotNameProp.includes(type)) {
                    name = type;
                    title = type;
                } else {
                    title = props.title.value;
                    name = props.name.value;
                }
                if (type == 'table') {
                    let listFields = control.listFields;
                    let children = [];
                    for (let childControlId in listFields) {
                        let childControl = listFields[childControlId];
                        let childProps = childControl.properties;
                        let childType = childControl.type;
                        let childTitle = childProps.title.value;
                        let childName = childProps.name.value;
                        let item = {
                            name: childName + ' - ' + childTitle,
                            icon: getIconFromType(childType),
                            id: childControlId,
                        };
                        children.push(item);
                    }
                    treeData[0].children.push({
                        name: name + ' - ' + title,
                        active: false,
                        icon: getIconFromType(type),
                        id: controlId,
                        children: children,
                    });
                } else {
                    treeData[0].children.push({
                        name: name + ' - ' + title,
                        active: false,
                        icon: getIconFromType(type),
                        id: controlId,
                    });
                }
            }
            this.treeData = treeData;
        },
        clickItem(event, item) {
            if (item.root == undefined && item.root != true) {
                item.event = event;
                this.$evtBus.$emit(
                    'document-editor-click-treeview-list-control',
                    item,
                );
            }
        },
    },
};
</script>
<style scoped>
.sym-list-control-in-doc {
    overflow: auto;
    max-height: calc(100vh - 80px);
}
.sym-small-size >>> .v-treeview-node__root {
    padding-left: 0 !important;
}
.sym-small-size >>> .v-treeview-node__toggle {
    color: transparent;
}
.sym-small-size >>> .v-treeview-node__toggle:first-child {
    width: 0 !important;
}
.sym-small-size
    >>> .v-treeview-node__children
    .v-treeview-node__level:first-child {
    width: 0 !important;
}
</style>
