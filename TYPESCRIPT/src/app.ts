type User = {firstName: string, lastName: string}
type DateString = string;
type Id = number | string;
type identity<ArgType> = (arg: ArgType) => ArgType;
type Username = User['firstName']

const user = {firstName: 'John', lastName: 'Doe'}

function consoleSize<Type extends{length: number}>(arg: Type): Type {
    console.log(arg.length);
    return arg
}

const abb = consoleSize(['3', 2]);

function identity <ArgType> (arg: ArgType): ArgType {
    return arg;
}

function first<Type>( arg: Type[]): Type {
    return arg[0];
}


const aa: Array<string | number> = ["aze", "bze", 3];

const compteur = document.querySelector('#compteur')
let i = 0;
const increment = function (e: Event) { 
    e.preventDefault();
    i++;
    const span = compteur?.querySelector('span')
    if (span) {
        span.innerText = i.toString()
    }
}

function PrintId(id: string | number) {
    if (typeof id === "number") {
        console.log((id * 3).toString());
    } else {
        console.log(id.toUpperCase());
    }
}

function isDate(a: any): a is Date {
    return a instanceof Date;
}

function example (a: Date | HTMLInputElement) {
    if (isDate(a)) {
        a
    }
}

interface Point {
    x: number
}

interface Point {
    y: number
}

// Difference interface type 
// interface peut etre redefini plus tard dans le code, interface ne peut pas prendre les types primaires comme string, uniquement pour des choses ressemblant a des objets et possibilite d'implementer.
// type ne peut pas etre redefini plus tard dans le code, type peut prendre les types primaires comme string, number.*/