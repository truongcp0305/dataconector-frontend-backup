<template>
    <v-menu
        v-model="showListObject"
        :offset-y="true"
        nudge-bottom="0"
        :close-on-content-click="false"
    >
        <template v-slot:activator="{ on: menu, attrs }">
            <v-tooltip bottom z-index="200">
                <template v-slot:activator="{ on: tooltip }">
                    <v-btn
                        small
                        text
                        v-bind="attrs"
                        @click="openSelectUserPanel"
                        depressed
                        v-on="{ ...tooltip, ...menu }"
                    >
                        <span class="fs-11" style="font-weight: 400 !important">
                            {{ sapp.endUserInfo.displayName }}
                        </span>
                    </v-btn>
                </template>
                <span>Switch user</span>
            </v-tooltip>
        </template>
        <div class="bg-white" style="width: 251px">
            <div>
                <v-icon class="ml-3 fs-16"
                    >mdi mdi-account-check-outline</v-icon
                >
                <span class="fs-13 mt-3 mb-2 ml-4">
                    {{ $t('v2.showlist.selectUser') }}</span
                >
            </div>
            <v-autocomplete
                ref="selectDelegateUser"
                :menu-props="{
                    maxHeight: 300,
                    minWidth: 251,
                    maxWidth: 251,
                    nudgeLeft: 8,
                    nudgeBottom: 3
                }"
                return-object
                class="mr-2 ml-2"
                full-width
                solo
                :items="sapp.allUsers"
                background-color="grey lighten-4"
                flat
                dense
                color="blue-grey lighten-2"
                item-text="displayName"
                @change="delegateUser"
                item-value="name"
                :filter="filterUser"
            >
                <template v-slot:append>
                    <v-icon style="font-size: 18px">mdi mdi-magnify</v-icon>
                </template>
                <template v-slot:label>
                    <span class="fs-13">{{ $t('common.search') }}</span>
                </template>
                <template v-slot:item="data">
                    <div class="fs-13 py-1">
                        <SymperAvatar
                            style="
                                height: 25px !important;
                                width: 25px !important;
                                margin-left: -5px;
                            "
                            :userId="data.item.id"
                        />
                        <span class="fs-13 ml-1">
                            {{ data.item.displayName }}</span
                        >
                    </div>
                </template>
            </v-autocomplete>
        </div>
    </v-menu>
</template>

<script>
export default {
    props: {
        config: {
            type: Object,
            default() {
                return {
                    title: {
                        icon: '',
                        tex: ''
                    },
                    apiUrl: '',
                    itemRenderer: function (item) {},
                    valueKey: 'id',
                    textKey: 'title'
                };
            }
        }
    },
    data() {
        return {
            showListObject: false
        };
    }
};
</script>

<style></style>
