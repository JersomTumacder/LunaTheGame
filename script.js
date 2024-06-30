// Import necessary functions and variables from modules
import { updateGround, setupGround } from "./ground.js";
import { updateLuna, setupLuna, getLunaRect, setLunaLose, jump, toggleSoundEffects } from "./luna.js";
import { updateChocolate, setupChocolate, getChocolateRects } from "./chocolate.js";

// Define constants and variables
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 30;
const SPEED_SCALE_INCREASE = 0.00001;

const worldElem = document.querySelector("[data-world]");
const scoreElem = document.getElementById("score-value");
const highScoreElem = document.getElementById("highscore-value"); // Assuming your HTML has an element with id="highscore-value"
const startScreenElem = document.querySelector("[data-start-screen]");
const settingsIcon = document.querySelector("[data-settings-icon]");
const settingsPopup = document.querySelector("[data-settings-popup]");
const toggleMusicCheckbox = document.getElementById("toggle-music");
const toggleVoiceCheckbox = document.getElementById("toggle-voice");
const toggleSoundEffectsCheckbox = document.getElementById("toggle-sound-effects");
const bgMusic = document.getElementById("bgMusic");
const closeSettingsBtn = document.querySelector("[data-close-settings]");

let lastTime;
let speedScale;
let score;
let highScore = localStorage.getItem("highScore") || 0;
let isVoiceCommandActive = true;

// Define the voice command options
const soundOptions = { probabilityThreshold: 0.60 };

// Load the sound classifier model
const soundClassifier = ml5.soundClassifier('SpeechCommands18w', soundOptions, modelLoaded);

// Function called when the model is loaded
function modelLoaded() {
  console.log('Sound classifier model loaded!');
  if (toggleVoiceCheckbox.checked) {
    soundClassifier.classify(gotCommand);
  }
}

// Function to handle voice command recognition results
function gotCommand(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  if (!isVoiceCommandActive) return;

  if (results.some(result => result.label === "up" && result.confidence > 0.2)) {
    jump();
  }
}

function update(time) {
  if (lastTime == null) {
    lastTime = time;
    window.requestAnimationFrame(update);
    return;
  }

  const delta = time - lastTime;
  updateGround(delta, speedScale);
  updateLuna(delta, speedScale);
  updateChocolate(delta, speedScale);
  updateSpeedScale(delta);
  updateScore(delta);

  if (checkLose()) return handleLose();

  lastTime = time;
  window.requestAnimationFrame(update);
}

function checkLose() {
  const lunaRect = getLunaRect();
  return getChocolateRects().some(rect => isCollision(rect, lunaRect));
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  );
}

function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE;
}

function updateScore(delta) {
  score += delta * 0.01;
  scoreElem.textContent = Math.floor(score);

  if (score > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem("highScore", highScore);
    highScoreElem.textContent = highScore;
  }
}

function handleStart() {
  lastTime = null;
  speedScale = 1;
  score = 0;
  resetScore();
  setupGround();
  setupLuna();
  setupChocolate();
  startScreenElem.classList.add("hide");
  window.requestAnimationFrame(update);
}

function handleLose() {
  setLunaLose();
  setTimeout(() => {
    document.addEventListener("keydown", handleStart, { once: true });
    startScreenElem.classList.remove("hide");
  }, 100);
}

function setPixelToWorldScale() {
  const worldToPixelScale = (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT)
    ? window.innerWidth / WORLD_WIDTH
    : window.innerHeight / WORLD_HEIGHT;

  worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`;
  worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`;
}

function resetScore() {
  score = 0;
  localStorage.setItem("Score", score);
  scoreElem.textContent = score;
}

function resetHighScore() {
  highScore = 0;
  localStorage.setItem("highScore", highScore);
  highScoreElem.textContent = highScore;
}

// Settings button functionality
function setupEventListeners() {
  settingsIcon.addEventListener("click", () => {
    settingsPopup.classList.toggle("hide");
  });

  toggleMusicCheckbox.addEventListener("change", (e) => {
    if (e.target.checked) {
      bgMusic.play();
    } else {
      bgMusic.pause();
    }
  });

  toggleVoiceCheckbox.addEventListener("change", (e) => {
    isVoiceCommandActive = e.target.checked;
    if (isVoiceCommandActive) {
      soundClassifier.classify(gotCommand);
    }
  });

  toggleSoundEffectsCheckbox.addEventListener("change", (e) => {
    toggleSoundEffects(e.target.checked);
  });

  closeSettingsBtn.addEventListener("click", () => {
    settingsPopup.classList.add("hide");
  });

  document.addEventListener("click", (e) => {
    if (!settingsPopup.classList.contains("hide") && !settingsPopup.contains(e.target) && e.target !== settingsIcon) {
      settingsPopup.classList.add("hide");
    }
  });
}

setPixelToWorldScale();
window.addEventListener("resize", setPixelToWorldScale);
document.addEventListener("keydown", handleStart, { once: true });

setupEventListeners();
resetHighScore();
