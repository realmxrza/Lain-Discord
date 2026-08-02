type OutfitAssets = {
  idle: string;
  right: string;
  left: string;
  event?: string;
};

type MiscAssets = {
  crow: string;
  girl: string;
  navi: string[];
  exp1: string;
  exp2: string;
};

export type LainAssets = {
  default: OutfitAssets;
  school: OutfitAssets;
  pink: OutfitAssets;
  bear: OutfitAssets;
  home: OutfitAssets;
  misc: MiscAssets;
};

export const assets: LainAssets = {
  default: {
    idle: "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/1.png",
    right:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk1.gif",
    left:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk2.gif",
  },
  school: {
    idle: "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/115.png",
    right:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk3.gif",
    left:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk4.gif",
    event:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainburn.gif",
  },
  pink: {
    idle: "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/116.png",
    right:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk5.gif",
    left:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk6.gif",
    event:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/laindance.gif",
  },
  bear: {
    idle: "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/117.png",
    right:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk7.gif",
    left:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk8.gif",
    event:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainroll.gif",
  },
  home: {
    idle: "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/118.png",
    right:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk9.gif",
    left:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/lainwalk10.gif",
  },
  misc: {
    crow:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/crow.gif",
    girl:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/flyinggirl.gif",
    navi: [
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/navi1.gif",
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/navi2.gif",
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/navi3.gif",
    ],
    exp1:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/expression1.gif?raw=true",
    exp2:
      "https://raw.githubusercontent.com/realmxrza/Lain-Discord/main/src/expression2.gif?raw=true",
  },
};

export const dialogues: string[] = [
  "Present day. Present time. Hahahaha!",
  "Why don't you come to the Wired?",
  "No matter where you are, everyone is always connected.",
  "No matter where you are, everyone is always connected.",
  "You're wrong.",
  "Don't worry. I'm still me.",
  "check out mxrza.xyz",
  "Let's All Love Lain.",
  "Why are you crying Lain",
  "The real world isn't real at all.",
  "also check out kuumin (website pending)",
];
