const modals = document.querySelectorAll(".do-not-open");

modals.forEach((m) => {
  var link = document.createElement("a");
  link.innerHTML = m.innerHTML;
  link.href = link.querySelector("img").src.replace("-350x245","");
  m.parentNode.appendChild(link);
});

modals.forEach((d) => d.remove());
