<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useExportStore } from "@/stores/export";
import { useNotificationStore } from "@/stores/notification";
import { ROLE_OPTIONS } from "@/types";
import type { Export, CreateExportPayload } from "@/types";
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
const exports = ref<Export[]>([]);
const loading = ref(true);

const filterSearch = ref("");
const filterRole = ref("");
const filterState = ref("");
const filterCity = ref("");
const compressed = ref(false);

onMounted(async () => {
  try {
    const res = await (await import("@/lib/api")).default.get("/exports");
    exports.value = res.data.data ?? res.data;
  } catch {
    // no exports yet
  } finally {
    loading.value = false;
  }
});

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
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Exportações</h1>
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
            <tr v-if="loading" class="text-center">
              <td colspan="6" class="px-6 py-8 text-gray-500">Carregando...</td>
            </tr>
            <tr v-else-if="exports.length === 0" class="text-center">
              <td colspan="6" class="px-6 py-8 text-gray-500">
                Nenhuma exportação encontrada
              </td>
            </tr>
            <tr v-for="exp in exports" :key="exp.id" class="hover:bg-gray-50">
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
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <AppButton variant="secondary" @click="showCreateModal = false"
          >Cancelar</AppButton
        >
        <AppButton :loading="exportStore.creating" @click="handleCreate"
          >Exportar</AppButton
        >
      </div>
    </AppModal>
  </div>
</template>
