import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUserStore } from "@/stores/user";

vi.mock("@/services/userService", () => ({
  userService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

import { userService } from "@/services/userService";

const mockUser = {
  id: 1,
  name: "John",
  email: "john@test.com",
  phone: null,
  address: null,
  city: null,
  state: null,
  zip_code: null,
  birth_date: null,
  role: "user",
  role_label: "Usuário",
  created_at: "",
  updated_at: "",
};

describe("useUserStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("fetches users with pagination", async () => {
    vi.mocked(userService.list).mockResolvedValue({
      data: [mockUser],
      links: { first: null, last: null, prev: null, next: null },
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
    });

    const store = useUserStore();
    await store.fetchUsers();

    expect(store.users).toHaveLength(1);
    expect(store.pagination?.total).toBe(1);
  });

  it("creates a user", async () => {
    vi.mocked(userService.create).mockResolvedValue(mockUser);

    const store = useUserStore();
    const result = await store.createUser({
      name: "John",
      email: "john@test.com",
      password: "password123",
    });

    expect(result.id).toBe(1);
    expect(userService.create).toHaveBeenCalled();
  });

  it("deletes a user and refreshes list", async () => {
    vi.mocked(userService.remove).mockResolvedValue();
    vi.mocked(userService.list).mockResolvedValue({
      data: [],
      links: { first: null, last: null, prev: null, next: null },
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
    });

    const store = useUserStore();
    await store.deleteUser(1);

    expect(userService.remove).toHaveBeenCalledWith(1);
    expect(store.users).toHaveLength(0);
  });
});
