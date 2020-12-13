var app = require('express')();
var http = require('http').createServer(app);
var WebSocket = require('ws');
const password = "CHANGEME";

if(password == "CHANGEME"){
  console.warn("WARN: password has not been changed, please make sure NOT to open the port of the WS!")
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html' +'/index.html');
});

http.listen(8000, () => {
    console.log('http server listening on *:8000');
});
var wss = new WebSocket.Server({ port: 8080 })

var fbConnected = false;
var fbsocket = null;
var fbPassword = ""
var hr = "0";

wss.on('connection', function connection(ws){
  ws.on('close', function disconnect(){
    if(ws == fbsocket){
      fbConnected = false;
      fbsocket = null;
      fbPassword = "";
      hr = "0";
    }
  })

  ws.on('message', function incoming(data){
    var jsonObject = JSON.parse(data);
    var message = jsonObject.message;
    switch(message){
      case "requestConnectData":
        var fbcLocal = "no";
        if(fbConnected){ fbcLocal = "yes"; }
        var sendmessage = {"message": "sendConnectData", "fbConnected": fbcLocal, "hr": hr}
        var json = JSON.stringify(sendmessage);
        ws.send(json)
        break;
      case "addFitbit":
        if(!fbConnected){
          var fbpass = jsonObject.fitbitPassword;
          var fbspass = jsonObject.serverPassword;
          if(fbspass == password){
            fbPassword = fbpass;
            fbConnected = true;
            // dont forget to tell client that fitbit is connected
            var sendmessage = {"message": "sendConnectData", "fbConnected": "yes", "hr": hr}
            var json = JSON.stringify(sendmessage);
            ws.send(json)
            fbsocket = ws;
          }
          else{
            ws.close();
          }
        }
        else{
          ws.close();
        }
        break;
      case "sendhr":
        var inputpass = jsonObject.fitbitPassword
        var hrL = jsonObject.hr
        if(fbConnected){
          if(fbPassword == inputpass){
            hr = hrL;
            wss.clients.forEach(function theclients(client){
              var sendmessage = {"message": "sendhr", "hr": hr}
              var json = JSON.stringify(sendmessage);
              ws.send(json)
            })
          }
        }
        break;
    }
  })
})