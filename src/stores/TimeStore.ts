import { action, computed, observable, toJS } from 'mobx';
import FMResource from './FMMobxResource';
import { Heure, Record, Client, Account, Projet, Activite } from './FMObjectTypes';
import { RootStore } from './index';
import { areSameDates, dateToFMDate } from "../utils/date";


interface Resources {
    heure: FMResource<Heure>
    client: FMResource<Client>
    projet: FMResource<Projet>
    activite: FMResource<Activite>
    account: FMResource<Account>
    replanification: FMResource<any>
}

export default class TransportStore {

    root: RootStore;
  
    @observable activeMonth: number;
    @observable activeYear: number;
    @observable selectedDate: Date;

    @observable selectedTimeId?: number;

    constructor(rootStore: RootStore) {
        this.root = rootStore;
        const today = new Date()
        this.activeMonth = today.getMonth()
        this.activeYear = today.getFullYear()
        this.selectedDate = today
    }


    @action
    handleError(err: any) {
    }

    @action
    setYear(year: number) {
        this.activeYear = year
    }
    @action
    setMonth(month: number) {
        this.activeMonth = month
    }

   @action
    selectDate(date: Date) {
        this.selectedDate = date
    }

    stringifiedDate(date: Date) {
    }
}

