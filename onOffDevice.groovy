/**
 *  Lightwave Lights
 *
 *  Copyright 2015 Adam Clark
 *  For any information or help please contact ad@mclark.co 
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
 
import java.security.MessageDigest
 
preferences {
    input("serverIP", "text", title: "Server IP Address", description: "IP Address of the Server")
    input("lightwaveIP", "text", title: "Lightwave IP Address", description: "IP Address of the Lightwave Hub")
	input("roomID", "text", title: "Room ID", description: "The room id")
    input("deviceID", "text", title: "Device ID", description: "The device id")
}
 
metadata {
	definition (name: "Lightwave Lights", namespace: "smartthings-users", author: "Adam Clark") {
		capability "Switch"
        command "register"
	}

	simulator {}

	tiles {
    
		standardTile("switch", "device.switch", width: 2, height: 2, canChangeIcon: true) {
			state "on", label:'on', action:"on", icon:"st.switches.switch.on", backgroundColor:"#79b821", nextState:"off"
            state "off", label:'off', action:"off", icon:"st.switches.switch.off", backgroundColor:"#ffffff", nextState:"on"
		}
        
        standardTile("register", "device.status", inactiveLabel:false, decoration:"flat") {
            state "default", label:"Register", icon:"http://www.mocet.com/pic/link-icon.png", action:"register"
        }
        
		main(["switch"])
		details (["switch","register"])
	}

}

// parse events into attributes
def parse(String description) {
	log.debug "Parsing '${description}'"
	// TODO: handle 'switch' attribute

}

// handle commands
def on() {
	apiGet('/off')
}

def off() {
	apiGet('/on')
}

def register() {
	apiGet('/register')
}

private apiGet(path) {

	log.debug settings.serverIP + ':8000'

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

    return new physicalgraph.device.HubAction(httpRequest)
}
