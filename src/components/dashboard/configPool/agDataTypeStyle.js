function makeDecimalSeparator(number) {
    number = number.toString();
    let section = number.split('.');
    section[0] = section[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    return section.join('.');
}

export default {
    number: {
        cellStyle: { 'text-align': 'right' },
        valueFormatter: (params) => {
            if (params.value === null || params.value === undefined) {
                return '';
            }
            var number = Number(params.value);
            return isNaN(number) ? 0 : makeDecimalSeparator(number);
        },
    },
    date: {
        cellStyle: {},
    },
    text: {
        cellStyle: {},
    },
};
