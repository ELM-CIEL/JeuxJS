"use strict";

var ipServeur = location.host || "localhost:80"; // plus robuste
var ws;

window.onload = function () {
    if (TesterLaCompatibilite()) {
        ConnexionAuServeurWebsocket();
    }
    ControleIHM();
};

function TesterLaCompatibilite() {
    if (!("WebSocket" in window)) {
        window.alert("WebSocket non supporté par le navigateur");
        return false;
    }
    return true;
}

function ConnexionAuServeurWebsocket() {
    ws = new WebSocket("ws://" + ipServeur + "/qr");

    ws.onopen = function () {
        console.log("WebSocket open");
    };

    ws.onmessage = function (evt) {
        const txt = String(evt.data);
        const q = document.getElementById("question");
        const r = document.getElementById("resultat");

        if (txt === "Bonne réponse !" || txt === "Mauvaise réponse !") {
            r.value = txt;
        } else {
            q.value = txt;
            r.value = "";
        }
    };
}

function ControleIHM() {
    const btn = document.getElementById("valider");
    const input = document.getElementById("reponse");
    btn.onclick = BPEnvoyer;
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") BPEnvoyer();
    });
}

/* format brut
function BPEnvoyer() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const val = document.getElementById("reponse").value.trim();
    if (!val) return;
    ws.send(val);
    document.getElementById("reponse").value = "";
}
*/

// format json
function BPEnvoyer() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const nom = document.getElementById("nom").value.trim();
    const rep = document.getElementById("reponse").value.trim();
    if (!rep) return;

    ws.send(JSON.stringify({ nom: nom || "inconnu", reponse: rep }));
    document.getElementById("reponse").value = "";
}
