<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useImportStore } from "@/stores/import";
import { usePolling } from "@/composables/usePolling";
import AppCard from "@/components/ui/AppCard.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import AppProgressBar from "@/components/ui/AppProgressBar.vue";

const route = useRoute();
const importStore = useImportStore();
const importId = route.params.id as string;

const isFinal = computed(() => {
  const s = importStore.currentImport?.status;
  return s === "completed" || s === "failed" || s === "partial";
});

const { start, stop } = usePolling(
  () => importStore.refreshStatus(importId),
  3000,
);

onMounted(async () => {
  await importStore.fetchImport(importId);
  if (!isFinal.value) start();
});

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("pt-BR");
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "-";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// Stop polling when import is final
import { watch } from "vue";
watch(isFinal, (val) => {
  if (val) stop();
});
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-gray-900">Detalhe da Importação</h1>

    <div v-if="importStore.loading" class="py-12 text-center text-gray-500">
      Carregando...
    </div>

    <template v-else-if="importStore.currentImport">
      <div class="mb-6">
        <AppProgressBar
          :value="importStore.currentImport.progress"
          :max="importStore.currentImport.total_records"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AppCard>
          <p class="text-sm text-gray-500">Status</p>
          <AppBadge
            :status="importStore.currentImport.status"
            :label="importStore.currentImport.status_label"
          />
        </AppCard>
        <AppCard>
          <p class="text-sm text-gray-500">Total de Registros</p>
          <p class="text-xl font-bold text-gray-900">
            {{ importStore.currentImport.total_records.toLocaleString() }}
          </p>
        </AppCard>
        <AppCard>
          <p class="text-sm text-gray-500">Sucessos</p>
          <p class="text-xl font-bold text-success-600">
            {{ importStore.currentImport.success_count.toLocaleString() }}
          </p>
        </AppCard>
        <AppCard>
          <p class="text-sm text-gray-500">Falhas</p>
          <p class="text-xl font-bold text-danger-600">
            {{ importStore.currentImport.failure_count.toLocaleString() }}
          </p>
        </AppCard>
      </div>

      <AppCard title="Informações" class="mt-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p class="text-sm text-gray-500">Arquivo</p>
            <p class="font-medium">
              {{ importStore.currentImport.original_filename }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">ID</p>
            <p class="font-mono text-sm">{{ importStore.currentImport.id }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Início</p>
            <p>{{ formatDate(importStore.currentImport.started_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Término</p>
            <p>{{ formatDate(importStore.currentImport.finished_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Tempo de Processamento</p>
            <p>
              {{
                formatDuration(
                  importStore.currentImport.processing_time_seconds,
                )
              }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Tempo Estimado Restante</p>
            <p>
              {{
                formatDuration(
                  importStore.currentImport.estimated_remaining_seconds,
                )
              }}
            </p>
          </div>
        </div>
      </AppCard>
    </template>
  </div>
</template>
