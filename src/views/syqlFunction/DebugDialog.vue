<template>
    <v-dialog v-model="showDialog" persistent max-width="600px">
        <v-card class="dialog-add-environment fs-13">
            <v-card-title>
                <span class="fs-15">{{$t('v2.syql.addEnv')}}</span>
            </v-card-title>
            <v-card-text class="d-flex flex-column">
                <div>
                    <span class="font-weight-bold mb-2 fs-13">
                        {{$t('v2.syql.domainOfEnv')}}
                    </span>
                    <v-text-field
                        :label="$t('v2.syql.domainOfEnv')"
                        single-line
                        solo
                        dense
                        class="mr-2 fs-13"
                        v-model="domainName"
                    ></v-text-field>
                </div>
                <div>
                    <span class="font-weight-bold fs-13">
                        {{$t('v2.syql.envType')}}
                    </span>
                    <v-autocomplete
                        dense
                        filled
                        solo
                        v-model="values"
                        :items="environmentType"
                    >
                    </v-autocomplete>
                </div>
                <div>
                    <span class="font-weight-bold fs-13">
                        {{$t('v2.syql.choseServiceVersionOfSymper')}}
                    </span>
                    <div class="checkbox-modules">
                        <v-checkbox value="John" color="success">
                            <template v-slot:label>
                                <div class="d-flex w-100 fs-13">
                                    <span class="flex-grow-1">
                                        {{$t('v2.syql.fileManagement')}}
                                    </span>
                                    <v-menu :nudge-width="100" bottom left>
                                        <template v-slot:activator="{ on }">
                                            <span
                                                v-on="on"
                                                @click="stopEvent($event)"
                                            >
                                                v-2.0.1
                                            </span>
                                        </template>
                                        <v-list nav dense>
                                            <v-list-item-group color="primary">
                                                <v-list-item
                                                    v-for="(item, i) in 3"
                                                    :key="i"
                                                >
                                                    <v-list-item-content>
                                                        <v-list-item-title
                                                            >{{$t('v2.syql.version')}}
                                                            {{
                                                                item
                                                            }}</v-list-item-title
                                                        >
                                                    </v-list-item-content>
                                                </v-list-item>
                                            </v-list-item-group>
                                        </v-list>
                                    </v-menu>
                                </div>
                            </template>
                        </v-checkbox>
                        <v-checkbox value="John" color="success">
                            <template v-slot:label>
                                <div class="d-flex w-100 fs-13">
                                    <span class="flex-grow-1"> {{$t('v2.syql.orgchart')}} </span>
                                    
                                </div>
                            </template>
                        </v-checkbox>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="cancel"> {{$t('v2.syql.cancel')}} </v-btn>
                <v-btn color="blue darken-1" text> {{$t('v2.syql.add')}} </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        showDialog: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        cancel() {
            this.$emit('cancel');
        },
        stopEvent(event) {
            event.preventDefault();
            event.stopPropagation();
        },
    },
    data() {
        return {
            domainName: '',
            environmentType: ['Devolopment', 'Beta'],
            values: 'Devolopment',
        };
    },
};
</script>

<style scoped>
.dialog-add-environment >>> .v-input__slot {
    box-shadow: unset !important;
    background-color: #f7f7f7 !important;
}
.dialog-add-environment >>> .v-text-field__details {
    display: none !important;
}
.dialog-add-environment >>> .checkbox-modules .v-input {
    margin: unset;
}
.dialog-add-environment >>> .checkbox-modules .v-messages {
    display: none;
}
.dialog-add-environment >>> .checkbox-modules .v-input__slot {
    background-color: unset !important;
    margin-bottom: unset;
}
.dialog-add-environment >>> .v-label,
.dialog-add-environment >>> input {
    font: 13px roboto !important;
}
</style>
