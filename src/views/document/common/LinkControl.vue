<template>
    <div class="card-link-config">
        <div
            class="item-link"
            v-for="(link, index) in listLinkDisplay"
            :key="index"
            @click="openLink(link)"
        >
            <v-tooltip top>
                <template v-slot:activator="{ on }">
                    <p v-on="on" class="m-0">{{ link.title }}</p>
                </template>
                <span>{{ link.link }}</span>
            </v-tooltip>
        </div>
    </div>
</template>
<script>
import { getControlInstanceFromStore } from './common';
export default {
    props: {
        instance: {
            type: Number,
            default: 0,
        },
        focusingControlName: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            listLinkDisplay: {},
        };
    },
    methods: {
        openLink(link) {
            this.$goToPage(link.link);
        },
        show(controlName, rowIndex) {
            if (!controlName) {
                return;
            }
            let controlIns = getControlInstanceFromStore(
                this.instance,
                this.focusingControlName,
            );
            if (controlIns.inTable != false) {
                this.listLinkDisplay = controlIns.linkControlValue[rowIndex];
            } else {
                this.listLinkDisplay = controlIns.linkControlValue;
            }
        },
    },
};
</script>
<style scoped>
.item-link {
    cursor: pointer;
    transition: background ease-in-out 250ms;
    padding: 4px;
    font-size: 13px;
}
.item-link:hover {
    background: var(--symper-background-hover);
}
</style>
