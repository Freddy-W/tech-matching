// import List from 'list.js';

window.onload = function() {
    loadDefaultEvents();
}

const filterBtn = document.querySelector("button:nth-of-type(2)");
const filteropties = document.getElementById("filtergedeelte");
const closeBtn = document.getElementById("annuleer");

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
function renderEvents(data) {
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
                <img src="${event.image}" alt="${event.artist}" style="max-width: 200px; border-radius: 8px;">
                <div class="eventinfo">
                <h3>${event.artist}</h3>
                <p><strong>Genre:</strong> ${event.genre}</p>
                <!-- <p><strong>Tijd:</strong> ${event.time}</p> -->
                <p><strong>Datum:</strong> ${event.date}</p>
                <p><strong>Locatie:</strong> ${event.venue} (${event.city})</p>
                <a href="${event.url}" target="_blank">Tickets</a>
                </div>
            </div>
            </a>
        `;
    });
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

// CONCERT OPSLAAN NIET COMPLEET
// const addConcertBtn = document.getElementById("...");

// function addConcert() {
//     const ticketMUrl = 'https://app.ticketmaster.com/discovery/v2/';

//     app.get(ticketMUrl/events/{id})
// };

// addConcertBtn.addEventListener('click', addConcert());

