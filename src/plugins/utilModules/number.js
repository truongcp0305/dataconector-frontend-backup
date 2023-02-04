export const number = {
    thousandsSeparateAndRound(
        num,
        decCount = 2,
        separator = ',',
        removeRedundantZero = false,
    ) {
        let rsl = Number(Number(num).toFixed(decCount)).toLocaleString(
            undefined,
            {
                minimumFractionDigits: decCount,
            },
        );
        if (removeRedundantZero) {
            let s = rsl.split('.');
            if (s.length > 1) {
                s[1] = s[1].replace(/0+$/, '');
                rsl = s[1] ? s.join('.') : s[0];
            }
        }
        return rsl;
    },
};
