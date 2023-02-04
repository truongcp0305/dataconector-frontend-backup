let shapeSize = {
    width: 250,
    height: 120,
};
let icon = {
    user: '<path xmlns="http://www.w3.org/2000/svg" transform="translate(4 1)" id="account-multiple-outline" d="M5.00016 0.833496C4.45299 0.833496 3.91117 0.94127 3.40565 1.15066C2.90013 1.36006 2.4408 1.66697 2.05388 2.05388C1.27248 2.83529 0.833496 3.89509 0.833496 5.00016C0.833496 6.10523 1.27248 7.16504 2.05388 7.94644C2.4408 8.33335 2.90013 8.64027 3.40565 8.84966C3.91117 9.05906 4.45299 9.16683 5.00016 9.16683C6.10523 9.16683 7.16504 8.72784 7.94644 7.94644C8.72784 7.16504 9.16683 6.10523 9.16683 5.00016C9.16683 4.45299 9.05906 3.91117 8.84966 3.40565C8.64027 2.90013 8.33335 2.4408 7.94644 2.05388C7.55953 1.66697 7.1002 1.36006 6.59468 1.15066C6.08915 0.94127 5.54734 0.833496 5.00016 0.833496ZM2.946 7.61683C3.12516 7.24183 4.21683 6.87516 5.00016 6.87516C5.7835 6.87516 6.87516 7.24183 7.05433 7.61683C6.48766 8.06683 5.77516 8.3335 5.00016 8.3335C4.22516 8.3335 3.51266 8.06683 2.946 7.61683ZM7.65016 7.01266C7.05433 6.28766 5.6085 6.04183 5.00016 6.04183C4.39183 6.04183 2.946 6.28766 2.35016 7.01266C1.92516 6.4585 1.66683 5.7585 1.66683 5.00016C1.66683 3.16266 3.16266 1.66683 5.00016 1.66683C6.83766 1.66683 8.3335 3.16266 8.3335 5.00016C8.3335 5.7585 8.07516 6.4585 7.65016 7.01266ZM5.00016 2.50016C4.19183 2.50016 3.54183 3.15016 3.54183 3.9585C3.54183 4.76683 4.19183 5.41683 5.00016 5.41683C5.8085 5.41683 6.4585 4.76683 6.4585 3.9585C6.4585 3.15016 5.8085 2.50016 5.00016 2.50016ZM5.00016 4.5835C4.8344 4.5835 4.67543 4.51765 4.55822 4.40044C4.44101 4.28323 4.37516 4.12426 4.37516 3.9585C4.37516 3.79274 4.44101 3.63376 4.55822 3.51655C4.67543 3.39934 4.8344 3.3335 5.00016 3.3335C5.16592 3.3335 5.32489 3.39934 5.4421 3.51655C5.55931 3.63376 5.62516 3.79274 5.62516 3.9585C5.62516 4.12426 5.55931 4.28323 5.4421 4.40044C5.32489 4.51765 5.16592 4.5835 5.00016 4.5835Z" fill="#6D6D6D"/>',
    department:
        '<path transform="translate(4 2)" xmlns="http://www.w3.org/2000/svg" id="office-building-outline" d="M6.91667 1.25008V8.75008H4.41667V7.29175H3.58333V8.75008H1.08333V1.25008H6.91667ZM5.25 2.91675H6.08333V2.08341H5.25V2.91675ZM3.58333 2.91675H4.41667V2.08341H3.58333V2.91675ZM1.91667 2.91675H2.75V2.08341H1.91667V2.91675ZM5.25 4.58342H6.08333V3.75008H5.25V4.58342ZM3.58333 4.58342H4.41667V3.75008H3.58333V4.58342ZM1.91667 4.58342H2.75V3.75008H1.91667V4.58342ZM5.25 6.25008H6.08333V5.41675H5.25V6.25008ZM3.58333 6.25008H4.41667V5.41675H3.58333V6.25008ZM1.91667 6.25008H2.75V5.41675H1.91667V6.25008ZM5.25 7.91675H6.08333V7.08342H5.25V7.91675ZM1.91667 7.91675H2.75V7.08342H1.91667V7.91675ZM7.75 0.416748H0.25V9.58342H7.75V0.416748Z" fill="#6D6D6D"/>',
};
let avatarSize = shapeSize.height / 2 + 5;
let borderBottomHeight = 2;
let SymperDepartment;
export const DEFAULT_DEPARTMENT_DISPLAY = {
    fill: '#F2F2F2    ',
    rx: 6,
    ry: 6,
    'stroke-width': 0,
    stroke: '#D9D9D9',
    filter: {
        name: 'dropShadow',
        args: {
            color: 'rgba(0, 0, 0, 0.1)',
            dx: 2,
            dy: 2,
            blur: 2,
        },
    },
};
export const MOUSEENTER_DEPARTMENT_DISPLAY = {
    'stroke-width': 1,
    stroke: '#0000FF',
};
export const FOUCUS_DEPARTMENT_DISPLAY = {
    'stroke-width': 1,
    stroke: 'rgba(251, 126, 0, 1)    ',
};
let CEConfig = {
    stickHeight: 20,
    stickWidth: 1,
    radius: 7,
    fontSize: 12,
};
export const DEFAULT_DEPARTMENT_ATTRS = {
    '.card': DEFAULT_DEPARTMENT_DISPLAY,
    '.name': {
        'text-anchor': 'start',
        fill: '#000',
        text: '',
        'font-family': 'Roboto',
        'ref-x': 0.345,
        'ref-y': 0.18,
        'font-weight': 500,
        'font-size': 15,
        'text-transform': 'uppercase',
        textWrap: {
            ellipsis: true,
            height: 24,
            width: 160
        },
    },
    image: {
        'xlink:href': '/img/empty_avatar.png',
        height: avatarSize + 10,
        width: avatarSize + 10,
        y: shapeSize.height / 4 - 10,
        x: 5,
    },
    '.manager-name': {
        y: shapeSize.height / 2 - 5,
        x: avatarSize + 22,
        fill: '#000000',
        'font-size': 13,
        stroke: 'black',
        'stroke-width': 0,
        'font-weight': 400,
        'font-family': 'Roboto',
    },
    '.manager-role': {
        y: shapeSize.height / 2 + avatarSize / 3 + 2,
        x: 20 + avatarSize,
        fill: '#1B1B1B',
        'font-size': 13,
        stroke: 'white',
        'stroke-width': 0,
        'font-weight': 400,
        'font-family': 'Roboto',
        'line-height': 15,
        'font-style': 'Regular',
    },
    '.manager-email': {
        y: shapeSize.height / 2 + 15,
        x: avatarSize + 22,
        fill: '#B5B5B5',
        'font-size': 11,
        'line-height': 13,
        stroke: 'white',
        'stroke-width': 0,
        'font-weight': 400,
        'font-family': 'Roboto',
        'font-style': 'Regular',
    },
    '.img-background': {
        'xlink:href': '/img/avata-background.png',
        height: 50,
        width: 50,
    },
    '.img-manager': {
        height: 50,
        width: 50,
    },
    '.btn.add': {
        'ref-dx': 13,
        'ref-y': 0.28,
        ref: '.card',
        event: 'element:add',
        cursor: 'pointer',
    },
    '.btn.remove': {
        'ref-dx': 14,
        'ref-y': 0.48,
        ref: '.card',
        event: 'element:remove',
        cursor: 'pointer',
    },
    '.btn.view': {
        'ref-dx': 11.5,
        'ref-y': 0.08,
        ref: '.card',
        event: 'element:view',
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
        'font-weight': 300,
        stroke: 'green',
        x: -20,
        y: 110,
        'font-family': 'Roboto',
    },
    '.btn.view>path': {},
    '.btn.view>rect': {
        fill: 'red',
        width: 20,
        height: 20,
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
    '.btn.show-infor-department>text': {
        'font-size': 9,
        'font-weight': 400,
        fill: '#000000',
        x: 15,
        y: 11,
        'font-family': 'Roboto',
    },
    '.btn.show-infor-department>.icon-department': {
        'font-size': 9,
        'font-weight': 300,
        fill: '#000000',
        x: 15,
        y: 11,
        'font-family': 'FontAwesome',
    },
    '.btn.show-infor-user>text': {
        'font-size': 9,
        'font-weight': 400,
        fill: '#000000',
        x: 15,
        y: 10,
        'font-family': 'Roboto',
    },
    '.btn.show-infor-user>.icon-user': {
        'font-size': 9,
        'font-weight': 300,
        fill: '#000000',
        x: 15,
        y: 10,
        'font-family': 'FontAwesome',
    },
    '.border-bottom': {
        height: borderBottomHeight,
        y: shapeSize.height - borderBottomHeight + 1,
        x: 3,
        width: shapeSize.width - 6,
        fill: '#f58634',
        'stroke-width': 0,
    },
    '.btn-container': {
        'ref-dx': 5,
        'ref-y': 0,
    },
    '.btn-container-transparent-back': {
        width: 10,
        height: shapeSize.height,
        fill: 'transparent',
        'ref-x': -8,
    },
    '.btn-container-background': {
        width: 26,
        height: 76,
        fill: 'white',
        rx: 8,
        ry: 8,
        'stroke-width': 1,
        stroke: '#0000FF',
    },

    '.show-infor-container': {},
    '.infor-container': {
        'ref-dx': -160,
        'ref-y': 88,

        width: 72,
        height: 20,
        fill: '#E8EEFF',
        rx: 10,
        ry: 10,
    },
    '.btn.show-infor-user': {
        'ref-dx': -125,
        'ref-y': 92,
        ref: '.card',
    },
    '.btn.show-infor-department': {
        'ref-dx': -150,
        'ref-y': 91,
        ref: '.card',
    },
    '.btn.remove>circle': {
        r: 7,
        fill: 'red',
    },
    '.btn.remove>text': {
        fill: 'white',
        'font-size': 15,
        'font-weight': 300,
        stroke: 'red',
        x: -40,
        y: 100,
        'font-family': 'Roboto',
    },

    '.stick': {
        height: CEConfig.stickHeight,
        width: CEConfig.stickWidth,
        'stroke-width': 0,
        fill: '#848484',
        x: shapeSize.width / 2,
        y: shapeSize.height,
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
        fill: 'blue',
        event: 'element:collapse',
    },
    '.buttonSign': {
        stroke: '#FFFFFF',
        strokeWidth: 0.1,
        event: 'visiblePainted',
        text: '+',
        'margin-left': '2px',
    },
    '.button-add-delete': {
        stroke: '#FFFFFF',
        strokeWidth: 0.1,
        event: 'visiblePainted',
        x: -4,
        y: 5,
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
export const PLUS_SIGN = 'M 1 5 9 5 M 5 1 5 9';
export const MINUS_SIGN = 'M 2 5 8 5';
export const DEPARTMENT_NODE_DATA = {
    type: 'org.Member',
    size: {
        width: shapeSize.width,
        height: shapeSize.height,
    },
    position: {
        x: 50,
        y: 200,
    },
    name: 'Phòng ban 1',
    attrs: DEFAULT_DEPARTMENT_ATTRS,
};
export const departmentMarkup = `<g class="rotatable ">
        <g class="symper-orgchart-node">
            <g class="scalable">
                <rect class="card"/>
            </g>
            <image class="img-manager" />
            <image class="img-background" />
            <text class="name"/>
            <text class="manager-name"/>
            <text class="manager-role"/>
            <text class="manager-email"/>


            <g class="btn-container">
				<rect class="btn-container-background"/>
				<rect class="btn-container-transparent-back"/>
			</g>
           
			<g class="btn-collapse-expand-hor">
				<circle class="buttonSign"/>
				<text class="buttonSign"></text>
			</g>
			<g class="btn-collapse-expand-ver">
				<circle class="buttonSign"/>
				<text class="buttonSign"></text>
			</g>
            <g class="btn view orgchart-action">
                <rect class="view transparent-background" />
                <path class="view line-action" d="M11.9499 4.55866C10.7383 1.74564 8.45914 0.000244141 6 0.000244141C3.54086 0.000244141 1.26165 1.74564 0.0500734 4.55866C0.0170469 4.63433 0 4.71601 0 4.79857C0 4.88114 0.0170469 4.96282 0.0500734 5.03849C1.26165 7.85151 3.54086 9.5969 6 9.5969C8.45914 9.5969 10.7383 7.85151 11.9499 5.03849C11.983 4.96282 12 4.88114 12 4.79857C12 4.71601 11.983 4.63433 11.9499 4.55866ZM6 8.39732C4.09866 8.39732 2.29929 7.0238 1.26165 4.79857C2.29929 2.57335 4.09866 1.19983 6 1.19983C7.90134 1.19983 9.70071 2.57335 10.7383 4.79857C9.70071 7.0238 7.90134 8.39732 6 8.39732ZM6 2.39941C5.52549 2.39941 5.06164 2.54012 4.6671 2.80374C4.27256 3.06736 3.96505 3.44206 3.78346 3.88045C3.60187 4.31884 3.55436 4.80123 3.64693 5.26663C3.73951 5.73202 3.96801 6.15951 4.30353 6.49504C4.63906 6.83057 5.06655 7.05906 5.53195 7.15164C5.99734 7.24421 6.47973 7.1967 6.91812 7.01511C7.35651 6.83352 7.73121 6.52602 7.99483 6.13148C8.25846 5.73694 8.39916 5.27308 8.39916 4.79857C8.39916 4.16227 8.1464 3.55204 7.69647 3.10211C7.24653 2.65218 6.6363 2.39941 6 2.39941ZM6 5.99815C5.76274 5.99815 5.53082 5.9278 5.33355 5.79599C5.13628 5.66418 4.98252 5.47683 4.89173 5.25763C4.80094 5.03844 4.77718 4.79724 4.82347 4.56455C4.86975 4.33185 4.984 4.1181 5.15177 3.95034C5.31953 3.78258 5.53328 3.66833 5.76597 3.62204C5.99867 3.57575 6.23986 3.59951 6.45906 3.6903C6.67826 3.7811 6.8656 3.93485 6.99742 4.13212C7.12923 4.32939 7.19958 4.56132 7.19958 4.79857C7.19958 5.11672 7.0732 5.42184 6.84823 5.6468C6.62327 5.87177 6.31815 5.99815 6 5.99815Z" fill="#61C454"/>
            </g>
            <g class=" btn add orgchart-action">
                <rect class="add transparent-background" />
                <path class="line-action" d="M9.375 4.97168H5.625V1.22168C5.625 1.05592 5.55915 0.896948 5.44194 0.779738C5.32473 0.662528 5.16576 0.59668 5 0.59668C4.83424 0.59668 4.67527 0.662528 4.55806 0.779738C4.44085 0.896948 4.375 1.05592 4.375 1.22168V4.97168H0.625C0.45924 4.97168 0.300269 5.03753 0.183058 5.15474C0.0658481 5.27195 0 5.43092 0 5.59668C0 5.76244 0.0658481 5.92141 0.183058 6.03862C0.300269 6.15583 0.45924 6.22168 0.625 6.22168H4.375V9.97168C4.375 10.1374 4.44085 10.2964 4.55806 10.4136C4.67527 10.5308 4.83424 10.5967 5 10.5967C5.16576 10.5967 5.32473 10.5308 5.44194 10.4136C5.55915 10.2964 5.625 10.1374 5.625 9.97168V6.22168H9.375C9.54076 6.22168 9.69973 6.15583 9.81694 6.03862C9.93415 5.92141 10 5.76244 10 5.59668C10 5.43092 9.93415 5.27195 9.81694 5.15474C9.69973 5.03753 9.54076 4.97168 9.375 4.97168Z" fill="#61C454"/> 
				
            </g>
			<g class="btn remove orgchart-action">
                <rect class="remove transparent-background" />
                <path  class="line-action" d="M4.93909 4.59554L7.80299 1.7383C7.92841 1.61289 7.99886 1.44279 7.99886 1.26543C7.99886 1.08806 7.92841 0.917966 7.80299 0.792552C7.67758 0.667137 7.50748 0.59668 7.33012 0.59668C7.15275 0.59668 6.98265 0.667137 6.85724 0.792552L4 3.65645L1.14276 0.792552C1.01735 0.667137 0.847248 0.59668 0.669885 0.59668C0.492522 0.59668 0.322423 0.667137 0.197008 0.792552C0.0715939 0.917966 0.00113664 1.08806 0.00113664 1.26543C0.00113663 1.44279 0.0715939 1.61289 0.197008 1.7383L3.06091 4.59554L0.197008 7.45278C0.134583 7.5147 0.085035 7.58836 0.0512219 7.66952C0.0174088 7.75068 0 7.83773 0 7.92566C0 8.01358 0.0174088 8.10063 0.0512219 8.18179C0.085035 8.26296 0.134583 8.33662 0.197008 8.39853C0.258924 8.46096 0.332587 8.51051 0.413748 8.54432C0.494909 8.57813 0.581962 8.59554 0.669885 8.59554C0.757808 8.59554 0.844861 8.57813 0.926022 8.54432C1.00718 8.51051 1.08085 8.46096 1.14276 8.39853L4 5.53464L6.85724 8.39853C6.91915 8.46096 6.99282 8.51051 7.07398 8.54432C7.15514 8.57813 7.24219 8.59554 7.33012 8.59554C7.41804 8.59554 7.50509 8.57813 7.58625 8.54432C7.66741 8.51051 7.74108 8.46096 7.80299 8.39853C7.86542 8.33662 7.91497 8.26296 7.94878 8.18179C7.98259 8.10063 8 8.01358 8 7.92566C8 7.83773 7.98259 7.75068 7.94878 7.66952C7.91497 7.58836 7.86542 7.5147 7.80299 7.45278L4.93909 4.59554Z" fill="#FF2020"/>
				
			</g>

            <g class="show-infor-container">
                <rect class="infor-container"/>
                <g class="btn show-infor-user">
                    ${icon.user}<text class="counUserClass">countUser</text>
                </g>
                <g class="btn  show-infor-department">
                    ${icon.department}<text class="counDepartmentClass">countDepartment</text>
                </g>
            </g>
			
           
        </g>
    </g>`
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ');

export const defineDepartment = function () {
    SymperDepartment = joint.shapes.org.Member.define(
        'Symper.Department',
        {
            size: {
                width: shapeSize.width,
                height: shapeSize.height,
            },
            hidden: false,
            attrs: DEFAULT_DEPARTMENT_ATTRS,
            PLUS_SIGN: PLUS_SIGN,
            MINUS_SIGN: MINUS_SIGN,
            markup: departmentMarkup,
        },
        {
            hidden: false,
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

export const createDepartmentNode = function (
    name,
    departmentName,
    departmentEmail,
    id,
) {
    var element = new SymperDepartment()
        .on({
            'change:name': function (cell, name) {
                cell.attr(
                    '.name/text',
                    joint.util.breakText(
                        name,
                        {
                            width: 200,
                            height: 45,
                        },
                        { 'font-size': 15 },
                        { ellipsis: true },
                        cell.attr('.name'),
                    ),
                );
            },
            'change:departmentEmail': function (cell, departmentEmail) {
                cell.attr(
                    '.manager-email/text',
                    joint.util.breakText(
                        departmentEmail,
                        {
                            width: 165,
                            height: 45,
                        },
                        cell.attr('.manager-email'),
                    ),
                );
            },
            'change:departmentName': function (cell, departmentName) {
                cell.attr(
                    '.manager-name/text',
                    joint.util.breakText(
                        departmentName,
                        {
                            width: 165,
                            height: 45,
                        },
                        cell.attr('.manager-name'),
                    ),
                );
            },
        })
        .set({
            name: name,
            departmentEmail: departmentEmail,
            departmentName: departmentName,
        });
    return element;
};
