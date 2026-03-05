import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/auth/LoginPage.vue"),
      meta: { guest: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/pages/auth/RegisterPage.vue"),
      meta: { guest: true },
    },
    {
      path: "/",
      component: () => import("@/components/layout/AppLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("@/pages/dashboard/DashboardPage.vue"),
        },
        {
          path: "users",
          name: "users",
          component: () => import("@/pages/users/UsersListPage.vue"),
        },
        {
          path: "users/new",
          name: "users-create",
          component: () => import("@/pages/users/CreateUserPage.vue"),
        },
        {
          path: "users/:id/edit",
          name: "users-edit",
          component: () => import("@/pages/users/EditUserPage.vue"),
        },
        {
          path: "imports",
          name: "imports",
          component: () => import("@/pages/imports/ImportsListPage.vue"),
        },
        {
          path: "imports/:id",
          name: "imports-detail",
          component: () => import("@/pages/imports/ImportDetailPage.vue"),
        },
        {
          path: "exports",
          name: "exports",
          component: () => import("@/pages/exports/ExportsListPage.vue"),
        },
        {
          path: "exports/:id",
          name: "exports-detail",
          component: () => import("@/pages/exports/ExportDetailPage.vue"),
        },
        {
          path: "health",
          name: "health",
          component: () => import("@/pages/health/HealthPage.vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) return { name: "login" };
  if (to.meta.guest && token) return { name: "dashboard" };
});

export default router;
