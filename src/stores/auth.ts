import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  function initialize() {
    token.value = localStorage.getItem('token')
  }

  return { token, isAuthenticated, initialize }
})
