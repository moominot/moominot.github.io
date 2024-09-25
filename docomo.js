const collapse = document.getElementById("collapseGaleria")
collapse.classList.add("show")

let element = document.querySelectorAll(".galeria-item")
let darrerElement = element[element.length-1]
darrerElement.scrollIntoView({ behavior: 'smooth' });

const modals = document.querySelectorAll(".do-not-open");

modals.forEach((m) => {
  var link = document.createElement("a");
  link.innerHTML = m.innerHTML;
  link.href = m.querySelector("img").src.replace("-350x245","");
  m.parentNode.appendChild(link);
});

modals.forEach((d) => d.remove());
