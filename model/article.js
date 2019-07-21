let mongoose = require("mongoose");

let articleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      require: true
    },
    author: {
      type: String,
      require: true
    },
    body: {
      type: String,
      require: true
    }
  },
  { collection: "article" }
);

let Article = (module.exports = mongoose.model("Articles", articleSchema));
