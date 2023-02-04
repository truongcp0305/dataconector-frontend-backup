<template>
    <span class="d-flex justify-end">
        <span
            class="fs-13 fw-400 value-input text-ellipsis"
            v-if="!editName"
            @click="hideName"
        >
            {{ item.name ? item.name : $t('v2.acessControl.enterName') }}
        </span>
        <v-text-field
            v-else
            :label="$t('v2.acessControl.enterActionPackName')"
            single-line
            ref="name"
            autofocus
            @keydown="handleKeyDown"
            class="fs-13 text-field name"
            v-model="item.name"
        ></v-text-field>

        <span class="fs-13 mx-2">/</span>
        <v-text-field
            v-if="editDes"
            single-line
            autofocus
            @keydown="handleKeyDown"
            :label="$t('permissions.enter_description')"
            v-model="item.description"
            class="fs-13 text-field"
        ></v-text-field>
        <span v-else class="fs-13 fw-400 value-input" @click="editDes = true">
            {{
                item.description
                    ? item.description
                    : $t('v2.acessControl.enterDescription')
            }}
        </span>
    </span>
</template>
<script>
export default {
    props: {
        item: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            editName: false,
            editDes: false
        };
    },
    methods: {
        hideAll() {
            this.editName = false;
            this.editDes = false;
        },
        hideName() {
            this.editName = true;
        },
        handleKeyDown(event) {
            const self = this;
            if (event.key == 'Enter') {
                self.editName = false;
                self.editDes = false;
            }
        },
        handleClickOutSide() {
            const self = this;
            this.$evtBus.$on('symper-app-wrapper-clicked', (evt) => {
                if (
                    !$(evt.target).closest('.v-input').length &&
                    !$(evt.target).closest('.value-input')
                ) {
                    self.editName = false;
                    self.editDes = false;
                }
            });
        }
    },
    mounted() {
        this.handleClickOutSide();
    }
};
</script>
<style scoped>
.text-field {
    padding-top: 0px !important;
    margin: 0px !important;
}
.text-field >>> .v-input__slot {
    margin-bottom: 0px !important;
}
</style>
