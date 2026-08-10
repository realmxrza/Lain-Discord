import definePlugin from "@utils/types";
import { ApplicationCommandOptionType } from "@api/Commands";
import { LainPetRuntime } from "./classes/LainPetRuntime";

const runtime = new LainPetRuntime();
const lainPet = runtime.getPet();

let ambientInterval: number | null = null;
let outfitInterval: number | null = null;
const OUTFITS = ["default", "school", "pink", "bear", "home"] as const;

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
            { name: "Express", label: "Express", value: "express" },
            { name: "Speak", label: "Speak", value: "speak" },
          ],
        },
      ],
      execute: (args) => {
        if (!lainPet.isRunning()) {
          return { content: "Lain pet is not running! " };
        }

        const action = args.find((a) => a.name === "action")?.value;

        switch (action) {
          case "express":
            lainPet.express();
            break;
          case "speak":
            lainPet.speak();
            break;
        }
      },
    },
  ],

  start() {
    runtime.start();
    startAmbientBehavior();
  },

  stop() {
    stopAmbientBehavior();
    runtime.stop();
  },
});
