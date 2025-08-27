import { reactive } from 'vue';

export interface Prize {
  label: string;
  sub: string;
  kind: 'win' | 'lose';
  bg: string;
}

export const PRIZES: Prize[] = [
  {
    label: "YOU WIN",
    sub: "£50",
    kind: "win",
    bg: "radial-gradient(circle at 30% 30%, #ffe082, #ffb300 60%, #f57c00)",
  },
  {
    label: "TRY AGAIN",
    sub: "Better luck!",
    kind: "lose",
    bg: "linear-gradient(135deg,#90caf9,#42a5f5)",
  },
  {
    label: "YOU WIN",
    sub: "£10",
    kind: "win",
    bg: "radial-gradient(circle at 70% 20%, #c8e6c9, #66bb6a 60%, #2e7d32)",
  },
  {
    label: "NO LUCK",
    sub: "Spin next!",
    kind: "lose",
    bg: "linear-gradient(135deg,#e0e0e0,#9e9e9e)",
  },
  {
    label: "BONUS",
    sub: "Free Play",
    kind: "win",
    bg: "linear-gradient(135deg,#ffd54f,#ff8f00)",
  },
];

export function usePrizeSystem() {
  const currentPrize = reactive<Prize>({
    label: "—",
    sub: "",
    kind: "lose",
    bg: "linear-gradient(135deg,#90caf9,#42a5f5)",
  });

  const selectRandomPrize = (): Prize => {
    // Weighted selection - slightly favor lose outcomes
    const weightedPool = [...PRIZES, PRIZES[1], PRIZES[3]];
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    return weightedPool[randomIndex];
  };

  return {
    currentPrize,
    selectRandomPrize,
    availablePrizes: PRIZES,
  };
}