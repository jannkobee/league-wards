import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "",
      name: "dashboard",
      component: () => import("@/views/DashboardView.vue"),
    },
    {
      path: "/codex",
      name: "codex-view",
      component: () => import("@/views/CodexView.vue"),
    },
    {
      path: "/:account/:region",
      name: "account-view",
      component: () => import("@/views/AccountView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
