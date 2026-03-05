<script setup lang="ts">
import { computed } from "vue";

interface Props {
  value: number;
  max: number;
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showLabel: true });

const percentage = computed(() => {
  if (props.max <= 0) return 0;
  return Math.min(100, Math.round((props.value / props.max) * 100));
});
</script>

<template>
  <div>
    <div class="mb-1.5 flex items-center justify-between" v-if="props.showLabel">
      <span class="text-sm font-semibold text-gray-700">{{ percentage }}%</span>
      <span class="text-xs text-gray-500">
        {{ props.value.toLocaleString() }} / {{ props.max.toLocaleString() }}
      </span>
    </div>
    <div class="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        class="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
        :style="{ width: percentage + '%' }"
      />
    </div>
  </div>
</template>
