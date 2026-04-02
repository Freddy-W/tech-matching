// https://www.youtube.com/watch?v=DfSYmk_6vk8
window.onload = async function() {
    // slideOne();
    // slideTwo();
    ladenBeginEvents();
    afstandBereken();
}

// let sliderOne = document.getElementById("slider-1");
// let sliderTwo = document.getElementById("slider-2");
// let displayValOne = document.getElementById("range1");
// let displayValTwo = document.getElementById("range2");
// let minGap = 0;
// let slidertrack = document.querySelector(".slider-track");
// let sliderMaxValue = document.getElementById("slider-1").max;
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

setStars(ratingInput.value);

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

// function slideOne() {
//     if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
//         sliderOne.value = parseInt(sliderTwo.value) -minGap;
//     }
//     displayValOne.textContent = sliderOne.value;
//     fillColor();
// }

// function slideTwo() {
//     if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
//         sliderTwo.value = parseInt(sliderOne.value) + minGap;
//     }
//     displayValTwo.textContent = sliderTwo.value;
//     fillColor();
// }

// function fillColor() {
//     percent1 = (sliderOne.value / sliderMaxValue) * 100;
//     percent2 = (sliderTwo.value / sliderMaxValue) * 100;
//     slidertrack.style.background = `linear-gradient(to right, 
//     hsl(0, 0%, 85%) ${percent1}%,
//   hsl(187, 69%, 37%) ${percent1}%,
//   hsl(187, 69%, 37%) ${percent2}%,
//   hsl(0, 0%, 85%) ${percent2}%)`;
// }

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
// const zoekKnop = document.getElementById("zoekKnop");

// if (zoekKnop) {
//     zoekKnopx.addEventListener("click", async () => {
//         console.log("Button werkt");

//         const artistInput = document.getElementById("artistInput");
//         if (!artistInput) return;

//         const artist = artistInput.value;
//         if (!artist) return;

//         try {
//             const response = await fetch(`/artist/${encodeURIComponent(artist)}`);
//             const data = await response.json();

//             ladenEvents(data);

//         } catch (error) {
//             console.error("Fout bij ophalen artist events:", error);
//         }
//     });
// };

const zoekKnop = document.getElementById("zoekKnop");

if (zoekKnop) {
    zoekKnop.addEventListener("click", async () => {
        const artistInput = document.querySelector("input");
        if (!artistInput) return;

        const artist = artistInput.value;
        if (!artist) return;

        try {
            const response = await fetch(`/artist/${encodeURIComponent(artist)}`);
            const data = await response.json();

            ladenEvents(data); // toont de gevonden concerten

        } catch (error) {
            console.error("Fout bij ophalen artist events:", error);
        }
    });
}

document.querySelector("input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        zoekKnop.click();
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

            ladenEvents(filtered);
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