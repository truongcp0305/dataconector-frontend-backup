<template>
    <div>
        <v-row justify="center">
            <v-dialog v-model="dialog" persistent max-width="400">
                <v-card>
                    <v-card-title class="title-repeatconfirm">
                        {{$t('v2.scheduler.applyRecurring')}}
                    </v-card-title>

                    <v-radio-group
                        v-model="checkbox"
                        class="content-repeatconfirm"
                    >
                        <v-radio
                            :label="$t('v2.scheduler.applyOnlyThisCard')"
                            color="#FB7E00"
                            value="1st"
                        ></v-radio>
                        <v-radio
                            :label="$t('v2.scheduler.applyAllCard')"
                            color="#FB7E00"
                            value="2nd"
                        ></v-radio>
                    </v-radio-group>

                    <v-card-actions class="footer-repeatconfirm">
                        <v-spacer></v-spacer>
                        <v-btn
                            color="#000000"
                            text
                            class="btn-repeatconfirm"
                            @click="cancelChangeEventRec()"
                        >
                        {{$t('v2.scheduler.back')}}
                        </v-btn>
                        <v-btn
                            color="#61C454"
                            text
                            margin-left="0px"
                            class="btn-repeatconfirm"
                            @click="repeatconfirm()"
                        >
                        {{$t('v2.scheduler.apply')}}
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
export default {
    data() {
        return {
            dialog: false,
            checkbox: '1st',
        };
    },
    props: {
        idEvent: {
            type: String,
        },
    },

    methods: {
        show() {
            this.dialog = true;
            this.checkbox = '1st';
        },

        hide() {
            this.dialog = false;
        },
        repeatconfirm() {
            this.dialog = false;
            var checkbox1,
                checkbox2 = false;

            if (this.checkbox == '1st') {
                checkbox1 = true;
            } else {
                checkbox2 = true;
            }

            this.$emit('repeatconfirm', {
                checkbox1: checkbox1,
                checkbox2: checkbox2,
                idEvent: this.idEvent,
            });
        },
        cancelChangeEventRec() {
            this.dialog = false;
            this.$emit('cancel-change-event-rec', this.idEvent);
        },
    },
};
</script>

<style scoped>
.text-delconfirm {
    font-size: 16px;
}
.title-repeatconfirm {
    font-family: 'Robonto', sans-serif;
    font-size: 13px !important;
    font-weight: 500 !important;
    padding-top: 12px !important;
    padding-left: 12px !important;
    padding-bottom: 10px !important;
}
.content-repeatconfirm {
    margin-top: 0px !important;
    padding-top: 0px !important;
    padding-left: 12px !important;
    font-weight: 400;
}
.content-repeatconfirm >>> .v-messages {
    min-height: 0px !important;
}
.btn-repeatconfirm {
    height: 28px;
    font-size: 13px;
    font-weight: 400;
}
.footer-repeatconfirm {
    padding-top: 0px;
    padding-bottom: 12px;
}
</style>
