<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useExportStore } from "@/stores/export";
import { useNotificationStore } from "@/stores/notification";
import { userService } from "@/services/userService";
import { ROLE_OPTIONS } from "@/types";
import type { CreateExportPayload } from "@/types";
import AppCard from "@/components/ui/AppCard.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
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

const previewCount = ref<number | null>(null);
const countLoading = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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

watch(currentFilters, () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  countLoading.value = true;
  debounceTimer = setTimeout(fetchPreviewCount, 400);
}, { deep: true });

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

onMounted(() => {
  exportStore.fetchExports();
});

async function handleDelete(id: string): Promise<void> {
  if (!confirm("Tem certeza que deseja excluir esta exportação?")) return;
  await exportStore.deleteExport(id);
}

async function handleRetry(id: string): Promise<void> {
  const result = await exportStore.retryExport(id);
  if (result) {
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
    router.push({ name: "exports-detail", params: { id: result.id } });
  } catch {
    notify.error("Erro ao criar exportação");
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString("pt-BR");
}
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Exportações</h1>
        <p class="mt-1 text-sm text-gray-500">Exporte dados de usuários para CSV</p>
      </div>
      <AppButton @click="showCreateModal = true">Nova Exportação</AppButton>
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
              <td colspan="6" class="px-6 py-8 text-gray-500">Carregando...</td>
            </tr>
            <tr v-else-if="exportStore.exports.length === 0" class="text-center">
              <td colspan="6" class="px-6 py-8 text-gray-500">
                Nenhuma exportação encontrada
              </td>
            </tr>
            <tr v-for="exp in exportStore.exports" :key="exp.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-mono text-xs text-gray-500">
                {{ exp.id.slice(0, 8) }}...
              </td>
              <td class="px-6 py-4">
                <AppBadge :status="exp.status" :label="exp.status_label" />
              </td>
              <td class="px-6 py-4 text-gray-500">
                {{ exp.total_records.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-gray-500">
                {{ exp.compressed ? "Sim" : "Não" }}
              </td>
              <td class="px-6 py-4 text-gray-500">
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
                    >Ver</AppButton
                  >
                  <AppButton
                    v-if="exp.status === 'failed'"
                    size="sm"
                    variant="ghost"
                    class="text-blue-600 hover:text-blue-800"
                    @click="handleRetry(exp.id)"
                    >Reprocessar</AppButton
                  >
                  <AppButton
                    size="sm"
                    variant="ghost"
                    class="text-red-600 hover:text-red-800"
                    @click="handleDelete(exp.id)"
                    >Excluir</AppButton
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <AppModal
      v-if="showCreateModal"
      title="Nova Exportação"
      @close="showCreateModal = false"
    >
      <div class="space-y-4">
        <p class="text-sm text-gray-500">
          Aplique filtros para selecionar quais usuários deseja exportar,
          ou exporte todos sem filtros.
        </p>

        <AppInput
          v-model="filterSearch"
          label="Busca (nome/email)"
          placeholder="Filtrar por nome ou e-mail..."
        />
        <AppSelect v-model="filterRole" label="Role" :options="ROLE_OPTIONS" />
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
            'border-indigo-200 bg-indigo-50': previewCount !== null && previewCount > 0,
            'border-amber-200 bg-amber-50': previewCount === 0,
            'border-gray-200 bg-gray-50': previewCount === null || countLoading,
          }"
        >
          <template v-if="countLoading">
            <p class="text-sm text-gray-500">Contando registros...</p>
          </template>
          <template v-else-if="previewCount !== null">
            <p class="text-2xl font-bold" :class="previewCount > 0 ? 'text-indigo-600' : 'text-amber-600'">
              {{ previewCount.toLocaleString('pt-BR') }}
            </p>
            <p class="text-sm" :class="previewCount > 0 ? 'text-indigo-500' : 'text-amber-500'">
              {{ previewCount === 1 ? 'usuário encontrado' : 'usuários encontrados' }}
              <span v-if="hasFilters">com os filtros aplicados</span>
              <span v-else>(total no sistema)</span>
            </p>
          </template>
          <template v-else>
            <p class="text-sm text-gray-400">Não foi possível obter a contagem</p>
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
          Exportar {{ previewCount !== null && previewCount > 0 ? `${previewCount.toLocaleString('pt-BR')} registros` : '' }}
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>
