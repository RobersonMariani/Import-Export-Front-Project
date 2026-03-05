<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "@/stores/notification";
import { useFormValidation } from "@/composables/useFormValidation";
import { updateUserSchema, type UpdateUserInput } from "@/schemas/user";
import { ROLE_OPTIONS } from "@/types";
import AppCard from "@/components/ui/AppCard.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppButton from "@/components/ui/AppButton.vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const notify = useNotificationStore();
const { errors, validateAll, setApiErrors } =
  useFormValidation(updateUserSchema);

const form = ref<UpdateUserInput>({});
const userId = Number(route.params.id);

onMounted(async () => {
  await userStore.fetchUser(userId);
  if (userStore.currentUser) {
    form.value = {
      name: userStore.currentUser.name,
      email: userStore.currentUser.email,
      phone: userStore.currentUser.phone ?? "",
      address: userStore.currentUser.address ?? "",
      city: userStore.currentUser.city ?? "",
      state: userStore.currentUser.state ?? "",
      zip_code: userStore.currentUser.zip_code ?? "",
      birth_date: userStore.currentUser.birth_date ?? "",
      role: userStore.currentUser.role as "admin" | "manager" | "user",
    };
  }
});

async function handleSubmit(): Promise<void> {
  const result = validateAll(form.value);
  if (!result.success) return;
  try {
    await userStore.updateUser(userId, result.data!);
    router.push({ name: "users" });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      setApiErrors(err.response.data.errors);
    } else {
      notify.error("Erro ao atualizar usuário");
    }
  }
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-gray-900">Editar Usuário</h1>
    <AppCard>
      <div v-if="userStore.loading" class="py-12 text-center text-gray-500">
        Carregando...
      </div>
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AppInput v-model="form.name!" label="Nome" :error="errors.name" />
          <AppInput
            v-model="form.email!"
            label="E-mail"
            type="email"
            :error="errors.email"
          />
          <AppInput
            v-model="form.password!"
            label="Nova Senha (opcional)"
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
