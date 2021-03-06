var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");
var PORT = process.env.PORT || 3000;

var app = express();


app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperdb";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function (req, res) {
    axios.get("https://old.reddit.com/r/Games/").then(function (response) {
        var $ = cheerio.load(response.data);
        $("p.title").each(function (i, element) {
            var result = {};
            result.title = $(this).text();
            result.link = $(this).children("a").attr("href");

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err)
                })
        });
        res.send("Scrape Complete");

    });
});

app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err)
        });
});

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err)
        });
});

app.get("/delete/:id/", function (req, res) {
    db.Note.remove({ _id: req.params.id }, { title: [db.Note.title] }, {
        body: [db.Note.title]
    },
        function (removed) {
            res.send(removed)
        }
    );
})



app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});