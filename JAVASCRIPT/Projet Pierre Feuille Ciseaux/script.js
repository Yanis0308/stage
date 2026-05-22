const choixPossibles = ['pierre', 'feuille', 'ciseaux'];
let scoreJoueur = 0;
let scoreOrdi = 0;
let round = 0; 

function jouer(choixJoueur) {
    if (round === 5) {
        return; 
    }

    const hasard = Math.floor(Math.random() * 3);
    const choixOrdi = choixPossibles[hasard];

    let bilan = "";

    if (choixJoueur === choixOrdi) {
        bilan = "Égalité !";
    } 
    else if (
        (choixJoueur === 'pierre' && choixOrdi === 'ciseaux') ||
        (choixJoueur === 'feuille' && choixOrdi === 'pierre') ||
        (choixJoueur === 'ciseaux' && choixOrdi === 'feuille')
    ) {
        bilan = "Gagné !";
        scoreJoueur++; 
    } 
    else {
        bilan = "Perdu !";  
        scoreOrdi++;
    }

    round++; 
    const phraseChoix = `<b>Round ${round} / 5</b><br>Vous : ${choixJoueur} | Ordi : ${choixOrdi} <br> <b>Score : ${scoreJoueur} - ${scoreOrdi}</b> <br>`;

    if (round === 5) {
        if (scoreJoueur > scoreOrdi) {
            document.getElementById('resultat').style.color = 'green';
            document.getElementById('resultat').innerHTML = phraseChoix + "<b>Fin du match : Vous avez gagné la partie ! 🎉</b>";
        } else if (scoreOrdi > scoreJoueur) {
            document.getElementById('resultat').style.color = 'red';
            document.getElementById('resultat').innerHTML = phraseChoix + "<b>Fin du match : L'ordinateur a gagné ! ❌</b>";
        } else {
            document.getElementById('resultat').style.color = 'orange';
            document.getElementById('resultat').innerHTML = phraseChoix + "<b>Fin du match : Égalité parfaite ! 🤝</b>";
        }
    } 
    else {
        // Affichage normal pendant les rounds 1 à 4
        if (bilan === "Gagné !") {
            document.getElementById('resultat').style.color = 'green';
            document.getElementById('resultat').innerHTML = phraseChoix + "Vous avez gagné ! ";
        }
        else if (bilan === "Perdu !") {
            document.getElementById('resultat').style.color = 'red';
            document.getElementById('resultat').innerHTML = phraseChoix + "Vous avez perdu ! ";
        }    
        else {
            document.getElementById('resultat').style.color = 'orange';
            document.getElementById('resultat').innerHTML = phraseChoix + "Égalité ! ";
        }
    }
}