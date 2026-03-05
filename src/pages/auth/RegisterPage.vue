<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useFormValidation } from "@/composables/useFormValidation";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import AppInput from "@/components/ui/AppInput.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppLogo from "@/components/ui/AppLogo.vue";
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
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 flex flex-col items-center">
        <AppLogo class="mb-4 h-12 w-12" />
        <h1 class="text-2xl font-bold text-gray-900">Criar Conta</h1>
        <p class="mt-1 text-sm text-gray-500">Preencha seus dados</p>
      </div>
      <form
        @submit.prevent="handleSubmit"
        class="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <AppInput
          v-model="form.name"
          label="Nome"
          placeholder="Seu nome"
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
          placeholder="••••••••"
          :error="errors.password_confirmation"
        />
        <AppButton type="submit" class="w-full" :loading="authStore.loading"
          >Criar conta</AppButton
        >
        <p class="text-center text-sm text-gray-500">
          Já tem conta?
          <RouterLink
            :to="{ name: 'login' }"
            class="font-medium text-primary-600 hover:text-primary-700"
            >Entrar</RouterLink
          >
        </p>
      </form>
    </div>
  </div>
</template>
