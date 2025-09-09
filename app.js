/* *********************** Serveur Web *************************** */
'use strict';

var express = require("express");
var exp = express();


/* *************** serveur WebSocket express ********************* */
var expressWs = require('express-ws')(exp);

exp.ws('/echo', function (ws, req) {
    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);

    ws.on('message', function (message) {
        console.log('De %s %s, message :%s',
            req.connection.remoteAddress, req.connection.remotePort, message);
        ws.send(message); // renvoie le message au client
    });

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });
});



// Définir le dossier racine pour les fichiers statiques
exp.use(express.static(__dirname + "/www"));

// Répondre à une requête GET sur la racine
exp.get("/", function (req, res) {
    console.log("Reponse à un client");
    res.sendFile(__dirname + "/www/index.html");
});

// Traitement des erreurs serveur
exp.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Erreur serveur express");
});

// Mise en écoute du serveur sur le port 80
var portServ = 80;
exp.listen(portServ, function () {
    console.log('Serveur en ecoute');
});