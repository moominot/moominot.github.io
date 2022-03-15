document.querySelectorAll(".article-body--truncated").forEach(r => r.classList.remove("article-body--truncated"))

document.querySelector(".article-body--seo-closed").style.display = "initial";
document.querySelectorAll("lazy-transclude")[0].style.display = "none";
