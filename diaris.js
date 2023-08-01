var loc= window.location.href 

if(loc.indexOf("elpais.com")>0){
  document.querySelector("#ctn_freemium_article").remove()
  var artamagat = document.querySelector(".a_b_wall._dn")
    artamagat.classList.add("a_c")
    artamagat.classList.remove("a_b_wall")
    artamagat.classList.remove("_dn")
}else if(loc.indexOf("arabalears.cat")>0||loc.indexOf("ara.cat")>0){
  document.querySelector(".paywall").remove()
  document.body.classList.remove("closed")
  var amagat = document.querySelectorAll(".ara-body div")
      amagat.forEach(div=>{
        if(div.style.display="none"){
        div.style.display="block"  
        div.classList.add("ara-body")}
      })
}else if(loc.indexOf("ultimahora.es")>0){
  document.querySelector(".unregistered-content").remove()
  document.querySelector(".registered-content").classList.remove("registered-content")
  document.querySelector(".teads-inread").remove()
  document.querySelector(".henneoHB-intext").remove()
  document.querySelectorAll(".adimpact-3").forEach(el=>el.remove())
  document.querySelectorAll(".ads-container").forEach(ad=>ad.remove())
                     
}else if(loc.indexOf("diariodemallorca.es")>0||loc.indexOf("diariodeibiza.es")>0){
  document.querySelectorAll(".article-body--truncated").forEach(r => r.classList.remove("article-body--truncated"))  
  document.querySelector(".article-body--seo-closed").style.display = "initial";
  document.getElementById("paywall").remove();
}
