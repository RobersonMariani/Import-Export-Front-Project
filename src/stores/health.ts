import { ref } from "vue";
import { defineStore } from "pinia";
import { healthService } from "@/services/healthService";
import type { Health } from "@/types";

export const useHealthStore = defineStore("health", () => {
  const health = ref<Health | null>(null);
  const metricsRaw = ref<string>("");
  const loading = ref(false);

  async function fetchHealth(): Promise<void> {
    loading.value = true;
    try {
      health.value = await healthService.check();
    } finally {
      loading.value = false;
    }
  }

  async function fetchMetrics(): Promise<void> {
    try {
      metricsRaw.value = await healthService.metrics();
    } catch {
      metricsRaw.value = "";
    }
  }

  return { health, metricsRaw, loading, fetchHealth, fetchMetrics };
});
