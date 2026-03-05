<script setup lang="ts">
import { useNotificationStore } from "@/stores/notification";

const notificationStore = useNotificationStore();

const typeClasses: Record<string, string> = {
  success: "bg-success-50 border-success-500 text-success-600",
  error: "bg-danger-50 border-danger-500 text-danger-600",
  warning: "bg-warning-50 border-warning-500 text-warning-600",
  info: "bg-info-50 border-info-500 text-info-600",
};
</script>

<template>
  <div
    class="pointer-events-none fixed right-0 top-0 z-50 flex flex-col items-end gap-2 p-4"
  >
    <TransitionGroup name="notification">
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        class="pointer-events-auto w-80 rounded-lg border-l-4 p-4 shadow-lg"
        :class="typeClasses[notification.type]"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm font-medium">{{ notification.message }}</p>
          <button
            @click="notificationStore.remove(notification.id)"
            class="shrink-0 text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
