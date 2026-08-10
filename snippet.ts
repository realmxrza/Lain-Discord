import { LainPetRuntime } from "./LainPet/classes/LainPetRuntime";

const OUTFITS = ["default", "school", "pink", "bear", "home"] as const;

type LainPetApi = {
  start(): void;
  stop(): void;
  speak(text?: string): void;
  express(): void;
};

declare global {
  interface Window {
    Lain?: LainPetApi;
    LainPet?: LainPetApi;
  }
}

const runtime = new LainPetRuntime();
const lainPet = runtime.getPet();

let ambientInterval: number | null = null;
let outfitInterval: number | null = null;
let pendingStart: (() => void) | null = null;

function startAmbientBehavior() {
  if (ambientInterval !== null) return;

  ambientInterval = window.setInterval(() => {
    if (Math.random() < 0.2) lainPet.speak();
    if (Math.random() < 0.2) lainPet.express();
  }, 15000);

  outfitInterval = window.setInterval(() => {
    const randomOutfit = OUTFITS[Math.floor(Math.random() * OUTFITS.length)];

    lainPet.wear(randomOutfit);
  }, 60000);
}

function stopAmbientBehavior() {
  if (ambientInterval !== null) {
    window.clearInterval(ambientInterval);
    ambientInterval = null;
  }

  if (outfitInterval !== null) {
    window.clearInterval(outfitInterval);
    outfitInterval = null;
  }
}

function start() {
  runtime.start();
  startAmbientBehavior();
}

function stop() {
  if (pendingStart) {
    document.removeEventListener("DOMContentLoaded", pendingStart);
    pendingStart = null;
  }
  stopAmbientBehavior();
  runtime.stop();
}

const api: LainPetApi = {
  start,
  stop,
  speak: (text) => lainPet.speak(text),
  express: () => lainPet.express(),
};

function install() {
  window.LainPet?.stop();
  window.LainPet = api;
  window.Lain = api;

  if (document.readyState === "loading") {
    pendingStart = () => {
      pendingStart = null;
      start();
    };
    document.addEventListener("DOMContentLoaded", pendingStart, { once: true });
  } else {
    start();
  }
}

install();
