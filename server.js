const express = require("express");
const app = express();
const port = 2020;

// const { MongoClient, ServerApiVersion } = require("mongodb");
// require("dotenv").config();const { MongoClient, ServerApiVersion } = require("mongodb");

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static("static"));

app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/test', (req, res) => {
    res.send("De test is geslaagd, de URL /test is bereikbaar");
});

app.get('/events/:artist', async (req, res) => {

    const artist = encodeURIComponent(req.params.artist);

    const url = `https://rest.bandsintown.com/artists/${artist}/events?app_id=21a483ff79534f273cf4025645b28051`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "API request mislukt" });

    }

});