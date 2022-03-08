var button = document.createElement("Button");
button.innerHTML = "recarrega";
button.style = "top:0;right:0;position:absolute;z-index: 9999"
button.onclick = magia;
document.body.appendChild(button);

function magia(){
document.querySelector('mat-drawer').style.position = "relative";
        document.querySelector('mat-drawer').style.width = "100%";
setTimeout(function(){
        document.querySelector('mat-drawer-content').style.marginLeft = "0px";
    },1000);
}
