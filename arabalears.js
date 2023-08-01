document.querySelector(".paywall").remove()
document.body.classList.remove("closed")
var amagat = document.querySelectorAll(".ara-body div")
amagat.forEach(div=>{
  if(div.style.display="none"){
  div.style.display="block"  
  div.classList.add("ara-body")}
})
  

