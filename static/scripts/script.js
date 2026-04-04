window.onload = function() {
  if (document.getElementById("results")) {
    loadDefaultEvents();
  }
}

let userList;
const filterButton = document.querySelector("section button"); // de filter knop in de header, met vraagteken omdat deze niet op elke pagina staat
const filterGedeelte = document.querySelector("form");
const sluitButton = document.getElementById("zoek");
const annuleerButton = document.getElementById("annuleer");
const searchInput = document.getElementById("zoekConcert");
const results = document.getElementById("results");
const genreCheckboxes = document.querySelectorAll(".genre-filter");
const options = { valueNames: ['artist', 'genre', 'date', 'city'] };
const ul = document.getElementById("results");
const plaatsButton = document.getElementById("plaatsButton");
const zoekPlaats = document.getElementById("zoekPlaats");

// Zodra een checkbox verandert, wordt de filterfunctie aangeroepen
document.querySelectorAll(".genre-filter").forEach(cb => cb.addEventListener("change", filterAlles));

// met vraagteken anders werkt het niet op de andere pagina's waar deze elementen niet bestaan
searchInput?.addEventListener("input", filterAlles);
filterButton?.addEventListener("click", filterenOpen);
sluitButton?.addEventListener("click", pasToe);
annuleerButton?.addEventListener("click", annuleer);
plaatsButton?.addEventListener("click", pasToe);

zoekPlaats?.addEventListener("keydown", plaatsSubmit);
  
function plaatsSubmit(event) {
  if (event.key === "Enter") {
    event.preventDefault(); 
    pasToe();
  }
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase en https://www.w3schools.com/jsref/jsref_replace.asp
function formatGenre(genre) {
  return genre.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

function filterenOpen() {
  filterGedeelte.classList.add("open");
}

function pasToe() {
  filterGedeelte.classList.remove("open");
  filterAlles();
}

function annuleer() {
  filterGedeelte.classList.remove("open");
  genreCheckboxes.forEach(cb => cb.checked = false);
  filterAlles(); // herberekent alles netjes
  checkNoResults();
}

//"default" events ophalen die standaard op de home pagina staan bij openen
async function loadDefaultEvents() {
  try {
    const response = await fetch("/events");
    const data = await response.json();
    renderEvents(data);
    } catch (error) {
      console.error("Fout bij ophalen default events:", error);
    }
}

//Functie voor het "aanmaken" van events waar later info in kan
function renderEvents(data) {
  results.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    results.innerHTML = "<li>Geen aankomende events gevonden</li>";
    return;
  }

  data.forEach(event => {
    const li = document.createElement("li"); // <-- hier maken we elke keer een nieuwe
    li.innerHTML = `
      <img src="${event.image}" alt="${event.artist}">
      <div>
        <h3 class="artist">${event.artist}</h3>
        <p class="genre">${event.genre}</p>
        <p class="city">${event.city}</p>
        <p class="venue">${event.venue}</p>
        <p class="date">${event.date} - ${event.venue} (${event.city})</p>
      </div>
    `;
    li.addEventListener("click", () => {
      window.location.href = `/gekozen-concert?id=${encodeURIComponent(event.id)}
        &name=${encodeURIComponent(event.artist)}
        &date=${encodeURIComponent(event.date)}
        &time=${encodeURIComponent(event.time)}
        &venue=${encodeURIComponent(event.venue)}
        &city=${encodeURIComponent(event.city)}
        &country=${encodeURIComponent(event.country)}
        &image=${encodeURIComponent(event.image)}`;
    });
    results.appendChild(li);
  });

  initializeList();
  checkNoResults();
}

// https://listjs.com/docs/
function initializeList() {
  userList = new List('concertList', options);
}

// https://www.w3schools.com/jsref/jsref_filter.asp
function filterAlles() {
  const geselecteerd = Array.from(document.querySelectorAll(".genre-filter"))
    .filter(cb => cb.checked)
    .map(cb => cb.value); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

  userList.filter(item => {
    const values = item.values();
    const artist = values.artist.toLowerCase();
    const genre = formatGenre(values.genre);
    const city = values.city.toLowerCase();
    const date = values.date;
    const search = searchInput?.value.toLowerCase();
    const plaats = document.getElementById("zoekPlaats")?.value.toLowerCase();
    const van = document.getElementById("datumVan")?.value;
    const tot = document.getElementById("datumTot")?.value;

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators
    const concertZoeken =
      !search || search.length < 2 || artist.includes(search); // mag leeg zijn, minder dan twee letters, of de artiestennaam

    const plaatsZoeken =
      !plaats || city.includes(plaats); // deze mag leeg zijn of de plaatsnaam

    const genreKiezen =
      geselecteerd.length === 0 || geselecteerd.includes(genre); // als er niks is geselecteerd, mag alles, anders moet het in de genres zitten

    const datumKiezen =
      (!van || date >= van) && // de begindatum moet groter of gelijk zijn aan "van" als die is ingevuld
      (!tot || date <= tot); // de einddatum moet kleiner of gelijk zijn aan "tot" als die is ingevuld

    return concertZoeken && plaatsZoeken && genreKiezen && datumKiezen; // && betekend het moet kloppen, anders wordt dat onderdeel eruit gelaten.
  });

  checkNoResults();
}

console.log(formatGenre("Hip-hop/Rap"));

// bericht tonen als er niks meer zichtbaar is na filteren https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
function checkNoResults() {
    ul.querySelector("#no-results-msg")?.remove();
    if (!Array.from(ul.children).some(li => li.style.display !== "none")) // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
    ul.insertAdjacentHTML("beforeend", '<li id="no-results-msg" style="font-style:italic;text-align:center">Geen resultaten gevonden</li>');
}