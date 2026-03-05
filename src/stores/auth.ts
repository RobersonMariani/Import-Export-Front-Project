import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { authService } from "@/services/authService";
import type { AuthUser } from "@/types";
import type { LoginInput, RegisterInput } from "@/schemas/auth";
import router from "@/router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value);

  function initialize(): void {
    const stored = localStorage.getItem("token");
    if (stored) {
      token.value = stored;
      fetchUser();
    }
  }

  async function login(data: LoginInput): Promise<void> {
    loading.value = true;
    try {
      const result = await authService.login(data);
      token.value = result.access_token;
      localStorage.setItem("token", result.access_token);
      if (result.user) user.value = result.user;
      await fetchUser();
      router.push({ name: "dashboard" });
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterInput): Promise<void> {
    loading.value = true;
    try {
      const result = await authService.register(data);
      token.value = result.access_token;
      localStorage.setItem("token", result.access_token);
      if (result.user) user.value = result.user;
      router.push({ name: "dashboard" });
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await authService.logout();
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
      router.push({ name: "login" });
    }
  }

  async function fetchUser(): Promise<void> {
    try {
      user.value = await authService.me();
    } catch {
      token.value = null;
      user.value = null;
      localStorage.removeItem("token");
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    initialize,
    login,
    register,
    logout,
    fetchUser,
  };
});
