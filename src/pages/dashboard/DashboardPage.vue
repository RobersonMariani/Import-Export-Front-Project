<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { healthService } from "@/services/healthService";
import AppCard from "@/components/ui/AppCard.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import type { Health } from "@/types";

const health = ref<Health | null>(null);
const metrics = ref<Record<string, string>>({});
const loading = ref(true);

const statusPattern = /status="([^"]+)"/;
const queuePattern = /queue="([^"]+)"/;

function parseMetrics(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const match = line.match(/^(\S+?)(?:\{([^}]*)\})?\s+(\S+)$/);
    if (match && match[1] && match[3]) {
      const key = match[2] ? `${match[1]}{${match[2]}}` : match[1];
      result[key] = match[3];
    }
  }
  return result;
}

function extractStatus(key: string): string {
  return key.match(statusPattern)?.[1] ?? "";
}

function extractQueue(key: string): string {
  return key.match(queuePattern)?.[1] ?? "";
}

const importEntries = computed(() =>
  Object.entries(metrics.value).filter(([k]) => k.startsWith("import_total")),
);

const exportEntries = computed(() =>
  Object.entries(metrics.value).filter(([k]) => k.startsWith("export_total")),
);

const queueEntries = computed(() =>
  Object.entries(metrics.value).filter(([k]) => k.startsWith("queue_size")),
);

const totalImports = computed(() =>
  importEntries.value.reduce((s, [, v]) => s + Number(v), 0),
);

const totalExports = computed(() =>
  exportEntries.value.reduce((s, [, v]) => s + Number(v), 0),
);

const totalQueue = computed(() =>
  queueEntries.value.reduce((s, [, v]) => s + Number(v), 0),
);

onMounted(async () => {
  try {
    const [h, rawMetrics] = await Promise.all([
      healthService.check(),
      healthService.metrics(),
    ]);
    health.value = h;
    metrics.value = parseMetrics(rawMetrics);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">Visão geral do sistema de importação e exportação</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <svg class="h-8 w-8 animate-spin text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm text-gray-500">Carregando dados...</p>
      </div>
    </div>

    <template v-else>
      <div class="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">Status API</p>
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50">
              <svg class="h-5 w-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <AppBadge v-if="health" :status="health.status" :label="health.status_label" />
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">Total Importações</p>
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <svg class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ totalImports }}</p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">Total Exportações</p>
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-info-50">
              <svg class="h-5 w-5 text-info-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ totalExports }}</p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-medium text-gray-500">Jobs na Fila</p>
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50">
              <svg class="h-5 w-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ totalQueue }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AppCard title="Importações por Status">
          <div v-if="importEntries.length === 0" class="py-4 text-center text-sm text-gray-400">Nenhum dado disponível</div>
          <div v-else class="space-y-3">
            <div
              v-for="[key, val] in importEntries"
              :key="key"
              class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5"
            >
              <AppBadge :status="extractStatus(key)" :label="extractStatus(key)" />
              <span class="text-sm font-bold text-gray-700">{{ val }}</span>
            </div>
          </div>
        </AppCard>

        <AppCard title="Exportações por Status">
          <div v-if="exportEntries.length === 0" class="py-4 text-center text-sm text-gray-400">Nenhum dado disponível</div>
          <div v-else class="space-y-3">
            <div
              v-for="[key, val] in exportEntries"
              :key="key"
              class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5"
            >
              <AppBadge :status="extractStatus(key)" :label="extractStatus(key)" />
              <span class="text-sm font-bold text-gray-700">{{ val }}</span>
            </div>
          </div>
        </AppCard>

        <AppCard title="Filas de Processamento">
          <div v-if="queueEntries.length === 0" class="py-4 text-center text-sm text-gray-400">Nenhum dado disponível</div>
          <div v-else class="space-y-3">
            <div
              v-for="[key, val] in queueEntries"
              :key="key"
              class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5"
            >
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full" :class="Number(val) > 0 ? 'bg-warning-500' : 'bg-success-500'" />
                <span class="text-sm font-medium text-gray-700">{{ extractQueue(key) }}</span>
              </div>
              <span class="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-bold text-gray-700">{{ val }} jobs</span>
            </div>
          </div>
        </AppCard>

        <AppCard v-if="health" title="Serviços">
          <div class="space-y-3">
            <div
              v-for="(info, name) in health.services"
              :key="name"
              class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5"
            >
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full" :class="info.status === 'up' ? 'bg-success-500' : 'bg-danger-500'" />
                <span class="text-sm font-medium text-gray-700">{{ name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <AppBadge
                  :status="info.status === 'up' ? 'healthy' : 'unhealthy'"
                  :label="info.status"
                />
                <span v-if="info.latency_ms !== null" class="text-xs text-gray-400">
                  {{ info.latency_ms }}ms
                </span>
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </template>
  </div>
</template>
