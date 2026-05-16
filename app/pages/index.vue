<script setup lang="ts">
import { parseMfcCsv } from '~/utils/mfc/csv'
import { buildResultsCsv, buildResultsJson } from '~/utils/mfc/export'
import { EVENT_LABELS, scoreParticipants } from '~/utils/mfc/score'
import type { ScoredParticipant } from '~/utils/mfc/score'

const fileRef = ref<HTMLInputElement | null>(null)
const parseError = ref<string | null>(null)
const scored = ref<ScoredParticipant[] | null>(null)
const busy = ref(false)
const showTemplatePreview = ref(false)

// Event list for hero section
const events = [
  { num: 1, name: 'Max Pull-ups', icon: 'i-lucide-dumbbell' },
  { num: 2, name: 'Box Squat Reps', icon: 'i-lucide-dumbbell' },
  { num: 3, name: 'Max Push-ups', icon: 'i-lucide-dumbbell' },
  { num: 4, name: 'Sit & Reach', icon: 'i-lucide-activity' },
  { num: 5, name: 'Max Chin-ups', icon: 'i-lucide-dumbbell' },
  { num: 6, name: 'Max Dips', icon: 'i-lucide-dumbbell' },
  { num: 7, name: 'Plank Hold', icon: 'i-lucide-timer' },
  { num: 8, name: 'Dead Hang', icon: 'i-lucide-timer' },
  { num: 9, name: 'Broad Jump', icon: 'i-lucide-activity' },
  { num: 10, name: '100m Sprint', icon: 'i-lucide-timer' },
  { num: 11, name: '1 Mile Run', icon: 'i-lucide-timer' },
  { num: 12, name: 'Burpees (3 min)', icon: 'i-lucide-dumbbell' }
]

function pickFile() {
  fileRef.value?.click()
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  parseError.value = null
  scored.value = null
  if (!file) return
  busy.value = true
  file
    .text()
    .then((text) => {
      const { rows, errors } = parseMfcCsv(text)
      if (errors.length) {
        parseError.value = errors.join('\n')
        return
      }
      scored.value = scoreParticipants(rows)
    })
    .catch((err) => {
      parseError.value = err instanceof Error ? err.message : String(err)
    })
    .finally(() => {
      busy.value = false
      input.value = ''
    })
}

const eventKeys = [
  'e1',
  'e2',
  'e3',
  'e4',
  'e5',
  'e6',
  'e7',
  'e8',
  'e9',
  'e10',
  'e11',
  'e12'
] as const

function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function downloadTemplate() {
  download(
    'sample-mfc-2026.csv',
    'id,name,sex,age,bodyweight_lb,e1_pullups,e2_box_squat_reps,e3_pushups,e4_sit_reach_inches,e5_chinups,e6_dips,e7_plank_sec,e8_deadhang_sec,e9_broad_jump_inches,e10_100m_sec,e11_mile_sec,e12_burpees\n1,Sample Person,male,30,180,15,40,50,5.0,10,18,120,180,210,13.0,420,40',
    'text/csv'
  )
}

function exportCsv() {
  if (!scored.value) return
  download(`mfc-2026-results-${Date.now()}.csv`, buildResultsCsv(scored.value), 'text/csv')
}

function exportJson() {
  if (!scored.value) return
  download(
    `mfc-2026-results-${Date.now()}.json`,
    JSON.stringify(buildResultsJson(scored.value), null, 2),
    'application/json'
  )
}

function resetResults() {
  scored.value = null
  parseError.value = null
}
</script>

<template>
  <div class="w-full">
    <!-- Hero Section with MFC Branding -->
    <div
      v-if="!scored"
      class="
        bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700
        text-white px-4 py-16 sm:py-20 md:py-24
      "
    >
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Headline -->
        <div class="space-y-3">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-black leading-tight">
            MAY FITNESS
            <br>
            CHALLENGE 2026
          </h1>
          <p class="text-blue-100 text-lg sm:text-xl">
            <strong>Stronger Together. Better Together.</strong>
          </p>
        </div>

        <!-- Tagline & Description -->
        <div class="space-y-4">
          <p class="text-blue-50 text-base sm:text-lg leading-relaxed max-w-2xl">
            Upload your participant scores and instantly see rankings. The Score Builder calculates per-event points
            based on Strength Level data, totals them up, and ranks everyone.
          </p>
        </div>

        <!-- Event Grid Preview -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div
            v-for="event in events"
            :key="event.num"
            class="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
          >
            <div class="text-sm font-semibold text-blue-100">
              {{ event.name }}
            </div>
            <div class="text-2xl mt-1">
              💪
            </div>
          </div>
        </div>

        <!-- Main CTA -->
        <div class="pt-4">
          <UButton
            color="primary"
            size="lg"
            icon="i-lucide-upload"
            label="Upload CSV to Score"
            class="
              font-bold text-base
              bg-white text-blue-600 hover:bg-blue-50
            "
            @click="pickFile"
          />
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <!-- Upload Section (shown when no scores) -->
      <div
        v-if="!scored"
        class="space-y-6"
      >
        <!-- CSV Template Card -->
        <UCard class="border-2 border-blue-200 bg-blue-50/50 dark:bg-slate-900">
          <template #header>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">
              📋 Prepare Your CSV
            </h2>
          </template>

          <div class="space-y-4">
            <p class="text-slate-700 dark:text-slate-300">
              Your CSV file needs these columns in this exact order:
            </p>

            <!-- Template Preview -->
            <div
              class="
                bg-white dark:bg-slate-800 rounded-lg p-4
                overflow-x-auto border border-slate-200 dark:border-slate-700
              "
            >
              <table class="text-xs sm:text-sm w-full">
                <thead>
                  <tr class="border-b border-slate-300 dark:border-slate-600">
                    <th class="text-left py-2 px-2 font-bold text-slate-900 dark:text-white">
                      id
                    </th>
                    <th class="text-left py-2 px-2 font-bold text-slate-900 dark:text-white">
                      name
                    </th>
                    <th class="text-left py-2 px-2 font-bold text-slate-900 dark:text-white">
                      sex
                    </th>
                    <th class="text-left py-2 px-2 font-bold text-slate-900 dark:text-white">
                      age
                    </th>
                    <th class="text-left py-2 px-2 font-bold text-slate-900 dark:text-white">
                      bw_lb
                    </th>
                    <th class="text-left py-2 px-2 font-bold text-slate-900 dark:text-white">
                      e1…e12
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-slate-200 dark:border-slate-700">
                    <td class="py-2 px-2 text-slate-600 dark:text-slate-300">
                      1
                    </td>
                    <td class="py-2 px-2 text-slate-600 dark:text-slate-300">
                      Alex
                    </td>
                    <td class="py-2 px-2 text-slate-600 dark:text-slate-300">
                      male
                    </td>
                    <td class="py-2 px-2 text-slate-600 dark:text-slate-300">
                      30
                    </td>
                    <td class="py-2 px-2 text-slate-600 dark:text-slate-300">
                      180
                    </td>
                    <td class="py-2 px-2 text-slate-600 dark:text-slate-300">
                      15, 40, 50, …
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p>
                <strong>Column Details:</strong>
              </p>
              <ul class="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>sex:</strong>
                  "male" or "female" (or m/f)
                </li>
                <li>
                  <strong>e1_pullups:</strong>
                  Max pull-ups (reps)
                </li>
                <li>
                  <strong>e2_box_squat_reps, e3_pushups:</strong>
                  Reps
                </li>
                <li>
                  <strong>e4_sit_reach_inches:</strong>
                  Inches (can be negative)
                </li>
                <li>
                  <strong>e5_chinups, e6_dips:</strong>
                  Max reps
                </li>
                <li>
                  <strong>e7_plank_sec, e8_deadhang_sec:</strong>
                  Seconds
                </li>
                <li>
                  <strong>e9_broad_jump_inches, e10_100m_sec, e11_mile_sec:</strong>
                  Distance/time
                </li>
                <li>
                  <strong>e12_burpees:</strong>
                  Reps in 3 minutes
                </li>
              </ul>
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <UButton
                color="primary"
                variant="soft"
                icon="i-lucide-download"
                label="Download Template CSV"
                @click="downloadTemplate"
              />
              <UButton
                color="primary"
                variant="outline"
                icon="i-lucide-eye"
                label="View Sample"
                @click="showTemplatePreview = !showTemplatePreview"
              />
            </div>
          </div>
        </UCard>

        <!-- Hidden File Input -->
        <input
          ref="fileRef"
          class="hidden"
          type="file"
          accept=".csv,text/csv"
          @change="onFileSelected"
        >

        <!-- Upload Button Card -->
        <UCard class="border-2 border-green-200 bg-green-50/50 dark:bg-slate-800">
          <template #header>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">
              📤 Upload Your File
            </h2>
          </template>

          <div class="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <div class="text-5xl">
              📁
            </div>
            <div>
              <p class="text-slate-700 dark:text-slate-300 font-semibold">
                Ready to score?
              </p>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Select your CSV file to get started
              </p>
            </div>
            <UButton
              :loading="busy"
              color="primary"
              size="lg"
              icon="i-lucide-upload"
              label="Choose CSV file"
              class="font-semibold"
              @click="pickFile"
            />
          </div>

          <!-- Error Display -->
          <UAlert
            v-if="parseError"
            class="mt-6"
            color="error"
            variant="subtle"
            title="⚠️ Could not parse CSV"
            :description="parseError"
            icon="i-lucide-alert-circle"
          />
        </UCard>

        <!-- Scoring Info Section -->
        <UCard class="border-2 border-slate-200 dark:border-slate-700">
          <template #header>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">
              ✨ How Scoring Works
            </h2>
          </template>

          <div class="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <p>
              <strong>Points per event:</strong>
              Each event is scored on a scale of 0–10 points. Top performers get 10; scores
              decrease based on performance relative to the group.
            </p>
            <p>
              <strong>Strength Level integration:</strong>
              For pull-ups, chin-ups, and dips, scores are calculated using Strength Level's
              body weight and age-based percentile tables. We take the stricter of the two
              percentiles for accuracy.
            </p>
            <p>
              <strong>Total score:</strong>
              All 12 events are summed. Max possible score is 120 points. Participants are
              ranked by total score (highest first).
            </p>
            <p class="text-xs text-slate-600 dark:text-slate-400 italic">
              🔗 Learn more:
              <NuxtLink
                to="https://www.strengthlevel.com"
                target="_blank"
                class="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Strength Level
              </NuxtLink>
            </p>
          </div>
        </UCard>
      </div>

      <!-- Results Section (shown after upload) -->
      <div
        v-if="scored?.length"
        class="space-y-6"
      >
        <!-- Results Header -->
        <div
          class="
            flex flex-col sm:flex-row sm:items-center
            sm:justify-between gap-4 py-4
            border-b-2 border-blue-200 dark:border-blue-900
          "
        >
          <div>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              🏆 Results
            </h2>
            <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">
              {{ scored.length }} participants scored
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              color="primary"
              icon="i-lucide-file-down"
              label="Download CSV"
              @click="exportCsv"
            />
            <UButton
              color="primary"
              variant="outline"
              icon="i-lucide-braces"
              label="Download JSON"
              @click="exportJson"
            />
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-upload"
              label="Upload Another"
              @click="resetResults"
            />
          </div>
        </div>

        <!-- Results Table -->
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table class="w-full text-sm">
            <thead class="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                  Rank
                </th>
                <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                  Name
                </th>
                <th class="px-4 py-3 text-left font-bold text-blue-600 dark:text-blue-400">
                  Total
                </th>
                <th
                  v-for="ek in eventKeys"
                  :key="ek"
                  class="
                    px-3 py-3 text-center font-bold
                    text-slate-700 dark:text-slate-300
                    whitespace-nowrap text-xs sm:text-sm
                  "
                  :title="EVENT_LABELS[ek]"
                >
                  <span class="hidden sm:inline">{{ EVENT_LABELS[ek] }}</span>
                  <span class="sm:hidden">{{ ek.slice(1) }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr
                v-for="p in scored"
                :key="p.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="px-4 py-3 font-bold text-slate-900 dark:text-white">
                  <span
                    v-if="p.rank === 1"
                    class="
                      inline-flex items-center justify-center
                      w-8 h-8 bg-yellow-400 text-yellow-900
                      rounded-full font-black text-sm
                    "
                  >
                    🥇
                  </span>
                  <span
                    v-else-if="p.rank === 2"
                    class="
                      inline-flex items-center justify-center
                      w-8 h-8 bg-gray-300 text-gray-900
                      rounded-full font-black text-sm
                    "
                  >
                    🥈
                  </span>
                  <span
                    v-else-if="p.rank === 3"
                    class="
                      inline-flex items-center justify-center
                      w-8 h-8 bg-orange-400 text-orange-900
                      rounded-full font-black text-sm
                    "
                  >
                    🥉
                  </span>
                  <span
                    v-else
                    class="text-slate-600 dark:text-slate-400"
                  >{{ p.rank }}</span>
                </td>
                <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {{ p.name }}
                </td>
                <td class="px-4 py-3 font-bold text-lg text-blue-600 dark:text-blue-400">
                  {{ p.total.toFixed(1) }}
                </td>
                <td
                  v-for="ek in eventKeys"
                  :key="ek"
                  class="
                    px-3 py-3 text-center
                    text-slate-700 dark:text-slate-300
                    text-xs sm:text-sm
                  "
                >
                  {{ p.events[ek]?.toFixed(1) ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Scoring Note -->
        <UCard class="bg-blue-50/50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700">
          <p class="text-sm text-slate-700 dark:text-slate-300">
            <strong>📊 Scoring Method:</strong>
            Per-event points are on a 0–10 scale. Strength Level events (chin-ups, dips,
            pull-ups) use body weight and age percentiles. Total score = sum of all 12 events
            (max 120).
          </p>
        </UCard>
      </div>
    </div>
  </div>
</template>
