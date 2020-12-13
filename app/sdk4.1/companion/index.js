const wsUri = "ws://192.168.1.1:8080";
const websocket = new WebSocket(wsUri);
const serverPassword = "CHANGEME";
const generatedPasswordLength = 50

// to prevent randos from disconnecting your fitbit, the fitbit will create a password
function generatePassword(length) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789;:-=",
    retVal = "";
for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
}
return retVal;
}
var password = generatePassword(generatedPasswordLength)

// web socket value
var connected = false;
var hr = "69";

// setup messaging for transferring values to companion
import * as messaging from "messaging";
messaging.peerSocket.onmessage = evt => {
    var jsonObject = JSON.parse(evt.data);
    var message = jsonObject.message
    switch(message){
        case "sethr":
            var hrL = jsonObject.hr;
            hr = hrL;
            break;
        default:
            console.log("Unidentified Message: " + message)
            break;
    }
}

// web socket stuff
websocket.addEventListener("open", onOpen);
websocket.addEventListener("close", onClose);

function onOpen(evt) {
    console.log("CONNECTED")
    var sendmessage = {"message": "addFitbit", "serverPassword": serverPassword, "fitbitPassword": password}
    var json = JSON.stringify(sendmessage);
    websocket.send(json)
    connected = true;

    // check peersocket connection
    if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
        var object = {"message": "changeSLT", "ConnectionStatus": "open"}
        var message = JSON.stringify(object)
        messaging.peerSocket.send(message)
    }
}

function onClose() {
    console.log("DISCONNECTED")
    var sendmessage = {"message": "removeFitbit", "fitbitPassword": password}
    var json = JSON.stringify(sendmessage);
    websocket.send(json)
    connected = false;

    // check peersocket connection
    if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
        var object = {"message": "changeSLT", "ConnectionStatus": "closed"}
        var message = JSON.stringify(object)
        messaging.peerSocket.send(message)
    }
}

// the interval
setInterval(function(){
    // check connection to the socket
    if(connected){
      // we have a connection
      // send the heartrate
      var sendmessage = {"message": "sendhr", "fitbitPassword": password, "hr": hr}
      var json = JSON.stringify(sendmessage);
      websocket.send(json)
    }
  }, 1000);