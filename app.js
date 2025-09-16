"use strict";

const express = require("express");
const exp = express();
const expressWs = require("express-ws")(exp);
const WebSocket = require("ws");

/* *************** Serveur Web classique ********************* */
exp.use(express.static(__dirname + "/www"));

exp.get("/", function (req, res) {
    console.log("Réponse à un client");
    res.sendFile(__dirname + "/www/textchat.html");
});

exp.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Erreur serveur express");
});

const portServ = 80;
exp.listen(portServ, function () {
    console.log("Serveur en écoute");
});

/* *************** WebSocket /echo ********************* */

const aWssEcho = expressWs.getWss("/echo");
aWssEcho.broadcast = function (data) {
    aWssEcho.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(data);
    });
};
exp.ws("/echo", function (ws, req) {
    console.log(
        "Connection /echo",
        req.connection.remoteAddress,
        req.connection.remotePort
    );
    ws.on("message", function (message) {
        message =
            ws._socket._peername.address +
            ws._socket._peername.port +
            " : " +
            message;
        aWssEcho.broadcast(message);
    });
});

/* *************** WebSocket /qr ********************* */
let question = "?";
let bonneReponse = 0;

// WSS pour /qr
const aWssQr = expressWs.getWss("/qr");
aWssQr.broadcast = function (data) {
    aWssQr.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(data);
    });
};

exp.ws("/qr", function (ws, req) {
    console.log(
        "Connection WebSocket %s sur le port %s",
        req.connection.remoteAddress,
        req.connection.remotePort
    );

    // Broadcast -> client
    NouvelleQuestion();

    ws.on("message", TraiterReponse);

    ws.on("close", function () {
        console.log(
            "Déconnexion WebSocket %s sur le port %s",
            req.connection.remoteAddress,
            req.connection.remotePort
        );
    });

    function TraiterReponse(message) {
        console.log(
            "De %s %s, message : %s",
            req.connection.remoteAddress,
            req.connection.remotePort,
            message
        );

        const estBonne = parseInt(message, 10) === bonneReponse;

        if (estBonne) {
            // Feedback que client -> repond
            ws.send("Bonne réponse !");
            // new question = all
            NouvelleQuestion();
        } else {
            // Feedback que client -> repond
            ws.send("Mauvaise réponse !");
            // ré-afficher la question 3s après
            setTimeout(() => {
                if (ws.readyState === WebSocket.OPEN) ws.send(question);
            }, 3000);
        }
    }

    function NouvelleQuestion() {
        const x = GetRandomInt(11);
        const y = GetRandomInt(11);
        question = `${x} * ${y} = ?`;
        bonneReponse = x * y;
        aWssQr.broadcast(question); // envoie question à tous clients
    }

    function GetRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
});
