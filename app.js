/* *********************** Serveur Web *************************** */
'use strict';

var express = require("express");
var exp = express();

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
exp.listen(80, function () {
    console.log("Serveur en ecoute");
});