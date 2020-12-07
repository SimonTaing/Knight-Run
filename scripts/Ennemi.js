class Ennemi extends createjs.Sprite {

    constructor(atlas, heros, difficulte) {

        super(atlas);
        this.heros = heros;
        this.vitesse = Math.random() * difficulte;
        if (this.vitesse < 4) {
            this.vitesse = 4;
        }
        this.scaleX = -0.5;
        this.scaleY = 0.5;
        this.gotoAndPlay("run");

        this.ecouteur = this.avancer.bind(this);
        createjs.Ticker.addEventListener("tick", this.ecouteur);
        this.heros.addEventListener('fin', this.fin.bind(this))

    }

    avancer(e) {
        if (e.paused) return;
        this.x -= this.vitesse;

        if (this.x < -this.getBounds().width) {
            this.detruire();
        }
        this.hitDetection();
    }

    detruire() {
        createjs.Ticker.removeEventListener("tick", this.ecouteur);
        this.parent.removeChild(this);
    }

    hitDetection() {
        if (this.niveau > 4) {
            this.detruire()
        }
        if (ndgmr.checkRectCollision(this, this.heros)) {
            if (this.heros.attaque === true) {
                this.detruire();
                this.dispatchEvent("mortEnnemi");
                createjs.Sound.play("sonEnnemiMort", {loop: 0});
            } else {
                this.detruire();
                createjs.Sound.play("sonDammage", {loop: 0});
                this.heros.degat();
            }
        }
    }

    fin(){
        createjs.Ticker.removeEventListener("tick", this.ecouteur);
    }
}

