import { ref, computed } from 'vue'
import { GameService } from '@/services'
import type { StateResp } from '@/services'

export function useScratchGame() {
  const sessionId = ref<string | null>(null)
  const size = ref<number>(40)
  const valuesHash = ref<string>("")
  const score = ref<number>(0)
  const scratched = ref<Set<number>>(new Set())
  const revealedValues = ref<Record<number, number>>({})
  const timeLeftSeconds = ref<number>(0)
  const finished = ref<boolean>(false)

  const starting = ref<boolean>(false)
  const scratchingIndex = ref<number | null>(null)
  const errorMessage = ref<string | null>(null)
  const pollHandle = ref<ReturnType<typeof setInterval> | null>(null)

  const boxes = computed(() => Array.from({ length: size.value }, (_, i) => i))

  function clearPoll() {
    if (pollHandle.value) clearInterval(pollHandle.value)
    pollHandle.value = null
  }

  function applyState(state: StateResp) {
    score.value = state.score
    timeLeftSeconds.value = state.time_left_seconds
    finished.value = state.finished
    size.value = state.size
    valuesHash.value = state.values_hash
    scratched.value = new Set(state.scratched)
    if (finished.value) clearPoll()
  }

  async function pollState() {
    if (!sessionId.value) return
    try {
      const state = await GameService.state(sessionId.value)
      applyState(state)
    } catch {
      // ignore transient polling errors
    }
  }

  async function startGame(request: { size?: number; duration_seconds?: number } = { size: 40, duration_seconds: 300 }) {
    starting.value = true
    errorMessage.value = null
    try {
      const res = await GameService.start(request)
      sessionId.value = res.session_id
      size.value = res.size
      valuesHash.value = res.values_hash
      score.value = 0
      scratched.value = new Set()
      revealedValues.value = {}
      timeLeftSeconds.value = Math.max(0, Math.floor((new Date(res.expires_at).getTime() - Date.now()) / 1000))
      finished.value = false
      clearPoll()
      pollHandle.value = setInterval(pollState, 3000)
    } catch (e: any) {
      errorMessage.value = e?.message || 'Failed to start game'
    } finally {
      starting.value = false
    }
  }

  async function scratch(index: number) {
    if (!sessionId.value || finished.value || scratched.value.has(index) || scratchingIndex.value !== null) return
    scratchingIndex.value = index
    errorMessage.value = null
    try {
      const res = await GameService.scratch({ session_id: sessionId.value, index })
      revealedValues.value[index] = res.value
      scratched.value = new Set(Array.from(scratched.value).concat(res.revealed_index))
      score.value = res.score
    } catch (e: any) {
      if (e?.status === 409) {
        errorMessage.value = 'Already scratched'
        scratched.value = new Set(Array.from(scratched.value).concat(index))
      } else if (e?.status === 410) {
        errorMessage.value = 'Session expired'
        finished.value = true
        clearPoll()
      } else {
        errorMessage.value = e?.message || 'Scratch failed'
      }
    } finally {
      scratchingIndex.value = null
    }
  }

  function stop() {
    clearPoll()
  }

  return {
    // state
    sessionId,
    size,
    valuesHash,
    score,
    scratched,
    revealedValues,
    timeLeftSeconds,
    finished,
    starting,
    scratchingIndex,
    errorMessage,
    boxes,
    // actions
    startGame,
    scratch,
    pollState,
    stop,
  }
}





