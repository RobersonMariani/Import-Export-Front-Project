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
    <h1 class="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      Carregando...
    </div>

    <template v-else>
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AppCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Status API</p>
              <AppBadge
                v-if="health"
                :status="health.status"
                :label="health.status_label"
              />
            </div>
            <span class="text-3xl">💚</span>
          </div>
        </AppCard>

        <AppCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Imports</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalImports }}</p>
            </div>
            <span class="text-3xl">📥</span>
          </div>
        </AppCard>

        <AppCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Exports</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalExports }}</p>
            </div>
            <span class="text-3xl">📤</span>
          </div>
        </AppCard>

        <AppCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Jobs na Fila</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalQueue }}</p>
            </div>
            <span class="text-3xl">⏳</span>
          </div>
        </AppCard>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AppCard title="Importações por Status">
          <div class="space-y-3">
            <div
              v-for="[key, val] in importEntries"
              :key="key"
              class="flex items-center justify-between"
            >
              <AppBadge
                :status="extractStatus(key)"
                :label="extractStatus(key)"
              />
              <span class="text-sm font-semibold text-gray-700">{{ val }}</span>
            </div>
          </div>
        </AppCard>

        <AppCard title="Exportações por Status">
          <div class="space-y-3">
            <div
              v-for="[key, val] in exportEntries"
              :key="key"
              class="flex items-center justify-between"
            >
              <AppBadge
                :status="extractStatus(key)"
                :label="extractStatus(key)"
              />
              <span class="text-sm font-semibold text-gray-700">{{ val }}</span>
            </div>
          </div>
        </AppCard>

        <AppCard title="Filas">
          <div class="space-y-3">
            <div
              v-for="[key, val] in queueEntries"
              :key="key"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-600">{{ extractQueue(key) }}</span>
              <span class="text-sm font-semibold text-gray-700"
                >{{ val }} jobs</span
              >
            </div>
          </div>
        </AppCard>

        <AppCard v-if="health" title="Serviços">
          <div class="space-y-3">
            <div
              v-for="(info, name) in health.services"
              :key="name"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-600">{{ name }}</span>
              <div class="flex items-center gap-2">
                <AppBadge
                  :status="info.status === 'up' ? 'healthy' : 'unhealthy'"
                  :label="info.status"
                />
                <span
                  v-if="info.latency_ms !== null"
                  class="text-xs text-gray-400"
                >
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
