<template>
    <div
        class="symper-action-view"
        :style="{
            width: myWidth,
            height: myHeight
        }"
    >
        <component
            ref="component"
            :symper-parent-component-context="'application'"
            v-if="!loadingComponent"
            :is="actionViewCompon"
            class="h-100 w-100"
        ></component>
    </div>
</template>

<script>
import { getKeyForAction } from './index';
import actionMap from './index';
import { util } from '@/plugins/util';
import { event } from 'jquery';
export default {
    created() {
        let self = this;
        this.$evtBus.$on('symper-change-action-view-url', (data) => {
            event;
            self.displayViewFromLink(data.link);
        });
        let checkCpnRendered = setInterval(() => {
            if (this.$refs.component) {
                this.$emit('view-rendered');
                clearInterval(checkCpnRendered);
            }
        }, 50);
    },
    props: {
        width: {
            default: '100%'
        },
        height: {
            default: '100%'
        },
        /**
         * Định nghĩa về action cần thực thi trong component này
         */
        actionDef: {
            type: Object,
            default() {
                return {
                    module: '',
                    resource: '',
                    scope: '',
                    action: ''
                };
            }
        },
        param: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    watch: {
        actionDef: {
            deep: true,
            immediate: true,
            handler(newValue) {
                if (!this._inactive) {
                    this.displayActionView();
                }
            }
        },
        param: {
            deep: true,
            immediate: true,
            handler(newValue) {
                if (!this._inactive) {
                    this.displayActionView();
                }
            }
        }
    },
    mounted() {
        this.displayActionView();
    },
    data() {
        return {
            actionViewCompon: null,
            loadingComponent: false
        };
    },
    methods: {
        async displayActionView() {
            let key = getKeyForAction(this.actionDef);
            if (actionMap.hasOwnProperty(key)) {
                this.loadingComponent = true;
                if (actionMap[key].hasOwnProperty('$getActionLink')) {
                    let link = actionMap[key].$getActionLink(this.param);
                    if (util.isPromise(link)) {
                        link = await link;
                    }
                    this.displayViewFromLink(link);
                } else {
                    console.warn(
                        '[SYMPER ACTION VIEW]: $getActionLink method not found in action definition',
                        this.action,
                        this.param
                    );
                }
            } else {
                console.error(
                    '[SYMPER ACTION VIEW]: action key not found',
                    this.action
                );
            }
        },
        async displayViewFromLink(link) {
            let matchRoute = this.$router.match(link);
            if (matchRoute && matchRoute.matched && matchRoute.matched[0]) {
                let matchedRoute = matchRoute.matched[0];
                this.$route.meta.sRouteName = matchRoute.name;
                for (let key in matchRoute.params) {
                    this.$route.params[key] = matchRoute.params[key];
                }
                let componentData = matchedRoute.components;
                if (typeof componentData.default == 'function') {
                    componentData = await matchedRoute.components.default();
                }
                setTimeout(
                    (self) => {
                        self.loadingComponent = false;
                    },
                    500,
                    this
                );
                this.actionViewCompon = componentData.default;
            }
        }
    },
    computed: {
        myWidth() {
            return isNaN(Number(this.width)) ? this.width : this.width + 'px';
        },
        myHeight() {
            return isNaN(Number(this.height))
                ? this.height
                : this.height + 'px';
        }
    }
};
</script>

<style></style>
