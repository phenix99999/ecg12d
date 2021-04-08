
import axios from 'axios';

import { add, execScript } from '../utils/connectorFileMaker';


const GIVEX_HOST = 'https://dc-ca1.givex.com:50104'
let fmServer = "cpfilemaker.com";
let fmDatabase = "Coffrets_Prestige";

export async function authentificationGX(username, password) {
    let data = { "id": "", "params": ["fr", "9999", username, password, "", ""], "jsonrpc": "2.0", "method": "dc_901" }
    let response = await axios.post(GIVEX_HOST, data)
    let errorCode = response.data.result[1]

    if (errorCode === "1") {
        return false;
    }
    console.log(response);
    return true;
}

//GIVEX
export async function givexEncaissement(card, amount, username, password) {
    let data = { "id": card, "params": ["fr", "9999", username, password, card, amount], "jsonrpc": "2.0", "method": "dc_901" }
    console.log("DATA PAS BON ");
    console.log(data);
    let response = await axios.post(GIVEX_HOST, data)
    console.log(response);
    let result = response.data.result
    let code = result[1]
    if (code !== '0') {
        let message = result[2]
        let error = new Error(message)
        let log = await eliotLog(card, username, 'Givex encaissement: La carte n\'a pas été encaissée. Message erreur: ' + message);
        let messageClient = "Encaissement: La carte n\'a pas été encaissée.";
        return { success: false, error: error, message: messageClient }
    }

    let balance = Number(result[3])
    let message = 'Givex encaissement: ' + amount.toString() + ' a été encaissé. Balance: ' + balance.toString()
    let log = await eliotLog(card, username, message)
    return { success: true, balance: balance }
}


export async function eliotLog(cardGivex, username, message) {

    await add("Alain Simoneau", "4251", fmServer, fmDatabase, "LOG_APPLICATION", "&Numero=" + cardGivex + "&username=" + username + "&Message=" + message);

    // return this.fmClient.query('LOG_APPLICATION', { 'Numero': cardGivex, 'username': username, 'Message': message }, 'new')
}



export async function eliotActivateCard(cardFM, cardGivex, facture, code_securite, no_employee) {

    let scriptParams = [cardGivex, code_securite, no_employee, facture]


    const fmResult = await execScript("Alain Simoneau", "4251", fmServer, fmDatabase, 'api_mobile_GIVEX_ACTIVATION', "&Numero_final=" + cardFM, "api_mobile_Givex_Activation", scriptParams.join("\n"));
    console.log(fmResult);

    let givexJSON = fmResult[0]["Givex_result"];
    // console.log(giveXJSON);
    let response = JSON.parse(givexJSON)
    //file maker error
    if ("error" in response) {
        if (response['error'] === 'code_securite') {
            return { success: false, error: "codeSecurite" }
        }

        if (response['error'] === 'code_employee') {
            return { success: false, error: "nipEmploye" }
        }
    }



    let givexCode = response.result[1]
    let message = response.result[2]

    if (givexCode !== '0') {
        let log = await eliotLog(cardGivex, '', 'Givex activation: Erreur d\'activation. Message erreur: ' + message);
        return { success: false, error: message }
    }
    let log = await eliotLog(cardGivex, '', 'Givex activation: La carte a été activée.');

    return { success: true }
}
