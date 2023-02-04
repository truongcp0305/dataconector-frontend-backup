import Api from "./api";
import {appConfigs} from "./../configs.js";

let api = new Api(appConfigs.apiDomain.scheduler);

export const schedulerApi = {

	getSchedulers() {
		return api.get('scheduler')
	},
	deleteScheduler(id){
		return api.put("delete/"+ id)
	},
	createScheduler(data){
		return api.post("scheduler",data)
	},
	updateScheduler(id, data){
		return api.put("scheduler/"+ id, data)
	},
	checkExistNameScheduler(name){
		return api.post('scheduler/checkExistScheduler/' + name)
	},
	getSchedulerByIdDoc(idDoc){
		return api.get('scheduler-doc/' + idDoc)
	},
	getSchedulerById(id){
		return api.get('scheduler/' + id)
	},
	checkExistDocScheduler(idDoc){
		return api.post('scheduler/checkExistDoc/' + idDoc)
	},
	recurring(data){
		return api.post('recurring', data)
	},
	getRecurring(){
		return api.get('getrecurring')
	},
	updateRecurring(id, data){
		return api.put('recurring/'+ id, data)

	},
	getEventEachTenMinutes(){
		return api.get('geteventrecurring')

	},
	getEventRecurringByFilter(min_date, max_date){
		return api.get('geteventrecurring-by-filter/' + min_date + "/" + max_date)

	},
	updateRecurringWithRecTypeEmpty(id, data){
		return api.put('recurring-rectype-empty/'+ id, data)
	},
	updateRecWithEventEditted(id){
		return api.put("upate-rec-with-event-editted/"+ id)
	},
}; 