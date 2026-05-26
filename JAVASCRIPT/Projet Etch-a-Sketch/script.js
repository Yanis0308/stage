const conteneur = document.getElementById('conteneur');
const boutonTaille = document.getElementById('taille');
const paletteCouleur = document.getElementById('couleur');
const boutonEffacer = document.getElementById('effacer');

function creerGrille(taille) {
    conteneur.innerHTML = ''; 
    
    let taillePixel = 960 / taille;

    for (let i = 0; i < taille * taille; i++) {
        const square = document.createElement('div');
        square.classList.add('grid-item');
        square.style.width = `${taillePixel}px`;
        square.style.height = `${taillePixel}px`;

        square.addEventListener('mouseenter', () => {
            square.style.backgroundColor = paletteCouleur.value; 
        });

        conteneur.appendChild(square);
    }
}

boutonTaille.addEventListener('click', () => {
    let choix = prompt("Combien de cases par côté (max 100) ?");
    if (choix > 0 && choix <= 100) {
        creerGrille(choix);
    }
});

boutonEffacer.addEventListener('click', () => {
    const tousLesCarres = document.querySelectorAll('.grid-item');
    tousLesCarres.forEach(square => {
        square.style.backgroundColor = '#ffffff'; 
    });
});

creerGrille(16);