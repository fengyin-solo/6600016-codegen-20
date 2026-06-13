<template>
  <div class="flex flex-col gap-4">
    <div v-if="!store.activeScenario" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="scenario in store.scenarios"
        :key="scenario.id"
        class="bg-gray-900 rounded-xl p-5 cursor-pointer border-2 transition-colors"
        :class="themeBorderClass(scenario.theme)"
        @click="store.selectScenario(scenario.id)"
      >
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">{{ scenario.icon }}</span>
          <div>
            <h3 class="text-lg font-bold" :class="themeTextClass(scenario.theme)">{{ scenario.name }}</h3>
            <p class="text-gray-400 text-sm">{{ scenario.tasks.length }} 个任务</p>
          </div>
        </div>
        <p class="text-gray-300 text-sm mb-3">{{ scenario.description }}</p>
        <div class="flex items-center gap-2">
          <div class="flex-1 bg-gray-800 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="themeBarClass(scenario.theme)"
              :style="{ width: store.getScenarioProgress(scenario.id).percent + '%' }"
            />
          </div>
          <span class="text-xs text-gray-400">{{ store.getScenarioProgress(scenario.id).percent }}%</span>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <button @click="store.selectScenario(store.activeScenario!.id)" class="text-gray-400 hover:text-white">
          ← 返回场景列表
        </button>
        <h3 class="text-xl font-bold" :class="themeTextClass(store.activeScenario.theme)">
          {{ store.activeScenario.icon }} {{ store.activeScenario.name }}
        </h3>
        <div class="ml-auto flex items-center gap-2">
          <span class="text-sm text-gray-400">
            掌握 {{ store.getScenarioProgress(store.activeScenario.id).mastered }}/{{ store.getScenarioProgress(store.activeScenario.id).total }}
          </span>
          <button @click="store.resetScenarioProgress(store.activeScenario!.id)" class="text-red-400 text-sm hover:underline">
            重置进度
          </button>
        </div>
      </div>

      <div v-if="!store.activeTask" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="task in store.activeScenario.tasks"
          :key="task.id"
          class="bg-gray-900 rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition-colors flex items-start gap-3"
          @click="store.selectTask(task.id)"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
            :class="taskMastered(store.activeScenario.id, task.id)
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300'"
          >
            {{ taskMastered(store.activeScenario.id, task.id) ? '✓' : taskIndex(task.id) }}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-white">{{ task.title }}</h4>
            <p class="text-gray-400 text-sm">{{ task.description }}</p>
            <div v-if="taskResult(store.activeScenario.id, task.id)" class="mt-1 text-xs text-gray-500">
              尝试 {{ taskResult(store.activeScenario.id, task.id)!.attempts }} 次 ·
              正确 {{ taskResult(store.activeScenario.id, task.id)!.correct }} 次
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-900 rounded-xl p-5 flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <button @click="store.activeTaskId = null" class="text-gray-400 hover:text-white text-sm">
              ← 返回任务列表
            </button>
          </div>
          <h4 class="text-lg font-bold text-white">{{ store.activeTask.title }}</h4>
          <p class="text-gray-400 text-sm">{{ store.activeTask.description }}</p>

          <div class="bg-gray-800 rounded-lg p-4">
            <p class="text-gray-400 text-xs mb-1">莫尔斯码</p>
            <p class="font-mono text-green-400 text-lg break-all">{{ morseForTask }}</p>
          </div>

          <div class="flex gap-2">
            <button
              @click="store.playScenarioTask()"
              :disabled="store.scenarioPlaying"
              class="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-500 disabled:opacity-50"
            >
              {{ store.scenarioPlaying ? '播放中...' : '🔊 播放音频' }}
            </button>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-gray-400 text-sm">输入听到的内容（不区分大小写）</label>
            <input
              v-model="store.scenarioInput"
              @keyup.enter="submitAnswer"
              class="bg-gray-800 rounded px-4 py-3 text-lg w-full"
              placeholder="输入抄收内容..."
            />
            <button @click="submitAnswer" class="bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-400 font-bold">
              提交答案
            </button>
          </div>

          <div v-if="lastResult !== null" class="rounded-lg p-3" :class="lastResult ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'">
            <p :class="lastResult ? 'text-green-400' : 'text-red-400'" class="font-bold">
              {{ lastResult ? '✓ 抄收正确！' : '✗ 抄收有误' }}
            </p>
            <p v-if="!lastResult" class="text-gray-300 text-sm mt-1">
              正确答案: <span class="text-amber-400 font-mono">{{ store.activeTask.text }}</span>
            </p>
          </div>
        </div>

        <div class="bg-gray-900 rounded-xl p-5 flex flex-col gap-3">
          <h4 class="text-amber-300 font-bold">任务掌握情况</h4>

          <div v-if="currentTaskResult" class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-gray-800 rounded p-2">
              <div class="text-2xl font-bold text-amber-400">{{ currentTaskResult.attempts }}</div>
              <div class="text-xs text-gray-400">尝试次数</div>
            </div>
            <div class="bg-gray-800 rounded p-2">
              <div class="text-2xl font-bold text-green-400">{{ currentTaskResult.correct }}</div>
              <div class="text-xs text-gray-400">正确次数</div>
            </div>
            <div class="bg-gray-800 rounded p-2">
              <div class="text-2xl font-bold" :class="currentTaskResult.mastered ? 'text-green-400' : 'text-red-400'">
                {{ currentTaskResult.mastered ? '已掌握' : '未掌握' }}
              </div>
              <div class="text-xs text-gray-400">掌握状态</div>
            </div>
          </div>

          <div v-else class="text-center text-gray-500 py-4">尚未作答</div>

          <h4 class="text-amber-300 font-bold mt-2">场景总览</h4>
          <div
            v-for="task in store.activeScenario.tasks"
            :key="'overview-' + task.id"
            class="flex items-center gap-2 bg-gray-800 rounded p-2 text-sm"
          >
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
              :class="taskMastered(store.activeScenario.id, task.id)
                ? 'bg-green-600 text-white'
                : 'bg-gray-600 text-gray-300'"
            >
              {{ taskMastered(store.activeScenario.id, task.id) ? '✓' : '·' }}
            </div>
            <span :class="taskMastered(store.activeScenario.id, task.id) ? 'text-green-400' : 'text-gray-300'">
              {{ task.title }}
            </span>
            <span v-if="task.id === store.activeTask?.id" class="ml-auto text-amber-400 text-xs">当前</span>
          </div>

          <div v-if="scenarioCompleted" class="mt-2 bg-green-900/30 border border-green-600 rounded-lg p-3 text-center">
            <p class="text-green-400 font-bold text-lg">🎉 场景已全部掌握！</p>
            <p class="text-gray-300 text-sm mt-1">
              完成时间: {{ new Date(store.scenarioMasteries[store.activeScenario.id].completedAt!).toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMorseStore } from '../store/morse'
import { textToMorse } from '../utils/morse-code'

const store = useMorseStore()
const lastResult = ref<boolean | null>(null)

const morseForTask = computed(() =>
  store.activeTask ? textToMorse(store.activeTask.text) : ''
)

const currentTaskResult = computed(() => {
  if (!store.activeScenarioId || !store.activeTaskId) return null
  const mastery = store.scenarioMasteries[store.activeScenarioId]
  if (!mastery) return null
  return mastery.taskResults[store.activeTaskId] ?? null
})

const scenarioCompleted = computed(() => {
  if (!store.activeScenarioId) return false
  return store.getScenarioProgress(store.activeScenarioId).percent === 100
})

function taskMastered(scenarioId: string, taskId: string): boolean {
  const mastery = store.scenarioMasteries[scenarioId]
  if (!mastery) return false
  return mastery.taskResults[taskId]?.mastered ?? false
}

function taskResult(scenarioId: string, taskId: string) {
  const mastery = store.scenarioMasteries[scenarioId]
  if (!mastery) return null
  return mastery.taskResults[taskId] ?? null
}

function taskIndex(taskId: string): number {
  if (!store.activeScenario) return 0
  const idx = store.activeScenario.tasks.findIndex(t => t.id === taskId)
  return idx + 1
}

function themeTextClass(theme: 'maritime' | 'rescue') {
  return theme === 'maritime' ? 'text-blue-400' : 'text-red-400'
}

function themeBorderClass(theme: 'maritime' | 'rescue') {
  return theme === 'maritime' ? 'border-blue-800 hover:border-blue-500' : 'border-red-800 hover:border-red-500'
}

function themeBarClass(theme: 'maritime' | 'rescue') {
  return theme === 'maritime' ? 'bg-blue-500' : 'bg-red-500'
}

function submitAnswer() {
  if (!store.scenarioInput.trim()) return
  const result = store.checkScenarioAnswer()
  if (result !== undefined) {
    lastResult.value = result
  }
}
</script>
