const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");

const app = express();
const port = process.env.port || 5000;

//database
var DATABASEUSERNAME = "admin";
var DATABASEPASSWORD = "admin123";
var DATABASEHOST = "localhost";
var DATABASEPORT = "27017";
var DATABASENAME = "nodekb";
mongoose.connect(
  "mongodb://" +
    DATABASEUSERNAME +
    ":" +
    DATABASEPASSWORD +
    "@" +
    DATABASEHOST +
    ":" +
    DATABASEPORT +
    "/" +
    DATABASENAME,
  { useNewUrlParser: true }
);
let db = mongoose.connection;

db.once("open", function() {
  console.log("Connected to Mongodb");
});
db.on("error", function(err) {
  console.log(err);
});

//body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//set view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//set static folder(public)
app.use(express.static(path.join(__dirname, "public")));

//express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);
//express messages middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
//express validator middleware
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);
//model
let Articles = require("./model/article");

app.get("/", (req, res) => {
  Articles.find({}, function(err, article) {
    if (err) {
      console.log(err);
    } else {
      res.render("index", { title: "Articles", articles: article });
      //console.log(article);
    }
  });
});

//router files
app.use("/article", require("./routes/article"));

app.listen(port, () => {
  console.log(`Application is running on ${port}`);
});

//test branch
