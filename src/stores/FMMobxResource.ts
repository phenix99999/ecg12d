import { observable, toJS, action, computed, ObservableMap } from 'mobx';
import { Record } from './FMObjectTypes'
//import FMClient from '../services/FMClient/Client';
import FilemakerClient from "filemaker-api"

export type SearchOptions<Fields> = Partial<{
    [key in keyof Fields]: (string | number)[]
}>

type Groups<Fields> = {
    [key: string]: Record<Fields>[]
}
type Operation = 'create' | 'update'

export default class CrudResource<Fields>{
    layout: string;
    client: FilemakerClient;

    @observable isFetching: boolean;
    @observable isSaving: boolean;
    @observable selectedId?: number;
    @observable records: Record<Fields>[];
    @observable form: ObservableMap<keyof Fields, string>
    @observable editionMode: Operation

    onError: (reason: any) => void

    constructor(FMlayout: string, client: FilemakerClient, onError: (reason: any) => void) {
        this.layout = FMlayout
        this.client = client
        this.onError = onError
        this.isFetching = false;
        this.isSaving = false;
        this.records = []
        this.form = new ObservableMap<keyof Fields, string>()
        this.editionMode = 'update'
    }

    @computed
    get isLoading() {
        return this.isSaving || this.isFetching
    }

    get formPayload() {
        const form = this.form.toJS()
        return Array.from(form.keys())
            .reduce<Partial<Fields>>((payload, key) => (
                { ...payload, [key]: form.get(key) }
            ), {})
    }

    @computed
    get selectedRecord() {
        return this.records.find(record => record.id === this.selectedId)
    }

    @action
    select(record: Record<Fields>) {
        this.selectedId = record.id
        this.form.clear()
    }

    @action
    clear() {
        this.form.clear()

    }
    @action
    updateEditionMode(mode: Operation) {
        this.editionMode = mode
    }

    @action
    save(id?: number, fields?: Partial<Fields>) {
        if (fields === undefined && this.form.size === 0) {
            return
        }

        this.isSaving = true
        const sentId = id === undefined ? this.selectedId : id
        const payload = fields === undefined ? this.formPayload : fields
        if (!sentId) return
        return this.client.update(this.layout, sentId, payload)
            .finally(() => {
                this.isSaving = false
            })
        //.catch(this.onError)
    }

    @action
    create(defaultPayload: Partial<Fields>, scriptOptions?: { script: string, params: string[] }) {
        const totalPayload: Partial<Fields> = {
            ...this.formPayload,
            ...defaultPayload
        }

        return this.client.create(this.layout, totalPayload, scriptOptions)
        //.catch(this.onError)
    }

    @action
    list(options: SearchOptions<Fields> = {}) {
        this.isFetching = true
        this.clear()
        return this.client
            .customQuery<Fields>(this.layout, options)
            .then(response => {
                this.isFetching = false
                if (response?.records === undefined) return response
                this.records = response.records
                return response
            })
            .finally(() => {
                this.isFetching = false
            })
        /*
        .catch(this.onError)
        */
    }

    @action
    updateValue(key: keyof Fields, value: any, realtime?: boolean) {
        this.form.set(key, value);
        if (this.editionMode === "create") {
            return
        }
        const fields: Partial<Fields> = {
            [key]: value
        } as Partial<Fields>
        if (realtime) {
            this.save(this.selectedId, fields);
        }

    }

    shownValue(key: keyof Fields): string {
        const operation = this.editionMode

        if (operation === 'create') {
            return this.form.get(key) || ''
        }

        if (operation === 'update') {
            const selectedField = this.selectedRecord?.fields[key]
            const selectedValue = (typeof selectedField === 'string' || typeof selectedField === 'number')
                ? selectedField.toString()
                : ''
            return this.form.get(key) === undefined
                ? selectedValue || ''
                : this.form.get(key) || ''
        }
        return this.form.get(key) || ''
    }

    groupByKey(key: keyof Fields): Groups<Fields> {
        return this.records
            .reduce<Groups<Fields>>((groups, record) => {

                const value = record.fields[key];

                if (typeof value !== 'string' && typeof value !== 'number') {
                    return groups
                }
                const stringifiedValue = value.toString();
                return (groups[stringifiedValue] === undefined)
                    ?
                    {
                        ...groups,
                        [stringifiedValue]: [record]
                    }
                    :
                    {
                        ...groups,
                        [stringifiedValue]: groups[stringifiedValue].concat([record])
                    }
            }, {})
    }

}