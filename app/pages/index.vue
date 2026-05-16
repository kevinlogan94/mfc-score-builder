<script setup lang="ts">
import { parseMfcCsv } from '~/utils/mfc/csv'
import { buildResultsCsv, buildResultsJson } from '~/utils/mfc/export'
import { EVENT_LABELS, scoreParticipants } from '~/utils/mfc/score'
import type { ScoredParticipant } from '~/utils/mfc/score'

const fileRef = ref<HTMLInputElement | null>(null)
const parseError = ref<string | null>(null)
const scored = ref<ScoredParticipant[] | null>(null)
const busy = ref(false)

// Event list for reference
const events = [
  { num: 1, name: 'Max Pull-ups' },
  { num: 2, name: 'Box Squat Reps' },
  { num: 3, name: 'Max Push-ups' },
  { num: 4, name: 'Sit & Reach' },
  { num: 5, name: 'Max Chin-ups' },
  { num: 6, name: 'Max Dips' },
  { num: 7, name: 'Plank Hold' },
  { num: 8, name: 'Dead Hang' },
  { num: 9, name: 'Broad Jump' },
  { num: 10, name: '100m Sprint' },
  { num: 11, name: '1 Mile Run' },
  { num: 12, name: 'Burpees (3 min)' }
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
  <div class="w-full bg-white dark:bg-slate-950">
    <!-- Hero Section with MFC Branding -->
    <div
      v-if="!scored"
      class="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 text-white px-4 py-20 sm:py-28 md:py-32"
    >
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Headline -->
        <div class="space-y-4">
          <h1 class="text-5xl sm:text-6xl md:text-7xl font-black leading-tight">
            MAY FITNESS<br>CHALLENGE 2026
          </h1>
          <p class="text-blue-100 text-xl sm:text-2xl font-semibold">
            Stronger Together. Better Together.
          </p>
        </div>

        <!-- Tagline & Description -->
        <div class="space-y-4">
          <p class="text-blue-50 text-lg sm:text-xl leading-relaxed max-w-2xl">
            Upload your participant scores and instantly see rankings. The Score Builder calculates per-event points
            based on Strength Level data, totals them up, and ranks everyone fairly.
          </p>
        </div>

        <!-- Event List (text-only, readable) -->
        <div class="pt-4">
          <p class="text-blue-100 text-sm font-semibold mb-4">
            12 EVENTS SCORED
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div
              v-for="event in events"
              :key="event.num"
              class="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-3 text-center border border-white/20"
            >
              <div class="text-xl font-bold text-white">
                {{ event.num }}
              </div>
              <div class="text-xs sm:text-sm font-medium text-blue-100 leading-tight mt-1">
                {{ event.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Main CTA -->
        <div class="pt-6">
          <UButton
            color="primary"
            size="lg"
            icon="i-lucide-upload"
            label="Upload CSV to Score"
            class="font-bold text-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer"
            @click="pickFile"
          />
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="max-w-5xl mx-auto px-4 py-16 space-y-16">
      <!-- Upload Section (shown when no scores) -->
      <div
        v-if="!scored"
        class="space-y-12"
      >
        <!-- CSV Preparation Section -->
        <section class="space-y-8">
          <div>
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              📋 Prepare Your CSV
            </h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">
              Your CSV file needs these columns in this exact order
            </p>
          </div>

          <!-- Template Preview Table -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      id
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      name
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      sex
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      age
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      bw_lb
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e1_pullups
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e2_box_squat_reps
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e3_pushups
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e4_sit_reach_inches
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e5_chinups
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e6_dips
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e7_plank_sec
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e8_deadhang_sec
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e9_broad_jump_inches
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e10_100m_sec
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e11_mile_sec
                    </th>
                    <th class="px-4 py-3 text-left font-bold text-slate-900 dark:text-white">
                      e12_burpees
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      1
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      Alex
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      male
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      30
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      180
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      15
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      40
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      50
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      5.0
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      10
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      18
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      120
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      180
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      210
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      13.0
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      420
                    </td>
                    <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                      40
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Column Descriptions -->
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Column Details
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  id
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Unique participant ID
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  name
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Participant name
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  sex
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  "male" or "female" (m/f)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  age
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Age in years
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  bodyweight_lb
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Body weight in lbs
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e1_pullups
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Max pull-ups (reps)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e2_box_squat_reps
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Box squat reps
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e3_pushups
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Max push-ups (reps)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e4_sit_reach_inches
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Sit & reach (inches)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e5_chinups
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Max chin-ups (reps)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e6_dips
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Max dips (reps)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e7_plank_sec
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Plank hold (seconds)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e8_deadhang_sec
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Dead hang (seconds)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e9_broad_jump_inches
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Broad jump (inches)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e10_100m_sec
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  100m sprint (seconds)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e11_mile_sec
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  1 mile run (seconds)
                </p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-3 border border-slate-200 dark:border-slate-700">
                <p class="font-semibold text-slate-900 dark:text-white mb-1 text-xs">
                  e12_burpees
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Burpees in 3 min (reps)
                </p>
              </div>
            </div>
          </div>

          <!-- Download Template Button -->
          <div class="flex flex-col sm:flex-row gap-3">
            <UButton
              color="primary"
              size="lg"
              icon="i-lucide-download"
              label="Download Template CSV"
              class="cursor-pointer font-semibold"
              @click="downloadTemplate"
            />
            <p class="text-sm text-slate-600 dark:text-slate-400 flex items-center">
              Download this template and fill in your data
            </p>
          </div>
        </section>

        <!-- Hidden File Input -->
        <input
          ref="fileRef"
          class="hidden"
          type="file"
          accept=".csv,text/csv"
          @change="onFileSelected"
        >

        <!-- Upload Card -->
        <section class="space-y-6">
          <div>
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              📤 Upload Your File
            </h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg">
              Select your completed CSV to get started
            </p>
          </div>

          <div class="bg-white dark:bg-slate-900 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl p-12 text-center space-y-6">
            <div class="text-6xl">
              📁
            </div>
            <div>
              <p class="text-xl font-semibold text-slate-900 dark:text-white">
                Ready to score?
              </p>
              <p class="text-slate-600 dark:text-slate-400 mt-2">
                Select your CSV file to begin
              </p>
            </div>
            <UButton
              :loading="busy"
              color="primary"
              size="lg"
              icon="i-lucide-upload"
              label="Choose CSV file"
              class="cursor-pointer font-bold"
              @click="pickFile"
            />

            <!-- Error Display -->
            <UAlert
              v-if="parseError"
              color="error"
              variant="subtle"
              title="⚠️ Could not parse CSV"
              :description="parseError"
              icon="i-lucide-alert-circle"
              class="mt-6 text-left"
            />
          </div>
        </section>

        <!-- Scoring Info Section -->
        <section class="space-y-6">
          <div>
            <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              ✨ How Scoring Works
            </h2>
          </div>

          <div class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p class="font-bold text-slate-900 dark:text-white mb-2">
                Points per event
              </p>
              <p class="text-slate-700 dark:text-slate-300">
                Each event is scored on a scale of 0–10 points. Top performers get 10; scores decrease based on performance relative to the group.
              </p>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p class="font-bold text-slate-900 dark:text-white mb-2">
                Strength Level integration
              </p>
              <p class="text-slate-700 dark:text-slate-300">
                For pull-ups, chin-ups, and dips, scores are calculated using Strength Level's body weight and age-based percentile tables. We take the stricter of the two percentiles for accuracy.
              </p>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <p class="font-bold text-slate-900 dark:text-white mb-2">
                Total score
              </p>
              <p class="text-slate-700 dark:text-slate-300">
                All 12 events are summed. Max possible score is 120 points. Participants are ranked by total score (highest first).
              </p>
            </div>

            <div class="text-sm text-slate-600 dark:text-slate-400">
              🔗 Learn more:
              <NuxtLink
                to="https://www.strengthlevel.com"
                target="_blank"
                class="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Strength Level
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>

      <!-- Results Section (shown after upload) -->
      <div
        v-if="scored?.length"
        class="space-y-8"
      >
        <!-- Results Header -->
        <div class="space-y-4 border-b border-slate-200 dark:border-slate-700 pb-6">
          <div>
            <h2 class="text-4xl font-bold text-slate-900 dark:text-white">
              🏆 Results
            </h2>
            <p class="text-slate-600 dark:text-slate-400 text-lg mt-2">
              {{ scored.length }} participants scored
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <UButton
              color="primary"
              size="lg"
              icon="i-lucide-file-down"
              label="Download CSV"
              class="cursor-pointer font-semibold"
              @click="exportCsv"
            />
            <UButton
              color="primary"
              variant="outline"
              size="lg"
              icon="i-lucide-braces"
              label="Download JSON"
              class="cursor-pointer font-semibold"
              @click="exportJson"
            />
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              icon="i-lucide-upload"
              label="Upload Another"
              class="cursor-pointer font-semibold"
              @click="resetResults"
            />
          </div>
        </div>

        <!-- Results Table -->
        <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
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
                  class="px-3 py-3 text-center font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs sm:text-sm"
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
                    class="inline-flex items-center justify-center w-8 h-8 bg-yellow-400 text-yellow-900 rounded-full font-black text-sm"
                  >
                    🥇
                  </span>
                  <span
                    v-else-if="p.rank === 2"
                    class="inline-flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-900 rounded-full font-black text-sm"
                  >
                    🥈
                  </span>
                  <span
                    v-else-if="p.rank === 3"
                    class="inline-flex items-center justify-center w-8 h-8 bg-orange-400 text-orange-900 rounded-full font-black text-sm"
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
                  class="px-3 py-3 text-center text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                >
                  {{ p.events[ek]?.toFixed(1) ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Scoring Note -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-slate-700 dark:text-slate-300">
            <strong>📊 Scoring Method:</strong>
            Per-event points are on a 0–10 scale. Strength Level events (chin-ups, dips, pull-ups) use body weight and age percentiles. Total score = sum of all 12 events (max 120).
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
