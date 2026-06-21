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

window.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("/filters");
  const filters = await response.json();

  if (filters.zoekNaam) {
    zoekBuddyInput.value = filters.zoekNaam;
  }

  if (filters.plaats) {
    zoekPlaatsInput.value = filters.plaats;
  }

  if (filters.brandstof) {
    brandstofCheckboxes.forEach(cb => {
      cb.checked = filters.brandstof.includes(cb.value);
    });
  }

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
zoekButton?.addEventListener("click", pasToe);

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

function pasToe() {
  filteropties.classList.remove("open");
  filterAlles();
  slaFiltersOp();
}

async function slaFiltersOp() {
  const filters = {
    zoekNaam: zoekBuddyInput.value,
    plaats: zoekPlaatsInput.value,
    brandstof: Array.from(brandstofCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value)
  };

  await fetch("/filters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ filters })
  });
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
  slaFiltersOp();
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