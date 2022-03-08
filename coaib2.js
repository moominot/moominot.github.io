var button = document.createElement("Button");
button.innerHTML = "+";
button.style = "position:fixed;width:60px;height:60px;bottom:40px;right:40px;background-color:#0C9;color:#FFF;border-radius:50px;text-align:center;box-shadow: 2px 2px 3px #999;z-index: 9999"
button.onclick = magia;
document.body.appendChild(button);

function magia(){
document.querySelector('mat-drawer').style.position = "relative";
        document.querySelector('mat-drawer').style.width = "100%";
setTimeout(function(){
        document.querySelector('mat-drawer-content').style.marginLeft = "0px";
    },1000);
}
