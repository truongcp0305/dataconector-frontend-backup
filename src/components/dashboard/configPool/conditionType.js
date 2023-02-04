let allCondType = {
    contains: {
        label: SYMPER_APP.$t('v2.dashboard.contains'),
        value: 'contains',
    },
    notcontains: {
        label: SYMPER_APP.$t('v2.dashboard.notContains'),
        value: 'notcontains',
    },
    startwith: {
        label: SYMPER_APP.$t('v2.dashboard.startWith'),
        value: 'startwith',
    },
    notstartwith: {
        label: SYMPER_APP.$t('v2.dashboard.notStartWith'),
        value: 'notstartwith',
    },
    is: {
        label: SYMPER_APP.$t('v2.dashboard.is'),
        value: 'is',
    },
    isnot: {
        label: SYMPER_APP.$t('v2.dashboard.isNot'),
        value: 'isnot',
    },
    isblank: {
        label: SYMPER_APP.$t('v2.dashboard.isBlank'),
        value: 'isblank',
    },
    notblank: {
        label: SYMPER_APP.$t('v2.dashboard.notBlank'),
        value: 'notblank',
    },
    in: {
        label: SYMPER_APP.$t('v2.dashboard.in'),
        value: 'in',
    },
    notin: {
        label: SYMPER_APP.$t('v2.dashboard.notIn'),
        value: 'notin',
    },
    isall: {
        label: SYMPER_APP.$t('v2.dashboard.isAll'),
        value: 'isall',
    },

    lessthan: {
        label: SYMPER_APP.$t('v2.dashboard.lessThan'),
        value: 'lessthan',
        sign: '<',
    },
    greaterthan: {
        label: SYMPER_APP.$t('v2.dashboard.greaterThan'),
        value: 'greaterthan',
        sign: '>',
    },
    lessthanorequal: {
        label: SYMPER_APP.$t('v2.dashboard.lessThanOrEqual'),
        value: 'lessthanorequal',
        sign: '<=',
    },
    greaterthanorequal: {
        label: SYMPER_APP.$t('v2.dashboard.greaterOrEqual'),
        value: 'greaterthanorequal',
        sign: '>=',
    },
};

let speCondType = {
    number: [
        'isall',
        'lessthan',
        'lessthanorequal',
        'greaterthan',
        'greaterthanorequal',
        'is',
        'isnot',
        'isblank',
        'notblank',
        'in',
        'notin',
    ],
    date: [
        'isall',
        'lessthan',
        'lessthanorequal',
        'greaterthan',
        'greaterthanorequal',
        'is',
        'isnot',
        'isblank',
        'notblank',
        'in',
        'notin',
    ],
    datetime: [
        'isall',
        'lessthan',
        'lessthanorequal',
        'greaterthan',
        'greaterthanorequal',
        'is',
        'isnot',
        'isblank',
        'notblank',
        'in',
        'notin',
    ],
    text: [
        'isall',
        'is',
        'isnot',
        'isblank',
        'notblank',
        'startwith',
        'contains',
        'notcontains',
        'notstartwith',
        'in',
        'notin',
    ],
};

let cpnCondType = {};
for (let type in speCondType) {
    cpnCondType[type] = {};
    for (let condName of speCondType[type]) {
        cpnCondType[type][condName] = allCondType[condName];
    }
}
export default cpnCondType;
