import { ref } from "vue";
import { defineStore } from "pinia";
import { exportService } from "@/services/exportService";
import { useNotificationStore } from "@/stores/notification";
import type { Export, CreateExportPayload, Pagination } from "@/types";

export const useExportStore = defineStore("export", () => {
  const exports = ref<Export[]>([]);
  const currentExport = ref<Export | null>(null);
  const pagination = ref<Pagination | null>(null);
  const loading = ref(false);
  const creating = ref(false);

  async function fetchExports(
    params: Record<string, string | number | undefined> = {},
  ): Promise<void> {
    loading.value = true;
    try {
      const response = await exportService.list(params);
      exports.value = response.data;
      pagination.value = response.meta;
    } catch {
      useNotificationStore().error("Erro ao carregar exportações");
    } finally {
      loading.value = false;
    }
  }

  async function refreshExports(
    params: Record<string, string | number | undefined> = {},
  ): Promise<void> {
    try {
      const response = await exportService.list(params);
      exports.value = response.data;
      pagination.value = response.meta;
    } catch {
      // silent refresh
    }
  }

  function hasActiveExports(): boolean {
    return exports.value.some(
      (e) => e.status === "queued" || e.status === "processing",
    );
  }

  async function createExport(
    payload: CreateExportPayload = {},
  ): Promise<Export> {
    creating.value = true;
    try {
      const result = await exportService.create(payload);
      useNotificationStore().success("Exportação iniciada com sucesso");
      return result;
    } finally {
      creating.value = false;
    }
  }

  async function fetchExport(id: string): Promise<void> {
    loading.value = true;
    try {
      currentExport.value = await exportService.get(id);
    } finally {
      loading.value = false;
    }
  }

  async function downloadExport(id: string): Promise<void> {
    try {
      await exportService.download(id);
    } catch {
      useNotificationStore().error("Erro ao baixar exportação");
    }
  }

  async function refreshStatus(id: string): Promise<void> {
    try {
      currentExport.value = await exportService.get(id);
    } catch {
      // polling will stop on error
    }
  }

  async function deleteExport(id: string): Promise<void> {
    try {
      await exportService.delete(id);
      exports.value = exports.value.filter((e) => e.id !== id);
      useNotificationStore().success("Exportação excluída com sucesso");
    } catch {
      useNotificationStore().error("Erro ao excluir exportação");
    }
  }

  async function bulkDeleteExports(ids: string[]): Promise<number> {
    let deleted = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await exportService.delete(id);
        exports.value = exports.value.filter((e) => e.id !== id);
        deleted++;
      } catch {
        errors.push(id);
      }
    }

    if (deleted > 0) {
      useNotificationStore().success(
        `${deleted} exportação(ões) excluída(s) com sucesso`,
      );
    }
    if (errors.length > 0) {
      useNotificationStore().error(
        `Falha ao excluir ${errors.length} exportação(ões)`,
      );
    }

    return deleted;
  }

  async function retryExport(id: string): Promise<Export | null> {
    try {
      const result = await exportService.retry(id);
      const idx = exports.value.findIndex((e) => e.id === id);
      if (idx !== -1) exports.value[idx] = result;
      if (currentExport.value?.id === id) currentExport.value = result;
      useNotificationStore().success("Exportação reenviada para a fila");
      return result;
    } catch {
      useNotificationStore().error(
        "Erro ao reprocessar exportação. Apenas exportações com falha podem ser reprocessadas.",
      );
      return null;
    }
  }

  return {
    exports,
    currentExport,
    pagination,
    loading,
    creating,
    fetchExports,
    refreshExports,
    hasActiveExports,
    createExport,
    fetchExport,
    downloadExport,
    refreshStatus,
    deleteExport,
    bulkDeleteExports,
    retryExport,
  };
});
