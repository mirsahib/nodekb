const express = require("express");
const router = express.Router();

//model
let Articles = require("../model/article");

router.get("/add", (req, res) => {
  res.render("add_article", { title: "Add Article" });
});

router.post("/add", (req, res) => {
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

router.get("/edit/:id", (req, res) => {
  Articles.findById(req.params.id, function(err, article) {
    res.render("edit_article", { title: "Edit Article", article: article });
  });
});
//update article
router.post("/edit/:id", (req, res) => {
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
//get single article
router.get("/:id", (req, res) => {
  Articles.findById(req.params.id, function(err, article) {
    res.render("article", { article: article });
  });
});
router.delete("/:id", (req, res) => {
  let query = { _id: req.params.id };
  Articles.deleteOne(query, function(err) {
    if (err) {
      console.log(err);
    } else {
      req.flash("success", "Article Deleted");
      res.send("Success");
    }
  });
});

module.exports = router;
