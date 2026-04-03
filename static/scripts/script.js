window.onload = function() {
  if (document.getElementById("results")) {
    loadDefaultEvents();
  }
}

let userList;
const filterButton = document.getElementById("toggleFilter");
const filterGedeelte = document.getElementById("filtergedeelte");
const sluitButton = document.getElementById("zoek");
const annuleerButton = document.getElementById("annuleer");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const li = document.createElement("li");
const genreCheckboxes = document.querySelectorAll(".genre-filter");
const options = { valueNames: ['artist', 'genre', 'date', 'city'] };
const ul = document.getElementById("results");

document.querySelectorAll(".genre-filter").forEach(cb => cb.addEventListener("change", filterAlles));

searchInput.addEventListener("input", filterAlles);
filterButton.addEventListener("click", filterenOpen);
sluitButton.addEventListener("click", pasToe);
annuleerButton.addEventListener("click", annuleer);

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

function initializeList() {
  userList = new List('concertList', options);
}

function filterAlles() {
  const selected = Array.from(document.querySelectorAll(".genre-filter"))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  userList.filter(item => {
    const values = item.values();
    const artist = values.artist.toLowerCase();
    const genre = formatGenre(values.genre);
    const city = values.city.toLowerCase();
    const date = values.date;
    const search = searchInput?.value.toLowerCase();
    const plaats = document.getElementById("plaatsInput")?.value.toLowerCase();
    const van = document.getElementById("datumVan")?.value;
    const tot = document.getElementById("datumTot")?.value;

    const searchMatch =
      !search || search.length < 2 || artist.includes(search);

    const plaatsMatch =
      !plaats || city.includes(plaats);

    const genreMatch =
      selected.length === 0 || selected.includes(genre);

    const datumMatch =
      (!van || date >= van) &&
      (!tot || date <= tot);

    return searchMatch && plaatsMatch && genreMatch && datumMatch;
  });

  checkNoResults();
}

console.log(formatGenre("Hip-hop/Rap"));

// bericht tonen als er niks meer zichtbaar is na filteren
function checkNoResults() {
    ul.querySelector("#no-results-msg")?.remove();
    if (!Array.from(ul.children).some(li => li.style.display !== "none"))
    ul.insertAdjacentHTML("beforeend", '<li id="no-results-msg" style="font-style:italic;text-align:center">Geen resultaten gevonden</li>');
}