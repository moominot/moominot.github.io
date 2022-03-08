var button = document.createElement("Button");
button.innerHTML = "ajusta a pantalla estreta";
button.style = "position:fixed;width:100%;height:40px;top:0px;right:0px;text-align:center;z-index: 9999"
button.onclick = magia;
document.body.appendChild(button);
document.body.style = "top:40px;"

function magia(){
document.querySelector('mat-drawer').style.position = "relative";
        document.querySelector('mat-drawer').style.width = "100%";
setTimeout(function(){
        document.querySelector('mat-drawer-content').style.marginLeft = "0px";
    },1000);
}
