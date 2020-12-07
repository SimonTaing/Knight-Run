let jeu;

const mobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/);

if (mobile) {
  document.addEventListener( "deviceready", () => jeu = new Jeu() );
} else {
  jeu = new Jeu();
}
