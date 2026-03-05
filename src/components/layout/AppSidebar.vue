<script setup lang="ts">
import { useRoute } from "vue-router";
import AppLogo from "@/components/ui/AppLogo.vue";

const route = useRoute();

const navItems = [
  {
    name: "dashboard",
    label: "Dashboard",
    icon: "📊",
    to: { name: "dashboard" },
  },
  { name: "users", label: "Usuários", icon: "👥", to: { name: "users" } },
  {
    name: "imports",
    label: "Importações",
    icon: "📥",
    to: { name: "imports" },
  },
  {
    name: "exports",
    label: "Exportações",
    icon: "📤",
    to: { name: "exports" },
  },
  { name: "health", label: "Saúde", icon: "💚", to: { name: "health" } },
];

function isActive(name: string): boolean {
  return route.name?.toString().startsWith(name) ?? false;
}
</script>

<template>
  <aside class="flex w-64 flex-col border-r border-gray-200 bg-white">
    <div class="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
      <AppLogo class="h-8 w-8" />
      <span class="text-lg font-bold text-gray-900">Import Export</span>
    </div>
    <nav class="flex-1 space-y-1 px-3 py-4">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="
          isActive(item.name)
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        "
      >
        <span class="text-lg">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
