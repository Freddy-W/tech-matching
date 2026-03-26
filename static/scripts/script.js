// https://www.youtube.com/watch?v=DfSYmk_6vk8
window.onload = function() {
    slideOne();
    slideTwo();
}

let sliderOne = document.getElementById("slider-1");
let sliderTwo = document.getElementById("slider-2");
let displayValOne = document.getElementById("range1");
let displayValTwo = document.getElementById("range2");
let minGap = 0;
let slidertrack = document.querySelector(".slider-track");
let sliderMaxValue = document.getElementById("slider-1").max;
let filteropties = document.getElementById("filtergedeelte");

document.getElementById("filterbutton").addEventListener("click", filteropen);

function filteropen() {
    if (filteropties.style.display === "block") {
        filteropties.style.display = "none";
    } else {
        filteropties.style.display = "block";
    }
}

function slideOne() {
    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
        sliderOne.value = parseInt(sliderTwo.value) -minGap;
    }
    displayValOne.textContent = sliderOne.value;
    fillColor();
}

function slideTwo() {
    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }
    displayValTwo.textContent = sliderTwo.value;
    fillColor();
}

function fillColor() {
    percent1 = (sliderOne.value / sliderMaxValue) * 100;
    percent2 = (sliderTwo.value / sliderMaxValue) * 100;
    slidertrack.style.background = `linear-gradient(to right, 
    hsl(0, 0%, 85%) ${percent1}%,
  hsl(187, 69%, 37%) ${percent1}%,
  hsl(187, 69%, 37%) ${percent2}%,
  hsl(0, 0%, 85%) ${percent2}%)`;
}

document.getElementById("searchBtn").addEventListener("click", async () => {

    console.log("Button werkt");
    const artist = document.getElementById("artistInput").value;

    if (!artist) return;

    const response = await fetch(`/artist/${encodeURIComponent(artist)}`);
    const data = await response.json();

    console.log("FRONTEND DATA:", data);

    const results = document.getElementById("results");
    results.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        results.innerHTML = "<p>Geen aankomende events gevonden.</p>";
        return;
    }

    data.forEach(event => {

        results.innerHTML += `
            <div class="event">
                <h3>${event.artist}</h3>
                <p><strong>Datum:</strong> ${event.date}</p>
                <p><strong>Tijd:</strong> ${event.time}</p>
                <p><strong>Locatie:</strong> ${event.venue} (${event.city}, ${event.country})</p>
                <a href="${event.url}" target="_blank">Tickets</a>
            </div>
        `;
    });

});


// CONCERT OPSLAAN NIET COMPLEET
const addConcertBtn = document.getElementById("...");

// function addConcert() {
//     const ticketMUrl = 'https://app.ticketmaster.com/discovery/v2/';

//     app.get(ticketMUrl/events/{id})
// };

addConcertBtn.addEventListener('click', addConcert());