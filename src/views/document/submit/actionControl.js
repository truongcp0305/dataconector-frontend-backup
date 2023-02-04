import Control from './control';
import { documentApi } from './../../../api/Document.js';
import store from './../../../store';
import { SYMPER_APP } from './../../../main.js';
import { appConfigs } from '../../../configs';

export default class ActionControl extends Control {
    constructor(idField, ele, controlProps, keyInstance, value) {
        super(idField, ele, controlProps, keyInstance, value);
    }
    render() {
        if (this.type == 'approvalHistory') {
            this.renderApprovalEle();
        } else if (this.type == 'submit') {
            this.ele.addClass('d-none');
            if (this.controlFormulas.hasOwnProperty('submit')) {
                let formulas = this.controlFormulas.submit.instance;
                store.commit('document/addToDocumentSubmitStore', {
                    key: 'submitFormulas',
                    value: formulas,
                    instance: this.keyInstance
                });
            }
            if (this.controlFormulas.hasOwnProperty('update')) {
                let formulas = this.controlFormulas.update.instance;
                store.commit('document/addToDocumentSubmitStore', {
                    key: 'updateFormulas',
                    value: formulas,
                    instance: this.keyInstance
                });
            }
        } else {
            this.ele.addClass('d-none');
        }
    }
    addCommentToView(el) {
        this.ele.find('.content-comment').append(el);
    }
    renderApprovalEle() {
        let thisObj = this;
        this.ele.on('click', '.approval-tablinks', function (e) {
            $(e.target).siblings().removeClass('active');
            $(e.target).addClass('active');
            if ($(e.target).attr('data-tab') == 'comment') {
                thisObj.ele
                    .find('.content-history')
                    .removeClass('tab-content-active');
                thisObj.ele
                    .find('.content-comment')
                    .addClass('tab-content-active');
            } else if ($(e.target).attr('data-tab') == 'history') {
                thisObj.ele
                    .find('.content-comment')
                    .removeClass('tab-content-active');
                thisObj.ele
                    .find('.content-history')
                    .addClass('tab-content-active');
            }
        });
        if (this.checkDetailView() || this.checkViewType('update')) {
            let listUser = store.state.app.allUsers;
            $('.s-control-approval-history').attr('title', '');
            thisObj.ele.empty();
            let template = `
                <div class="approval-tab">
                    <button class="approval-tablinks active" data-tab="comment">${SYMPER_APP.$t(
                        'comment.title'
                    )}</button>
                    <button class="approval-tablinks " data-tab="history">${SYMPER_APP.$t(
                        'document.approvalHistory'
                    )}</button>
                </div>
                <div class="approval-tabcontent content-comment tab-content-active">
                </div>
                <div class="approval-tabcontent content-history" style="padding:6px 12px;">
                </div>
            `;
            thisObj.ele.html(template);
            documentApi
                .getListApprovalHistory(this.value)
                .then((res) => {
                    if (res.status == 200) {
                        let data = res.data;
                        if (data.length == 0) {
                            // thisObj.ele.hide()
                        } else {
                            for (let index = 0; index < data.length; index++) {
                                let approvalHistory = data[index];
                                let user = listUser.filter((u) => {
                                    return u.id == approvalHistory.userId;
                                });
                                if (user) {
                                    user = user[0];
                                }
                                let domain =
                                    appConfigs.apiDomain.fileManagement;
                                let item =
                                    `<div class="approved-item">
                                                            <span> </span>  <img src="${domain}/user-avatar?userId=` +
                                    user.id +
                                    `" style="    height: 18px;
                                                            border-radius: 50%;
                                                            width: 18px;
                                                            margin-bottom: -4px;"> <strong>` +
                                    user.displayName +
                                    `</strong> <span>${SYMPER_APP.$t(
                                        'v2.doc.perform'
                                    )}<span style="font-weight:500;">` +
                                    approvalHistory.actionTitle +
                                    '</span> ' +
                                    SYMPER_APP.$moment(approvalHistory.createAt)
                                        .lang(SYMPER_APP.$i18n.locale)
                                        .fromNow() +
                                    ` ( ` +
                                    approvalHistory.createAt +
                                    ` )</span>
                                                        </div>`;
                                thisObj.ele
                                    .find('.content-history')
                                    .append(item);
                            }
                        }
                    } else {
                        // thisObj.ele.hide()
                    }
                })
                .catch((err) => {})
                .finally(() => {});
        } else if (this.checkViewType('print')) {
            let listUser = store.state.app.allUsers;
            thisObj.ele.empty();
            let template = `
                <div class="approval-tab">
                    <button class="approval-tablinks active" data-tab="history">${SYMPER_APP.$t(
                        'document.approvalHistory'
                    )}</button>
                </div>
                <div class="approval-tabcontent content-history tab-content-active" style="padding:6px 12px;">
                </div>
            `;
            thisObj.ele.html(template);
            documentApi
                .getListApprovalHistory(this.value)
                .then((res) => {
                    if (res.status == 200) {
                        let data = res.data;
                        if (data.length == 0) {
                            thisObj.ele.hide();
                        } else {
                            for (let index = 0; index < data.length; index++) {
                                let approvalHistory = data[index];
                                let user = listUser.filter((u) => {
                                    return u.id == approvalHistory.userId;
                                });
                                if (user) {
                                    user = user[0];
                                }
                                console.log(approvalHistory.createAt);
                                console.log(
                                    SYMPER_APP.$moment(
                                        approvalHistory.createAt
                                    ).fromNow()
                                );
                                let item =
                                    `<div class="approved-item">
                                                        <span> </span>  <img src="https://file.${SYMPER_ENV.tenant_domain}/user-avatar?userId=` +
                                    user.id +
                                    `" style="    height: 18px;
                                                        border-radius: 50%;
                                                        width: 18px;
                                                        margin-bottom: -4px;"> <strong>` +
                                    user.displayName +
                                    `</strong> <span>${SYMPER_APP.$t(
                                        'v2.doc.perform'
                                    )}<span style="font-weight:500;">` +
                                    approvalHistory.actionTitle +
                                    '</span> ' +
                                    SYMPER_APP.$moment(
                                        approvalHistory.createAt
                                    ).fromNow() +
                                    ` ( ` +
                                    approvalHistory.createAt +
                                    ` )</span>
                                                    </div>`;
                                thisObj.ele
                                    .find('.content-history')
                                    .append(item);
                            }
                        }
                    } else {
                        thisObj.ele.hide();
                    }
                })
                .catch((err) => {})
                .finally(() => {});
        } else {
            this.ele.remove();
        }
    }
}
