const plateauHtml = document.getElementById('plateau');
const statutHtml = document.getElementById('statut');
const boutonRecommencer = document.getElementById('recommencer');

let tour = 'Blancs';
let caseSelectionnee = null;
let gameOver = false;

const piecesInitiales = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

let echiquier = [];

function obtenirCouleurPiece(piece) {
    if (!piece) return null;
    return ['♜', '♞', '♝', '♛', '♚', '♟'].includes(piece) ? 'Noirs' : 'Blancs';
}

function genererPlateau() {
    plateauHtml.innerHTML = '';
    echiquier = JSON.parse(JSON.stringify(piecesInitiales));
    tour = 'Blancs';
    statutHtml.innerText = `Tour : ${tour}`;
    caseSelectionnee = null;
    gameOver = false;

    for (let ligne = 0; ligne < 8; ligne++) {
        for (let col = 0; col < 8; col++) {
            const divCase = document.createElement('div');
            divCase.classList.add('case');
            divCase.classList.add((ligne + col) % 2 === 0 ? 'blanche' : 'noire');
            divCase.dataset.ligne = ligne;
            divCase.dataset.col = col;
            divCase.innerText = echiquier[ligne][col];

            divCase.addEventListener('click', () => {
                if (tour === 'Blancs' && !gameOver) gererClic(ligne, col, divCase);
            });

            plateauHtml.appendChild(divCase);
        }
    }
}

function mouvementPhysiqueValide(depL, depC, arrL, arrC, simuEchiquier) {
    const piece = simuEchiquier[depL][depC];
    const cible = simuEchiquier[arrL][arrC];
    const couleur = obtenirCouleurPiece(piece);
    const couleurCible = obtenirCouleurPiece(cible);

    if (depL === arrL && depC === arrC) return false;
    if (couleurCible === couleur) return false;

    const diffL = arrL - depL;
    const diffC = arrC - depC;
    const absL = Math.abs(diffL);
    const absC = Math.abs(diffC);

    if (piece === '♙' || piece === '♟') {
        const sens = (couleur === 'Blancs') ? -1 : 1;
        const ligneDepart = (couleur === 'Blancs') ? 6 : 1;
        if (diffC === 0 && cible === '') {
            if (diffL === sens) return true;
            if (depL === ligneDepart && diffL === 2 * sens && simuEchiquier[depL + sens][depC] === '') return true;
        }
        if (absC === 1 && diffL === sens && cible !== '') return true;
        return false;
    }

    if (piece === '♘' || piece === '♞') return (absL === 2 && absC === 1) || (absL === 1 && absC === 2);
    if (piece === '♔' || piece === '♚') return absL <= 1 && absC <= 1;

    let verifLigne = (diffL === 0 || diffC === 0);
    let verifDiag = (absL === absC);

    if ((piece === '♖' || piece === '♜') && !verifLigne) return false;
    if ((piece === '♗' || piece === '♝') && !verifDiag) return false;
    if ((piece === '♕' || piece === '♛') && !verifLigne && !verifDiag) return false;

    const pasL = diffL === 0 ? 0 : diffL / absL;
    const pasC = diffC === 0 ? 0 : diffC / absC;
    let l = depL + pasL;
    let c = depC + pasC;

    while (l !== arrL || c !== arrC) {
        if (simuEchiquier[l][c] !== '') return false;
        l += pasL;
        c += pasC;
    }
    return true;
}

function trouverRoi(couleur, simuEchiquier) {
    const roiCherche = (couleur === 'Blancs') ? '♔' : '♚';
    for (let l = 0; l < 8; l++) {
        for (let c = 0; c < 8; c++) {
            if (simuEchiquier[l][c] === roiCherche) return { l, c };
        }
    }
    return null;
}

function roiEnEchec(couleur, simuEchiquier) {
    const positionRoi = trouverRoi(couleur, simuEchiquier);
    if (!positionRoi) return false;

    for (let l = 0; l < 8; l++) {
        for (let c = 0; c < 8; c++) {
            const piece = simuEchiquier[l][c];
            if (piece !== '' && obtenirCouleurPiece(piece) !== couleur) {
                if (mouvementPhysiqueValide(l, c, positionRoi.l, positionRoi.c, simuEchiquier)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function estCoupLegal(depL, depC, arrL, arrC) {
    if (!mouvementPhysiqueValide(depL, depC, arrL, arrC, echiquier)) return false;

    const copieEchiquier = JSON.parse(JSON.stringify(echiquier));
    const couleurJoueur = obtenirCouleurPiece(copieEchiquier[depL][depC]);
    
    copieEchiquier[arrL][arrC] = copieEchiquier[depL][depC];
    copieEchiquier[depL][depC] = '';

    return !roiEnEchec(couleurJoueur, copieEchiquier);
}

function genererTousCoupsLegaux(couleur) {
    let list = [];
    for (let l = 0; l < 8; l++) {
        for (let c = 0; c < 8; c++) {
            if (obtenirCouleurPiece(echiquier[l][c]) === couleur) {
                for (let al = 0; al < 8; al++) {
                    for (let ac = 0; ac < 8; ac++) {
                        if (estCoupLegal(l, c, al, ac)) {
                            list.push({ depL: l, depC: c, arrL: al, arrC: ac });
                        }
                    }
                }
            }
        }
    }
    return list;
}

function gererClic(ligne, col, divCase) {
    const pieceCliquee = echiquier[ligne][col];
    const couleurPiece = obtenirCouleurPiece(pieceCliquee);

    if (caseSelectionnee === null) {
        if (pieceCliquee !== '' && couleurPiece === tour) {
            caseSelectionnee = { ligne, col, element: divCase };
            divCase.classList.add('selectionnee');
        }
    } else {
        if (caseSelectionnee.ligne === ligne && caseSelectionnee.col === col) {
            caseSelectionnee.element.classList.remove('selectionnee');
            caseSelectionnee = null;
        } else if (couleurPiece === tour) {
            caseSelectionnee.element.classList.remove('selectionnee');
            caseSelectionnee = { ligne, col, element: divCase };
            divCase.classList.add('selectionnee');
        } else {
            if (estCoupLegal(caseSelectionnee.ligne, caseSelectionnee.col, ligne, col)) {
                deplacerPiece(caseSelectionnee.ligne, caseSelectionnee.col, ligne, col);
                caseSelectionnee.element.classList.remove('selectionnee');
                caseSelectionnee = null;

                if (!analyserStatutJeu('Noirs')) {
                    tour = 'Noirs';
                    statutHtml.innerText = `Le robot réfléchit...`;
                    setTimeout(jouerRobot, 600);
                }
            }
        }
    }
}

function deplacerPiece(depL, depC, arrL, arrC) {
    echiquier[arrL][arrC] = echiquier[depL][depC];
    echiquier[depL][depC] = '';
    redessinerPieces();
}

// Fonction de détection globale simplifiée et ultra-fiable
function analyserStatutJeu(prochainJoueur) {
    const roiBlanc = trouverRoi('Blancs', echiquier);
    const roiNoir = trouverRoi('Noirs', echiquier);
    let message = "";

    if (!roiBlanc) {
        message = "❌ DÉFAITE ! Le robot a capturé votre Roi.";
    } else if (!roiNoir) {
        message = "🏆 VICTOIRE ! Vous avez capturé le Roi du robot !";
    } else {
        const coupsDispo = genererTousCoupsLegaux(prochainJoueur);
        if (coupsDispo.length === 0) {
            if (prochainJoueur === 'Blancs') {
                message = roiEnEchec('Blancs', echiquier) ? "❌ DÉFAITE ! Vous êtes Échec et Mat." : "🤝 Match nul (Pat) !";
            } else {
                message = "🏆 VICTOIRE ! Le robot est Échec et Mat !";
            }
        }
    }

    if (message !== "") {
        gameOver = true;
        statutHtml.innerText = message;
        
        // Le setTimeout force l'affichage graphique avant de bloquer avec la pop-up
        setTimeout(() => {
            let rejouer = confirm(message + "\n\nVoulez-vous faire une nouvelle partie ?");
            if (rejouer) {
                genererPlateau();
            }
        }, 200);
        return true;
    }
    return false;
}

function jouerRobot() {
    if (gameOver) return;

    const coupsNoirs = genererTousCoupsLegaux('Noirs');

    if (coupsNoirs.length > 0) {
        let coupChoisi = coupsNoirs[Math.floor(Math.random() * coupsNoirs.length)];
        deplacerPiece(coupChoisi.depL, coupChoisi.depC, coupChoisi.arrL, coupChoisi.arrC);
        
        if (!analyserStatutJeu('Blancs')) {
            tour = 'Blancs';
            statutHtml.innerText = `Tour : ${tour} ${roiEnEchec('Blancs', echiquier) ? '(ÉCHEC !)' : ''}`;
        }
    } else {
        analyserStatutJeu('Noirs');
    }
}

function redessinerPieces() {
    const toutesLesCases = document.querySelectorAll('.case');
    toutesLesCases.forEach(divCase => {
        const ligne = parseInt(divCase.dataset.ligne);
        const col = parseInt(divCase.dataset.col);
        divCase.innerText = echiquier[ligne][col];
    });
}

boutonRecommencer.addEventListener('click', genererPlateau);

genererPlateau();