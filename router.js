var handlerFactory = require('./handler');
var fs = require('fs');
var parser = require('url');
var handlers = {};

exports.clear = function() {
  handlers = {};
};

exports.register = function(url, method) {
  handlers[url] = handlerFactory.createHandler(method);
};

exports.route = function(req) {
  var url = parser.parse(req.url, true);
  var handler = handlers[url.pathname];
  if (!handler) handler = this.missing(req);
  return handler;
};

exports.missing = function(req) {
  var url = parser.parse(req.url, true);
  var path = __dirname + "/public" + url.pathname
  try {    
    var data = fs.readFileSync(path);
    var mime = req.headers.accepts || 'text/html';
    return handlerFactory.createHandler(function(req, res) {
      res.writeHead(200, {'Content-Type': mime});
      res.end(data);
    });        
  } catch (e) { 
    return handlerFactory.createHandler(function(req, res) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end("No route registered for " + url.pathname);
    });      
  }  
};
