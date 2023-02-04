<template>
    <div class="d-flex w-100">
        <v-col
            :cols="sideBySideMode ? 10 : compackMode ? 6 : 4"
            class="pl-3 pr-1 py1"
        >
            <div class="pl-1">
                <div class="pa-0 d-flex justify-space-between">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <div class="fs-13 text-ellipsis w-100" v-on="on">
                                <v-icon
                                    v-if="obj.endTime && obj.endTime != null"
                                    style="
                                        font-size: 11px;
                                        color: #408137;
                                        margin-left: 3px;
                                    "
                                    >mdi-circle</v-icon
                                >
                                <v-icon
                                    v-else
                                    style="
                                        font-size: 11px;
                                        color: #0760d9;
                                        margin-left: 3px;
                                    "
                                    >mdi-circle</v-icon
                                >
                                {{ obj.name }}
                            </div>
                        </template>
                        <span>{{ obj.name }}</span>
                    </v-tooltip>
                    <div
                        class="fs-11 py-0"
                        style="width: 200px; margin-top: 3px"
                    >
                        {{
                            obj.startTime
                                ? $moment(obj.startTime).format(
                                      'DD/MM/YY HH:mm:ss'
                                  )
                                : $moment(obj.endTime).format(
                                      'DD/MM/YY HH:mm:ss'
                                  )
                        }}
                    </div>
                </div>
            </div>
        </v-col>
        <v-col
            v-if="!sideBySideMode"
            cols="2"
            class="fs-12 px-1 py-0 pt-2 text-ellipsis"
        >
            <infoUser
                class="userInfo"
                :userId="String(obj.startUserId)"
                :roleInfo="obj.roleInfo"
            />
        </v-col>
        <v-col v-if="!sideBySideMode" cols="2" class="fs-13 px-1 py-0">
            <div class="pt-3">
                {{
                    obj.startTime == null
                        ? ''
                        : $moment(obj.startTime).fromNow()
                }}
            </div>
        </v-col>
        <v-col
            class="py-0"
            cols="2"
            v-if="!sideBySideMode && !smallComponentMode"
        >
            <div
                class="pt-1"
                :class="{
                    'pt-3': !obj.symperApplicationName
                }"
            >
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <div
                            v-on="on"
                            v-if="obj.processDefinitionName"
                            class="
                                text-left
                                fs-13
                                pr-6
                                text-ellipsis
                                w-80
                                title-quytrinh
                            "
                        >
                            {{ obj.processDefinitionName }}
                        </div>
                        <span
                            v-on="on"
                            v-else
                            class="
                                text-left
                                fs-13
                                pr-6
                                text-ellipsis
                                w-80
                                title-quytrinh
                            "
                            >{{ $t('v2.myItem.adHoc') }}</span
                        >
                    </template>
                    <span>{{
                        obj.processDefinitionName
                            ? obj.processDefinitionName
                            : $t('v2.myItem.adHoc')
                    }}</span>
                </v-tooltip>
                <div
                    class="
                        pa-0
                        grey--text
                        mt-1
                        lighten-2
                        d-flex
                        justify-space-between
                    "
                >
                    {{ obj.symperApplicationName }}
                </div>
            </div>
        </v-col>
        <v-col v-if="!sideBySideMode" cols="1" class="fs-13 px-1 py-0">
            <div class="pt-3">
                <v-chip
                    v-if="!obj.endTime"
                    color="#0760D9"
                    class="px-2"
                    text-color="white"
                    style="border-radius: 4px"
                    x-small
                    >{{ $t('myItem.unfinished') }}</v-chip
                >

                <v-chip
                    class="px-2"
                    style="border-radius: 4px"
                    v-else
                    color="#408137"
                    text-color="white"
                    x-small
                    >{{ $t('common.done') }}</v-chip
                >
            </div>
        </v-col>
        <v-col v-if="!sideBySideMode" cols="1" class="fs-13 px-1 py-0">
            <div class="pl-1 pt-1">
                <div style="width: 55px">
                    {{ commentCountPerTask['work:' + obj.id] }}
                    <v-icon
                        class="fs-14"
                        style="
                            float: right;
                            margin-top: 4px;
                            margin-right: 12px;
                        "
                        >mdi-comment-processing-outline</v-icon
                    >
                </div>
                <div style="width: 55px">
                    {{ fileCountPerTask['work:' + obj.id] }}
                    <v-icon
                        class="fs-14"
                        style="
                            float: right;
                            margin-top: 4px;
                            margin-right: 12px;
                        "
                        >mdi-attachment</v-icon
                    >
                </div>
            </div>
        </v-col>
    </div>
</template>

<script>
export default {};
</script>

<style></style>
