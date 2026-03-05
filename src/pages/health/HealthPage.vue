<script setup lang="ts">
import { onMounted, ref } from "vue";
import { healthService } from "@/services/healthService";
import { usePolling } from "@/composables/usePolling";
import AppCard from "@/components/ui/AppCard.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import type { Health } from "@/types";

const health = ref<Health | null>(null);
const metricsRaw = ref("");
const loading = ref(true);

async function refresh(): Promise<void> {
  const [h, m] = await Promise.all([
    healthService.check(),
    healthService.metrics(),
  ]);
  health.value = h;
  metricsRaw.value = m;
}

const { start } = usePolling(refresh, 10000);

onMounted(async () => {
  try {
    await refresh();
  } finally {
    loading.value = false;
  }
  start();
});
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Saúde do Sistema</h1>
      <p class="mt-1 text-sm text-gray-500">Monitoramento em tempo real dos serviços</p>
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

    <template v-else-if="health">
      <div class="mb-6 flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <AppBadge :status="health.status" :label="health.status_label" />
        <div class="h-4 w-px bg-gray-200" />
        <span class="text-sm text-gray-500">
          Atualizado: {{ new Date(health.timestamp).toLocaleString("pt-BR") }}
        </span>
        <span class="ml-auto text-xs text-gray-400">Auto-refresh: 10s</span>
      </div>

      <div class="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <AppCard v-for="(info, name) in health.services" :key="name">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm font-semibold text-gray-900 capitalize">{{ name }}</p>
              <AppBadge
                :status="info.status === 'up' ? 'healthy' : 'unhealthy'"
                :label="info.status"
              />
            </div>
            <div v-if="info.latency_ms !== null" class="text-right">
              <p class="text-2xl font-bold text-gray-900">{{ info.latency_ms }}</p>
              <p class="text-xs text-gray-400">ms</p>
            </div>
          </div>
        </AppCard>
      </div>

      <AppCard title="Métricas Prometheus">
        <pre class="max-h-96 overflow-auto rounded-lg bg-primary-950 p-4 text-sm leading-relaxed text-green-400 font-mono">{{ metricsRaw }}</pre>
      </AppCard>
    </template>
  </div>
</template>
