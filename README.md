# FitbitHRtoWS
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

## Prerequisites

+ Node.JS
+ npm
+ npx
+ @fitbit/sdk@4.1.0 (other sdks should work if you're porting to Versa 3 or whatnot)
+ @fitbit/sdk-cli (any version that supports your current sdk is fine)

## Setup Websocket

### Step 1

Download and Extract the source

### Step 2

Navigate to `ws/html` folder in the source file you just extracted. Edit with any text editor. Scroll to the only script defination in the file. Change the line that says `var socket = new WebSocket("ws://localhost:8080/")` to your socket address. (EX: address is 192.168.1.1:8080 then put `var socket = new WebSocket("ws://192.168.1.1:8080/")`) 

If you set a password on the server, be sure you change the `serverPassword` value as well.

Save file and navigate back to `ws/`

### Step 3

Open a command prompt (git or cmd is fine) and navigate to the ws folder in.

### Step 4

Install npm's

+ `npm i express`
+ `npm i http`
+ `npm i ws`

### Step 5

Open ws.js in a text editor and change any values you need to. You should only have to change the serverPassword, but not required if you're not going to open these ports to the internet.

Run the server by typing `node ws.js`

## Setup Fitbit App

### Step 1

Open to any directory (EX: E:/fitbitapp)

### Step 2

Open a command prompt (Cmder is recommended, but git and cmd should do fine) and navigate to that folder.
Run `npx create-fitbit-app [directory to store app (no spaces no caps) (EX: fitbitapp will be stored in E:/fitbitapp/fitbitapp)] --sdk-version 4.1.0` (Any other SDK should be fine, this was built with SDK 4.1)
Then wait for the questions to appear.

### Step 3

Fill in the following for these questions:

Q: What type of application should be created? (Use arrow keys)
A: app

Q: What should the name of this application be? (My Watch Face)
A: Input the name that you want to call the app

Q: Should this application contain a companion component? (Y/n)
A: n

Q: Which platforms should this application be built for? (Press <space> to select, <a> to toggle all, <i> to invert selection)
A: a (or you can select your device)
  
### Step 4

Copy all **folders** from `app/sdk[target sdk version]/` and paste them into the directory. **DO NOT COPY `package.json` YET!**

~~Navigate into `app/sdk[target version]/companion`, open `index.js` in any text editor and then change the `wsUri` (const) to the WebSocket address that the WebSocket is running on. (EX: address is 192.168.1.201:8080 `const wsUri = "ws://192.168.1.201:8080";`) Navigate back to `app/sdk[target version]/`~~ Values can now be changed through settings. See notes.

### Step 5

`cd [name of the directory created (EX: cd fitbitapp)`

Next open the `package.json` file in any text editor

**IMPORTANT!**
Be sure you copy your app uuid before doing this step!

Copy all the text from `app/sdk[target version]/package.json` and overwrite, then add your app uuid to the json.

### Step 6

`npx fitbit`

And you should be redirected to sign-in to fitbit developers. Go ahead and sign in with your fitbit account.

You should see `$fitbit` on the left side of the terminal. Turn on your phone, go to the fitbit app, go to your `Today` tab, select your profile in the top left, select the device you'll be porting to, go to Developer Menu, and turn on Developer bridge. **Make sure that all devices are on the same network!**

`$fitbit connect phone` This may take a couple tries, but then you should see your phone auto-connect.

Next, on your fitbit, navigate to Settings, then click `Developer Mode`. **Make sure the device is connected to the PC!*

`$fitbit connect device` This may also take a couple tries.

You should get both your Phone and Device connected. If so then it's time to build and install!

### Step 7

Build the app

`$fitbit build`

Install to the device

`$fitbit install`

The app should then launch on your device, and look for the socket server.
