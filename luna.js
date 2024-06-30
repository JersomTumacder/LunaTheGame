import { setCustomProperty, incrementCustomProperty, getCustomProperty } from "./updateCustomProperty.js";

const lunaElem = document.querySelector("[data-luna]");
const JUMP_SPEED = 0.45;
const GRAVITY = 0.0015;
const LUNA_FRAME_COUNT = 2;
const FRAME_TIME = 100;

let isJumping = false;
let lunaFrame = 0;
let currentFrameTime = 0;
let yVelocity = 0;
let isSoundEffectsActive = true;

const jumpSound = new Audio("imgs/Jump.MP3");
const loseSound = new Audio("imgs/Lose.MP3");

export function setupLuna() {
  isJumping = false;
  lunaFrame = 0;
  currentFrameTime = 0;
  yVelocity = 0;
  setCustomProperty(lunaElem, "--bottom", 0);
  lunaElem.src = `imgs/luna-run-0.png`; // Set initial frame to the first running frame
  document.removeEventListener("keydown", onJump);
  document.addEventListener("keydown", onJump);
}

export function updateLuna(delta, speedScale) {
  handleRun(delta, speedScale);
  handleJump(delta);
}

export function getLunaRect() {
  const rect = lunaElem.getBoundingClientRect();

  // Example adjustment of hitbox dimensions
  const hitboxAdjustment = {
    top: rect.top + 15,      // Increase top by 10 pixels
    left: rect.left + 30,     // Increase left by 5 pixels
    right: rect.right - 30,   // Decrease right by 5 pixels
    bottom: rect.bottom - 15 // Decrease bottom by 10 pixels
  };

  return hitboxAdjustment;
}

export function setLunaLose() {
  lunaElem.src = "imgs/luna-lose.png";
  playSound(loseSound);
}

function handleRun(delta, speedScale) {
  if (isJumping) {
    lunaElem.src = `imgs/luna-stationary.png`;
    return;
  }

  if (currentFrameTime >= FRAME_TIME) {
    lunaFrame = (lunaFrame + 1) % LUNA_FRAME_COUNT;
    lunaElem.src = `imgs/luna-run-${lunaFrame}.png`;
    currentFrameTime -= FRAME_TIME;
  }
  currentFrameTime += delta * speedScale;
}

function handleJump(delta) {
  if (!isJumping) return;

  incrementCustomProperty(lunaElem, "--bottom", yVelocity * delta);

  if (getCustomProperty(lunaElem, "--bottom") <= 0) {
    setCustomProperty(lunaElem, "--bottom", 0);
    isJumping = false;
  }

  yVelocity -= GRAVITY * delta;
}

function onJump(e) {
  if (e.code !== "Space" || isJumping) return;
  jump();
}

export function jump() {
  if (!isJumping) {
    yVelocity = JUMP_SPEED;
    isJumping = true;
    playSound(jumpSound);  // Play the sound when the jump starts
  }
}

export function toggleSoundEffects(active) {
  isSoundEffectsActive = active;
}

function playSound(sound) {
  if (isSoundEffectsActive) {
    sound.currentTime = 0;
    sound.play().catch((error) => {
      // Handle any error that might occur
      console.error('Error playing sound:', error);
    });
  }
}

// Call setupLuna to initialize Luna's position before the game starts
setupLuna();
