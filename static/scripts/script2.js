// Elementen ophalen
const filterBtn = document.getElementById("filterbutton");
const filteropties = document.getElementById("filtergedeelte");
const closeBtn = document.getElementById("annuleer");
const zoekPlaatsInput = document.getElementById("zoekPlaats");
const zoekBuddyInput = document.getElementById("zoekBuddy");
const ul = document.querySelector("#buddyList .list");

// List.js opties
const options = {
  valueNames: ['naam', 'stad']
};

// List.js initialiseren
const userList = new List('buddyList', options);

// Eventlisteners
filterBtn?.addEventListener("click", filterenOpen);
closeBtn?.addEventListener("click", annuleer);
zoekPlaatsInput?.addEventListener("input", filterAlles);
zoekBuddyInput?.addEventListener("input", filterAlles);

// Functies
function filterenOpen() {
  filteropties.classList.add("open");
}

function annuleer() {
  filteropties.classList.remove("open");
  zoekPlaatsInput.value = ""; // lege input bij annuleren
  zoekBuddyInput.value = "";  // lege input bij annuleren
  filterAlles();
}

// Filterfunctie: naam en plaats
function filterAlles() {
  if (!userList) return;

  const zoekNaam = zoekBuddyInput.value.toLowerCase();
  const plaats = zoekPlaatsInput.value.toLowerCase();

  userList.filter(item => {
    const naam = item.values().naam.toLowerCase();
    const stad = item.values().stad.toLowerCase();

    const naamMatch = !zoekNaam || zoekNaam.length < 2 || naam.includes(zoekNaam);
    const plaatsMatch = !plaats || stad.includes(plaats);

    return naamMatch && plaatsMatch;
  });

  checkNoResults();
}

// Geen resultaten bericht
function checkNoResults() {
  ul.querySelector("#no-results-msg")?.remove();

  if (!Array.from(ul.children).some(li => li.style.display !== "none")) {
    ul.insertAdjacentHTML(
      "beforeend",
      '<li id="no-results-msg" style="font-style:italic;text-align:center">Geen resultaten gevonden</li>'
    );
  }
}