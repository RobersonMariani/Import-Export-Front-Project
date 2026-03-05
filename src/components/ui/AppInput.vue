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
      class="mb-1.5 block text-sm font-semibold text-gray-700"
    >
      {{ props.label }}
    </label>
    <input
      v-model="model"
      :type="props.type"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      class="block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-all duration-150 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
      :class="
        props.error
          ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
          : 'border-gray-300 hover:border-gray-400'
      "
    />
    <p v-if="props.error" class="mt-1.5 text-xs text-danger-600">
      {{ props.error }}
    </p>
  </div>
</template>
