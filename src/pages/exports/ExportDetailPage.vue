<script setup lang="ts">
import { onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useExportStore } from "@/stores/export";
import { usePolling } from "@/composables/usePolling";
import AppCard from "@/components/ui/AppCard.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppAlert from "@/components/ui/AppAlert.vue";

const route = useRoute();
const router = useRouter();
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

const canRetry = computed(() => exportStore.currentExport?.status === "failed");

watch(isFinal, (val) => {
  if (val) stop();
});

async function handleRetry(): Promise<void> {
  const result = await exportStore.retryExport(exportId);
  if (result) start();
}

async function handleDelete(): Promise<void> {
  if (!confirm("Tem certeza que deseja excluir esta exportação?")) return;
  await exportStore.deleteExport(exportId);
  router.push({ name: "exports" });
}

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
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Detalhe da Exportação</h1>
      <div class="flex gap-2">
        <AppButton
          v-if="canRetry"
          variant="secondary"
          @click="handleRetry"
        >
          Reprocessar
        </AppButton>
        <AppButton
          variant="ghost"
          class="text-red-600 hover:text-red-800"
          @click="handleDelete"
        >
          Excluir
        </AppButton>
      </div>
    </div>

    <div v-if="exportStore.loading" class="py-12 text-center text-gray-500">
      Carregando...
    </div>

    <template v-else-if="exportStore.currentExport">
      <AppAlert
        v-if="exportStore.currentExport.error_message"
        type="error"
        class="mb-4"
      >
        <strong>Erro:</strong> {{ exportStore.currentExport.error_message }}
      </AppAlert>

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
