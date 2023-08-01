var loc= window.location.href 

if(loc.indexOf("elpais.com")){
  document.querySelector("#ctn_freemium_article").remove()
  var artamagat = document.querySelector(".a_b_wall._dn")
    artamagat.classList.add("a_c")
    artamagat.classList.remove("a_b_wall")
    artamagat.classList.remove("_dn")
  
}else if(loc.indexOf("ara.cat"||"arabalears.cat)){
  document.querySelector(".paywall").remove()
  document.body.classList.remove("closed")
  var amagat = document.querySelector(".ara-body div")
    amagat.style.display="block"
    amagat.classList.add("ara-body")

}else if(loc.indexOf("ulimahora.es)){
  document.querySelector(".unregistered-content").remove()
  document.querySelector(".registered-content").classList.remove("registered-content")
  document.querySelector(".teads-inread").remove()
  document.querySelector(".henneoHB-intext").remove()
  document.querySelectorAll(".adimpact-3").forEach(el=>el.remove())
  document.querySelectorAll(".ads-container").forEach(ad=>ad.remove())
                     
}else if(loc.indexOf("diariodemallorca.es)){
  document.querySelectorAll(".article-body--truncated").forEach(r => r.classList.remove("article-body--truncated"))  
  document.querySelector(".article-body--seo-closed").style.display = "initial";
  document.getElementById("paywall").remove();
}
