const express = require("express");
const router = express.Router();

const apiKey = process.env.APIKEY;

//events renderen die binnenkort in Nederland te zien zijn zodat deze op de index pagina weergeven kunnen worden
router.get("/events", async (req, res) => {

  //alle aankomende muziekevents in NL ophalen, ook die verder in de toekomst liggen
  const pageSize = 200;     // maximaal aantal events per pagina bij Ticketmaster
  const maxResults = 1000;  // Ticketmaster staat maximaal 1000 resultaten toe via paging
  const baseUrl = `https://app.ticketmaster.com/discovery/v2/events.json?size=${pageSize}&sort=date,asc&classificationName=music&countryCode=NL&apikey=${apiKey}`;

  try {
      let events = [];
      let pageNumber = 0;
      let totalPages = 1;

      //alle beschikbare pagina's doorlopen tot de limiet van de API
      do {
          const response = await fetch(`${baseUrl}&page=${pageNumber}`);
          const data = await response.json();

          if (data.fault) {
              console.error("API ERROR:", data.fault);
              return res.status(400).json({ error: "API key werkt niet of geen toegang" });
          }

          if (!data._embedded || !data._embedded.events) {
              break;
          }

          events = events.concat(data._embedded.events);
          totalPages = data.page?.totalPages || 1;
          pageNumber++;
      } while (pageNumber < totalPages && pageNumber * pageSize < maxResults);

      if (events.length === 0) {
          return res.json([]);
      }

      //huidige datum (lokale tijd) als YYYY-MM-DD om concerten uit het verleden te verbergen
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const filteredEvents = events.filter(event => {
        const isMusic = event.classifications?.some(c => c.segment?.name.toLowerCase() === "music");

        //data filteren zodat er geen parking permits tussen staan als events
        const unwanted = ["parking", "permit", "parking permit"];
        const nameLower = event.name.toLowerCase();
        const isValidName = !unwanted.some(word => nameLower.includes(word));

        //concerten van gisteren of eerder niet meer tonen (alleen vandaag en in de toekomst)
        const localDate = event.dates?.start?.localDate;
        const isUpcoming = !localDate || localDate >= today;

        return isMusic && isValidName && isUpcoming;
      });

      const infoEvents = filteredEvents.map(event => ({
          id: event.id,
          artist: event.name,
          genre: event.classifications?.[0]?.genre?.name || "Onbekend",
          date: event.dates?.start?.localDate || "Onbekend",
          time: event.dates?.start?.localTime || "Onbekend",
          venue: event._embedded?.venues?.[0]?.name || "Onbekend",
          city: event._embedded?.venues?.[0]?.city?.name || "",
          country: event._embedded?.venues?.[0]?.country?.name || "",
          url: event.url,
          image: event.images?.find(img => img.ratio === "16_9" && img.width > 1000)?.url
           || event.images?.[0]?.url
           || ""
      }));

      res.json(infoEvents);

  } catch (error) {
      console.error("SERVER ERROR:", error);
      res.status(500).json({ error: "API request mislukt" });
  }
});

//zoeken op artiest in zoekbalk en deze weergeven op een andere endpoint
router.get(`/artist/:artist`, async (req, res) => {

    const artist = req.params.artist;
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(artist)}&size=100&sort=date,asc&classificationName=music&countryCode=NL&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.fault) { //fout afhandeling als API niks teruggeeft
            console.error("API ERROR:", data.fault);
            return res.status(400).json({ error: "API key werkt niet/geen toegang" });
        }

        if (!data._embedded || !data._embedded.events) {
            return res.json([]);
        }

        const events = data._embedded.events;

        //data filteren zodat er geen parking permits tussen staan als events
        const filteredEvents = events.filter(event => {
          const isMusic = event.classifications?.some(c => c.segment?.name.toLowerCase() === "music");

          const unwanted = ["parking", "permit", "parking permit"];
          const nameLower = event.name.toLowerCase();
          const isValidName = !unwanted.some(word => nameLower.includes(word));

          return isMusic && isValidName;
        });

          //de info die uit de API gehaald wordt opslaan als standaard info
      const infoEvents = filteredEvents.map(event => ({
          id: event.id,
          artist: event.name,
          genre: event.classifications?.[0]?.genre?.name || "Onbekend",
          date: event.dates?.start?.localDate || "Onbekend",
          time: event.dates?.start?.localTime || "Onbekend",
          venue: event._embedded?.venues?.[0]?.name || "Onbekend",
          city: event._embedded?.venues?.[0]?.city?.name || "",
          country: event._embedded?.venues?.[0]?.country?.name || "",
          url: event.url,
          image: event.images?.find(img => img.ratio === "16_9" && img.width > 1000)?.url
           || event.images?.[0]?.url
           || ""
      }));

        res.json(infoEvents);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "API request mislukt" });
    }

});

module.exports = router;
