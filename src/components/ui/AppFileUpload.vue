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
    <label
      v-if="props.label"
      class="mb-1 block text-sm font-medium text-gray-700"
      >{{ props.label }}</label
    >
    <div
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
      class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors"
      :class="
        dragOver
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 bg-white hover:border-primary-400'
      "
    >
      <p class="mb-2 text-3xl">📄</p>
      <p class="text-sm text-gray-600">
        <span v-if="fileName" class="font-semibold text-primary-600">{{
          fileName
        }}</span>
        <span v-else
          >Arraste um arquivo CSV ou
          <label
            class="cursor-pointer font-semibold text-primary-600 hover:text-primary-700"
          >
            clique para selecionar
            <input
              type="file"
              :accept="props.accept"
              class="hidden"
              @change="onInput"
            /> </label
        ></span>
      </p>
      <p class="mt-1 text-xs text-gray-400">Máximo {{ props.maxSizeMb }}MB</p>
    </div>
    <p v-if="props.error" class="mt-1 text-xs text-danger-500">
      {{ props.error }}
    </p>
  </div>
</template>
