var app = require('express')();
var http = require('http').createServer(app);
const { Console } = require('console');
var fs = require('fs');
var WebSocket = require('ws');
var password = "CHANGEME";

var config;

module.exports = function(){
  fs.readFile('config.json', 'utf8', function(err, data){
    if(err){console.log("Error Loading Config: " + err.ToString())}
    config = JSON.parse(data);
  });
  
  console.log("Server Starting in 5 Seconds...");
  
  setTimeout(function(){
    password = config.serverPassword;
    if(password == "CHANGEME"){
      console.warn("WARN: password has not been changed, please make sure NOT to open the port of the WS!")
    }
  
    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/html' +'/index.html');
    });
  
    http.listen(config.httpport, () => {
        console.log('Http server listening on *:' + config.httpport);
    });
    var wss = new WebSocket.Server({ port: config.wsport })
    console.log("WebSocket Server running on *:" + config.wsport);
  
    var fbPinged = true;
    var fbConnected = false;
    var fbsocket = null;
    var fbPassword = ""
    var hr = "---";


    function heartbeat(){
      fbPinged = true;
    }

    const interval = setInterval(function ping(){
      if(fbsocket !== null){
        if(fbPinged === false) return fbsocket.terminate();

        fbPinged = false;
        fbsocket.ping();
      }
    }, 30000)
  
    wss.on('connection', function connection(ws){
      ws.on('pong', heartbeat)
      console.log("Device connected!")
      ws.on('close', function disconnect(){
        if(ws == fbsocket && fbsocket.readyState !== 1){
          fbConnected = false;
          fbsocket = null;
          fbPassword = "";
          hr = "---";
          console.log("Fitbit closed!")
        }
        else{
          console.log("Device closed!")
        }
        clearInterval(interval);
      })
    
      ws.on('message', function incoming(data){
        var failedToParse = true;
        try{
          var jsonObject = JSON.parse(data);
          failedToParse = false;
        }
        catch{
          failedToParse = true;
        }
        
        if(!failedToParse){
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
                  console.log("Fitbit Device Added!")
                }
                else{
                  console.log("Password is incorrect! fbpass = " + fbpass + ", fbspass = " + fbspass)
                  ws.close();
                }
              }
              else{
                console.log("Fitbit is already Connected!")
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
        }
        else{
          // client can't do parse or stringify
          switch(data){
            case "getHR":
              ws.send(hr);
              break;
            case "checkFitbitConnection":
              if(fbConnected){
                ws.send("yes");
              }
              else{
                ws.send("no");
              }
            default:
              console.log("Unknown message: " + data)
              break
          }
        }
      })
    })
  }, 5000)
}