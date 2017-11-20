import java.security.MessageDigest
 
preferences {
    input("serverIP", "text", title: "Server IP")
    input("serverPort", "text", title: "Server Port")
    input("lightwaveIP", "text", title: "Lightwave IP")
    input("roomID", "text", title: "Room ID")
    input("deviceID", "text", title: "Device ID")
}
 
metadata {
    definition (name: "Lightwave Inline Relay Device", namespace: "smartthings-users", author: "Chris Lambourne") {
        capability "Switch"
        command "register"
    }

    simulator {}
       
    tiles(scale: 2) {
        multiAttributeTile(name:"switch", type: "lighting", width: 6, height: 4, canChangeIcon: true){
            tileAttribute ("device.switch", key: "PRIMARY_CONTROL") {
                attributeState "open", label:'${name}', action:"open", icon:"https://png.icons8.com/curtain/dotty/80/000000", backgroundColor:"#79b821", nextState:"close"
                attributeState "close", label:'${name}', action:"close", icon:"https://png.icons8.com/window-shade/dotty/80/000000", backgroundColor:"#ffffff", nextState:"Open"
                attributeState "stop", label:'${name}', action:"stop", icon:"https://png.icons8.com/blinds/dotty/80/000000", backgroundColor:"#ffffff", nextState:"Open"
            }
        }
        
        standardTile("open", "device.status", inactiveLabel:false, decoration:"flat",height: 2, width: 3) {
            state "default", label:"Open", icon:"https://png.icons8.com/curtain/dotty/80/000000", action:"open"
        }
        
        standardTile("close", "device.status", inactiveLabel:false, decoration:"flat",height: 2, width: 3) {
            state "default", label:"Close", icon:"https://png.icons8.com/window-shade/dotty/80/000000", action:"close"
        }

        standardTile("stop", "device.status", inactiveLabel:false, decoration:"flat",height: 2, width: 3) {
            state "default", label:"Stop", icon:"https://png.icons8.com/blinds/dotty/80/000000", action:"stop"
        }
        
        standardTile("register", "device.status", inactiveLabel:false, decoration:"flat",height: 2, width: 3) {
            state "default", label:"Register", icon:"https://png.icons8.com/add-link-filled/ios7/80/000000", action:"register"
        }

        main "switch"
        details(["switch", "open", "close", "stop", "register"])
    }

}

// parse events into attributes
def parse(String description) {
    log.debug "Parsing '${description}'"
    // TODO: handle 'switch' attribute

}

// handle commands
def open() {
    sendEvent(name: "switch", value: 'on')
    apiGet('/open', 0)
}

def close() {
    sendEvent(name: "switch", value: 'off')
    apiGet('/close', 0)
}

def stop() {
    sendEvent(name: "switch", value: 'stop')
    apiGet('/stop', 0)
}

def register() {
    apiGet('/register', 0)
}

private apiGet(path, level) {

    log.debug settings.serverIP + ':' + serverPort

    def httpRequest = [
        method:     'GET',
        path:       path,
        headers:    [
            HOST:       settings.serverIP + ':' + serverPort,
            Accept:     "*/*"
        ],
        query: [
            ip: settings.lightwaveIP,
            room: settings.roomID, 
            device: settings.deviceID
        ]
    ]

    log.debug httpRequest.query

    return new physicalgraph.device.HubAction(httpRequest)
}