
import * as React from "react";
import axios from 'axios';
import base64 from 'react-native-base64';

let data;
let error;
let records = [];
let formatedData = [];

export function getFmResultSet(data) {
    return data.children[0].children;
}

export function getError(fmResultSet) {
    for (let i = 0; i < fmResultSet.length; i++) {
        if (fmResultSet[i].name == "error") {
            return (fmResultSet[i].attributes.code);
        }
    }
    return false;
}

export function getRecords(fmResultSet) {
    for (let i = 0; i < fmResultSet.length; i++) {

        if (fmResultSet[i].name == "resultset") {
            return fmResultSet[i].children;
        }
    }
    return false;
}

export function formatData(records) {
    let formatedDataTemp = [];

    for (let indexRecord = 0; indexRecord < records.length; indexRecord++) {
        for (let indexField = 0; indexField < records[indexRecord].children.length; indexField++) {
            if (indexField == 0) {
                formatedDataTemp[indexRecord] = {};
            }

            formatedDataTemp[indexRecord][records[indexRecord].children[indexField].attributes.name] = records[indexRecord].children[indexField].children[0].value;

            formatedDataTemp[indexRecord]['record-id'] = records[indexRecord]['attributes']['record-id'];

        }
    }

    return formatedDataTemp;
}

export async function authentification(username, password, server, db, layout, query) {
    const authHeader = 'Basic ' + base64.encode(`${username}:${password}`);

    let data = await get(username, password, server, db, layout, query);
    return data;
}

export async function add(username, password, server, db, layout, query) {
    var XMLParser = require('react-xml-parser');
    const authHeader = 'Basic ' + base64.encode(`${username}:${password}`);

    // https://vhmsoft.com/fmi/xml/fmresultset.xml?-db=vhmsoft_Lyes&-lay=mobile_TEMPS&AM_PM=PM&-new
    let url = "https://" + server + "/fmi/xml/fmresultset.xml?-db=" + db + "&-lay=" + layout + query + "&-new";

    await axios.post(url, {}, {
        headers: { 'Authorization': authHeader }
    }).then(function (response) {
        data = new XMLParser().parseFromString(response.data);

        return true;
    }).catch(function (error) {
        console.log("ERROR IN ADDD");
        alert("ERROR");
        return false;
    });

}


export async function execScript(username, password, server, db, layout, scriptName, scriptParam) {
    const authHeader = 'Basic ' + base64.encode(`${username}:${password}`);
    var XMLParser = require('react-xml-parser');

    let url = "https://" + server + "/fmi/xml/fmresultset.xml?-findall&-db=" + db + "&-lay=" + layout + "&-script=" + scriptName
        + "&-script.param=" + scriptParam;

    console.log(url);
    let errorAuth = false;

    await axios.post(url, {}, {
        headers: { 'Authorization': authHeader }
    }).then(function (response) {
        data = new XMLParser().parseFromString(response.data);
    }).catch(function (error) {
        alert("ERROR");
        errorAuth = true;
    });



}



export async function edit(username, password, server, db, layout, recid, query) {
    var XMLParser = require('react-xml-parser');
    const authHeader = 'Basic ' + base64.encode(`${username}:${password}`);

    // https://vhmsoft.com/fmi/xml/fmresultset.xml?-db=vhmsoft_Lyes&-lay=mobile_TEMPS&AM_PM=PM&-new
    let url = "https://" + server + "/fmi/xml/fmresultset.xml?-db=" + db + "&-lay=" + layout + "&-recid=" + recid + query + "&-edit";

    console.log(url);
    await axios.post(url, {}, {
        headers: { 'Authorization': authHeader }
    }).then(function (response) {
        data = new XMLParser().parseFromString(response.data);
        return true;
    }).catch(function (error) {
        alert("ERROR");
        return false;
    });

}


export async function get(username, password, server, db, layout, query = null) {
    const authHeader = 'Basic ' + base64.encode(`${username}:${password}`);
    var XMLParser = require('react-xml-parser');
    let url = "https://" + server + "/fmi/xml/fmresultset.xml?-findall&-db=" + db + "&-lay=" + layout;

    if (query) {
        url = "https://" + server + "/fmi/xml/fmresultset.xml?-find&-db=" + db + "&-lay=" + layout + query;
    }
    console.log(url);
    let errorAuth = false;

    await axios.post(url, {}, {
        headers: { 'Authorization': authHeader }
    }).then(function (response) {
        data = new XMLParser().parseFromString(response.data);

    }).catch(function (error) {
        // alert("No connexion!");
        errorAuth = true;
    });

    if (errorAuth) {
        return -1;
    }

    let fmResultSet = getFmResultSet(data);
    let error = getError(fmResultSet);
    let records = getRecords(fmResultSet);
    let dataFormated = formatData(records);

    return dataFormated;
}
