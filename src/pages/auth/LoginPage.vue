<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useFormValidation } from "@/composables/useFormValidation";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import AppInput from "@/components/ui/AppInput.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppLogo from "@/components/ui/AppLogo.vue";
import axios from "axios";

const authStore = useAuthStore();
const notify = useNotificationStore();
const { errors, validateAll, setApiErrors } = useFormValidation(loginSchema);

const form = ref<LoginInput>({ email: "", password: "" });

async function handleSubmit(): Promise<void> {
  const result = validateAll(form.value);
  if (!result.success) return;
  try {
    await authStore.login(result.data!);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      setApiErrors(err.response.data.errors);
    } else if (axios.isAxiosError(err) && err.response?.status === 401) {
      notify.error("Credenciais inválidas");
    } else {
      notify.error("Erro ao fazer login");
    }
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 flex flex-col items-center">
        <AppLogo class="mb-4 h-12 w-12" />
        <h1 class="text-2xl font-bold text-gray-900">Import Export</h1>
        <p class="mt-1 text-sm text-gray-500">Entre com suas credenciais</p>
      </div>
      <form
        @submit.prevent="handleSubmit"
        class="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <AppInput
          v-model="form.email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          :error="errors.email"
        />
        <AppInput
          v-model="form.password"
          label="Senha"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
        />
        <AppButton type="submit" class="w-full" :loading="authStore.loading"
          >Entrar</AppButton
        >
        <p class="text-center text-sm text-gray-500">
          Não tem conta?
          <RouterLink
            :to="{ name: 'register' }"
            class="font-medium text-primary-600 hover:text-primary-700"
            >Criar conta</RouterLink
          >
        </p>
      </form>
    </div>
  </div>
</template>
