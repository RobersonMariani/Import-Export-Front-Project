import { ref } from "vue";
import { defineStore } from "pinia";
import { userService } from "@/services/userService";
import { useNotificationStore } from "@/stores/notification";
import type { User, UserFilters, Pagination } from "@/types";
import type { CreateUserInput, UpdateUserInput } from "@/schemas/user";

export const useUserStore = defineStore("user", () => {
  const users = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const pagination = ref<Pagination | null>(null);
  const loading = ref(false);
  const filters = ref<UserFilters>({
    page: 1,
    per_page: 15,
    sort_by: "created_at",
    sort_order: "desc",
  });

  async function fetchUsers(): Promise<void> {
    loading.value = true;
    try {
      const result = await userService.list(filters.value);
      users.value = result.data;
      pagination.value = result.meta;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser(id: number): Promise<void> {
    loading.value = true;
    try {
      currentUser.value = await userService.get(id);
    } finally {
      loading.value = false;
    }
  }

  async function createUser(data: CreateUserInput): Promise<User> {
    loading.value = true;
    try {
      const user = await userService.create(data);
      useNotificationStore().success("Usuário criado com sucesso");
      return user;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(id: number, data: UpdateUserInput): Promise<User> {
    loading.value = true;
    try {
      const user = await userService.update(id, data);
      useNotificationStore().success("Usuário atualizado com sucesso");
      return user;
    } finally {
      loading.value = false;
    }
  }

  async function deleteUser(id: number): Promise<void> {
    loading.value = true;
    try {
      await userService.remove(id);
      useNotificationStore().success("Usuário removido com sucesso");
      await fetchUsers();
    } finally {
      loading.value = false;
    }
  }

  function setFilters(newFilters: Partial<UserFilters>): void {
    filters.value = {
      ...filters.value,
      ...newFilters,
      page: newFilters.page ?? 1,
    };
  }

  return {
    users,
    currentUser,
    pagination,
    loading,
    filters,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    setFilters,
  };
});
