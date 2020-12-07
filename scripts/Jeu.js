class Jeu {

    constructor() {

        this.chargeur = null;
        this.stage = null;
        this.heros = null;
        this.queue = null;
        this.fond = null;
        this.fond2 = null;
        this.sol = null;
        this.arbres = null;
        this.musique = null;
        this.difficulte = 10;
        this.fonctionAjoutEnnemis = null;
        this.fonctionAjoutEnnemis2 = null;
        this.conteneurEnnemis = null;
        this.timeoutNiveaux = null;
        this.niveau = 1;
        this.pointage = null;
        this.points = 0;
        this.fini = false;
        this.instructions = null;

        this.parametres = {
            canevas: "canvas",
            cadence: 30,
            manifeste: "ressources/manifest.json"
        };

        this.charger();
    }

    charger() {
        this.chargeur = new createjs.LoadQueue();
        this.chargeur.installPlugin(createjs.Sound);
        this.chargeur.addEventListener("complete", this.initialiser.bind(this));
        this.chargeur.addEventListener('error', this.abandonner.bind(this));
        this.chargeur.loadManifest(this.parametres.manifeste);
    }

    abandonner() {
        alert("Une erreur de chargement est survenue!");
    }

    initialiser(e) {
        this.stage = new createjs.StageGL(this.parametres.canevas, {antialias: true});

        // 1138x712 ?!
        if (mobile) this.stage.scale = 0.97;

        createjs.Ticker.addEventListener("tick", e => this.stage.update(e));
        createjs.Ticker.framerate = this.parametres.cadence;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;


        this.ajouterFond();
        this.ajouterInterface();
    }

    ajouterFond(){
        const ciel = new createjs.Bitmap(this.chargeur.getResult("bg3"));
        this.stage.addChild(ciel);

        this.fond2 = new createjs.Bitmap(this.chargeur.getResult("bg2"));
        this.fond2.y = this.stage.canvas.height - this.fond2.getBounds().height+100;
        this.stage.addChild(this.fond2);

        this.fond = new createjs.Bitmap(this.chargeur.getResult("bg1"));
        this.fond.y = this.stage.canvas.height - this.fond.getBounds().height;
        this.stage.addChild(this.fond);

        this.sol = new createjs.Bitmap(this.chargeur.getResult("sol"));
        this.sol.y = this.stage.canvas.height - 100;
        this.stage.addChild(this.sol);

        this.arbres = new createjs.Container();
        this.stage.addChild(this.arbres);

        for (let i = 0; i < 4; i++) {
            const arbre = new createjs.Bitmap(this.chargeur.getResult("arbre"+(i+1)));
            arbre.x = i * arbre.getBounds().width + Math.random() * 150;
            arbre.regY = arbre.getBounds().height;
            arbre.y = this.stage.canvas.height - 100;
            this.arbres.addChild(arbre);

        }

        let logo = new createjs.Bitmap(this.chargeur.getResult('logo'));
        logo.x = this.stage.canvas.width/2 - logo.getBounds().width/2;
        logo.y = this.stage.canvas.height/2 - logo.getBounds().height/2-100;
        this.arbres.addChild(logo);

        this.queue = new createjs.Bitmap(this.chargeur.getResult("queue"));
        this.queue.x = this.stage.canvas.width + this.queue.getBounds().width;
        this.queue.y = this.stage.canvas.height/2 - this.queue.getBounds().height/2;
        this.stage.addChild(this.queue);

        this.conteneurEnnemis = new createjs.Container();
        this.stage.addChild(this.conteneurEnnemis);

        this.ajouterHeros();
    }

    demarrer(e) {
        createjs.Tween
            .get(this.fond)
            .to({x: this.stage.canvas.width - this.fond.getBounds().width}, 60000);

        createjs.Tween
            .get(this.fond2)
            .to({x: this.stage.canvas.width - this.fond2.getBounds().width}, 60000);

        createjs.Tween
            .get(this.arbres)
            .to({x: -this.stage.canvas.width - 500}, 2000);

        createjs.Tween
            .get(this.heros)
            .to({x: this.heros.x - 400}, 2000);

        this.fonctionAjoutEnnemis= setTimeout(this.ajouterEnnemi.bind(this), 2000);


        this.musique = createjs.Sound.play("musique", {loop: 0, volume: 0});
        createjs.Tween.get(this.musique).to({volume: 0.1}, 1000);

        document.addEventListener('visibilitychange', this.gererVisibilite.bind(this));

        setTimeout(this.prochainNiveau.bind(this), 20000);

        this.uiHP = new createjs.Sprite(this.chargeur.getResult("uiHP"));
        this.uiHP.x = 20;
        this.uiHP.y = 20;
        this.stage.addChild(this.uiHP);

        this.pointage = new createjs.Text( "Score: 0000", "36px 'Arial'", "#FFF");
        this.pointage.cache(-5,-5,this.pointage.getBounds().width+5,this.pointage.getBounds().height+5);
        this.pointage.x = 20;
        this.pointage.y = 120;
        this.stage.addChild(this.pointage);

        this.instructions.visible = false;
        this.boutonInstru.visible = false;
        createjs.Ticker.paused = false;

    }

    gererVisibilite() {
        this.musique.paused = !this.musique.paused;
        createjs.Ticker.paused = !createjs.Ticker.paused;
    }

    ajouterHeros() {

        this.heros = new Heros(this.chargeur.getResult("heros"), this);
        this.heros.scale = 0.75;
        this.heros.gotoAndPlay('idle');
        this.stage.addChild(this.heros);
        this.heros.y = this.stage.canvas.height - 100;
        this.heros.x = this.stage.canvas.width / 2;


        this.heros.addEventListener('departJeu', this.demarrer.bind(this));

    }

    ajouterEnnemi() {
        if (!createjs.Ticker.paused) {
            let type = Math.ceil(Math.random()*4);
            let ennemi = new Ennemi(this.chargeur.getResult("ennemi"+type), this.heros, this.difficulte);
            ennemi.x = this.stage.canvas.width;
            ennemi.y = this.sol.y;
            ennemi.addEventListener('mortEnnemi', this.ajouterPoints.bind(this));
            this.conteneurEnnemis.addChild(ennemi);

            this.fonctionAjoutEnnemis2= setTimeout(this.ajouterEnnemi.bind(this), 2000/this.niveau);
        }
    }

    ajouterPoints() {
        this.points += 100;
        this.pointage.text = "Score: "+this.points;
        this.pointage.updateCache();
    }

    ajouterInterface() {
        let boutonAttaque = new createjs.Sprite(this.chargeur.getResult("boutonAttaque"));
        boutonAttaque.scale = 0.3;
        boutonAttaque.x = this.stage.canvas.width - 100;
        boutonAttaque.y = this.stage.canvas.height - 100;
        this.stage.addChild(boutonAttaque);

        // Utilisation du ButtonHelper
        let helper1 = new createjs.ButtonHelper(boutonAttaque);

        boutonAttaque.addEventListener("mousedown", this.heros.attaquer.bind(this.heros));

        let boutonSaut = new createjs.Sprite(this.chargeur.getResult("boutonSaut"));
        boutonSaut.scale = 0.3;
        boutonSaut.x = 100;
        boutonSaut.y = this.stage.canvas.height - 100;
        this.stage.addChild(boutonSaut);

        // Utilisation du ButtonHelper
        let helper2 = new createjs.ButtonHelper(boutonSaut);

        boutonSaut.on("mousedown", this.heros.sauter.bind(this.heros));

        this.boutonInstru = new createjs.Sprite(this.chargeur.getResult("boutonInstru"));
        this.boutonInstru = new createjs.Sprite(this.chargeur.getResult("boutonInstru"));
        this.boutonInstru.scale = 0.75;
        this.boutonInstru.x = this.stage.canvas.width - this.boutonInstru.getBounds().width + 110;
        this.boutonInstru.y = 20;

        this.stage.addChild(this.boutonInstru);

        // Utilisation du ButtonHelper
        let helper3 = new createjs.ButtonHelper(this.boutonInstru);

        this.boutonInstru.on("mousedown", this.afficherInstru.bind(this));

        this.instructions = new createjs.Bitmap(this.chargeur.getResult("instructions"));
        this.instructions.visible = false;
        this.instructions.x = this.stage.canvas.width/2 - this.instructions.getBounds().width/2;
        this.instructions.y = this.stage.canvas.height/2 - this.instructions.getBounds().height/2;
        this.stage.addChild(this.instructions);
        this.instructions.on("mousedown", this.cacherInstru.bind(this));
    }

    afficherInstru(){
        this.instructions.visible = true;
        createjs.Ticker.paused = true;
    }
    cacherInstru(){
        this.instructions.visible = false;
        createjs.Ticker.paused = false;
    }

    prochainNiveau(){
        if(this.niveau === 3){
            this.fin();
        }
        else if(this.niveau <= 2 && !this.fini){
            createjs.Tween
                .get(this.queue)
                .to({x: this.stage.canvas.width/2 - this.queue.getBounds().width/2}, 1000, createjs.Ease.quadInOut)
                .wait(1000)
                .to({x: - this.queue.getBounds().width}, 1000, createjs.Ease.circIn).wait(1).to({x: this.stage.canvas.width}, 1);

            createjs.Sound.play("sonQueue", {loop: 0, volume: 0.2});

            clearTimeout(this.fonctionAjoutEnnemis);
            console.log("vitesse supérieure!");
            this.difficulte += this.difficulte*0.5;
            this.timeoutNiveaux = setTimeout(this.prochainNiveau.bind(this),20000);
            this.niveau++;
        }
    }

    fin(){
        this.fini = true;
        this.musique.stop();
        this.musique = createjs.Sound.play("musiqueFin", {loop: 0, volume: 0.1});
        clearTimeout(this.timeoutNiveaux);
        clearTimeout(this.fonctionAjoutEnnemis);
        clearTimeout(this.fonctionAjoutEnnemis2);
        this.ecranFin();
        this.heros.dispatchEvent('fin')
    }

    ecranFin (){

        let score = this.points;
        let multiplieur = this.heros.hp + 1;
        let scoreFinal = score * multiplieur;

        let containerFin = new createjs.Container();
        containerFin.alpha = 0.1;
        containerFin.on("mousedown", this.stop);
        this.stage.addChild(containerFin);

        let fondFin = new createjs.Bitmap(this.chargeur.getResult('fondFin'));
        containerFin.addChild(fondFin);


        let textTitre = new createjs.Text( "Résultats", "42px 'Arial'", "#FFF");
        textTitre.cache(-5,-5,textTitre.getBounds().width+5,textTitre.getBounds().height+5);
        textTitre.x = this.stage.canvas.width/2 - textTitre.getMeasuredWidth()/2;
        textTitre.y = this.stage.canvas.height/2 - 110;
        containerFin.addChild(textTitre);

        let textScore = new createjs.Text( "Points: "+score, "36px 'Arial'", "#FFF");
        textScore.cache(-5,-5,textScore.getBounds().width+5,textScore.getBounds().height+5);
        textScore.x = this.stage.canvas.width/2 - textScore.getMeasuredWidth()/2;
        textScore.y = this.stage.canvas.height/2 - 50;
        containerFin.addChild(textScore);

        let textMulti = new createjs.Text( "Multiplieur: "+multiplieur, "36px 'Arial'", "#FFF");
        textMulti.cache(-5,-5,textMulti.getBounds().width+5,textMulti.getBounds().height+5);
        textMulti.x = this.stage.canvas.width/2 - textMulti.getMeasuredWidth()/2;
        textMulti.y = this.stage.canvas.height/2;
        containerFin.addChild(textMulti);

        let textScoreFinal = new createjs.Text( "Pointage final: "+scoreFinal, "36px 'Arial'", "#FFF");
        textScoreFinal.cache(-5,-5,textScoreFinal.getBounds().width+5,textScoreFinal.getBounds().height+5);
        textScoreFinal.x = this.stage.canvas.width/2 - textScoreFinal.getMeasuredWidth()/2;
        textScoreFinal.y = this.stage.canvas.height/2 + 50;
        containerFin.addChild(textScoreFinal);


        createjs.Tween.get(containerFin).wait(250).to({alpha: 1}, 1000);
        console.log(containerFin)

    }

    stop(){

    }
}