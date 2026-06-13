import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { MORSE_TABLE, REVERSE_TABLE, textToMorse, morseToText } from '../utils/morse-code'
import { SCENARIOS } from '../utils/scenarios'
import type { TrainMode, HistoryEntry, ScenarioMastery, ScenarioTaskResult } from '../types'

export const useMorseStore = defineStore('morse', () => {
  const inputText = ref('')
  const morseOutput = ref('')
  const decodedText = ref('')
  const wpm = ref(15)
  const frequency = ref(700)
  const volume = ref(0.6)
  const trainMode = ref<TrainMode>('charToCode')
  const history = ref<HistoryEntry[]>([])
  const quizChar = ref('')
  const userAnswer = ref('')
  const score = ref({ correct: 0, total: 0 })
  const isPlaying = ref(false)
  let audioCtx: AudioContext | null = null
  let currentOscillator: OscillatorNode | null = null

  const dotDuration = computed(() => 1200 / wpm.value)

  function getAudioCtx(): AudioContext {
    if (!audioCtx) audioCtx = new AudioContext()
    return audioCtx
  }

  function playTone(duration: number): Promise<void> {
    return new Promise(resolve => {
      const ctx = getAudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = frequency.value
      gain.gain.value = volume.value
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      currentOscillator = osc
      setTimeout(() => { osc.stop(); currentOscillator = null; resolve() }, duration)
    })
  }

  async function playMorse(morse: string) {
    isPlaying.value = true
    const dd = dotDuration.value
    for (const token of morse.split(' ')) {
      if (token === '/') { await sleep(dd * 7); continue }
      for (const sym of token) {
        await playTone(sym === '.' ? dd : dd * 3)
        await sleep(dd)
      }
      await sleep(dd * 2)
    }
    isPlaying.value = false
  }

  function sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
  }

  function encode() {
    morseOutput.value = textToMorse(inputText.value)
  }

  function decode() {
    decodedText.value = morseToText(inputText.value)
  }

  function generateQuiz() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    quizChar.value = chars[Math.floor(Math.random() * chars.length)]
    userAnswer.value = ''
  }

  function checkAnswer() {
    const correct = userAnswer.value.trim() === MORSE_TABLE[quizChar.value]
    score.value.total++
    if (correct) score.value.correct++
    history.value.unshift({
      id: Date.now(), input: quizChar.value, output: userAnswer.value,
      correct, timestamp: Date.now()
    })
    generateQuiz()
  }

  function resetScore() {
    score.value = { correct: 0, total: 0 }
    history.value = []
  }

  const scenarioMasteries = ref<Record<string, ScenarioMastery>>({})
  const activeScenarioId = ref<string | null>(null)
  const activeTaskId = ref<string | null>(null)
  const scenarioInput = ref('')
  const scenarioPlaying = ref(false)

  const scenarios = SCENARIOS

  const activeScenario = computed(() =>
    scenarios.find(s => s.id === activeScenarioId.value) ?? null
  )

  const activeTask = computed(() =>
    activeScenario.value?.tasks.find(t => t.id === activeTaskId.value) ?? null
  )

  function getOrCreateTaskResult(scenarioId: string, taskId: string): ScenarioTaskResult {
    if (!scenarioMasteries.value[scenarioId]) {
      scenarioMasteries.value[scenarioId] = {
        scenarioId,
        taskResults: {},
        completedAt: null,
      }
    }
    const mastery = scenarioMasteries.value[scenarioId]
    if (!mastery.taskResults[taskId]) {
      mastery.taskResults[taskId] = {
        taskId,
        attempts: 0,
        correct: 0,
        lastInput: '',
        mastered: false,
      }
    }
    return mastery.taskResults[taskId]
  }

  function selectScenario(scenarioId: string) {
    activeScenarioId.value = scenarioId
    activeTaskId.value = null
    scenarioInput.value = ''
  }

  function selectTask(taskId: string) {
    activeTaskId.value = taskId
    scenarioInput.value = ''
  }

  function checkScenarioAnswer() {
    if (!activeScenarioId.value || !activeTaskId.value) return
    const task = activeTask.value
    if (!task) return

    const normalizedInput = scenarioInput.value.trim().toUpperCase()
    const normalizedExpected = task.text.toUpperCase()
    const isCorrect = normalizedInput === normalizedExpected

    const result = getOrCreateTaskResult(activeScenarioId.value, activeTaskId.value)
    result.attempts++
    if (isCorrect) result.correct++
    result.lastInput = scenarioInput.value
    result.mastered = result.correct >= 1

    const mastery = scenarioMasteries.value[activeScenarioId.value]
    if (mastery) {
      const scenario = scenarios.find(s => s.id === activeScenarioId.value)
      if (scenario) {
        const allMastered = scenario.tasks.every(t =>
          mastery.taskResults[t.id]?.mastered
        )
        if (allMastered) {
          mastery.completedAt = Date.now()
        }
      }
    }

    return isCorrect
  }

  function getScenarioProgress(scenarioId: string) {
    const mastery = scenarioMasteries.value[scenarioId]
    if (!mastery) return { mastered: 0, total: 0, percent: 0 }
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (!scenario) return { mastered: 0, total: 0, percent: 0 }
    const mastered = scenario.tasks.filter(t => mastery.taskResults[t.id]?.mastered).length
    const total = scenario.tasks.length
    return { mastered, total, percent: total ? Math.round(mastered / total * 100) : 0 }
  }

  function resetScenarioProgress(scenarioId: string) {
    delete scenarioMasteries.value[scenarioId]
    if (activeScenarioId.value === scenarioId) {
      activeTaskId.value = null
      scenarioInput.value = ''
    }
  }

  async function playScenarioTask() {
    if (!activeTask.value) return
    const morse = textToMorse(activeTask.value.text)
    scenarioPlaying.value = true
    await playMorse(morse)
    scenarioPlaying.value = false
  }

  return {
    inputText, morseOutput, decodedText, wpm, frequency, volume,
    trainMode, history, quizChar, userAnswer, score, isPlaying,
    dotDuration, encode, decode, playMorse, playTone,
    generateQuiz, checkAnswer, resetScore,
    scenarioMasteries, activeScenarioId, activeTaskId, scenarioInput,
    scenarioPlaying, scenarios, activeScenario, activeTask,
    selectScenario, selectTask, checkScenarioAnswer,
    getScenarioProgress, resetScenarioProgress, playScenarioTask
  }
})
