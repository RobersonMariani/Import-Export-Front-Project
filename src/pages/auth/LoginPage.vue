<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useFormValidation } from "@/composables/useFormValidation";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import AppInput from "@/components/ui/AppInput.vue";
import AppButton from "@/components/ui/AppButton.vue";
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
  <div class="flex min-h-screen">
    <div class="hidden w-1/2 lg:flex lg:flex-col lg:justify-between bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-12 text-white">
      <div>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <span class="text-xl font-bold tracking-tight">Import Export</span>
        </div>
      </div>

      <div class="space-y-8">
        <h2 class="text-4xl font-bold leading-tight">
          Gerencie seus dados<br />com eficiência
        </h2>
        <p class="text-lg text-primary-100 leading-relaxed max-w-md">
          Importe e exporte milhões de registros com processamento assíncrono,
          monitoramento em tempo real e total controle.
        </p>
        <div class="grid grid-cols-2 gap-4 max-w-md">
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-4">
            <p class="text-2xl font-bold">CSV</p>
            <p class="text-sm text-primary-200">Import & Export</p>
          </div>
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-4">
            <p class="text-2xl font-bold">Async</p>
            <p class="text-sm text-primary-200">Processamento</p>
          </div>
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-4">
            <p class="text-2xl font-bold">Real-time</p>
            <p class="text-sm text-primary-200">Monitoramento</p>
          </div>
          <div class="rounded-xl bg-white/10 backdrop-blur-sm p-4">
            <p class="text-2xl font-bold">Queue</p>
            <p class="text-sm text-primary-200">Workers</p>
          </div>
        </div>
      </div>

      <p class="text-sm text-primary-300">Laravel 12 + Vue 3 + Redis + PostgreSQL</p>
    </div>

    <div class="flex w-full flex-col items-center justify-center px-6 lg:w-1/2 bg-gray-50">
      <div class="w-full max-w-md">
        <div class="mb-8">
          <div class="mb-6 flex items-center gap-3 lg:hidden">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900">Import Export</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p class="mt-2 text-gray-500">Entre com suas credenciais para acessar o painel</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
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
            placeholder="Digite sua senha"
            :error="errors.password"
          />
          <AppButton type="submit" class="w-full" size="lg" :loading="authStore.loading">
            Entrar
          </AppButton>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          Não tem conta?
          <RouterLink
            :to="{ name: 'register' }"
            class="font-semibold text-primary-600 hover:text-primary-700"
          >
            Criar conta
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
