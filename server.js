var http = require('http');
var router = require('./router');
var helpers = require('./helpers');

router.register('/on', function(req, res) {
	console.log('On request received');	
	helpers.lwrfToggle(1, req, res);
});

router.register('/off', function(req, res) {
	console.log('Off request received');
	helpers.lwrfToggle(0, req, res);
});

router.register('/register', function(req, res) {
	console.log('Registration request received');	
	helpers.lwrfRegister(req, res);
});

router.register('/close', function(req, res) {
	console.log('Close request received');
	helpers.lwrfRelay(0, req, res);
});

router.register('/open', function(req, res) {
	console.log('Open request received');
	helpers.lwrfRelay(1, req, res);
});

router.register('/stop', function(req, res) {
	console.log('Stop request received');
	helpers.lwrfRelay(2, req, res);
});

router.register('/', function(req, res) {
	console.log('Someone connected to server with no paramaters');
	res.setHeader('Content-Type', 'text/html; charset=utf-8')
	var message = "You have connected to the smartthings lightwave node server,<br>"+
	    "There is currently nothing else for you to see here"
	res.end(message)
});

var server = http.createServer(function (req, res) {
	var handler = router.route(req);
	handler.process(req, res);
});

server.listen(8000);
console.log('Server running');
