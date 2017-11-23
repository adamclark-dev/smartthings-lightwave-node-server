import java.security.MessageDigest
 
preferences {
    input("serverIP", "text", title: "Server IP Address", description: "IP Address of the Server")
    input("lightwaveIP", "text", title: "Lightwave IP Address", description: "IP Address of the Lightwave Hub")
    input("roomID", "text", title: "Room ID", description: "The room id")
    input("deviceID", "text", title: "Device ID", description: "The device id")
}

metadata {
    definition (name: "Lightwave Inline Relay Device", namespace: "smartthings-users", author: "Chris Lambourne") {
        capability "Switch"
        command "open"
        command "close"
        command "stop"
        command "position"
        command "setDelay"
        command "register"
    }

    simulator {}
       
    tiles(scale: 2) {
        multiAttributeTile(name:"switch", type: "lighting", width: 6, height: 4, canChangeIcon: true){
            tileAttribute ("device.switch", key: "PRIMARY_CONTROL") {
                attributeState "open", label:'${name}', action:"switch.open", icon:"https://png.icons8.com/curtain/dotty/80/000000", backgroundColor:"#79b821", nextState:"close"
                attributeState "close", label:'${name}', action:"switch.close", icon:"https://png.icons8.com/window-shade/dotty/80/000000", backgroundColor:"#ffffff", nextState:"Open"
                attributeState "stop", label:'${name}', action:"switch.stop", icon:"https://png.icons8.com/blinds/dotty/80/000000", backgroundColor:"#ffffff", nextState:"Open"
            }
        }
        
        standardTile("open", "device.status", inactiveLabel:false, decoration:"flat",height: 2, width: 2) {
            state "default", label:"Open", icon:"https://png.icons8.com/curtain/dotty/80/000000", action:"open"
        }
        
        standardTile("close", "device.status", inactiveLabel:false, decoration:"flat",height: 2, width: 2) {
            state "default", label:"Close", icon:"https://png.icons8.com/window-shade/dotty/80/000000", action:"close"
        }

        standardTile("stop", "device.status", inactiveLabel:false, decoration:"flat",height: 2, width: 2) {
            state "default", label:"Stop", icon:"https://png.icons8.com/blinds/dotty/80/000000", action:"stop"
        }

        standardTile("position", "device.status", inactiveLabel:false, decoration:"flat",height: 2, width: 2) {
            state "default", label:"Position", icon:"https://png.icons8.com/stopwatch/Dusk_Wired/50/333333", action:"position"
        }
        
        controlTile("delaySlider", "device.delay", "slider", decoration: "flat", height: 2, width: 2, inactiveLabel: false, range: "(0..30)") {
            state "default", label:"Delay", action:"setDelay"
        }
        
        standardTile("register", "device.status", inactiveLabel:false, decoration:"flat",height: 2, width: 2) {
            state "default", label:"Register", icon:"https://png.icons8.com/add-link-filled/ios7/80/000000", action:"register"
        }

        main "switch"
        details([
            "switch", 
            "open", 
            "close", 
            "stop", 
            "position", 
            "delaySlider", 
            "register"
        ])
    }

}

// Sets the delay variable
def initialize() {
    state.delay = 0
}

// parse events into attributes
def parse(String description) {
    log.debug "Parsing '${description}'"
}

// Opens the relay
def open() {
    sendEvent(name: "switch", value: 'open')
    apiGet('/open')
}

// Closes the relay
def close() {
    sendEvent(name: "switch", value: 'close')
    apiGet('/close')
}

// Stops the relay
def stop() {
    sendEvent(name: "switch", value: 'stop')
    apiGet('/stop')
}

// Opens then stops after delay variable
def position() {   
   delayBetween([
     open(),
     stop()
     ], state.delay.toInteger() * 1000)
}

// Sets the delay from the slide value
def setDelay(value) {
	state.delay = value
	log.debug "setting value to $value"
	sendEvent(name:"delay", value:value)
}

// Registers the device
def register() {
    apiGet('/register')
}

// Sends the HTTP request
private apiGet(path) {

    def httpRequest = [
        method:     'GET',
        path:       path,
        headers:    [
            HOST:       settings.serverIP + ':8000',
            Accept:     "*/*"
        ],
        query: [
            ip: settings.lightwaveIP,
            room: settings.roomID, 
            device: settings.deviceID
        ]
    ]

    log.debug 'HTTP Request: ' + httpRequest.query

    return new physicalgraph.device.HubAction(httpRequest)
}
