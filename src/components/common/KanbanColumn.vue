<template>
    <div
        id="symper-kanban-column"
        :style="{ 'max-height': height, height: height }"
    ></div>
</template>
<script>
var kanban = require('@/../src/components/kanban/kanban/kanban.js');
var getData = require('@/../src/components/kanban/kanban/data.js');
require('@/../src/components/kanban/kanban/kanban.css');

export default {
    props: {
        columns: {
            type: Array,
            default() {
                return [];
            },
        },
        cards: {
            type: Array,
            default() {
                return [];
            },
        },
        height: {
            type: String,
            default: '560px',
        },
        showCheckbox: {
            type: Boolean,
            default: true,
        }
    },
    watch: {
        cards: {
            deep: true,
            immediate: true,
            handler(val) {
                const self = this;
                let columns = self.columns;
                let cards = self.cards;
                if (self.kanbanInstance) {
                    self.parseKanban(columns, cards);
                }
            },
        },
    },
    data() {
        return {
            kanbanInstance: '',
            
        };
    },
    mounted() {
        window.checkbox = (e) => {
            let id = $(e).attr('card-id');
            let value = e.checked;
            this.$emit('tick-checkbox', { id: id, value: value });
        };
        window.changeInput = (e) => {
            let id = $(e).attr('card-id');
            this.$emit('change-input', { id: id, value: e.value });
        };
        const { Kanban, defaultEditorShape } = kanban;
        const { cardShape, editorShape } = getData();
        const columns = this.columns;
        const cards = this.cards;
        let cardTemplate = this.getCardTemplate;
        this.kanbanInstance = new Kanban('#symper-kanban-column', {
            columns,
            cards,
            cardShape,
            cardTemplate,
            editorShape: [...defaultEditorShape, ...editorShape],
        });
        this.listenKanbanEvent();
    },

    methods: {
        parseKanban(columns, cards) {
            this.kanbanInstance.parse({
                columns,
                cards,
            });
        },
        unselectCardKanban(id) {
            this.kanbanInstance.unselectCard({ id: id });
        },
        getCardByColumn(column) {
            return this.kanbanInstance.getAreaCards(column);
        },
        listenKanbanEvent() {
            const self = this;
            this.kanbanInstance.api.on('select-card', (data) => {
                self.$emit('select-card', data);
            });
            this.kanbanInstance.api.on('move-card', (data) => {
                self.$emit('move-card', data);
            });
        },
        getCardTemplate({ cardFields, selected, dragging, cardShape }) {
            const {
                id,
                title,
                icon,
                type,
                column,
                required,
                isSelected,
                position,
                disabled,
            } = cardFields;
            let titleControl =
                title.length > 26 ? title.slice(0, 25) + '...' : title;
            let div = '';
            let positionConfig = `
              <input class="check-box"  
                    ${isSelected ? 'checked' : ''} 
                    card-id="${id}" onclick="checkbox(this)" type="checkbox" 
                    ${disabled ? 'disabled' : ''} 
                    class="mx-5" style="height:20px; width:20px; margin-top:5px">
            <input 
                type="number"
                min="1" max="3"
                ${disabled ? 'disabled' : ''}
                class="input-value  
                ${disabled ? 'disable-input-value' : ''}"  
                card-id="${id}" onchange="changeInput(this)" 
                style="border: 0.5px solid #5A5A5A; border-radius: 2px; width:84px; height:22px; margin-top:5px; padding-left:8px" 
                value='${position}'> `;
            if (column == 'unselectedControl') {
                div = `
                    <div class="unselect-card ma-1" style="
                        padding:4px; 
                        display:flex; 
                        justify-content: space-between; 
                        height:28px;
                        border-radius: 4px;
                    "> 
                        <div class="card-title" 
                            style="font-size:13px; 
                            margin-top:3px;
                            width:240px;
                                display:flex; align-items:center;  
                                overflow: hidden; text-overflow: ellipsis; 
                                white-space: nowrap;
                                display: inline-block;
                        ">
                            ${title}
                        </div>    
                        <div class="" style="width: 20px">
                            <i class="mdi ${icon} mr-2" style="font-size:18px">
                            </i>
                        </div>
                        
                    </div>
                `;
            } else {
                if (type == 'table') {
                    div = ` <div 
                        class="selected-card w-100 d-flex justify-space-between pr-1 table-input" 
                        style="background:#f1f1f1; 
                            height:32px; 
                            width:355px; 
                            display:flex; 
                            justify-content:space-between; 
                            margin:4px; padding:8px;
                        ">
                        <div>${title}</div>
                        <div> <i class="mdi ${icon}" style="font-size:18px; margin-top:8px; margin-right:4px"></i></div>

                    </div>`;
                } else {
                    div = `
                        <div class="selected-card d-flex justify-space-between pa-1"
                            
                             style="display:flex; justify-content:space-between"> 
                            <div class="card-title mr-1 mt-1" style="font-size:13px; 
                                max-width:200px;
                                display:flex; align-items:center;  
                                ">${titleControl}
                                <span class="color-red">${
                                    required ? '*' : ''
                                }</span>    
                            </div>
                            <div style="width: 220px; 
                                    background:#F2F2F2; 
                                    height:32px; 
                                    display:flex;
                                    justify-content:flex-end; 
                                    border-radius:4px">
                                <i class="mdi ${icon}" style="font-size:18px; margin-top:8px; margin-right:8px"></i>
                            </div> 
                          ${this.showCheckbox?positionConfig:''}
                        </div>
                       
                    `;
                }
            }
            return div;
        },
    },
};
</script>
<style scoped>
#symper-kanban-column >>> .menu.svelte-7sr7a5 {
    display: none;
}
#symper-kanban-column >>> .column.svelte-7sr7a5 {
    background: #f1f1f1;
    border: none;
    padding: 0 !important;
}
#symper-kanban-column >>> .add-card-btn {
    display: none;
}
#symper-kanban-column >>> .kanban .editor {
    display: none !important;
}
#symper-kanban-column >>> .kanban.svelte-ubghh1 {
    padding: 4px;
}
#symper-kanban-column >>> .card.svelte-9295rp {
    min-height: 30px;
}
#symper-kanban-column >>> .label {
    font-size: 13px !important;
}
#symper-kanban-column >>> .kanban {
    padding: 0 !important;
}
#symper-kanban-column >>> .header {
    height: unset !important;
    min-height: unset !important;
}
#symper-kanban-column >>> .column.svelte-bzo6n1:nth-child(2) {
    width: 590px;
    padding-right: 20px;
}
#symper-kanban-column >>> .column.svelte-bzo6n1:nth-child(2) > .card {
    margin: 0px !important;
}
#symper-kanban-column >>> .card {
    border: 0.25px dashed white !important;
}
#symper-kanban-column >>> .selected-card {
    border: 0.25px dashed white !important;
}
#symper-kanban-column >>> .selected-card:hover {
    border: 0.25px dashed rgba(0, 71, 255, 0.97) !important;
    border-radius: 4px !important;
}
#symper-kanban-column >>> .column.svelte-bzo6n1:nth-child(1) > .card {
    border: 0.25px dashed grey !important;
    margin: 0 2px 8px 2px !important;
}
#symper-kanban-column >>> .column.svelte-bzo6n1:nth-child(1) > .card:hover {
    border: none !important;
    border: 0.25px dashed rgba(0, 71, 255, 0.97) !important;
}
#symper-kanban-column >>> .card-title {
    font-size: 13px;
    width: 250px;
}
#symper-kanban-column >>> .card-input {
    width: 220px;
    background: #f2f2f2;
    height: 32px;
    display: flex;
    justify-content: flex-end;
    border-radius: 4px;
}
#symper-kanban-column >>> .column.svelte-bzo6n1 {
    min-height: 495px !important;
    background: white;
    padding: 4px;
}
#symper-kanban-column >>> .column.svelte-bzo6n1 {
    /* max-height: 495px; */
    min-height: 495px !important;
    background: white;
    padding-right: 8px;
}
#symper-kanban-column >>> .content-wrapper {
    overflow-x: hidden !important;
    margin-bottom: 16px;
}
#symper-kanban-column >>> .wx-default,
.wx-portal {
    --wx-border-color: white !important;
}
#symper-kanban-column >>> .disable-input-value {
    background: #f2f2f2;
    border: none !important;
}
</style>
<style>
.wx-portal .dragged-card {
    min-height: 38px !important;
    margin: 0px !important;
    padding: 4px;
    border-radius: 4px;
    border: 0.25px dashed rgba(0, 71, 255, 0.97) !important;
    width: 375px !important;
}
#symper-kanban-column::-webkit-scrollbar {
    width: 6px !important;
}
.dragged-card .check-box {
    display: none !important;
}
.dragged-card .input-value {
    display: none !important;
}
#symper-kanban-column .header.svelte-7sr7a5.svelte-7sr7a5 {
    margin-bottom: 0px!important;
}
</style>
