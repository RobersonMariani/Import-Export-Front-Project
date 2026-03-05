<script setup lang="ts">
interface Props {
  title?: string;
  padding?: boolean;
}

withDefaults(defineProps<Props>(), { padding: true });
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
    <div v-if="title" class="border-b border-gray-100 px-6 py-4">
      <h3 class="text-sm font-semibold text-gray-900">{{ title }}</h3>
    </div>
    <div :class="padding ? 'p-6' : ''">
      <slot />
    </div>
  </div>
</template>
