<template>
    <div class="w-100 h-100">
        <component
            :is="listTag"
            @changeObjectType="changeObjectType"
            :height="height"
            :objecType="objecType"
            @change-height="changeHeight"
        >
        </component>
    </div>
</template>

<script>
import list from '@/components/myItem/List';
import listWork from '@/components/myItem/work/List';
import listDocument from '@/components/myItem/document/List';
import { uiConfigApi } from '@/api/uiConfig';
export default {
    name: 'ListTaskContainer',
    components: {
        'list-task': list,
        'list-work': listWork,
        'list-document': listDocument
    },
    computed: {
        type() {
            return this.$route.params.type;
        },
        listTag() {
            return this.mappingCpn[this.objecType];
        }
    },
    mounted() {},
    data: function () {
        return {
            height: 'calc(100vh - 120px)',
            objecType: 0,
            mappingCpn: {
                0: 'list-task',
                1: 'list-work',
                2: 'list-document'
            }
        };
    },
    methods: {
        changeHeight(newHeight) {
            this.height = newHeight;
        },
        changeObjectType(index) {
            this.objecType = index;
            let rsl = {
                widgetIdentifier: this.getWidgetIdentifier(),
                detail: index
            };
            uiConfigApi
                .saveUiConfig(rsl)
                .then((res) => {})
                .catch((err) => {});
        },
        getWidgetIdentifier() {
            let widgetIdentifier = this.$route.path + ':type';
            widgetIdentifier = widgetIdentifier.replace(/(\/|\?|=)/g, '');
            return widgetIdentifier;
        }
    },
    created() {
        let self = this;
        if (this.$route.params.type) {
            if (this.$route.params.type == 'work') {
                this.objecType = 1;
            }
        }
        let widgetId = this.getWidgetIdentifier();
        uiConfigApi
            .getUiConfig(widgetId)
            .then((res) => {
                if (res.status == 200) {
                    self.objecType = parseInt(res.data.detail);
                }
            })
            .catch((err) => {});
    }
};
</script>
