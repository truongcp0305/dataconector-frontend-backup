<template>
    <vue-resizable
        ref="contentPanel"
        :active="['t']"
        :height="'451px'"
        :width="'100%'"
        class="content-panel"
        style="top: none !important"
        @resize:end="handleResizecontentPanel"
        v-if="isShowQueryPanel"
    >
        <vue-resizable
            ref="contentLeft"
            :active="['r']"
            :height="'100%'"
            :width="contentLeftWidth"
            class="content-left"
            @resize:end="handleResizecontentLeft"
        >
            <v-app-bar flat dense color="white" height="37px">
                <v-icon class="mdi-18px font-weight-medium" color="black"
                    >mdi-asterisk</v-icon
                >
                <span class="font-weight-regular subtitle-2 black--text mx-2">{{
                    titlePanel
                }}</span>
                <v-menu offset-y v-if="false">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" elevation="0" x-small>
                            <v-icon dense class="mdi-18px"
                                >mdi-database-outline</v-icon
                            >
                            {{ databaseUsing }}
                        </v-btn>
                    </template>
                    <v-list class="ps-3">
                        <v-subheader
                            class="p-0 mb-2"
                            style="color: #333333; height: 20px"
                        >
                            <v-icon dense class="mdi-18px"
                                >mdi-database-outline</v-icon
                            >
                            {{ $t('sqlQueryIDE.useDatabase') }}
                        </v-subheader>
                        <v-list-item
                            dense
                            class="p-0"
                            v-for="item in listDB"
                            :key="item.name"
                        >
                            <v-list-item-title
                                class="font-weight-regular subtitle-2 me-15"
                                >{{ item.name }}</v-list-item-title
                            >
                            <v-switch
                                :ripple="false"
                                inset
                                dense
                                color="#FF8003"
                                flat
                                class="m-0"
                                v-model="item.on"
                                hide-details
                                @click="changeDatabase(item)"
                            ></v-switch>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-spacer></v-spacer>
                <template v-if="minimisePanel == false">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-show="!isRunning"
                                v-bind="attrs"
                                v-on="on"
                                @click="runQuery()"
                                icon
                                x-small
                                color="#707070"
                                elevation="0"
                            >
                                <v-icon class="mdi-11px"
                                    >mdi-play-outline</v-icon
                                >
                            </v-btn>
                        </template>
                        <span>{{ $t('sqlQueryIDE.run') }}</span>
                    </v-tooltip>
                    <v-progress-circular
                        indeterminate
                        color="#FF8003"
                        v-show="isRunning"
                        :size="15"
                        width="2"
                        class="me-1"
                    >
                    </v-progress-circular>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                v-on="on"
                                @click="stopQuery()"
                                elevation="0"
                                icon
                                x-small
                                :color="isRunning ? '#EE6B60' : '#707070'"
                            >
                                <v-icon class="mdi-11px">mdi-stop</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ $t('sqlQueryIDE.stop') }}</span>
                    </v-tooltip>
                    <div class="px-2">
                        |
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="formatSQL()"
                                    elevation="0"
                                    icon
                                    x-small
                                    color="#707070"
                                >
                                    <v-icon class="mdi-11px"
                                        >mdi-auto-fix</v-icon
                                    >
                                </v-btn>
                            </template>
                            <span>{{ $t('sqlQueryIDE.format') }}</span>
                        </v-tooltip>
                        |
                    </div>
                </template>
                <v-tooltip :bottom="!minimisePanel" :top="minimisePanel">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-bind="attrs"
                            v-on="on"
                            @click="minimisePanel = !minimisePanel"
                            elevation="0"
                            icon
                            x-small
                            color="#707070"
                        >
                            <v-icon>{{
                                minimisePanel
                                    ? 'mdi-window-maximize'
                                    : 'mdi-window-minimize'
                            }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{
                        minimisePanel
                            ? $t('common.maximise')
                            : $t('common.minimise')
                    }}</span>
                </v-tooltip>
                <v-tooltip :bottom="!minimisePanel" :top="minimisePanel">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            v-bind="attrs"
                            v-on="on"
                            @click="closeSqlqueryPanel()"
                            elevation="0"
                            icon
                            x-small
                            color="#707070"
                        >
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ $t('common.close') }}</span>
                </v-tooltip>
            </v-app-bar>
            <FormulaEditor
                ref="edtFormula"
                :width="'100%'"
                :height="'100%'"
                :showDebugView="true"
                :isSqlQueryPanel="true"
                class="formula-editor"
                v-model="valueEditor"
                @run-formula-finished="isRunning = false"
            >
            </FormulaEditor>
        </vue-resizable>
        <div
            class="content-right"
            :style="{ width: contentRightWidth }"
            v-show="minimisePanel == false"
        >
            <SqlQuerySidebar
                ref="edtQuerySidebar"
                :contentRightWidth="contentRightWidth"
                @collapse-side-bar="collapseSideBar"
            >
            </SqlQuerySidebar>
        </div>
    </vue-resizable>
</template>

<script>
import FormulaEditor from '@/components/formula/editor/FormulaEditor.vue';
import VueResizable from 'vue-resizable';
import SqlQuerySidebar from './sidebar/SqlQuerySidebar.vue';

export default {
    components: {
        FormulaEditor,
        SqlQuerySidebar,
        'vue-resizable': VueResizable
    },
    props: {
        isShowQueryPanel: { type: Boolean, default: false },
        titlePanel: { type: String, default: '' },
        valuePanel: { type: String, default: '' },
        namePanel: { type: String, default: '' },
        smallEditorInstKey: { type: String, default: '' }
    },
    data() {
        return {
            widthPanel: '65%',
            valueEditor: '',
            minimisePanel: false,
            isCollapsesidebar: false,
            listDB: [
                { name: 'PostgresQL', on: true },
                { name: 'ClickHouse', on: false }
            ],
            isRunning: false,
            isRunningHistory: false,
            contentRightWidth: '35%',
            contentLeftWidth: '65%',
            databaseUsing: '',
            timeOut: null
        };
    },
    created() {
        this.valueEditor = this.valuePanel;
        this.$evtBus.$on('script-editor-ide-choose-history-query', (data) => {
            if (this.valueEditor) {
                let str = '\n' + data.sql + ';';
                this.valueEditor += str;
            } else {
                let str = data.sql + ';';
                this.valueEditor += str;
            }
        });
        this.$evtBus.$on('choose-column', (data) => {
            this.valueEditor += data;
        });
        this.$evtBus.$on(
            'script-editor-ide-connect-formtpl',
            (inputInfo, name, instKey) => {
                if (
                    name == this.namePanel &&
                    this.smallEditorInstKey == instKey
                )
                    this.valueEditor = inputInfo.value;
            }
        );
    },
    mounted() {
        for (let i = 0; i < this.listDB.length; i++) {
            if (this.listDB[i].on) {
                this.databaseUsing = this.listDB[i].name;
            }
        }
    },
    beforeDestoy() {
        this.$evtBus.$off('script-editor-ide-change-output');
        this.valueEditor = '';
    },
    methods: {
        handleResizecontentPanel(eventName, left, top, width, height) {
            this.$refs.contentLeft.h = this.$refs.contentPanel.h;
        },
        handleResizecontentLeft(eventName, left, top, width, height) {
            let self = this;
            let k = this.$refs.contentPanel.w - this.$refs.contentLeft.w;
            this.contentRightWidth = String(k) + 'px';
            this.$refs.edtFormula.setContainerWidth(this.$refs.contentLeft.w);
            if (Number(k) < 150) {
                this.$refs.edtQuerySidebar.mini = true;
                self.collapseSideBar(true);
            }
        },
        closeSqlqueryPanel() {
            this.$emit('close-sql-query-panel');
        },
        runQuery() {
            const self = this;

            clearTimeout(self.timeOut);
            self.timeOut = setTimeout(() => {
                if (self.valueEditor == '') return;
                self.$refs.edtFormula.executeFormulas();
                self.isRunning = true;
            }, 500);
        },
        stopQuery() {
            this.isRunning = false;
        },
        collapseSideBar(val) {
            this.isCollapsesidebar = val;
            if (this.isCollapsesidebar) {
                this.contentRightWidth = '56px';
                this.$refs.contentLeft.w =
                    String($(this.$refs.contentPanel.$el).width() - 56) + 'px';
            } else {
                this.contentRightWidth = '35%';
                this.$refs.contentLeft.w = '65%';
            }
        },
        minimiseSqlqueryPanel() {
            if (this.minimisePanel) {
                this.$refs.contentLeft.w = '100%';
                this.$refs.contentPanel.h = '37px';
            } else {
                this.collapseSideBar(this.isCollapsesidebar);
                this.$refs.contentPanel.h = this.$refs.contentLeft.h;
            }
        },
        formatSQL() {
            this.$refs.edtFormula.formatSql();
        },
        changeDatabase(item) {
            for (let i = 0; i < this.listDB.length; i++) {
                if (item.name != this.listDB[i].name) {
                    this.listDB[i].on = false;
                } else {
                    this.databaseUsing = item.name;
                }
            }
        }
    },
    watch: {
        isShowQueryPanel(val) {
            this.minimisePanel = false;
            this.contentRightWidth = '35%';

            if (this.$refs.contentLeft) {
                this.$refs.contentLeft.w = '65%';
            }
        },
        minimisePanel() {
            this.minimiseSqlqueryPanel();
        },
        valueEditor(val) {
            if (this.namePanel != 'queryeditor') {
                let k = {};
                k.name = this.namePanel;
                k.value = val;
                k.instKey = this.smallEditorInstKey;
                this.$evtBus.$emit('script-editor-ide-change-output', k);
            }
        },
        valuePanel(val) {
            this.valueEditor = val;
        }
    }
};
</script>

<style scoped>
.content-panel {
    z-index: 1000;
    background-color: white;
    position: fixed;
    bottom: 0;
    display: flex;
    max-height: 600px;
    min-height: 37px;
    border-top: 1px solid #c6c6c6;
}
.content-left {
    max-height: 100%;
    min-width: 40%;
}
.content-left .formula-editor {
    border-top: 1px solid #c6c6c6;
}
.content-right {
    border-left: 1px solid #c6c6c6;
    max-height: 100%;
    height: 100%;
}
</style>
