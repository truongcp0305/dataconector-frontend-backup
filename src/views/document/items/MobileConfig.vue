<template>
    <v-dialog
        persistent
        v-if="isShowMobileConfig"
        v-model="isShowMobileConfig"
        width="932"
        :content-class="'h-100 bg-white d-flex flex-column'"
        class="overflow-hidden"
        scrollable
    >
        <div class="header bg-light-grey pt-1">
            <HeaderForm
                ref="headerForm"
                :isBorderBottom="false"
                :showIconInfo="false"
                :showBtnSave="true"
                :showCloseIcon="true"
                :nameHeader="headerInfo.nameHeader"
                :icon="headerInfo.icon"
                @click-icon="back"
                @save-form="saveData"
                @close-form="close"
            />
        </div>
        <div class="body py-0 pa-5 h-100 bg-light-grey">
            <div class="note fs-11">
                <span class="color-red">*</span>
                <span style="color: #959595">
                    {{
                        $t(
                            'document.editor.mobileConfig.drag_between_two_column_to_hide_or_show_control',
                        )
                    }}
                </span>
            </div>
            <div class="color-red pt-2" v-if="error">{{error}}</div>
            <KanbanColumn
                ref="kanbanColumn"
                :showCheckbox="headerInfo.icon == iconBack?false:true"
                @select-card="handleSelectCard"
                @move-card="handleMoveCard"
                @tick-checkbox="handleCheckbox"
                @change-input="handleChangeInput"
                :columns="columns"
                :cards="cards"
            />
        </div>
    </v-dialog>

</template>
<script>
import HeaderForm from '@/components/common/HeaderForm';
import KanbanColumn from '@/components/common/KanbanColumn';
import { util } from '@/plugins/util.js';

export default {
    components: {
        HeaderForm,
        KanbanColumn,
    },
    props: {
        instance: {
            type: Number,
        },
        columns: {
            type: Array,
            default() {
                return [];
            },
        },
        data: {
            type: Object, // d??? li???u ban ?????u
            default() {
                return {};
            },
        },
        headerInfo: {
            type: Object,
            default() {
                return {
                    icon: '',
                    nameHeader: '',
                };
            },
        },
    },
    data() {
        return {
            error:'',
            iconBack:'mdi mdi-chevron-left',
            isShowMobileConfig: false,
            selectedTableId: '',
            dataTemporary: {}, // to??n b??? d??? li???u ???? ???????c s???p x???p l??u t???m, khi ???n l??u s??? ???????c g??n cho data
            cards: [], // d??? li???u ??ang hi???n th???
        };
    },
    created() {},
    watch: {},
    methods: {
        setDataTemporary(data) {
            this.cards = data;
        },
        saveData() {
            if(this.checkValidate()){
                this.isShowMobileConfig = false;
                this.$emit('save-data', this.dataTemporary);
            }else{
                this.$refs.headerForm.loading = false;
            }
        },
        checkValidate(){
            this.error = ""
            let countCardSelected = 0;
            let countCardHasPosition = 0;
            this.dataTemporary.outTable.map(data=>{
                if(data.isSelected){
                   ++ countCardSelected 
                }
                if(data.position){
                     ++ countCardHasPosition
                    if(Number(data.position)>3 || Number(data.position) < 1 || !Number.isInteger(Number(data.position))){
                        this.error =  this.$t('document.editor.mobileConfig.validate_position_value').replace('{position}', data.position).replace('{title}', data.title)
                    }
                    // ki???m tra t???n t???i v??? tr??
                    let samePosition = this.dataTemporary.outTable.filter(c=>c.position == data.position)
                    if(samePosition.length>1){
                        this.error = this.$t('document.editor.mobileConfig.validate_exist_value').replace('{number}', data.position).replace('{title}', data.title)
                    }
                }
               
            })
            if(countCardSelected != 3){
                this.error = this.$t('document.editor.mobileConfig.validate_number')
            }else if(countCardHasPosition != 3){
                this.error =  this.$t('document.editor.mobileConfig.validate_position')
            }
            return this.error?false:true
        },
        // x??? l?? khi ???n quay l???i m??n ban ?????u trong c???u h??nh mobile
        back() {
            this.selectedTableId = '';
            this.cards = util.cloneDeep(this.dataTemporary.outTable);
            this.changeHeaderInfo(
                '',
                this.$t(
                    'document.editor.mobileConfig.display_document_in_mobile',
                ),
            );
        },
        handleSelectCard(data) {
            if (this.dataTemporary.table[data.id] && !data.groupMode) {
                this.selectedTableId = data.id;
                let card = this.cards.filter((c) => c.id == data.id);
                if (card.length > 0) {
                    this.changeHeaderInfo(
                        this.iconBack,
                        card[0].title,
                    );
                }
                this.cards = util.cloneDeep(this.dataTemporary.table[data.id]);
            }
        },
        changeHeaderInfo(icon, nameHeader) {
            this.headerInfo.icon = icon;
            this.headerInfo.nameHeader = nameHeader;
        },
        handleCheckbox(value) {
            const self = this;
            this.dataTemporary.outTable.map((card, cardIdx) => {
                if (card.id == value.id) {
                    self.dataTemporary.outTable[cardIdx].isSelected =
                        value.value;
                    if (!value.value) {
                        self.dataTemporary.outTable[cardIdx].position = '';
                    }
                }
                // n???u b??? t??ch th?? hi???n th??? all
            });
            //  ki???m tra s??? check box >3 th?? disable
            let checkSelectedControl = this.dataTemporary.outTable.filter(
                (control) => control.isSelected,
            );
            if (checkSelectedControl.length == 3) {
                this.dataTemporary.outTable.map((card, cardIdx) => {
                    if (!card.isSelected) {
                        self.dataTemporary.outTable[cardIdx].disabled = true;
                    }
                    if (card.isSelected && card.position == '') {
                        let suitableNumber = self.findSuitableNumber(checkSelectedControl.length)
                        this.$set(self.dataTemporary.outTable[cardIdx], 'position', suitableNumber )
                    }
                    // n???u b??? t??ch th?? hi???n th??? all
                });
            } else {
                this.dataTemporary.outTable.map((card, cardIdx) => {
                    self.dataTemporary.outTable[cardIdx].disabled = false;
                    // n???u ???????c ch???n v?? position r???ng => g??n position = check selected control
                    if (card.isSelected && card.position == '') {
                        let suitableNumber = self.findSuitableNumber(checkSelectedControl.length)
                        this.$set(self.dataTemporary.outTable[cardIdx], 'position', suitableNumber )
                    }
                });
            }
            this.cards = this.dataTemporary.outTable;

        },
        findSuitableNumber(defaultValue) {
            let numbers = { 3: false, 2: false, 1: false };
            let max = 0;
            this.dataTemporary.outTable.map((card, cardIdx) => {
                if ([1, 2, 3].includes(Number(card.position))) {
                    numbers[card.position] = true;
                }
                if (Number(card.position) > max) {
                    max = card.position;
                }
            });
            Object.keys(numbers).reverse().map((n) => {
                if (!numbers[n]) {
                    defaultValue = n;
                }
            });
            return defaultValue;
        },
        handleChangeInput(value) {
            const self = this;
            this.dataTemporary.outTable.map((card, cardIdx) => {
                if (card.id == value.id) {
                    self.dataTemporary.outTable[cardIdx].position = value.value;
                }
            });
        },
        handleMoveCard(data) {
            let allSeletedCards =
                this.$refs.kanbanColumn.getCardByColumn('selectedControl');
            let allUnselectedCard =
                this.$refs.kanbanColumn.getCardByColumn('unselectedControl');
            let allData = [...allSeletedCards, ...allUnselectedCard];
             let countCardSelected = this.dataTemporary.outTable.filter(c=>c.isSelected)
            if (this.selectedTableId) {// c?? b???ng
                this.dataTemporary.table[this.selectedTableId] = allData;
            } else {
                let needUnDisableCard = false; // n???u k??o th??? c?? checkbox=> uncheck to??n b??? checkbox
                this.dataTemporary.outTable = allData;
                if(data.columnId == 'unselectedControl'){
                    this.dataTemporary.outTable.map((card, cardIdx) => {
                        if (card.id == data.id) {
                            this.dataTemporary.outTable[cardIdx].position = '';
                            this.dataTemporary.outTable[cardIdx].isSelected = false
                        }
                        if(card.isSelected && countCardSelected.length <3){
                            needUnDisableCard = true
                        }
                    })
                    // tr?????ng h???p k??o c?? t??ch ch???n t??? ?????ng format
                }else{
                   
                    if(countCardSelected.length == 3){
                        this.dataTemporary.outTable.map((c, idx)=>{
                            if(c.id == data.id){
                                this.dataTemporary.outTable[idx].disabled = true 
                            }
                        })
                    }
                }
                if(needUnDisableCard){
                    this.unDisableCard()
                }
            }
            this.$refs.kanbanColumn.unselectCardKanban(data.id);
          
        },
        unDisableCard(){
             this.dataTemporary.outTable.map((card, cardIdx) => {
                  this.dataTemporary.outTable[cardIdx].disabled = false;
             })
        },
        close() {
            this.isShowMobileConfig = false;
            this.$emit('close');
        },
        show() {
            this.error = ""
            this.isShowMobileConfig = true;
            this.changeHeaderInfo(
                '',
                this.$t(
                    'document.editor.mobileConfig.display_document_in_mobile',
                ),
            );
            setTimeout(() => {
                this.cards = util.cloneDeep(this.data.outTable);
                this.dataTemporary = util.cloneDeep(this.data);
            }, 50);
        },
    },
};
</script>
<style scoped>
.bg-light-grey {
    background-color: #f2f2f2 !important;
}

/* .body{
    max-height:100%; 
    overflow:scroll
} */
</style>
