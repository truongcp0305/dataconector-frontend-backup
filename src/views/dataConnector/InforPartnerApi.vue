<template>
  <div class="w-100">
    <p class="partner-if-text">{{ $t('v2.dataconnector.partnerInformation') }}</p>
    <div class="container">
      <div class="label">{{ $t('v2.dataconnector.selectPartner') }}</div>
      <div class="list">
        <v-select :disabled="disabled" :menu-props="{
          height: 400,
          nudgeBottom: 35,
          minWidth: 90,
          maxWidth: 30,
        }" background="black" class="sym-select" :items="listPartner" v-model="partnerSelected" hide-details dense>
        </v-select>
      </div>
    </div>
    <div class="input mt-3">
      <FormTpl 
      v-if="this.partnerSelected == 'Misa'"
      class="mr2 -mt-4 form" 
      :labelWidth="'80px'" 
      :allInputs="allInputs" 
      :single-line="true"
       />
    </div>
  </div>
  
</template>

<script>
import FormTpl from './../../components/common/FormTpl';
import  dataConnectorApi  from '../../api/dataConnector'

export default {
  async created() {
    await this.getPartnerConfigsApi();
  },
  methods: {
    async getPartnerConfigsApi () {
      await dataConnectorApi.getPartnerConfigs()
      .then(
        res => {
          if(res.status == 200){
            res.data.forEach(e=>{
              this.listPartner.push(e.name)
              if(e.config != '' && e.config){
                this.partnerConfigs[e.name] = JSON.parse(e.config)
              }
            });
          }else{
            this.partnerConfigs = {};
          }
        }
      );
    },
    renderConfig(partner){
      var config = this.partnerConfigs[this.partnerSelected];
      const self = this;
      if(config && config != []){
        this.allInputs = {}
        var data = {}
        config.forEach(e => {
          if(partner[e.nameField]==''||partner[e.nameField]==undefined){
            self.notEmptyValid[e.title] = false;
          }else{
            self.notEmptyValid[e.title] = true;
          }
          data[e.nameField] = {
            title: e.title,
            type: 'text',
            value: partner[e.nameField],
            disabled: self.disabled,
            required: true,
            validateStatus: {
              isValid: true,
              message: ''
            },
            validate(){
              this.validateStatus.isValid = true;
              self.notEmptyValid[this.title] = true;
              this.validateStatus.message = '';
              if(this.value == '' || this.value.trim()== ''){
                this.validateStatus.isValid = false;
                self.notEmptyValid[this.title] = false;
                this.validateStatus.message = 
                  self.$t('v2.dataconnector.cannotEmpty');
              }
              self.changeInputValid()
            },
          }
        }
        );
        this.allInputs = data 
      }
      this.changeInputValid()
    },
     setData(data) {
      this.partner = data.partner;
      this.renderConfig(data.partner);
      this.partner.namePartner == undefined
        ? this.partnerSelected = 'Khác'
        : this.partnerSelected = data.partner.namePartner;
    },
    refreshData() {
      for(let key in this.allInputs){
        this.allInputs[key].value = '';
      }
      this.partnerSelected = 'Khác';
      this.partner = {};
    },
    sendInputs() {
      var data = {};
      Object.keys(this.allInputs).forEach(key =>{
        if (this.allInputs.hasOwnProperty(key)) {
          data[`${key}`]= this.allInputs[key].value;
        }
      })
      data.namePartner = this.partnerSelected;
      this.$emit('changeP', data);
    },
    changeInputValid(){
      this.isValid = true;
      Object.keys(this.notEmptyValid).forEach(key=>{
        if(this.notEmptyValid[key]== false){
          this.isValid = false
        }
      });
      this.emitValid();
    },
    emitValid(){
      if(this.partnerSelected == 'Misa'){
        this.$emit('changeValid', this.isValid);
      }else{
        this.$emit('changeValid', true);
      }
    }
  
  },
  watch: {
    partnerApi: { 
      handler: function(){
        this.renderConfig(this.partner);
        this.$emit('changePartner', this.partnerSelected);
      },
      deep: true
    },
    disabled(){
      if(!this.disabled){
        Object.keys(this.allInputs).forEach(key=>{
          this.allInputs[key].disabled = false;
        });
      }else{
        this.allInputs[key].disabled = true;
      }
    }
  },
  computed:{
    partnerApi() {
      return this.partnerSelected;
    },
  },
  props: {
    value: {
      type: Object,
      default() {
        return {
          partner: {},
        };
      },
    },
    disabled: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  components: {
    FormTpl,
  },

  data(){
    return {
      isValid: true,
      notEmptyValid: {},
      allInputs: {},
      partner: {},
      typeAction: '',
      partnerConfigs: {},
      partnerSelected: 'Khác',
      listPartner: [
        'Khác',
      ],
    }
  }
}
</script>

<style scoped>
.form>>>textarea {
  font-size: 11px;
}

.form>>>.v-label {
  color: lightgrey !important;
}
.sym-select>>>.v-input__slot:before,
.sym-select>>>.v-input__slot:after {
  border: black 5px !important;
}
.sym-select {
  height: 30px !important;
  max-width: 90px;
  min-width: 90px;
}

.sym-select>>>.v-select__slot {
  background: #fbfbfb !important;
  height: 30px !important;
  padding-left: 5px;
  font-size: 11px;
  border-radius: 4px 0 0 4px;
  border: 1px solid #efefef;
}

.partner-if-text{
  margin-top: 10px;
}
.container{
  display: flex;
  padding: 0px !important;

}
.label{
  margin-top: 10px;
  margin-right: 20px;
}
</style>