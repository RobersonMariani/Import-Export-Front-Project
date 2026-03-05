<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "@/stores/notification";
import { useFormValidation } from "@/composables/useFormValidation";
import { createUserSchema, type CreateUserInput } from "@/schemas/user";
import { ROLE_OPTIONS } from "@/types";
import AppCard from "@/components/ui/AppCard.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppButton from "@/components/ui/AppButton.vue";
import axios from "axios";

const router = useRouter();
const userStore = useUserStore();
const notify = useNotificationStore();
const { errors, validateAll, setApiErrors } =
  useFormValidation(createUserSchema);

const form = ref<CreateUserInput>({
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  birth_date: "",
  role: "user",
});

async function handleSubmit(): Promise<void> {
  const result = validateAll(form.value);
  if (!result.success) return;
  try {
    await userStore.createUser(result.data!);
    router.push({ name: "users" });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      setApiErrors(err.response.data.errors);
    } else {
      notify.error("Erro ao criar usuário");
    }
  }
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-gray-900">Novo Usuário</h1>
    <AppCard>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AppInput v-model="form.name" label="Nome" :error="errors.name" />
          <AppInput
            v-model="form.email"
            label="E-mail"
            type="email"
            :error="errors.email"
          />
          <AppInput
            v-model="form.password"
            label="Senha"
            type="password"
            :error="errors.password"
          />
          <AppSelect
            v-model="form.role!"
            label="Role"
            :options="ROLE_OPTIONS"
            :error="errors.role"
          />
          <AppInput
            v-model="form.phone!"
            label="Telefone"
            :error="errors.phone"
          />
          <AppInput
            v-model="form.birth_date!"
            label="Data de Nascimento"
            type="date"
            :error="errors.birth_date"
          />
          <AppInput
            v-model="form.address!"
            label="Endereço"
            :error="errors.address"
          />
          <AppInput v-model="form.city!" label="Cidade" :error="errors.city" />
          <AppInput v-model="form.state!" label="UF" :error="errors.state" />
          <AppInput
            v-model="form.zip_code!"
            label="CEP"
            :error="errors.zip_code"
          />
        </div>
        <div class="flex justify-end gap-2 pt-4">
          <AppButton variant="secondary" @click="router.push({ name: 'users' })"
            >Cancelar</AppButton
          >
          <AppButton type="submit" :loading="userStore.loading"
            >Salvar</AppButton
          >
        </div>
      </form>
    </AppCard>
  </div>
</template>
