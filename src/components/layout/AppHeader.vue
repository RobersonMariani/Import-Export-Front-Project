<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
    <div class="flex items-center gap-3">
      <h2 class="text-sm font-medium text-gray-400">Painel de Controle</h2>
    </div>
    <div class="flex items-center gap-3">
      <div v-if="authStore.user" class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-sm">
          {{ authStore.user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="hidden sm:block">
          <p class="text-sm font-semibold text-gray-800">{{ authStore.user.name }}</p>
          <p class="text-xs text-gray-400">{{ authStore.user.email }}</p>
        </div>
      </div>
      <div class="h-6 w-px bg-gray-200" />
      <button
        @click="authStore.logout()"
        class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sair
      </button>
    </div>
  </header>
</template>
