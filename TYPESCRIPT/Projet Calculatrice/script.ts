let premierNombre: string = "";
let operateur: string = "";
let deuxiemeNombre: string = "";

function ajouter(a: number, b: number): number { return a + b; }
function soustraire(a: number, b: number): number { return a - b; }
function multiplier(a: number, b: number): number { return a * b; }
function diviser(a: number, b: number): number | string { return b === 0 ? "Erreur" : a / b; }

const ecran = document.getElementById("ecran") as HTMLElement;

function chiffre(valeur: string): void {
    if (operateur === "") {
        premierNombre += valeur;
        ecran.innerText = premierNombre;
    } else {
        deuxiemeNombre += valeur;
        ecran.innerText = premierNombre + " " + operateur + " " + deuxiemeNombre;
    }
}

function signe(op: string): void {
    if (premierNombre !== "") {
        operateur = op;
        ecran.innerText = premierNombre + " " + operateur;
    }
}

function egal(): void {
    if (premierNombre === "" || deuxiemeNombre === "" || operateur === "") return;

    let a = parseFloat(premierNombre);
    let b = parseFloat(deuxiemeNombre);
    let res: number | string = 0;

    if (operateur === '+') res = ajouter(a, b);
    if (operateur === '-') res = soustraire(a, b);
    if (operateur === '*') res = multiplier(a, b);
    if (operateur === '/') res = diviser(a, b);

    ecran.innerText = res.toString();

    premierNombre = res.toString();
    deuxiemeNombre = "";
    operateur = "";
}

function effacer(): void {
    premierNombre = "";
    operateur = "";
    deuxiemeNombre = "";
    ecran.innerText = "0";
}