
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import RegisterPage from "@/views/Auth/RegisterPage.vue";
import LoginPage from "@/views/Auth/LoginPage.vue";
import PlayGame from "@/views/Play/index.vue";
import StartGame from "@/views/StartPageIntro/index.vue";
import { useAuthStore } from "@/store/useAuthStore";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: RegisterPage,
    meta: { guestOnly: true },
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { guestOnly: true },
  },
  {
    path: "/start",
    name: "start",
    component: StartGame,
    meta: { requiresAuth: true },
  },
  {
    path: "/play/:id",
    name: "play",
    component: PlayGame,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});


router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.checked) {
    await authStore.fetchAuthState()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'home', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'start' } 
  }

  return;
})

export default router;



