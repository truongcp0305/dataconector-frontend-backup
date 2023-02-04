<template>
    <div class="d-flex my-1 pa-1" style="background: rgb(230, 229, 229)">
        <div class="flex-grow-1">
            <span class="ml-1 fs-13">{{ $t('common.nameFilter') }} </span>
            <v-text-field
                class="d-inline-block ml-2 sym-small-size"
                single-line
                v-model="name"
                style="background: white; width: 400px"
                outlined
                dense
            ></v-text-field>
        </div>
        <div class="pl-13">
            <v-btn
                v-if="isViewKanban || isViewScheduler"
                small
                icon
                tile
                @click="handleAddFilter('show-filter-all')"
                class="ml-1"
                style="background: #ffffff; height: 22px; width: 22px; top: 3px"
            >
                <span class="mdi mdi-filter-variant fs-15 color-black"></span>
            </v-btn>
            <v-btn
                small
                icon
                tile
                @click="handleAddFilter('save')"
                class="ml-1"
                style="background: #ffffff; height: 22px; width: 22px; top: 3px"
            >
                <span class="mdi mdi-check fs-15 color-black"></span>
            </v-btn>
            <v-btn
                small
                icon
                tile
                @click="handleAddFilter('close')"
                class="ml-1"
                style="background: #ffffff; height: 22px; width: 22px; top: 3px"
            >
                <span class="mdi mdi-close fs-15 color-black"></span>
            </v-btn>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            errorMess: '',
        };
    },
    created() {
        this.name = this.filterName;
    },

    props: {
        filterName: {
            type: String,
            default: '',
        },
        isViewKanban: {
            type: Boolean,
            default: false,
        },
        isViewScheduler: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        handleAddFilter(type) {
            if (this.name.trim() == '' && type == 'save') {
                this.$snotifyError(
                    '',
                    this.$t('validate.required') +
                        ' ' +
                        this.$t('common.nameFilter'),
                );
                return
            }
            if (
                this.name.trim() != '' ||
                type == 'close' ||
                type == 'show-filter-all'
            ) {
                let data = {
                    type: type,
                    filterName: this.name,
                    valid: false,
                };
                this.$emit('add-filter', data);
            }
        },
    },
};
</script>
