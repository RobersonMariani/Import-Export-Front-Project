import { ref } from "vue";
import { defineStore } from "pinia";
import { importService } from "@/services/importService";
import { useNotificationStore } from "@/stores/notification";
import type { Import, ImportFilters, Pagination } from "@/types";

export const useImportStore = defineStore("import", () => {
  const imports = ref<Import[]>([]);
  const currentImport = ref<Import | null>(null);
  const pagination = ref<Pagination | null>(null);
  const loading = ref(false);
  const uploading = ref(false);
  const filters = ref<ImportFilters>({ page: 1, per_page: 15 });

  async function fetchImports(): Promise<void> {
    loading.value = true;
    try {
      const result = await importService.list(filters.value);
      imports.value = result.data;
      pagination.value = result.meta;
    } finally {
      loading.value = false;
    }
  }

  async function fetchImport(id: string): Promise<void> {
    loading.value = true;
    try {
      currentImport.value = await importService.get(id);
    } finally {
      loading.value = false;
    }
  }

  async function uploadCsv(file: File): Promise<Import> {
    uploading.value = true;
    try {
      const result = await importService.create(file);
      useNotificationStore().success("Importação iniciada com sucesso");
      return result;
    } finally {
      uploading.value = false;
    }
  }

  async function refreshStatus(id: string): Promise<void> {
    try {
      currentImport.value = await importService.get(id);
    } catch {
      // polling will stop on error
    }
  }

  async function deleteImport(id: string): Promise<void> {
    try {
      await importService.delete(id);
      imports.value = imports.value.filter((i) => i.id !== id);
      useNotificationStore().success("Importação excluída com sucesso");
    } catch {
      useNotificationStore().error("Erro ao excluir importação");
    }
  }

  async function retryImport(id: string): Promise<Import | null> {
    try {
      const result = await importService.retry(id);
      const idx = imports.value.findIndex((i) => i.id === id);
      if (idx !== -1) imports.value[idx] = result;
      if (currentImport.value?.id === id) currentImport.value = result;
      useNotificationStore().success("Importação reenviada para a fila");
      return result;
    } catch {
      useNotificationStore().error(
        "Erro ao reprocessar importação. Apenas importações com falha podem ser reprocessadas.",
      );
      return null;
    }
  }

  function setFilters(newFilters: Partial<ImportFilters>): void {
    filters.value = {
      ...filters.value,
      ...newFilters,
      page: newFilters.page ?? 1,
    };
  }

  return {
    imports,
    currentImport,
    pagination,
    loading,
    uploading,
    filters,
    fetchImports,
    fetchImport,
    uploadCsv,
    refreshStatus,
    deleteImport,
    retryImport,
    setFilters,
  };
});
