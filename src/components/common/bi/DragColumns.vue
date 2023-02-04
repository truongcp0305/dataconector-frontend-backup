<template>
    <draggable
        :clone="cloneColumn"
        :list="columns"
        :animation="250"
        @change="change($event)"
        ghost-class="ghost-card"
        :group="{ name: groupDragName, pull: pullMethod, put: putable }"
        class="s-dragable"
    >
        <columnInfo
            class="column-dataset"
            v-for="column in columns"
            v-show="checkShowItem(column)"
            :key="column.columnName"
            :showIconRemove="deleteItem"
            :infoColumn="column"
            @remove-item="removeItem"
        />
    </draggable>
</template>

<script>
import draggable from 'vuedraggable';
import columnInfo from '@/components/common/bi/ColumnInfo';
export default {
    components: {
        draggable,
        columnInfo,
    },
    props: {
        // danh sách các cột
        columns: {
            default() {
                return [];
            },
        },
        // tên cho group để drag-and-drop
        groupDragName: {
            default: 'group-column',
        },
        // có cho phép drag không
        dragable: {
            default: false,
        },

        // action khi kéo một phần tử ra: clone hoặc rỗng
        pullMethod: {
            default: 'clone',
        },

        // có cho phép thêm phần tử mới hay không
        putable: {
            default: true,
        },

        // có cho phép xóa các item hay ko
        deleteItem: {
            default: true,
        },

        // Từ khóa tìm kiếm cột
        searchKey: {
            default: '',
        },
    },
    methods: {
        cloneColumn(item) {
            return Object.assign({}, item);
        },
        removeItem(item) {
            let column = this.columns.find(
                (ele) => ele.columnName == item.columnName,
            );
            var index = this.columns.indexOf(column);
            if (index > -1) {
                this.columns.splice(index, 1);
            }
            this.$emit('drag-remove-item', item);
        },
        checkShowItem(item) {
            if (!this.searchKey) {
                return true;
            }
            if (item && item.title && item.columnName) {
                let s = this.searchKey.toLowerCase();
                return (
                    item.title.toLowerCase().includes(s) ||
                    item.columnName.toLowerCase().includes(s)
                );
            }
            return false;
        },
        change(e) {
            if (e.added) {
                let item = e.added.element;
                let obj = this.columns.filter(
                    (ele) => ele.columnName == item.columnName,
                );
                if (obj && obj.length > 1) {
                    var index = this.columns.indexOf(obj[0]);
                    if (index > -1) {
                        this.columns.splice(index, 1);
                    }
                }
                this.$emit('drag-add-item', item);
            }
        },
    },
};
</script>

<style scoped>
.s-dragable {
    background: #fcfcfc;
    border-radius: 3px;
}
</style>
