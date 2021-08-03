const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FormattedMovie = new Schema(
  {
    
  },
  { strict: false }
);

exports.FormattedMovieModel = mongoose.model("FormattedMovie", FormattedMovie);