<script setup lang="ts">
import { parseMfcCsv } from '~/utils/mfc/csv'
import { buildResultsCsv, buildResultsJson } from '~/utils/mfc/export'
import { EVENT_LABELS, scoreParticipants } from '~/utils/mfc/score'
import type { ScoredParticipant } from '~/utils/mfc/score'

const fileRef = ref<HTMLInputElement | null>(null)
const parseError = ref<string | null>(null)
const scored = ref<ScoredParticipant[] | null>(null)
const busy = ref(false)

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
</script>

<template>
  <div class="max-w-[1400px] mx-auto px-4 py-10 space-y-8">
    <UPageHero
      title="May Fitness Challenge 2026"
      description="Upload a participant CSV to compute per-event points (10 per event max), total, and rank. Chin-ups, dips, and men’s pull-ups use offline Strength Level JSON (run pnpm run harvest:strengthlevel to refresh) — not live HTTP to strengthlevel.com."
      orientation="horizontal"
    />

    <UCard>
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 class="text-lg font-semibold text-highlighted">
            1. Upload CSV
          </h2>
          <p class="text-muted text-sm mt-1">
            Template: <code class="text-xs">/sample-mfc-2026.csv</code> — see README for column units.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <input
            ref="fileRef"
            class="hidden"
            type="file"
            accept=".csv,text/csv"
            @change="onFileSelected"
          >
          <UButton
            :loading="busy"
            color="primary"
            icon="i-lucide-upload"
            label="Choose CSV file"
            @click="pickFile"
          />
          <UButton
            v-if="scored?.length"
            color="neutral"
            variant="outline"
            icon="i-lucide-file-down"
            label="Download CSV"
            @click="exportCsv"
          />
          <UButton
            v-if="scored?.length"
            color="neutral"
            variant="outline"
            icon="i-lucide-braces"
            label="Download JSON"
            @click="exportJson"
          />
        </div>
      </div>

      <UAlert
        v-if="parseError"
        class="mt-6"
        color="error"
        variant="subtle"
        title="Could not parse CSV"
        :description="parseError"
      />

      <div
        v-if="scored?.length"
        class="mt-6 space-y-4 overflow-x-auto"
      >
        <p class="text-sm text-muted">
          Strength Level merge (MVP): <strong>min(bodyweight percentile, age percentile)</strong> — documented in each
          <code>data/strengthlevel/*.json</code>.
        </p>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="text-left border-b border-default">
              <th class="py-2 pr-3">
                Rank
              </th>
              <th class="py-2 pr-3">
                Name
              </th>
              <th class="py-2 pr-3">
                Total
              </th>
              <th
                v-for="ek in eventKeys"
                :key="ek"
                class="py-2 pr-2 whitespace-nowrap"
              >
                {{ EVENT_LABELS[ek] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in scored"
              :key="p.id"
              class="border-b border-default/60"
            >
              <td class="py-2 pr-3 font-mono">
                {{ p.rank }}
              </td>
              <td class="py-2 pr-3">
                {{ p.name }}
              </td>
              <td class="py-2 pr-3 font-semibold">
                {{ p.total.toFixed(2) }}
              </td>
              <td
                v-for="ek in eventKeys"
                :key="ek"
                class="py-2 pr-2"
              >
                {{ p.events[ek]?.toFixed(2) ?? '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
