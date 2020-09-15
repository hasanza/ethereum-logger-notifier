const axios = require('axios');
const WebSocket = require('ws');

const config = {
    //url of the api gateway we are using to deploy to Ethereum
    apiPrefix: 'https://beta-api.ethvigil.com/v0.1/contract/',
    //our secret key that acts like a license key to use the api gateway service
    apiKey: '<API_KEY>',
    //address of the contract changes to which we are monitoring
    myDemoContractAddress: '0x299d933299118b4e78eb495026607965bd3676ce',
    //addr of the contract that logs changes caused by an address to the above contract
    auditContractAddress: '0x839ebcc7287c76917c724292d3fe8e32517c3b50',
    //websocket sercure url: This is so we can open a connection to EV from our listener 
    wsUrl: 'wss://beta.ethvigil.com/ws'
}

//check if config fields are present and valid; thrown error otherwise
//is api key, demo contract and audit contract present 
if(!config.apiKey || !config.myDemoContractAddress || !config.auditContractAddress) {
    console.error('Check config object for empty fields');
    process.exit(0);
}

//to store websocket session id
var wsSessionID;
// bool for got event or not
var receivedEvent;

//constructing a url that locates democontract and inserts the apikey into it
//axios.create() creates a new Axios instance with provided default values
//this url will be the default for all axios requests, there will be a 5sec timeout after all requests 
//X-API-KEY header will have the given value.
const myDemoInstance = axios.create({
    //the EV gateway url of our deployed demo contract
    baseURL: config.apiPrefix + config.myDemoContractAddress,
    timeout: 5000,
    headers: {'X-API-KEY': config.apiKey}
});

const auditInstance = axios.create({
    baseURL: config.apiPrefix + config.auditContractAddress,
    timeout: 5000,
    headers: {'X-API-KEY': config.apiKey}
});

//instantiating a WebSocket channel; passing it the url of the EV WebSocket
//EV will expect WS connections at the url
const ws = new WebSocket(config.wsUrl);

//.on signigies an event handler, a custom event in this case
//upon open event i.e. websocket connection opening, run open() function
ws.on('open', function open() {
    //send, as string, this JSON object
    //we issue register command to EV along with our api key, now EV
    //knows that 
    ws.send(JSON.stringify({
            'command': 'register',
            'key': config.apiKey
    }));
});

ws.on('message', function incoming(data) {
    //receiving data from EV as JSON string, converting to JSON
    data = JSON.parse(data);
    console.log('Received data from EV via WebSocket connection');
    //i.e. if register command is not acknowledged
    if (data.command == 'register:nack') {
        console.error('Bad apiKey sent to EV gateway');
    }
    if (data.command == 'register:ack') {
        wsSessionID = data.sessionID;
        console.log('authenticated with WebSocket');
        console.log('writing to demo contract...');
        myDemoInstance.post('/setContractInformation', {
            incrValue: 1,
            _note: `Hey, this is pretty good... ${new Date()}`
        }) //we call the post function of the contract to create a new ContractInfo object
        //this post call returns a promise
        .then((response) => {
            console.log('response after post call: ', response.data);
            if (!response.data.success){
                console.log('post call not successful...')
                process.exit(0);
            }
        })
        .catch ((err) => {
            if (err.response.data) {
                console.log(err.response.data);
                if(err.response.data.error == 'unknown contract') {
                    console.error('Wrong demo contract address in config object!')
                }
            } else {
                console.log(error.response);
            }
            process.exit(0);
        });
    }
    if (data.type == 'event' && data.event_name == 'ContractIncremented'){
        receivedEvent = true;
        console.log('Received setContractInformation event confirmation', data);
        console.log('Writing to audit log contract...');
        auditInstance.post('/addAuditLog', {
            _newNote: data.event_data.newNote,
			_changedBy: data.event_data.incrementedBy,
			_incrementValue: data.event_data.incrementedValue,
            _timestamp: data.ctime,
            _logId: 4
        })
        .then(response => {
            console.log(response.data);
            if (response.data.success) {
                console.log('Log created successfully!')
            }
            process.exit(0);
        })
        .catch(err => {
            if (err.response.data) {
                console.log(err.response.data);
                if (err.response.data.error == 'unknown contract') {
                    console.log('config object has incorrect address of the AuditLog contract!');
                }
                if (err.response.data.error == 'Transaction execution will fail with supplied arguments') {
                    console.log('you forgot to add msg.sender to whitelist!');
                }
            } else {
                console.log(error.response);
            }
            process.exit(0);
        });
    }
});

//on close event, the ws has been closed by server
ws.on('close', function close() {
    if (receivedEvent) {
        console.log('WebSocket disconnected');
    } else {
        console.error('WS disconnected before we could receive an event - this should not have happened! Reach out to hello@blockvigil.com.');
    }
});

function heartbeat() {
    //Send to EV via the websocket a json object every 30 sec as a hearbeat
    ws.send(JSON.stringify({
        command: 'heartbeat',
        sessionID: wsSessionID  
    }));
    //run heartbeat func every 30 sec.  
    setTimeout(heartbeat, 30000);
}

/*This file does the following:
1. setup a config object containing the central information.
2. try Establishing connection with EV via its ws url and register it w/ our apikey
3. make a post request to create a new Contract information instance
*/
