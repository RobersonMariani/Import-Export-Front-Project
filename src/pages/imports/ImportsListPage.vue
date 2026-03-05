<script setup lang="ts">
import { onMounted, ref, computed, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useImportStore } from "@/stores/import";
import { useNotificationStore } from "@/stores/notification";
import { IMPORT_STATUS_OPTIONS } from "@/types";
import type { Import } from "@/types";
import AppCard from "@/components/ui/AppCard.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import AppPagination from "@/components/ui/AppPagination.vue";
import AppFileUpload from "@/components/ui/AppFileUpload.vue";
import AppModal from "@/components/ui/AppModal.vue";
import AppProgressBar from "@/components/ui/AppProgressBar.vue";

const router = useRouter();
const importStore = useImportStore();
const notify = useNotificationStore();
const showUploadModal = ref(false);
const selectedFile = ref<File | null>(null);

let pollTimer: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL = 3000;

const hasActive = computed(() => importStore.hasActiveImports());

const activeCount = computed(
  () =>
    importStore.imports.filter(
      (i) => i.status === "queued" || i.status === "processing",
    ).length,
);

function startPolling(): void {
  stopPolling();
  pollTimer = setInterval(async () => {
    try {
      await importStore.refreshImports();
      if (!importStore.hasActiveImports()) stopPolling();
    } catch {
      stopPolling();
    }
  }, POLL_INTERVAL);
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

watch(hasActive, (active) => {
  if (active && !pollTimer) startPolling();
  if (!active) stopPolling();
});

onMounted(async () => {
  await importStore.fetchImports();
  if (hasActive.value) startPolling();
});

onUnmounted(() => stopPolling());

watch(
  () => importStore.filters,
  async () => {
    stopPolling();
    await importStore.fetchImports();
    if (hasActive.value) startPolling();
  },
  { deep: true },
);

function handleStatusFilter(status: string): void {
  importStore.setFilters({ status: status as "" });
}

function onFileSelect(file: File): void {
  selectedFile.value = file;
}

async function handleUpload(): Promise<void> {
  if (!selectedFile.value) return;
  try {
    const result = await importStore.uploadCsv(selectedFile.value);
    showUploadModal.value = false;
    selectedFile.value = null;
    await importStore.fetchImports();
    if (!pollTimer) startPolling();
    router.push({ name: "imports-detail", params: { id: result.id } });
  } catch {
    notify.error("Erro ao fazer upload do CSV");
  }
}

async function handleDelete(id: string): Promise<void> {
  if (!confirm("Tem certeza que deseja excluir esta importação?")) return;
  await importStore.deleteImport(id);
}

async function handleRetry(id: string): Promise<void> {
  const result = await importStore.retryImport(id);
  if (result) {
    if (!pollTimer) startPolling();
    router.push({ name: "imports-detail", params: { id: result.id } });
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString("pt-BR");
}

function getPercentage(imp: Import): number {
  if (imp.total_records <= 0) return 0;
  return Math.round((imp.progress / imp.total_records) * 100);
}

function isActive(imp: Import): boolean {
  return imp.status === "queued" || imp.status === "processing";
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "";
  if (seconds < 60) return `${seconds}s restantes`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s restantes`;
}
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Importações</h1>
        <p class="mt-1 text-sm text-gray-500">
          Importe usuários em massa via arquivo CSV
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div
          v-if="hasActive"
          class="flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500 opacity-75"
            />
            <span
              class="relative inline-flex h-2 w-2 rounded-full bg-primary-600"
            />
          </span>
          {{ activeCount }}
          {{ activeCount === 1 ? "ativo" : "ativos" }}
        </div>
        <AppButton @click="showUploadModal = true">
          <span class="flex items-center gap-2">
            <svg
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Upload CSV
          </span>
        </AppButton>
      </div>
    </div>

    <AppCard :padding="false">
      <div class="border-b border-gray-200 p-4">
        <AppSelect
          :options="IMPORT_STATUS_OPTIONS"
          placeholder="Filtrar por status"
          @update:model-value="handleStatusFilter"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500"
          >
            <tr>
              <th class="px-6 py-3">Arquivo</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3 w-64">Progresso</th>
              <th class="px-6 py-3">Registros</th>
              <th class="px-6 py-3">Criado em</th>
              <th class="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="importStore.loading" class="text-center">
              <td colspan="6" class="px-6 py-12">
                <div class="flex flex-col items-center gap-3 text-gray-500">
                  <svg
                    class="h-8 w-8 animate-spin text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Carregando...
                </div>
              </td>
            </tr>
            <tr
              v-else-if="importStore.imports.length === 0"
              class="text-center"
            >
              <td colspan="6" class="px-6 py-12">
                <div class="flex flex-col items-center gap-2 text-gray-400">
                  <svg
                    class="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0h.008v.008H12.75V18m-5.25 0h.008v.008H7.5V18m10.5-6h.008v.008h-.008V12M7.5 12h.008v.008H7.5V12m0-3h.008v.008H7.5V9m10.5 0h.008v.008h-.008V9"
                    />
                  </svg>
                  <p class="text-sm">Nenhuma importação encontrada</p>
                  <p class="text-xs">
                    Clique em "Upload CSV" para começar
                  </p>
                </div>
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="imp in importStore.imports"
                :key="imp.id"
                class="group transition-colors duration-200"
                :class="{
                  'bg-primary-50/30 hover:bg-primary-50/50': isActive(imp),
                  'hover:bg-gray-50': !isActive(imp),
                }"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span
                      v-if="imp.status === 'processing'"
                      class="relative flex h-2 w-2 shrink-0"
                    >
                      <span
                        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning-500 opacity-75"
                      />
                      <span
                        class="relative inline-flex h-2 w-2 rounded-full bg-warning-500"
                      />
                    </span>
                    <span
                      v-else-if="imp.status === 'queued'"
                      class="flex h-2 w-2 shrink-0 rounded-full bg-info-500 animate-pulse"
                    />
                    <span class="font-medium text-gray-900">
                      {{ imp.original_filename }}
                    </span>
                  </div>
                  <p
                    v-if="imp.error_message"
                    class="mt-1 text-xs text-danger-600 truncate max-w-48"
                    :title="imp.error_message"
                  >
                    {{ imp.error_message }}
                  </p>
                </td>
                <td class="px-6 py-4">
                  <AppBadge :status="imp.status" :label="imp.status_label" />
                </td>
                <td class="px-6 py-4">
                  <div v-if="isActive(imp) || imp.status === 'partial'" class="space-y-1">
                    <AppProgressBar
                      :value="imp.progress"
                      :max="imp.total_records"
                      :show-label="false"
                    />
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-medium text-gray-700">
                        {{ getPercentage(imp) }}%
                      </span>
                      <span class="text-gray-400">
                        {{ imp.progress.toLocaleString() }} /
                        {{ imp.total_records.toLocaleString() }}
                      </span>
                    </div>
                    <p
                      v-if="imp.estimated_remaining_seconds"
                      class="text-xs text-gray-400"
                    >
                      {{ formatDuration(imp.estimated_remaining_seconds) }}
                    </p>
                  </div>
                  <div
                    v-else-if="imp.status === 'completed'"
                    class="flex items-center gap-1.5 text-success-600"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span class="text-sm font-medium">100%</span>
                  </div>
                  <div
                    v-else-if="imp.status === 'failed'"
                    class="flex items-center gap-1.5 text-danger-600"
                  >
                    <svg
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                    <span class="text-sm font-medium">Falhou</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-gray-700">
                    <span class="font-medium">
                      {{ imp.total_records.toLocaleString() }}
                    </span>
                    <div
                      v-if="imp.success_count > 0 || imp.failure_count > 0"
                      class="mt-0.5 flex items-center gap-2 text-xs"
                    >
                      <span
                        v-if="imp.success_count > 0"
                        class="text-success-600"
                      >
                        {{ imp.success_count.toLocaleString() }} ok
                      </span>
                      <span
                        v-if="imp.failure_count > 0"
                        class="text-danger-600"
                      >
                        {{ imp.failure_count.toLocaleString() }} erros
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">
                  {{ formatDate(imp.created_at) }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1">
                    <AppButton
                      size="sm"
                      variant="ghost"
                      @click="
                        router.push({
                          name: 'imports-detail',
                          params: { id: imp.id },
                        })
                      "
                    >
                      Ver
                    </AppButton>
                    <AppButton
                      v-if="
                        imp.status === 'failed' || imp.status === 'partial'
                      "
                      size="sm"
                      variant="ghost"
                      class="text-blue-600 hover:text-blue-800"
                      @click="handleRetry(imp.id)"
                    >
                      Reprocessar
                    </AppButton>
                    <AppButton
                      size="sm"
                      variant="ghost"
                      class="text-red-600 hover:text-red-800"
                      @click="handleDelete(imp.id)"
                    >
                      Excluir
                    </AppButton>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-if="importStore.pagination" class="p-4">
        <AppPagination
          :pagination="importStore.pagination"
          @page-change="(p) => importStore.setFilters({ page: p })"
        />
      </div>
    </AppCard>

    <AppModal
      v-if="showUploadModal"
      title="Upload de CSV"
      @close="showUploadModal = false"
    >
      <AppFileUpload label="Arquivo CSV" @select="onFileSelect" />
      <div class="mt-4 flex justify-end gap-2">
        <AppButton variant="secondary" @click="showUploadModal = false">
          Cancelar
        </AppButton>
        <AppButton
          :disabled="!selectedFile"
          :loading="importStore.uploading"
          @click="handleUpload"
        >
          Importar
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>
