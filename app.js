/* *********************** Serveur Web *************************** */
'use strict';

var express = require('express');
var exp = express();
var WebSocket = require('ws');

/* *************** serveur WebSocket express ********************* */
var expressWs = require('express-ws')(exp);
var aWss = expressWs.getWss('/echo');

/* *************** Broadcast Clients WebSocket ********************* */
aWss.broadcast = function broadcast(data) {
    console.log("Broadcast aux clients navigateur : %s", data);
    aWss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(data, function ack(error) {
                console.log(" - %s-%s", client._socket.remoteAddress, client._socket.remotePort);
                if (error) {
                    console.log('ERREUR websocket broadcast : %s', error.toString());
                }
            });
        }
    });
};

/* *************** WebSocket /echo ********************* */
exp.ws('/echo', function (ws, req) {
    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);

    ws.on('message', function (message) {
        console.log('De %s %s, message :%s',
            req.connection.remoteAddress, req.connection.remotePort, message);

        // Ajout de l’adresse IP et port au message
        message = ws._socket._peername.address + ws._socket._peername.port + ' : ' + message;

        // Diffusion à tous les clients
        aWss.broadcast(message);
    });

    ws.on('close', function (reasonCode, description) {
        console.log('Déconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });
});

/* *************** Serveur Web classique ********************* */
exp.use(express.static(__dirname + "/www"));

exp.get("/", function (req, res) {
    console.log("Réponse à un client");
    res.sendFile(__dirname + "/www/textchat.html"); // nom modifié
});

exp.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Erreur serveur express");
});

var portServ = 80;
exp.listen(portServ, function () {
    console.log('Serveur en écoute');
});
