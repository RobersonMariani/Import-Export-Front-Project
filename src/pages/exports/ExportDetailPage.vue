<script setup lang="ts">
import { onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useExportStore } from "@/stores/export";
import { usePolling } from "@/composables/usePolling";
import AppCard from "@/components/ui/AppCard.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import AppButton from "@/components/ui/AppButton.vue";

const route = useRoute();
const exportStore = useExportStore();
const exportId = route.params.id as string;

const isFinal = computed(() => {
  const s = exportStore.currentExport?.status;
  return s === "completed" || s === "failed";
});

const { start, stop } = usePolling(
  () => exportStore.refreshStatus(exportId),
  3000,
);

onMounted(async () => {
  await exportStore.fetchExport(exportId);
  if (!isFinal.value) start();
});

watch(isFinal, (val) => {
  if (val) stop();
});

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("pt-BR");
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "-";
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-gray-900">Detalhe da Exportação</h1>

    <div v-if="exportStore.loading" class="py-12 text-center text-gray-500">
      Carregando...
    </div>

    <template v-else-if="exportStore.currentExport">
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AppCard>
          <p class="text-sm text-gray-500">Status</p>
          <AppBadge
            :status="exportStore.currentExport.status"
            :label="exportStore.currentExport.status_label"
          />
        </AppCard>
        <AppCard>
          <p class="text-sm text-gray-500">Total de Registros</p>
          <p class="text-xl font-bold text-gray-900">
            {{ exportStore.currentExport.total_records.toLocaleString() }}
          </p>
        </AppCard>
        <AppCard>
          <p class="text-sm text-gray-500">Comprimido</p>
          <p class="text-xl font-bold text-gray-900">
            {{ exportStore.currentExport.compressed ? "Sim" : "Não" }}
          </p>
        </AppCard>
        <AppCard>
          <p class="text-sm text-gray-500">Tempo</p>
          <p class="text-xl font-bold text-gray-900">
            {{
              formatDuration(exportStore.currentExport.processing_time_seconds)
            }}
          </p>
        </AppCard>
      </div>

      <AppCard title="Informações">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm text-gray-500">ID</p>
            <p class="font-mono text-sm">{{ exportStore.currentExport.id }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Início</p>
            <p>{{ formatDate(exportStore.currentExport.started_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Término</p>
            <p>{{ formatDate(exportStore.currentExport.finished_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Expira em</p>
            <p>{{ formatDate(exportStore.currentExport.expires_at) }}</p>
          </div>
        </div>
      </AppCard>

      <div v-if="exportStore.currentExport.status === 'completed'" class="mt-4">
        <AppButton
          @click="exportStore.downloadExport(exportStore.currentExport!.id)"
          >Download</AppButton
        >
      </div>
    </template>
  </div>
</template>
