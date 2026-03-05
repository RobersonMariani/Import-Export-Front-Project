<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
</script>

<template>
  <header
    class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6"
  >
    <div></div>
    <div class="flex items-center gap-4">
      <div v-if="authStore.user" class="flex items-center gap-3">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700"
        >
          {{ authStore.user.name.charAt(0).toUpperCase() }}
        </div>
        <span class="text-sm font-medium text-gray-700">{{
          authStore.user.name
        }}</span>
      </div>
      <button
        @click="authStore.logout()"
        class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        Sair
      </button>
    </div>
  </header>
</template>
