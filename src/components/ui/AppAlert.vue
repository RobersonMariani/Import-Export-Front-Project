<script setup lang="ts">
interface Props {
  type?: "success" | "error" | "warning" | "info";
}

const props = withDefaults(defineProps<Props>(), { type: "info" });

const classes: Record<string, string> = {
  success: "bg-success-50 border-success-500 text-success-600",
  error: "bg-danger-50 border-danger-500 text-danger-600",
  warning: "bg-warning-50 border-warning-500 text-warning-600",
  info: "bg-info-50 border-info-500 text-info-600",
};
</script>

<template>
  <div class="rounded-lg border-l-4 p-4" :class="classes[props.type]">
    <p class="text-sm font-medium"><slot /></p>
  </div>
</template>
