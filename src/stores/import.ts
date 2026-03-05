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
    setFilters,
  };
});
