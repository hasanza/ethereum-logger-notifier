//we will be getting notifications from EV via Ngrok tunnel
//ngrok will connect to our localhost .
const express = require("express");
const bodyParser = require("body-parser");
const ngrok = require("ngrok");
const fs = require("fs");
const notifier = require("node-notifier");
const path = require("path");

const app = express();

const PORT = 3000;

app.use(bodyParser.json());

//when this endpoint is hit on the web, a new file is created with some data written to it
//Mission: write the received data payload to a file
//this is our app's post route i.e. it is accepting data here in res object
app.post("/test", (req, res) => {
  console.log(req.body);
});

app.post("/", (req, res) => {
  var body = req.body;

  (async function () {
    console.log("The request body brings this data: ", body);
    var incrementedBy = await body.event_data.incrementedBy;
    var incrementValue = await body.event_data.incrementedValue;
    var myData = `Altert: Someone just incremented the myDemoContract by ${incrementValue}
    `;
    var myDataDetailed = `The address ${incrementedBy} just incremented myDemoContract by ${incrementValue} at ${new Date()}`;
    //sending notification
    console.log("notifying now...");
    notifier.notify({
      title: "BlockVigil Alert",
      message: myData,
      icon: path.join(__dirname, "ev.webp"),
    });

    fs.appendFile("txn_log.txt", `${myDataDetailed}`, (err) => {
      return err ? res.status(500).end : res.status(200).end;
    });
  })();
  res.status(200).end();
});

app.listen(PORT, console.log(`Local server running on port ${PORT}`), () => {
  (async function () {
    const publicEndpoint = await ngrok.connect(PORT);
    console.log(
      `Publically accessible tunnel to localhost:${PORT} is available on ${publicEndpoint}`
    );
  })();
});
