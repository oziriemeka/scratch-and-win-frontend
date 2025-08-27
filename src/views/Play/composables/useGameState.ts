import { ref } from 'vue';

export interface PlayLogEntry {
  timestamp: string;
  text: string;
  kind: 'win' | 'lose';
}

export function useGameState() {
  const started = ref(false);
  const finished = ref(false);
  const busy = ref(false);
  const progress = ref(0);
  const playLog = ref<PlayLogEntry[]>([]);

  const resetGame = () => {
    started.value = false;
    finished.value = false;
    progress.value = 0;
  };

  const addToPlayLog = (entry: PlayLogEntry) => {
    playLog.value.unshift(entry);
  };

  return {
    started,
    finished,
    busy,
    progress,
    playLog,
    resetGame,
    addToPlayLog,
  };
}