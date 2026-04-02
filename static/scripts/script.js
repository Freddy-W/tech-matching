// https://www.youtube.com/watch?v=DfSYmk_6vk8
window.onload = async function() {
    // slideOne();
    // slideTwo();
    ladenBeginEvents();
        if (document.getElementById("distanceText")) {
        afstandBereken();
    }
}

const filterBtn = document.querySelector("button:nth-of-type(2)");
const filteropties = document.getElementById("filtergedeelte");
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
if (filterBtn) {
    filterBtn.addEventListener("click", () => {
        filteropties.classList.add("open");
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        filteropties.classList.remove("open");
    });
}

rock.addEventListener("click", sorteerAll);
dance.addEventListener("click", sorteerAll);
country.addEventListener("click", sorteerAll);
hiphop.addEventListener("click", sorteerAll);
other.addEventListener("click", sorteerAll);

function sorteerAll(event) {
  let lijst = document.querySelector("ul");
  let value = event.target.value;
  lijst.className = value;
}

//Functie voor het "aanmaken" van events waar later info in kan
function ladenEvents(data) {
    const results = document.getElementById("results");
    if (!results) return;

    results.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        results.innerHTML = "<p>Geen aankomende events gevonden.</p>";
        return;
    }

    data.forEach(event => {
        results.innerHTML += `
            <a  href="/gekozen-concert?id=${event.id}&name=${encodeURIComponent(event.artist)}&date=${event.date}&venue=${encodeURIComponent(event.venue)}&city=${encodeURIComponent(event.city)}&country=${encodeURIComponent(event.country)}&image=${encodeURIComponent(event.image)}">
            <div class="event">
                <img src="${event.image}" alt="${event.artist}">
                <div class="eventinfo">
                <h3>${event.artist}</h3>
                <p><strong>Genre:</strong> ${event.genre}</p>
                <p><strong>Datum:</strong> ${event.date}</p>
                <p><strong>Locatie:</strong> ${event.venue} (${event.city})</p>
                </div>
            </div>
            </a>
        `;
    });
}

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

//Functie voor zoeken van events voor een specifieke artiest
// const searchBtn = document.getElementById("searchBtn");

// if (searchBtn) {
//     searchBtn.addEventListener("click", async () => {
//         console.log("Button werkt");

//         const artistInput = document.getElementById("artistInput");
//         if (!artistInput) return;

//         const artist = artistInput.value;
//         if (!artist) return;

//         try {
//             const response = await fetch(`/artist/${encodeURIComponent(artist)}`);
//             const data = await response.json();

//             renderEvents(data);

//         } catch (error) {
//             console.error("Fout bij ophalen artist events:", error);
//         }
//     });
// };

const zoekKnop = document.getElementById("zoekKnop");

if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
        const artistInput = document.querySelector("input");
        if (!artistInput) return;

        const artist = artistInput.value;
        if (!artist) return;

        try {
            const response = await fetch(`/artist/${encodeURIComponent(artist)}`);
            const data = await response.json();

            renderEvents(data); // toont de gevonden concerten

        } catch (error) {
            console.error("Fout bij ophalen artist events:", error);
        }
    });
}

document.querySelector("input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

// CONCERT OPSLAAN NIET COMPLEET
const favButton = document.getElementById("favButton");
favButton.addEventListener("click", favEvent);

async function favEvent () {
    const eventurl = document.location.search;
    const eventId= eventurl.split("id=")[1].split("&")[0];

    try {
    const res = await fetch("/userdatas/favorite", {
        method: "PATCH",
        body: JSON.stringify({eventId})});
        console.log("Success");
    }
    catch (error) {
        alert("Kon niet opslaan");
    }
};

const filterSubmitBtn = document.getElementById("filterSubmit");

if (filterSubmitBtn) {
    filterSubmitBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("/events");
            const data = await response.json();
            const plaats = document.getElementById("plaatsInput").value.toLowerCase();
            const typesChecked = Array.from(document.querySelectorAll('input[name="type_muziek"]:checked'))
                                      .map(el => el.value);

            const filtered = data.filter(event => {
                const plaatsMatch = !plaats || event.city.toLowerCase().includes(plaats);

                const typeMatch =
                    typesChecked.length === 0 ||
                    typesChecked.some(type => 
                        event.genre.toLowerCase().includes(type.toLowerCase())
                    );

                // datum code
                const van = document.getElementById("datumVan").value;
                const tot = document.getElementById("datumTot").value;

                const datumMatch =
                    (!van || event.date >= van) &&
                    (!tot || event.date <= tot);

                return plaatsMatch && typeMatch && datumMatch;
            });

            renderEvents(filtered);
            filteropties.classList.remove("open");
        } 
        catch (error) {
            console.error("Fout bij filteren:", error);
        }
    });
}

const venue = eventData.dataset.venue;
const city = eventData.dataset.city;
const country = eventData.dataset.country;

async function fetchDistance(venue, city, country) {
  const distanceText = document.getElementById("distanceText"); 

  try {
    const response = await fetch(`/distance?venue=${encodeURIComponent(venue)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`);
    const data = await response.json();

    if (data.error) {
      distanceText.textContent = "Afstand niet beschikbaar";
      console.error(data.error);
      return;
    }

    distanceText.textContent = `Afstand: ${data.distanceKm} km`;

  } catch (error) {
    console.error(error);
    distanceText.textContent = "Afstand niet beschikbaar";
  }
}


async function afstandBereken() {
  try {
    const params = new URLSearchParams(window.location.search);

    const venue = params.get("venue");
    const city = params.get("city");
    const country = params.get("country");

    const distanceText = document.getElementById("distanceText");

    const response = await fetch(`/distance?venue=${encodeURIComponent(venue)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`);
    const data = await response.json();

    if (data.error) {
      distanceText.textContent = "Afstand niet beschikbaar";
      console.error(data.error);
      return;
    }

    distanceText.textContent = `Afstand: ${data.distanceKm} km`;

  } catch (error) {
    console.error(error);
    distanceText.textContent = "Afstand niet beschikbaar";
  }
}