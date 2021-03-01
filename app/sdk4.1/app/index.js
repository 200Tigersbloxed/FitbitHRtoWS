// setup the hrm
import { HeartRateSensor } from "heart-rate";
const hrm = new HeartRateSensor();

// Start Stop
var StartedInterval = false
var SendData = false;

// Interval
var waitInt = "no";

// UI
let document = require("document");

let hrmData = document.getElementById("hrm-data");
let statusLabel = document.getElementById("connection-status");

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
    case "sendInterval":
      waitInt = Number(jsonObject.int)
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

// setup local values
hrmData.text = "---";
var hr = "0";

var setupInterval = setInterval(function(){
  if(waitInt != "no" && !StartedInterval){
    setInterval(async function(){
      clearInterval(setupInterval);
      StartedInterval = true;
      if(HeartRateSensor && SendData){
        var data = {
          hrm: {
            heartRate: hrm.heartRate ? hrm.heartRate : 0
          }
        }
        hr = JSON.stringify(data.hrm.heartRate);
      }
      else{
        hr = "---";
      }
      // set the text
      hrmData.text = hr;
      // send data to our peer socket
      if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
        var object = {"message": "sethr", "hr": hr}
        var message = JSON.stringify(object)
        messaging.peerSocket.send(message)
      }
    }, waitInt)
  }
}, 1000)