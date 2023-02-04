export const headerComponentRenderer = () => { };
const objectNoCheckboxHeader = ['account', 'action_pack', 'permission_pack', 'system_role', 'orgchart_role', 'filter', 'data_connector', 'department'];
headerComponentRenderer.prototype.init = function (agParams) {
    this.agParams = agParams;
    this.eGui = document.createElement('div');
    let displayName = `<span class="header-name" >${agParams.displayName}</span>`;
    if (objectNoCheckboxHeader.includes(agParams.objectType)) {
        this.eGui.innerHTML = displayName;
    } else {
        let className = `checkbox-header-${agParams.column.colDef.field}`;
        let style = `margin-right: 8px; margin-top: 0px; position: relative; top: 2px;`
        let input = `<input class='${className}' style='${style}' type='checkbox'' ${agParams.valueCheckbox ? 'checked' : ''
            } />`;
        if (agParams.disabled) {
            input = `<input disabled class='${className}' style='${style}' type='checkbox' ${agParams.valueCheckbox ? 'checked' : ''
                } />`;
        }
        this.eGui.innerHTML = input + displayName
        this.eCheckbox = this.eGui.querySelector(`.${className}`);
        this.eCheckbox.addEventListener('click', (e) => {
            SYMPER_APP.$evtBus.$emit(
                'action-pack-click-checkbox-header',
                {
                    e: e,
                    col: agParams.column.colDef.field,
                    objectType: agParams.objectType,
                    instanceKey: agParams.instanceKey
                },
            );
        });
    }

};

headerComponentRenderer.prototype.getGui = function () {
    return this.eGui;
};

headerComponentRenderer.prototype.destroy = function () {
    if (this.eCheckbox) {
        this.eCheckbox.removeEventListener('click', this.eCheckbox);
    }
};