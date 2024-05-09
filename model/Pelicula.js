const mongoose = require("mongoose");

const peliculaSchema = new mongoose.Schema({
  nombre: String,
  año: Number,
  director: String,
  actores: String,
  img: String,
  descripción: String
});

module.exports = mongoose.model("Pelicula", peliculaSchema);
