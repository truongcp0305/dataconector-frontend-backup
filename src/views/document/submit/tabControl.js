import LayoutControl from './layoutControl';
export default class TabControl extends LayoutControl {
    constructor(idField, ele, controlProps, keyInstance, value) {
        super(idField, ele, controlProps, keyInstance, value);
    }
    render() {
        this.renderTabControl();
    }
    renderTabControl() {
        this.hiddenWhenOneTab();
        if (
            this.controlProperties['isHidden'] != undefined &&
            (this.controlProperties['isHidden'].value === '1' ||
                this.controlProperties['isHidden'].value === 1)
        ) {
            this.setHiddenTab();
        }
    }
    hiddenWhenOneTab() {
        if (this.ele.closest('.tab').find('button:not(.d-none)').length == 1) {
            this.ele
                .closest('.page-content')
                .find('.page-content-header')
                .css({ display: 'none' });
        }
    }
    setHiddenTab() {
        this.ele
            .closest('.page-content')
            .find('.tab-active')
            .removeClass('tab-active');
        this.ele
            .closest('.page-content')
            .find('.content-active')
            .removeClass('content-active');
        let tabContentEle = this.ele
            .closest('.page-content')
            .find('[tab-id="' + this.id + '"]');
        this.ele.addClass('d-none');
        tabContentEle.addClass('d-none');
        let newtabActiveEle = this.ele
            .closest('.tab')
            .find('button:not(.d-none)');
        if (newtabActiveEle.length > 0) {
            let newTabId = newtabActiveEle.first().attr('id');
            newtabActiveEle.first().addClass('tab-active');
            this.ele
                .closest('.page-content')
                .find('[tab-id="' + newTabId + '"]')
                .removeClass('d-none')
                .addClass('content-active');
        }
    }
}
