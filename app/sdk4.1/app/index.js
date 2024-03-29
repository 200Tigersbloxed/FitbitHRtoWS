// setup the hrm
import { HeartRateSensor } from "heart-rate";
const hrm = new HeartRateSensor();

// Start Stop
var StartedInterval = false
var SendData = false;

// UI
let document = require("document");

let hrmData = document.getElementById("hrm-data");
let statusLabel = document.getElementById("connection-status");
let pstBCG = document.getElementsByClassName("background");

let psc_sep = document.getElementById("psc-sep");
let psc = document.getElementById("psc");

// setup messaging for transferring values to companion
import * as messaging from "messaging";
messaging.peerSocket.onmessage = evt => {
  var jsonObject = JSON.parse(evt.data);
  var message = jsonObject.message
  switch(message){
    case "changeSLT":
      if(jsonObject.ConnectionStatus == "open"){
        hrm.start();
        setInterval(function(){}, 1000)
        SendData = true;
        statusLabel.text = "Connected"
      }
      else if(jsonObject.ConnectionStatus == "closed"){
        hrm.stop();
        SendData = false;
        statusLabel.text = "Not Connected"
      }
      else{
        SendData = false;
        statusLabel.text = "Please Wait..."
      }
      break;
    case "sendPST":
      console.log("sendPST: " + jsonObject.bool)
      if(jsonObject.bool){
        for(var counter = 0; counter < pstBCG.length; counter++){
          pstBCG[counter].style.fill = "purple";
        }
        psc_sep.text = "-----";
        psc.text = jsonObject.code;
      }
      else{
        for(var counter = 0; counter < pstBCG.length; counter++){
          pstBCG[counter].style.fill = "blue";
        }
        psc_sep.text = "";
        psc.text = "";
      }
      break;
    default:
      console.log("Unidentified Message: " + message)
      break;
  }
}

// remove screen timeout
// Disable app timeout
import { me } from "appbit";

if (me.appTimeoutEnabled) {
 console.log("Timeout is enabled");
}

me.appTimeoutEnabled = false; // Disable timeout

if (!me.appTimeoutEnabled) {
  console.log("Timeout is disabled");
}

function SendHRData(hr){
  // send data to our peer socket
  if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
    var object = {"message": "sethr", "hr": hr}
    var message = JSON.stringify(object)
    messaging.peerSocket.send(message)
  }
}

// setup local values
hrmData.text = "---";
var lasthr = "0";
var hr = "0";

var setupInterval = setInterval(function(){
  StartedInterval = true;
  if(HeartRateSensor && SendData){
    var data = {
      hrm: {
        heartRate: hrm.heartRate ? hrm.heartRate : 0
      }
    }
    lasthr = hr;
    hr = JSON.stringify(data.hrm.heartRate);
  }
  else{
    hr = "---";
  }
  // set the text
  hrmData.text = hr;
  if(lasthr !== hr){
    // send the new HR
    SendHRData(hr);
  }
}, 10)