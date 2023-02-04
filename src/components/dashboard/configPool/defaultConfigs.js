export const defaultConditionFormat = {
    listColumns: [], // danh sách tất cả các cột trong table
    applyColumnUid: '', // đối tượng chứa thông tin cột để áp dụng format theo điều kiện
    mode: 'singleColor', // chế độ format: singleColor (màu đơn sắc) hoặc colorScale (theo dải màu)
    applyColumnObj: {},
    singleColorConfig: [
        // cấu hình cho chế độ màu đơn sắc: danh sách các item cấu hình
        // {
        //     condition : {}, // điều kiện hiển thị, cấu hình giống như cây điều kiện
        //     style: {} // cách hiển thị khi thỏa mãn điều kiện, các cấu hình giống prop value của component TextStyleSetting.vue
        // }
    ],
    colorScaleConfig: {
        minPoint: {
            type: 'minValue', // nhận một trong ba giá trị: minValue, percent, fixedValue
            value: '', // giá trị được điền trong trường hợp type là fixedValue
        },
        midlePoint: {
            type: '', // giống như trên
            value: '', // giống như trên
        },
        maxPoint: {
            type: '', // giống như trên
            value: '', // giống như trên
        },
    },
};
