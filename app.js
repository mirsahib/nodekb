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

//model
let Articles = require("./model/article");

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

app.get("/article/add", (req, res) => {
  res.render("add_article", { title: "Add Article" });
});

//get single article
app.get("/article/:id", (req, res) => {
  Articles.findById(req.params.id, function(err, article) {
    res.render("article", { article: article });
  });
});

app.post("/article/add", (req, res) => {
  req.checkBody("title", "title is require").notEmpty();
  req.checkBody("author", "author is require").notEmpty();
  req.checkBody("body", "body is require").notEmpty();

  let errors = req.validationErrors();

  if (errors) {
    res.render("add_article", { title: "Add article", errors: errors });
  } else {
    let article = new Articles();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.article_body;

    article.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        req.flash("success", "Article Added");
        res.redirect("/");
      }
    });
  }
});

app.get("/article/edit/:id", (req, res) => {
  Articles.findById(req.params.id, function(err, article) {
    res.render("edit_article", { title: "Edit Article", article: article });
  });
});
//update article
app.post("/article/edit/:id", (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.article_body;

  let query = { _id: req.params.id };

  Articles.updateOne(query, article, function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash("success", "Article Updated");
      res.redirect("/");
    }
  });
});
app.delete("/article/:id", (req, res) => {
  let query = { _id: req.params.id };
  Articles.remove(query, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.send("Success");
    }
  });
});

app.listen(port, () => {
  console.log(`Application is running on ${port}`);
});
