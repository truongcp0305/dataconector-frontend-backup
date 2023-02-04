import BaseCellRenderer from './BaseCellRenderer';
export default class LocationCellRenderer extends BaseCellRenderer {
    constructor() {
        super();
        this.placeHolder = '';
        this.rightIcon =
            `<span style="position: absolute;right:2px;font-size: 10px;color: #ababab;cursor:pointer"> 
                <span class="mdi mdi-map-marker-outline control-location-map-marker"> 
                </span>
                <span class="mdi mdi-map-outline control-location-map-outline" >
            </span></span>`;
    }
    render() {
        try{
            if (this.value) {
                this.value = JSON.parse(this.value)
                if (this.control.checkPropsValue('inputValueLocation', 'address')) {
                    this.value = this.value.address ? this.value.address : this.value;
                } else {
                    this.value = this.value.lat + ";" + this.value.lng
                }
            } else {
                this.value = ''
            }
            this.eGui.innerHTML = this.getCellHtml();
            this.handleSelect();
        }
        catch (error) {
            console.warn(error);
        }
    }
    checkDisableButtonLocation() {
        let waitingActive = this.control.checkPropsValue(
            'typeGetLocation',
            'waitActive'
        );
        let isEmptyFormulas =
            !this.control.checkEmptyFormulas('activeManualLocation') &&
            !this.control.checkEmptyFormulas('activeAutomaticLocation');
        return (
            this.control.checkProps('isReadOnly') || (waitingActive && isEmptyFormulas) || !(this.control.isActiveManualLocation || this.control.isActiveAutomaticLocation || !waitingActive)
        );
    }
    handleSelect() {
        let self = this;
        this.eGui
            .getElementsByClassName('mdi-map-marker-outline')[0]
            .addEventListener('click', function (e) {
                if (
                    !self.checkDisableButtonLocation() &&
                    self.tableEditable != false
                ){
                    SYMPER_APP.$evtBus.$emit('document-get-location', self.control)
                }
                });
        this.eGui
            .getElementsByClassName('mdi-map-outline')[0]
            .addEventListener('click', function (e) {
                if (
                    !self.checkDisableButtonLocation() &&
                    self.tableEditable != false
                ){
                    let location = self.params.value;
                    if (location) {
                        location = JSON.parse(location)
                    }
                    let currentLocation = {
                        lat: Number(location.lat),
                        lng: Number(location.lng)
                    };
                    window.open(`https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`);
                }
            });

    }
    cellDestroy() {
        this.eGui
            .getElementsByClassName('mdi-map-marker-outline')[0]
            .removeEventListener('click', event);
            this.eGui
            .getElementsByClassName('mdi-map-outline')[0]
            .removeEventListener('click', event);
    }
}
