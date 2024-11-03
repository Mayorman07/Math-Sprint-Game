const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
const countdown = document.querySelector('.countdown');
const itemContainer = document.querySelector('.item-container');
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';


// Scroll
let valueY = 0;


//Refresh splash page pbest scores
function bestScoresToDOM(){
 bestScores.forEach((bestScore, index)=>{
const bestScoreEl = bestScore;
bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`
 });
}

//Check local storage for best scores and set best score array value
function getSavedBestScores(){
  if(localStorage.getItem('bestScores')){
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else{
    bestScoreArray = [
       {questions : 10, bestScore: finalTimeDisplay},
       {questions : 25, bestScore: finalTimeDisplay},
       {questions : 50, bestScore: finalTimeDisplay},
       {questions : 100, bestScore: finalTimeDisplay},

    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

function celebrateNewHighScore() {
  const celebrationSound = new Audio('/sounds/endgame.mp3');

  // Trigger confetti
  confetti({
    particleCount: 1000,
    spread: 100,
    origin: { y: 0.6 }
  });

  // Play the celebration sound
  celebrationSound.currentTime = 0; // Reset sound to start
  celebrationSound.play(); // Play the sound

  // Show the high score modal
  const modal = document.getElementById('high-score-modal');
  const highScoreValue = document.getElementById('high-score-value');
  
  highScoreValue.textContent = finalTimeDisplay; // Assuming finalTimeDisplay is defined in your context
  modal.style.display = 'block';

  // Close the modal when the user clicks the close button
  const closeButton = document.querySelector('.close-button');
  closeButton.onclick = function() {
    modal.style.display = 'none';
  };

  // Close the modal when the user clicks anywhere outside of the modal
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}


// Modify the updateBestScore function to call the celebrateNewHighScore function
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
      // select correct best score to update
      if (questionAmount == score.questions) {
          // Return best score as number with one decimal
          const savedBestScore = Number(bestScoreArray[index].bestScore);
          // update if the new final score is less or replacing zero
          if (savedBestScore == 0 || savedBestScore > finalTime) {
              bestScoreArray[index].bestScore = finalTimeDisplay;
              celebrateNewHighScore(); // Celebrate the new high score
          }
      }
  });
  // update splash page
  bestScoresToDOM();
  // save to local storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

// reset game
function playAgain(){
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;

}

//show score page

function showScorePage(){
  //show play again button after 1 second
  setTimeout(()=>{
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;

}

// scores to DOM - Format and display time in DOM
function scoresToDOM(){
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `For wrong answers: + ${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  updateBestScore();
  //scrol to the top of item contained and got o score page
  itemContainer.scrollTo({ top: 0, behavior: 'instant'});
  showScorePage();
}

//try smooth for behoavor scroll to

//Stop timer and process the results, go to score page
function checkTime(){
  console.log(timePlayed)
  if(playerGuessArray.length == questionAmount){
    clearInterval(timer);

    //check for wrong guesses and add penalty time
    equationsArray.forEach((equation, index) =>{
       if(equation.evaluated === playerGuessArray[index]){
        //correct guess. no penalty

       } else{
      // incorrect guess and penalty
   penaltyTime += 0.5;
       }
    });
    finalTime = timePlayed + penaltyTime;
    console.log('time', timePlayed, 'penalty', penaltyTime,'final:', finalTime)
    scoresToDOM();
  }
  
}

//Add a tenth of a second to timeplayed
function addTime(){
  timePlayed += 0.1;
  checkTime();
}

//Start timer when game oage is clicked
function startTimer(){

  //reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer);
}


//Scroll, store user selection in player guess array

function select(guessedTrue) {
  // Scroll 80 pixels
  valueY += 80;
  itemContainer.scroll(0, valueY);
  

  // Play sound based on the user's guess
  const correctSound = document.getElementById('correct-sound');
  const wrongSound = document.getElementById('wrong-sound');
  console.log(correctSound, wrongSound); // Check if they are not null


  if (guessedTrue) {
    correctSound.currentTime = 0; // Reset sound to start
    correctSound.play(); // Play correct sound
  } else {
    wrongSound.currentTime = 0; // Reset sound to start
    wrongSound.play(); // Play wrong sound
  }
   // Add player guess to array
   return  guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false');
}


//Display game page

function showGamePage(){
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

//Get random number up to a max number

function getRandomInt(max){
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount)
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

//add equations to DOM
function equationsToDOM(){
   equationsArray.forEach((equation)=>{

    //item

    const item = document.createElement('div');
    item.classList.add('item');

    //equation text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;

    //Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
   });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);


  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

//Get the value from selected radio button
//Navigate from splash page to countdown page

//Displays 3,2,1, Goo!
function countdownStart(){
   countdown.textContent = '3';
   setTimeout(()=>{
    countdown.textContent = '2';
   }, 1000);
   setTimeout(()=>{
    countdown.textContent = '1';
   }, 2000);
   setTimeout(()=>{
    countdown.textContent = 'GO!';
   }, 3000);
}


//Navigate from splash page to countdown page

function showCountDown(){
  countdownPage.hidden=false;
  splashPage.hidden=true;
  countdownStart();   
  populateGamePage();
  setTimeout(showGamePage, 4000);
}
function getRadioValue(){
  let radioValue;
  radioInputs.forEach((radioInput)=>{
    if(radioInput.checked){
      radioValue=radioInput.value;
    }
  });
  return radioValue;
}
//Form that decides amount of questions
function selectQuestionAmount(e){
  e.preventDefault();
  questionAmount = getRadioValue();
  console.log('question amount:', questionAmount)
  if(questionAmount){
    showCountDown();
  }
}

startForm.addEventListener('click', ()=>{
  radioContainers.forEach((radioEl)=>{

    // Remove selected label styling
    radioEl.classList.remove('selected-label');
    //Add it back if the radio input is checked
    if(radioEl.children[1].checked){
      radioEl.classList.add('selected-label');
    }
  });
});

//Event Listeners

startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

//on lOAD

getSavedBestScores();