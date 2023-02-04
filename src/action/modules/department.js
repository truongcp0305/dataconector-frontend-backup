let commonProps = {
    module: 'orgchart',
    resource: 'department',
    scope: 'orgchart',
};

export default [
    {
        ...commonProps,
        action: 'set_manager',
        handler: function (param) {},
    },
];
