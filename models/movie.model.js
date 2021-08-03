const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Movie = new Schema(
  {
    
  },
  { strict: false }
);

exports.MovieModel = mongoose.model("Movie", Movie);