<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
} from "vue";
import DefaultLayout from "@/layout/DefaultLayout.vue";
import InputButton from "@/components/Utility/InputButton/index.vue";
import PlayHistory from "@/views/Play/component/PlayHistory.vue";
import { useScratchCard } from "@/views/Play/composables/useScratchCard";
import {
  PRIZES,
  usePrizeSystem,
} from "@/views/Play/composables/usePrizeSystem";
import { useGameState } from "@/views/Play/composables/useGameState";
import { UserService } from "@/services";
import { useRoute } from "vue-router";

const route = useRoute();

const GAME_CONFIG = {
  BRUSH_RADIUS: 26,
  REVEAL_THRESHOLD: 0.62,
  SAMPLE_STEP: 8,
  MIN_STROKES_FOR_CHECK: 12,
  BUSY_DELAY: 350,
  CANVAS_MIN_WIDTH: 300,
  CANVAS_MIN_HEIGHT: 180,
} as const;

const canvasRef = ref<HTMLCanvasElement | null>(null);
const cardRef = ref<HTMLElement | null>(null);
const gameDateTime = ref<Date | null>(null);
const hideStartButton = ref(false);

const gameState = useGameState();
const { started, finished, busy, progress, playLog } = gameState;

const prizeSystem = usePrizeSystem();
const { currentPrize, selectRandomPrize } = prizeSystem;

const prize = currentPrize;
const hasLoggedEvent = ref(false);

const scratchCard = useScratchCard({
  canvasRef,
  cardRef,
  config: GAME_CONFIG,
  onProgressChange: (newProgress: number) => {
    progress.value = newProgress;
    if (newProgress >= GAME_CONFIG.REVEAL_THRESHOLD) {
      finishGame();
    }
  },
  onGameStateChange: (isStarted: boolean) => {
    started.value = isStarted;
  },
  onLogEvent: handleLogEvent,
});

const canScratch = computed(() => started.value && !finished.value);
const progressPercentage = computed(() => Math.round(progress.value * 100));

async function startGame(): Promise<void> {
  if (busy.value) return;

  try {
    busy.value = true;
    gameState.resetGame();

    const selectedPrize = selectRandomPrize();
    Object.assign(currentPrize, selectedPrize);

    await nextTick();
    scratchCard.resetScratchSurface();
    started.value = true;
  } catch (error) {
    console.error("Failed to start game:", error);
    gameState.resetGame();
  } finally {
    setTimeout(() => {
      busy.value = false;
    }, GAME_CONFIG.BUSY_DELAY);
    hideStartButton.value = true;
  }
}

function finishGame(): void {
  if (finished.value) return;

  finished.value = true;
  progress.value = 1;
  scratchCard.clearScratchSurface();

  gameState.addToPlayLog({
    timestamp: gameDateTime.value.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    text: currentPrize.kind === "win" ? `WIN — ${currentPrize.sub}` : "No win",
    kind: currentPrize.kind,
  });
  hideStartButton.value = false;
}

function onPointerDown(event: PointerEvent): void {
  if (!canScratch.value) return;
  scratchCard.startScratching(event);
}

function handleLogEvent(): void {
  if (!hasLoggedEvent.value) {
    gameDateTime.value = new Date();

    const payload = {
      kind: currentPrize.kind,
      timestamp: gameDateTime.value.toISOString(),
    };
    UserService.sendScore(route.params.id, payload);
    hasLoggedEvent.value = true;
  }
}

onMounted(() => {
  scratchCard.initialize();
  getPlayLogs();
});

const getPlayLogs = () => {
  UserService.getScore(route.params.id).then((response) => {
    const data = response.data;
    const mappedData = data.map((item: any) => {
      const prizeData = PRIZES.find((prize) => prize.kind === item.kind);
      return {
        timestamp: new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: prizeData.kind === "win" ? `WIN — ${prizeData.sub}` : "No win",
        kind: prizeData.kind,
        bg: prizeData.bg,
        label: prizeData.label,
        sub: prizeData.sub,
      };
    });
    playLog.value = mappedData;
  });
};

onBeforeUnmount(() => {
  scratchCard.cleanup();
});
</script>

<template>
  <DefaultLayout>
    <div
      class="w-full rounded-lg shadow md:mt-0 md:w-full sm:max-w-md xl:p-0 dark:bg-gray-800"
    >
      <div class="relative">
        <div
          class="relative aspect-[16/9] rounded-[10px] shadow-[0_10px_28px_rgba(0,0,0,0.25)] bg-[#111] overflow-hidden border-4 border-white/80"
          ref="cardRef"
        >
          <div
            class="absolute inset-0 w-full h-full transition-opacity duration-300"
            :class="{ 'opacity-100': started, 'opacity-0': !started }"
          >
            <div
              class="w-full h-full grid place-items-center"
              :style="{ background: prize.bg }"
            >
              <div
                class="text-center text-[#081323] [text-shadow:_0_1px_rgba(255,255,255,0.7)]"
              >
                <div class="font-black text-[clamp(28px,4.6vw,56px)]">
                  {{ prize.label }}
                </div>
                <div class="font-black text-[clamp(20px,3.4vw,42px)]">
                  {{ prize.sub }}
                </div>
              </div>
            </div>
          </div>

          <canvas
            ref="canvasRef"
            class="absolute inset-0 w-full h-full touch-none block"
            @pointerdown.prevent="onPointerDown"
          />

          <div
            v-if="started && !finished"
            class="absolute right-[10px] bottom-[10px] bg-black/55 text-white font-bold py-[6px] px-[10px] rounded-[8px] text-[14px] tracking-[0.3px]"
          >
            {{ Math.round(progress * 100) }}%
          </div>
        </div>
        <PlayHistory
          v-show="playLog && playLog.length > 0"
          :playLog="playLog"
        />
      </div>
    </div>

    <div class="mt-4">
      <InputButton v-if="finished" @click="startGame" :disabled="busy">
        Play Again
      </InputButton>
      <div v-else>
        <InputButton
          v-if="!hideStartButton"
          @click="startGame"
          :disabled="busy"
        >
          Start Game
        </InputButton>
      </div>
    </div>
  </DefaultLayout>
</template>
