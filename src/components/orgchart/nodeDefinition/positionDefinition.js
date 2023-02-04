let shapeSize = {
    width: 250,
    height: 100,
};
let avatarSize = shapeSize.height / 2 - 5;
let borderBottomHeight = 2;
let CEConfig = {
    stickHeight: 20,
    stickWidth: 1,
    radius: 7,
    fontSize: 12,
};
export const DEFAULT_POSITION_DISPLAY = {
    fill: '#F2F2F2 ',
    rx: 6,
    ry: 8,
    'stroke-width': 0,
    stroke: '#D9D9D9',
    filter: {
        name: 'dropShadow',
        args: {
            color: 'rgba(0, 0, 0, 0.1)',
            // width: 0.5,
            // opacity: 0.5,
            // blur: 5
            dx: 2,
            dy: 2,
            blur: 2,
        },
    },
};
export const MOUSEENTER_POSITION_DISPLAY= {
    'stroke-width': 1,
    stroke: '#0000FF',
};
export const FOUCUS_POSITION_DISPLAY = {
    'stroke-width': 1,
    stroke: 'rgba(251, 126, 0, 1)    ',
};

export const DEFAULT_POSITION_ATTRS = {
    '.card': DEFAULT_POSITION_DISPLAY,
    '.name': {
        'text-anchor': 'middle',
        fill: '#000',
        text: '',
        'font-family': 'Roboto',
        'ref-x': 0.5,
        'ref-y': 0.18,
        'font-weight': 500,
        'font-size': 15,
        'text-transform': 'uppercase',
        textWrap: {
            ellipsis: true,
            height: 24,
            width: 160,
        },
        textWrap: {
            ellipsis: true,
            height: 24,
            width: 160,
        },
    },
    '.departmentName': {
        'text-anchor': 'middle',
        fill: '#000',
        text: '',
        'font-family': 'Roboto',
        'ref-x': 0.4,
        'ref-y': 0.35,
        'font-weight': 500,
        'font-size': 15,
        width: 50,
        'text-transform': 'uppercase',
        textWrap: {
            ellipsis: true,
            height: 24,
            width: 160,
        },
        textLength: '10px',
    },

    '.department-child': {
        'text-align': 'center',

        'font-size': 13,
        'ref-x': 0.8,
        'ref-y': 0.2,
    },

    '.department>rect': {
        width: 25,
        height: 25,
        fill: '#FFE1B2',
        stroke: '#FFE1B2',
        'stroke-width': 0,
        rx: 4,
        ry: 4,
    },
    '.department>text': {
        fill: '#6D6D6D',
        'text-align': 'center',

        'font-family': 'Roboto',
        'font-style': 'Regular',
        'font-weight': 400,
        'font-size': 13,
        'line-height': 25,
        'ref-x': 0.835,
        'ref-y': 0.34,
    },
    '.btn-collapse-expand-hor': {
        'ref-dx': -shapeSize.width / 2,
        'ref-y': shapeSize.height,
        ref: '.card',
        event: 'element:collapse',
        cursor: 'pointer',
    },
    '.btn-collapse-expand-hor>circle': {
        r: 7,
        fill: '#FFCD80',
        stroke: '#FFCD80',
        'stroke-width': 0,
    },
    '.btn-collapse-expand-hor>text': {
        fill: 'white',
        'font-size': 15,
        'font-weight': 400,
        stroke: 'white',
        x: -4,
        y: 5,
        'font-family': 'Roboto',
    },
    '.btn-collapse-expand-ver': {
        'ref-dx': 0,
        'ref-y': shapeSize.height / 2,
        ref: '.card',
        event: 'element:collapse',
        cursor: 'pointer',
    },
    '.btn-collapse-expand-ver>circle': {
        r: 7,
        fill: '#FFCD80',
        stroke: '#FFCD80',
        'stroke-width': 0,
    },
    '.btn-collapse-expand-ver>text': {
        fill: 'white',
        'font-size': 15,
        'font-weight': 400,
        stroke: 'white',
        x: -4,
        y: 5,
        'font-family': 'Roboto',
    },
    '.collapse-expand-circle': {
        r: CEConfig.radius,
        fill: '#FFCD80',
        event: 'element:collapse',
    },
    image: {
        'xlink:href': '/img/empty_avatar.png',
        height: avatarSize + 10,
        width: avatarSize + 10,
        y: shapeSize.height / 4 + 5,
    },
    '.role-img-container>image': {
        height: 16,
        width: 16,
        'xlink:href': '/img/empty_avatar_no_border.png',
    },
    '.role-img-container': {
        y: -(shapeSize.height / 4 + 5),
        'ref-y': 0.36,
        'ref-x': 0.42,
        'text-anchor': 'middle',
    },
    '.img-background-left': {
        'xlink:href': '/img/avata-background-small.png',
        height: 16,
        width: 16,
    },
    '.img-background-center': {
        'xlink:href': '/img/avata-background-small.png',
        height: 16,
        width: 16,
    },
    '.img-background-right': {
        'xlink:href': '/img/avata-background-small.png',
        height: 16,
        width: 16,
    },
    '.img-background': {
        'xlink:href': '/img/avata-background.png',
        height: 35,
        width: 35,
    },
    '.img-manager': {
        height: 35,
        width: 35,
    },
    '.account-number-plus': {
        y: shapeSize.height - avatarSize + 7,
        x: shapeSize.width - avatarSize + 5,
        fill: '#a4a4a4',
        'font-size': 14,
        stroke: 'white',
        'stroke-width': 0,
        'font-weight': 500,
        'font-family': 'Roboto',
    },
    '.manager-name': {
        y: shapeSize.height / 2 - 10,
        x: avatarSize + 20,
        fill: '#000000',
        'font-size': 13,
        stroke: 'black',
        'stroke-width': 0,
        'font-weight': 400,
        'font-family': 'Roboto',
    },
    '.manager-role': {
        y: shapeSize.height / 2 + avatarSize / 3 + 2,
        x: 20 + avatarSize + 20,
        fill: '#000000',
        'font-size': 13,
        stroke: 'white',
        'stroke-width': 0,
        'font-weight': 400,
        'font-family': 'Roboto',
    },
    '.manager-email': {
        y: shapeSize.height / 2 + 10,
        x: avatarSize + 20,
        fill: '#000000',
        'font-size': 13,
        stroke: 'white',
        'stroke-width': 0,
        'font-weight': 400,
        'font-family': 'Roboto',
    },
    '.position-code': {
        y: shapeSize.height / 2,
        'ref-x': 0.5,
        'ref-y':0.05,
        'text-anchor': 'middle',
        // x: avatarSize + 20,
        'font-style': 'Regular',
        fill: '#a4a4a4',
        'font-size': 13,
        stroke: 'white',
        'stroke-width': 0,
        'font-weight': 400,
        'font-family': 'Roboto',
    },
    '.dynamic-attr-value': {
        y: shapeSize.height / 4 + 38,
        x: 7,
        fill: '#a4a4a4',
        'font-size': 13,
        stroke: 'white',
        'stroke-width': 0,
        'font-weight': 300,
        'font-family': 'Roboto',
    },
    '.btn.add': {
        'ref-dx': -15,
        'ref-y': 78,
        ref: '.card',
        event: 'element:add',
        cursor: 'pointer',
    },
    '.btn.add>circle': {
        r: 7,
        fill: 'green',
        stroke: 'green',
        'stroke-width': 0,
    },
    '.btn>rect': {
        height: 20,
        width: 45,
        rx: 2,
        ry: 2,
        fill: 'transparent',
        'stroke-width': 1,
    },
    '.btn.add>text': {
        fill: 'white',
        'font-size': 15,
        'font-weight': 400,
        stroke: 'white',
        x: -4,
        y: 5,
        'font-family': 'Roboto',
    },
    '.border-bottom': {
        height: borderBottomHeight,
        y: shapeSize.height - borderBottomHeight + 1,
        x: -0.5,
        width: shapeSize.width + 1,
        fill: '#f58634',
        'stroke-width': 0,
    },
    '.btn.remove': {
        'ref-dx': -35,
        'ref-y': 79,
        ref: '.card',
        event: 'element:remove',
        cursor: 'pointer',
    },
    '.btn.remove>circle': {
        r: 7,
        fill: 'red',
    },
    '.btn.remove>text': {
        fill: 'white',
        'font-size': 11,
        'font-weight': 500,
        stroke: 'white',
        x: -3,
        y: 4,
        'font-family': 'Roboto',
    },
    '.btn-collapse-expand-hor': {
        'ref-x': 0.5,
        'ref-y': 0.99,
        ref: '.card',
        event: 'element:collapse',
        cursor: 'pointer',
    },
    '.btn-collapse-expand-ver': {
        'ref-x': 0.99,
        'ref-y': 0.5,
        ref: '.card',
        event: 'element:collapse',
        cursor: 'pointer',
    },
    '.btn-collapse-expand-hor>circle': {
        r: 7,
        fill: '#FFCD80',
        stroke: '#FFCD80',
        'stroke-width': 0,
    },
    '.btn-collapse-expand-ver>circle': {
        r: 7,
        fill: '#FFCD80',
        stroke: '#FFCD80',
        'stroke-width': 0,
    },
    '.btn-collapse-expand-hor>text': {
        fill: 'white',
        'font-size': 15,
        'font-weight': 400,
        stroke: 'white',
        x: -4,
        y: 5,
        'font-family': 'Roboto',
    },
    '.btn-collapse-expand-ver>text': {
        fill: 'white',
        'font-size': 15,
        'font-weight': 400,
        stroke: 'white',
        x: -4,
        y: 5,
        'font-family': 'Roboto',
    },
    '.buttonSign': {
        stroke: '#FFFFFF',
        strokeWidth: 0.1,
        event: 'visiblePainted',
        text: '+',
        'margin-left': '2px',
    },

    '.btn.add>rect': {
        fill: 'red',
        width: 20,
        height: 20,
    },
    '.btn.remove>rect': {
        fill: 'blue',
        width: 20,
        height: 20,
    },
    '.btn.add': {
        'ref-dx': 13,
        'ref-y': 0.1,
        ref: '.card',
        event: 'element:add',
        cursor: 'pointer',
    },
    '.btn.remove': {
        'ref-dx': 14,
        'ref-y': 0.325,
        paddingLeft: '1px',
        ref: '.card',
        event: 'element:remove',
        cursor: 'pointer',
    },

    '.btn-container': {
        'ref-dx': 5,
        'ref-y': 0,
    },
    '.btn-container-transparent-back': {
        width: 10,
        height: shapeSize.height,
        fill: 'transparent',
        'ref-x': -5,
    },
    '.btn-container-background': {
        width: 26,
        height: 54,
        fill: 'white',
        rx: 8,
        ry: 8,
        'stroke-width': 1,
        stroke: '#0000FF',
    },
    '.expand-text': {
        x: shapeSize.width / 2 - CEConfig.fontSize / 2 + 2,
        y: shapeSize.height + CEConfig.stickHeight + CEConfig.fontSize / 2 - 1,
        fill: 'white',
        cursor: 'pointer',
        'stroke-width': 1,
        display: 'none',
        event: 'element:collapse',
    },
    '.collapse-text': {
        x: shapeSize.width / 2 - CEConfig.radius / 2,
        y: shapeSize.height + CEConfig.stickHeight + CEConfig.radius,
        fill: 'white',
        'stroke-width': 1,
        'font-size': CEConfig.fontSize * 2,
        cursor: 'pointer',
        event: 'element:collapse',
    },
};

export const POSITION_NODE_DATA = {
    type: 'org.Member',
    size: {
        width: shapeSize.width,
        height: shapeSize.height,
    },
    position: {
        x: 50,
        y: 200,
    },
    name: 'Vị trí 1',
    attrs: DEFAULT_POSITION_ATTRS,
};
let SymperPosition;
export const positionMarkup = `<g class="rotatable">
    <g class="symper-orgchart-node">
    <g class="scalable">
        <rect class="card"/>
    </g>
    
    <g class="role-img-container">
    <image class="img-background-left" />
    <image class="role-img-left" />
    <image class="img-background-center" />
    <image class="role-img-center" />
    <image class="img-background-right" />
    <image class="role-img-right" />
    
    <text class="countRoleImg"></text>
    </g>
    <text class="name"/>
    
    <text class="dynamic-attr-value"/>
    <text class="manager-name"/>
    <text class="manager-role"/>
    <text class="manager-email"/>
    <text class="position-code"/>
    <g class="btn-container">
        <rect class="btn-container-background"/>
        <rect class="btn-container-transparent-back"/>
	</g>
    <text class="departmentName"/>
    <g class="department">
        <rect class=" department-child"/>
        <text class="departmentText department-child "/>
    </g>
    <g class="btn-collapse-expand-hor">
        <circle class="buttonSign"/>
        <text class="buttonSign"></text>
    </g>
    <g class="btn-collapse-expand-ver">
        <circle class="buttonSign"/>
        <text class="buttonSign"></text>
    </g>
    <g class="btn add orgchart-action">
        <rect class="add transparent-background" />
        <path class="line-action" d="M9.375 4.97168H5.625V1.22168C5.625 1.05592 5.55915 0.896948 5.44194 0.779738C5.32473 0.662528 5.16576 0.59668 5 0.59668C4.83424 0.59668 4.67527 0.662528 4.55806 0.779738C4.44085 0.896948 4.375 1.05592 4.375 1.22168V4.97168H0.625C0.45924 4.97168 0.300269 5.03753 0.183058 5.15474C0.0658481 5.27195 0 5.43092 0 5.59668C0 5.76244 0.0658481 5.92141 0.183058 6.03862C0.300269 6.15583 0.45924 6.22168 0.625 6.22168H4.375V9.97168C4.375 10.1374 4.44085 10.2964 4.55806 10.4136C4.67527 10.5308 4.83424 10.5967 5 10.5967C5.16576 10.5967 5.32473 10.5308 5.44194 10.4136C5.55915 10.2964 5.625 10.1374 5.625 9.97168V6.22168H9.375C9.54076 6.22168 9.69973 6.15583 9.81694 6.03862C9.93415 5.92141 10 5.76244 10 5.59668C10 5.43092 9.93415 5.27195 9.81694 5.15474C9.69973 5.03753 9.54076 4.97168 9.375 4.97168Z" fill="#61C454"/> 
				
    </g>
    <g class="btn remove orgchart-action">
        <rect class="remove transparent-background-position" />
        <path  class="line-action" d="M4.93909 4.59554L7.80299 1.7383C7.92841 1.61289 7.99886 1.44279 7.99886 1.26543C7.99886 1.08806 7.92841 0.917966 7.80299 0.792552C7.67758 0.667137 7.50748 0.59668 7.33012 0.59668C7.15275 0.59668 6.98265 0.667137 6.85724 0.792552L4 3.65645L1.14276 0.792552C1.01735 0.667137 0.847248 0.59668 0.669885 0.59668C0.492522 0.59668 0.322423 0.667137 0.197008 0.792552C0.0715939 0.917966 0.00113664 1.08806 0.00113664 1.26543C0.00113663 1.44279 0.0715939 1.61289 0.197008 1.7383L3.06091 4.59554L0.197008 7.45278C0.134583 7.5147 0.085035 7.58836 0.0512219 7.66952C0.0174088 7.75068 0 7.83773 0 7.92566C0 8.01358 0.0174088 8.10063 0.0512219 8.18179C0.085035 8.26296 0.134583 8.33662 0.197008 8.39853C0.258924 8.46096 0.332587 8.51051 0.413748 8.54432C0.494909 8.57813 0.581962 8.59554 0.669885 8.59554C0.757808 8.59554 0.844861 8.57813 0.926022 8.54432C1.00718 8.51051 1.08085 8.46096 1.14276 8.39853L4 5.53464L6.85724 8.39853C6.91915 8.46096 6.99282 8.51051 7.07398 8.54432C7.15514 8.57813 7.24219 8.59554 7.33012 8.59554C7.41804 8.59554 7.50509 8.57813 7.58625 8.54432C7.66741 8.51051 7.74108 8.46096 7.80299 8.39853C7.86542 8.33662 7.91497 8.26296 7.94878 8.18179C7.98259 8.10063 8 8.01358 8 7.92566C8 7.83773 7.98259 7.75068 7.94878 7.66952C7.91497 7.58836 7.86542 7.5147 7.80299 7.45278L4.93909 4.59554Z" fill="#FF2020"/>
    </g>

    </g>
    </g>`
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ');

export const definePosition = function () {
    SymperPosition = joint.shapes.org.Member.define(
        'Symper.Position',
        {
            size: {
                width: shapeSize.width,
                height: shapeSize.height,
            },
            attrs: DEFAULT_POSITION_ATTRS,
            markup: positionMarkup,
        },
        {
            isHidden: function () {
                return !!this.get('hidden');
            },

            isCollapsed: function () {
                return !!this.get('collapsed');
            },

            toggleButtonVisibility: function (visible) {
                this.attr('.btn-collapse-expand-hor', {
                    display: visible ? 'block' : 'none',
                });
                this.attr('.btn-collapse-expand-ver', {
                    display: visible ? 'block' : 'none',
                });
            },

            toggleButtonSign: function (plus) {
                if (plus) {
                    this.attr('.buttonSign', { text: '--' });
                } else {
                    this.attr('.buttonSign', { text: '+' });
                }
            },
        },
    );
};
export const createPositionDepartmentNode = function (
    departmentName,
    attr = {},
) {
    var departmentText = '0';
    var element = new SymperPosition(attr)
        .on({
            'change:departmentName': function (cell, departmentName) {
                cell.attr(
                    '.departmentName/text',
                    joint.util.breakText(
                        departmentName,
                        { width: 160, height: 45 },
                        cell.attr('.departmentName'),
                    ),
                );
            },
            'change:departmentText': function (cell, rank = null) {
                cell.attr(
                    '.departmentText/text',
                    joint.util.breakText(
                        departmentText,
                        { width: 165, height: 45 },
                        cell.attr('.departmentText'),
                    ),
                );
            },
        })
        .set({
            departmentName: departmentName,
            departmentText: departmentText,
        });
    return element;
};

export const createPositionNode = function (name, rank, attr = {}) {
    var element = new SymperPosition(attr)
        .on({
            'change:name': function (cell, name) {
                cell.attr(
                    '.name/text',
                    joint.util.breakText(
                        name,
                        { width: 160, height: 45 },
                        cell.attr('.name'),
                    ),
                );
            },
            'change:rank': function (cell, rank) {
                cell.attr(
                    '.position-code/text',
                    joint.util.breakText(
                        rank,
                        { width: 165, height: 45 },
                        cell.attr('.position-code'),
                    ),
                );
            },
        })
        .set({
            name: name,
            rank: rank,
        });
    return element;
};
