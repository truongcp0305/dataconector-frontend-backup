let textAgg = {
    not_agg: {
        name: SYMPER_APP.$t('v2.dashboard.notAggreate'),
        icon: '',
    },
    count_dist: {
        name: SYMPER_APP.$t('v2.dashboard.countDistinct'),
        icon: '',
    },
    count: {
        name: SYMPER_APP.$t('v2.dashboard.count'),
        icon: '',
    },
    last: {
        name: SYMPER_APP.$t('v2.dashboard.last'),
        icon: '',
    },
    first: {
        name: SYMPER_APP.$t('v2.dashboard.first'),
        icon: '',
    },
};

let numberAgg = {
    not_agg: {
        name: SYMPER_APP.$t('v2.dashboard.notAggreate'),
        icon: '',
    },
    count_dist: {
        name: SYMPER_APP.$t('v2.dashboard.countDistinct'),
        icon: '',
    },
    count: {
        name: SYMPER_APP.$t('v2.dashboard.count'),
        icon: '',
    },
    avg: {
        name: SYMPER_APP.$t('v2.dashboard.average'),
        icon: '',
    },
    sum: {
        name: SYMPER_APP.$t('v2.dashboard.sum'),
        icon: '',
    },
    max: {
        name: SYMPER_APP.$t('v2.dashboard.maximun'),
        icon: '',
    },
    min: {
        name: SYMPER_APP.$t('v2.dashboard.minimun'),
        icon: '',
    },
    first: {
        name: SYMPER_APP.$t('v2.dashboard.firstInGroup'),
        icon: '',
    },
    last: {
        name: SYMPER_APP.$t('v2.dashboard.lasttInGroup'),
        icon: '',
    },
};

let settingTplAgg = {
    text: textAgg,
    date: {
        ...textAgg,
        max: {
            name: SYMPER_APP.$t('v2.dashboard.maximun'),
            icon: '',
        },
        min: {
            name: SYMPER_APP.$t('v2.dashboard.minimun'),
            icon: '',
        },
    },
    datetime: {
        ...textAgg,
        max: {
            name: SYMPER_APP.$t('v2.dashboard.maximun'),
            icon: '',
        },
        min: {
            name: SYMPER_APP.$t('v2.dashboard.minimun'),
            icon: '',
        },
    },
    time: textAgg,
    number: numberAgg,
};

export default settingTplAgg;
