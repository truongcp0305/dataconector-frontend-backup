<template>
    <div
        v-show="showMenu"
        class="bg-white menu-add-showable-column py-2 elevation-8"
        style="z-index: 99999; position: fixed; width: 200px"
    >
        <div class="fs-15 font-weight-bold ml-2 mb-2">
            {{ $t('v2.dashboard.showColumn') }}
        </div>
        <div v-for="(item, i) in allColumns" :key="i">
            <div
                class="
                    d-flex
                    py-2
                    px-4
                    menu-add-showable-column__item
                    grey-hover
                "
                @click="selectColumn(item.name)"
            >
                <span class="flex-grow-1 fs-13">
                    {{ item.as }}
                </span>
                <v-icon color="success" small v-if="persionalConfig[item.name]">
                    mdi-check
                </v-icon>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showMenu: false,
            allColumns: []
        };
    },
    methods: {
        show(event) {
            this.showMenu = true;
            let menuDom = $(this.$el);
            menuDom
                .css('left', event.pageX + 5 + 'px')
                .css('top', event.pageY + 30 + 'px');
            $('#symper-platform-app').append(menuDom[0]);
        },
        getAllColumns() {
            let self = this;
            let columns =
                this.cellConfigs.rawConfigs.setting.gridColumns.selectedColums;
            columns.forEach(function (e) {
                if (
                    e.menuOptions.defaultColumn &&
                    !e.menuOptions.defaultColumn.value
                ) {
                    self.allColumns.push(e);
                }
            });
        },
        selectColumn(item) {
            this.$emit('column-select-change', item);
        }
    },
    props: {
        instanceKey: {
            defaul: ''
        },
        cellConfigs: {
            default() {
                return {};
            }
        },
        persionalConfig: {
            default() {
                return {};
            }
        }
    },
    created() {
        this.getAllColumns();
        let self = this;
        this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
            if (
                $(evt.target).parents('.menu-add-showable-column').length ==
                    0 &&
                !$(evt.target).hasClass('gantt_grid_head_add')
            ) {
                self.showMenu = false;
            }
        });
    }
};
</script>
