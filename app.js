"use strict";

const express = require("express");
const exp = express();
const expressWs = require("express-ws")(exp);
const WebSocket = require("ws");

class CQr {
    constructor(aWss) {
        this.aWss = aWss;
        this.question = "?";
        this.bonneReponse = 0;
        this.joueurs = new Set();
    }

    GetRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    NouvelleQuestion() {
        // Version binaire
        const n = this.GetRandomInt(256);
        const b = n.toString(2).padStart(8, "0");
        this.question = `Convertir ${b} (base 2) en base 10 : ?`;
        this.bonneReponse = n;

        this.aWss.broadcast(this.question); // diffusion à tous
    }

    TraiterReponse(wsClient, message) {
        let mess;
        try {
            mess = JSON.parse(message); // ← parse JSON
        } catch (e) {
            console.log("Message non JSON :", message); // test demandé
            return;
        }

        const joueur = mess.nom || "inconnu";
        const reponse = parseInt(mess.reponse, 10);

        if (reponse === this.bonneReponse) {
            this.EnvoyerResultatDiff(wsClient, "Bonne réponse !");
            this.NouvelleQuestion();
        } else {
            this.EnvoyerResultatDiff(wsClient, `Mauvaise réponse ${joueur} !`);
            setTimeout(() => {
                if (wsClient.readyState === WebSocket.OPEN)
                    wsClient.send(this.question);
            }, 3000);
        }
    }

    EnvoyerResultatDiff(wsClient, texte) {
        if (wsClient.readyState === WebSocket.OPEN) wsClient.send(texte);
    }

    Deconnecter(wsClient) {
        this.joueurs.delete(wsClient);
    }
}

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

// WSS -> /qr + helper broadcast
const aWssQr = expressWs.getWss("/qr");
aWssQr.broadcast = function (data) {
    aWssQr.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) c.send(data);
    });
};

const jeuxQr = new CQr(aWssQr);

/* *************** serveur WebSocket express /qr ********************* */
exp.ws("/qr", function (ws, req) {
    console.log(
        "Connection WebSocket %s:%s",
        req.connection.remoteAddress,
        req.connection.remotePort
    );
    jeuxQr.joueurs.add(ws);
    jeuxQr.NouvelleQuestion();

    // wrapper intermédiaire
    ws.on("message", function TMessage(message) {
        jeuxQr.TraiterReponse(ws, message);
    });

    ws.on("close", function () {
        jeuxQr.Deconnecter(ws);
        console.log(
            "Deconnexion WebSocket %s:%s",
            req.connection.remoteAddress,
            req.connection.remotePort
        );
    });
});
