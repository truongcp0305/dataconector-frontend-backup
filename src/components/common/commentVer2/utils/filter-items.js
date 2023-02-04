export default (items, prop, val, startsWith = false) => {
    if (!val || val === '') return items;
    // console.log(val)
    return items.filter((v) => {
        let k = v[prop].toLowerCase();
        return k.includes(val.toLowerCase());

        // if (startsWith) return formatString(v[prop]).startsWith(formatString(val))
        // return formatString(v[prop]).includes(formatString(val))
    });
};

function formatString(string) {
    return string
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}
