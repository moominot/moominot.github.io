   function magia(){
       document.querySelector('mat-drawer').style.position = "relative";
    document.querySelector('mat-drawer').style.width = "100%";
    setTimeout(function(){
      document.querySelector('mat-drawer-content').style.marginLeft = "0px";
    },1000);
   };


window.addEventListener("resize", magia);
   
magia();
