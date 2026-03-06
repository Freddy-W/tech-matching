const express = require('express');
const app = express();
const port = 3000;

// static files serveren
app.use(express.static('static'));

app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});