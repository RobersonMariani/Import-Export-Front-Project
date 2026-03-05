<script setup lang="ts">
interface Props {
  title?: string;
}

defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/50" @click="emit('close')" />
      <div
        class="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
