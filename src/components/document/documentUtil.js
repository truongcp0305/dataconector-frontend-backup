const getInsertionCSS = function () {
    var styles = `.reserved-drop-marker{width:100%;height:2px;background:#00a8ff;position:absolute}
                  .reserved-drop-marker::after,.reserved-drop-marker::before{content:'';background:#00a8ff;height:7px;width:7px;position:absolute;border-radius:50%;top:-2px}.reserved-drop-marker::before{left:0}.reserved-drop-marker::after{right:0}`;
    styles +=
        "[data-dragcontext-marker],[data-sh-parent-marker]{outline:#19cd9d solid 2px;text-align:center;position:absolute;z-index:123456781;pointer-events:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}[data-dragcontext-marker] [data-dragcontext-marker-text],[data-sh-parent-marker] [data-sh-parent-marker-text]{background:#19cd9d;color:#fff;padding:2px 10px;display:inline-block;font-size:14px;position:relative;top:-24px;min-width:121px;font-weight:700;pointer-events:none;z-index:123456782}[data-dragcontext-marker].invalid{outline:#dc044f solid 2px}[data-dragcontext-marker].invalid [data-dragcontext-marker-text]{background:#dc044f}[data-dragcontext-marker=body]{outline-offset:-2px}[data-dragcontext-marker=body] [data-dragcontext-marker-text]{top:0;position:fixed}";
    styles +=
        '.drop-marker{pointer-events:none;}.drop-marker.horizontal{background:#00adff;position:absolute;height:2px;list-style:none;visibility:visible!important;box-shadow:0 1px 2px rgba(255,255,255,.4),0 -1px 2px rgba(255,255,255,.4);z-index:123456789;text-align:center}.drop-marker.horizontal.topside{margin-top:0}.drop-marker.horizontal.bottomside{margin-top:2px}.drop-marker.horizontal:before{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-top:-3px;float:left;box-shadow:0 1px 2px rgba(255,255,255,.4),0 -1px 2px rgba(255,255,255,.4)}.drop-marker.horizontal:after{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-top:-3px;float:right;box-shadow:0 1px 2px rgba(255,255,255,.4),0 -1px 2px rgba(255,255,255,.4)}.drop-marker.vertical{height:50px;list-style:none;border:1px solid #00ADFF;position:absolute;margin-left:3px;display:inline;box-shadow:1px 0 2px rgba(255,255,255,.4),-1px 0 2px rgba(255,255,255,.4)}.drop-marker.vertical.leftside{margin-left:0}.drop-marker.vertical.rightside{margin-left:3px}.drop-marker.vertical:before{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-top:-4px;top:0;position:absolute;margin-left:-4px;box-shadow:1px 0 2px rgba(255,255,255,.4),-1px 0 2px rgba(255,255,255,.4)}.drop-marker.vertical:after{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-left:-4px;bottom:-4px;position:absolute;box-shadow:1px 0 2px rgba(255,255,255,.4),-1px 0 2px rgba(255,255,255,.4)}';
    styles +=
        'body{background:white !important;font-size:11px;font-family:Roboto,sans-serif;} ';
    // styles += 'body > div:not(.mce-resizehandle){min-height:30px;} ';
    styles += 'p{margin:0 !important;} ';
    styles += '@page { margin: 0; }';
    styles +=
        'table td, table th{ border: 1px dotted #ccc !important;padding: 2px !important;height:25px !important}';
    styles +=
        '.on-selected{border:1px dashed #2196f3 !important;cursor: pointer !important;}';
    styles +=
        '.s-control-tracking-value,.s-control-rich-text,.s-control-combobox,.s-control-approval-history,.s-control-report,.s-control-file-upload,.s-control-reset,.s-control-draf,.s-control-submit,.s-control-text,.s-control-select,.s-control-document,.s-control-phone,.s-control-email,.s-control-currency,.s-control-radio,.s-control-color,.s-control-percent,.s-control-hidden,.s-control-user,.s-control-filter,.s-control-date,.s-control-datetime,.s-control-month,.s-control-time,.s-control-number{width: auto;height: 25px;border-radius: 3px;font-size: 11px;border:1px solid #e9ecef;font-family:Roboto,sans-serif;color:gray;padding: 0 5px;outline: 0!important;    background: rgba(0 0 0 / 0.05);}';
    styles +=
        '.s-control:not(.s-control-table):not(s-control-type="tab"):not(s-control-type="page") {display: inline-block;background: rgb(233, 236, 239);min-width: 50px;outline: none !important;margin:1px}';
    styles += '.s-control-rich-text {border:none;}';
    styles +=
        '.s-control-reset,.s-control-draft,.s-control-submit{padding: 5px 8px;}';
    styles +=
        '.s-control-user,.s-control-select,.s-control-document{width: 120px;}';
    styles += '.s-control-error{border: 1px solid red !important;}';
    styles +=
        '.s-control-label{font-size:11px;color:gray;border:1px solid #e9ecef;padding:7px 8px 6px 7px;border-radius:4px;}';
    styles += '.s-control-title{font-size:13px;color:black;}';
    styles +=
        '.mce-input-padding{width: 100px !important;left: 120px !important;padding:0 4px}';
    styles += '.mce-offscreen-selection{display:none !important;}';
    styles +=
        '.s-control-table table{width:100%;text-align: left;border-collapse: collapse;font-size: 11px;outline: none;}';
    styles +=
        '.s-control-table table thead{font-size: 11px;background:#f2f2f2}';
    styles += '.s-control-table table tbody td{width:20%;}';
    styles +=
        'table:not(.s-control-table) tbody td[data-mce-selected="1"]{background:#e7eaff}';
    styles += '.ephox-snooker-resizer-rows {cursor: row-resize}';
    styles += '.ephox-snooker-resizer-cols {cursor: col-resize}';
    styles +=
        '.ephox-snooker-resizer-bar {background-color: #b4d7ff;opacity: 0;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;}';

    styles += `
      .s-control-table{
        border: 1px solid #ffffff;
      }
      /* Style the buttons inside the tab */
      .tab button {
        background:transparent;
        float: left;
        border: none;
        outline: none;
        padding: 0px 10px;
        transition: 0.3s;
        font-size: 14px;
        height: 25px;
        border-radius:4px;
        margin-right: 4px;

      }
      button{
        cursor: pointer;
      }
      /* Change background color of buttons on hover */
      button:hover {
        background: rgba(0 0 0 / 0.1) !important;
      }
      
      
      .page-content-header{
        display: flex;
        margin-top: 6px;
      }
      .tab-active{
        background: rgba(0 0 0 / 0.05) !important;
      }

      .tabcontent {
        display: none;
        height:100%;
        cursor: text;
      }
      .tabcontent:focus{
          outline:none;
      }
      .content-active{
        display: block !important;
      }
      .add-tab-btn{
        border: none;
        margin: 0 8px;
        border-radius: 4px;
        padding: 0 10px;
        height: 25px;
        transition: all ease-in-out 250ms;
      }
      .page-content-body{
        height: calc(100% - 30px);
        overflow-y: auto;
        overflow-x: hidden;
        padding: 10px;
      }
      .page-header-action button{
        height: 25px;
        width: 100%;
        border: none;
        background: #f2f2f2;
        transition: all ease-in-out 250ms;
        margin-top: 6px;
      }
      .collapse-sidebar-btn{
        position: absolute;
        bottom: 6px;
        right: 0;
        border: none;
        background: rgba(0 0 0 / 0.05);
        height: 25px;
        border-radius: 4px;
      }
      .sidebar-page{
        background: #f2f2f2;
        height: 100%;
        width: 150px;
        position: relative;
        transition: all ease-in-out 250ms;
      }
      .page-content{
        height:100%;
        width:100%;
        display: none;
      }
      .list-page-content{
        height:100%;
        width:100%;
        background: white;
        width: calc(100% - 150px);
      }
      .list-page{
        height: calc(100% - 35px);
        padding: 2px;
        font-size: 13px;
      }
      .page-item{
        padding: 5px 4px;
        border-radius: 4px;
        margin-bottom: 4px;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: all ease-in-out 150ms;
        position:relative;
      }
      .add-page-btn{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sb-page-active{
        background: #077afe;
        color: white;
      }
      .page-active{
        display: block !important;
      }
      .collapse-sb{
        width: 30px;
      }
      .d-none{
        display:none;
      }
      .drag-table{
        height: 20px;
        text-align: center;
        padding-top: 6px;
        background: rgb(0 0 255 / 0.2);
        cursor: move;
      }
      .rotate-180 {
        transform: rotate(180deg);
      }
      .delete-page-icon{
        position:absolute;
        font-size:11px;
        right:4px;
        top: 7px;
        opacity:0;
      }
      .page-item:hover .delete-page-icon{
        opacity:1;
      }

      .wrap-s-control-table:not(.s-control){
        overflow-x:auto !important;
        overflow-y:hidden !important;
        border: 1px solid #e9ecef;
      }
      .selection-highlight{
        background: #3297FD !important;
      }
      .s-control.s-control-image{
        background: #f2f2f2;
        border-radius: 4px;
      }
      .s-control.s-control-location{
        width: 120px;
      }
      `;
    return styles;
};
export { getInsertionCSS };
