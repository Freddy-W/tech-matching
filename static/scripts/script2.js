let filteropties = document.querySelector("section");

document.querySelector("button").addEventListener("click", filteropen);

function filteropen() {
    if (filteropties.style.display === "block") {
        filteropties.style.display = "none";
    } else {
        filteropties.style.display = "block";
    }
}