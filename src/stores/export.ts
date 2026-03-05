import { ref } from "vue";
import { defineStore } from "pinia";
import { exportService } from "@/services/exportService";
import { useNotificationStore } from "@/stores/notification";
import type { Export, CreateExportPayload } from "@/types";

export const useExportStore = defineStore("export", () => {
  const exports = ref<Export[]>([]);
  const currentExport = ref<Export | null>(null);
  const loading = ref(false);
  const creating = ref(false);

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
      const url = await exportService.download(id);
      window.open(url, "_blank");
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

  return {
    exports,
    currentExport,
    loading,
    creating,
    createExport,
    fetchExport,
    downloadExport,
    refreshStatus,
  };
});
