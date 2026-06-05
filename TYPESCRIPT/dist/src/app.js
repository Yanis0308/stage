"use strict";
const user = { firstName: 'John', lastName: 'Doe' };
function consoleSize(arg) {
    console.log(arg.length);
    return arg;
}
const abb = consoleSize(['3', 2]);
function identity(arg) {
    return arg;
}
function first(arg) {
    return arg[0];
}
const aa = ["aze", "bze", 3];
const compteur = document.querySelector('#compteur');
let i = 0;
const increment = function (e) {
    e.preventDefault();
    i++;
    const span = compteur?.querySelector('span');
    if (span) {
        span.innerText = i.toString();
    }
};
function PrintId(id) {
    if (typeof id === "number") {
        console.log((id * 3).toString());
    }
    else {
        console.log(id.toUpperCase());
    }
}
function isDate(a) {
    return a instanceof Date;
}
function example(a) {
    if (isDate(a)) {
        a;
    }
}
// Difference interface type 
// interface peut etre redefini plus tard dans le code, interface ne peut pas prendre les types primaires comme string, uniquement pour des choses ressemblant a des objets et possibilite d'implementer.
// type ne peut pas etre redefini plus tard dans le code, type peut prendre les types primaires comme string, number.*/
