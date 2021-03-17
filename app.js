// Dependencies
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const secrets = require("./secrets");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(`mongodb+srv://admin-wong:${secrets.password}@cluster0.kj1fe.mongodb.net/quizDB`, {useNewUrlParser: true});

// Create schema
const scoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  }
});
const Score = mongoose.model("Score", scoreSchema);

//const default = new Score({"Average Joe", 0});

// App routes
app.get('/', function(req, res) {
  res.render("home");
});

app.get('/game', function(req, res) {
  res.render("game");
});

app.post('/game', function(req, res) {
  const userScore = req.body.userScore;
  //console.log(userScore);
  Score.find({}, {}, {$sort: {value: -1}}, function(err, scores) {
    if (err) {
      res.sendStatus(404);
      console.log(err);
    }
    else {
      if (scores.length > 0) res.render("end",
        {highScore: scores.sort(function(a,b) {
          return b.value - a.value;})[0].value,
         userScore: userScore
        });
      else res.render("end", {highScore: 0, userScore: userScore});
    }
  });
});

app.get('/scores', function(req, res) {
  Score.find({}, null, {$sort: {value: -1}}, function(err, scores) {
    if (err) {
      res.sendStatus(404);
      console.log(err);
    }
    else {
      if (scores) res.render("scores",
        {scores: scores.sort(function(a,b) {
          return b.value - a.value;
        })});
      else res.render("scores", {scores: []});
    }
  });
});

app.get('/end', function(req, res) {
  Score.find({}, {}, {$sort: {value: -1}}, function(err, scores) {
    if (err) {
      res.sendStatus(404);
      console.log(err);
    }
    else {
      if (scores.length > 0) res.render("end",
        {highScore: scores.sort(function(a,b) {
          return b.value - a.value;})[0].value,
         userScore: 0
        });
      else res.render("end", {highScore: 0, userScore: 0});
    }
  });
});

app.post('/end', function(req, res) {
  const newScore = new Score({
    name: req.body.username,
    value: req.body.score
  });
  newScore.save();
  res.redirect("/");
});


app.listen(port, function() {
  console.log(`Server has started on port ${port}.`);
});
