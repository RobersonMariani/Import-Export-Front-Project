<script setup lang="ts">
import { onMounted, ref, watch, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useExportStore } from "@/stores/export";
import { useNotificationStore } from "@/stores/notification";
import { userService } from "@/services/userService";
import { ROLE_OPTIONS } from "@/types";
import type { Export, CreateExportPayload } from "@/types";
import AppCard from "@/components/ui/AppCard.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import AppPagination from "@/components/ui/AppPagination.vue";
import AppModal from "@/components/ui/AppModal.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppSelect from "@/components/ui/AppSelect.vue";

const router = useRouter();
const exportStore = useExportStore();
const notify = useNotificationStore();
const showCreateModal = ref(false);

const filterSearch = ref("");
const filterRole = ref("");
const filterState = ref("");
const filterCity = ref("");
const compressed = ref(false);

const exportPage = ref(1);
const exportPerPage = ref(15);

const previewCount = ref<number | null>(null);
const countLoading = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

let fastTimer: ReturnType<typeof setInterval> | null = null;
let bgTimer: ReturnType<typeof setInterval> | null = null;
const FAST_INTERVAL = 3000;
const BG_INTERVAL = 10000;

function exportParams(): Record<string, string | number> {
  return { page: exportPage.value, per_page: exportPerPage.value };
}

const hasActive = computed(() => exportStore.hasActiveExports());
const activeCount = computed(
  () =>
    exportStore.exports.filter(
      (e) => e.status === "queued" || e.status === "processing",
    ).length,
);

function startFastPolling(): void {
  stopFastPolling();
  fastTimer = setInterval(async () => {
    try {
      await exportStore.refreshExports(exportParams());
      if (!exportStore.hasActiveExports()) {
        stopFastPolling();
      }
    } catch {
      stopFastPolling();
    }
  }, FAST_INTERVAL);
}

function stopFastPolling(): void {
  if (fastTimer) {
    clearInterval(fastTimer);
    fastTimer = null;
  }
}

function startBgPolling(): void {
  if (bgTimer) return;
  bgTimer = setInterval(async () => {
    try {
      await exportStore.refreshExports(exportParams());
      if (exportStore.hasActiveExports() && !fastTimer) {
        startFastPolling();
      }
    } catch {
      // keep bg polling alive
    }
  }, BG_INTERVAL);
}

function stopAllPolling(): void {
  stopFastPolling();
  if (bgTimer) {
    clearInterval(bgTimer);
    bgTimer = null;
  }
}

watch(hasActive, (active) => {
  if (active && !fastTimer) startFastPolling();
  if (!active) stopFastPolling();
});

onUnmounted(() => stopAllPolling());

const currentFilters = computed(() => ({
  search: filterSearch.value,
  role: filterRole.value,
  state: filterState.value,
  city: filterCity.value,
}));

const hasFilters = computed(() =>
  Object.values(currentFilters.value).some((v) => v !== ""),
);

async function fetchPreviewCount(): Promise<void> {
  countLoading.value = true;
  try {
    previewCount.value = await userService.count(currentFilters.value);
  } catch {
    previewCount.value = null;
  } finally {
    countLoading.value = false;
  }
}

watch(
  currentFilters,
  () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    countLoading.value = true;
    debounceTimer = setTimeout(fetchPreviewCount, 400);
  },
  { deep: true },
);

watch(showCreateModal, (open) => {
  if (open) {
    filterSearch.value = "";
    filterRole.value = "";
    filterState.value = "";
    filterCity.value = "";
    compressed.value = false;
    fetchPreviewCount();
  }
});

onMounted(async () => {
  await exportStore.fetchExports(exportParams());
  startBgPolling();
  if (hasActive.value) startFastPolling();
});

function handlePageChange(page: number): void {
  exportPage.value = page;
  exportStore.fetchExports(exportParams());
}

function handlePerPageChange(perPage: number): void {
  exportPerPage.value = perPage;
  exportPage.value = 1;
  exportStore.fetchExports(exportParams());
}

async function handleDelete(id: string): Promise<void> {
  if (!confirm("Tem certeza que deseja excluir esta exportação?")) return;
  await exportStore.deleteExport(id);
}

async function handleRetry(id: string): Promise<void> {
  const result = await exportStore.retryExport(id);
  if (result) {
    if (!fastTimer) startFastPolling();
    router.push({ name: "exports-detail", params: { id: result.id } });
  }
}

async function handleCreate(): Promise<void> {
  const payload: CreateExportPayload = { compressed: compressed.value };
  const filters: Record<string, string> = {};
  if (filterSearch.value) filters.search = filterSearch.value;
  if (filterRole.value) filters.role = filterRole.value;
  if (filterState.value) filters.state = filterState.value;
  if (filterCity.value) filters.city = filterCity.value;
  if (Object.keys(filters).length > 0) payload.filters = filters;
  try {
    const result = await exportStore.createExport(payload);
    showCreateModal.value = false;
    await exportStore.fetchExports(exportParams());
    if (!fastTimer) startFastPolling();
    router.push({ name: "exports-detail", params: { id: result.id } });
  } catch {
    notify.error("Erro ao criar exportação");
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString("pt-BR");
}

function isActive(exp: Export): boolean {
  return exp.status === "queued" || exp.status === "processing";
}
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Exportações</h1>
        <p class="mt-1 text-sm text-gray-500">
          Exporte dados de usuários para CSV
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
        <AppButton @click="showCreateModal = true">
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
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Nova Exportação
          </span>
        </AppButton>
      </div>
    </div>

    <AppCard :padding="false">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500"
          >
            <tr>
              <th class="px-6 py-3">ID</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3">Registros</th>
              <th class="px-6 py-3">Comprimido</th>
              <th class="px-6 py-3">Criado em</th>
              <th class="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="exportStore.loading" class="text-center">
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
              v-else-if="exportStore.exports.length === 0"
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
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  <p class="text-sm">Nenhuma exportação encontrada</p>
                  <p class="text-xs">
                    Clique em "Nova Exportação" para começar
                  </p>
                </div>
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="exp in exportStore.exports"
                :key="exp.id"
                class="group transition-colors duration-200"
                :class="{
                  'bg-primary-50/30 hover:bg-primary-50/50': isActive(exp),
                  'hover:bg-gray-50': !isActive(exp),
                }"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span
                      v-if="exp.status === 'processing'"
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
                      v-else-if="exp.status === 'queued'"
                      class="flex h-2 w-2 shrink-0 rounded-full bg-info-500 animate-pulse"
                    />
                    <span class="font-mono text-xs text-gray-500">
                      {{ exp.id.slice(0, 8) }}...
                    </span>
                  </div>
                  <p
                    v-if="exp.error_message"
                    class="mt-1 text-xs text-danger-600 truncate max-w-48"
                    :title="exp.error_message"
                  >
                    {{ exp.error_message }}
                  </p>
                </td>
                <td class="px-6 py-4">
                  <AppBadge :status="exp.status" :label="exp.status_label" />
                </td>
                <td class="px-6 py-4">
                  <div v-if="isActive(exp)" class="flex items-center gap-2">
                    <svg
                      class="h-4 w-4 animate-spin text-primary-500"
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
                    <span class="text-sm text-gray-500">
                      {{ exp.total_records > 0 ? exp.total_records.toLocaleString() : "Processando..." }}
                    </span>
                  </div>
                  <span v-else class="text-gray-700">
                    {{ exp.total_records.toLocaleString() }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-500">
                  {{ exp.compressed ? "Sim" : "Não" }}
                </td>
                <td class="px-6 py-4 text-gray-500 text-xs">
                  {{ formatDate(exp.created_at) }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-1">
                    <AppButton
                      size="sm"
                      variant="ghost"
                      @click="
                        router.push({
                          name: 'exports-detail',
                          params: { id: exp.id },
                        })
                      "
                    >
                      Ver
                    </AppButton>
                    <AppButton
                      v-if="exp.status === 'completed'"
                      size="sm"
                      variant="ghost"
                      class="text-primary-600 hover:text-primary-800"
                      @click="exportStore.downloadExport(exp.id)"
                    >
                      Baixar
                    </AppButton>
                    <AppButton
                      v-if="exp.status === 'failed'"
                      size="sm"
                      variant="ghost"
                      class="text-blue-600 hover:text-blue-800"
                      @click="handleRetry(exp.id)"
                    >
                      Reprocessar
                    </AppButton>
                    <AppButton
                      size="sm"
                      variant="ghost"
                      class="text-red-600 hover:text-red-800"
                      @click="handleDelete(exp.id)"
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

      <div v-if="exportStore.pagination" class="p-4">
        <AppPagination
          :pagination="exportStore.pagination"
          @page-change="(p) => handlePageChange(p)"
          @per-page-change="(pp) => handlePerPageChange(pp)"
        />
      </div>
    </AppCard>

    <AppModal
      v-if="showCreateModal"
      title="Nova Exportação"
      @close="showCreateModal = false"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Aplique filtros para selecionar quais usuários deseja exportar, ou
          exporte todos sem filtros.
        </p>

        <AppInput
          v-model="filterSearch"
          label="Busca (nome/email)"
          placeholder="Filtrar por nome ou e-mail..."
        />
        <AppSelect
          v-model="filterRole"
          label="Role"
          :options="ROLE_OPTIONS"
        />
        <div class="grid grid-cols-2 gap-4">
          <AppInput v-model="filterState" label="UF" placeholder="SP" />
          <AppInput
            v-model="filterCity"
            label="Cidade"
            placeholder="São Paulo"
          />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            v-model="compressed"
            class="rounded border-gray-300"
          />
          Comprimir arquivo (gzip)
        </label>

        <div
          class="rounded-lg border p-4 text-center"
          :class="{
            'border-primary-200 bg-primary-50':
              previewCount !== null && previewCount > 0,
            'border-amber-200 bg-amber-50': previewCount === 0,
            'border-gray-200 bg-gray-50':
              previewCount === null || countLoading,
          }"
        >
          <template v-if="countLoading">
            <p class="text-sm text-gray-500">Contando registros...</p>
          </template>
          <template v-else-if="previewCount !== null">
            <p
              class="text-2xl font-bold"
              :class="
                previewCount > 0 ? 'text-primary-600' : 'text-amber-600'
              "
            >
              {{ previewCount.toLocaleString("pt-BR") }}
            </p>
            <p
              class="text-sm"
              :class="
                previewCount > 0 ? 'text-primary-500' : 'text-amber-500'
              "
            >
              {{
                previewCount === 1
                  ? "usuário encontrado"
                  : "usuários encontrados"
              }}
              <span v-if="hasFilters">com os filtros aplicados</span>
              <span v-else>(total no sistema)</span>
            </p>
          </template>
          <template v-else>
            <p class="text-sm text-gray-400">
              Não foi possível obter a contagem
            </p>
          </template>
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <AppButton variant="secondary" @click="showCreateModal = false">
          Cancelar
        </AppButton>
        <AppButton
          :loading="exportStore.creating"
          :disabled="previewCount === 0"
          @click="handleCreate"
        >
          Exportar
          {{
            previewCount !== null && previewCount > 0
              ? `${previewCount.toLocaleString("pt-BR")} registros`
              : ""
          }}
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>
