export interface MorseSymbol {
  char: string
  code: string
}

export type TrainMode = 'charToCode' | 'codeToChar' | 'audioToChar' | 'typingToCode'

export interface HistoryEntry {
  id: number
  input: string
  output: string
  correct: boolean
  timestamp: number
}

export interface ScenarioTask {
  id: string
  title: string
  text: string
  description: string
}

export interface Scenario {
  id: string
  name: string
  theme: 'maritime' | 'rescue'
  icon: string
  description: string
  tasks: ScenarioTask[]
}

export interface ScenarioTaskResult {
  taskId: string
  attempts: number
  correct: number
  lastInput: string
  mastered: boolean
}

export interface ScenarioMastery {
  scenarioId: string
  taskResults: Record<string, ScenarioTaskResult>
  completedAt: number | null
}
