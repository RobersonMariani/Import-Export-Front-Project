<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useImportStore } from "@/stores/import";
import { useNotificationStore } from "@/stores/notification";
import { IMPORT_STATUS_OPTIONS } from "@/types";
import AppCard from "@/components/ui/AppCard.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import AppPagination from "@/components/ui/AppPagination.vue";
import AppFileUpload from "@/components/ui/AppFileUpload.vue";
import AppModal from "@/components/ui/AppModal.vue";

const router = useRouter();
const importStore = useImportStore();
const notify = useNotificationStore();
const showUploadModal = ref(false);
const selectedFile = ref<File | null>(null);

onMounted(() => importStore.fetchImports());
watch(
  () => importStore.filters,
  () => importStore.fetchImports(),
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
    router.push({ name: "imports-detail", params: { id: result.id } });
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString("pt-BR");
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Importações</h1>
      <AppButton @click="showUploadModal = true">Upload CSV</AppButton>
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
              <th class="px-6 py-3">Progresso</th>
              <th class="px-6 py-3">Registros</th>
              <th class="px-6 py-3">Criado em</th>
              <th class="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="importStore.loading" class="text-center">
              <td colspan="6" class="px-6 py-8 text-gray-500">Carregando...</td>
            </tr>
            <tr
              v-else-if="importStore.imports.length === 0"
              class="text-center"
            >
              <td colspan="6" class="px-6 py-8 text-gray-500">
                Nenhuma importação encontrada
              </td>
            </tr>
            <tr
              v-for="imp in importStore.imports"
              :key="imp.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 font-medium text-gray-900">
                {{ imp.original_filename }}
              </td>
              <td class="px-6 py-4">
                <AppBadge :status="imp.status" :label="imp.status_label" />
              </td>
              <td class="px-6 py-4 text-gray-500">
                {{
                  imp.total_records > 0
                    ? Math.round((imp.progress / imp.total_records) * 100)
                    : 0
                }}%
              </td>
              <td class="px-6 py-4 text-gray-500">
                {{ imp.total_records.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-gray-500">
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
                    >Ver</AppButton
                  >
                  <AppButton
                    v-if="imp.status === 'failed' || imp.status === 'partial'"
                    size="sm"
                    variant="ghost"
                    class="text-blue-600 hover:text-blue-800"
                    @click="handleRetry(imp.id)"
                    >Reprocessar</AppButton
                  >
                  <AppButton
                    size="sm"
                    variant="ghost"
                    class="text-red-600 hover:text-red-800"
                    @click="handleDelete(imp.id)"
                    >Excluir</AppButton
                  >
                </div>
              </td>
            </tr>
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
        <AppButton variant="secondary" @click="showUploadModal = false"
          >Cancelar</AppButton
        >
        <AppButton
          :disabled="!selectedFile"
          :loading="importStore.uploading"
          @click="handleUpload"
          >Importar</AppButton
        >
      </div>
    </AppModal>
  </div>
</template>
