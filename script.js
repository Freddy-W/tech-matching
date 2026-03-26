const button = document.getElementById("searchBtn");

document.getElementById("searchBtn").addEventListener("click", async () => {

    const artist = document.getElementById("artistInput").value;

    const response = await fetch(`http://localhost:2020/artist/${encodeURIComponent(artist)}`);

    const data = await response.json();

    console.log(data);

    const results = document.getElementById("results");

    results.innerHTML = 
        `<h2>${data.name}</h2>
        <p>Upcoming events: ${data.upcoming_event_count}</p>`;

});


// CONCERT OPSLAAN NIET COMPLEET
const addConcertBtn = document.getElementById("...");

function addConcert() {
    app.get('/artist/:artist', async (req,res) => {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(artist)}&size=10&sort=date,asc&apikey=${apiKey}`;
        const currentConcert = concertId;

        app.fetch({url} + "/events/currentConcert/" + {currentConcert})

    })
};

addConcertBtn.addEventListener('click', addConcert());