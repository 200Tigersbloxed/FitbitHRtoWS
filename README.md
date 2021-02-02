# FitbitHRtoWS
![fitbithrtowslogo](https://i.imgur.com/PYGgIym.png)

Send your Fitbit's Heart Rate data to a Websocket

## IMPORTANT
Setting up the WebSocket and Fitbit app requires **some** command-line experience and basic coding experience. If you can't set this up on your own, ask for help before you break something.

## Support
Below is a table of device support

SDK | Device | Tested | Working
--- | --- | --- | ---
SDK4 | Fitbit Ionic | ❌ | `-`
SDK4 | Fitbit Versa | ❌ | `-`
SDK4 | Fitbit Versa Lite | ❌ | `-`
SDK4 | Fitbit Versa 2 | ✔️ | ✔️ *(SDK 4.1.0)*
SDK5 | Fitbit Versa 3 | ❌ | `-`
SDK5 | Fitbit Sense | ❌ | `-`

*Just because a device isn't tested, doesn't mean it won't work. Feel free to test and submit a PR if you've confirmed a device to work.*

## Notes

+ ~~Battery life will decrease significantly while using this. On a Versa 2, you should get around 45min-1hr.~~ Fixed in v1.1.0 Battery life on a Versa 2 only lost ~5% after 30min. of use.
+ While you should be able to open the port to the world for everyone to see, it is not recommended (at least without wss/https). You should only open the port locally.
+ HTTPS/WSS support is untested and may or may not work. You should only use HTTPS and WSS if opening the port globally.
+ Do not ask for support in the issues thread. Report bugs or code not working on an SDK (for example).
+ ~~Device and Phone must be connected to cli at all times to keep connection to WebSocket.~~ Once the app is sideloaded to the fitbit watch, the CLI does not have to be connected to the phone or device, only the Fitbit app and mobile app have to be open.
+ Don't forget to change your buildTargets in your `package.json` file. https://dev.fitbit.com/build/guides/multiple-devices/
+ Default ports are `8000` for the web server and `8080` for the websocket.
+ Settings can be found by going to `Today>Account>[Your Device]>Developer Menu>[The Sideloaded App]>Settings`
+ Battery will decrease significantly when the watch is connected to the CLI. (Connected to Debugger) [After sideloading, you should only need to have the phone app open, and the watch connected to your phone over bluetooth]

## Setup

For info on how to setup, please see the documentation at:
https://docs.fortnite.lol/en/fitbithrtows
