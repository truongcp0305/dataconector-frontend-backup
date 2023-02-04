// import {getControlInstanceFromStore} from './../common/common'
export default class FormulasEvent {
    constructor(keyInstance, formulas, type) {
        /**
         * chỉ ra đang ở instance của view submit nào, (trường hợp có sub form thì có 2 key)
         */
        this.keyInstance = keyInstance;
        this.formulas = this.removeComment(formulas);
        /**
         * Loại của công thức: validate, data, require, readonly..f
         */
        this.type = type;
    }
    // hàm loại bỏ comment trong công thức
    removeComment(string) {
        return string.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
    }
    /**
     * Hàm lấy dữ liệu của các control trong store để chuân bị cho việc run formulas
     * dataInput : {controlName : value}
     * rowIndex là lấy cell ở row hiện tại nếu là trong table
     */
    //  s(listInputInDocument, extraData = false){
    //     let inputControl = this.getInputControl();
    //     let dataInput = {};
    //     for(let inputControlName in inputControl){
    //         if(inputControlName == extraData.controlName){
    //             dataInput[inputControlName] = extraData.e.target.value;
    //         }
    //         else{
    //             if(listInputInDocument.hasOwnProperty(inputControlName)){
    //                 let controlIns = getControlInstanceFromStore(this.keyInstance,inputControlName)
    //                 let valueInputControl = controlIns.value;
    //                 if(controlIns.type == 'inputFilter'){
    //                     valueInputControl = valueInputControl.split(',')
    //                 }
    //                 if(controlIns.type == 'time'){
    //                     valueInputControl = controlIns.convertTimeToStandard(valueInputControl)
    //                 }
    //                 dataInput[inputControlName] = valueInputControl;
    //             }
    //         }
    //     }
    //     return dataInput;
    // }
}
