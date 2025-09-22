var loc= window.location.href 

if(loc.indexOf("elpais.com")>0){
  document.querySelector("#ctn_freemium_article").remove()
  var artamagat = document.querySelector(".a_b_wall._dn")
    artamagat.classList.add("a_c")
    artamagat.classList.remove("a_b_wall")
    artamagat.classList.remove("_dn")
}else if(loc.indexOf("arabalears.cat")>0||loc.indexOf("ara.cat")>0){
  document.querySelector(".paywall").remove()
  document.querySelector("main").classList.remove("ara-main--paywall-login-register")
  //document.body.classList.remove("closed")
  var amagat = document.querySelector(".ara-body div")
      
        if(amagat.style.display="none"){
        amagat.style.display="block"  
        amagat.classList.add("ara-body")}
  document.body.classList.remove('lock-nav')
  // Selecciona l'element que vols observar
const targetNode = document.body;

// Opcions de configuració de l'observador
const config = {
  childList: true, // Observa si s'afegeixen o s'eliminen nodes fills
  subtree: true,   // Estén l'observació a tots els descendents de l'element objectiu
  attributes: true, // Observa canvis en els atributs dels elements
  characterData: true // Observa canvis en el contingut de text dels nodes
};

// La funció de 'callback' que s'executarà quan es detecti un canvi
const callback = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      console.log('S\'ha afegit o eliminat un node fill al body o a un dels seus descendents.');
      // Aquí pots executar la teva ordre o funció
     
      
      executaOrdre()
    } else if (mutation.type === 'attributes') {
      console.log(`L'atribut '${mutation.attributeName}' ha estat modificat.`);
      // Aquí pots executar la teva ordre o funció
    
      executaOrdre()
    } else if (mutation.type === 'characterData') {
      console.log('El contingut de text d\'un node ha estat modificat.');
      // Aquí pots executar la teva ordre o funció
    
      executaOrdre()
    }
  }
};

// Crea una instància de l'observador amb la funció de 'callback'
const observer = new MutationObserver(callback);

// Comença a observar l'element objectiu amb la configuració especificada
observer.observe(targetNode, config);

// --- La funció que vols executar quan hi hagi un canvi ---
function executaOrdre() {
  if(targetNode.classList.includes('lock-nav')){
  targetNode.classList.remove('lock-nav')
  console.log('👉 S\'ha executat l\'ordre a causa d\'un canvi al DOM!');}
  // Per exemple, pots actualitzar un component, enviar dades, etc.
}

// Per aturar l'observació quan ja no la necessitis:
// observer.disconnect();
     
}else if(loc.indexOf("ultimahora.es")>0){
  document.querySelector(".unregistered-content").remove()
  document.querySelector(".registered-content").classList.remove("registered-content")
  document.querySelector(".teads-inread").remove()
  document.querySelector(".henneoHB-intext").remove()
  document.querySelectorAll(".adimpact-3").forEach(el=>el.remove())
  document.querySelectorAll(".ads-container").forEach(ad=>ad.remove())
                     
}else if(loc.indexOf("diariodemallorca.es")>0||loc.indexOf("diariodeibiza.es")>0||loc.indexOf("diariodeibiza.es")>0){
  /* document.querySelectorAll(".article-body--truncated").forEach(r => r.classList.remove("article-body--truncated"))  
  document.querySelector(".article-body--seo-closed").style.display = "initial";
  document.getElementById("paywall").remove(); */
  document.querySelectorAll('head > link[rel="stylesheet"')[1].href="https://moominot.github.io/entry.hack.css"
  //document.querySelector("[data-close='closedContent']").remove()
  document.querySelector(".view-offer").remove()
}else if(loc.indexOf("lavanguardia.com")>0){
  document.getElementById("meter-paywall").remove()
  document.querySelector(".ev-open-modal-paywall-REQUIRE_LOGIN_WITH_ENTITLEMENT").remove()  
  document.querySelectorAll('head > link[rel="stylesheet"')[1].href="https://moominot.github.io/entry.hack.css"
  document.querySelector(".view-offer").remove()
  
}
