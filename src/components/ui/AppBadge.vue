<script setup lang="ts">
import { STATUS_COLORS } from "@/types";

interface Props {
  status: string;
  label?: string;
}

const props = defineProps<Props>();
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="STATUS_COLORS[props.status] || 'bg-gray-100 text-gray-600'"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
    {{ props.label || props.status }}
  </span>
</template>
