const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);

/* const product = urlParams.get('product')
console.log(product);
// shirt

const color = urlParams.get('color')
console.log(color);
// blue

const newUser = urlParams.get('newuser')
console.log(newUser);
// empty string */

const
  keys = urlParams.keys(),
  values = urlParams.values(),
  entries = urlParams.entries();



//console.log(entries)
//for (const key of keys) console.log(key);
// product, color, newuser, size

//for (const value of values) console.log(value);
// shirt, blue, , m

for(const entry of entries) {

  console.log(`${entry[0]}: ${entry[1]}`);
  
}
// product: shirt
// color: blue
// newuser:
// size: m
console.log(entries)
var app = queryString.replace('?url=','')
var config = "https://script.google.com/macros/s/AKfycbz76sE_0kS0ZKu7U55HPO0FSh3GieZD-F6RBExriXy5OFRcaEe8-w8kQob6lN2d90rcjA/exec?page=config"

window.addEventListener("load",function(){
urlParams.has('url')?vesURL(app):vesURL(config)
})

function vesURL(url){  
  var iframe = document.getElementById("divisio")
  iframe.src = url
}
