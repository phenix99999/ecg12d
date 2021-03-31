"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.extractResponse = void 0;
var fast_xml_parser_1 = __importDefault(require("fast-xml-parser"));
var html_entities_1 = require("html-entities");
var entities = new html_entities_1.XmlEntities();
function extractResponse(data) {
    var xml = entities.decode(data);
    var result = fast_xml_parser_1["default"].parse(xml, { ignoreAttributes: false });
    var fmresultset = result["fmresultset"];
    var code = Number(fmresultset["error"]["@_code"]);
    if (code !== 0)
        return { code: code };
    return __assign({ code: code }, extractResultset(fmresultset["resultset"]));
}
exports.extractResponse = extractResponse;
function extractResultset(resultset) {
    var count = Number(resultset["@_count"]);
    var xmlRecords = Array.isArray(resultset["record"])
        ? resultset["record"]
        : [resultset["record"]];
    return {
        records: xmlRecords.map(function (xmlRecord) { return extractRecord(xmlRecord); }),
        count: count
    };
}
function extractRecord(record) {
    var fields = {};
    var relatedsets = {};
    var recordId = record["@_record-id"];
    var xmlFields = Array.isArray(record.field) ? record.field : [record.field];
    xmlFields = record.field ? record.field : [];
    xmlFields.forEach(function (xmlField) {
        var key = xmlField['@_name'];
        key = key.split('::').pop();
        fields[key] = xmlField['data'];
    });
    var xmlRelatedsets = Array.isArray(record.relatedset) ? record.relatedset : [record.relatedset];
    xmlRelatedsets = record.relatedset ? record.relatedset : [];
    xmlRelatedsets.forEach(function (xmlRelatedset) {
        //if (xmlRelatedset === undefined) debugger;
        var key = xmlRelatedset['@_table'];
        relatedsets[key] = extractResultset(xmlRelatedset);
    });
    return { relatedsets: relatedsets, fields: fields, id: recordId };
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
