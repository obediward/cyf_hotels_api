const express = require("express");
const app = express();
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const secrets = require("./secrets");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_hotels",
  password: secrets.dbPassword,
  port: 5432
});

app.use(bodyParser.json());

app.get("/hotels", function(req, res) {
  pool
    .query("SELECT * FROM hotels")
    .then(result => res.json(result.rows))
    .catch(err => res.status(500).send(error));
});

app.post("/hotels", function(req, res) {
  const newHotelName = req.body.name;
  const newHotelRooms = req.body.rooms;
  const newHotelPostcode = req.body.postcode;

  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send("The number of rooms should be a positive integer.");
  }

  pool
    .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
    .then(result => {
      if (result.rows.length > 0) {
        return res.status(400).send("An hotel with the same name already exists!");
      } else {
        const query = "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
        pool.query(query, [newHotelName, newHotelRooms, newHotelPostcode])
          .then(() => res.send("Hotel created!"))
          .catch(e => res.status(500).send(e));
      }
    });
});

app.listen(3000, function() {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});
