// import settings
import { settingsStorage } from "settings";

var wsuris = JSON.parse(settingsStorage.getItem("wsUriSettings"))
var sps = JSON.parse(settingsStorage.getItem("serverPassSettings"))
var ps = JSON.parse(settingsStorage.getItem("PublicServer"))
var psc = JSON.parse(settingsStorage.getItem("PublicServerCode"))
var pscn = "";
try{
  pscn = psc.name;
}
catch{
  ps = false; 
  pscn = "";
}
var wsUri = null;
try{wsUri = wsuris.name;}catch{}
var websocket = null;
if(ps){websocket = new WebSocket("wss://fitbit.fortnite.lol/?code=" + psc.name);}
else{websocket = new WebSocket(wsUri);}
var serverPassword = null;
try{serverPassword = sps.name;}catch{}
const generatedPasswordLength = 50;

// to prevent randos from disconnecting your fitbit, the fitbit will create a password
// this only works well over WSS and HTTPS
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
var lasthr = "---";
var hr = "---";

// setup messaging for transferring values to companion
import * as messaging from "messaging";
messaging.peerSocket.onmessage = evt => {
    var jsonObject = JSON.parse(evt.data);
    var message = jsonObject.message
    switch(message){
        case "sethr":
            var hrL = jsonObject.hr;
            lasthr = hr;
            hr = hrL;
            break;
        default:
            console.log("Unidentified Message: " + message)
            break;
    }
}

if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
    var object2 = {"message": "sendPST", "bool": ps, "code": pscn}
    var message2 = JSON.stringify(object2)
    messaging.peerSocket.send(message2)
}
else{
    var theintp2 = setInterval(function(){
        if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
            var object2 = {"message": "sendPST", "bool": ps, "code": pscn}
            var message2 = JSON.stringify(object2)
            messaging.peerSocket.send(message2)
            clearInterval(theintp2)
        }
    }, 1000)
}

websocket.addEventListener("open", onOpen);
websocket.addEventListener("close", onClose);
websocket.addEventListener("ping", heartbeat);

function onOpen(evt) {
    console.log("CONNECTED")
    heartbeat();
    var sendmessage = {"message": "addFitbit", "serverPassword": serverPassword, "fitbitPassword": password, "code": pscn}
    var json = JSON.stringify(sendmessage);
    websocket.send(json)
    connected = true;

    // check peersocket connection
    if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
        var object = {"message": "changeSLT", "ConnectionStatus": "open"}
        var message = JSON.stringify(object)
        messaging.peerSocket.send(message)
    }
    else{
        var theint = setInterval(function(){
            if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
                var object = {"message": "changeSLT", "ConnectionStatus": "open"}
                var message = JSON.stringify(object)
                messaging.peerSocket.send(message)
                clearInterval(theint)
            }
        }, 10)
    }
}

function onClose() {
    console.log("DISCONNECTED")
    var sendmessage = {"message": "removeFitbit", "fitbitPassword": password, "code": pscn}
    var json = JSON.stringify(sendmessage);
    websocket.send(json)
    connected = false;

    // check peersocket connection
    if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
        var object = {"message": "changeSLT", "ConnectionStatus": "closed"}
        var message = JSON.stringify(object)
        messaging.peerSocket.send(message)
    }
    else{
        var theint = setInterval(function(){
            if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
                var object = {"message": "changeSLT", "ConnectionStatus": "closed"}
                var message = JSON.stringify(object)
                messaging.peerSocket.send(message)
                clearInterval(theint)
            }
        }, 10)
    }
}

var pingTimeout;

function heartbeat() {
  clearTimeout(pingTimeout);

  // Use `WebSocket#terminate()`, which immediately destroys the connection,
  // instead of `WebSocket#close()`, which waits for the close timer.
  // Delay should be equal to the interval at which your server
  // sends out pings plus a conservative assumption of the latency.
  pingTimeout = setTimeout(() => {
    if(!connected){
      websocket.terminate();
    }
  }, 30000 + 5000);
}

var loop = 0;

// the interval
setInterval(async function(){
    // check connection to the socket
    if(connected){
      // we have a connection
      loop = loop + 10;
      if(hr !== lasthr || loop >= 10000){
        // The HR changed or we need to send a ping, we can send the data
        var sendmessage = {"message": "sendhr", "fitbitPassword": password, "hr": hr, "code": pscn}
        var json = JSON.stringify(sendmessage);
        websocket.send(json)
        if(hr !== lasthr){
          console.log("Sent HR to server! HR: " + hr + " LastHR: " + lasthr)
        }
        if(loop >= 10000){
          console.log("Sent Ping message!")
          loop = 0;
        }
        lasthr = hr
      }
    }
  else{loop = 0;}
}, 10);