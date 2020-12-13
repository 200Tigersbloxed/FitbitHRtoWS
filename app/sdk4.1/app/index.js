// setup the hrm
import { HeartRateSensor } from "heart-rate";
const hrm = new HeartRateSensor();
hrm.start();

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
        statusLabel.text = "Connected"
      }
      else if(jsonObject.ConnectionStatus == "closed"){
        statusLabel.text = "Not Connected"
      }
      else{
        statusLabel.text = "Please Wait..."
      }
      break;
    default:
      console.log("Unidentified Message: " + message)
      break;
  }
}

hrmData.text = "--";
var hr = "0";

setInterval(function(){
  if(HeartRateSensor){
    var data = {
      hrm: {
        heartRate: hrm.heartRate ? hrm.heartRate : 0
      }
    }
    hr = JSON.stringify(data.hrm.heartRate);
  }
  else{
    hr = "--";
  }
  // set the text
  hrmData.text = hr;
  // send data to our peer socket
  if(messaging.peerSocket.readyState === messaging.peerSocket.OPEN){
    var object = {"message": "sethr", "hr": hr}
    var message = JSON.stringify(object)
    messaging.peerSocket.send(message)
  }
}, 1000)