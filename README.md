# ethereum-logger-notifier
An app that leverages the BlockVigil API gateway to communicate with the Ethereum Blockchain and logs event updates locally while displaying a desktop notification aswell.  <br /> 
<hr />
There are two solidity contracts: myDemoContract and myAuditContract. <br /> 
BlockVigil API gateway is used to send state changing transactions to the former and log the details to the latter.  <br /> 
The BlockVigil API Gateway sends event updates to the webhook url which are then picked up by our local listener script.  <br /> 
Afterwards, the useful information from the data payload is written to a text file and a desktop notifcation is also fired.
