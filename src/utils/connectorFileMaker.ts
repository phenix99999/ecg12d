
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
    console.log("########")

    for (let indexRecord = 0; indexRecord < records.length; indexRecord++) {
        for (let indexField = 0; indexField < records[indexRecord].children.length; indexField++) {
            if (indexField == 0) {
                formatedDataTemp[indexRecord] = {};
            }

            // console.log(records[indexRecord].children[indexField]);
            if (records[indexRecord].children[indexField].attributes.name) {
                formatedDataTemp[indexRecord][records[indexRecord].children[indexField].attributes.name] = records[indexRecord].children[indexField].children[0].value;
            }

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
        alert(error);
        return false;
    });

}

// https://cpfilemaker.com/fmi/xml/fmresultset.xml?-db=Coffrets_Prestige&-lay=api_mobile_CARTE_DETAILS&-find=1&Numero_final=196566718&-script=Givex_GetBalance
export async function execScript(username, password, server, db, layout, query, scriptName, scriptParam = false) {
    const authHeader = 'Basic ' + base64.encode(`${"Alain Simoneau"}:${"4251"}`);
    var XMLParser = require('react-xml-parser');

    let url = "https://" + server + "/fmi/xml/fmresultset.xml?-db=" + db + "&-lay=" + layout + "&-find=1" + query + "&-script=" + scriptName

    if (scriptParam) {
        url += "&-script.param=" + scriptParam.join('%0A');
    }



    // + "&-script.param=" + scriptParam;

    console.log(url);
    let errorAuth = false;

    await axios.post(url, {}, {
        headers: { 'Authorization': authHeader }
    }).then(function (response) {
        console.log(response);
        data = new XMLParser().parseFromString(response.data);
    }).catch(function (error) {
        alert(error);
        errorAuth = true;
    });



    let fmResultSet = getFmResultSet(data);

    // console.log(fmResultSet);

    let error = getError(fmResultSet);
    // console.log("Error");
    // console.log(error);
    let records = getRecords(fmResultSet);

    let dataFormated = formatData(records);
    // console.log(dataFormated);
    return dataFormated;

}



export async function edit(username, password, server, db, layout, recid, query) {
    var XMLParser = require('react-xml-parser');
    const authHeader = 'Basic ' + base64.encode(`${username}:${password}`);

    // https://vhmsoft.com/fmi/xml/fmresultset.xml?-db=vhmsoft_Lyes&-lay=mobile_TEMPS&AM_PM=PM&-new
    let url = "https://" + server + "/fmi/xml/fmresultset.xml?-db=" + db + "&-lay=" + layout + "&-recid=" + recid + query + "&-edit";


    await axios.post(url, {}, {
        headers: { 'Authorization': authHeader }
    }).then(function (response) {
        data = new XMLParser().parseFromString(response.data);
        return true;
    }).catch(function (error) {
        alert(error);
        return false;
    });

}


export async function get(username, password, server, db, layout, query = null, script = null) {
    const authHeader = 'Basic ' + base64.encode(`${username}:${password}`);
    var XMLParser = require('react-xml-parser');
    let url = "https://" + server + "/fmi/xml/fmresultset.xml?-findall&-db=" + db + "&-lay=" + layout;

    if (query) {
        url = "https://" + server + "/fmi/xml/fmresultset.xml?-find&-db=" + db + "&-lay=" + layout + query;
    }
    console.log(url);
    let errorAuth = false;
    console.log(url);
    await axios.post(url, {}, {
        headers: { 'Authorization': authHeader }
    }).then(function (response) {

        data = new XMLParser().parseFromString(response.data);

        // console.log("Data");
        // console.log(data);
    }).catch(function (error) {
        console.log(error)
        // alert("No connexion!");
        errorAuth = true;
    });

    if (errorAuth) {
        return -1;
    }

    let fmResultSet = getFmResultSet(data);

    // console.log(fmResultSet);

    let error = getError(fmResultSet);
    // console.log("Error");
    // console.log(error);
    let records = getRecords(fmResultSet);

    let dataFormated = formatData(records);
    // console.log(dataFormated);
    return dataFormated;
}
