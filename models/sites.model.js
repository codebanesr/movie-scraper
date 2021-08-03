const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let Site = new Schema(
  {
    _id: String
  },
  { strict: false }
);

exports.SiteModel = mongoose.model("Site", Site);