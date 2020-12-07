
class Heros extends createjs.Sprite {

    constructor(atlas, jeu) {

        // Appel du constructeur de l'objet Sprite duquel l'objet Heros hérite
        super(atlas);

        this.debute = false;
        this.atterri = true;
        this.attaque = false;
        this.hp = 5;
        this.jeu = jeu;

        this.fonctionTouches = this.gererTouchePesee.bind(this);
        window.addEventListener("keydown", this.fonctionTouches);
        this.addEventListener('fin', this.fin.bind((this)))
    }

    sauter() {


        if (this.atterri && this.attaque === false){
        this.atterri = false;

        this.gotoAndPlay('jump');

        createjs.Tween
            .get(this)
            .to({y: this.y - 200}, 250, createjs.Ease.quadInOut)
            .wait(100)
            .to({y: this.y}, 500, createjs.Ease.circIn)
            .call(this.atterrir);

            createjs.Sound.play("sonSaut", {loop: 0, volume: 0.2});
        }
    }

    atterrir() {
        this.atterri = true;
        this.attaque = false;
        this.gotoAndPlay('run');
        if(this.debute === false){
            this.debute = true;
            this.dispatchEvent('departJeu');
        }
    }

    attaquer() {
        if(this.attaque === false && this.atterri === true)
        {
            this.attaque = true;
            this.gotoAndPlay('attack');
            setTimeout(this.finAttaque.bind(this), 250);
            createjs.Sound.play("sonAttaque", {loop: 0, volume: 0.2});
        }
    }

    finAttaque() {
        this.attaque = false;
        this.gotoAndPlay('run');
        if(this.debute === false){
            this.debute = true;
            this.dispatchEvent('departJeu');
        }
    }

    gererTouchePesee(e) {
        if (e.key === " ") {
            this.sauter();
        } else if (e.key === "Enter") {
            this.attaquer();
        }

    }

    degat(){
        if (this.hp < 1){
            this.jeu.stage.removeChild(this.jeu.uiHP);
            this.gotoAndPlay('die');
            this.jeu.fin();
            this.dispatchEvent('fin')
        }
        else{
            this.jeu.uiHP.gotoAndStop("hp"+this.hp);
            this.hp--;
        }
    }

    fin(){
        window.removeEventListener("keydown", this.fonctionTouches);
    }

}
