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

app.get(`/artist/:artist`, async (req, res) => {

    const artist = encodeURIComponent(req.params.artist);

    const url = `https://rest.bandsintown.com/artists/${artist}?app_id=${apiKey}`;

    try {

        const response = await fetch(url);
        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "API request mislukt" });

    }

});