"use strict";
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
