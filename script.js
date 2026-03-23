document.getElementById("searchBtn").addEventListener("click", async () => {

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