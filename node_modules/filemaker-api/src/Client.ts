import {FMResponse} from './Response'
import axios, { AxiosRequestConfig  } from 'axios';
import qs from 'qs';
import { extractResponse } from './Parser'

interface HttpData {
    '-db': string,
    '-lay': string,
    '-findall': string,
    '-skip'?: number,
    '–relatedsets.max'?: number,
    '-max'?: number,
}

export class Client {
    domain: string;
    db: string;
    getAuth: () => string
    rowsPerPage: number

    constructor(domain: string, db: string, getAuth: () => string) {
         this.domain = domfsdafdsaain
        this.db = db
        this.getAuth = getAuth
        this.rowsPerPage = 200
    }

    call<CustomRecord>(options: AxiosRequestConfig) {
        return axios(options)
            .then(axiosResponse => {
                return extractResponse(axiosResponse.data)
            })
            .then(xmlResponse => new FMResponse<CustomRecord>(xmlResponse))
    }

    getDefaultOptions(): AxiosRequestConfig {
        return {
            method: 'post',
            url: `https://${this.domain}/fmi/xml/fmresultset.xml`,
            headers: {
                Authorization: this.getAuth()
            }
        }
    }

    findall<CustomRecord>(layout: string, page = 1, paginated = false) {

        let data: HttpData = {
            '-db': this.db,
            '-lay': layout,
            '-findall': '1',
        }

        /*
        if (paginated) {
            data['-skip'] = this.rowsPerPage * page;
            data['–relatedsets.max'] = this.rowsPerPage;
            data['-max'] = this.rowsPerPage;
        }
        */


        let options: AxiosRequestConfig = {
            ...this.getDefaultOptions(),
            data: qs.stringify(data)
        }

        return this.call<CustomRecord>(options)
    }

    update<T>(layout: string, recid: number, fields: Partial<T>) {
        let data = {
            ...fields,
            '-recid': recid,
            '-db': this.db,
            '-lay': layout,
            '-edit': '',
        }

        let options: AxiosRequestConfig = {
            ...this.getDefaultOptions(),
            data: qs.stringify(data),
            method: 'POST'
        }

        return axios(options)
            .then(response => {
                return Promise.resolve(extractResponse(response.data))
            })
    }

    create<T>(layout: string, fields: Partial<T>, scriptOptions?:{script:string, params?:string[]}) {
        alert("Allo");
 
    }

    isAuthorized(): Promise<boolean> {
        const data: HttpData = {
            '-db': this.db,
            '-lay': 'asdflkjrandom',
            '-findall': '1',
        }

        const options: AxiosRequestConfig = this.getDefaultOptions();
        options.url += '?' + qs.stringify(data)
        options.validateStatus = (status) => true

        return axios(options)
            .then(response => {
                console.log(response)
                return response.status !== 401
            
            })
            .catch(err => false)

    }

    customQuery<CustomRecord>(layout: string, fields: { [key: string]: (string | number )[] | undefined } = {}): Promise<FMResponse<CustomRecord>> {
        const sanFields = Object.keys(fields)
            .reduce<{[key:string]: (string| number)[]}>(
                (obj, key) => {
                    const value = fields[key]
                    if (value === undefined) return obj
                    return {...obj, [key]:value}
                }
            , {});

        if (Object.keys(fields).length === 0) return this.findall<CustomRecord>(layout);

        let params: { [key: string]: any } = {}
        let counter = 0;
        let counters: number[][] = [];

        const addField = (value: string | number) => {
            counter++;
            params[`-q${counter.toString()}`] = fieldName
            params[`-q${counter.toString()}.value`] = value
            return counter;
        }

        for (var fieldName in sanFields) {
            let values = sanFields[fieldName];
            let fieldCounters = values.map(addField)
            counters.push(fieldCounters)
        }

        let lists: number[][] = [
            []
        ]

        counters.forEach(fieldCounters => {
            lists = fieldCounters.reduce<number[][]>((duplicatedLists, counter) => {
                let newLists = lists.map(list => list.concat([counter]))
                return duplicatedLists.concat(newLists)
            }, [])
        });

        let query = lists
            .map(list => list.map(fieldCounter => `q${fieldCounter}`).join(','))
            .map(formula => `(${formula})`).join(';');

        let data = {
            ...params,
            '-query': query,
            '-db': this.db,
            '-lay': layout,
            '–relatedsets.max': this.rowsPerPage,
            '-skip': 0,
            '-max': this.rowsPerPage,
            '-findquery': ''
        }

        //let options: AxiosRequestConfig = this.getDefaultOptions();

        //options.url += '?' + qs.stringify(data);
        let options: AxiosRequestConfig = {
            ...this.getDefaultOptions(),
            method: 'POST',
            data: qs.stringify(data)
        }

        return this.call<CustomRecord>(options)

    }

    /*
    find(layout, fields) {
        let data = {
            ...fields,
            '-db': this.db,
            '-lay': layout,
            '-find': ''
        }
 
        let options = {
            ...this.getDefaultOptions(),
            data: qs.stringify(data)
        }
 
        return axios(options)
            .then(response => {
                return Promise.resolve(this.extractXMLResponse(response.data))
            })
    }
 
    update(layout, id, fields) {
        let data = {
            ...fields,
            '-recid': id,
            '-db': this.db,
            '-lay': layout,
            '-edit': ''
        }
 
        let options = {
            ...this.getDefaultOptions(),
            data: qs.stringify(data)
        }
 
        return axios(options)
            .then(response => {
                return Promise.resolve(this.extractXMLResponse(response.data))
            })
    }
    */


    /*
        param: xmlString
        return: FMResponse
    */


    /*
    extractXMLLayout(data) {
        let xml = entities.decode(data)
        var result = parser.parse(xml, { ignoreAttributes: false })
 
        let valueLists = result["FMPXMLLAYOUT"]['VALUELISTS']['VALUELIST']
        let valueListsDict = valueLists.reduce((dict, value) => {
            let key = value['@_NAME']
            let valueList = value['VALUE']
            if (!Array.isArray(valueList)) return dict
            valueList = valueList.map(value => ({ value: value['#text'], text: value['@_DISPLAY'] }))
            dict[key] = valueList
            return dict
        }, {});
 
        let fields = result["FMPXMLLAYOUT"]['LAYOUT']['FIELD']
        let fieldsDict = fields.reduce((dict, value) => {
            let key = value['@_NAME']
            let type = value['STYLE']['@_TYPE']
            let valueListKey = value['STYLE']['@_VALUELIST']
            dict[key] = {}
            dict[key]['type'] = type
            if (valueListKey !== '' && (valueListKey in valueListsDict)) {
                dict[key]['valueList'] = valueListsDict[valueListKey]
            }
            return dict
        }, {});
 
        let fmResponse = new FMResponse(0);
        fmResponse.data = fieldsDict
        return fmResponse
    }
    */
    /*
 
    viewLayout(layout = 'Main_listview') {
 
        let data = {
            '-db': this.db,
            '-lay': layout,
            '-view': '',
            '-max': this.rowsPerPage
        }
 
        let options = {
            ...this.getDefaultOptions(),
            data: qs.stringify(data),
            url: `http://${this.domain}/fmi/xml/FMPXMLLAYOUT.xml`,
        }
 
        return axios(options)
            .then(response => {
                return Promise.resolve(this.extractXMLLayout(response.data))
            })
    }
 
 
    getImage(imgUrl) {
        var url = 'http://' + this.domain + imgUrl
        return axios({ ...this.getDefaultOptions(), method: 'GET', url, responseType: 'arraybuffer', responseEncoding: 'binary' })
            .then(response => Buffer.from(response.data).toString('base64'))
    }
    */

}

