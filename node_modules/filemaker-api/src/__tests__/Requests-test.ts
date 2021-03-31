import Client from '../index';
const client = new Client('vhmsoftdev.com', 'MapAssistance', () => 'Basic QWxhaW4gU2ltb25lYXU6NDI1MQ==')

it(`filemaker request`, async () => {

    /*
    await client.findall('Xojo_DOSSIERS')
        .then(resp => {
            const fields = resp.records.map(record => record.fields)
            console.log(fields)
        })
        */
});


it(`full text query`, async () => {

    await client.customQuery('Xojo_DOSSIERS', { "Defunt_Nom": ["Bara"] })
        .then(resp => {
            //const fields = resp.records.map(record => record.fields)
        })
});