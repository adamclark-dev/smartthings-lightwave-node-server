var util = require('util');
var events = require('events');
var dgram = require('dgram');

/**
 * LightwaveRF API
 *
 * @param object config The config
 *
 * An instance of the LightwaveRF API
 */
function LightwaveRF(config) {
	events.EventEmitter.call(this);
	
	//Counter
	this.messageCounter = 0;
	
	//Config
	this.config = config;
	
	//Check config
	if (!this.config.ip) {
		throw new Error("The IP address must be specified in the config");
	}
	
	//Response listeners
	this.responseListeners = {};
	
	//Send Socket
	this.sendSocket = dgram.createSocket("udp4");
	
}
util.inherits(LightwaveRF, events.EventEmitter);

/**
 * Register this device with the Wi-Fi Link
 * 
 * @param Function callback The callback function
 * 
 * @return void
 */
LightwaveRF.prototype.register = function(callback) {
	this.sendUdp("!F*p", callback);
}

/**
 * Turn a device off
 * 
 * @param integer  roomId   The room ID
 * @param integer  deviceId The device ID
 * @param Function callback The callback for if there are any errors
 * 
 * @return void
 */
LightwaveRF.prototype.turnDeviceOff = function(roomId, deviceId, callback) {
	var state = "0";
	this.sendUdp("!R" + roomId + "D" + deviceId + "F" + state + "|\0", callback);
}

/**
 * Turn a device off
 * 
 * @param integer  roomId   The room ID
 * @param integer  deviceId The device ID
 * @param Function callback The callback for if there are any errors
 * 
 * @return void
 */
LightwaveRF.prototype.turnDeviceOn = function(roomId, deviceId, callback) {
	var state = "1";
	this.sendUdp("!R" + roomId + "D" + deviceId + "F" + state + "|\0", callback);
}

/**
 * Set the dim percentage of a device
 * 
 * @param integer  roomId        The room ID
 * @param integer  deviceId      The device ID
 * @param integer  dimPercentage The percentage to set the device dim
 * @param Function callback      The callback for if there are any errors
 * 
 * @return void
 */
LightwaveRF.prototype.setDeviceDim = function(roomId, deviceId, dimPercentage , callback) {
	var dimAmount = parseInt(dimPercentage * 0.32); //Dim is on a scale from 0 to 32
	this.sendUdp("!R" + roomId + "D" + deviceId + "FdP" + dimAmount + "|\0", callback);
}

/**
 * Get message code
 * 
 * @return string
 */
LightwaveRF.prototype.getMessageCode = function() {
	//Increment message counter
	this.messageCounter++;
	
	//Get 3 digit code from counter
	var code = this.messageCounter.toString();
	while (code.length < 3) {
		code = "0" + code;
	}
	
	//Return the code
	return code;
}

/**
 * Send a message over udp
 * 
 * @param string   message  The message to send
 * @param Function callback The callback for if there are any errors
 * 
 * @return void
 */
LightwaveRF.prototype.sendUdp = function(message, callback){
	//Add to message
	var code = this.getMessageCode();
	
	//Prepend code to message
	message = code + "," + message;
	
	//console.log("Sending message: " + message);
	
	//Create buffer from message
	var buffer = new Buffer(message);
	
	//Broadcast the message
	this.sendSocket.send(buffer, 0, buffer.length, 9760, this.config.ip);
	
	//Add listener
	if (callback) {
		this.responseListeners[parseInt(code).toString()] = {
			time: new Date().getTime(),
			listener: function(returnedCode, content) {
				callback(undefined, content);
			}
		}
	}

}


module.exports = LightwaveRF;