const canvas = document.getElementById('canevas-jeu');
const ctx = canvas.getContext('2d');
const chronoHtml = document.getElementById('chrono');
const statutSurvieHtml = document.getElementById('statut-survie');

const TAILLE_CASE = 80;
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1],
    [1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1],
    [1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const LARGEUR_MAP = map[0].length * TAILLE_CASE;
const HAUTEUR_MAP = map.length * TAILLE_CASE;

let joueurHumain;
let botsCaches = [];
let loupStandard;
let loupElite;
let tempsEcoule = 0;
let jeuActif = true;
let intervalleChrono;
let touches = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
let camera = { x: 0, y: 0 };
let classement = [];

function obtenirPositionLibreAleatoire() {
    let lig, col;
    do {
        lig = Math.floor(Math.random() * map.length);
        col = Math.floor(Math.random() * map[0].length);
    } while (map[lig][col] === 1);
    return {
        x: col * TAILLE_CASE + TAILLE_CASE / 2,
        y: lig * TAILLE_CASE + TAILLE_CASE / 2
    };
}

class Survivant {
    constructor(nom, estHumain = false, couleur = '#3498db') {
        let pos = obtenirPositionLibreAleatoire();
        this.x = pos.x;
        this.y = pos.y;
        this.nom = nom;
        this.estHumain = estHumain;
        this.couleur = couleur;
        this.rayon = 14;
        this.vitesseBase = 4.0;
        this.vitesse = this.vitesseBase;
        this.capture = false;
        this.tempsSurvie = 0;
        
        this.cibleX = this.x;
        this.cibleY = this.y;
        this.timerChangementPlanque = Math.random() * 150 + 100;

        // Variables système anti-blocage
        this.derniereX = this.x;
        this.derniereY = this.y;
        this.ticksBloque = 0;

        if (!estHumain) this.choisirNouveauCachette();
    }

    choisirNouveauCachette() {
        let pos = obtenirPositionLibreAleatoire();
        this.cibleX = pos.x;
        this.cibleY = pos.y;
        this.timerChangementPlanque = Math.random() * 200 + 100;
        this.ticksBloque = 0;
    }

    IA_seCacher() {
        if (this.capture || this.estHumain) return;

        // Vérification anti-blocage (si immobile trop longtemps)
        if (Math.hypot(this.x - this.derniereX, this.y - this.derniereY) < 0.5) {
            this.ticksBloque++;
            if (this.ticksBloque > 90) { // Environ 1.5 seconde immobile
                this.choisirNouveauCachette();
            }
        } else {
            this.ticksBloque = 0;
        }
        this.derniereX = this.x;
        this.derniereY = this.y;

        let repere = (loupStandard.proieFocus === this || loupElite.proieFocus === this);

        if (repere) {
            this.vitesse = this.vitesseBase * 1.2;
            if (Math.hypot(this.cibleX - this.x, this.cibleY - this.y) < 40) {
                this.choisirNouveauCachette();
            }
        } else {
            this.vitesse = this.vitesseBase * 0.75;
            this.timerChangementPlanque--;
            if (this.timerChangementPlanque <= 0 || Math.hypot(this.cibleX - this.x, this.cibleY - this.y) < 40) {
                this.choisirNouveauCachette();
            }
        }

        let dx = this.cibleX - this.x;
        let dy = this.cibleY - this.y;
        let dist = Math.hypot(dx, dy);

        if (dist > 5) {
            let angle = Math.atan2(dy, dx);
            let suivX = this.x + Math.cos(angle) * this.vitesse;
            let suivY = this.y + Math.sin(angle) * this.vitesse;

            if (!checkCollisionMurs(suivX, this.y, this.rayon)) this.x = suivX;
            if (!checkCollisionMurs(this.x, suivY, this.rayon)) this.y = suivY;
        }
    }
}

class LoupChercheur {
    constructor(type = 'STANDARD') {
        let pos = obtenirPositionLibreAleatoire();
        this.x = pos.x;
        this.y = pos.y;
        this.type = type;
        this.rayon = 15;
        
        if (type === 'ELITE') {
            this.vitesseNormal = 3.2;
            this.vitesseChasse = 4.8; 
            this.porteeVue = 450;      
            this.fov = Math.PI / 2.2;  
            this.couleurCône = 'rgba(155, 89, 182, 0.18)'; 
            this.couleurCorps = '#8e44ad';
        } else {
            this.vitesseNormal = 2.4;
            this.vitesseChasse = 4.0;
            this.porteeVue = 300;
            this.fov = Math.PI / 3;
            this.couleurCône = 'rgba(241, 196, 15, 0.12)';
            this.couleurCorps = '#e74c3c';
        }

        this.vitesse = this.vitesseNormal;
        this.angleVisuel = Math.random() * Math.PI * 2;
        this.cibleX = this.x;
        this.cibleY = this.y;
        this.proieFocus = null;
        this.etat = 'PATROUILLE';

        // Variables système anti-blocage
        this.derniereX = this.x;
        this.derniereY = this.y;
        this.ticksBloque = 0;

        this.choisirNouvelleCiblePatrouille();
    }

    choisirNouvelleCiblePatrouille() {
        let pos = obtenirPositionLibreAleatoire();
        this.cibleX = pos.x;
        this.cibleY = pos.y;
        this.ticksBloque = 0;
    }

    IA_ChercherEtChasser() {
        let proiesVivantes = [joueurHumain, ...botsCaches].filter(p => !p.capture);
        if (proiesVivantes.length === 0) {
            this.proieFocus = null;
            return;
        }

        // Système anti-blocage chercheur
        if (Math.hypot(this.x - this.derniereX, this.y - this.derniereY) < 0.5) {
            this.ticksBloque++;
            if (this.ticksBloque > 90) { // Coincé contre un mur pendant ~1.5s
                this.choisirNouvelleCiblePatrouille();
            }
        } else {
            this.ticksBloque = 0;
        }
        this.derniereX = this.x;
        this.derniereY = this.y;

        let proieTrouvee = null;
        for (let spie of proiesVivantes) {
            let dx = spie.x - this.x;
            let dy = spie.y - this.y;
            let dist = Math.hypot(dx, dy);

            if (dist <= this.porteeVue) {
                let angleVersProie = Math.atan2(dy, dx);
                let diffAngle = Math.atan2(Math.sin(angleVersProie - this.angleVisuel), Math.cos(angleVersProie - this.angleVisuel));

                if (Math.abs(diffAngle) < this.fov / 2) {
                    if (aUneLigneDeVue(this.x, this.y, spie.x, spie.y)) {
                        proieTrouvee = spie;
                        break; 
                    }
                }
            }
        }

        this.proieFocus = proieTrouvee;

        if (this.proieFocus) {
            this.etat = 'CHASSE';
            this.vitesse = this.vitesseChasse;
            this.cibleX = this.proieFocus.x;
            this.cibleY = this.proieFocus.y;
        } else {
            if (this.etat === 'CHASSE') {
                this.etat = 'PATROUILLE';
                this.vitesse = this.vitesseNormal;
                this.choisirNouvelleCiblePatrouille();
            }
            if (Math.hypot(this.cibleX - this.x, this.cibleY - this.y) < 40) {
                this.choisirNouvelleCiblePatrouille();
            }
        }

        let dx = this.cibleX - this.x;
        let dy = this.cibleY - this.y;
        let distCible = Math.hypot(dx, dy);

        if (distCible > 5) {
            this.angleVisuel = Math.atan2(dy, dx);
            let suivX = this.x + Math.cos(this.angleVisuel) * this.vitesse;
            let suivY = this.y + Math.sin(this.angleVisuel) * this.vitesse;

            if (!checkCollisionMurs(suivX, this.y, this.rayon)) this.x = suivX;
            if (!checkCollisionMurs(this.x, suivY, this.rayon)) this.y = suivY;
        }

        for (let spie of proiesVivantes) {
            if (Math.hypot(spie.x - this.x, spie.y - this.y) < (this.rayon + spie.rayon)) {
                spie.capture = true;
                spie.tempsSurvie = tempsEcoule;
                classement.push(spie);
                verifierFinDePartieGlobale();
            }
        }
    }
}

function initialiserJeu() {
    tempsEcoule = 0;
    jeuActif = true;
    classement = [];

    joueurHumain = new Survivant("Vous (Humain)", true, '#3498db');
    
    botsCaches = [
        new Survivant("IA_Lucas", false, '#2ecc71'),
        new Survivant("IA_Sarah", false, '#e67e22'),
        new Survivant("IA_Thomas", false, '#1abc9c'),
        new Survivant("IA_Emma", false, '#f39c12')
    ];
    
    loupStandard = new LoupChercheur('STANDARD');
    loupElite = new LoupChercheur('ELITE');

    clearInterval(intervalleChrono);
    intervalleChrono = setInterval(() => {
        if (jeuActif) {
            tempsEcoule++;
            chronoHtml.innerText = `Temps écoulé : ${tempsEcoule}s`;
            actualiserAffichageStatut();
        }
    }, 1000);

    actualiserAffichageStatut();
    boucleJeu();
}

function actualiserAffichageStatut() {
    let vivants = [joueurHumain, ...botsCaches].filter(p => !p.capture).length;
    if (joueurHumain.capture) {
        statutSurvieHtml.innerText = `🔴 Éliminé ! Mode Spectateur (${vivants} IA restantes)`;
        statutSurvieHtml.style.color = "#e74c3c";
    } else {
        statutSurvieHtml.innerText = `🟢 Joueurs restants : ${vivants} / 5 (Chasseurs en mouvement)`;
        statutSurvieHtml.style.color = "#2ecc71";
    }
}

function verifierFinDePartieGlobale() {
    let vivants = [joueurHumain, ...botsCaches].filter(p => !p.capture).length;
    actualiserAffichageStatut();
    
    if (vivants === 0) {
        jeuActif = false;
        clearInterval(intervalleChrono);

        setTimeout(() => {
            let copieClassement = [...classement];
            copieClassement.reverse();

            let texteClassement = "🏆 --- CLASSEMENT FINAL --- 🏆\n\n";
            copieClassement.forEach((j, index) => {
                let medaille = index === 0 ? "🥇 Vainqueur" : (index === 1 ? "🥈 2ème" : (index === 2 ? "🥉 3ème" : "💀"));
                texteClassement += `${medaille} : ${j.nom} - Tenu ${j.tempsSurvie}s\n`;
            });

            texteClassement += "\nRejouer une partie aléatoire ?";
            let rejouer = confirm(texteClassement);
            if (rejouer) initialiserJeu();
        }, 150);
    }
}

function checkCollisionMurs(x, y, rayon) {
    let colGauche = Math.floor((x - rayon) / TAILLE_CASE);
    let colDroite = Math.floor((x + rayon) / TAILLE_CASE);
    let ligHaut = Math.floor((y - rayon) / TAILLE_CASE);
    let ligBas = Math.floor((y + rayon) / TAILLE_CASE);

    if (colGauche < 0 || colDroite >= map[0].length || ligHaut < 0 || ligBas >= map.length) return true;

    for (let l = ligHaut; l <= ligBas; l++) {
        for (let c = colGauche; c <= colDroite; c++) {
            if (map[l][c] === 1) {
                let murX = c * TAILLE_CASE;
                let murY = l * TAILLE_CASE;
                let plusProcheX = Math.max(murX, Math.min(x, murX + TAILLE_CASE));
                let plusProcheY = Math.max(murY, Math.min(y, murY + TAILLE_CASE));
                if (Math.hypot(x - plusProcheX, y - plusProcheY) < rayon) return true;
            }
        }
    }
    return false;
}

function aUneLigneDeVue(x1, y1, x2, y2) {
    let pas = 20;
    let dist = Math.hypot(x2 - x1, y2 - y1);
    let nbVerifs = dist / pas;
    for (let i = 1; i < nbVerifs; i++) {
        let t = i / nbVerifs;
        let checkX = x1 + (x2 - x1) * t;
        let checkY = y1 + (y2 - y1) * t;
        let col = Math.floor(checkX / TAILLE_CASE);
        let lig = Math.floor(checkY / TAILLE_CASE);
        if (map[lig] && map[lig][col] === 1) return false;
    }
    return true;
}

function mettreAJour() {
    if (!jeuActif) return;

    if (!joueurHumain.capture) {
        let suivX = joueurHumain.x;
        let suivY = joueurHumain.y;
        if (touches.ArrowUp) suivY -= joueurHumain.vitesse;
        if (touches.ArrowDown) suivY += joueurHumain.vitesse;
        if (!checkCollisionMurs(joueurHumain.x, suivY, joueurHumain.rayon)) joueurHumain.y = suivY;

        if (touches.ArrowLeft) suivX -= joueurHumain.vitesse;
        if (touches.ArrowRight) suivX += joueurHumain.vitesse;
        if (!checkCollisionMurs(suivX, joueurHumain.y, joueurHumain.rayon)) joueurHumain.x = suivX;

        camera.x = joueurHumain.x - canvas.width / 2;
        camera.y = joueurHumain.y - canvas.height / 2;
    } else {
        let proiesVivantes = [joueurHumain, ...botsCaches].filter(p => !p.capture);
        if (proiesVivantes.length > 0) {
            camera.x = proiesVivantes[0].x - canvas.width / 2;
            camera.y = proiesVivantes[0].y - canvas.height / 2;
        } else {
            camera.x = loupElite.x - canvas.width / 2;
            camera.y = loupElite.y - canvas.height / 2;
        }
    }

    camera.x = Math.max(0, Math.min(camera.x, LARGEUR_MAP - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, HAUTEUR_MAP - canvas.height));

    botsCaches.forEach(b => b.IA_seCacher());
    loupStandard.IA_ChercherEtChasser();
    loupElite.IA_ChercherEtChasser();
}

function dessinerCône(loup) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(loup.x, loup.y);
    ctx.arc(
        loup.x, loup.y, 
        loup.porteeVue, 
        loup.angleVisuel - loup.fov / 2, 
        loup.angleVisuel + loup.fov / 2
    );
    ctx.closePath();
    ctx.fillStyle = loup.etat === 'CHASSE' ? 'rgba(231, 76, 60, 0.35)' : loup.couleurCône;
    ctx.fill();
    ctx.restore();
}

function dessiner() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    for (let l = 0; l < map.length; l++) {
        for (let c = 0; c < map[0].length; c++) {
            if (map[l][c] === 1) {
                ctx.fillStyle = '#1f242c';
                ctx.fillRect(c * TAILLE_CASE, l * TAILLE_CASE, TAILLE_CASE, TAILLE_CASE);
                ctx.strokeStyle = '#2d333b';
                ctx.strokeRect(c * TAILLE_CASE, l * TAILLE_CASE, TAILLE_CASE, TAILLE_CASE);
            } else {
                ctx.fillStyle = '#090d13';
                ctx.fillRect(c * TAILLE_CASE, l * TAILLE_CASE, TAILLE_CASE, TAILLE_CASE);
            }
        }
    }

    dessinerCône(loupStandard);
    dessinerCône(loupElite);

    botsCaches.forEach(b => {
        if (!b.capture) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.rayon, 0, Math.PI * 2);
            ctx.fillStyle = b.couleur;
            ctx.fill();
            ctx.closePath();
        }
    });

    if (!joueurHumain.capture) {
        ctx.beginPath();
        ctx.arc(joueurHumain.x, joueurHumain.y, joueurHumain.rayon, 0, Math.PI * 2);
        ctx.fillStyle = joueurHumain.couleur;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.closePath();
    }

    // Loup Standard (Rouge)
    ctx.beginPath();
    ctx.arc(loupStandard.x, loupStandard.y, loupStandard.rayon, 0, Math.PI * 2);
    ctx.fillStyle = loupStandard.couleurCorps;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();

    // Loup Élite (Violet)
    ctx.beginPath();
    ctx.arc(loupElite.x, loupElite.y, loupElite.rayon, 0, Math.PI * 2);
    ctx.fillStyle = loupElite.couleurCorps;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f1c40f'; 
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
}

function boucleJeu() {
    mettreAJour();
    dessiner();
    requestAnimationFrame(boucleJeu);
}

window.addEventListener('keydown', e => {
    if (touches.hasOwnProperty(e.key)) { touches[e.key] = true; e.preventDefault(); }
});
window.addEventListener('keyup', e => {
    if (touches.hasOwnProperty(e.key)) touches[e.key] = false;
});

initialiserJeu();