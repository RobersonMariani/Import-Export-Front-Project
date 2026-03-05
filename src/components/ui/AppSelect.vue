<script setup lang="ts">
interface Option {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const model = defineModel<string>({ default: "" });
</script>

<template>
  <div>
    <label
      v-if="props.label"
      class="mb-1.5 block text-sm font-semibold text-gray-700"
    >
      {{ props.label }}
    </label>
    <select
      v-model="model"
      :disabled="props.disabled"
      class="block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50"
      :class="props.error ? 'border-danger-500' : 'border-gray-300 hover:border-gray-400'"
    >
      <option value="">{{ props.placeholder || "Selecione..." }}</option>
      <option v-for="opt in props.options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <p v-if="props.error" class="mt-1.5 text-xs text-danger-600">
      {{ props.error }}
    </p>
  </div>
</template>
