export default class ApprovalButtonRender {
    init(params) {
        let bgColor = params.data.color;
        bgColor = bgColor == '' ? 'green' : bgColor;
        let textColor = bgColor == 'white' ? '#212121' : 'white';
        let bgColorMap = {
            yellow: '#FFD600',
            red: '#F44336',
            orange: '#FF9800',
            green: '#4CAF50',
            blue: '#2196F3',
            purple: '#9C27B0',
            grey: '#9E9E9E',
            pink: '#E91E63',
            black: '#000000',
            white: '#FFFFFF',
        };
        let btn = '';
        if (params.data.text) {
            bgColor = bgColorMap[bgColor];
            btn = `
        <button type="button" class="v-btn v-btn--depressed v-size--x-small my-1" style="margin-left: -5px; width: calc(100% + 10px);position: relative;bottom: 3px; background-color: ${bgColor};border-color: ${bgColor}">
            <span class="v-btn__content text-ellipsis w-100" style="display: block;color:${textColor}">${params.data.text}</span>
        </button>`;
            btn = btn.replace(/\n/g, '');
        }
        this.eGui = $(btn)[0];
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        return false;
    }
}