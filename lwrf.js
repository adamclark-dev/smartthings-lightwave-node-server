var util = require('util');
var events = require('events');
var dgram = require('dgram');

var stateTimer = [];

/**
 * LightwaveRF API
 *
 * @param object config The config
 *
 * An instance of the LightwaveRF API
 */
function LightwaveRF(callback) {
    var config = {};

    if (!(this instanceof LightwaveRF))  {
        return new LightwaveRF(config);
    }
    this.timeout = config.timeout || 1000;
    this.queue = [];
    this.ready = true;

    this.devices = [];

    events.EventEmitter.call(this);

    //Counter
    this.messageCounter = 0;

    //Config
    this.config = config;

    //Response listeners
    this.responseListeners = {};

    //Send Socket
    this.sendSocket = dgram.createSocket("udp4");

    //Receive socket
    this.receiveSocket = dgram.createSocket("udp4");

    //Receive message
    this.receiveSocket.on("message", function (message, rinfo) {

        //Check this came from the lightwave unit
        if (rinfo.address !== this.config.ip) {
            //Came from wrong ip
            return false;
        }

        //Message
        message = message.toString("utf8");

        //Split off the code for the message
        var parts = message.split(",");
        var code = parts.splice(0,1);
        var content = parts.join(",").replace(/(\r\n|\n|\r)/gm,"");

        //Check to see if we have a relevant listener
        var responseListenerData = this.responseListeners[code.toString()];
        if (responseListenerData) {
            //Call the response listener
            responseListenerData.listener(code,content);
            delete this.responseListeners[code.toString()];
        }

    }.bind(this));
    this.receiveSocket.on("listening", function () {
        var address = this.receiveSocket.address();
        console.log("Receiver socket listening " + address.address + ":" + address.port);
    }.bind(this));

    //Bind to the receive port
    this.receiveSocket.bind(9761);
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
};

LightwaveRF.prototype.setIP = function(ip) {
    this.config.ip = ip;
};

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
    this.exec("!R" + roomId + "D" + deviceId + "F" + state + "|\0", callback);
};

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
    this.exec("!R" + roomId + "D" + deviceId + "F" + state + "|\0", callback);
};

/**
 * Turn all devices in a room off
 *
 * @param integer  roomId   The room ID
 * @param Function callback The callback for if there are any errors
 *
 * @return void
 */
LightwaveRF.prototype.turnRoomOff = function(roomId, callback) {
    this.exec("!R" + roomId + "Fa\0", callback);
};

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
    var dimAmount = parseInt(dimPercentage * 0.32, 10); //Dim is on a scale from 0 to 32

    if (dimAmount === 0) {
        this.turnDeviceOff(roomId, deviceId, callback);
    } else {
        this.exec("!R" + roomId + "D" + deviceId + "FdP" + dimAmount + "|\0", callback);
    }
};

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
};

LightwaveRF.prototype.send = function(cmd, callback) {
    this.sendUdp(cmd, callback);
    //if (callback) callback();
};

LightwaveRF.prototype.exec = function() {
    // Check if the queue has a reasonable size
    if(this.queue.length > 10) this.queue.clear();

    this.queue.push(arguments);
    this.process();
};

/**
 * Send a message over udp
 *
 * @param string   message  The message to send
 * @param Function callback The callback for if there are any errors
 *
 * @return void
 */
LightwaveRF.prototype.sendUdp = function(message){

    var code = this.getMessageCode();
    message = code + "," + message;
    var buffer = new Buffer(message);
    var sendSocket = this.sendSocket;
    var ip = this.config.ip;
    var attemptNumber = 1;

    this.responseListeners[parseInt(code, 10).toString()] = {
        time: new Date().getTime(),
        listener: function(returnedCode, content) {
            clearInterval(stateTimer[code]);
        }
    };

    stateTimer[code] = setInterval(function() {

        console.log("Attempt " + attemptNumber + " - Sending message: " + message);

        sendSocket.send(buffer, 0, buffer.length, 9760, ip);

        attemptNumber++;

    }, 500);

};

LightwaveRF.prototype.process = function() {
    if (this.queue.length === 0) return;
    if (!this.ready) return;
    var self = this;
    this.ready = false;
    this.send.apply(this, this.queue.shift());
    setTimeout(function () {
        self.ready = true;
        self.process();
    }, this.timeout);
};

module.exports = LightwaveRF;