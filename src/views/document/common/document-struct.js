const processHtml = function () {
    console.log(this.sDocumentEditor);

    var allInputControl = $('#sym-submit-' + this.keyInstance).find(
        '.s-control:not(.bkerp-input-table .s-control)',
    );
    let thisCpn = this;
    for (let index = 0; index < allInputControl.length; index++) {
        let id = $(allInputControl[index]).attr('id');
        let controlType = $(allInputControl[index]).attr('s-control-type');

        if (this.sDocumentEditor.allControl[id] != undefined) {
            // ton tai id trong store
            let idField = this.sDocumentEditor.allControl[id].id;
            let valueInput = this.sDocumentEditor.allControl[id].value;

            if (controlType == 'submit' || controlType == 'reset') {
                $(allInputControl[index]).remove();
            } else {
                let controlName =
                    this.sDocumentEditor.allControl[id].properties.name.value;
                if (controlType != 'table') {
                    let control = new BasicControl(
                        idField,
                        $(allInputControl[index]),
                        this.sDocumentEditor.allControl[id],
                        thisCpn.keyInstance,
                        valueInput,
                    );
                    control.init();
                    this.$store.commit('document/addToListInputInDocument', {
                        name: controlName,
                        control: control,
                    });
                    control.render();
                }
                //truong hop la control table
                else {
                    let listInsideControls = {};
                    let tableControl = new TableControl(
                        idField,
                        $(allInputControl[index]),
                        this.sDocumentEditor.allControl[id],
                        thisCpn.keyInstance,
                    );
                    tableControl.initTableControl();
                    tableControl.tableInstance = new Table(
                        tableControl,
                        controlName,
                        thisCpn.keyInstance,
                    );
                    let columnsTableSqlLite = {};
                    let tableEle = $(allInputControl[index]);
                    tableEle.find('.s-control').each(function () {
                        let childControlId = $(this).attr('id');
                        let childControlProp =
                            thisCpn.sDocumentEditor.allControl[id].listFields[
                                childControlId
                            ];
                        let idFieldChild = childControlProp.id;
                        let childControl = new BasicControl(
                            idFieldChild,
                            $(this),
                            childControlProp,
                            thisCpn.keyInstance,
                        );
                        childControl.init();
                        childControl.inTable = controlName;

                        let childControlName =
                            childControlProp.properties.name.value;
                        thisCpn.$store.commit(
                            'document/addToListInputInDocument',
                            {
                                name: childControlName,
                                control: childControl,
                            },
                        );
                        listInsideControls[childControlName] = true;
                    });
                    tableControl.listInsideControls = listInsideControls;
                    this.$store.commit('document/addToListInputInDocument', {
                        name: controlName,
                        control: tableControl,
                    });
                    tableControl.renderTable();
                    tableControl.setData(valueInput);
                }
            }
        }
    }
};
