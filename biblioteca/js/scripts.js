
  window.addEventListener("load", functionInit, true); 
  let dadesObj 



  
  function functionInit(){  
    toggleSpinnerOn()


    const dades = fetch('dades.json');
    


  ompledades(dades.DADES)
    
  };


  function ompledades(dades){
    //console.log(resposta)
    dades.forEach(obj=>{
      var ticketsArray = obj.Etiquetes.split(",")

      obj.Etiquetes =""
     var htmlTickets =  ticketsArray.map((ticket)=>{      
      obj.Etiquetes += `<span class="badge rounded-pill text-bg-primary cerca m-1">`+ticket+`</span>`
      })
    
    })
    
    dadesObj = dades
    var template = document.getElementById("cardllista").innerHTML
    var options = {
      item : template,
      valueNames: [
        'Autor',	'Títol',	'Idioma',	'Editor'	,'Etiquetes'	,		'Descripció'	,	'cerca',	'Publicació',	
        { data:['ID']  },
        { name: 'url', attr: 'href' },
        { name: 'Portada', attr: 'src' },
      ],
      };
if(paginacio){
  options.page = paginacio
  options.pagination = true
}

    

   toggleSpinnerOff()

    var userList = new List("llista", options, dades);
    userList.sort("row",{order:"desc"})
    userList.on('updated', function(list) {

      dadesObj=list.matchingItems.map(fil=>fil["_values"])      
      })
      var botoordena = document.getElementById('botoordena')
      var ordena = document.getElementById('ordena')
          ordena.addEventListener('change', function() {
            var orderString =ordena.value;
            console.log(orderString)
            botoordena.setAttribute("data-sort",orderString)
            //userList.sort(orderString);
          });
var paginaciovalue =  document.getElementById("paginaciovalue")
          paginaciovalue.addEventListener("change",function(){
            if(paginaciovalue.value>0){
              options.page = paginaciovalue.value
            options.pagination = true   
             }else{
              delete options.page
              delete options.pagination
             }
            var userList = new List("llista", options, dades);
                userList.sort("row",{order:"desc"})
               
            }
            )  

  }

  function mail(that){
    
    var emailAddress, subject, message, boto, iconaMail, spinMail

    boto = that.disabled = true
    iconaMail = document.querySelectorAll(".mail")
    iconaMail.forEach(m=>m.classList.add("d-none"))
    spinMail = document.querySelectorAll(".spinboto")
    spinMail.forEach(m=>m.classList.remove("d-none"))

    
    emailAddress = document.getElementById("email").value
    subject  = "Llibre enviat des de la meva biblioteca virtual."
    message = document.querySelector("[data-id=id"+that.id+"]").innerHTML

    google.script.run.withFailureHandler(errorfunction).withSuccessHandler(okfunction).
sendmail(that.id,emailAddress, subject, message)

function okfunction(){
  console.log("enviat")
  iconaMail.forEach(m=>m.classList.remove("d-none"))
  spinMail.forEach(m=>m.classList.add("d-none"))
  var boto = that.disabled = false
  mostraToast("Llibre enviat correctament","Email")
  

    
  }
function errorfunction(){
  console.log("error")
  iconaMail.forEach(m=>m.classList.remove("d-none"))
  spinMail.forEach(m=>m.classList.add("d-none"))
  var boto = that.disabled = false
  mostraToast("Hi ha hagut un error! torna-ho a provar més tard.","Email")

    
  }


}


function ompleModalId(id){
  
  toggleSpinnerOn()

  var template = document.getElementById("cardlateral").innerHTML
  var modaltitle = document.getElementById("modal-title")
  var modalbody = document.getElementById("modal-body")
  var llista = document.getElementById("modal-list")
      llista.innerHTML=""

if (id=="random"){
    
    id = dadesObj[(Math.floor(Math.random() * dadesObj.length))].ID
    
  }

  dades = dadesObj.filter(el=>el.ID==id)
  console.log(id,dades,template)
  var options = {
      item : template,
      valueNames: [
        'Autor',	'Títol',	'Idioma',	'Editor'	,'Etiquetes'	,		'Descripció'	,			'Publicació',												
        
        { name:'id' ,attr:'id' },
        { data:['ID']  },
        { name: 'url', attr: 'href' },
        { name: 'Portada', attr: 'src' }
      ]
};

    new List("modal-body", options, dades);
    var optionMail = document.getElementById("emailsend")           
            var option = document.createElement("option");
                option.text = optionMail.value
                option.value = optionMail.value
                option.selected = true
            var selectMail = document.getElementById("email")
            selectMail.add(option, selectMail[0]);
    
toggleSpinnerOff()

}
var input = document.getElementById("cerca-input") 


function clickEventHandler(e){
  //console.log(e)
         if(e.target.matches(".cerca")){   
            var string = e.target.innerHTML
            string = string.replace(/[^a-zA-Z0-9]/g,' ');
            input.value=string
            input.dispatchEvent(new Event('keyup'))
            //var modal = document.getElementById("modal").hide
       
        } else if(e.target.matches(".page")){  
          e.preventDefault() 

          //e.target.href = "javascript:;"
            
        }else if(e.target.matches(".add")){
           /*  var optionMail = document.getElementById("emailsend")           
            var option = document.createElement("option");
                option.text = optionMail.value
                option.value = optionMail.value
            var selectMail = document.getElementById("email")
            selectMail.add(option, selectMail[0]); */
     
        }
         
     

}

document.addEventListener("click",clickEventHandler);
