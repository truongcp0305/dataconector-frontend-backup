import Control from './control';
import sDocument from './../../../store/document';
export default class LayoutControl extends Control {
    constructor(idField, ele, controlProps, keyInstance, value) {
        super(idField, ele, controlProps, keyInstance, value);
    }
    render() {
        if (this.type == 'tabPage') {
            this.renderTabPageControl();
        }
    }
    renderTabPageControl() {
        this.ele.find('.tabcontent').attr('contenteditable', false);
        this.ele.find('.delete-page-icon').remove();
        this.ele.find('.tab button').attr('contenteditable', false);
        this.checkAutoHeight();
        this.checkProps('isHidden') && this.ele.css({ display: 'none' });
        this.setEvent();
    }
    checkAutoHeight() {
        if (this.checkProps('autoHeight')) {
            this.ele.css({ height: 'auto' });
        }
    }
    setEvent() {
        let self = this;
        this.ele.on('click', function (e) {
            if ($(e.target).closest('.collapse-sidebar-btn').length > 0) {
                self.handleClickCollapseInControlTab(
                    $(e.target).closest('.collapse-sidebar-btn'),
                );
            }
            if ($(e.target).is('.tab button')) {
                self.handleClickTabInControlTab($(e.target));
            }
            if ($(e.target).closest('.page-item').length > 0) {
                self.handleClickPageInControlTab(
                    $(e.target).closest('.page-item'),
                );
            }
        });
    }
    /**
     * Hàm click đóng mở sidebar của control tab/page
     */
    handleClickCollapseInControlTab(elTarget) {
        elTarget.toggleClass('rotate-180');
        elTarget.closest('.sidebar-page').toggleClass('collapse-sb');
        elTarget
            .closest('.sidebar-page')
            .find('.page-item__name')
            .toggleClass('d-none');
        let curSideBar = elTarget
            .closest('.s-control-tab-page')
            .find('.sidebar-page');
        let curSideBarWidth = curSideBar.is('.collapse-sb') ? 30 : 150;
        elTarget
            .closest('.s-control-tab-page')
            .find('.list-page-content')
            .css({ width: 'calc(100% - ' + curSideBarWidth + 'px )' });
        setTimeout(
            (self) => {
                self.reRenderTableInPage(elTarget);
            },
            250,
            this,
        );
    }
    /**
     * Hàm xử lí sự kiên click vào tab bên trên header của control tab/page để chuyển tab
     */
    handleClickTabInControlTab(elTarget) {
        elTarget.siblings().removeClass('tab-active');
        elTarget.addClass('tab-active');
        let tabId = elTarget.attr('id');
        elTarget
            .closest('.page-content')
            .find('.page-content-body .content-active')
            .removeClass('content-active');
        elTarget
            .closest('.page-content')
            .find('.page-content-body [tab-id="' + tabId + '"]')
            .addClass('content-active');
    }
    /**
     * Hàm xử lí sự kiên click vào page bên sidebar của control tab/page để chuyển page
     */
    handleClickPageInControlTab(elTarget) {
        elTarget.siblings().removeClass('sb-page-active');
        elTarget.addClass('sb-page-active');
        let pageId = elTarget.attr('id');
        elTarget
            .closest('.s-control-tab-page')
            .find('.list-page-content .page-content')
            .removeClass('page-active');
        elTarget
            .closest('.s-control-tab-page')
            .find('.list-page-content')
            .find('[s-page-content-id="' + pageId + '"]')
            .addClass('page-active');
        this.reRenderTableInPage(elTarget);
    }

    reRenderTableInPage(elTarget) {
        let self = this;
        let tableInTab = elTarget
            .closest('.s-control-tab-page')
            .find('.list-page-content .page-content')
            .find('[s-control-type="table"]');
        $.each(tableInTab, function (k, v) {
            let tableId = $(v).attr('id');
            let control =
                sDocument.state.editor[self.keyInstance].allControl[tableId];
            let controlName = control.properties.name.value;
            let controlInstance =
                sDocument.state.submit[self.keyInstance].listInputInDocument[
                    controlName
                ];
            controlInstance.tableInstance.tableInstance.render();
        });
    }
}
