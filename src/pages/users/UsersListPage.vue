<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "@/stores/notification";
import { ROLE_OPTIONS } from "@/types";
import AppCard from "@/components/ui/AppCard.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import AppPagination from "@/components/ui/AppPagination.vue";
import AppModal from "@/components/ui/AppModal.vue";
import { ref } from "vue";

const router = useRouter();
const userStore = useUserStore();
const notify = useNotificationStore();
const showDeleteModal = ref(false);
const deleteId = ref<number | null>(null);
const search = ref("");

onMounted(() => userStore.fetchUsers());
watch(
  () => userStore.filters,
  () => userStore.fetchUsers(),
  { deep: true },
);

function handleSearch(): void {
  userStore.setFilters({ search: search.value });
}

function handleRoleFilter(role: string): void {
  userStore.setFilters({ role: role as "" });
}

function confirmDelete(id: number): void {
  deleteId.value = id;
  showDeleteModal.value = true;
}

async function handleDelete(): Promise<void> {
  if (!deleteId.value) return;
  try {
    await userStore.deleteUser(deleteId.value);
  } catch {
    notify.error("Erro ao remover usuário");
  }
  showDeleteModal.value = false;
  deleteId.value = null;
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Usuários</h1>
      <AppButton @click="router.push({ name: 'users-create' })"
        >Novo Usuário</AppButton
      >
    </div>

    <AppCard :padding="false">
      <div class="flex flex-wrap gap-3 border-b border-gray-200 p-4">
        <div class="flex-1">
          <AppInput
            v-model="search"
            placeholder="Buscar por nome ou e-mail..."
            @keyup.enter="handleSearch"
          />
        </div>
        <AppSelect
          :options="ROLE_OPTIONS"
          placeholder="Filtrar por role"
          @update:model-value="handleRoleFilter"
        />
        <AppButton variant="secondary" @click="handleSearch">Buscar</AppButton>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500"
          >
            <tr>
              <th class="px-6 py-3">Nome</th>
              <th class="px-6 py-3">E-mail</th>
              <th class="px-6 py-3">Role</th>
              <th class="px-6 py-3">Cidade/UF</th>
              <th class="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="userStore.loading" class="text-center">
              <td colspan="5" class="px-6 py-8 text-gray-500">Carregando...</td>
            </tr>
            <tr v-else-if="userStore.users.length === 0" class="text-center">
              <td colspan="5" class="px-6 py-8 text-gray-500">
                Nenhum usuário encontrado
              </td>
            </tr>
            <tr
              v-for="user in userStore.users"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 font-medium text-gray-900">
                {{ user.name }}
              </td>
              <td class="px-6 py-4 text-gray-500">{{ user.email }}</td>
              <td class="px-6 py-4">
                <AppBadge :status="user.role" :label="user.role_label" />
              </td>
              <td class="px-6 py-4 text-gray-500">
                {{ user.city ? `${user.city}/${user.state}` : "-" }}
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <AppButton
                    size="sm"
                    variant="ghost"
                    @click="
                      router.push({
                        name: 'users-edit',
                        params: { id: user.id },
                      })
                    "
                    >Editar</AppButton
                  >
                  <AppButton
                    size="sm"
                    variant="ghost"
                    @click="confirmDelete(user.id)"
                    class="text-danger-500"
                    >Excluir</AppButton
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="userStore.pagination" class="p-4">
        <AppPagination
          :pagination="userStore.pagination"
          @page-change="(p) => userStore.setFilters({ page: p })"
        />
      </div>
    </AppCard>

    <AppModal
      v-if="showDeleteModal"
      title="Confirmar exclusão"
      @close="showDeleteModal = false"
    >
      <p class="mb-4 text-sm text-gray-600">
        Tem certeza que deseja excluir este usuário?
      </p>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" @click="showDeleteModal = false"
          >Cancelar</AppButton
        >
        <AppButton variant="danger" @click="handleDelete">Excluir</AppButton>
      </div>
    </AppModal>
  </div>
</template>
