// https://www.youtube.com/watch?v=DfSYmk_6vk8
window.onload = async function() {
    // slideOne();
    // slideTwo();
    ladenBeginEvents();
        if (document.getElementById("distanceText")) {
        afstandBereken();
    }
}

function formatGenre(genre) {
  return genre.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

const toggleFilterBtn = document.getElementById("toggleFilter");
const filterGedeelte = document.getElementById("filtergedeelte");
const closeBtn = document.getElementById("annuleer");
const stars = document.querySelectorAll('.star-rating span');
const ratingInput = document.getElementById('rating');
const distanceText = document.getElementById("distanceText");


function setStars(value) {
  stars.forEach(star => {
    star.classList.remove('selected');
    if (parseInt(star.dataset.value) <= value) {
      star.classList.add('selected');
    }
  });
}

if (document.getElementById(".star-rating span")) {
    setStars(ratingInput.value);
}

stars.forEach(star => {
  const val = parseInt(star.dataset.value);
  star.addEventListener('click', () => {
    ratingInput.value = val;
    setStars(val);
  });
});

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
async function ladenBeginEvents() {
    try {
        const response = await fetch("/events");
        const data = await response.json();

        ladenEvents(data);

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
    results.innerHTML += `
      <li data-genre="${formatGenre(event.genre)}">
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