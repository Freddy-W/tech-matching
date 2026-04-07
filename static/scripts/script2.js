// Elementen ophalen
const filterBtn = document.getElementById("filterbutton");
const filteropties = document.getElementById("filtergedeelte");
const closeBtn = document.getElementById("annuleer");
const zoekPlaatsInput = document.getElementById("zoekPlaats");
const zoekBuddyInput = document.getElementById("zoekBuddy");
const ul = document.querySelector("#buddyList .list");
const brandstofCheckboxes = document.querySelectorAll(".brandstof-filter");
const zoekButton = document.getElementById("zoek");
document.getElementById("filtergedeelte")?.addEventListener("submit", e => {
  e.preventDefault();
  filterAlles();
});

// List.js opties
const options = {
  valueNames: ['naam', 'stad', 'brandstof']
};

// List.js initialiseren
const userList = new List('buddyList', options);

filterBtn?.addEventListener("click", filterenOpen);
closeBtn?.addEventListener("click", annuleer);
zoekPlaatsInput?.addEventListener("input", filterAlles);
zoekBuddyInput?.addEventListener("input", filterAlles);
zoekButton?.addEventListener("click", () => {
  filteropties.classList.remove("open");
  filterAlles();
});

brandstofCheckboxes.forEach(cb => 
  cb.addEventListener("change", filterAlles)
);

function filterenOpen() {
  filteropties.classList.add("open");
}

function annuleer() {
  filteropties.classList.remove("open");
  zoekPlaatsInput.value = ""; // lege input bij annuleren
  zoekBuddyInput.value = "";  // lege input bij annuleren
  brandstofCheckboxes.forEach(cb => cb.checked = false);
  filterAlles();
}

function filterAlles() {
  if (!userList) return;

  const zoekNaam = zoekBuddyInput.value.toLowerCase();
  const plaats = zoekPlaatsInput.value.toLowerCase();

  const geselecteerdeBrandstof = Array.from(brandstofCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value.toLowerCase());

  userList.filter(item => {
    const values = item.values();

    const naam = values.naam.toLowerCase();
    const stad = values.stad.toLowerCase();
    const brandstof = values.brandstof.toLowerCase();

    const naamMatch =
      !zoekNaam || zoekNaam.length < 2 || naam.includes(zoekNaam);

    const plaatsMatch =
      !plaats || stad.includes(plaats);

    const brandstofMatch =
      geselecteerdeBrandstof.length === 0 ||
      geselecteerdeBrandstof.includes(brandstof);

    return naamMatch && plaatsMatch && brandstofMatch;
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