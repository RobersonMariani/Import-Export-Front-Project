<script setup lang="ts">
import type { Pagination } from "@/types";

interface Props {
  pagination: Pagination;
}

const props = defineProps<Props>();
const emit = defineEmits<{ "page-change": [page: number] }>();

function goTo(page: number): void {
  if (page >= 1 && page <= props.pagination.last_page) {
    emit("page-change", page);
  }
}
</script>

<template>
  <div
    v-if="pagination.last_page > 1"
    class="flex items-center justify-between border-t border-gray-200 pt-4"
  >
    <p class="text-sm text-gray-500">
      Página {{ pagination.current_page }} de {{ pagination.last_page }} ({{
        pagination.total
      }}
      resultados)
    </p>
    <div class="flex gap-1">
      <button
        @click="goTo(pagination.current_page - 1)"
        :disabled="pagination.current_page <= 1"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Anterior
      </button>
      <button
        @click="goTo(pagination.current_page + 1)"
        :disabled="pagination.current_page >= pagination.last_page"
        class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  </div>
</template>
