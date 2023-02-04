<template>
    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-y
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                icon
                tile
                v-bind="attrs"
                v-on="on"
                style="width: 32px; height: 32px; margin: 0px 4px"
            >
                <v-icon>mdi-dip-switch</v-icon>
            </v-btn>
        </template>

        <v-card>
            <v-list>
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title
                            >{{$t('v2.app.viewDefault')}}</v-list-item-title
                        >
                        <!-- <v-list-item-subtitle>{{ titleTypeView}}</v-list-item-subtitle> -->
                    </v-list-item-content>
                </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list>
                <v-radio-group v-model="currentTypeView">
                    <v-radio
                        v-for="(item, i) in menuTypeView"
                        :key="i"
                        :label="item.title"
                        :value="item.value"
                    ></v-radio>
                </v-radio-group>
            </v-list>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn text @click="menu = false"> {{$t('common.cancel')}} </v-btn>
                <v-btn color="primary" text @click="saveType"> {{$t('common.save')}} </v-btn>
            </v-card-actions>
        </v-card>
    </v-menu>
</template>

<script>
import { uiConfigApi } from '@/api/uiConfig';

export default {
    data() {
        return {
            menu: false,
            radioGroup: null,
            menuTypeView: [
                {
                    title: this.$t('v2.app.viewAllApp'),
                    value: 0,
                },
                {
                    title: this.$t('v2.app.viewSideBySide'),
                    value: 1,
                },
            ],
        };
    },
    props: {
        currentTypeView: {
            type: Number,
            default: 0,
        },
        titleTypeView: {
            type: String,
        },
    },
    methods: {
        saveType() {
            let dataToSave = {
                widgetIdentifier: 'myApplication',
                detail: JSON.stringify({
                    typeView: this.currentTypeView,
                }),
            };

            uiConfigApi
                .saveUiConfig(dataToSave)
                .then((res) => {
                    if (res.status == 200) {
                        this.menu = false;
                        this.$snotify({
                            type: 'success',
                            title: this.$t('v2.app.chooseSuccess'),
                        });
                    }
                })
                .catch((err) => {});
        },
    },
    watch: {
        currentTypeView(val) {},
    },
};
</script>

<style scoped>
.v-messages {
    display: none !important;
}
.v-input {
    margin-left: 25px !important;
    margin-bottom: -30px !important;
    margin-top: 4px !important;
}
</style>
