<script setup lang="ts">
import { ref } from "vue";

interface Props {
  accept?: string;
  maxSizeMb?: number;
  label?: string;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  accept: ".csv",
  maxSizeMb: 50,
});

const emit = defineEmits<{ select: [file: File] }>();
const dragOver = ref(false);
const fileName = ref("");

function handleFile(file: File | null | undefined): void {
  if (!file) return;
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    fileName.value = "";
    return;
  }
  fileName.value = file.name;
  emit("select", file);
}

function onDrop(e: DragEvent): void {
  dragOver.value = false;
  handleFile(e.dataTransfer?.files[0]);
}

function onInput(e: Event): void {
  const input = e.target as HTMLInputElement;
  handleFile(input.files?.[0]);
}
</script>

<template>
  <div>
    <label v-if="props.label" class="mb-1.5 block text-sm font-semibold text-gray-700">
      {{ props.label }}
    </label>
    <div
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
      class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200"
      :class="
        dragOver
          ? 'border-primary-500 bg-primary-50 scale-[1.01]'
          : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
      "
    >
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
        <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p class="text-sm text-gray-600">
        <span v-if="fileName" class="font-semibold text-primary-600">{{ fileName }}</span>
        <span v-else>
          Arraste um arquivo CSV ou
          <label class="cursor-pointer font-semibold text-primary-600 hover:text-primary-700">
            clique para selecionar
            <input type="file" :accept="props.accept" class="hidden" @change="onInput" />
          </label>
        </span>
      </p>
      <p class="mt-2 text-xs text-gray-400">Máximo {{ props.maxSizeMb }}MB</p>
    </div>
    <p v-if="props.error" class="mt-1.5 text-xs text-danger-600">{{ props.error }}</p>
  </div>
</template>
