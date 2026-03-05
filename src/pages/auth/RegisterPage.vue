<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useFormValidation } from "@/composables/useFormValidation";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import AppInput from "@/components/ui/AppInput.vue";
import AppButton from "@/components/ui/AppButton.vue";
import axios from "axios";

const authStore = useAuthStore();
const notify = useNotificationStore();
const { errors, validateAll, setApiErrors } = useFormValidation(registerSchema);

const form = ref<RegisterInput>({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

async function handleSubmit(): Promise<void> {
  const result = validateAll(form.value);
  if (!result.success) return;
  try {
    await authStore.register(result.data!);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      setApiErrors(err.response.data.errors);
    } else {
      notify.error("Erro ao criar conta");
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
          Comece a gerenciar<br />seus dados agora
        </h2>
        <p class="text-lg text-primary-100 leading-relaxed max-w-md">
          Crie sua conta e tenha acesso a todas as funcionalidades de
          importação, exportação e monitoramento.
        </p>
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
          <h1 class="text-3xl font-bold text-gray-900">Criar conta</h1>
          <p class="mt-2 text-gray-500">Preencha seus dados para começar</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <AppInput
            v-model="form.name"
            label="Nome"
            placeholder="Seu nome completo"
            :error="errors.name"
          />
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
            placeholder="Mínimo 8 caracteres"
            :error="errors.password"
          />
          <AppInput
            v-model="form.password_confirmation"
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            :error="errors.password_confirmation"
          />
          <AppButton type="submit" class="w-full" size="lg" :loading="authStore.loading">
            Criar conta
          </AppButton>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          Já tem conta?
          <RouterLink
            :to="{ name: 'login' }"
            class="font-semibold text-primary-600 hover:text-primary-700"
          >
            Entrar
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
