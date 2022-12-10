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

app.get("/exercisetracker", function (req, res) {
  res.sendFile(__dirname + "/views/Exercisetracker.html");
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

let User = mongoose.model("User", new mongoose.Schema ({
  username: {type: String, unique: true},
  _id: String
}))

let Exercise = mongoose.model("Exercise", new mongoose.Schema ({
  username: String,
  description: {type: String, required: true},
  duration: Number,
  date: Date,
  _id: String
}))

let count = 0;

app.post("/api/users", function (req, res) {
  console.log("first log")
  let userID = mongoose.Types.ObjectId()
  let userName = req.body.username
  console.log(userID)
  let newUser = new User({
    username: req.body.username,
    _id: userID
  });

  console.log("user added but not saved")

  newUser.save((err, doc) => {
    if (err) return console.error(err);
    console.log("Saved Successfully");
    res.json({
      "added": true,
      "username": newUser.username,
      _id: newUser._id
    });
  });
})

app.get("/api/users", async (req, res) => {
  console.log("get req")
  let allUsers = await User.find()

  console.log("users found")
  res.json(allUsers)
})

app.post("/api/users/:_id/exercises", async (req, res) => {

  // let userID = mongoose.Types.ObjectId()
  console.log(req.params._id, "<= req params")
  const _id = req.params._id
  console.log(_id)
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  let presentDate = ''
  if (!date) {
    presentDate = new Date(Date.now())

    console.log("date set here")

    let myUser = await User.find({_id: _id})

    console.log(myUser, "<= userdetails")
    
    let newExercise = new Exercise({
      username: myUser.username,
      description: description,
      duration: duration,
      date: presentDate.toString(),
      _id: _id
    })

    console.log(newExercise, "<=== newExercise schema")

    newExercise.save( async (err, doc) => {
      console.log(myUser, "<= just before save")
      if (err) return console.error(err);
      console.log("Exercise Saved Successfully");
      res.json({
        "added": true,
        "username": myUser.username,
        "description": description,
        "duration": parseInt(duration),
        "date": presentDate.toString(),
        "_id": myUser._id
      });
    });
  } else {
    // console.log("next if statement")
    presentDate = date;
    if (presentDate.match(/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/)) {
      let tempDate = presentDate.split('-')
      tempDate = new Date(tempDate[0],tempDate[1]-1,tempDate[2])

      let myUser = await User.find({_id: _id})

      let newExercise = new Exercise({
        username: myUser.username,
        description: description,
        duration: duration,
        date: tempDate.toISOString(),
        _id: myUser["_id"]
      })

      newExercise.save((err, doc) => {
        if (err) return console.error(err);
        // console.log("Saved Successfully");
        res.json({
          "added": true,
          "username": myUser.username,
          "description": description,
          "duration": parseInt(duration),
          "date": tempDate.toISOString(),
          "_id": myUser["_id"]
        });
      });
      
    } else {
      res.json({error: "Invalid Date Format"})
    }
  }
})

app.get('')

app.get("/api/:date", (req, res) => {
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