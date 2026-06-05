"use strict";
let premierNombre = "";
let operateur = "";
let deuxiemeNombre = "";
function ajouter(a, b) { return a + b; }
function soustraire(a, b) { return a - b; }
function multiplier(a, b) { return a * b; }
function diviser(a, b) { return b === 0 ? "Erreur" : a / b; }
const ecran = document.getElementById("ecran");
function chiffre(valeur) {
    if (operateur === "") {
        premierNombre += valeur;
        ecran.innerText = premierNombre;
    }
    else {
        deuxiemeNombre += valeur;
        ecran.innerText = premierNombre + " " + operateur + " " + deuxiemeNombre;
    }
}
function signe(op) {
    if (premierNombre !== "") {
        operateur = op;
        ecran.innerText = premierNombre + " " + operateur;
    }
}
function egal() {
    if (premierNombre === "" || deuxiemeNombre === "" || operateur === "")
        return;
    let a = parseFloat(premierNombre);
    let b = parseFloat(deuxiemeNombre);
    let res = 0;
    if (operateur === '+')
        res = ajouter(a, b);
    if (operateur === '-')
        res = soustraire(a, b);
    if (operateur === '*')
        res = multiplier(a, b);
    if (operateur === '/')
        res = diviser(a, b);
    ecran.innerText = res.toString();
    premierNombre = res.toString();
    deuxiemeNombre = "";
    operateur = "";
}
function effacer() {
    premierNombre = "";
    operateur = "";
    deuxiemeNombre = "";
    ecran.innerText = "0";
}
