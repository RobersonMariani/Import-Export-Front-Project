<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const navItems = [
  {
    name: "dashboard",
    label: "Dashboard",
    to: { name: "dashboard" },
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    name: "users",
    label: "Usuários",
    to: { name: "users" },
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    name: "imports",
    label: "Importações",
    to: { name: "imports" },
    icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
  },
  {
    name: "exports",
    label: "Exportações",
    to: { name: "exports" },
    icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  },
  {
    name: "health",
    label: "Saúde",
    to: { name: "health" },
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

function isActive(name: string): boolean {
  return route.name?.toString().startsWith(name) ?? false;
}
</script>

<template>
  <aside class="flex w-64 flex-col bg-primary-950">
    <div class="flex h-16 items-center gap-3 px-6">
      <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
        <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </div>
      <span class="text-lg font-bold text-white tracking-tight">Import Export</span>
    </div>

    <nav class="mt-2 flex-1 space-y-1 px-3">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
        :class="
          isActive(item.name)
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
        "
      >
        <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
        </svg>
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="border-t border-white/10 px-4 py-4">
      <p class="text-xs text-gray-500">v1.0.0 — Laravel + Vue</p>
    </div>
  </aside>
</template>
