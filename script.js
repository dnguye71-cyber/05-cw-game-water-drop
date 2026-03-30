// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let combo = 0;    // Will track the current combo count for scoring purposes
let timer = 30;    // Will track the time left in the game for display and end condition
let score = 0;    // Will track the player's score based on caught drops and combos
let timerInterval; // Will store the timer that counts down the game time
let currentDifficulty = null; // Will track the current difficulty level of the game (easy, medium, hard)

// Drop management
let currentWaterDrop = null;
let waterDropInterval = null;
let currentBadDrops = [];
const MAX_BAD_DROPS = 2;
let badDropSpawnInterval = null;

// Difficulty settings
const difficultySettings = {
  easy: {
    duration: 40,
    winThreshold: 200,
    waterDropSpawnRate: 1500,
    badDropSpawnInterval: 4000,
    maxBadDrops: 1,
    dropSize: 60,
    badDropSize: 50
  },
  normal: {
    duration: 30,
    winThreshold: 200,
    waterDropSpawnRate: 1000,
    badDropSpawnInterval: 3500,
    maxBadDrops: 2,
    dropSize: 60,
    badDropSize: 50
  },
  hard: {
    duration: 20,
    winThreshold: 300,
    waterDropSpawnRate: 700,
    badDropSpawnInterval: 2500,
    maxBadDrops: 2,
    dropSize: 45,
    badDropSize: 40
  }
};

// ===== EVENT LISTENERS =====
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("play-again-btn").addEventListener("click", resetGame);

// Difficulty selection buttons
document.getElementById("easy-btn").addEventListener("click", () => setDifficulty("easy"));
document.getElementById("normal-btn").addEventListener("click", () => setDifficulty("normal"));
document.getElementById("hard-btn").addEventListener("click", () => setDifficulty("hard"));

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

// Add play again button to restart the game after it ends
document.getElementById("play-again-btn").addEventListener("click", resetGame);

// ===== DIFFICULTY SYSTEM =====

function showDifficultyScreen() {
  document.getElementById("difficulty-screen").style.display = "flex";
}

function hideDifficultyScreen() {
  document.getElementById("difficulty-screen").style.display = "none";
}

function setDifficulty(difficulty) {
  currentDifficulty = difficulty;
  const settings = difficultySettings[difficulty];
  
  // Apply difficulty settings to game variables
  timer = settings.duration;
  score = 0;
  combo = 0;
  
  // Update displays
  document.getElementById("time").textContent = timer;
  document.getElementById("score").textContent = score;
  document.getElementById("combo").textContent = combo;
  
  // Hide difficulty screen
  hideDifficultyScreen();
  
  // Start the game
  startGame();
}

function startGame() {
  // Prevent multiple games
  if (gameRunning) return;
  
  gameRunning = true;
  
  // Start creating water droplets
  createWaterDroplet();
  
  // Start creating bad drops (based on difficulty)
  const settings = difficultySettings[currentDifficulty];
  badDropSpawnInterval = setInterval(() => {
    if (gameRunning && currentBadDrops.length < settings.maxBadDrops) {
      createBadDrop();
    }
  }, settings.badDropSpawnInterval);
  
  // Start the timer
  startTimer();
}

function startTimer() {
  const settings = difficultySettings[currentDifficulty];
  timer = settings.duration;

  document.getElementById("time").textContent = timer;
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

// ===== WATER DROPLET SYSTEM =====

function createWaterDroplet() {
  // Remove previous droplet if exists
  if (currentWaterDrop) {
    currentWaterDrop.remove();
    if (waterDropInterval) {
      clearInterval(waterDropInterval);
    }
  }

  const settings = difficultySettings[currentDifficulty];
  const drop = document.createElement("div");
  drop.className = "water-drop";
  
  // Size from difficulty
  const size = settings.dropSize;
  drop.style.width = drop.style.height = `${size}px`;

  // Get container dimensions
  const gameContainer = document.getElementById("game-container");
  const gameWidth = gameContainer.offsetWidth;
  const gameHeight = gameContainer.offsetHeight;
  
  // Random initial position
  drop.style.left = Math.random() * (gameWidth - size) + "px";
  drop.style.top = Math.random() * (gameHeight - size) + "px";
  drop.style.position = "absolute";

  // Add to game container
  gameContainer.appendChild(drop);
  currentWaterDrop = drop;

  // Reposition every X seconds (based on difficulty)
  waterDropInterval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(waterDropInterval);
      if (drop.parentElement) {
        drop.remove();
      }
      return;
    }
    
    // Move to new random position
    drop.style.left = Math.random() * (gameWidth - size) + "px";
    drop.style.top = Math.random() * (gameHeight - size) + "px";
  }, settings.waterDropSpawnRate);

  // Click handler
  drop.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!gameRunning) return;
    
    // Calculate score with multiplier
    const basePoints = 10;
    let multiplier = 1;
    if (combo >= 10) {
      multiplier = 3;  // 10+ combo = 3x
    } else if (combo >= 5) {
      multiplier = 2;  // 5+ combo = 2x
    }
    const earnedPoints = basePoints * multiplier;
    
    // Update score and combo
    score += earnedPoints;
    combo += 1;
    
    // Update displays
    document.getElementById("score").textContent = score;
    document.getElementById("combo").textContent = combo;
    
    // Show multiplier in console (optional)
    if (multiplier > 1) {
      console.log(`🔥 ${combo} combo! ${multiplier}x multiplier!`);
    }
    
    // Clean up and create next droplet
    clearInterval(waterDropInterval);
    drop.remove();
    currentWaterDrop = null;
    
    if (gameRunning) {
      createWaterDroplet();
    }
  });
}

// ===== BAD DROP SYSTEM =====

function createBadDrop() {
  const settings = difficultySettings[currentDifficulty];
  
  // Check max bad drops
  if (currentBadDrops.length >= settings.maxBadDrops) return;

  const drop = document.createElement("div");
  drop.className = "water-drop bad-drop";
  drop.isBad = true;

  // Size from difficulty
  const size = settings.badDropSize;
  drop.style.width = drop.style.height = `${size}px`;

  // Get container dimensions
  const gameContainer = document.getElementById("game-container");
  const gameWidth = gameContainer.offsetWidth;
  const gameHeight = gameContainer.offsetHeight;
  
  // Random initial position
  drop.style.left = Math.random() * (gameWidth - size) + "px";
  drop.style.top = Math.random() * (gameHeight - size) + "px";
  drop.style.position = "absolute";

  // Add to container
  gameContainer.appendChild(drop);
  currentBadDrops.push(drop);

  // Reposition every second
  let badDropInterval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(badDropInterval);
      if (drop.parentElement) {
        drop.remove();
      }
      return;
    }
    
    // Move to new position
    drop.style.left = Math.random() * (gameWidth - size) + "px";
    drop.style.top = Math.random() * (gameHeight - size) + "px";
  }, 1000);

  // Click handler - PENALTY
  drop.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!gameRunning) return;
    
    // Apply penalty
    score = Math.max(0, score - 5);  // Lose 5 liters
    combo = 0;  // Lose combo
    
    // Update displays
    document.getElementById("score").textContent = score;
    document.getElementById("combo").textContent = combo;
    
    console.log("💀 Hit a bad drop! Lost combo and 5 liters!");
    
    // Clean up
    clearInterval(badDropInterval);
    drop.remove();
    currentBadDrops = currentBadDrops.filter(d => d !== drop);
  });
}

function endGame() {
  // Stop the game and reset state
  gameRunning = false;
  clearInterval(timerInterval);         // Stop the timer
  clearInterval(waterDropInterval);     // Stop water drop movement
  clearInterval(badDropSpawnInterval);  // Stop bad drop spawning
  
  // Remove all drops
  document.querySelectorAll(".water-drop").forEach(d => d.remove());
  currentBadDrops = [];

  const settings = difficultySettings[currentDifficulty];

  document.getElementById("end-screen").classList.remove("hidden");
  document.getElementById("final-score").textContent =
    `You collected ${score} liters of clean water! 💧`;

  let endMessage; // Create a personalized message based on the player's score
  if (score >= settings.winThreshold) {
    endMessage = "🌟 Amazing! You're a water conservation hero!";
  } else {
    endMessage = "💧 Great effort! Every drop counts!";
  }
  document.getElementById("end-message").textContent = endMessage;
}

function resetGame() {
  // Reset all game variables to their initial state
  gameRunning = false;
  
  clearInterval(timerInterval);         // Stop the timer
  clearInterval(waterDropInterval);     // Stop water drop movement
  clearInterval(badDropSpawnInterval);  // Stop bad drop spawning
  
  combo = 0;
  timer = 0;
  score = 0;
  currentDifficulty = null;

  // Update the display to reflect the reset state
  document.getElementById("score").textContent = score;
  document.getElementById("combo").textContent = combo;
  document.getElementById("time").textContent = timer;
  
  // Hide the end screen and show the start button again
  document.getElementById("end-screen").classList.add("hidden");
  
  document.querySelectorAll(".water-drop").forEach(d => d.remove());
  currentBadDrops = [];

 
  showDifficultyScreen();
}

window.addEventListener("DOMContentLoaded", () => {
  showDifficultyScreen();

  // Reset UI
  document.getElementById("score").textContent = 0;
  document.getElementById("combo").textContent = 0;
  document.getElementById("time").textContent = 0;
});

