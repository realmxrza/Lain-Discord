import type { LainState } from "./LainState";

export type Viewport = {
  width: number;
  height: number;
};

export type RandomSource = () => number;

export type LainPetOptions = {
  random?: RandomSource;
};

export type ExpressionSnapshot = {
  visible: boolean;
  asset: string | null;
};

export type DialogueSnapshot = {
  visible: boolean;
  text: string | null;
};

export type LainPetSnapshot = LainState & {
  facing: "left" | "right";
  dialogue: DialogueSnapshot;
  expression: ExpressionSnapshot;
  eventOutfit: LainState["outfit"] | null;
};
