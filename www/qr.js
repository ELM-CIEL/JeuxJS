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

        if (txt.includes("=")) {
            document.getElementById("question").value = txt;
            document.getElementById("resultat").value = ""; // clear feedback
        } else {
            // Sinon c'est feedback bonne/mauvaise reponse
            const res = document.getElementById("resultat");
            const old = res.value;
            res.value = txt;
            // On n'efface rien côté client au bout de 3s :
            // - si mauvaise, serveur renverra la question à CE client après 3s
            // - si bonne, serveur broadcast envoie new question
        }
    };

    ws.onclose = function () {
        window.alert("WebSocket close");
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

function BPEnvoyer() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const val = document.getElementById("reponse").value.trim();
    if (!val) return;
    ws.send(val);
    document.getElementById("reponse").value = "";
}
