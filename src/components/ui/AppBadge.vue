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
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="STATUS_COLORS[props.status] || 'bg-gray-100 text-gray-600'"
  >
    {{ props.label || props.status }}
  </span>
</template>
