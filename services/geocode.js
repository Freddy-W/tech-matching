const orsKey = process.env.ORSKEY;

// functie voor geocode adressen
async function geocodeAddress(address) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${orsKey}&text=${encodeURIComponent(address)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Adres niet gevonden: " + address);
  }

  const coords = data.features[0].geometry.coordinates;
  return { lon: coords[0], lat: coords[1] };
}

// afstand over een volledige route (driver -> passagiers -> concert -> terug)
async function getDistanceVolledig(coordinatesArray) {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

  const body = {
    coordinates: coordinatesArray
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": orsKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("Geen route gevonden");
  }

  const meters = data.routes[0].summary.distance;
  return meters / 1000;
}

async function getDistanceKm(fromCoords, toCoords) {
  const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

  const body = {
    coordinates: [
      [fromCoords.lon, fromCoords.lat],
      [toCoords.lon, toCoords.lat]
    ]
  };

  //afstand berekening a.d.h.v. de ORS url (gevraagd aan ChatGPT)
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": orsKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error("Geen route gevonden");
  }

  const meters = data.routes[0].summary.distance;
  return meters / 1000;
}

module.exports = { geocodeAddress, getDistanceVolledig, getDistanceKm };
