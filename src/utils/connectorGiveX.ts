
import axios from 'axios';



const GIVEX_HOST = 'https://dc-ca1.givex.com:50104'


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
