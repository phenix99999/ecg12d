import parser from 'fast-xml-parser';
import { XmlEntities } from 'html-entities';
const entities = new XmlEntities();

interface DynamicDict {
    [key: string]: Object[]
}

interface RelatedSets {
    [key: string]: {
        count: number,
        records: Record[]
    },
}

interface Record {
    relatedsets?: RelatedSets,
    fields: DynamicDict,
    id: number
}

export interface ParsedResponse {
    code: number,
    count?: number,
    records?: Record[],
}


export function extractResponse(data: string): ParsedResponse {
    const xml = entities.decode(data)
    const result = parser.parse(xml, { ignoreAttributes: false })
    const fmresultset = result["fmresultset"]
    const code = Number(fmresultset["error"]["@_code"])

    if (code !== 0) return { code }

    return {
        code,
        ...extractResultset(fmresultset["resultset"])
    }
}

function extractResultset(resultset: any) {

    const count = Number(resultset["@_count"])
    const xmlRecords = Array.isArray(resultset["record"])
        ? resultset["record"]
        : [resultset["record"]]

    return {
        records: xmlRecords.map(xmlRecord => extractRecord(xmlRecord)),
        count
    }
}

function extractRecord(record: any): Record {

    let fields: DynamicDict = {}
    let relatedsets: RelatedSets = {}

    const recordId = record["@_record-id"]

    var xmlFields = Array.isArray(record.field) ? record.field : [record.field]
    xmlFields = record.field ? record.field : []
    xmlFields.forEach((xmlField: any) => {
        let key = xmlField['@_name']
        key = key.split('::').pop()
        fields[key] = xmlField['data']
    })

    var xmlRelatedsets = Array.isArray(record.relatedset) ? record.relatedset : [record.relatedset]
    xmlRelatedsets = record.relatedset ? record.relatedset : []

    xmlRelatedsets.forEach((xmlRelatedset: any) => {
        //if (xmlRelatedset === undefined) debugger;
        let key = xmlRelatedset['@_table'] as string
        relatedsets[key] = extractResultset(xmlRelatedset)
    })

    return { relatedsets, fields, id: recordId as number }
}

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


