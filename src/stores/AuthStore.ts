import { observable, computed, action } from 'mobx';
import { persist } from 'mobx-persist';
import { RootStore } from './index';
import { setNavigationState } from '../utils/PersistState'
import { decode as atob, encode as btoa } from 'base-64'


export default class AuthStore {

    rootStore: RootStore;

    @observable username = "";
    @observable password = "";
    @persist @observable token = "";

    @observable authLoading = false;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    getAuthHeader() {
        return 'Basic ' + this.token;
    }

    @action
    setToken() {
        this.token = btoa(`${this.username}:${this.password}`);
    }

    @action
    extractToken() {
        return atob(this.token);
    }

    @action
    login() {
        this.authLoading = true

        return this.rootStore.api.isAuthorized()
            .then(async (isAuthorized: boolean) => {

                if (isAuthorized) {
                    this.password = ''
                    this.username = ''
                    await setNavigationState('Login')
                    return isAuthorized
                }
                return isAuthorized
            })
            .finally(() => {
                this.authLoading = false
            })
    }

    @action logout() {
        setNavigationState('Logout')
        this.username = ''
        this.password = ''
    }

}

