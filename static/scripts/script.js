window.onload = function() {
  if (document.getElementById("results")) {
    loadDefaultEvents();
  }
}

function formatGenre(genre) {
  return genre.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

const toggleFilterBtn = document.getElementById("toggleFilter");
const filterGedeelte = document.getElementById("filtergedeelte");
const closeBtn = document.getElementById("annuleer");

// openen/sluiten
if (toggleFilterBtn) {
    toggleFilterBtn.addEventListener("click", () => {
        filterGedeelte.classList.add("open");
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        filterGedeelte.classList.remove("open");
    });
}

let userList;

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
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    results.innerHTML = "<li>Geen aankomende events gevonden</li>";
    return;
  }

  data.forEach(event => {
    const li = document.createElement("li");
    li.dataset.genre = formatGenre(event.genre);
    li.innerHTML = `
      <img src="${event.image}" alt="${event.artist}">
      <div>
        <h3 class="artist">${event.artist}</h3>
        <p class="genre">${event.genre}</p>
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
}

function initializeList() {
  const options = { valueNames: ['artist', 'genre', 'date'] };
  userList = new List('concertList', options);
}

// const searchBtn = document.querySelector("button");

// if (searchBtn) {
//     searchBtn.addEventListener("click", async () => {
//         const artistInput = document.querySelector("input");
//         if (!artistInput) return;

//         const artist = artistInput.value;
//         if (!artist) return;

//         try {
//             const response = await fetch(`/artist/${encodeURIComponent(artist)}`);
//             const data = await response.json();

//             renderEvents(data); // toont de gevonden concerten

//         } catch (error) {
//             console.error("Fout bij ophalen artist events:", error);
//         }
//     });
// }

// document.querySelector("input").addEventListener("keydown", (e) => {
//     if (e.key === "Enter") {
//         searchBtn.click();
//     }
// });

// const filterSubmitBtn = document.getElementById("filterSubmit");

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
        const genre = li.dataset.genre;
        li.style.display = selectedGenres.includes(genre) ? "flex" : "none";
    });

}

console.log(formatGenre("Hip-hop/Rap"));