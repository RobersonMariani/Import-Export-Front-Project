<script setup lang="ts">
import { computed } from "vue";
import type { Pagination } from "@/types";

interface Props {
  pagination: Pagination;
  perPageOptions?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  perPageOptions: () => [15, 25, 50, 100],
});

const emit = defineEmits<{
  "page-change": [page: number];
  "per-page-change": [perPage: number];
}>();

function goTo(page: number): void {
  if (page >= 1 && page <= props.pagination.last_page) {
    emit("page-change", page);
  }
}

function onPerPageChange(event: Event): void {
  const value = Number((event.target as HTMLSelectElement).value);
  emit("per-page-change", value);
}

const startRecord = computed(
  () => (props.pagination.current_page - 1) * props.pagination.per_page + 1,
);
const endRecord = computed(() =>
  Math.min(
    props.pagination.current_page * props.pagination.per_page,
    props.pagination.total,
  ),
);
</script>

<template>
  <div class="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500 whitespace-nowrap">Exibir</label>
        <select
          :value="pagination.per_page"
          @change="onPerPageChange"
          class="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 focus:outline-none"
        >
          <option
            v-for="opt in perPageOptions"
            :key="opt"
            :value="opt"
          >
            {{ opt }}
          </option>
        </select>
        <span class="text-sm text-gray-500">por página</span>
      </div>

      <p class="text-sm text-gray-500">
        {{ startRecord }}–{{ endRecord }} de {{ pagination.total.toLocaleString("pt-BR") }}
      </p>
    </div>

    <div v-if="pagination.last_page > 1" class="flex items-center gap-1">
      <button
        @click="goTo(1)"
        :disabled="pagination.current_page <= 1"
        class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        title="Primeira página"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        @click="goTo(pagination.current_page - 1)"
        :disabled="pagination.current_page <= 1"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>

      <span class="px-2 text-sm text-gray-500">
        {{ pagination.current_page }} / {{ pagination.last_page }}
      </span>

      <button
        @click="goTo(pagination.current_page + 1)"
        :disabled="pagination.current_page >= pagination.last_page"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Próxima
      </button>
      <button
        @click="goTo(pagination.last_page)"
        :disabled="pagination.current_page >= pagination.last_page"
        class="rounded-lg border border-gray-300 px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        title="Última página"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  </div>
</template>
