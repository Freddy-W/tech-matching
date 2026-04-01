// https://www.youtube.com/watch?v=DfSYmk_6vk8
window.onload = function() {
    // slideOne();
    // slideTwo();
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

const searchBtn = document.querySelector("button");

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
// const addConcertBtn = document.getElementById("...");

// function addConcert() {
//     const ticketMUrl = 'https://app.ticketmaster.com/discovery/v2/';

//     app.get(ticketMUrl/events/{id})
// };

// addConcertBtn.addEventListener('click', addConcert());

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
