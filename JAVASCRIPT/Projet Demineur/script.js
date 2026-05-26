const grilleHtml = document.getElementById('demineur');
const boutonRejouer = document.getElementById('rejouer');

const taille = 10;
const nbBombes = 15;
let cases = [];
let GameOver = false;

function initialiserJeu() {
    grilleHtml.innerHTML = '';
    cases = [];
    GameOver = false;

    let grilleBombes = Array(taille * taille).fill(false);
    let bombesPlacees = 0;
    while (bombesPlacees < nbBombes) {
        let indexAleatoire = Math.floor(Math.random() * (taille * taille));
        if (!grilleBombes[indexAleatoire]) {
            grilleBombes[indexAleatoire] = true;
            bombesPlacees++;
        }
    }

    for (let i = 0; i < taille * taille; i++) {
        const d = document.createElement('div');
        d.classList.add('case');
        d.setAttribute('id', i);
        
        let caseObjet = {
            element: d,
            id: i,
            bombe: grilleBombes[i],
            decouverte: false,
            drapeau: false,
            nbBombesVoisines: 0
        };

        d.addEventListener('click', () => cliquerCase(caseObjet));
        
        d.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            poserDrapeau(caseObjet);
        });

        grilleHtml.appendChild(d);
        cases.push(caseObjet);
    }

    for (let i = 0; i < cases.length; i++) {
        if (!cases[i].bombe) {
            cases[i].nbBombesVoisines = compterBombesVoisines(cases[i].id);
        }
    }
}

function compterBombesVoisines(id) {
    let count = 0;
    let x = id % taille;
    let y = Math.floor(id / taille);

    for (let offY = -1; offY <= 1; offY++) {
        for (let offX = -1; offX <= 1; offX++) {
            let voisinX = x + offX;
            let voisinY = y + offY;
            if (voisinX >= 0 && voisinX < taille && voisinY >= 0 && voisinY < taille) {
                let voisinId = voisinY * taille + voisinX;
                if (cases[voisinId] && cases[voisinId].bombe) {
                    count++;
                }
            }
        }
    }
    return count;
}

function cliquerCase(c) {
    if (GameOver || c.decouverte || c.drapeau) return;

    c.decouverte = true;
    c.element.classList.add('decouverte');

    if (c.bombe) {
        c.element.classList.add('bombe');
        c.element.innerText = '💣';
        perdre();
        return;
    }

    if (c.nbBombesVoisines > 0) {
        c.element.innerText = c.nbBombesVoisines;
    } else {
        propagerDecouverte(c.id);
    }

    verifierVictoire();
}

function poserDrapeau(c) {
    if (GameOver || c.decouverte) return;

    if (!c.drapeau) {
        c.drapeau = true;
        c.element.classList.add('drapeau');
        c.element.innerText = '🚩';
    } else {
        c.drapeau = false;
        c.element.classList.remove('drapeau');
        c.element.innerText = '';
    }
}

function propagerDecouverte(id) {
    let x = id % taille;
    let y = Math.floor(id / taille);

    setTimeout(() => {
        for (let offY = -1; offY <= 1; offY++) {
            for (let offX = -1; offX <= 1; offX++) {
                let voisinX = x + offX;
                let voisinY = y + offY;
                if (voisinX >= 0 && voisinX < taille && voisinY >= 0 && voisinY < taille) {
                    let voisinId = voisinY * taille + voisinX;
                    if (cases[voisinId] && !cases[voisinId].decouverte) {
                        cliquerCase(cases[voisinId]);
                    }
                }
            }
        }
    }, 10);
}

function perdre() {
    GameOver = true;
    cases.forEach(c => {
        if (c.bombe) {
            c.element.classList.add('bombe');
            c.element.innerText = '💣';
        }
    });
    alert('BOOM ! Vous avez perdu.');
}

function verifierVictoire() {
    let casesGagnees = cases.filter(c => !c.bombe && c.decouverte).length;
    if (casesGagnees === (taille * taille) - nbBombes) {
        GameOver = true;
        alert('Félicitations ! Vous avez gagné !');
    }
}

boutonRejouer.addEventListener('click', initialiserJeu);

initialiserJeu();