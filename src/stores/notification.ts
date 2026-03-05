import { ref } from "vue";
import { defineStore } from "pinia";

export interface Notification {
  id: number;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

let nextId = 0;

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<Notification[]>([]);

  function add(
    type: Notification["type"],
    message: string,
    timeout = 5000,
  ): void {
    const id = nextId++;
    notifications.value.push({ id, type, message });
    setTimeout(() => remove(id), timeout);
  }

  function remove(id: number): void {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  function success(message: string): void {
    add("success", message);
  }

  function error(message: string): void {
    add("error", message);
  }

  function warning(message: string): void {
    add("warning", message);
  }

  function info(message: string): void {
    add("info", message);
  }

  return { notifications, add, remove, success, error, warning, info };
});
