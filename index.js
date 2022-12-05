// index.js
// where your node app starts

// init project
var express = require("express");
var app = express();

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
    "language": req.headers["accept-language"],
    "software": req.headers["user-agent"]
  });
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
