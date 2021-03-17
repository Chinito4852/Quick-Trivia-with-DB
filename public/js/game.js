let currentQuestion = {};
let acceptingAnswers = true;
let score = 0;
let counter = 0;
let availableQuestions = [];
let questions = [];
const MAX_QUESTIONS = 10;

// Fetch questions
fetch("https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple")
  .then(function(res) {
    // Return a json of the API response
    return res.json();
  })
  .then(function(data) {
    // Store the questions
    questions = data.results;
    startGame();
  })
  .catch(function(err) {
    console.log(err);
  });

// Function to start the game
const startGame = function() {
  counter = 0;
  score = 0;
  localStorage.setItem("endScore", score);
  availableQuestions = [...questions];
  getNewQuestion();
  $("#game").removeClass("hidden");
  $("#loader").addClass("hidden");
}

const getNewQuestion = function() {
  if (availableQuestions.length === 0 || counter >= MAX_QUESTIONS) {
    localStorage.setItem("endScore", score);
    //return window.location.assign("/end");
    console.log("ending");
    $("#game-form").submit();
    return;
  }
  counter++;

  // Update question innerText
  let questionsIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionsIndex];
  $("#question").text(currentQuestion.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'"));
  // Fetch answer
  let answers = Array.from(currentQuestion.incorrect_answers);
  answers.push(currentQuestion.correct_answer);
  shuffle(answers);
  // Re-format answers to properly display quotations
  answers.forEach(function(answer) {
    answer = answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'");
  });
  // Update choice text
  $(".choice-text").each(function(index) {
    $(this).text(answers[index]);
  });
  // Update question count and progress bar
  $("#question-hud-text").text(`Question ${counter} / ${MAX_QUESTIONS}`);
  $("#progress-bar-fill").css("width", `${(counter / MAX_QUESTIONS) * 100}%`);
  availableQuestions.splice(questionsIndex, 1);
  acceptingAnswers = true;
}

// Fisher-Yates shuffle
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
const shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

$(document).ready(function() {
  // Add click handler for each answer choice
  $(".choice-text").each(function(index) {
    $(this).click(function() {
      // Do nothing if the game should not be accepting answers
      if (!acceptingAnswers) return;
      acceptingAnswers = false;
      let thisElement = $(this);
      // Evalaute the answer
      const answerClass = (thisElement.text() === currentQuestion.correct_answer) ? "correct" : "incorrect";
      // Update score
      score = (answerClass === "correct") ? score + 1 : score;
      thisElement.parent().addClass(answerClass);
      $("#score-point").text(` ${score}`);
      $("#user-score").attr("value", score.toString());
      //console.log($("#user-score").attr("value"));
      // Delay by 1000ms before fetching a new question
      setTimeout(function() {
        thisElement.parent().removeClass(answerClass);
        getNewQuestion();
      }, 1000);
    });
  });

});
