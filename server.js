const express = require("express");
require("dotenv").config();
const app = express();
const port = 2020;

const apiKey = process.env.API_KEY;

console.log(process.env.API_KEY);

app.use(express.static("static"));

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});

app.use(express.static("public"));

app.get("/artist/:artist", async (req, res) => {

    const artist = req.params.artist;

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(artist)}&size=10&sort=date,asc&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("DATA:", JSON.stringify(data, null, 2));

        //API fout afhandeling
        if (data.fault) {
            console.error("API ERROR:", data.fault);
            return res.status(400).json({ error: "API key werkt niet of geen toegang" });
        }

        //bestaan de events?
        if (!data._embedded || !data._embedded.events) {
            return res.json([]);
        }

        const events = data._embedded.events;
        
        const formattedEvents = events.map(event => ({
            artist: event.name,
            date: event.dates?.start?.localDate || "Onbekend",
            time: event.dates?.start?.localTime || "Onbekend",
            venue: event._embedded?.venues?.[0]?.name || "Onbekend",
            city: event._embedded?.venues?.[0]?.city?.name || "",
            country: event._embedded?.venues?.[0]?.country?.name || "",
            url: event.url
        }));

        res.json(formattedEvents);

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ error: "Server fout" });
    }

});