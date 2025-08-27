import { ref, onBeforeUnmount, type Ref } from "vue";

interface ScratchCardConfig {
  BRUSH_RADIUS: number;
  REVEAL_THRESHOLD: number;
  SAMPLE_STEP: number;
  MIN_STROKES_FOR_CHECK: number;
  CANVAS_MIN_WIDTH: number;
  CANVAS_MIN_HEIGHT: number;
}

interface ScratchCardOptions {
  canvasRef: Ref<HTMLCanvasElement | null>;
  cardRef: Ref<HTMLElement | null>;
  config: ScratchCardConfig;
  onProgressChange: (progress: number) => void;
  onGameStateChange: (started: boolean) => void;
  onLogEvent: (event: Event) => void;
}

interface PointerPosition {
  x: number;
  y: number;
}

export function useScratchCard({
  canvasRef,
  cardRef,
  config,
  onProgressChange,
  onGameStateChange,
  onLogEvent
}: ScratchCardOptions) {
  const canvasContext = ref<CanvasRenderingContext2D | null>(null);
  const dpr = ref(Math.max(1, window.devicePixelRatio || 1));
  const strokesSinceCheck = ref(0);

  const pointer = ref({
    down: false,
    lastX: 0,
    lastY: 0,
  });

  const initializeCanvas = (): boolean => {
    console.log("initCanvas");
    const canvas = canvasRef.value;
    const card = cardRef.value;

    if (!canvas || !card) {
      console.warn("Canvas or card ref not available");
      return false;
    }

    try {
      console.log("canvas init");
      const rect = card.getBoundingClientRect();
      const width = Math.max(config.CANVAS_MIN_WIDTH, Math.floor(rect.width));
      const height = Math.max(
        config.CANVAS_MIN_HEIGHT,
        Math.floor(rect.height)
      );
      const ratio = dpr.value;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      ctx.scale(ratio, ratio);
      canvasContext.value = ctx;

      paintScratchSurface();
      return true;
    } catch (error) {
      console.error("Failed to initialize canvas:", error);
      return false;
    }
  };

  const paintScratchSurface = (): void => {
    const canvas = canvasRef.value;
    const ctx = canvasContext.value;

    if (!canvas || !ctx) return;

    const width = parseFloat(canvas.style.width);
    const height = parseFloat(canvas.style.height);

    // Create foil gradient
    const foilGradient = ctx.createLinearGradient(0, 0, width, height);
    foilGradient.addColorStop(0, "#333");
    foilGradient.addColorStop(0.35, "#555");
    foilGradient.addColorStop(0.5, "#999");
    foilGradient.addColorStop(0.65, "#555");
    foilGradient.addColorStop(1, "#222");

    // Paint base surface
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = foilGradient;
    ctx.fillRect(0, 0, width, height);

    // Add metallic shine effect
    ctx.globalAlpha = 0.18;
    for (let i = -height; i < width + height; i += 60) {
      ctx.save();
      ctx.translate(i, 0);
      ctx.rotate(-Math.PI / 6);

      const shineGradient = ctx.createLinearGradient(0, 0, 0, height * 1.5);
      shineGradient.addColorStop(0, "rgba(255,255,255,0)");
      shineGradient.addColorStop(0.5, "rgba(255,255,255,0.9)");
      shineGradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = shineGradient;
      ctx.fillRect(0, 0, 14, height * 1.5);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font =
      "bold 18px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scratch Here", width / 2, height / 2);
  };

  const getPointerPosition = (event: PointerEvent): PointerPosition => {
    const canvas = canvasRef.value;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(event.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(event.clientY - rect.top, rect.height)),
    };
  };

  const scratchAtPosition = (
    x: number,
    y: number,
    isFirstStroke = false
  ): void => {
    const ctx = canvasContext.value;
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = config.BRUSH_RADIUS * 2;

    if (isFirstStroke) {
      ctx.beginPath();
      ctx.arc(x, y, config.BRUSH_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(pointer.value.lastX, pointer.value.lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.restore();

    pointer.value.lastX = x;
    pointer.value.lastY = y;

    // Check progress periodically
    strokesSinceCheck.value++;
    if (strokesSinceCheck.value >= config.MIN_STROKES_FOR_CHECK) {
      strokesSinceCheck.value = 0;
      const progress = calculateProgress();
      onProgressChange(progress);
    }
  };

  const calculateProgress = (): number => {
    const canvas = canvasRef.value;
    const ctx = canvasContext.value;

    if (!canvas || !ctx) return 0;

    try {
      const width = parseFloat(canvas.style.width);
      const height = parseFloat(canvas.style.height);
      const imageData = ctx.getImageData(0, 0, width, height);

      let clearedPixels = 0;
      let totalSamples = 0;
      const step = config.SAMPLE_STEP;

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const pixelIndex = (y * imageData.width + x) * 4 + 3; // Alpha channel
          const alpha = imageData.data[pixelIndex];

          totalSamples++;
          if (alpha < 8) clearedPixels++; // Consider nearly transparent as cleared
        }
      }

      return totalSamples > 0 ? clearedPixels / totalSamples : 0;
    } catch (error) {
      console.error("Failed to calculate progress:", error);
      return 0;
    }
  };

  // Event handling
  const handlePointerMove = (event: PointerEvent): void => {
    if (!pointer.value.down) return;

    const position = getPointerPosition(event);
    scratchAtPosition(position.x, position.y);
  };

  const handlePointerUp = (): void => {
    pointer.value.down = false;
    detachEventListeners();
  };

  const attachEventListeners = (event?: Event): void => {
    onLogEvent(event!);

    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handlePointerUp, {
      passive: true,
      once: true,
    });
    window.addEventListener("pointercancel", handlePointerUp, {
      passive: true,
      once: true,
    });
  };

  const detachEventListeners = (): void => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
  };

  const handleResize = (): void => {
    initializeCanvas();
  };

  // Public interface
  const initialize = (): boolean => {
    const success = initializeCanvas();
    if (success) {
      window.addEventListener("resize", handleResize, { passive: true });
    }
    return success;
  };

  const cleanup = (): void => {
    window.removeEventListener("resize", handleResize);
    detachEventListeners();
  };

  const startScratching = (event: PointerEvent): void => {
    pointer.value.down = true;
    const position = getPointerPosition(event);
    pointer.value.lastX = position.x;
    pointer.value.lastY = position.y;

    scratchAtPosition(position.x, position.y, true);
    attachEventListeners();
  };

  const resetScratchSurface = (): void => {
    const ctx = canvasContext.value;
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr.value, dpr.value);
    paintScratchSurface();
    strokesSinceCheck.value = 0;
  };

  const clearScratchSurface = (): void => {
    const canvas = canvasRef.value;
    const ctx = canvasContext.value;

    if (!canvas || !ctx) return;

    ctx.clearRect(
      0,
      0,
      parseFloat(canvas.style.width),
      parseFloat(canvas.style.height)
    );
  };


  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    initialize,
    cleanup,
    startScratching,
    resetScratchSurface,
    clearScratchSurface,
    calculateProgress,
    onLogEvent,
  };
}
