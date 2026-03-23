// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let combo = 0;    // Will track the current combo count for scoring purposes
let timer = 30;    // Will track the time left in the game for display and end condition
let score = 0;    // Will track the player's score based on caught drops and combos
let timerInterval; // Will store the timer that counts down the game time

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

// Add play again button to restart the game after it ends
document.getElementById("play-again-btn").addEventListener("click", resetGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

  // Start the game timer
  startTimer();
}

function startTimer() {
  // Update the timer display every second
  timerInterval = setInterval(() => {
  timer--;
  document.getElementById("time").textContent = timer; // Update the timer display on the screen

    // End the game when the timer reaches zero
    if (timer <= 0) {
      clearInterval(timerInterval); // Stop the timer
      endGame();
    }
  }, 1000);      //Decrement timer every 1000 milliseconds (1 second)
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Add click event to catch the drop
  drop.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent click from affecting other elements
   
  combo++; // Increase combo count for scoring
  score += 10; // Add points for catching the drop
  document.getElementById("score").textContent = score; // Update score display
  document.getElementById("combo").textContent = combo; // Update combo display
  drop.remove(); // Remove the drop from the screen when caught

  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

function endGame() {
  // Stop the game and reset state
  gameRunning = false;
  clearInterval(dropMaker); // Stop creating new drops
  clearInterval(timerInterval); // Stop the timer
  
  // Remove all existing drops from the screen
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());
  document.getElementById("end-screen").classList.remove("hidden");
  document.getElementById("final-score").textContent =
    `You collected ${score} liters of clean water! 💧`;

  let endMessage; // Create a personalized message based on the player's score
  if (score >= 200) {
    endMessage = "🌟 Amazing! You're a water conservation hero!";
  } else {
    endMessage = "💧 Great effort! Every drop counts!";
  }
  document.getElementById("end-message").textContent = endMessage;
}

function resetGame() {
  // Reset all game variables to their initial state
  gameRunning = false;
  combo = 0;
  timer = 30;
  score = 0;

  // Update the display to reflect the reset state
  document.getElementById("score").textContent = score;
  document.getElementById("combo").textContent = combo;
  document.getElementById("time").textContent = timer;
  
  // Hide the end screen and show the start button again
  document.getElementById("end-screen").classList.add("hidden");
  
  // Remove any remaining drops from the screen
  const drops = document.querySelectorAll(".water-drop");
  drops.forEach(drop => drop.remove());
}

