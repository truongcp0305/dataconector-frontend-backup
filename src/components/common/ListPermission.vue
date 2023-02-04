<template>
    <div class="pl-4">
        <v-list-item
            nav
            dense
            v-for="(item, index) in listPermissionToShow"
            :key="index"
            :prepend-icon="item.icon"
        >
            <v-list-item-title class="font-regular">
                <v-icon class="subtitle-1">{{ item.icon }}</v-icon>
                {{ item.name }}
            </v-list-item-title>
            <v-list-item-action style="width: 55px">
                <span
                    class="caption"
                    :class="{
                        'success--text': !!item.setted,
                        'error--text': !!!item.setted,
                    }"
                    @click="toggleSetItem(item)"
                >
                    {{ item.setted == 1 ? 'Allowed' : 'Not Set' }}
                </span>
            </v-list-item-action>
        </v-list-item>
    </div>
</template>

<script>
export default {
    name: 'ListPermission',
    props: {
        type: {
            type: String,
            default: '',
        },
        action: {
            type: Object,
            default: {},
        },
    },
    mounted() {
        let permission = 0;
        let objects = 0;
        if (this.action.objects != null) {
            try {
                this.action.objects = JSON.parse(this.action.objects);
            } catch (error) {}
        }
        if (this.action.permission != null) {
            try {
                this.action.permission = JSON.parse(this.action.permission);
            } catch (error) {}
        }
        if (this.action.objects[this.type] != undefined) {
            objects = this.action.objects[this.type];
            if (this.type in this.action.permission) {
                permission = this.action.permission[this.type];
            }
            this.listPermission.forEach((item) => {
                if (!!(objects & item.value)) {
                    if (!!(permission & item.value)) {
                        item.setted = 1;
                    }
                    this.listPermissionToShow.push(item);
                }
            });
        }
    },
    data: function () {
        return {
            listPermissionToShow: [],
            listPermission: [
                {
                    value: 1,
                    name: this.$t('permissions.listPermission.' + 1),
                    icon: 'mdi-file-outline',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 2,
                    name: this.$t('permissions.listPermission.' + 2),
                    icon: 'mdi-folder-multiple-outline',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 4,
                    name: this.$t('permissions.listPermission.' + 4),
                    icon: 'mdi-folder-plus',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 8,
                    name: this.$t('permissions.listPermission.' + 8),
                    icon: 'mdi-content-copy',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 16,
                    name: this.$t('permissions.listPermission.' + 16),
                    icon: 'mdi-delete-variant',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 32,
                    name: this.$t('permissions.listPermission.' + 32),
                    icon: 'mdi-pencil-box-outline',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 64,
                    name: this.$t('permissions.listPermission.' + 64),
                    icon: 'mdi-file-outline',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 128,
                    name: this.$t('permissions.listPermission.' + 128),
                    icon: 'mdi-file-excel',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 256,
                    name: this.$t('permissions.listPermission.' + 256),
                    icon: 'mdi-import',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 512,
                    name: this.$t('permissions.listPermission.' + 512),
                    icon: 'mdi-printer',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 1024,
                    name: this.$t('permissions.listPermission.' + 1024),
                    icon: 'mdi-server-security',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 2048,
                    name: this.$t('permissions.listPermission.' + 2048),
                    icon: 'mdi-lock-outline',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 4096,
                    name: this.$t('permissions.listPermission.' + 4096),
                    icon: 'mdi-folder-account',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 8192,
                    name: this.$t('permissions.listPermission.' + 8192),
                    icon: 'mdi-account-multiple-outline',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 16384,
                    name: this.$t('permissions.listPermission.' + 16384),
                    icon: 'mdi-block-helper',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 32768,
                    name: this.$t('permissions.listPermission.' + 32768),
                    icon: 'mdi-checkbox-multiple-marked-outline',
                    checked: 0,
                    setted: 0,
                },
                {
                    value: 65536,
                    name: this.$t('permissions.listPermission.' + 65536),
                    icon: 'mdi-account-check',
                    checked: 0,
                    setted: 0,
                },
            ],
        };
    },
};
</script>

<style scoped>
.v-list-item >>> .v-list-item__action {
    width: 45px;
}
</style>
