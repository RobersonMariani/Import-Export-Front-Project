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
    <h1 class="mb-6 text-2xl font-bold text-gray-900">Saúde do Sistema</h1>

    <div v-if="loading" class="py-12 text-center text-gray-500">
      Carregando...
    </div>

    <template v-else-if="health">
      <div class="mb-6 flex items-center gap-4">
        <AppBadge :status="health.status" :label="health.status_label" />
        <span class="text-sm text-gray-500"
          >Atualizado:
          {{ new Date(health.timestamp).toLocaleString("pt-BR") }}</span
        >
      </div>

      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <AppCard v-for="(info, name) in health.services" :key="name">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 capitalize">
                {{ name }}
              </p>
              <AppBadge
                :status="info.status === 'up' ? 'healthy' : 'unhealthy'"
                :label="info.status"
              />
            </div>
            <span
              v-if="info.latency_ms !== null"
              class="text-2xl font-bold text-gray-400"
              >{{ info.latency_ms }}ms</span
            >
          </div>
        </AppCard>
      </div>

      <AppCard title="Métricas (raw Prometheus)">
        <pre
          class="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400"
          >{{ metricsRaw }}</pre
        >
      </AppCard>
    </template>
  </div>
</template>
