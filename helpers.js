var url = require('url');
var LightwaveRF = require("./lwrf");
var lwrf = new LightwaveRF();

// GETS THE URL PARAMS
function getURLParams (req) {
	var urlParts = url.parse(req.url, true);
	return urlParts.query;
}

// RETURNS A JSON HTTP RESPONSE
function httpResponse (res, response) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
}

// TOGGLE LIGHTWAVE DEVICE
exports.lwrfToggle = function (toggle, req, res) {

	var params = getURLParams(req);
    lwrf.setIP(params.ip);

	if (params.level >= 1) {
		lwrf.setDeviceDim(params.room, params.device, params.level);
	}else if (toggle == 1) {
		lwrf.turnDeviceOn(params.room, params.device);
	} else {
		lwrf.turnDeviceOff(params.room, params.device);
	}

	httpResponse(res, 'Request Received');

};

// REGISTER THE IP
exports.lwrfRegister = function(req, res) {

	var params = getURLParams(req);
    lwrf.setIP(params.ip);

	lwrf.register();

	httpResponse(res, 'Request Received');

};