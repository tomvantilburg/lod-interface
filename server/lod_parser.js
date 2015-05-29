var WebSocketServer = require('../node_modules/websocket').server;
var Promise = require('../node_modules/promise');
var jsonld = require('../node_modules/jsonld');
//var d3 = require('../node_modules/d3');
var request = require('request');

var http = require('http');
var fs = require('fs');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

var port = 9991;
server.listen(port, function() {
    console.log((new Date()) + ' Server is listening on port '+port);
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});


wsServer.on('request', function(req) {
	var wsConnection = req.accept('connect', req.origin);
	console.log((new Date()) + ' Connection accepted.');
	wsConnection.on('message', function(message) {
		if (message.type === 'utf8' && message.utf8Data !== undefined) {
			try {
				var data = JSON.parse(message.utf8Data);
			}
			catch(err){
				wsConnection.sendUTF('{"error":true,"message":"'+err+'"}');
				console.warn('Err', err);
				return;
			}
			
			/* Doe je ding */
			
			if (data.request){
				var options = {
					url: data.request,
					json: true,
					headers: {
						'Accept':'application/ld+json'
					}
				};
				var callback = function (error, response, body) {
					jsonld.flatten(response, null, function(d){
						console.log(JSON.stringify(d));
						wsConnection.sendUTF(JSON.stringify(d));
					});
				};
				
				request(options, callback);
					
			}
			
			
		}
	});
	wsConnection.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Client ' + wsConnection.remoteAddress + ' disconnected.');
	});
	wsConnection.on('error', function (error) {
		console.log('WebSocket Error ' + error);
	});
});
