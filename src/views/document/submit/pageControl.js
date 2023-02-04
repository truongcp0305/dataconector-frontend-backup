import LayoutControl from './layoutControl';
export default class PageControl extends LayoutControl {
    constructor(idField, ele, controlProps, keyInstance, value) {
        super(idField, ele, controlProps, keyInstance, value);
    }
    render() {
        this.renderPageControl();
    }
    renderPageControl() {
        if (
            this.controlProperties['isHidden'] != undefined &&
            (this.controlProperties['isHidden'].value === '1' ||
                this.controlProperties['isHidden'].value === 1)
        ) {
            this.setHiddenPage();
        }
        this.hiddenWhenOnePage();
    }
    hiddenWhenOnePage() {
        if (
            this.ele.closest('.s-control-tab-page').find('.page-item').length ==
            1
        ) {
            this.ele.closest('.sidebar-page').css({ display: 'none' });
            this.ele
                .closest('.s-control-tab-page')
                .find('.collapse-sidebar-btn')
                .css({ display: 'none' });
        }
    }
    setHiddenPage() {
        this.ele
            .closest('.s-control-tab-page')
            .find('.sb-page-active')
            .removeClass('sb-page-active');
        this.ele
            .closest('.s-control-tab-page')
            .find('.page-active')
            .removeClass('page-active');
        let pageContentEle = this.ele
            .closest('.s-control-tab-page')
            .find('.list-page-content [s-page-content-id="' + this.id + '"]');
        this.ele.css({ display: 'none' });
        pageContentEle.css({ display: 'none' });
        let prevEle = this.ele.prev();
        let nextEle = this.ele.next();
        if (prevEle.length > 0) {
            prevEle.first().addClass('sb-page-active');
        } else if (nextEle.length > 0) {
            nextEle.first().addClass('sb-page-active');
        }
        let prevPageEle = pageContentEle.prev();
        let nextPageEle = pageContentEle.next();
        if (prevPageEle.length > 0) {
            prevPageEle.first().addClass('page-active');
        } else if (nextPageEle.length > 0) {
            nextPageEle.first().addClass('page-active');
        }
    }
}
