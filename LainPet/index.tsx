import definePlugin from "@utils/types";
import { ApplicationCommandOptionType } from "@api/Commands";
import { LainPetRuntime } from "./classes/LainPetRuntime";
import { FlyingMisc } from "./classes/FlyingMisc";
import { Navi } from "./classes/Navi";
import { assets } from "./data/assets";
import { magnitude, subtract } from "./types/Vector2";

const runtime = new LainPetRuntime();
const lainPet = runtime.getPet();
const navi = new Navi(assets.misc.navi);
const flyingMisc = new FlyingMisc({
  crow: assets.misc.crow,
  girl: assets.misc.girl,
});

let ambientInterval: number | null = null;
let outfitInterval: number | null = null;
let naviInterval: number | null = null;
const OUTFITS = ["default", "school", "pink", "bear", "home"] as const;
type Outfit = (typeof OUTFITS)[number];

function isOutfit(value: string): value is Outfit {
  return OUTFITS.includes(value as Outfit);
}

function forceDebugMovement(path: "sine" | "parabola") {
  const position = lainPet.getPosition();
  if (!position) return;

  const spriteSize = 100;
  const maxX = Math.max(0, window.innerWidth - spriteSize);
  const maxY = Math.max(0, window.innerHeight - spriteSize);
  const target = {
    x: position.x < maxX / 2 ? maxX : 0,
    y: Math.max(0, Math.min(position.y, maxY)),
  };

  if (path === "sine") {
    lainPet.sineMoveTo(target);
  } else {
    lainPet.parabolicMoveTo(target);
  }
}
function updateNaviInteraction() {
  if (!navi.isLanded()) return;

  const lainPosition = lainPet.getPosition();
  const naviPosition = navi.getPosition();

  if (!lainPosition || !naviPosition) return;

  lainPet.moveTo(naviPosition);

  const lainCenter = {
    x: lainPosition.x + 50,
    y: lainPosition.y + 50,
  };
  const naviCenter = {
    x: naviPosition.x + 60,
    y: naviPosition.y + 60,
  };

  if (magnitude(subtract(lainCenter, naviCenter)) >= 30) return;
  if (!navi.collect()) return;

  lainPet.sugarRush();
  lainPet.speak("NAVI COLLECTED.");
}

function startAmbientBehavior() {
  if (ambientInterval !== null) return;

  ambientInterval = window.setInterval(() => {
    if (Math.random() < 0.2) lainPet.speak();
    if (Math.random() < 0.2) lainPet.express();
    if (Math.random() < 0.1) {
      flyingMisc.spawn(Math.random() < 0.5 ? "crow" : "girl");
    }
    if (Math.random() < 0.05) navi.drop();
  }, 15000);

  outfitInterval = window.setInterval(() => {
    const randomOutfit = OUTFITS[Math.floor(Math.random() * OUTFITS.length)];

    lainPet.wear(randomOutfit);

    if (Math.random() < 0.4) {
      lainPet.specialEvent();
    }
  }, 60000);

  naviInterval = window.setInterval(updateNaviInteraction, 30);
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

  if (naviInterval !== null) {
    window.clearInterval(naviInterval);
    naviInterval = null;
  }
}

export default definePlugin({
  name: "LainPet",
  description:
    "A cute Lain desktop pet by realmxrza — Lain-Discord custom build",
  authors: [
    {
      name: "realmxrza",
      id: 1348602887986745385n,
    },
  ],

  commands: [
    {
      name: "lain",
      description: "Interact with your Lain pet",
      options: [
        {
          name: "action",
          description: "The action to perform",
          type: ApplicationCommandOptionType.STRING,
          required: true,
          choices: [
            { name: "Roll", label: "Roll", value: "roll" },
            { name: "Burn", label: "Burn", value: "burn" },
            { name: "Dance", label: "Dance", value: "dance" },
            { name: "Drop Navi", label: "Drop Navi", value: "navi" },
            { name: "Sugar Rush", label: "Sugar Rush", value: "sugarrush" },
            { name: "Spawn Crow", label: "Spawn Crow", value: "crow" },
            { name: "Spawn Girl", label: "Spawn Girl", value: "girl" },
            { name: "Express", label: "Express", value: "express" },
            { name: "Speak", label: "Speak", value: "speak" },
            { name: "Debug Sine Movement", label: "Debug Sine Movement", value: "sine" },
            { name: "Debug Parabolic Movement", label: "Debug Parabolic Movement", value: "parabola" },
          ],
        },
        {
          name: "outfit",
          description:
            "Change outfit (only applies if action is omitted or irrelevant)",
          type: ApplicationCommandOptionType.STRING,
          required: false,
          choices: [
            { name: "Default", label: "Default", value: "default" },
            { name: "School", label: "School", value: "school" },
            { name: "Pink", label: "Pink", value: "pink" },
            { name: "Bear", label: "Bear", value: "bear" },
            { name: "Home", label: "Home", value: "home" },
          ],
        },
      ],
      execute: (args) => {
        if (!lainPet.isRunning()) {
          return { content: "Lain pet is not running! " };
        }

        const action = args.find((a) => a.name === "action")?.value;
        const outfit = args.find((a) => a.name === "outfit")?.value;

        if (typeof outfit === "string" && isOutfit(outfit)) {
          lainPet.wear(outfit);
        }

        switch (action) {
          case "roll":
            lainPet.forceRoll();
            break;
          case "burn":
            lainPet.forceBurn();
            break;
          case "dance":
            lainPet.forceDance();
            break;
          case "sine":
            forceDebugMovement("sine");
            break;
          case "parabola":
            forceDebugMovement("parabola");
            break;
          case "sugarrush":
            lainPet.sugarRush();
            break;
          case "express":
            lainPet.express();
            break;
          case "speak":
            lainPet.speak();
            break;
          case "crow":
            flyingMisc.spawn("crow");
            break;
          case "girl":
            flyingMisc.spawn("girl");
            break;
          case "navi":
            navi.drop();
            break;
        }
      },
    },
  ],

  start() {
    runtime.start();
    startAmbientBehavior();
    console.log(
      "%c Lain Pet by realmxrza | custom Lain-Discord build started ",
      "background: #000; color: #f0f; font-weight: bold; font-size: 14px;",
    );
  },

  stop() {
    stopAmbientBehavior();
    navi.stop();
    flyingMisc.stop();
    runtime.stop();
    console.log(
      "%c Lain Pet by realmxrza | custom Lain-Discord build stopped ",
      "background: #000; color: #f0f; font-weight: bold; font-size: 14px;",
    );
  },
});
