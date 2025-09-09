'use strict';

var ipServeur = 'localhost:80'; // Adresse IP du serveur
var ws; // Instance WebSocket

window.onload = function () {
    if (TesterLaCompatibilite()) {
        ConnexionAuServeurWebsocket(); // Ouvre la connexion WebSocket
    }
    ControleIHM();
};

function TesterLaCompatibilite() {
    let estCompatible = true;
    if (!('WebSocket' in window)) {
        window.alert('WebSocket non supporté par le navigateur');
        estCompatible = false;
    }
    return estCompatible;
}

function ConnexionAuServeurWebsocket() {
    ws = new WebSocket('ws://' + ipServeur + '/echo'); // Connexion à /echo

    ws.onopen = function () {
        console.log('WebSocket open'); // Connexion réussie
    };

    ws.onmessage = function (evt) {
        document.getElementById('messageRecu').value = evt.data; // Affiche le message reçu
    };

    ws.onclose = function () {
        window.alert('WebSocket close'); // Connexion fermée
    };
}

function ControleIHM() {
    document.getElementById('Envoyer').onclick = BPEnvoyer; // Lien bouton → fonction
}

function BPEnvoyer() {
    ws.send(document.getElementById('messageEnvoi').value); // Envoie le message
}
