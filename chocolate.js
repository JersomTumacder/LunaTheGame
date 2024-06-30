import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"

const SPEED = 0.05
const CHOCOLATE_INTERVAL_MIN = 500
const CHOCOLATE_INTERVAL_MAX = 2000
const MIN_CHOCOLATE_DISTANCE = 50 // minimum distance between chocolates
const worldElem = document.querySelector("[data-world]")

let nextChocolateTime
let lastChocolateTime = 0

export function setupChocolate() {
  nextChocolateTime = CHOCOLATE_INTERVAL_MIN
  lastChocolateTime = 0
  document.querySelectorAll("[data-chocolate]").forEach(chocolate => {
    chocolate.remove()
  })
}

export function updateChocolate(delta, speedScale) {
  document.querySelectorAll("[data-chocolate]").forEach(chocolate => {
    incrementCustomProperty(chocolate, "--left", delta * speedScale * SPEED * -1)
    if (getCustomProperty(chocolate, "--left") <= -100) {
      chocolate.remove()
    }
  })

  if (nextChocolateTime <= 0 && canSpawnChocolate()) {
    createChocolate()
    nextChocolateTime = randomNumberBetween(CHOCOLATE_INTERVAL_MIN, CHOCOLATE_INTERVAL_MAX) / speedScale
  }
  nextChocolateTime -= delta
}

export function getChocolateRects() {
  return [...document.querySelectorAll("[data-chocolate]")].map(chocolate => {
    return chocolate.getBoundingClientRect()
  })
}

function createChocolate() {
  const chocolate = document.createElement("img")
  chocolate.dataset.chocolate = true
  chocolate.src = "imgs/chocolate.png"
  chocolate.classList.add("chocolate")
  setCustomProperty(chocolate, "--left", 100)
  worldElem.append(chocolate)
  lastChocolateTime = nextChocolateTime // Update the last spawn time
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function canSpawnChocolate() {
  const chocolates = document.querySelectorAll("[data-chocolate]")
  if (chocolates.length === 0) return true

  const lastChocolate = chocolates[chocolates.length - 1]
  const lastChocolateLeft = getCustomProperty(lastChocolate, "--left")
  
  // Ensure the new chocolate spawns at least MIN_CHOCOLATE_DISTANCE away from the last one
  return lastChocolateLeft <= 100 - MIN_CHOCOLATE_DISTANCE
}
