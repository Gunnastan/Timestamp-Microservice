// index.js
// where your node app starts

require("dotenv").config();
// init project
var express = require("express");
var app = express();
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
const shortid = require("shortid");

// console.log(process.env.DB_URI)
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/time", function (req, res) {
  res.sendFile(__dirname + "/views/time.html");
});

app.get("/getheaderparser", function (req, res) {
  res.sendFile(__dirname + "/views/headerparser.html");
});

app.get("/getheaderparser", function (req, res) {
  res.sendFile(__dirname + "/views/headerparser.html");
});

app.get("/urlshortner", function (req, res) {
  res.sendFile(__dirname + "/views/urlshortner.html");
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api", function (req, res) {
  var presentDate = new Date();
  res.json({
    unix: presentDate.getTime(),
    utc: presentDate.toUTCString(),
  });
});

app.get("/api/whoami", function (req, res) {
  res.json({
    "ip address": req.connection.remoteAddress,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"],
  });
});

var ShortenedURL = mongoose.model(
  "ShortURL",
  new mongoose.Schema({
    short_url: String,
    original_url: String,
    suffix: String,
  })
);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post("/api/shorturl", function (req, res) {
  let requestedURL = req.body.url;
  let suffix = shortid.generate();
  let newShortURL = suffix;
  console.log(suffix, "<= this new suffix");

  let newURL = new ShortenedURL({
    original_url: requestedURL,
    suffix: suffix,
    short_url: "/api/shorturl/" + suffix,
  });

  newURL.save((error, doc) => {
    if (error) return console.error(err);
    console.log("Saved Successfully");
    res.json({
      "short url": newURL.short_url,
      "original url": newURL.original_url,
      suffix: newURL.suffix,
      saved: true,
    });
  });
});

app.get("/api/shorturl/:suffix", async function (req, res) {
  let UserSuffix = req.params.suffix;
  let UserRequestedUrl = await ShortenedURL.find({ suffix: UserSuffix }).then(
    function (resultingURLs) {
      let foundUrl = resultingURLs[0];
      res.redirect(foundUrl.original_url);
    }
  );
});

app.get("/api/:date", function (req, res) {
  let date = req.params.date;

  if (parseInt(date) > 7000) {
    let unixTime = new Date(parseInt(date));
    res.json({
      unix: unixTime.getTime(),
      utc: unixTime.toUTCString(),
    });
  }

  let requiredDate = new Date(date);
  console.log(date);
  if (requiredDate === "Invalid Date") {
    res.json({ error: "Invalid Date" });
  } else {
    res.json({
      unix: requiredDate.getTime(),
      utc: requiredDate.toUTCString(),
    });
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});