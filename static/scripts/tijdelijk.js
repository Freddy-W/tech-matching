

// Filter overlay
function setupFilterToggle() {
  const toggleFilterBtn = document.getElementById("toggleFilter");
  const filterGedeelte = document.getElementById("filtergedeelte");
  const closeBtn = document.getElementById("annuleer");

  toggleFilterBtn.addEventListener("click", () => filterGedeelte.classList.add("open"));
  closeBtn.addEventListener("click", () => filterGedeelte.classList.remove("open"));
}

async function loadDefaultEvents() {
  try {
    const response = await fetch("/events");
    const data = await response.json();
    renderEvents(data);
  } catch (error) {
    console.error("Fout bij ophalen events:", error);
  }
}

function renderEvents(data) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    results.innerHTML = "<li>Geen aankomende events gevonden</li>";
    return;
  }

  data.forEach(event => {
    results.innerHTML += `
      <li class="${event.genre}">
        <img src="${event.image}" alt="${event.artist}">
        <div>
          <h3 class="artist">${event.artist}</h3>
          <p class="genre">${event.genre}</p>
          <p class="date">${event.date} - ${event.venue} (${event.city})</p>
        </div>
      </li>
    `;
  });

  initializeList();
}

// List.js
function initializeList() {
  const options = { valueNames: ['artist', 'genre', 'date'] };
  userList = new List('concertList', options);
}

// Genre filter
const genreCheckboxes = document.querySelectorAll(".genre-filter");
genreCheckboxes.forEach(cb => cb.addEventListener("change", filterGenre));

function filterGenre() {
  const selectedGenres = Array.from(genreCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const ul = document.getElementById("results");

  if (selectedGenres.length === 0) {
    Array.from(ul.children).forEach(li => li.style.display = "flex");
    return;
  }

  Array.from(ul.children).forEach(li => {
    li.style.display = selectedGenres.includes(li.className) ? "flex" : "none";
  });
}