<script setup lang="ts">
interface Props {
  label?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
});

const model = defineModel<string>({ default: "" });
</script>

<template>
  <div>
    <label
      v-if="props.label"
      class="mb-1 block text-sm font-medium text-gray-700"
    >
      {{ props.label }}
    </label>
    <input
      v-model="model"
      :type="props.type"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      class="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50"
      :class="
        props.error
          ? 'border-danger-500 focus:border-danger-500'
          : 'border-gray-300 focus:border-primary-500'
      "
    />
    <p v-if="props.error" class="mt-1 text-xs text-danger-500">
      {{ props.error }}
    </p>
  </div>
</template>
